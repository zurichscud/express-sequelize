export interface AuthUser {
  id: number
  email: string
  username: string
  nickname: string | null
  sex: 'unknown' | 'male' | 'female'
  role: 'user' | 'admin'
  createdAt?: string
  updatedAt?: string
}

export interface AuthResult {
  token: string
  tokenType: string
  expiresIn: number
  expiresAt: string
  user: AuthUser
}

export interface LikeStatus {
  liked: boolean
  likeCount: number
}

export interface LoginPayload {
  account: string
  password: string
}

export interface RegisterPayload {
  email: string
  username: string
  password: string
  nickname?: string
  sex?: 'unknown' | 'male' | 'female'
}
