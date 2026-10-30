import { Link } from 'react-router-dom'
import CourseCover from './CourseCover'
import { ArrowUpRightIcon, HeartIcon } from './Icons'
import { excerpt, formatCount } from '@/utils/format'
import { cx } from '@/utils/cx'
import type { Course } from '@/types'

interface CourseCardProps {
  course: Course
  index?: number
  variant?: 'default' | 'wide'
  eager?: boolean
}

export default function CourseCard({ course, index = 1, variant = 'default', eager }: CourseCardProps) {
  const author = course.user?.nickname || course.user?.username || '课程团队'

  return (
    <Link
      to={`/courses/${course.id}`}
      className={cx('course-card', variant === 'wide' && 'course-card--wide')}
      aria-label={`查看课程：${course.name}`}
    >
      <div className="course-card__media">
        <CourseCover course={course} index={index} eager={eager} />
        {course.isRecommended && <span className="course-card__flag">推荐</span>}
        <span className="course-card__index">{String(index).padStart(2, '0')}</span>
      </div>

      <div className="course-card__body">
        <div className="course-card__meta">
          <span>{course.category?.name || '课程'}</span>
          <span className="course-card__dot" aria-hidden="true" />
          <span>{course.chapterCount} 章</span>
        </div>

        <h3 className="course-card__title">{course.name}</h3>
        <p className="course-card__desc">
          {excerpt(course.content, variant === 'wide' ? 150 : 74) || '课程内容正在整理中。'}
        </p>

        <div className="course-card__foot">
          <span className="course-card__author">{author}</span>
          <span className="course-card__stat">
            <HeartIcon size={15} />
            {formatCount(course.likeCount)}
          </span>
        </div>

        <span className="course-card__arrow" aria-hidden="true">
          <ArrowUpRightIcon size={20} />
        </span>
      </div>
    </Link>
  )
}
