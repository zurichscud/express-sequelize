import request from './request'
import type { ApiEnvelope } from './request'
import type { UploadResult } from '@/types'

/**
 * 通过后台接口把文件代理上传到阿里云 OSS
 * @param file 图片或视频文件
 * @param onProgress 上传进度回调（0-100）
 */
export function uploadMedia(file: File, onProgress?: (percent: number) => void) {
  const formData = new FormData()
  formData.append('file', file)

  return request
    .post<ApiEnvelope<UploadResult>>('/uploads', formData, {
      // 视频文件较大，交给后端限制大小，这里不做超时中断
      timeout: 0,
      onUploadProgress: (event) => {
        if (!event.total) {
          return
        }
        const percent = Math.min(100, Math.round((event.loaded / event.total) * 100))
        onProgress?.(percent)
      },
    })
    .then((response) => response.data.data)
}
