export interface AuthUser {
  id: number
  email: string
  username: string
  nickname: string | null
  sex: 0 | 1 | 2
  role: 0 | 1
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
  sex?: 0 | 1 | 2
}
