import { useState } from 'react'
import { App as AntdApp, Button, Input, Space, Typography, Upload } from 'antd'
import type { UploadProps } from 'antd'
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { uploadMedia } from '@/api/upload'
import type { UploadMediaType } from '@/types'

interface MediaUploadProps {
  /** 由 Form.Item 注入的控件 id，用于关联 label */
  id?: string
  /** 由 Form.Item 注入的当前文件地址 */
  value?: string | null
  /** 由 Form.Item 注入的变更回调 */
  onChange?: (value: string) => void
  type: UploadMediaType
  disabled?: boolean
}

const ACCEPT: Record<UploadMediaType, string> = {
  image: '.jpg,.jpeg,.png,.gif,.webp,.bmp,.avif,image/*',
  video: '.mp4,.webm,.mov,.avi,.mkv,.mpeg,video/*',
}

/**
 * 图片 / 视频上传组件：文件经后台代理上传到阿里云 OSS，表单只保存返回的 URL
 * 兼容 Form.Item 的 value / onChange 受控用法，也允许手动填写外部文件地址
 */
export default function MediaUpload({ id, value: rawValue = '', onChange, type, disabled }: MediaUploadProps) {
  const { message } = AntdApp.useApp()
  const [uploading, setUploading] = useState(false)
  const [percent, setPercent] = useState(0)
  const value = rawValue ?? ''
  const label = type === 'image' ? '图片' : '视频'

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File
    setUploading(true)
    setPercent(0)
    try {
      const result = await uploadMedia(file, (progress) => {
        setPercent(progress)
        options.onProgress?.({ percent: progress })
      })
      onChange?.(result.url)
      message.success(`${label}上传成功`)
      options.onSuccess?.(result)
    } catch (error) {
      // 请求层已统一提示错误
      options.onError?.(error as Error)
    } finally {
      setUploading(false)
    }
  }

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const prefix = type === 'image' ? 'image/' : 'video/'
    // 个别文件浏览器拿不到 MIME，交给后端按扩展名兜底校验
    if (file.type && !file.type.startsWith(prefix)) {
      message.error(`请选择${label}文件`)
      return Upload.LIST_IGNORE
    }
    return true
  }

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        <Upload
          accept={ACCEPT[type]}
          showUploadList={false}
          disabled={disabled || uploading}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
        >
          <Button icon={<UploadOutlined />} loading={uploading} disabled={disabled}>
            {value ? `重新上传${label}` : `上传${label}`}
          </Button>
        </Upload>
        {uploading ? <Typography.Text type="secondary">已上传 {percent}%</Typography.Text> : null}
        {value && !uploading ? (
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => onChange?.('')} disabled={disabled}>
            移除
          </Button>
        ) : null}
      </Space>

      <Input
        id={id}
        value={value}
        placeholder={`上传后自动填入，也可直接粘贴${label}地址`}
        maxLength={500}
        allowClear
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value.trim())}
      />

      {value ? (
        <div
          style={{
            border: '1px solid var(--ant-color-border-secondary, rgba(5, 5, 5, 0.06))',
            borderRadius: 10,
            padding: 12,
          }}
        >
          {type === 'image' ? (
            <img
              src={value}
              alt="图片预览"
              style={{ display: 'block', maxWidth: '100%', maxHeight: 180, borderRadius: 8 }}
            />
          ) : (
            <video
              src={value}
              controls
              style={{ display: 'block', width: '100%', maxHeight: 260, borderRadius: 8, background: '#000' }}
            />
          )}
          <Typography.Link href={value} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8 }}>
            在新窗口打开
          </Typography.Link>
        </div>
      ) : null}
    </Space>
  )
}
