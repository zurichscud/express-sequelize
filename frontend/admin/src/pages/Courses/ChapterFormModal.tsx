import { useState } from 'react'
import { App as AntdApp, Col, Form, Input, InputNumber, Row } from 'antd'
import { createChapter, updateChapter } from '@/api/chapter'
import FormModal from '@/components/FormModal'
import MediaUpload from '@/components/MediaUpload'
import type { Chapter, ChapterPayload } from '@/types'

interface ChapterFormModalProps {
  courseId: number
  courseName: string
  chapter: Chapter | null
  defaultRank: number
  onClose: () => void
  onSaved: () => void
}

interface ChapterFormValues {
  title: string
  rank: number
  videoUrl?: string
  content?: string
}

export default function ChapterFormModal({
  courseId,
  courseName,
  chapter,
  defaultRank,
  onClose,
  onSaved,
}: ChapterFormModalProps) {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<ChapterFormValues>()
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(chapter)

  async function handleFinish(values: ChapterFormValues) {
    setSaving(true)
    try {
      const payload: ChapterPayload = {
        courseId,
        title: values.title.trim(),
        videoUrl: values.videoUrl?.trim() || '',
        content: values.content ?? '',
        rank: values.rank,
      }

      if (chapter) {
        await updateChapter(chapter.id, payload)
        message.success('章节已更新')
      } else {
        await createChapter(payload)
        message.success('章节已创建')
      }
      onSaved()
    } catch {
      // 请求层已统一提示
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormModal
      open
      title={isEdit ? '编辑章节' : '新建章节'}
      width={640}
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={saving}
      mask={{ closable: false }}
      destroyOnHidden
      onOk={() => form.submit()}
      onCancel={onClose}
    >
      <Form<ChapterFormValues>
        form={form}
        layout="vertical"
        style={{ marginTop: 20 }}
        initialValues={
          chapter
            ? {
                title: chapter.title,
                rank: chapter.rank,
                videoUrl: chapter.videoUrl ?? '',
                content: chapter.content ?? '',
              }
            : {
                title: '',
                rank: defaultRank,
                videoUrl: '',
                content: '',
              }
        }
        onFinish={handleFinish}
      >
        <Form.Item label="所属课程">
          <Input value={courseName} disabled />
        </Form.Item>

        <Form.Item
          name="title"
          label="章节标题"
          rules={[
            { required: true, whitespace: true, message: '请输入章节标题' },
            { max: 200, message: '章节标题不能超过 200 个字符' },
          ]}
        >
          <Input placeholder="请输入章节标题" maxLength={200} showCount />
        </Form.Item>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="rank"
              label="排序"
              extra="越小越靠前"
              rules={[{ required: true, message: '请输入排序序号' }]}
            >
              <InputNumber precision={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="videoUrl"
          label="章节视频"
          rules={[{ max: 500, message: '视频地址不能超过 500 个字符' }]}
        >
          <MediaUpload type="video" />
        </Form.Item>

        <Form.Item name="content" label="章节内容">
          <Input.TextArea placeholder="请输入章节内容" autoSize={{ minRows: 5, maxRows: 10 }} />
        </Form.Item>
      </Form>
    </FormModal>
  )
}
