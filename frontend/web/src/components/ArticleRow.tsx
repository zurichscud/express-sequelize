import { Link } from 'react-router-dom'
import { ArrowUpRightIcon, EyeIcon } from './Icons'
import { excerpt, formatCount, formatDateParts } from '@/utils/format'
import type { Article } from '@/types'

export default function ArticleRow({ article }: { article: Article }) {
  const date = formatDateParts(article.createdAt)

  return (
    <Link to={`/articles/${article.id}`} className="article-row" aria-label={`阅读文章：${article.title}`}>
      <div className="article-row__date" aria-hidden="true">
        <strong>{date.day}</strong>
        <span>
          {date.month} {date.year}
        </span>
      </div>

      <div className="article-row__main">
        <h3>{article.title}</h3>
        <p>{excerpt(article.summary, 96) || '一篇关于实践与思考的记录。'}</p>
      </div>

      <div className="article-row__meta">
        <span>{article.author}</span>
        <span className="article-row__views">
          <EyeIcon size={14} />
          {formatCount(article.views)}
        </span>
      </div>

      <span className="article-row__arrow" aria-hidden="true">
        <ArrowUpRightIcon size={18} />
      </span>
    </Link>
  )
}
