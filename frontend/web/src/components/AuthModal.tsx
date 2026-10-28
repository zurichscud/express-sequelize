import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSite } from '@/context/SiteContext'
import { getErrorMessage } from '@/api/request'
import { CloseIcon } from './Icons'
import { cx } from '@/utils/cx'

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, setAuthMode, login, register } = useAuth()
  const { site } = useSite()

  const [account, setAccount] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAuth()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [authOpen, closeAuth])

  useEffect(() => {
    setError(null)
  }, [authMode])

  if (!authOpen) return null

  function switchMode(mode: 'login' | 'register') {
    setAuthMode(mode)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)

    try {
      if (authMode === 'login') {
        await login({ account: account.trim(), password })
        setAccount('')
        setPassword('')
      } else {
        await register({
          email: email.trim(),
          username: username.trim(),
          password,
          nickname: nickname.trim() || undefined,
        })
        setEmail('')
        setUsername('')
        setNickname('')
        setPassword('')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const isLogin = authMode === 'login'

  return (
    <div
      className="auth-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAuth()
      }}
    >
      <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div className="auth-modal__brand">
          <div className="auth-modal__logo">
            <span aria-hidden="true">拾</span>
            {site.name}
          </div>
          <div>
            <p className="auth-modal__kicker">MEMBER ACCESS</p>
            <h2>
              登录后，
              <br />
              把学习继续下去。
            </h2>
            <p>点赞课程、保存学习记录，并随时更新自己的资料。</p>
          </div>
          <p className="auth-modal__quote">“知道并不等于会做，做过才算真的知道。”</p>
        </div>

        <div className="auth-modal__panel">
          <button type="button" className="auth-modal__close" aria-label="关闭登录窗口" onClick={closeAuth}>
            <CloseIcon size={20} />
          </button>

          <div className="auth-tabs" role="tablist" aria-label="登录或注册">
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              className={cx('auth-tabs__item', isLogin && 'is-active')}
              onClick={() => switchMode('login')}
            >
              登录
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              className={cx('auth-tabs__item', !isLogin && 'is-active')}
              onClick={() => switchMode('register')}
            >
              注册
            </button>
          </div>

          <h3 id="auth-modal-title">{isLogin ? '欢迎回来。' : '创建你的账号。'}</h3>
          <p className="auth-modal__sub">
            {isLogin ? '使用邮箱或用户名登录，继续上次的学习。' : '注册后可以点赞课程，并拥有自己的学习记录。'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isLogin ? (
              <label className="field">
                <span>邮箱或用户名</span>
                <input
                  type="text"
                  autoComplete="username"
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                />
              </label>
            ) : (
              <>
                <label className="field">
                  <span>邮箱</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    required
                    autoFocus
                  />
                </label>

                <label className="field">
                  <span>用户名</span>
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="仅限字母、数字、下划线和短横线"
                    pattern="[A-Za-z0-9_-]+"
                    maxLength={64}
                    required
                  />
                </label>
              </>
            )}

            <label className="field">
              <span>密码</span>
              <input
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="6-72 位"
                minLength={6}
                maxLength={72}
                required
              />
            </label>

            {!isLogin && (
              <label className="field">
                <span>
                  昵称 <em>选填</em>
                </span>
                <input
                  type="text"
                  autoComplete="nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="展示在课程与评论中"
                  maxLength={64}
                />
              </label>
            )}

            {error && (
              <p className="form-alert" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="button button--solid button--block" disabled={submitting}>
              {submitting ? '正在提交…' : isLogin ? '登录' : '注册并登录'}
            </button>
          </form>

          {isLogin ? (
            <p className="auth-modal__hint">
              演示账号：zhangsan@example.com <span>/</span> 123456
            </p>
          ) : (
            <p className="auth-modal__hint">注册即表示你同意本站的使用约定与隐私说明。</p>
          )}

          <p className="auth-modal__switch">
            {isLogin ? '还没有账号？' : '已经有账号了？'}
            <button type="button" onClick={() => switchMode(isLogin ? 'register' : 'login')}>
              {isLogin ? '去注册' : '去登录'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
