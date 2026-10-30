import { useEffect, useState } from 'react'
import {
  App as AntdApp,
  Button,
  Drawer,
  Empty,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { TableProps } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import ChapterFormModal from './ChapterFormModal'
import { deleteChapter, getChapter, getChapters } from '@/api/chapter'
import type { Chapter, Course, PageResult } from '@/types'
import { formatDateTime } from '@/utils/format'

interface ChapterDrawerProps {
  course: Course
  onClose: () => void
  onChanged?: () => void
}

export default function ChapterDrawer({ course, onClose, onChanged }: ChapterDrawerProps) {
  const { message } = AntdApp.useApp()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [data, setData] = useState<PageResult<Chapter> | null>(null)
  const [loading, setLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const result = await getChapters({ page, pageSize, courseId: course.id, keyword })
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
  }, [course.id, page, pageSize, keyword, refreshKey])

  function handleSearch() {
    setPage(1)
    setKeyword(keywordInput.trim())
  }

  function handleReset() {
    setKeywordInput('')
    setKeyword('')
    setPage(1)
  }

  function handleCreate() {
    setEditingChapter(null)
    setFormOpen(true)
  }

  async function handleEdit(record: Chapter) {
    setDetailLoadingId(record.id)
    try {
      const detail = await getChapter(record.id)
      setEditingChapter(detail)
      setFormOpen(true)
    } catch {
      // 请求层已统一提示
    } finally {
      setDetailLoadingId(null)
    }
  }

  async function handleDelete(record: Chapter) {
    try {
      await deleteChapter(record.id)
      message.success('章节已删除')
      onChanged?.()
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
    const wasEditing = Boolean(editingChapter)
    setFormOpen(false)
    setEditingChapter(null)
    if (!wasEditing) {
      // 新建后清空搜索并回到第一页，确保新章节可见
      setKeywordInput('')
      setKeyword('')
      setPage(1)
    }
    setRefreshKey((key) => key + 1)
    onChanged?.()
  }

  const nextRank = (data?.list.reduce((max, item) => Math.max(max, item.rank), 0) ?? 0) + 1
  const total = data?.pagination.total ?? 0

  const columns: TableProps<Chapter>['columns'] = [
    {
      title: '排序',
      dataIndex: 'rank',
      key: 'rank',
      width: 72,
      align: 'center',
      render: (rank: number) => <Tag>{rank}</Tag>,
    },
    {
      title: '章节标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <Typography.Text strong ellipsis={{ tooltip: title }}>
          {title}
        </Typography.Text>
      ),
    },
    {
      title: '视频',
      dataIndex: 'videoUrl',
      key: 'videoUrl',
      width: 96,
      align: 'center',
      render: (videoUrl: string | null) =>
        videoUrl ? (
          <Typography.Link href={videoUrl} target="_blank" rel="noreferrer">
            查看视频
          </Typography.Link>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
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
            title="删除章节"
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
    <Drawer
      open
      size={760}
      title={
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>章节管理</span>
          <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            {course.name}
          </Typography.Text>
        </div>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建章节
        </Button>
      }
      onClose={onClose}
      destroyOnHidden
    >
      <div className="chapter-toolbar">
        <Space wrap>
          <Input
            allowClear
            value={keywordInput}
            prefix={<SearchOutlined />}
            placeholder="搜索章节标题"
            aria-label="搜索章节标题"
            style={{ width: 240 }}
            onChange={(event) => setKeywordInput(event.target.value)}
            onPressEnter={handleSearch}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
        <Typography.Text type="secondary">共 {total} 章</Typography.Text>
      </div>

      <Table<Chapter>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data?.list ?? []}
        loading={loading}
        scroll={{ x: 620 }}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有章节">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新建章节
              </Button>
            </Empty>
          ),
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
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

      {formOpen ? (
        <ChapterFormModal
          courseId={course.id}
          courseName={course.name}
          chapter={editingChapter}
          defaultRank={nextRank}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      ) : null}
    </Drawer>
  )
}
