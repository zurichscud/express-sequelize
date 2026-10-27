import axios from 'axios'
import { clearAuth, getToken } from '@/utils/authStorage'

/** 后端统一响应结构 */
export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiEnvelope<unknown> | null
    if (payload && typeof payload === 'object' && 'code' in payload && payload.code !== 0) {
      return Promise.reject(new Error(payload.message || '请求失败'))
    }
    return response
  },
  (error) => {
    // 登录态失效时清空本地凭证，AuthProvider 会监听该事件同步界面状态
    if (error.response?.status === 401 && getToken()) {
      clearAuth()
      window.dispatchEvent(new Event('web:unauthorized'))
    }
    return Promise.reject(error)
  },
)

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await promise
  return response.data.data
}

/** 统一请求方法：直接返回业务 data */
export const http = {
  get<T>(url: string, params?: object) {
    return unwrap<T>(request.get<ApiEnvelope<T>>(url, { params }))
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

/** 把任意异常转成适合直接展示的中文文案 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message
    if (message) return message
    if (error.code === 'ECONNABORTED') return '请求超时，请稍后重试'
    if (error.message === 'Network Error') return '无法连接服务器，请确认后端服务已启动'
    return error.message
  }
  if (error instanceof Error) return error.message
  return '请求失败，请稍后重试'
}
