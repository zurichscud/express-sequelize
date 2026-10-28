import { useEffect, useState } from 'react'
import { cx } from '@/utils/cx'
import type { Course } from '@/types'

interface CourseCoverProps {
  course: Pick<Course, 'name' | 'image'>
  index?: number
  eager?: boolean
  className?: string
}

/**
 * 课程封面：图片加载失败或没有封面时，展示排版占位图，保证卡片始终完整
 */
export default function CourseCover({ course, index = 1, eager = false, className }: CourseCoverProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [course.image])

  const showImage = Boolean(course.image) && !failed
  const serial = String(index).padStart(2, '0')

  return (
    <div className={cx('cover', !showImage && 'cover--fallback', className)}>
      {showImage ? (
        <img
          src={course.image ?? ''}
          alt={`${course.name} 封面`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cover__fallback" aria-hidden="true">
          <span className="cover__glyph">{course.name.trim().charAt(0) || '课'}</span>
          <span className="cover__serial">COURSE / {serial}</span>
        </div>
      )}
    </div>
  )
}
