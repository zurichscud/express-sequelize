import { http } from './request'
import type { Article, ArticlePayload, ArticleQuery, PageResult } from '@/types'

export function getArticles(params: ArticleQuery = {}) {
  return http.get<PageResult<Article>>('/articles', params)
}

export function getArticle(id: number) {
  return http.get<Article>(`/articles/${id}`)
}

export function createArticle(payload: ArticlePayload) {
  return http.post<Article>('/articles', payload)
}

export function updateArticle(id: number, payload: Partial<ArticlePayload>) {
  return http.put<Article>(`/articles/${id}`, payload)
}

export function deleteArticle(id: number) {
  return http.delete<null>(`/articles/${id}`)
}
