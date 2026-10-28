import { Link, useSearchParams } from 'react-router-dom'
import CourseCard from '@/components/CourseCard'
import Pager from '@/components/Pager'
import RequireAuth from '@/components/RequireAuth'
import { EmptyState, CardGridSkeleton, ErrorState } from '@/components/States'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { usePageTitle } from '@/context/SiteContext'
import { getLikedCourses } from '@/api/likes'

const PAGE_SIZE = 9

export default function LikedCoursesPage() {
  usePageTitle('我的点赞')

  return (
    <RequireAuth>
      <LikedCoursesContent />
    </RequireAuth>
  )
}

function LikedCoursesContent() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { data, loading, error, reload } = useAsync(
    () => getLikedCourses({ page, pageSize: PAGE_SIZE }),
    [page, user?.id],
  )

  const total = data?.pagination.total ?? 0

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <p className="section-kicker">
              <span>ME</span>
              LIKED COURSES
            </p>
            <h1>我的点赞</h1>
          </div>
          <div className="page-hero__note">
            {loading ? '正在读取…' : `共 ${total} 门课程`}
            <br />
            <Link to="/me" className="text-link">
              账号设置
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--catalog">
        <div className="container">
          {loading && <CardGridSkeleton count={PAGE_SIZE} />}
          {!loading && error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && data && (
            <>
              {data.list.length ? (
                <div className="course-grid course-grid--catalog">
                  {data.list.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={(page - 1) * PAGE_SIZE + index + 1} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="还没有点赞的课程"
                  description="遇到喜欢的课程时，点一下爱心就会出现在这里。"
                  action={{ label: '去挑选课程', to: '/courses' }}
                />
              )}

              <Pager page={page} totalPages={data.pagination.totalPages} onChange={goToPage} />
            </>
          )}
        </div>
      </section>
    </>
  )
}
