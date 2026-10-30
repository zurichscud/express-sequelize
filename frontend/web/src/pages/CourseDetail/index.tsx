import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CourseCover from '@/components/CourseCover'
import CourseRow from '@/components/CourseRow'
import RichText from '@/components/RichText'
import SectionHeading from '@/components/SectionHeading'
import { EmptyState, ErrorState } from '@/components/States'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  HeartIcon,
  VideoIcon,
} from '@/components/Icons'
import { useAsync } from '@/hooks/useAsync'
import { usePageTitle } from '@/context/SiteContext'
import { useAuth } from '@/context/AuthContext'
import { getCourse, getCourses } from '@/api/courses'
import { getChapter } from '@/api/chapters'
import { getLikeStatus, likeCourse, unlikeCourse } from '@/api/likes'
import { getErrorMessage } from '@/api/request'
import { formatCount, formatDate } from '@/utils/format'
import { cx } from '@/utils/cx'
import type { Chapter, Course } from '@/types'

interface CourseDetailData {
  course: Course
  related: Course[]
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function CourseDetailSkeleton() {
  return (
    <div className="course-detail-skeleton" role="status" aria-label="正在加载课程">
      <div className="course-detail-skeleton__hero">
        <div className="container">
          <span className="skeleton-line shimmer" style={{ width: 170 }} />
          <span
            className="skeleton-line shimmer"
            style={{ width: '52%', height: 56, marginTop: 22 }}
          />
          <span
            className="skeleton-line shimmer"
            style={{ width: '34%', marginTop: 18 }}
          />
        </div>
      </div>

      <div className="container course-detail-skeleton__body">
        <div className="course-detail-skeleton__grid">
          <div className="course-detail-skeleton__lines">
            <span className="skeleton-line shimmer" style={{ width: '28%' }} />
            <span className="skeleton-line shimmer" style={{ width: '64%', height: 34 }} />
            <span className="skeleton-line shimmer" style={{ width: '92%' }} />
            <span className="skeleton-line shimmer" style={{ width: '84%' }} />
            <span className="skeleton-line shimmer" style={{ width: '48%' }} />
          </div>
          <div className="course-detail-skeleton__lines">
            <span className="skeleton-line shimmer" style={{ width: '70%' }} />
            <span className="skeleton-line shimmer" style={{ width: '90%' }} />
            <span className="skeleton-line shimmer" style={{ width: '60%' }} />
            <span className="skeleton-line shimmer" style={{ width: '78%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const courseId = id || ''

  const { data, loading, error, reload } = useAsync<CourseDetailData>(async () => {
    const course = await getCourse(courseId)
    let related: Course[] = []

    if (course.categoryId) {
      const result = await getCourses({ categoryId: course.categoryId, pageSize: 4 })
      related = result.list.filter((item) => item.id !== course.id).slice(0, 3)
    }

    return { course, related }
  }, [courseId])

  const course = data?.course ?? null
  const chapters = course?.chapters ?? []
  const [activeId, setActiveId] = useState<number | null>(null)
  const railListRef = useRef<HTMLOListElement | null>(null)

  // 正文按章节 id 缓存。切换章节时直接从缓存同步取值，避免先渲染 loading 再替换内容。
  const chapterCacheRef = useRef<Map<number, Chapter>>(new Map())

  // 同一章节可能同时被「当前章节加载」和「后台预取」触发。这里保存进行中的 Promise，
  // 让它们复用同一个请求，既避免重复调接口，也避免多个响应互相覆盖。
  const chapterPendingRef = useRef<Map<number, Promise<Chapter>>>(new Map())

  // 请求可能在组件卸载后才返回，用它阻止对已卸载组件 setState。
  const mountedRef = useRef(true)

  // Map 放在 ref 里避免每次请求都复制整份缓存；写入缓存后通过这个 reducer 强制渲染一次，
  // 让 render 重新从 Map 里读取当前章节。
  const [, refreshChapterCache] = useReducer((value: number) => value + 1, 0)

  // 错误记录所属章节 id。快速切章时，上一章的错误不会短暂显示在新章节上。
  const [chapterErrorState, setChapterErrorState] = useState<{
    id: number
    message: string
  } | null>(null)

  // 递增后让当前章节的加载 effect 重新执行，错误重试时不需要复制一份加载逻辑。
  const [chapterRetry, setChapterRetry] = useState(0)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeBusy, setLikeBusy] = useState(false)
  const [likeError, setLikeError] = useState<string | null>(null)
  const { user, openAuth } = useAuth()

  const activeChapterId =
    activeId && chapters.some((chapter) => chapter.id === activeId)
      ? activeId
      : (chapters[0]?.id ?? null)
  const activeIndex = chapters.findIndex((chapter) => chapter.id === activeChapterId)
  const activeChapter = activeIndex >= 0 ? chapters[activeIndex] : undefined

  const loadChapter = useCallback(
    (chapterId: number) => {
      // 1. 命中缓存直接返回。切换已加载章节时不会产生请求，也不会出现 loading 替换。
      const cached = chapterCacheRef.current.get(chapterId)
      if (cached) return Promise.resolve(cached)

      // 2. 同一章节正在请求时复用同一个 Promise。
      // 用户点击章节和后台预取可能同时命中一章，如果各自发请求：
      // - 会重复占用带宽；
      // - 先返回的响应可能被后返回的旧响应覆盖；
      // - 每次响应都会触发一次不必要的渲染。
      const pending = chapterPendingRef.current.get(chapterId)
      if (pending) return pending

      // 3. 请求结束（成功或失败）后立刻移出 pending，
      // 这样失败后重试可以重新发请求，而不会被已经结束的 Promise 卡住。
      const request = getChapter(chapterId)
        .then((chapter) => {
          chapterCacheRef.current.set(chapter.id, chapter)
          // 组件已卸载时不再刷新状态，避免对已卸载组件 setState；
          // 缓存写入本身没有副作用。
          if (mountedRef.current) refreshChapterCache()
          return chapter
        })
        .finally(() => {
          chapterPendingRef.current.delete(chapterId)
        })

      chapterPendingRef.current.set(chapterId, request)
      return request
    },
    [refreshChapterCache],
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // 当前章节只在未缓存时才发请求。命中缓存时标题和正文在同一次 render 中一起更新，
  // 不会出现「新标题配旧正文」或「旧正文 → loading → 新正文」的中间态。
  useEffect(() => {
    // 切章先清掉上一章的错误，避免错误提示短暂挂在新章节上。
    setChapterErrorState(null)
    if (!activeChapterId || chapterCacheRef.current.has(activeChapterId)) return

    // effect 可能在请求返回前被下一次切章清理。用 active 丢弃过期请求的结果，
    // 防止慢请求返回后覆盖用户已经切换到的新章节。
    let active = true
    loadChapter(activeChapterId).catch((error: unknown) => {
      if (active) {
        setChapterErrorState({
          id: activeChapterId,
          message: getErrorMessage(error),
        })
      }
    })

    return () => {
      active = false
    }
  }, [activeChapterId, chapterRetry, loadChapter])

  // 页面加载后在后台预取正文：章节少时一次取全，章节多时只取当前章节附近。
  // 这样常用切换可以零等待，同时避免章节很多时页面一打开就打出几十个请求。
  // 该 effect 声明在当前章节 effect 之后，首屏会先请求用户正在看的那一章。
  useEffect(() => {
    if (!course || !chapters.length) return

    const ids = chapters
      .filter(
        (_chapter, index) => chapters.length <= 12 || Math.abs(index - activeIndex) <= 2,
      )
      .map((chapter) => chapter.id)
      // 当前章节由上面的 effect 负责，后台预取跳过它，避免和首屏请求抢优先级。
      .filter((id) => id !== activeChapterId && !chapterCacheRef.current.has(id))

    ids.forEach((id) => {
      // loadChapter 内部会合并同一章节的并发请求，这里不会和点击重复请求。
      // 预取失败不打扰用户；真正切换到该章时会走当前章节的加载和错误流程。
      void loadChapter(id).catch(() => {})
    })
  }, [course?.id, chapters, activeChapterId, activeIndex, loadChapter])

  // 当前章节正文直接从缓存读取，而不是等 effect 把数据写进 state。
  // 这样切换已预取的章节时，目录高亮、标题、正文可以在同一次 render 中完成。
  const chapterData = activeChapterId
    ? (chapterCacheRef.current.get(activeChapterId) ?? null)
    : null

  // 错误只对产生它的章节生效，快速切章时不会把上一章的错误显示到新章节。
  const chapterError =
    chapterErrorState && chapterErrorState.id === activeChapterId
      ? chapterErrorState.message
      : null

  // 没有数据且没有错误，说明请求还在进行中；显示与正文区域同高的内联 loading，
  // 不用整块 spinner 替换正文，避免面板高度变化导致页面抖动。
  const chapterLoading = Boolean(activeChapterId) && !chapterData && !chapterError

  usePageTitle(course?.name)

  // 手机上章节列表横向滚动，切换章节时把当前项带回可视区域
  useEffect(() => {
    const list = railListRef.current
    if (!list || list.scrollWidth <= list.clientWidth) return

    const active = list.querySelector<HTMLElement>('.syllabus__item.is-active')
    if (!active) return

    const listRect = list.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    if (activeRect.left < listRect.left || activeRect.right > listRect.right) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      list.scrollBy({
        left: activeRect.left - listRect.left - 12,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    }
  }, [activeChapterId])

  // 登录用户读取点赞状态；未登录时回到课程自身的点赞数
  useEffect(() => {
    if (!course) return
    setLikeCount(course.likeCount)
    setLiked(false)
    setLikeError(null)

    if (!user) return

    let active = true
    getLikeStatus(course.id)
      .then((status) => {
        if (!active) return
        setLiked(status.liked)
        setLikeCount(status.likeCount)
      })
      .catch(() => {
        // 状态读取失败不阻塞课程内容展示
      })

    return () => {
      active = false
    }
  }, [data, user?.id])

  if (loading) {
    return <CourseDetailSkeleton />
  }

  if (error || !course) {
    return (
      <div className="container detail-error">
        <ErrorState message={error || '课程不存在'} onRetry={reload} />
        <Link to="/courses" className="text-link">
          <ArrowLeftIcon size={16} />
          返回课程目录
        </Link>
      </div>
    )
  }

  const author = course.user?.nickname || course.user?.username || '课程团队'
  const authorInitial = author.trim().charAt(0) || '课'
  const chapterTotal = chapters.length || course.chapterCount
  const hasRelated = Boolean(data?.related.length)
  const closingIndex = hasRelated ? '04' : '03'
  const progress = chapters.length ? ((activeIndex + 1) / chapters.length) * 100 : 0

  async function toggleLike() {
    if (!course) return
    if (!user) {
      openAuth('login')
      return
    }
    if (likeBusy) return

    const previousLiked = liked
    const previousCount = likeCount
    const nextLiked = !liked

    setLiked(nextLiked)
    setLikeCount(Math.max(0, previousCount + (nextLiked ? 1 : -1)))
    setLikeBusy(true)
    setLikeError(null)

    try {
      const status = nextLiked ? await likeCourse(course.id) : await unlikeCourse(course.id)
      setLiked(status.liked)
      setLikeCount(status.likeCount)
    } catch (err) {
      setLiked(previousLiked)
      setLikeCount(previousCount)
      setLikeError(getErrorMessage(err))
    } finally {
      setLikeBusy(false)
    }
  }

  function goToChapter(offset: number) {
    const next = chapters[activeIndex + offset]
    if (next) setActiveId(next.id)
  }

  return (
    <article className="course-detail">
      <header className="course-hero">
        <div className="course-hero__bg" aria-hidden="true">
          <CourseCover course={course} eager />
        </div>
        <div className="course-hero__scrim" aria-hidden="true" />

        <div className="container course-hero__inner">
          <nav className="course-crumbs" aria-label="面包屑">
            <Link to="/">首页</Link>
            <span aria-hidden="true">/</span>
            <Link to="/courses">课程</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{course.name}</span>
          </nav>

          <div className="course-hero__main">
            <p className="course-hero__kicker">
              {course.isRecommended && <span className="course-hero__flag">推荐</span>}
              <span>{course.category?.name || '课程'}</span>
              <span className="course-hero__sep" aria-hidden="true">
                /
              </span>
              <span>COURSE</span>
            </p>

            <h1>{course.name}</h1>

            <p className="course-hero__lede">
              {chapters.length
                ? '按章节推进，每一章都配一个可以动手完成的练习。'
                : '课程章节正在整理中，可以先浏览其他课程。'}
            </p>

            <div className="course-hero__foot">
              <p className="course-hero__meta">
                <span className="course-hero__author">
                  <i aria-hidden="true">{authorInitial}</i>
                  {author}
                </span>
                <span aria-hidden="true">·</span>
                <span>{chapterTotal} 个章节</span>
                <span aria-hidden="true">·</span>
                <span>更新于 {formatDate(course.updatedAt)}</span>
              </p>

              <div className="course-hero__actions">
                <button
                  type="button"
                  className={cx('course-hero__like', liked && 'is-liked')}
                  onClick={toggleLike}
                  aria-pressed={liked}
                  aria-label={liked ? '取消点赞' : '点赞这门课程'}
                  disabled={likeBusy}
                >
                  <HeartIcon size={17} />
                  <span>{formatCount(likeCount)}</span>
                  <span className="course-hero__like-label">
                    {liked ? '已点赞' : '点赞'}
                  </span>
                </button>

                <a href="#chapters" className="button button--light">
                  开始学习
                  <ChevronDownIcon size={16} />
                </a>
              </div>
            </div>

            {!user && (
              <p className="course-hero__hint">登录后可以为这门课程点赞。</p>
            )}
            {likeError && (
              <p className="course-hero__error" role="alert">
                {likeError}
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="course-intro">
        <div className="container course-intro__inner">
          <div className="course-intro__main">
            <p className="section-kicker">
              <span>01</span>
              ABOUT THE COURSE
            </p>
            <h2>课程简介</h2>

            {course.content ? (
              <RichText text={course.content} className="prose course-intro__text" />
            ) : (
              <p className="prose prose--muted course-intro__text">
                这门课程暂时还没有填写简介。
              </p>
            )}

            <div className="course-intro__note">
              <p className="course-intro__note-label">学习建议</p>
              <p>完成一章后停一下，用自己的话复述关键概念，再继续下一章。</p>
            </div>
          </div>

          <aside className="course-intro__side">
            <dl className="course-facts">
              <div>
                <dt>方向</dt>
                <dd>{course.category?.name || '未分类'}</dd>
              </div>
              <div>
                <dt>讲师</dt>
                <dd>{author}</dd>
              </div>
              <div>
                <dt>章节</dt>
                <dd>{chapterTotal} 个</dd>
              </div>
              <div>
                <dt>点赞</dt>
                <dd>{formatCount(likeCount)}</dd>
              </div>
              <div>
                <dt>最近更新</dt>
                <dd>{formatDate(course.updatedAt)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="course-chapters" id="chapters">
        <div className="container">
          <header className="course-section-head">
            <div>
              <p className="section-kicker">
                <span>02</span>
                SYLLABUS
              </p>
              <h2>章节内容</h2>
            </div>
            <p className="course-section-head__note">
              {chapters.length
                ? `共 ${chapters.length} 章 · 当前第 ${activeIndex + 1} 章`
                : '章节正在整理中'}
            </p>
          </header>

          {chapters.length ? (
            <div className="syllabus">
              <aside className="syllabus__rail" aria-label="章节目录">
                <div className="syllabus__rail-head">
                  <span>课程目录</span>
                  <span>{pad(chapters.length)}</span>
                </div>

                <ol className="syllabus__list" ref={railListRef}>
                  {chapters.map((chapter, index) => (
                    <li key={chapter.id}>
                      <button
                        type="button"
                        className={cx(
                          'syllabus__item',
                          chapter.id === activeChapterId && 'is-active',
                        )}
                        onClick={() => setActiveId(chapter.id)}
                        aria-current={chapter.id === activeChapterId ? 'true' : undefined}
                      >
                        <span className="syllabus__no">{pad(index + 1)}</span>
                        <span className="syllabus__name">{chapter.title}</span>
                        {chapter.videoUrl && <VideoIcon size={14} />}
                      </button>
                    </li>
                  ))}
                </ol>

                <div className="syllabus__progress">
                  <div className="syllabus__progress-meta">
                    <span>当前章节</span>
                    <span>
                      {pad(activeIndex + 1)} / {pad(chapters.length)}
                    </span>
                  </div>
                  <div className="syllabus__bar" aria-hidden="true">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </aside>

              <div className="syllabus__panel">
                {activeChapter && (
                  <header className="syllabus__panel-head">
                    <div>
                      <p className="syllabus__label">
                        CHAPTER {pad(activeIndex + 1)} / {pad(chapters.length)}
                      </p>
                      <h3>{activeChapter.title}</h3>
                    </div>
                    {activeChapter.videoUrl && (
                      <span className="syllabus__badge">
                        <VideoIcon size={13} />
                        含视频
                      </span>
                    )}
                  </header>
                )}

                <div className="syllabus__body">
                  {chapterLoading && (
                    <div className="syllabus__loading" role="status" aria-live="polite">
                      <span className="page-loading__ring" aria-hidden="true" />
                      <span>正在读取章节</span>
                    </div>
                  )}

                  {chapterError && (
                    <ErrorState
                      message={chapterError}
                      onRetry={() => {
                        setChapterErrorState(null)
                        setChapterRetry((value) => value + 1)
                      }}
                    />
                  )}

                  {chapterData && (
                    <>
                      {chapterData.videoUrl && (
                        <video
                          className="syllabus__video"
                          controls
                          preload="metadata"
                          playsInline
                          poster={course.image ?? undefined}
                          src={chapterData.videoUrl}
                        >
                          你的浏览器不支持视频播放。
                        </video>
                      )}

                      {chapterData.content ? (
                        <RichText
                          text={chapterData.content}
                          className="prose syllabus__prose"
                        />
                      ) : (
                        !chapterData.videoUrl && (
                          <p className="syllabus__empty">本章正文正在整理中。</p>
                        )
                      )}
                    </>
                  )}
                </div>

                {chapters.length > 1 && (
                  <nav className="syllabus__nav" aria-label="章节翻页">
                    <button
                      type="button"
                      onClick={() => goToChapter(-1)}
                      disabled={activeIndex <= 0}
                    >
                      <ArrowLeftIcon size={15} />
                      上一章
                    </button>

                    <span>
                      {pad(activeIndex + 1)} / {pad(chapters.length)}
                    </span>

                    <button
                      type="button"
                      onClick={() => goToChapter(1)}
                      disabled={activeIndex >= chapters.length - 1}
                    >
                      下一章
                      <ArrowRightIcon size={15} />
                    </button>
                  </nav>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="章节内容正在整理中"
              description="这门课程的章节还没有发布，可以先去看看其他课程，或者读一篇实践笔记。"
              action={{ label: '浏览其他课程', to: '/courses' }}
            />
          )}
        </div>
      </section>

      {hasRelated && (
        <section className="course-related">
          <div className="container">
            <SectionHeading
              index="03"
              kicker="KEEP LEARNING"
              title="同类课程"
              action={{ label: '全部课程', to: '/courses' }}
            />
            <div className="related-list">
              {data?.related.map((item, index) => (
                <CourseRow key={item.id} course={item} index={index + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="course-closing">
        <div className="container course-closing__inner">
          <div>
            <p className="section-kicker">
              <span>{closingIndex}</span>
              NEXT STEP
            </p>
            <h2>换个方向，继续下一门。</h2>
            <p className="course-closing__text">
              在课程目录里挑下一门，按自己的节奏继续。
            </p>
          </div>

          <Link to="/courses" className="button button--solid">
            浏览全部课程
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>
    </article>
  )
}
