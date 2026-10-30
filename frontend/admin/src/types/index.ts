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

/** 系统用户（sys_users），后台登录账号 */
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

/** 前台用户（app_users），Web 注册账号 */
export interface AppUser {
  id: number
  email: string
  username: string
  nickname: string | null
  sex: Sex
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

export interface AppUserQuery {
  page?: number
  pageSize?: number
  keyword?: string
  sex?: Sex | ''
}

export interface AppUserPayload {
  email: string
  username: string
  nickname?: string
  password?: string
  sex: Sex
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
  categoryId: number
  userId: number
  name: string
  image: string | null
  isRecommended: boolean
  likeCount: number
  chapterCount: number
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
  categoryId?: number
  userId?: number
  isRecommended?: 'true' | 'false' | ''
}

export interface CoursePayload {
  name: string
  categoryId: number
  userId?: number
  image?: string
  isRecommended: boolean
  likeCount: number
  content?: string
}

export interface ChapterCourseRef {
  id: number
  name: string
}

export interface Chapter {
  id: number
  courseId: number
  title: string
  videoUrl: string | null
  rank: number
  createdAt: string
  updatedAt: string
  content?: string
  course?: ChapterCourseRef
}

export interface ChapterQuery {
  page?: number
  pageSize?: number
  courseId?: number
  keyword?: string
}

export interface ChapterPayload {
  courseId: number
  title: string
  content?: string
  videoUrl?: string
  rank: number
}

export interface SiteSetting {
  id: number
  name: string
  icp: string | null
  copyright: string | null
}

export type UploadMediaType = 'image' | 'video'

/** 服务端签发的 OSS 直传凭证 */
export interface UploadPresign {
  uploadUrl: string
  method: 'PUT'
  headers: Record<string, string>
  uploadToken: string
  meta: {
    objectKey: string
    name: string
    type: UploadMediaType
    mimeType: string
    size: number
  }
}

export interface UploadResult {
  id: number
  userId: number | null
  name: string
  objectKey: string
  url: string
  type: UploadMediaType
  mimeType: string
  size: number
  createdAt: string
  updatedAt: string
}

export interface AttachmentUploader {
  id: number
  username: string
  nickname: string | null
}

export interface Attachment {
  id: number
  userId: number | null
  name: string
  objectKey: string
  url: string
  type: UploadMediaType
  mimeType: string
  size: number
  createdAt: string
  updatedAt: string
  user?: AttachmentUploader | null
}

export interface AttachmentQuery {
  page?: number
  pageSize?: number
  keyword?: string
  type?: UploadMediaType | ''
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
