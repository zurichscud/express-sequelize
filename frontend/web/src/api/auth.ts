import { http } from './request'
import type { AuthResult, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

export function login(payload: LoginPayload) {
  return http.post<AuthResult>('/auth/login', payload)
}

export function register(payload: RegisterPayload) {
  return http.post<AuthResult>('/auth/register', payload)
}

export function getMe() {
  return http.get<AuthUser>('/auth/me')
}

export function updateProfile(data: { nickname?: string; sex?: AuthUser['sex'] }) {
  return http.put<AuthUser>('/auth/me', data)
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return http.put<null>('/auth/password', data)
}

export function logout() {
  return http.post<null>('/auth/logout')
}
