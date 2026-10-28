import { Link } from 'react-router-dom'
import { useSite } from '@/context/SiteContext'
import { ArrowUpIcon } from './Icons'

export default function SiteFooter() {
  const { site } = useSite()
  const year = new Date().getFullYear()
  const copyright = site.copyright || `© ${year} ${site.name}`

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <div className="site-footer__wordmark">
              <span aria-hidden="true">拾</span>
              {site.name}
            </div>
            <p>
              把技术学习拆成可以完成的章节，
              <br />
              把实践经验写成可以复用的文章。
            </p>
          </div>

          <div className="site-footer__col">
            <h4>浏览</h4>
            <Link to="/">首页</Link>
            <Link to="/courses">全部课程</Link>
            <Link to="/articles">实践笔记</Link>
          </div>

          <div className="site-footer__col">
            <h4>关于</h4>
            <p className="site-footer__note">一个持续更新的课程与文章示例站点，内容由后台管理系统维护。</p>
          </div>

          <button type="button" className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            回到顶部
            <ArrowUpIcon size={16} />
          </button>
        </div>

        <div className="site-footer__bottom">
          <span>{copyright}</span>
          <div className="site-footer__legal">
            {site.icp && <span>{site.icp}</span>}
            <span>Built with React</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
