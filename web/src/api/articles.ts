import { http } from './request'
import type { Article, ListResult } from '@/types'

export interface ArticleQuery {
  page?: number
  pageSize?: number
  keyword?: string
  sort?: 'latest' | 'hot' | string
}

export function getArticles(params: ArticleQuery = {}) {
  return http.get<ListResult<Article>>('/articles', params)
}

export function getArticle(id: number | string) {
  return http.get<Article>(`/articles/${id}`)
}
