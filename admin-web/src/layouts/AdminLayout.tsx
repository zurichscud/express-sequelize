import { useMemo, useState } from 'react'
import {
  App as AntdApp,
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  Switch,
  Tooltip,
  Typography,
  theme,
} from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  ReadOutlined,
  SettingOutlined,
  SunOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getAuthUser, logout } from '@/utils/auth'
import { useThemeMode } from '@/theme/ThemeProvider'

const { Header, Sider, Content, Footer } = Layout

const SIDER_WIDTH = 232
const SIDER_COLLAPSED_WIDTH = 80
const CURRENT_YEAR = new Date().getFullYear()

const MENU_ITEMS: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  {
    key: 'content',
    icon: <FileTextOutlined />,
    label: '内容管理',
    children: [
      { key: '/articles', label: '文章管理' },
      { key: '/categories', label: '分类管理' },
      { key: '/courses', label: '课程管理' },
    ],
  },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
]

const BREADCRUMBS: Record<string, string[]> = {
  '/dashboard': ['仪表盘'],
  '/articles': ['内容管理', '文章管理'],
  '/categories': ['内容管理', '分类管理'],
  '/courses': ['内容管理', '课程管理'],
  '/users': ['用户管理'],
  '/settings': ['系统设置'],
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { mode, toggle } = useThemeMode()
  const { token } = theme.useToken()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const user = getAuthUser()

  const selectedKey = useMemo(() => {
    const first = location.pathname.split('/')[1]
    return first ? `/${first}` : '/dashboard'
  }, [location.pathname])

  const breadcrumbItems = useMemo(
    () => [
      { title: <Link to="/dashboard">首页</Link> },
      ...(BREADCRUMBS[selectedKey] ?? []).map((title) => ({ title })),
    ],
    [selectedKey],
  )

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'account',
      disabled: true,
      label: (
        <div className="admin-user__meta" style={{ padding: '2px 0' }}>
          <strong>{user?.nickname ?? '管理员'}</strong>
          <span>{user?.username ?? 'admin'} · 管理员</span>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ]

  function handleUserMenu({ key }: { key: string }) {
    if (key === 'settings') {
      navigate('/settings')
      return
    }
    if (key === 'logout') {
      logout()
      message.success('已退出登录')
      navigate('/login', { replace: true })
    }
  }

  return (
    <Layout className="admin-layout">
      <Sider
        className="admin-sider"
        theme={mode}
        width={SIDER_WIDTH}
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        collapsed={collapsed}
        trigger={null}
        style={{
          background: token.colorBgContainer,
          borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          className={`admin-logo${collapsed ? ' admin-logo--collapsed' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <div className="admin-logo__mark">
            <ReadOutlined />
          </div>
          {!collapsed ? (
            <div className="admin-logo__text">
              <span>内容管理后台</span>
              <small>CONTENT ADMIN</small>
            </div>
          ) : null}
        </div>

        <Menu
          theme={mode}
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['content']}
          items={MENU_ITEMS}
          onClick={({ key }) => {
            if (key.startsWith('/')) navigate(key)
          }}
          style={{ background: 'transparent' }}
        />
      </Sider>

      <Layout
        className="admin-main"
        style={{ marginInlineStart: collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH }}
      >
        <Header
          className="admin-header"
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div className="admin-header__left">
            <Button
              type="text"
              className="admin-header__trigger"
              aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
            />
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="admin-header__right">
            <Tooltip title={mode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>
              <Switch
                checked={mode === 'dark'}
                onChange={toggle}
                aria-label={mode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
            </Tooltip>

            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} trigger={['click']}>
              <button type="button" className="admin-user" aria-label="账户菜单" aria-haspopup="menu">
                <Avatar
                  size={34}
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', fontWeight: 600 }}
                >
                  {(user?.nickname ?? 'A').charAt(0)}
                </Avatar>
                <div className="admin-user__meta">
                  <strong>{user?.nickname ?? '管理员'}</strong>
                  <span>{user?.username ?? 'admin'}</span>
                </div>
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>

        <Footer className="admin-footer">
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            © {CURRENT_YEAR} 内容管理后台 · Vite + React + Ant Design
          </Typography.Text>
        </Footer>
      </Layout>
    </Layout>
  )
}
