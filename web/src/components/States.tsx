import { Link } from 'react-router-dom'
import { ArrowRightIcon, SparkIcon } from './Icons'

export function PageLoading({ label = '正在加载' }: { label?: string }) {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="page-loading__ring" aria-hidden="true" />
      <span className="page-loading__text">{label}</span>
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="course-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-card__cover shimmer" />
          <div className="skeleton-card__body">
            <span className="skeleton-line shimmer" style={{ width: '38%' }} />
            <span className="skeleton-line shimmer" style={{ width: '86%', height: 22 }} />
            <span className="skeleton-line shimmer" style={{ width: '70%' }} />
            <span className="skeleton-line shimmer" style={{ width: '46%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ArticleListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="article-row-skeleton" key={index}>
          <span className="skeleton-line shimmer" style={{ width: 54, height: 44 }} />
          <div>
            <span className="skeleton-line shimmer" style={{ width: '72%', height: 22 }} />
            <span className="skeleton-line shimmer" style={{ width: '52%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="state-box" role="alert">
      <SparkIcon size={30} />
      <h3>这一页暂时没有加载出来</h3>
      <p>{message || '请稍后再试，或者检查后端服务是否已启动。'}</p>
      {onRetry && (
        <button type="button" className="button button--outline" onClick={onRetry}>
          重新加载
          <ArrowRightIcon size={16} />
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title = '这里还没有内容',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="empty-state">
      <span className="empty-state__mark" aria-hidden="true">
        空
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && (
        <Link className="text-link" to={action.to}>
          {action.label}
          <ArrowRightIcon size={16} />
        </Link>
      )}
    </div>
  )
}
