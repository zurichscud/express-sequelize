import { http } from './request'
import type { Chapter } from '@/types'

export function getChapter(id: number | string) {
  return http.get<Chapter>(`/chapters/${id}`)
}
