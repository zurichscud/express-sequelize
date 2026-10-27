import type { ReactNode } from 'react'
import { Typography } from 'antd'

interface PageContainerProps {
  title: string
  description?: string
  extra?: ReactNode
  children: ReactNode
}

export default function PageContainer({ title, description, extra, children }: PageContainerProps) {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Typography.Title level={4}>{title}</Typography.Title>
          {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
        </div>
        {extra ? <div className="page-header__extra">{extra}</div> : null}
      </div>
      {children}
    </div>
  )
}
