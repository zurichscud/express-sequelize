import { Spin } from 'antd'

export default function PageLoading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
      <Spin size="large" />
    </div>
  )
}
