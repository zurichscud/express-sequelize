import { useEffect, useState } from 'react'
import {
  App as AntdApp,
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
import ArticleFormModal from './ArticleFormModal'
import { deleteArticle, getArticle, getArticles } from '@/api/article'
import type { Article, ArticleStatus, PageResult } from '@/types'
import { formatDateTime } from '@/utils/format'

interface SearchValues {
  keyword?: string
  status?: ArticleStatus
}

const STATUS_OPTIONS = [
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
]

export default function ArticlesPage() {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<SearchValues>()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [query, setQuery] = useState<SearchValues>({})
  const [refreshKey, setRefreshKey] = useState(0)

  const [data, setData] = useState<PageResult<Article> | null>(null)
  const [loading, setLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const result = await getArticles({ page, pageSize, ...query })
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
      status: values.status || undefined,
    })
  }

  function handleReset() {
    form.resetFields()
    setPage(1)
    setQuery({})
  }

  function handleCreate() {
    setEditingArticle(null)
    setFormOpen(true)
  }

  async function handleEdit(record: Article) {
    setDetailLoadingId(record.id)
    try {
      const detail = await getArticle(record.id)
      setEditingArticle(detail)
      setFormOpen(true)
    } catch {
      // 请求层已统一提示
    } finally {
      setDetailLoadingId(null)
    }
  }

  async function handleDelete(record: Article) {
    try {
      await deleteArticle(record.id)
      message.success('文章已删除')
      if (data && data.list.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        setRefreshKey((key) => key + 1)
      }
    } catch {
      // 请求层已统一提示
    }
  }

  function handleSaved() {
    const wasEditing = Boolean(editingArticle)
    setFormOpen(false)
    setEditingArticle(null)
    if (!wasEditing) setPage(1)
    setRefreshKey((key) => key + 1)
  }

  const columns: TableProps<Article>['columns'] = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record) => (
        <div className="cell-title">
          <Typography.Text strong ellipsis={{ tooltip: title }}>
            {title}
          </Typography.Text>
          <span className="cell-title__sub">{record.summary || '暂无摘要'}</span>
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ArticleStatus) =>
        status === 'published' ? <Tag color="success">已发布</Tag> : <Tag>草稿</Tag>,
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      align: 'right',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
            title="删除文章"
            description={`确定删除「${record.title}」吗？`}
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
      title="文章管理"
      description="维护站点文章内容，支持搜索、编辑与发布状态管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建文章
        </Button>
      }
    >
      <Card className="filter-card">
        <Form<SearchValues> form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索标题或摘要"
              aria-label="搜索文章"
              style={{ width: 260 }}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              placeholder="全部状态"
              aria-label="文章状态"
              options={STATUS_OPTIONS}
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
        <Table<Article>
          rowKey="id"
          columns={columns}
          dataSource={data?.list ?? []}
          loading={loading}
          scroll={{ x: 900 }}
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
        <ArticleFormModal
          article={editingArticle}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      ) : null}
    </PageContainer>
  )
}
