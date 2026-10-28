import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import RequireAuth from '@/components/RequireAuth'
import { getErrorMessage } from '@/api/request'
import { useAuth } from '@/context/AuthContext'
import { usePageTitle } from '@/context/SiteContext'
import { formatDate } from '@/utils/format'
import { ArrowRightIcon, HeartIcon, UserIcon } from '@/components/Icons'
import { cx } from '@/utils/cx'
import type { AuthUser } from '@/types/auth'

const SEX_OPTIONS: Array<{ value: AuthUser['sex']; label: string }> = [
  { value: 'unknown', label: '不公开' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
]

export default function ProfilePage() {
  usePageTitle('账号设置')

  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  )
}

function ProfileContent() {
  const { user, updateProfile, changePassword } = useAuth()

  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [sex, setSex] = useState<AuthUser['sex']>(user?.sex ?? 'unknown')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileNote, setProfileNote] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordNote, setPasswordNote] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!user) return
    setNickname(user.nickname ?? '')
    setSex(user.sex)
  }, [user])

  if (!user) return null

  const initial = (user.nickname || user.username).trim().charAt(0) || 'U'

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (profileSaving) return
    setProfileSaving(true)
    setProfileNote(null)

    try {
      await updateProfile({ nickname: nickname.trim(), sex })
      setProfileNote({ type: 'success', text: '资料已保存。' })
    } catch (err) {
      setProfileNote({ type: 'error', text: getErrorMessage(err) })
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (passwordSaving) return

    if (newPassword !== confirmPassword) {
      setPasswordNote({ type: 'error', text: '两次输入的新密码不一致。' })
      return
    }

    setPasswordSaving(true)
    setPasswordNote(null)

    try {
      await changePassword({ oldPassword, newPassword })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordNote({ type: 'success', text: '密码已更新。' })
    } catch (err) {
      setPasswordNote({ type: 'error', text: getErrorMessage(err) })
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <p className="section-kicker">
              <span>ME</span>
              ACCOUNT SETTINGS
            </p>
            <h1>账号设置</h1>
          </div>
          <p className="page-hero__note">
            管理你的公开资料与登录密码。
            <br />
            邮箱和用户名注册后不可修改。
          </p>
        </div>
      </section>

      <section className="section section--catalog">
        <div className="container profile-layout">
          <aside className="profile-card">
            <div className="profile-avatar" aria-hidden="true">
              {initial}
            </div>
            <h2>{user.nickname || user.username}</h2>
            <p className="profile-card__email">{user.email}</p>

            <dl className="profile-card__meta">
              <div>
                <dt>用户名</dt>
                <dd>{user.username}</dd>
              </div>
              <div>
                <dt>角色</dt>
                <dd>{user.role === 'admin' ? '管理员' : '学习者'}</dd>
              </div>
              <div>
                <dt>注册时间</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            </dl>

            <div className="profile-card__links">
              <Link to="/me/likes">
                <HeartIcon size={15} />
                我的点赞
              </Link>
              <Link to="/courses">
                <UserIcon size={15} />
                继续学习
              </Link>
            </div>
          </aside>

          <div className="profile-main">
            <section className="form-card">
              <header className="form-card__head">
                <span>01</span>
                <h2>个人资料</h2>
                <p>展示在课程与站点中</p>
              </header>

              <form onSubmit={handleProfileSubmit}>
                <div className="form-grid">
                  <label className="field">
                    <span>邮箱</span>
                    <input type="email" value={user.email} disabled />
                  </label>

                  <label className="field">
                    <span>用户名</span>
                    <input type="text" value={user.username} disabled />
                  </label>

                  <label className="field">
                    <span>昵称</span>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      placeholder="展示在课程与站点中"
                      maxLength={64}
                    />
                  </label>

                  <div className="field">
                    <span>性别</span>
                    <div className="field__segmented" role="group" aria-label="性别">
                      {SEX_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={cx(sex === option.value && 'is-active')}
                          aria-pressed={sex === option.value}
                          onClick={() => setSex(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="button button--solid" disabled={profileSaving}>
                    {profileSaving ? '正在保存…' : '保存资料'}
                    <ArrowRightIcon size={16} />
                  </button>
                  {profileNote && (
                    <p className={cx('form-note', profileNote.type === 'success' ? 'is-success' : 'is-error')}>
                      {profileNote.text}
                    </p>
                  )}
                </div>
              </form>
            </section>

            <section className="form-card">
              <header className="form-card__head">
                <span>02</span>
                <h2>修改密码</h2>
                <p>建议定期更换</p>
              </header>

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-grid">
                  <label className="field form-grid__full">
                    <span>原密码</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={oldPassword}
                      onChange={(event) => setOldPassword(event.target.value)}
                      placeholder="输入当前密码"
                      required
                    />
                  </label>

                  <label className="field">
                    <span>新密码</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="6-72 位"
                      minLength={6}
                      maxLength={72}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>确认新密码</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="再次输入新密码"
                      minLength={6}
                      maxLength={72}
                      required
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="button button--outline" disabled={passwordSaving}>
                    {passwordSaving ? '正在更新…' : '更新密码'}
                    <ArrowRightIcon size={16} />
                  </button>
                  {passwordNote && (
                    <p className={cx('form-note', passwordNote.type === 'success' ? 'is-success' : 'is-error')}>
                      {passwordNote.text}
                    </p>
                  )}
                </div>
              </form>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}
