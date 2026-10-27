export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PageResult<T> {
  list: T[]
  pagination: Pagination
}

export type ArticleStatus = 'draft' | 'published'

export interface Article {
  id: number
  title: string
  summary: string | null
  author: string
  status: ArticleStatus
  views: number
  createdAt: string
  updatedAt: string
  content?: string
}

export interface ArticleQuery {
  page?: number
  pageSize?: number
  title?: string
  keyword?: string
  status?: ArticleStatus | ''
}

export interface ArticlePayload {
  title: string
  content: string
  summary?: string
  author?: string
  status: ArticleStatus
}

export interface Category {
  id: number
  name: string
  rank: number
  createdAt: string
  updatedAt: string
}

export interface CategoryPayload {
  name: string
  rank: number
}

export type Sex = 'unknown' | 'male' | 'female'
export type Role = 'user' | 'admin'

export interface User {
  id: number
  email: string
  username: string
  nickname: string | null
  sex: Sex
  role: Role
  createdAt: string
  updatedAt: string
}

export interface UserQuery {
  page?: number
  pageSize?: number
  keyword?: string
  sex?: Sex | ''
  role?: Role | ''
}

export interface UserPayload {
  email: string
  username: string
  nickname?: string
  password?: string
  sex: Sex
  role: Role
}

export interface CourseRef {
  id: number
  name: string
  rank: number
}

export interface CourseUserRef {
  id: number
  username: string
  nickname: string | null
}

export interface Course {
  id: number
  category_id: number
  user_id: number
  name: string
  image: string | null
  is_recommended: boolean
  like_count: number
  chapter_count: number
  createdAt: string
  updatedAt: string
  content?: string
  category?: CourseRef
  user?: CourseUserRef
}

export interface CourseQuery {
  page?: number
  pageSize?: number
  keyword?: string
  category_id?: number
  user_id?: number
  is_recommended?: 'true' | 'false' | ''
}

export interface CoursePayload {
  name: string
  category_id: number
  user_id?: number
  image?: string
  is_recommended: boolean
  like_count: number
  chapter_count: number
  content?: string
}

export interface SiteSetting {
  id: number
  name: string
  icp: string | null
  copyright: string | null
}

export interface GenderChartData {
  total: number
  list: {
    sex: Sex
    count: number
    percent: number
  }[]
}

export interface MonthlyUsersData {
  year: number | null
  total: number
  list: {
    month: string
    count: number
  }[]
}
