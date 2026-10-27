import { useState } from 'react'
import { App as AntdApp, Col, Form, Input, Modal, Row, Select } from 'antd'
import { createUser, updateUser } from '@/api/user'
import type { Role, Sex, User, UserPayload } from '@/types'

interface UserFormModalProps {
  user: User | null
  onClose: () => void
  onSaved: () => void
}

interface UserFormValues {
  email: string
  username: string
  nickname?: string
  password?: string
  sex: Sex
  role: Role
}

export default function UserFormModal({ user, onClose, onSaved }: UserFormModalProps) {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<UserFormValues>()
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(user)

  async function handleFinish(values: UserFormValues) {
    setSaving(true)
    try {
      const payload: UserPayload = {
        email: values.email.trim(),
        username: values.username.trim(),
        nickname: values.nickname?.trim() || '',
        sex: values.sex,
        role: values.role,
      }

      if (values.password) {
        payload.password = values.password
      }

      if (user) {
        await updateUser(user.id, payload)
        message.success('用户已更新')
      } else {
        await createUser({ ...payload, password: values.password! })
        message.success('用户已创建')
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
      title={isEdit ? '编辑用户' : '新建用户'}
      width={620}
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={saving}
      mask={{ closable: false }}
      destroyOnHidden
      onOk={() => form.submit()}
      onCancel={onClose}
    >
      <Form<UserFormValues>
        form={form}
        layout="vertical"
        style={{ marginTop: 20 }}
        initialValues={
          user
            ? {
                email: user.email,
                username: user.username,
                nickname: user.nickname ?? '',
                password: '',
                sex: user.sex,
                role: user.role,
              }
            : {
                email: '',
                username: '',
                nickname: '',
                password: '',
                sex: 'unknown',
                role: 'user',
              }
        }
        onFinish={handleFinish}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
                { max: 128, message: '邮箱不能超过 128 个字符' },
              ]}
            >
              <Input placeholder="name@example.com" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { pattern: /^[A-Za-z0-9_-]+$/, message: '只能包含字母、数字、下划线和短横线' },
                { max: 64, message: '用户名不能超过 64 个字符' },
              ]}
            >
              <Input placeholder="仅限字母、数字、_ 和 -" autoComplete="off" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ max: 64, message: '昵称不能超过 64 个字符' }]}
            >
              <Input placeholder="选填，用于界面展示" maxLength={64} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="password"
              label={isEdit ? '重置密码' : '密码'}
              extra={isEdit ? '留空表示不修改密码' : '长度 6-72 位'}
              rules={[
                { required: !isEdit, message: '请输入密码' },
                {
                  validator: (_, value?: string) => {
                    if (!value) return Promise.resolve()
                    if (value.length < 6 || value.length > 72) {
                      return Promise.reject(new Error('密码长度需在 6-72 位之间'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input.Password
                placeholder={isEdit ? '留空则不修改' : '请输入密码'}
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sex"
              label="性别"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Select
                options={[
                  { value: 'male', label: '男' },
                  { value: 'female', label: '女' },
                  { value: 'unknown', label: '未知' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select
                options={[
                  { value: 'admin', label: '管理员' },
                  { value: 'user', label: '普通用户' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
