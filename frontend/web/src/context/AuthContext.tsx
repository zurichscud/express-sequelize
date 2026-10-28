import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '@/api/auth'
import type { AuthResult, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'
import { clearAuth, getStoredUser, getToken, setStoredUser, setToken } from '@/utils/authStorage'

export type AuthMode = 'login' | 'register'

interface AuthContextValue {
  user: AuthUser | null
  ready: boolean
  authOpen: boolean
  authMode: AuthMode
  openAuth: (mode?: AuthMode) => void
  closeAuth: () => void
  setAuthMode: (mode: AuthMode) => void
  login: (payload: LoginPayload) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  logout: () => Promise<void>
  updateProfile: (data: { nickname?: string; sex?: AuthUser['sex'] }) => Promise<AuthUser>
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function persistAuth(result: AuthResult) {
  setToken(result.token)
  setStoredUser(result.user)
  return result.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser<AuthUser>())
  const [ready, setReady] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  // 有本地 token 时用 /auth/me 校验并刷新用户资料
  useEffect(() => {
    let active = true
    if (!getToken()) {
      setReady(true)
      return
    }

    authApi
      .getMe()
      .then((profile) => {
        if (!active) return
        setUser(profile)
        setStoredUser(profile)
      })
      .catch(() => {
        if (!active) return
        clearAuth()
        setUser(null)
      })
      .finally(() => {
        if (active) setReady(true)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setAuthOpen(false)
    }
    window.addEventListener('web:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('web:unauthorized', handleUnauthorized)
  }, [])

  const openAuth = useCallback((mode: AuthMode = 'login') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }, [])

  const closeAuth = useCallback(() => setAuthOpen(false), [])

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authApi.login(payload)
    const nextUser = persistAuth(result)
    setUser(nextUser)
    setAuthOpen(false)
    return nextUser
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authApi.register(payload)
    const nextUser = persistAuth(result)
    setUser(nextUser)
    setAuthOpen(false)
    return nextUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // 退出登录以本地清理为准，服务端异常不阻塞
    }
    clearAuth()
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    async (data: { nickname?: string; sex?: AuthUser['sex'] }) => {
      const profile = await authApi.updateProfile(data)
      setUser(profile)
      setStoredUser(profile)
      return profile
    },
    [],
  )

  const changePassword = useCallback(async (data: { oldPassword: string; newPassword: string }) => {
    await authApi.changePassword(data)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      authOpen,
      authMode,
      openAuth,
      closeAuth,
      setAuthMode,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [
      user,
      ready,
      authOpen,
      authMode,
      openAuth,
      closeAuth,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  return context
}
