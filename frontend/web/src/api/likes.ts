import { http } from './request'
import type { Course, ListResult } from '@/types'
import type { LikeStatus } from '@/types/auth'

export interface LikedCourse extends Course {
  likedAt: string
}

export function getLikeStatus(courseId: number | string) {
  return http.get<LikeStatus>(`/likes/${courseId}`)
}

export function likeCourse(courseId: number | string) {
  return http.post<LikeStatus>('/likes', { course_id: courseId })
}

export function unlikeCourse(courseId: number | string) {
  return http.delete<LikeStatus>(`/likes/${courseId}`)
}

export function getLikedCourses(params: { page?: number; pageSize?: number } = {}) {
  return http.get<ListResult<LikedCourse>>('/likes', params)
}
