import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function SiteLayout() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // 路由切换时立即回到顶部，避免受 CSS smooth 影响停留在上一页的滚动位置
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    root.style.scrollBehavior = previous
  }, [pathname])

  // 切换页码时也回到列表顶部，避免停留在页面底部
  useEffect(() => {
    if (new URLSearchParams(search).has('page')) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [search])

  return (
    <div className="site">
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <SiteHeader />
      <main id="main" className="site-main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
