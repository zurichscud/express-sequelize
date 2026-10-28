import { http } from './request'
import type { Setting } from '@/types'

export function getSettings() {
  return http.get<Setting>('/settings')
}
