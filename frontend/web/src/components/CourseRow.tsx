import { Link } from 'react-router-dom'
import CourseCover from './CourseCover'
import { ArrowUpRightIcon, HeartIcon } from './Icons'
import { excerpt, formatCount } from '@/utils/format'
import type { Course } from '@/types'

interface CourseRowProps {
  course: Course
  index: number
}

/**
 * 课程目录中的索引行：编号、封面、摘要与热度，点击整行进入详情
 */
export default function CourseRow({ course, index }: CourseRowProps) {
  const author = course.user?.nickname || course.user?.username || '课程团队'

  return (
    <Link
      to={`/courses/${course.id}`}
      className="course-row"
      aria-label={`查看课程：${course.name}`}
    >
      <span className="course-row__no" aria-hidden="true">
        {String(index).padStart(2, '0')}
      </span>

      <div className="course-row__cover">
        <CourseCover course={course} index={index} />
      </div>

      <div className="course-row__body">
        <div className="course-row__meta">
          {course.isRecommended && <span className="course-row__flag">推荐</span>}
          <span>{course.category?.name || '课程'}</span>
          <span className="course-row__dot" aria-hidden="true" />
          <span>{course.chapterCount} 章</span>
          <span className="course-row__dot course-row__dot--author" aria-hidden="true" />
          <span className="course-row__author">{author}</span>
          <span className="course-row__likes course-row__likes--inline">
            <HeartIcon size={11} />
            {formatCount(course.likeCount)}
          </span>
        </div>

        <h3 className="course-row__title">{course.name}</h3>
        <p className="course-row__desc">
          {excerpt(course.content, 96) || '课程内容正在整理中。'}
        </p>
      </div>

      <div className="course-row__aside">
        <span className="course-row__likes">
          <HeartIcon size={13} />
          {formatCount(course.likeCount)}
        </span>
        <span className="course-row__go" aria-hidden="true">
          <ArrowUpRightIcon size={17} />
        </span>
      </div>
    </Link>
  )
}
