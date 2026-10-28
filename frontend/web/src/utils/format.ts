import dayjs from 'dayjs'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** 2026.10.27 */
export function formatDate(value?: string | null) {
  if (!value) return '—'
  return dayjs(value).format('YYYY.MM.DD')
}

/** 拆成日期数字和英文月份，用于文章列表的日期块 */
export function formatDateParts(value?: string | null) {
  if (!value) return { day: '--', month: '---', year: '----' }
  const date = dayjs(value)
  return {
    day: date.format('DD'),
    month: MONTHS[date.month()],
    year: date.format('YYYY'),
  }
}

/** 数值缩写：1.2w / 320 */
export function formatCount(value?: number | null) {
  const count = Number(value || 0)
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1).replace(/\.0$/, '')}w`
  }
  return String(count)
}

/** 估算阅读时长，按每分钟 350 字计算 */
export function readingMinutes(text?: string | null) {
  const length = (text || '').replace(/\s/g, '').length
  return Math.max(1, Math.ceil(length / 350))
}

/** 截取纯文本摘要 */
export function excerpt(text: string | null | undefined, max = 90) {
  const normalized = (text || '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max)}…`
}
