import { http } from './request'
import type { AuthUser } from '@/utils/auth'

export interface LoginPayload {
  account: string
  password: string
}

export interface LoginResult {
  token: string
  tokenType: string
  expiresIn: number
  expiresAt: string
  user: AuthUser
}

/** 后台登录，成功后由调用方保存 token 与用户信息 */
export function login(payload: LoginPayload) {
  return http.post<LoginResult>('/users/login', payload)
}
