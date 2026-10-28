import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSite } from '@/context/SiteContext'
import { useAuth } from '@/context/AuthContext'
import {
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  LogoutIcon,
  MenuIcon,
  UserIcon,
} from './Icons'
import { cx } from '@/utils/cx'

const NAV_ITEMS = [
  { to: '/', label: '首页', end: true },
  { to: '/courses', label: '课程', end: false },
  { to: '/articles', label: '文章', end: false },
]

export default function SiteHeader() {
  const { site } = useSite()
  const { user, openAuth, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const displayName = user?.nickname || user?.username || ''
  const initial = displayName.trim().charAt(0) || 'U'

  useEffect(() => {
    setOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [menuOpen])

  async function handleLogout() {
    setMenuOpen(false)
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label={`${site.name} 首页`}>
          <span className="brand__mark" aria-hidden="true">
            拾
          </span>
          <span className="brand__text">
            <strong>{site.name}</strong>
            <small>COURSES &amp; NOTES</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cx('site-nav__link', isActive && 'is-active')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button
                type="button"
                className="user-chip"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <span className="user-chip__avatar" aria-hidden="true">
                  {initial}
                </span>
                <span className="user-chip__name">{displayName}</span>
                <ChevronDownIcon size={14} />
              </button>

              {menuOpen && (
                <div className="user-dropdown" role="menu">
                  <div className="user-dropdown__head">
                    <strong>{displayName}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link to="/me/likes" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <HeartIcon size={16} />
                    我的点赞
                  </Link>
                  <Link to="/me" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <UserIcon size={16} />
                    账号设置
                  </Link>
                  <button type="button" role="menuitem" className="is-danger" onClick={handleLogout}>
                    <LogoutIcon size={16} />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button type="button" className="header-login" onClick={() => openAuth('login')}>
              登录 / 注册
            </button>
          )}

          <Link to="/courses" className="header-cta">
            开始学习
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={cx('mobile-nav', open && 'is-open')}>
        {user && (
          <div className="mobile-nav__account">
            <span className="user-chip__avatar" aria-hidden="true">
              {initial}
            </span>
            <div>
              <strong>{displayName}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        )}

        <nav className="mobile-nav__links" aria-label="移动端导航">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cx('mobile-nav__link', isActive && 'is-active')}
            >
              {item.label}
            </NavLink>
          ))}
          {user && (
            <>
              <NavLink to="/me/likes" className="mobile-nav__link">
                我的点赞
              </NavLink>
              <NavLink to="/me" className="mobile-nav__link">
                账号设置
              </NavLink>
            </>
          )}
        </nav>

        <div className="mobile-nav__actions">
          {user ? (
            <button type="button" className="button button--ghost" onClick={handleLogout}>
              退出登录
            </button>
          ) : (
            <button type="button" className="button button--ghost" onClick={() => openAuth('login')}>
              登录 / 注册
            </button>
          )}
          <Link to="/courses" className="button button--solid">
            浏览全部课程
          </Link>
        </div>
      </div>
    </header>
  )
}
