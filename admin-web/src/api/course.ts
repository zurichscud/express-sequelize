import { http } from './request'
import type { Course, CoursePayload, CourseQuery, PageResult } from '@/types'

export function getCourses(params: CourseQuery = {}) {
  return http.get<PageResult<Course>>('/courses', params)
}

export function getCourse(id: number) {
  return http.get<Course>(`/courses/${id}`)
}

export function createCourse(payload: CoursePayload) {
  return http.post<Course>('/courses', payload)
}

export function updateCourse(id: number, payload: Partial<CoursePayload>) {
  return http.put<Course>(`/courses/${id}`, payload)
}

export function deleteCourse(id: number) {
  return http.delete<null>(`/courses/${id}`)
}
