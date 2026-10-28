import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArticleRow from '@/components/ArticleRow'
import Pager from '@/components/Pager'
import { SearchIcon } from '@/components/Icons'
import { ArticleListSkeleton, EmptyState, ErrorState } from '@/components/States'
import { useAsync } from '@/hooks/useAsync'
import { usePageTitle } from '@/context/SiteContext'
import { getArticles } from '@/api/articles'
import { cx } from '@/utils/cx'

const PAGE_SIZE = 8

export default function ArticlesPage() {
  usePageTitle('文章')

  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const keyword = (searchParams.get('keyword') || '').trim()
  const sort = searchParams.get('sort') === 'hot' ? 'hot' : 'latest'
  const [searchText, setSearchText] = useState(keyword)

  useEffect(() => {
    setSearchText(keyword)
  }, [keyword])

  const { data, loading, error, reload } = useAsync(
    () => getArticles({ page, pageSize: PAGE_SIZE, keyword, sort }),
    [page, keyword, sort],
  )

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = new URLSearchParams(searchParams)
    const value = searchText.trim()
    if (value) next.set('keyword', value)
    else next.delete('keyword')
    next.delete('page')
    setSearchParams(next)
  }

  function clearSearch() {
    setSearchText('')
    const next = new URLSearchParams(searchParams)
    next.delete('keyword')
    next.delete('page')
    setSearchParams(next)
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  function changeSort(nextSort: 'latest' | 'hot') {
    const next = new URLSearchParams(searchParams)
    if (nextSort === 'hot') next.set('sort', 'hot')
    else next.delete('sort')
    next.delete('page')
    setSearchParams(next)
  }

  const total = data?.pagination.total ?? 0

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <p className="section-kicker">
              <span>02</span>
              NOTES &amp; PRACTICE
            </p>
            <h1>实践笔记</h1>
          </div>
          <p className="page-hero__note">
            关于代码、系统和学习方法的记录。
            <br />
            每一篇都尽量来自一次真实的实践，而不是转述。
          </p>
        </div>
      </section>

      <section className="section section--catalog">
        <div className="container">
          <div className="catalog-toolbar catalog-toolbar--articles">
            <div className="catalog-toolbar__group">
              <div className="sort-tabs" role="group" aria-label="文章排序">
                <button
                  type="button"
                  className={cx(sort === 'latest' && 'is-active')}
                  aria-pressed={sort === 'latest'}
                  onClick={() => changeSort('latest')}
                >
                  最新发布
                </button>
                <button
                  type="button"
                  className={cx(sort === 'hot' && 'is-active')}
                  aria-pressed={sort === 'hot'}
                  onClick={() => changeSort('hot')}
                >
                  阅读最多
                </button>
              </div>

              <div className="catalog-summary catalog-summary--inline">
                <span>{loading ? '正在检索…' : `共 ${total} 篇文章`}</span>
                {keyword && <span className="catalog-summary__tag">关键词：{keyword}</span>}
              </div>
            </div>

            <form className="search-field" role="search" onSubmit={submitSearch}>
              <SearchIcon size={17} />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="搜索标题或摘要"
                aria-label="搜索文章"
              />
              {keyword && (
                <button type="button" className="search-field__clear" onClick={clearSearch}>
                  清除
                </button>
              )}
            </form>
          </div>

          {loading && <ArticleListSkeleton count={PAGE_SIZE} />}
          {!loading && error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && data && (
            <>
              {data.list.length ? (
                <div className="article-list article-list--page">
                  {data.list.map((article) => (
                    <ArticleRow key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="没有找到匹配的文章"
                  description="换一个关键词试试，或者回到全部文章继续浏览。"
                  action={{ label: '查看全部文章', to: '/articles' }}
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
