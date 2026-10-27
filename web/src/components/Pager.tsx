import { useEffect, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from './Icons'

interface PagerProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export default function Pager({ page, totalPages, onChange }: PagerProps) {
  if (!totalPages || totalPages <= 1) return null

  return (
    <nav className="pager" aria-label="分页">
      <button
        type="button"
        className="pager__btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeftIcon size={16} />
        上一页
      </button>

      <span className="pager__status">
        <strong>{String(page).padStart(2, '0')}</strong>
        <i aria-hidden="true">/</i>
        {String(totalPages).padStart(2, '0')}
      </span>

      <button
        type="button"
        className="pager__btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        下一页
        <ArrowRightIcon size={16} />
      </button>
    </nav>
  )
}

/** 阅读进度条：仅文章详情页使用 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      const root = document.documentElement
      const max = root.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="reading-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
