import { Modal } from 'antd'
import type { ModalProps } from 'antd'

/**
 * 表单弹窗：整体高度不超过视口，内容区独立滚动，
 * 保证标题与底部操作按钮始终可见，避免表单过长时弹窗被屏幕裁切。
 */
export default function FormModal(props: ModalProps) {
  return (
    <Modal
      centered
      {...props}
      styles={{
        container: {
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 48px)',
        },
        body: {
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          // 预留 8px 给 Row 的负 gutter 和输入框聚焦轮廓，避免被滚动容器裁掉
          paddingInline: 8,
          marginInline: -8,
          overflowX: 'hidden',
        },
      }}
    />
  )
}
