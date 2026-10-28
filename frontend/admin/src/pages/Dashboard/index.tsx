import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd'
import type { TableProps } from 'antd'
import {
  ArrowRightOutlined,
  FileTextOutlined,
  ReadOutlined,
  TagsOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { getArticles } from '@/api/article'
import { getAppUsers } from '@/api/appUser'
import { getCourses } from '@/api/course'
import { getCategories } from '@/api/category'
import { getGenderChart, getMonthlyUsers } from '@/api/chart'
import type { Article, GenderChartData, MonthlyUsersData, Sex } from '@/types'
import { formatDateTime } from '@/utils/format'

interface DashboardData {
  articleTotal: number
  userTotal: number
  courseTotal: number
  categoryTotal: number
  monthly: MonthlyUsersData
  gender: GenderChartData
  recentArticles: Article[]
}

const SEX_LABELS: Record<Sex, string> = {
  male: '男',
  female: '女',
  unknown: '未知',
}

const SEX_COLORS: Record<Sex, string> = {
  male: '#4f46e5',
  female: '#0ea5e9',
  unknown: '#94a3b8',
}

const recentColumns: TableProps<Article>['columns'] = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
    render: (title: string, record) => (
      <div className="cell-title">
        <Typography.Text strong ellipsis={{ tooltip: title }}>
          {title}
        </Typography.Text>
        <span className="cell-title__sub">{record.author}</span>
      </div>
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: Article['status']) =>
      status === 'published' ? <Tag color="success">已发布</Tag> : <Tag>草稿</Tag>,
  },
  {
    title: '浏览',
    dataIndex: 'views',
    key: 'views',
    width: 90,
    align: 'right',
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 150,
    render: (value: string) => formatDateTime(value),
  },
]

interface StatCardProps {
  title: string
  value: number
  color: string
  icon: ReactNode
}

function StatCard({ title, value, color, icon }: StatCardProps) {
  return (
    <Card>
      <div className="stat-card__body">
        <div className="stat-card__icon" style={{ color, background: `${color}1a` }}>
          {icon}
        </div>
        <Statistic title={title} value={value} />
      </div>
    </Card>
  )
}

function MonthlyBarChart({ data }: { data: { label: string; value: number }[] }) {
  const { token } = theme.useToken()

  if (!data.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无用户注册数据" />
  }

  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="bar-chart">
      {data.map((item) => (
        <div className="bar-chart__item" key={item.label} title={`${item.label}：${item.value} 人`}>
          <span className="bar-chart__value">{item.value}</span>
          <div className="bar-chart__track">
            <div
              className="bar-chart__bar"
              style={{
                height: `${item.value ? Math.max((item.value / max) * 100, 4) : 0}%`,
                background: `linear-gradient(180deg, ${token.colorPrimary}, ${token.colorPrimaryBorder})`,
              }}
            />
          </div>
          <span className="bar-chart__label">{Number(item.label.slice(5))}月</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [articles, users, courses, categories, monthly, gender, recent] = await Promise.all([
          getArticles({ page: 1, pageSize: 1 }),
          getAppUsers({ page: 1, pageSize: 1 }),
          getCourses({ page: 1, pageSize: 1 }),
          getCategories(),
          getMonthlyUsers(),
          getGenderChart(),
          getArticles({ page: 1, pageSize: 6 }),
        ])

        if (cancelled) return

        setData({
          articleTotal: articles.pagination.total,
          userTotal: users.pagination.total,
          courseTotal: courses.pagination.total,
          categoryTotal: categories.length,
          monthly,
          gender,
          recentArticles: recent.list,
        })
      } catch {
        // 请求层已统一提示错误，这里保留空状态即可
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const monthlyData = (data?.monthly.list ?? []).slice(-12).map((item) => ({
    label: item.month,
    value: item.count,
  }))

  return (
    <PageContainer
      title="仪表盘"
      description="内容数据总览，掌握站点运营情况"
      extra={<Link to="/articles">管理内容</Link>}
    >
      {loading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <>
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} xl={6}>
              <StatCard title="文章总数" value={data?.articleTotal ?? 0} color="#4f46e5" icon={<FileTextOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <StatCard title="注册用户" value={data?.userTotal ?? 0} color="#0891b2" icon={<TeamOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <StatCard title="课程总数" value={data?.courseTotal ?? 0} color="#16a34a" icon={<ReadOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <StatCard title="内容分类" value={data?.categoryTotal ?? 0} color="#ea580c" icon={<TagsOutlined />} />
            </Col>
          </Row>

          <Row gutter={[20, 20]}>
            <Col xs={24} xl={15}>
              <Card
                title="用户增长趋势"
                extra={<Typography.Text type="secondary">最近 12 个月</Typography.Text>}
              >
                <MonthlyBarChart data={monthlyData} />
              </Card>
            </Col>
            <Col xs={24} xl={9}>
              <Card
                title="用户性别分布"
                extra={
                  <Typography.Text type="secondary">
                    共 {data?.gender.total ?? 0} 人
                  </Typography.Text>
                }
                styles={{ body: { minHeight: 268 } }}
              >
                {(data?.gender.list ?? []).map((item) => (
                  <div className="gender-row" key={item.sex}>
                    <div className="gender-row__head">
                      <span>{SEX_LABELS[item.sex]}</span>
                      <span className="gender-row__count">
                        {item.count} 人 · {item.percent}%
                      </span>
                    </div>
                    <Progress
                      percent={item.percent}
                      showInfo={false}
                      strokeColor={SEX_COLORS[item.sex]}
                    />
                  </div>
                ))}
              </Card>
            </Col>
          </Row>

          <Card
            title="最新文章"
            extra={
              <Link to="/articles">
                全部文章 <ArrowRightOutlined />
              </Link>
            }
            styles={{ body: { paddingTop: 8 } }}
          >
            <Table<Article>
              rowKey="id"
              size="middle"
              columns={recentColumns}
              dataSource={data?.recentArticles ?? []}
              pagination={false}
              scroll={{ x: 640 }}
            />
          </Card>
        </>
      )}
    </PageContainer>
  )
}
