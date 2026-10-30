/** 后端统一分页结构 */
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ListResult<T> {
  list: T[]
  pagination: Pagination
}

export interface Category {
  id: number
  name: string
  rank: number
  createdAt?: string
  updatedAt?: string
}

export interface CourseUser {
  id: number
  username: string
  nickname: string | null
}

export interface Chapter {
  id: number
  courseId: number
  title: string
  videoUrl: string | null
  rank: number
  content?: string | null
  course?: {
    id: number
    name: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface Course {
  id: number
  categoryId: number
  userId: number
  name: string
  image: string | null
  isRecommended: boolean
  content?: string | null
  likeCount: number
  chapterCount: number
  category?: Category | null
  user?: CourseUser | null
  chapters?: Chapter[]
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: number
  title: string
  summary: string | null
  content?: string
  author: string
  status: 'draft' | 'published'
  views: number
  createdAt: string
  updatedAt: string
}

export interface Setting {
  id: number
  name: string
  icp: string | null
  copyright: string | null
}

/** 站点设置读取失败时使用的兜底信息 */
export interface SiteInfo {
  name: string
  icp: string
  copyright: string
}
