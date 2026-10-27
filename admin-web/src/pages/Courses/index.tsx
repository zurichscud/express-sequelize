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
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { TableProps } from 'antd'
import { PlusOutlined, ReadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import PageContainer from '@/components/PageContainer'
import CourseFormModal from './CourseFormModal'
import { deleteCourse, getCourse, getCourses, updateCourse } from '@/api/course'
import { getCategories } from '@/api/category'
import { getUsers } from '@/api/user'
import type { Category, Course, PageResult, User } from '@/types'
import { formatDateTime } from '@/utils/format'

interface SearchValues {
  keyword?: string
  category_id?: number
  is_recommended?: 'true' | 'false'
}

export default function CoursesPage() {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<SearchValues>()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [query, setQuery] = useState<SearchValues>({})
  const [refreshKey, setRefreshKey] = useState(0)

  const [data, setData] = useState<PageResult<Course> | null>(null)
  const [loading, setLoading] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadOptions() {
      try {
        const [categoryList, userPage] = await Promise.all([
          getCategories(),
          getUsers({ page: 1, pageSize: 100 }),
        ])
        if (!cancelled) {
          setCategories(categoryList)
          setUsers(userPage.list)
        }
      } catch {
        // 请求层已统一提示
      }
    }

    void loadOptions()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const result = await getCourses({ page, pageSize, ...query })
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
      category_id: values.category_id,
      is_recommended: values.is_recommended || undefined,
    })
  }

  function handleReset() {
    form.resetFields()
    setPage(1)
    setQuery({})
  }

  async function handleEdit(record: Course) {
    setDetailLoadingId(record.id)
    try {
      const detail = await getCourse(record.id)
      setEditingCourse(detail)
      setFormOpen(true)
    } catch {
      // 请求层已统一提示
    } finally {
      setDetailLoadingId(null)
    }
  }

  async function handleDelete(record: Course) {
    try {
      await deleteCourse(record.id)
      message.success('课程已删除')
      if (data && data.list.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        setRefreshKey((key) => key + 1)
      }
    } catch {
      // 请求层已统一提示
    }
  }

  async function handleToggleRecommended(record: Course, checked: boolean) {
    setTogglingId(record.id)
    try {
      await updateCourse(record.id, { is_recommended: checked })
      message.success(checked ? '已设为推荐课程' : '已取消推荐')
      setRefreshKey((key) => key + 1)
    } catch {
      // 请求层已统一提示
    } finally {
      setTogglingId(null)
    }
  }

  const columns: TableProps<Course>['columns'] = [
    {
      title: '课程',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="course-cell">
          <Avatar
            shape="square"
            size={40}
            src={record.image || undefined}
            icon={<ReadOutlined />}
            style={{ flexShrink: 0 }}
          />
          <div className="cell-title">
            <Typography.Text strong ellipsis={{ tooltip: name }}>
              {name}
            </Typography.Text>
            <span className="cell-title__sub">课程 ID：{record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      key: 'category',
      width: 120,
      render: (_, record) =>
        record.category ? <Tag color="geekblue">{record.category.name}</Tag> : '-',
    },
    {
      title: '作者',
      key: 'author',
      width: 140,
      render: (_, record) => record.user?.nickname || record.user?.username || '-',
    },
    {
      title: '推荐',
      dataIndex: 'is_recommended',
      key: 'is_recommended',
      width: 90,
      align: 'center',
      render: (checked: boolean, record) => (
        <Switch
          size="small"
          checked={checked}
          loading={togglingId === record.id}
          aria-label={`推荐课程：${record.name}`}
          onChange={(next) => handleToggleRecommended(record, next)}
        />
      ),
    },
    {
      title: '点赞 / 章节',
      key: 'counts',
      width: 130,
      render: (_, record) => (
        <Typography.Text type="secondary">
          {record.like_count} / {record.chapter_count}
        </Typography.Text>
      ),
    },
    {
      title: '创建时间',
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
            loading={detailLoadingId === record.id}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除课程"
            description={`确定删除「${record.name}」吗？`}
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
      title="课程管理"
      description="维护课程信息、所属分类与推荐状态"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCourse(null)
            setFormOpen(true)
          }}
        >
          新建课程
        </Button>
      }
    >
      <Card className="filter-card">
        <Form<SearchValues> form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索课程名称"
              aria-label="搜索课程"
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="category_id">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="全部分类"
              aria-label="课程分类"
              options={categories.map((item) => ({ value: item.id, label: item.name }))}
              style={{ width: 160 }}
            />
          </Form.Item>
          <Form.Item name="is_recommended">
            <Select
              allowClear
              placeholder="推荐状态"
              aria-label="推荐状态"
              options={[
                { value: 'true', label: '已推荐' },
                { value: 'false', label: '未推荐' },
              ]}
              style={{ width: 140 }}
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
        <Table<Course>
          rowKey="id"
          columns={columns}
          dataSource={data?.list ?? []}
          loading={loading}
          scroll={{ x: 1000 }}
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
        <CourseFormModal
          course={editingCourse}
          categories={categories}
          users={users}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            const wasEditing = Boolean(editingCourse)
            setFormOpen(false)
            setEditingCourse(null)
            if (!wasEditing) setPage(1)
            setRefreshKey((key) => key + 1)
          }}
        />
      ) : null}
    </PageContainer>
  )
}
