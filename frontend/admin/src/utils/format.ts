import dayjs from 'dayjs'

/** 格式化日期时间，空值统一显示 - */
export function formatDateTime(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
}

/** 格式化日期，空值统一显示 - */
export function formatDate(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD') : '-'
}

/** 格式化文件大小（字节） */
export function formatFileSize(size?: number | null) {
  const value = Number(size)
  if (!Number.isFinite(value) || value <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const result = value / 1024 ** index
  return `${result >= 100 || index === 0 ? Math.round(result) : result.toFixed(1)} ${units[index]}`
}
