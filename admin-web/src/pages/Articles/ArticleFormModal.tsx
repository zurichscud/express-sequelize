import { useState } from 'react'
import { App as AntdApp, Col, Form, Input, Modal, Row, Select } from 'antd'
import { createArticle, updateArticle } from '@/api/article'
import type { Article, ArticlePayload, ArticleStatus } from '@/types'

interface ArticleFormModalProps {
  article: Article | null
  onClose: () => void
  onSaved: () => void
}

interface ArticleFormValues {
  title: string
  summary?: string
  author?: string
  status: ArticleStatus
  content: string
}

export default function ArticleFormModal({ article, onClose, onSaved }: ArticleFormModalProps) {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<ArticleFormValues>()
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(article)

  async function handleFinish(values: ArticleFormValues) {
    setSaving(true)
    try {
      const payload: ArticlePayload = {
        title: values.title.trim(),
        content: values.content,
        // 传空字符串表示清空摘要，避免编辑时无法删除已有摘要
        summary: values.summary?.trim() ?? '',
        author: values.author?.trim() || '匿名',
        status: values.status,
      }

      if (article) {
        await updateArticle(article.id, payload)
        message.success('文章已更新')
      } else {
        await createArticle(payload)
        message.success('文章已创建')
      }
      onSaved()
    } catch {
      // 请求层已统一提示
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      title={isEdit ? '编辑文章' : '新建文章'}
      width={760}
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={saving}
      mask={{ closable: false }}
      destroyOnHidden
      onOk={() => form.submit()}
      onCancel={onClose}
    >
      <Form<ArticleFormValues>
        form={form}
        layout="vertical"
        style={{ marginTop: 20 }}
        initialValues={
          article
            ? {
                title: article.title,
                summary: article.summary ?? '',
                author: article.author,
                status: article.status,
                content: article.content ?? '',
              }
            : {
                title: '',
                summary: '',
                author: '匿名',
                status: 'published',
                content: '',
              }
        }
        onFinish={handleFinish}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[
            { required: true, message: '请输入文章标题' },
            { max: 200, message: '标题不能超过 200 个字符' },
          ]}
        >
          <Input placeholder="请输入文章标题" maxLength={200} showCount />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="author" label="作者" rules={[{ max: 64, message: '作者不能超过 64 个字符' }]}>
              <Input placeholder="留空则显示为匿名" maxLength={64} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select
                options={[
                  { value: 'published', label: '已发布' },
                  { value: 'draft', label: '草稿' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="summary"
          label="摘要"
          rules={[{ max: 500, message: '摘要不能超过 500 个字符' }]}
        >
          <Input.TextArea
            placeholder="用于列表展示的简要说明，可不填"
            maxLength={500}
            showCount
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>

        <Form.Item name="content" label="正文" rules={[{ required: true, message: '请输入文章正文' }]}>
          <Input.TextArea
            placeholder="请输入文章正文"
            autoSize={{ minRows: 10, maxRows: 18 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
