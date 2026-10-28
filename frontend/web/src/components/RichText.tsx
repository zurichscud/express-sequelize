import type { ReactNode } from 'react'
import { cx } from '@/utils/cx'

interface RichTextProps {
  text?: string | null
  className?: string
  dropCap?: boolean
}

/** 后台正文为纯文本，这里按空行/换行拆段渲染，保留段落节奏 */
export default function RichText({ text, className, dropCap = false }: RichTextProps) {
  const paragraphs = (text || '')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (!paragraphs.length) return null

  return (
    <div className={cx('rich-text', dropCap && 'rich-text--dropcap', className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  )
}

export function DetailSection({
  index,
  title,
  children,
  className,
}: {
  index: string
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cx('detail-section', className)}>
      <header className="detail-section__head">
        <span className="detail-section__no" aria-hidden="true">
          {index}
        </span>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  )
}
