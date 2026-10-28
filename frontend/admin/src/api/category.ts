import { http } from './request'
import type { Category, CategoryPayload } from '@/types'

export async function getCategories() {
  const result = await http.get<{ list: Category[] }>('/categories')
  return result.list
}

export function createCategory(payload: CategoryPayload) {
  return http.post<Category>('/categories', payload)
}

export function updateCategory(id: number, payload: Partial<CategoryPayload>) {
  return http.put<Category>(`/categories/${id}`, payload)
}

export function deleteCategory(id: number) {
  return http.delete<null>(`/categories/${id}`)
}
