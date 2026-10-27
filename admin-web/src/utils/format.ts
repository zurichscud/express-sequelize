import dayjs from 'dayjs'

/** 格式化日期时间，空值统一显示 - */
export function formatDateTime(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
}

/** 格式化日期，空值统一显示 - */
export function formatDate(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD') : '-'
}
