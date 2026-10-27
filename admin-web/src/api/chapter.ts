import { http } from './request'
import type { Chapter, ChapterPayload, ChapterQuery, PageResult } from '@/types'

export function getChapters(params: ChapterQuery = {}) {
  return http.get<PageResult<Chapter>>('/chapters', params)
}

export function getChapter(id: number) {
  return http.get<Chapter>(`/chapters/${id}`)
}

export function createChapter(payload: ChapterPayload) {
  return http.post<Chapter>('/chapters', payload)
}

export function updateChapter(id: number, payload: Partial<ChapterPayload>) {
  return http.put<Chapter>(`/chapters/${id}`, payload)
}

export function deleteChapter(id: number) {
  return http.delete<null>(`/chapters/${id}`)
}
