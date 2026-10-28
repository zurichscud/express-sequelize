import { http } from './request'
import type { GenderChartData, MonthlyUsersData } from '@/types'

export function getGenderChart() {
  return http.get<GenderChartData>('/charts/gender')
}

export function getMonthlyUsers(year?: number) {
  return http.get<MonthlyUsersData>('/charts/monthly-users', year ? { year } : undefined)
}
