import { useState } from 'react'
import { App as AntdApp, Button, Form, Input, Typography, theme } from 'antd'
import {
  LockOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { isAuthenticated, saveSession } from '@/utils/auth'

interface LoginFormValues {
  username: string
  password: string
}

const CURRENT_YEAR = new Date().getFullYear()

export default function LoginPage() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from

  if (isAuthenticated()) {
    return <Navigate to={from && from !== '/login' ? from : '/dashboard'} replace />
  }

  async function handleFinish(values: LoginFormValues) {
    setLoading(true)
    try {
      const result = await login({
        account: values.username.trim(),
        password: values.password,
      })
      saveSession(result.token, result.user)
      message.success('登录成功')
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true })
    } catch {
      // 请求层已统一提示错误信息
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" style={{ background: token.colorBgLayout }}>
      <aside className="login-brand">
        <div className="login-brand__logo">
          <span className="login-brand__mark">
            <ReadOutlined />
          </span>
          内容管理后台
        </div>

        <div className="login-brand__body">
          <Typography.Title level={1} className="login-brand__title">
            让内容运营
            <br />
            更专注、更高效
          </Typography.Title>
          <Typography.Paragraph className="login-brand__desc">
            文章、课程、分类与用户数据集中管理，一处编辑，全站生效。
          </Typography.Paragraph>
          <ul className="login-brand__features">
            <li>
              <ThunderboltOutlined /> 开箱即用的中后台布局
            </li>
            <li>
              <SafetyCertificateOutlined /> 统一请求层与错误提示
            </li>
            <li>
              <ReadOutlined /> 文章 / 课程 / 用户全量管理
            </li>
          </ul>
        </div>

        <div className="login-brand__footer">Vite · React · Ant Design</div>
      </aside>

      <main className="login-main">
        <div
          className="login-card"
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Typography.Title level={2} style={{ marginBottom: 6 }}>
            欢迎回来
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 28 }}>
            登录后进入内容管理后台
          </Typography.Paragraph>

          <Form<LoginFormValues>
            layout="vertical"
            size="large"
            initialValues={{ username: 'admin', password: '123456' }}
            onFinish={handleFinish}
          >
            <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
              <Input prefix={<UserOutlined />} placeholder="请输入账号" autoComplete="username" />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 8 }}>
              登录
            </Button>
          </Form>

          <div className="login-hint">演示账号：admin / 123456</div>
        </div>

        <div className="login-main__footer">
          © {CURRENT_YEAR} 内容管理后台
        </div>
      </main>
    </div>
  )
}
