import { useEffect, useState } from 'react'
import { App as AntdApp, Button, Card, Form, Input, Spin, Typography } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import PageContainer from '@/components/PageContainer'
import { getSettings, updateSettings } from '@/api/setting'

interface SettingsFormValues {
  name: string
  icp?: string
  copyright?: string
}

export default function SettingsPage() {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<SettingsFormValues>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const setting = await getSettings()
        if (!cancelled) {
          form.setFieldsValue({
            name: setting.name,
            icp: setting.icp ?? '',
            copyright: setting.copyright ?? '',
          })
        }
      } catch {
        // 请求层已统一提示
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [form])

  async function handleFinish(values: SettingsFormValues) {
    setSaving(true)
    try {
      await updateSettings({
        name: values.name.trim(),
        icp: values.icp?.trim() || '',
        copyright: values.copyright?.trim() || '',
      })
      message.success('站点设置已保存')
    } catch {
      // 请求层已统一提示
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer title="系统设置" description="配置站点名称、备案信息与页脚版权">
      <Card className="settings-card">
        <Spin spinning={loading}>
          <div className="settings-header">
            <Typography.Title level={5} style={{ margin: 0 }}>
              基础信息
            </Typography.Title>
            <Typography.Text type="secondary">
              以下信息用于前台页面展示，修改后即时生效
            </Typography.Text>
          </div>

          <Form<SettingsFormValues>
            form={form}
            layout="vertical"
            requiredMark="optional"
            onFinish={handleFinish}
            style={{ marginTop: 24 }}
          >
            <Form.Item
              name="name"
              label="站点名称"
              rules={[
                { required: true, message: '请输入站点名称' },
                { max: 100, message: '站点名称不能超过 100 个字符' },
              ]}
            >
              <Input placeholder="请输入站点名称" maxLength={100} showCount />
            </Form.Item>

            <Form.Item
              name="icp"
              label="ICP 备案号"
              rules={[{ max: 64, message: '备案号不能超过 64 个字符' }]}
            >
              <Input placeholder="例如：京ICP备00000000号" maxLength={64} />
            </Form.Item>

            <Form.Item
              name="copyright"
              label="版权信息"
              rules={[{ max: 200, message: '版权信息不能超过 200 个字符' }]}
            >
              <Input placeholder="例如：© 2026 内容管理后台" maxLength={200} showCount />
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              保存设置
            </Button>
          </Form>
        </Spin>
      </Card>
    </PageContainer>
  )
}
