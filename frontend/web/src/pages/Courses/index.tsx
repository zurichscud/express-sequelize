import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CourseCover from '@/components/CourseCover'
import CourseRow from '@/components/CourseRow'
import Pager from '@/components/Pager'
import { ArrowRightIcon, CloseIcon, HeartIcon, SearchIcon } from '@/components/Icons'
import { EmptyState, ErrorState } from '@/components/States'
import { useAsync } from '@/hooks/useAsync'
import { usePageTitle } from '@/context/SiteContext'
import { getCategories, getCourses } from '@/api/courses'
import { excerpt, formatCount } from '@/utils/format'
import { cx } from '@/utils/cx'
import type { Course } from '@/types'

const PAGE_SIZE = 9

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function CatalogSkeleton({ withFeature }: { withFeature: boolean }) {
  return (
    <div className="catalog-skeleton" aria-hidden="true">
      {withFeature && <div className="course-feature-skeleton shimmer" />}
      {Array.from({ length: withFeature ? 4 : 6 }).map((_, index) => (
        <div className="course-row-skeleton" key={index}>
          <span className="skeleton-line shimmer course-row-skeleton__no" />
          <span className="course-row-skeleton__cover shimmer" />
          <span className="course-row-skeleton__body">
            <span className="skeleton-line shimmer" style={{ width: '30%' }} />
            <span className="skeleton-line shimmer" style={{ width: '62%', height: 20 }} />
            <span className="skeleton-line shimmer" style={{ width: '86%' }} />
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CoursesPage() {
  usePageTitle('课程')

  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const categoryId = Math.max(0, Number(searchParams.get('categoryId')) || 0) || undefined
  const keyword = (searchParams.get('keyword') || '').trim()
  const onlyRecommended = searchParams.get('recommended') === '1'
  const [searchText, setSearchText] = useState(keyword)

  useEffect(() => {
    setSearchText(keyword)
  }, [keyword])

  const { data: overview } = useAsync(async () => {
    const [all, recommended, categories] = await Promise.all([
      getCourses({ pageSize: 1 }),
      getCourses({ pageSize: 1, isRecommended: true }),
      getCategories(),
    ])
    const counts = await Promise.all(
      categories.map((category) => getCourses({ pageSize: 1, categoryId: category.id })),
    )
    return {
      total: all.pagination.total,
      recommendedTotal: recommended.pagination.total,
      categories: categories.map((category, index) => ({
        ...category,
        count: counts[index].pagination.total,
      })),
    }
  }, [])

  const { data, loading, error, reload } = useAsync(
    () =>
      getCourses({
        page,
        pageSize: PAGE_SIZE,
        categoryId,
        keyword,
        isRecommended: onlyRecommended || undefined,
      }),
    [page, categoryId, keyword, onlyRecommended],
  )

  const categories = overview?.categories ?? []
  const activeCategory = categories.find((category) => category.id === categoryId)
  const activeCategoryName =
    activeCategory?.name ||
    data?.list.find((course) => course.categoryId === categoryId)?.category?.name
  const total = data?.pagination.total ?? 0

  const isDefaultView = page === 1 && !categoryId && !keyword && !onlyRecommended
  const feature: Course | undefined =
    !loading && !error && data && isDefaultView
      ? data.list
          .filter((course) => course.isRecommended)
          .sort((a, b) => b.likeCount - a.likeCount)[0]
      : undefined
  const rows = (data?.list ?? []).filter((course) => course.id !== feature?.id)
  const rowOffset = feature ? 2 : (page - 1) * PAGE_SIZE + 1

  const heading = keyword
    ? '搜索结果'
    : onlyRecommended
      ? '推荐课程'
      : activeCategoryName || '全部课程'

  function updateParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    next.delete('page')
    setSearchParams(next)
  }

  function selectCategory(id?: number) {
    updateParams((next) => {
      if (id) next.set('categoryId', String(id))
      else next.delete('categoryId')
    })
  }

  function toggleRecommended() {
    updateParams((next) => {
      if (onlyRecommended) next.delete('recommended')
      else next.set('recommended', '1')
    })
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = searchText.trim()
    updateParams((next) => {
      if (value) next.set('keyword', value)
      else next.delete('keyword')
    })
  }

  function clearKeyword() {
    setSearchText('')
    updateParams((next) => next.delete('keyword'))
  }

  function resetFilters() {
    setSearchText('')
    setSearchParams(new URLSearchParams())
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <>
      <section className="catalog-hero">
        <div className="container">
          <p className="section-kicker">
            <span>01</span>
            COURSE CATALOG
          </p>

          <div className="catalog-hero__main">
            <h1>课程目录</h1>

            <div className="catalog-hero__side">
              <p>
                每门课程按章节推进，每章都配一个可以动手完成的练习。挑一个方向，
                从最想解决的问题开始。
              </p>
              <p className="catalog-hero__counts">
                <span>
                  <strong>{overview ? pad(overview.total) : '—'}</strong> 门课程
                </span>
                <i aria-hidden="true" />
                <span>
                  <strong>{overview ? pad(overview.categories.length) : '—'}</strong> 个方向
                </span>
                <i aria-hidden="true" />
                <span>
                  <strong>{overview ? pad(overview.recommendedTotal) : '—'}</strong> 门推荐
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="catalog-body">
        <div className="container catalog-layout">
          <aside className="catalog-rail" aria-label="课程筛选">
            <form className="rail-search" role="search" onSubmit={submitSearch}>
              <SearchIcon size={15} />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="搜索课程名称"
                aria-label="搜索课程名称"
              />
              {(searchText || keyword) && (
                <button type="button" className="rail-search__clear" onClick={clearKeyword}>
                  清除
                </button>
              )}
            </form>

            <div className="rail-block">
              <p className="rail-block__label">
                <span>方向</span>
                <span>TRACKS</span>
              </p>

              <ul className="rail-nav">
                <li>
                  <button
                    type="button"
                    className={cx('rail-nav__item', !categoryId && 'is-active')}
                    aria-pressed={!categoryId}
                    onClick={() => selectCategory()}
                  >
                    <span className="rail-nav__name">全部课程</span>
                    <span className="rail-nav__count">
                      {overview ? pad(overview.total) : '—'}
                    </span>
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      type="button"
                      className={cx(
                        'rail-nav__item',
                        categoryId === category.id && 'is-active',
                      )}
                      aria-pressed={categoryId === category.id}
                      onClick={() => selectCategory(category.id)}
                    >
                      <span className="rail-nav__name">{category.name}</span>
                      <span className="rail-nav__count">{pad(category.count)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rail-block">
              <p className="rail-block__label">
                <span>筛选</span>
                <span>FILTER</span>
              </p>

              <button
                type="button"
                className={cx('rail-pick', onlyRecommended && 'is-active')}
                aria-pressed={onlyRecommended}
                onClick={toggleRecommended}
              >
                <span className="rail-pick__tick" aria-hidden="true">
                  {onlyRecommended ? '✓' : ''}
                </span>
                <span className="rail-pick__label">只看推荐</span>
                <span className="rail-pick__count">
                  {overview ? pad(overview.recommendedTotal) : '—'}
                </span>
              </button>
            </div>

            <div className="rail-note">
              <p className="rail-note__label">HOW TO START</p>
              <p>先选定一个方向，再从里面挑一门最想解决的课。按章节做完，比同时开五门更快。</p>
            </div>
          </aside>

          <div className="catalog-main">
            <div className="catalog-head">
              <div>
                <h2>{heading}</h2>
                <p className="catalog-head__meta" aria-live="polite">
                  {loading ? '正在检索…' : `共 ${total} 门课程`}
                  {!loading && page > 1 && ` · 第 ${page} 页`}
                </p>
              </div>

              {(activeCategoryName || keyword || onlyRecommended) && (
                <div className="catalog-active">
                  {activeCategoryName && (
                    <button
                      type="button"
                      className="active-tag"
                      onClick={() => selectCategory()}
                      aria-label={`移除方向筛选：${activeCategoryName}`}
                    >
                      {activeCategoryName}
                      <CloseIcon size={12} />
                    </button>
                  )}
                  {keyword && (
                    <button
                      type="button"
                      className="active-tag"
                      onClick={clearKeyword}
                      aria-label={`移除关键词：${keyword}`}
                    >
                      “{keyword}”
                      <CloseIcon size={12} />
                    </button>
                  )}
                  {onlyRecommended && (
                    <button
                      type="button"
                      className="active-tag"
                      onClick={toggleRecommended}
                      aria-label="移除推荐筛选"
                    >
                      只看推荐
                      <CloseIcon size={12} />
                    </button>
                  )}
                  <button type="button" className="catalog-active__reset" onClick={resetFilters}>
                    清除全部
                  </button>
                </div>
              )}
            </div>

            {loading && <CatalogSkeleton withFeature={isDefaultView} />}
            {!loading && error && <ErrorState message={error} onRetry={reload} />}

            {!loading && !error && data && (
              <>
                {feature && (
                  <Link
                    to={`/courses/${feature.id}`}
                    className="course-feature"
                    aria-label={`查看推荐课程：${feature.name}`}
                  >
                    <div className="course-feature__body">
                      <p className="course-feature__kicker">
                        <span className="course-feature__flag">推荐</span>
                        FEATURED COURSE
                        <span className="course-feature__serial">
                          01 / {pad(total)}
                        </span>
                      </p>
                      <h3>{feature.name}</h3>
                      <p className="course-feature__desc">
                        {excerpt(feature.content, 140) || '课程内容正在整理中。'}
                      </p>

                      <dl className="course-feature__meta">
                        <div>
                          <dt>方向</dt>
                          <dd>{feature.category?.name || '课程'}</dd>
                        </div>
                        <div>
                          <dt>章节</dt>
                          <dd>{feature.chapterCount} 章</dd>
                        </div>
                        <div>
                          <dt>喜欢</dt>
                          <dd>
                            <HeartIcon size={12} />
                            {formatCount(feature.likeCount)}
                          </dd>
                        </div>
                      </dl>

                      <span className="course-feature__cta">
                        进入课程
                        <ArrowRightIcon size={16} />
                      </span>
                    </div>

                    <div className="course-feature__media">
                      <CourseCover course={feature} index={1} eager />
                    </div>
                  </Link>
                )}

                {rows.length > 0 && (
                  <div className="course-list">
                    {rows.map((course, index) => (
                      <CourseRow
                        key={course.id}
                        course={course}
                        index={rowOffset + index}
                      />
                    ))}
                  </div>
                )}

                {!rows.length && !feature && (
                  <EmptyState
                    title="没有找到匹配的课程"
                    description="换个关键词或方向试试，也可以回到全部课程重新浏览。"
                    action={{ label: '查看全部课程', to: '/courses' }}
                  />
                )}

                <Pager page={page} totalPages={data.pagination.totalPages} onChange={goToPage} />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
