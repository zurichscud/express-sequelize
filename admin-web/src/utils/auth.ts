export interface AuthUser {
  username: string
  nickname: string
  role: 'admin'
}

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

// 演示账号：后端暂未提供登录接口，先在前端做本地校验
const DEMO_ACCOUNT = {
  username: 'admin',
  password: 'admin123',
}

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
  return Boolean(getToken())
}

export function login(username: string, password: string): AuthUser {
  if (username !== DEMO_ACCOUNT.username || password !== DEMO_ACCOUNT.password) {
    throw new Error('账号或密码错误')
  }

  const user: AuthUser = {
    username: DEMO_ACCOUNT.username,
    nickname: '系统管理员',
    role: 'admin',
  }

  localStorage.setItem(TOKEN_KEY, `demo-token-${Date.now()}`)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
