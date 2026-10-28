import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/Icons'
import { usePageTitle } from '@/context/SiteContext'

export default function NotFoundPage() {
  usePageTitle('页面不存在')

  return (
    <section className="notfound">
      <div className="container notfound__inner">
        <p className="section-kicker">
          <span>404</span>
          PAGE NOT FOUND
        </p>
        <h1>
          这一页
          <br />
          <em>还没写。</em>
        </h1>
        <p className="notfound__text">
          你访问的地址不存在，或者内容已经被移动。不如从课程目录重新开始。
        </p>
        <div className="notfound__actions">
          <Link to="/" className="button button--solid">
            <ArrowLeftIcon size={16} />
            回到首页
          </Link>
          <Link to="/courses" className="button button--ghost">
            浏览课程
            <ArrowRightIcon size={16} />
          </Link>
        </div>
        <span className="notfound__stamp" aria-hidden="true">
          404
        </span>
      </div>
    </section>
  )
}
