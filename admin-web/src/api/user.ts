import { http } from './request'
import type { PageResult, User, UserPayload, UserQuery } from '@/types'

export function getUsers(params: UserQuery = {}) {
  return http.get<PageResult<User>>('/users', params)
}

export function getUser(id: number) {
  return http.get<User>(`/users/${id}`)
}

export function createUser(payload: UserPayload & { password: string }) {
  return http.post<User>('/users', payload)
}

export function updateUser(id: number, payload: Partial<UserPayload>) {
  return http.put<User>(`/users/${id}`, payload)
}

export function deleteUser(id: number) {
  return http.delete<null>(`/users/${id}`)
}
