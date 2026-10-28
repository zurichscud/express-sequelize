import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { logout } from '@/utils/auth'
import { showError } from '@/utils/feedback'

/** 后端统一响应结构 */
export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/admin',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  // 登录接口签发真实 JWT，后续请求统一携带
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiEnvelope<unknown> | null
    if (payload && typeof payload === 'object' && 'code' in payload && payload.code !== 0) {
      const message = payload.message || '请求失败'
      showError(message)
      return Promise.reject(new Error(message))
    }
    return response
  },
  (error: AxiosError<{ message?: string }>) => {
    const isLoginRequest = error.config?.url?.includes('/users/login')

    // 登录失败也是 401，此时只提示后端错误，不清除会话/跳转
    if (error.response?.status === 401 && !isLoginRequest) {
      logout()
      showError('登录状态已失效，请重新登录')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
      return Promise.reject(error)
    }

    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? '请求超时，请稍后重试'
        : error.message === 'Network Error'
          ? '无法连接服务器，请确认后端服务已启动'
          : error.message) ||
      '请求失败'

    showError(message)
    return Promise.reject(error)
  },
)

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await promise
  return response.data.data
}

/**
 * 统一请求方法：直接返回业务 data，失败时由拦截器统一提示
 */
export const http = {
  get<T>(url: string, params?: object, config?: AxiosRequestConfig) {
    return unwrap<T>(request.get<ApiEnvelope<T>>(url, { params, ...config }))
  },
  post<T>(url: string, data?: unknown) {
    return unwrap<T>(request.post<ApiEnvelope<T>>(url, data))
  },
  put<T>(url: string, data?: unknown) {
    return unwrap<T>(request.put<ApiEnvelope<T>>(url, data))
  },
  delete<T>(url: string) {
    return unwrap<T>(request.delete<ApiEnvelope<T>>(url))
  },
}

export default request
