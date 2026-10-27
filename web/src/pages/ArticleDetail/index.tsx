import { Link, useParams } from 'react-router-dom'
import RichText from '@/components/RichText'
import { ReadingProgress } from '@/components/Pager'
import { ErrorState, PageLoading } from '@/components/States'
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, EyeIcon, HeartIcon } from '@/components/Icons'
import { useAsync } from '@/hooks/useAsync'
import { usePageTitle } from '@/context/SiteContext'
import { getArticle } from '@/api/articles'
import { formatCount, formatDate, readingMinutes } from '@/utils/format'

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const articleId = id || ''

  const { data: article, loading, error, reload } = useAsync(
    () => getArticle(articleId),
    [articleId],
  )

  usePageTitle(article?.title)

  if (loading) {
    return (
      <div className="container page-loading-wrap">
        <PageLoading label="正在打开文章" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container detail-error">
        <ErrorState message={error || '文章不存在'} onRetry={reload} />
        <Link to="/articles" className="text-link">
          <ArrowLeftIcon size={16} />
          返回文章列表
        </Link>
      </div>
    )
  }

  return (
    <>
      <ReadingProgress />

      <article className="article-page">
        <div className="container">
          <Link to="/articles" className="back-link">
            <ArrowLeftIcon size={16} />
            返回文章列表
          </Link>

          <header className="article-hero">
            <p className="section-kicker">
              <span>NOTE</span>
              实践笔记
            </p>
            <h1>{article.title}</h1>
            {article.summary && <p className="article-hero__summary">{article.summary}</p>}

            <div className="article-meta">
              <span className="article-meta__author">
                <span className="article-meta__avatar" aria-hidden="true">
                  {article.author.trim().charAt(0) || '匿'}
                </span>
                {article.author}
              </span>
              <span>{formatDate(article.createdAt)}</span>
              <span>
                <ClockIcon size={15} />
                约 {readingMinutes(article.content)} 分钟
              </span>
              <span>
                <EyeIcon size={15} />
                {formatCount(article.views)} 次阅读
              </span>
            </div>
          </header>

          <div className="article-body">
            <RichText text={article.content} className="prose prose--article" dropCap />
          </div>

          <footer className="article-end">
            <span className="article-end__mark" aria-hidden="true">
              完
            </span>
            <p>如果这篇文章对你有帮助，可以继续去看看相关的课程。</p>
            <div className="article-end__actions">
              <Link to="/articles" className="button button--ghost">
                继续阅读
                <ArrowRightIcon size={16} />
              </Link>
              <Link to="/courses" className="button button--solid">
                去看课程
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </footer>
        </div>
      </article>

      <section className="article-cta">
        <div className="container article-cta__inner">
          <div>
            <p className="section-kicker section-kicker--light">
              <span>
                <HeartIcon size={13} />
              </span>
              KEEP GOING
            </p>
            <h2>把读到的，做成自己的。</h2>
          </div>
          <Link to="/courses" className="button button--light">
            浏览全部课程
            <ArrowRightIcon size={17} />
          </Link>
        </div>
      </section>
    </>
  )
}
