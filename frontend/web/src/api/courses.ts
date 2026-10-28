import { http } from './request'
import type { Category, Course, ListResult } from '@/types'

export interface CourseQuery {
  page?: number
  pageSize?: number
  category_id?: number
  is_recommended?: boolean | string
  keyword?: string
}

export function getCourses(params: CourseQuery = {}) {
  return http.get<ListResult<Course>>('/courses', params)
}

export function getCourse(id: number | string) {
  return http.get<Course>(`/courses/${id}`)
}

export function getCategories() {
  return http.get<Category[]>('/categories')
}
