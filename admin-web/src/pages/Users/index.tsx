import { useEffect, useState } from 'react'
import {
  App as AntdApp,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { TableProps } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import PageContainer from '@/components/PageContainer'
import UserFormModal from './UserFormModal'
import { deleteUser, getUsers } from '@/api/user'
import type { PageResult, Role, Sex, User } from '@/types'
import { formatDateTime } from '@/utils/format'

interface SearchValues {
  keyword?: string
  role?: Role
  sex?: Sex
}

const SEX_LABELS: Record<Sex, string> = {
  male: '男',
  female: '女',
  unknown: '未知',
}

const ROLE_LABELS: Record<Role, string> = {
  admin: '管理员',
  user: '普通用户',
}

export default function UsersPage() {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<SearchValues>()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [query, setQuery] = useState<SearchValues>({})
  const [refreshKey, setRefreshKey] = useState(0)

  const [data, setData] = useState<PageResult<User> | null>(null)
  const [loading, setLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const result = await getUsers({ page, pageSize, ...query })
        if (!cancelled) setData(result)
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
  }, [page, pageSize, query, refreshKey])

  function handleSearch(values: SearchValues) {
    setPage(1)
    setQuery({
      keyword: values.keyword?.trim() || undefined,
      role: values.role || undefined,
      sex: values.sex || undefined,
    })
  }

  function handleReset() {
    form.resetFields()
    setPage(1)
    setQuery({})
  }

  async function handleDelete(record: User) {
    try {
      await deleteUser(record.id)
      message.success('用户已删除')
      if (data && data.list.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        setRefreshKey((key) => key + 1)
      }
    } catch {
      // 请求层已统一提示
    }
  }

  const columns: TableProps<User>['columns'] = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <div className="user-cell">
          <Avatar
            size={38}
            style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', flexShrink: 0 }}
          >
            {(record.nickname || record.username).charAt(0).toUpperCase()}
          </Avatar>
          <div className="cell-title">
            <Typography.Text strong>
              {record.nickname || record.username}
            </Typography.Text>
            <span className="cell-title__sub">@{record.username}</span>
          </div>
        </div>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      key: 'sex',
      width: 90,
      render: (sex: Sex) => SEX_LABELS[sex],
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 110,
      render: (role: Role) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'}>{ROLE_LABELS[role]}</Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditingUser(record)
              setFormOpen(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除用户"
            description={`确定删除用户「${record.username}」吗？`}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer
      title="用户管理"
      description="管理后台账号与前台注册用户"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null)
            setFormOpen(true)
          }}
        >
          新建用户
        </Button>
      }
    >
      <Card className="filter-card">
        <Form<SearchValues> form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索邮箱 / 用户名 / 昵称"
              aria-label="搜索用户"
              style={{ width: 250 }}
            />
          </Form.Item>
          <Form.Item name="role">
            <Select
              allowClear
              placeholder="全部角色"
              aria-label="用户角色"
              options={[
                { value: 'admin', label: '管理员' },
                { value: 'user', label: '普通用户' },
              ]}
              style={{ width: 140 }}
            />
          </Form.Item>
          <Form.Item name="sex">
            <Select
              allowClear
              placeholder="全部性别"
              aria-label="用户性别"
              options={[
                { value: 'male', label: '男' },
                { value: 'female', label: '女' },
                { value: 'unknown', label: '未知' },
              ]}
              style={{ width: 120 }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card styles={{ body: { paddingTop: 12 } }}>
        <Table<User>
          rowKey="id"
          columns={columns}
          dataSource={data?.list ?? []}
          loading={loading}
          scroll={{ x: 920 }}
          pagination={{
            current: page,
            pageSize,
            total: data?.pagination.total ?? 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (nextPage, nextPageSize) => {
              if (nextPageSize !== pageSize) {
                setPageSize(nextPageSize)
                setPage(1)
              } else {
                setPage(nextPage)
              }
            },
          }}
        />
      </Card>

      {formOpen ? (
        <UserFormModal
          user={editingUser}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            const wasEditing = Boolean(editingUser)
            setFormOpen(false)
            setEditingUser(null)
            if (!wasEditing) setPage(1)
            setRefreshKey((key) => key + 1)
          }}
        />
      ) : null}
    </PageContainer>
  )
}
