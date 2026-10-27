import { http } from './request'
import type { SiteSetting } from '@/types'

export function getSettings() {
  return http.get<SiteSetting>('/settings')
}

export function updateSettings(payload: Partial<Pick<SiteSetting, 'name' | 'icp' | 'copyright'>>) {
  return http.put<SiteSetting>('/settings', payload)
}
