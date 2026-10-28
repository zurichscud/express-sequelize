import axios from 'axios'
import request from './request'
import type { ApiEnvelope } from './request'
import type { UploadPresign, UploadResult } from '@/types'
import { showError } from '@/utils/feedback'

/**
 * 申请 OSS 预签名直传地址
 * 服务端只负责校验类型、大小并签名，文件内容不经过 Express
 */
async function presignUpload(file: File) {
  const response = await request.post<ApiEnvelope<UploadPresign>>('/uploads/presign', {
    name: file.name,
    mime: file.type,
    size: file.size,
  })
  return response.data.data
}

/**
 * 用预签名地址把文件直传到 OSS
 * 必须携带签名时约定的 Content-Type，否则 OSS 会拒绝请求
 */
async function putToOss(presign: UploadPresign, file: File, onProgress?: (percent: number) => void) {
  try {
    await axios.put(presign.upload_url, file, {
      headers: presign.headers,
      // 视频文件较大，交给 OSS 和浏览器处理，这里不做超时中断
      timeout: 0,
      onUploadProgress: (event) => {
        if (!event.total) {
          return
        }
        const percent = Math.min(100, Math.round((event.loaded / event.total) * 100))
        onProgress?.(percent)
      },
    })
  } catch (error) {
    // 直传不经过统一请求实例，这里单独提示；常见原因是地址过期或 Bucket 未配置跨域规则
    showError('文件上传失败，请检查网络、上传地址是否过期或 OSS 跨域配置')
    throw error
  }
}

/**
 * 上传图片或视频：申请预签名地址 → 浏览器直传 OSS → 服务端确认入库
 * @param file 图片或视频文件
 * @param onProgress 上传进度回调（0-100）
 */
export async function uploadMedia(file: File, onProgress?: (percent: number) => void) {
  const presign = await presignUpload(file)
  await putToOss(presign, file, onProgress)

  const response = await request.post<ApiEnvelope<UploadResult>>('/uploads/complete', {
    upload_token: presign.upload_token,
  })
  return response.data.data
}
