import { Link } from 'react-router-dom'
import CourseCard from '@/components/CourseCard'
import ArticleRow from '@/components/ArticleRow'
import SectionHeading from '@/components/SectionHeading'
import { ArrowRightIcon, ArrowUpRightIcon, SparkIcon } from '@/components/Icons'
import { ArticleListSkeleton, CardGridSkeleton, ErrorState } from '@/components/States'
import { useAsync } from '@/hooks/useAsync'
import { usePageTitle } from '@/context/SiteContext'
import { getCategories, getCourses } from '@/api/courses'
import { getArticles } from '@/api/articles'
import { formatCount } from '@/utils/format'

export default function HomePage() {
  usePageTitle()

  const { data, loading, error, reload } = useAsync(async () => {
    const [featured, latest, articles, categories] = await Promise.all([
      getCourses({ pageSize: 4, isRecommended: true }),
      getCourses({ pageSize: 3 }),
      getArticles({ pageSize: 4 }),
      getCategories(),
    ])

    return {
      featured: featured.list,
      courseTotal: latest.pagination.total,
      articles: articles.list,
      articleTotal: articles.pagination.total,
      categories,
    }
  }, [])

  const courseTotal = data?.courseTotal ?? 0
  const articleTotal = data?.articleTotal ?? 0
  const categoryTotal = data?.categories.length ?? 0
  const tickerItems = data?.categories.length
    ? data.categories
    : [{ id: 0, name: '课程', rank: 0 }]

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">
              <SparkIcon size={16} />
              持续学习 · 持续记录
            </p>
            <h1 className="hero__title">
              把知识学成
              <br />
              <span className="hero__accent">可以交付</span>的作品。
            </h1>
            <p className="hero__lede">
              课程拆成章节，实践写成文章。用一条清晰的路径，从「看懂」走到「做出来」，再把过程沉淀成自己的方法。
            </p>
            <div className="hero__actions">
              <Link to="/courses" className="button button--solid">
                浏览课程
                <ArrowRightIcon size={17} />
              </Link>
              <Link to="/articles" className="button button--ghost">
                读读最近的笔记
                <ArrowUpRightIcon size={17} />
              </Link>
            </div>
          </div>

          <aside className="hero__ledger" aria-label="站点内容概览">
            <div className="hero__ledger-head">
              <span>LEARNING INDEX</span>
              <span>{new Date().getFullYear()}</span>
            </div>

            <dl className="hero__stats">
              <div className="hero__stat">
                <dt>课程</dt>
                <dd>
                  <strong>{loading ? '—' : formatCount(courseTotal)}</strong>
                  <span>COURSES</span>
                </dd>
              </div>
              <div className="hero__stat">
                <dt>文章</dt>
                <dd>
                  <strong>{loading ? '—' : formatCount(articleTotal)}</strong>
                  <span>NOTES</span>
                </dd>
              </div>
              <div className="hero__stat">
                <dt>方向</dt>
                <dd>
                  <strong>{loading ? '—' : formatCount(categoryTotal)}</strong>
                  <span>TRACKS</span>
                </dd>
              </div>
            </dl>

            <p className="hero__ledger-note">从一门课程开始，沿着章节一步步做出来。</p>
            <span className="hero__stamp" aria-hidden="true">
              学
              <br />
              以
              <br />
              致
              <br />
              用
            </span>
          </aside>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[...tickerItems, ...tickerItems].map((category, index) =>
            category.id ? (
              <Link key={`${category.id}-${index}`} to={`/courses?categoryId=${category.id}`} tabIndex={-1}>
                {category.name}
                <span>✦</span>
              </Link>
            ) : (
              <span key={`fallback-${index}`} className="ticker__plain">
                {category.name}
                <span>✦</span>
              </span>
            ),
          )}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <SectionHeading
            index="01"
            kicker="SELECTED COURSES"
            title="精选课程"
            description="从基础到实战，每门课程都被拆成可以逐个完成的章节。"
            action={{ label: '全部课程', to: '/courses' }}
          />

          {loading && <CardGridSkeleton count={4} />}
          {!loading && error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && data && (
            <div className="featured-grid">
              {data.featured.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index + 1}
                  variant={index === 0 ? 'wide' : 'default'}
                  eager={index === 0}
                />
              ))}
              {!data.featured.length && (
                <p className="inline-empty">暂时还没有推荐课程，去后台添加一门吧。</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <SectionHeading
            index="02"
            kicker="LEARNING TRACKS"
            title="按方向进入"
            action={{ label: '浏览全部', to: '/courses' }}
          />

          {loading ? (
            <div className="category-index" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="category-index__item" key={index}>
                  <span className="skeleton-line shimmer" style={{ width: 40 }} />
                  <span className="skeleton-line shimmer" style={{ width: '60%', height: 24 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="category-index">
              {(data?.categories ?? []).map((category, index) => (
                <Link
                  key={category.id}
                  to={`/courses?categoryId=${category.id}`}
                  className="category-index__item"
                >
                  <span className="category-index__no">{String(index + 1).padStart(2, '0')}</span>
                  <span className="category-index__name">{category.name}</span>
                  <span className="category-index__link">
                    查看课程
                    <ArrowUpRightIcon size={15} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--articles">
        <div className="container split-section">
          <div className="split-section__aside">
            <p className="section-kicker">
              <span>03</span>
              NOTES &amp; PRACTICE
            </p>
            <h2 className="section-title">
              写下来，
              <br />
              才算真的学会。
            </h2>
            <p className="split-section__text">
              把踩过的坑、想通的原理和跑通的代码记录下来。文章不长，但都来自真实的实践。
            </p>
            <Link to="/articles" className="text-link">
              全部文章
              <ArrowRightIcon size={17} />
            </Link>
          </div>

          <div className="split-section__main">
            {loading && <ArticleListSkeleton count={4} />}
            {!loading && error && <ErrorState message={error} onRetry={reload} />}
            {!loading && !error && data && (
              <div className="article-list">
                {data.articles.map((article) => (
                  <ArticleRow key={article.id} article={article} />
                ))}
                {!data.articles.length && <p className="inline-empty">还没有发布文章。</p>}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="method">
        <div className="container method__inner">
          <div className="method__head">
            <p className="section-kicker section-kicker--light">
              <span>04</span>
              HOW IT WORKS
            </p>
            <h2>
              先把路走通，
              <br />
              再把路走宽。
            </h2>
          </div>

          <ol className="method__steps">
            <li>
              <span className="method__no">01</span>
              <h3>选一个方向</h3>
              <p>从课程目录里挑一门最想解决的问题，不要同时开太多条线。</p>
            </li>
            <li>
              <span className="method__no">02</span>
              <h3>按章节做出来</h3>
              <p>每读完一章就动手实现一次，让知识经过手，而不只是经过眼睛。</p>
            </li>
            <li>
              <span className="method__no">03</span>
              <h3>写成自己的笔记</h3>
              <p>把关键决策和踩坑过程写下来，下一次遇到同类问题时可以直接复用。</p>
            </li>
          </ol>

          <Link to="/courses" className="button button--light">
            从一门课程开始
            <ArrowRightIcon size={17} />
          </Link>
        </div>
      </section>
    </>
  )
}
