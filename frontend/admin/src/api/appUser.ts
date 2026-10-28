import { http } from './request'
import type { AppUser, AppUserPayload, AppUserQuery, PageResult } from '@/types'

export function getAppUsers(params: AppUserQuery = {}) {
  return http.get<PageResult<AppUser>>('/app-users', params)
}

export function getAppUser(id: number) {
  return http.get<AppUser>(`/app-users/${id}`)
}

export function createAppUser(payload: AppUserPayload & { password: string }) {
  return http.post<AppUser>('/app-users', payload)
}

export function updateAppUser(id: number, payload: Partial<AppUserPayload>) {
  return http.put<AppUser>(`/app-users/${id}`, payload)
}

export function deleteAppUser(id: number) {
  return http.delete<null>(`/app-users/${id}`)
}
