import { useCallback, useEffect, useState } from 'react'
import {
  App as AntdApp,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'antd'
import type { TableProps } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import PageContainer from '@/components/PageContainer'
import { createCategory, deleteCategory, getCategories, updateCategory } from '@/api/category'
import type { Category } from '@/types'
import { formatDateTime } from '@/utils/format'

interface CategoryFormValues {
  name: string
  rank: number
}

interface CategoryFormModalProps {
  category: Category | null
  onClose: () => void
  onSaved: () => void
}

function CategoryFormModal({ category, onClose, onSaved }: CategoryFormModalProps) {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<CategoryFormValues>()
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(category)

  async function handleFinish(values: CategoryFormValues) {
    setSaving(true)
    try {
      if (category) {
        await updateCategory(category.id, values)
        message.success('分类已更新')
      } else {
        await createCategory(values)
        message.success('分类已创建')
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
      title={isEdit ? '编辑分类' : '新建分类'}
      width={440}
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={saving}
      mask={{ closable: false }}
      destroyOnHidden
      onOk={() => form.submit()}
      onCancel={onClose}
    >
      <Form<CategoryFormValues>
        form={form}
        layout="vertical"
        style={{ marginTop: 20 }}
        initialValues={category ? { name: category.name, rank: category.rank } : { name: '', rank: 0 }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          label="分类名称"
          rules={[
            { required: true, message: '请输入分类名称' },
            { max: 64, message: '分类名称不能超过 64 个字符' },
          ]}
        >
          <Input placeholder="例如：前端开发" maxLength={64} />
        </Form.Item>
        <Form.Item
          name="rank"
          label="排序序号"
          extra="数值越小越靠前"
          rules={[{ required: true, message: '请输入排序序号' }]}
        >
          <InputNumber style={{ width: '100%' }} precision={0} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default function CategoriesPage() {
  const { message } = AntdApp.useApp()

  const [list, setList] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setList(await getCategories())
    } catch {
      // 请求层已统一提示
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(record: Category) {
    try {
      await deleteCategory(record.id)
      message.success('分类已删除')
      await load()
    } catch {
      // 请求层已统一提示
    }
  }

  const columns: TableProps<Category>['columns'] = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Tag color="geekblue">{name}</Tag>,
    },
    {
      title: '排序序号',
      dataIndex: 'rank',
      key: 'rank',
      width: 120,
      align: 'right',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => {
            setEditingCategory(record)
            setFormOpen(true)
          }}>
            编辑
          </Button>
          <Popconfirm
            title="删除分类"
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
      title="分类管理"
      description="分类按排序序号升序展示，数值越小越靠前"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null)
            setFormOpen(true)
          }}
        >
          新建分类
        </Button>
      }
    >
      <Card>
        <Table<Category>
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={false}
          scroll={{ x: 640 }}
        />
      </Card>

      {formOpen ? (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false)
            void load()
          }}
        />
      ) : null}
    </PageContainer>
  )
}
