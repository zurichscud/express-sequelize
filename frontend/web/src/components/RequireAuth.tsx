import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PageLoading } from './States'
import { ArrowRightIcon } from './Icons'

/** 需要前台登录态的页面：未登录时展示登录引导，不强制跳转 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready, openAuth } = useAuth()

  if (!ready) {
    return (
      <div className="container page-loading-wrap">
        <PageLoading label="正在确认登录状态" />
      </div>
    )
  }

  if (!user) {
    return (
      <section className="member-gate">
        <div className="container member-gate__inner">
          <p className="section-kicker">
            <span>MEMBERS</span>
            MEMBER AREA
          </p>
          <h1>
            先登录，
            <br />
            <em>再继续。</em>
          </h1>
          <p className="member-gate__text">
            登录后可以点赞课程、查看自己的点赞记录，并管理公开资料与登录密码。
          </p>
          <div className="member-gate__actions">
            <button type="button" className="button button--solid" onClick={() => openAuth('login')}>
              登录 / 注册
              <ArrowRightIcon size={17} />
            </button>
            <Link to="/courses" className="button button--ghost">
              先逛逛课程
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return <>{children}</>
}
