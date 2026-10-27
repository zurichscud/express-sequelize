export type UserRole = 'user' | 'admin'
export type UserSex = 'unknown' | 'male' | 'female'

export interface AuthUser {
  id: number
  email: string
  username: string
  nickname: string | null
  sex: UserSex
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isAuthenticated() {
  const token = getToken()
  // 兼容旧版本本地演示 token：发现后直接清理，强制走真实登录
  if (!token || token.startsWith('demo-token-')) {
    if (token) logout()
    return false
  }
  return true
}

/** 保存登录接口返回的 JWT 与用户信息 */
export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
