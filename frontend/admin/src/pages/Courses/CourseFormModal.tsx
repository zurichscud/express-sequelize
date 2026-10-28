import { useState } from 'react'
import { App as AntdApp, Col, Form, Input, InputNumber, Row, Select, Switch, Typography } from 'antd'
import { createCourse, updateCourse } from '@/api/course'
import FormModal from '@/components/FormModal'
import MediaUpload from '@/components/MediaUpload'
import type { AppUser, Category, Course, CoursePayload } from '@/types'

interface CourseFormModalProps {
  course: Course | null
  categories: Category[]
  users: AppUser[]
  onClose: () => void
  onSaved: () => void
}

interface CourseFormValues {
  name: string
  category_id?: number
  user_id?: number
  image?: string
  is_recommended: boolean
  like_count: number
  content?: string
}

export default function CourseFormModal({
  course,
  categories,
  users,
  onClose,
  onSaved,
}: CourseFormModalProps) {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<CourseFormValues>()
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(course)

  const categoryOptions = categories.map((item) => ({ value: item.id, label: item.name }))
  const userOptions = users.map((item) => ({
    value: item.id,
    label: item.nickname ? `${item.nickname}（${item.username}）` : item.username,
  }))

  async function handleFinish(values: CourseFormValues) {
    setSaving(true)
    try {
      const payload: CoursePayload = {
        name: values.name.trim(),
        category_id: values.category_id!,
        image: values.image?.trim() || '',
        is_recommended: values.is_recommended,
        like_count: values.like_count,
        content: values.content ?? '',
      }

      if (course) {
        await updateCourse(course.id, payload)
        message.success('课程已更新')
      } else {
        await createCourse({ ...payload, user_id: values.user_id! })
        message.success('课程已创建')
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
      title={isEdit ? '编辑课程' : '新建课程'}
      width={720}
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={saving}
      mask={{ closable: false }}
      destroyOnHidden
      onOk={() => form.submit()}
      onCancel={onClose}
    >
      <Form<CourseFormValues>
        form={form}
        layout="vertical"
        style={{ marginTop: 20 }}
        initialValues={
          course
            ? {
                name: course.name,
                category_id: course.category_id,
                user_id: course.user_id,
                image: course.image ?? '',
                is_recommended: course.is_recommended,
                like_count: course.like_count,
                content: course.content ?? '',
              }
            : {
                name: '',
                is_recommended: false,
                like_count: 0,
                content: '',
              }
        }
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          label="课程名称"
          rules={[
            { required: true, message: '请输入课程名称' },
            { max: 128, message: '课程名称不能超过 128 个字符' },
          ]}
        >
          <Input placeholder="请输入课程名称" maxLength={128} showCount />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category_id"
              label="所属分类"
              rules={[{ required: true, message: '请选择所属分类' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="请选择分类"
                options={categoryOptions}
                notFoundContent="暂无分类，请先创建分类"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="user_id"
              label="所属用户"
              extra={isEdit ? '课程创建后不支持变更所属用户' : undefined}
              rules={[{ required: !isEdit, message: '请选择所属用户' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="请选择用户"
                options={userOptions}
                disabled={isEdit}
                notFoundContent="暂无用户"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="image"
          label="封面图片"
          rules={[{ max: 500, message: '图片地址不能超过 500 个字符' }]}
        >
          <MediaUpload type="image" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="like_count" label="点赞数" rules={[{ required: true }]}>
              <InputNumber min={0} precision={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_recommended" label="推荐课程" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          章节总数由「章节管理」根据实际章节自动统计。
        </Typography.Text>

        <Form.Item name="content" label="课程内容">
          <Input.TextArea placeholder="请输入课程简介或内容" autoSize={{ minRows: 4, maxRows: 10 }} />
        </Form.Item>
      </Form>
    </FormModal>
  )
}
