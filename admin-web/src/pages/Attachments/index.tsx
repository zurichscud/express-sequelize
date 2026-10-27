import { useEffect, useState } from 'react'
import {
  App as AntdApp,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { TableProps } from 'antd'
import {
  CopyOutlined,
  ReloadOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import PageContainer from '@/components/PageContainer'
import { deleteAttachment, getAttachments } from '@/api/attachment'
import type { Attachment, AttachmentQuery, PageResult, UploadMediaType } from '@/types'
import { formatDateTime, formatFileSize } from '@/utils/format'

interface SearchValues {
  keyword?: string
  type?: UploadMediaType
}

const TYPE_OPTIONS = [
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
]

export default function AttachmentsPage() {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<SearchValues>()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [query, setQuery] = useState<AttachmentQuery>({})
  const [refreshKey, setRefreshKey] = useState(0)

  const [data, setData] = useState<PageResult<Attachment> | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<Attachment | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const result = await getAttachments({ page, pageSize, ...query })
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
      type: values.type || undefined,
    })
  }

  function handleReset() {
    form.resetFields()
    setPage(1)
    setQuery({})
  }

  async function handleDelete(record: Attachment) {
    try {
      await deleteAttachment(record.id)
      message.success('附件已删除')
      if (data && data.list.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        setRefreshKey((key) => key + 1)
      }
    } catch {
      // 请求层已统一提示
    }
  }

  async function handleCopy(url: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      message.success('文件地址已复制')
    } catch {
      message.error('复制失败，请打开预览后手动复制')
    }
  }

  const columns: TableProps<Attachment>['columns'] = [
    {
      title: '附件',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="course-cell">
          <Avatar
            shape="square"
            size={44}
            src={record.type === 'image' ? record.url : undefined}
            icon={record.type === 'video' ? <VideoCameraOutlined /> : undefined}
            style={{ flexShrink: 0, background: 'var(--ant-color-fill-tertiary, rgba(0, 0, 0, 0.04))' }}
          />
          <div className="cell-title">
            <Typography.Text strong ellipsis={{ tooltip: name }}>
              {name}
            </Typography.Text>
            <span className="cell-title__sub">{record.object_key}</span>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type: UploadMediaType) =>
        type === 'video' ? <Tag color="purple">视频</Tag> : <Tag color="blue">图片</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 110,
      align: 'right',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '上传者',
      key: 'uploader',
      width: 140,
      render: (_, record) => record.user?.nickname || record.user?.username || '-',
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 210,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => setPreview(record)}>
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record.url)}
          >
            复制地址
          </Button>
          <Popconfirm
            title="删除附件"
            description="删除后 OSS 文件和附件记录都会移除，且无法恢复；已引用该文件的课程封面或章节视频将无法访问。"
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
      title="附件管理"
      description="查看所有上传到 OSS 的图片与视频，支持预览、复制地址与删除"
    >
      <Card className="filter-card">
        <Form<SearchValues> form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索文件名、Key 或地址"
              aria-label="搜索附件"
              style={{ width: 280 }}
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              allowClear
              placeholder="全部类型"
              aria-label="附件类型"
              options={TYPE_OPTIONS}
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
        <Table<Attachment>
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

      <Modal
        open={Boolean(preview)}
        title={preview?.name}
        footer={null}
        width={820}
        destroyOnHidden
        onCancel={() => setPreview(null)}
      >
        {preview ? (
          <div>
            {preview.type === 'image' ? (
              <img
                src={preview.url}
                alt={preview.name}
                style={{ display: 'block', maxWidth: '100%', maxHeight: '60vh', margin: '0 auto' }}
              />
            ) : (
              <video
                src={preview.url}
                controls
                autoPlay
                style={{ display: 'block', width: '100%', maxHeight: '60vh', background: '#000', borderRadius: 8 }}
              />
            )}
            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <Typography.Text type="secondary" style={{ wordBreak: 'break-all', flex: 1 }}>
                {preview.url}
              </Typography.Text>
              <Button icon={<CopyOutlined />} onClick={() => handleCopy(preview.url)}>
                复制地址
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  )
}
