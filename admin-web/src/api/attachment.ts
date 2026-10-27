import { http } from './request'
import type { Attachment, AttachmentQuery, PageResult } from '@/types'

export function getAttachments(params: AttachmentQuery = {}) {
  return http.get<PageResult<Attachment>>('/attachments', params)
}

export function deleteAttachment(id: number) {
  return http.delete<null>(`/attachments/${id}`)
}
