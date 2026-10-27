import { useEffect } from 'react'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { ThemeProvider, useThemeMode } from '@/theme/ThemeProvider'
import { bindMessageApi } from '@/utils/feedback'

/** 把 antd 的 message 实例交给请求层，避免静态方法脱离上下文 */
function FeedbackBridge() {
  const { message } = AntdApp.useApp()

  useEffect(() => {
    bindMessageApi(message)
  }, [message])

  return null
}

function ThemedApp() {
  const { mode } = useThemeMode()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          colorInfo: '#4f46e5',
          borderRadius: 10,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        },
        components: {
          Layout: {
            headerHeight: 64,
            headerPadding: '0 24px',
          },
          Menu: {
            itemBorderRadius: 8,
          },
          Card: {
            borderRadiusLG: 14,
          },
          Table: {
            headerBg: mode === 'dark' ? '#1b1b24' : '#f7f7fb',
          },
        },
      }}
    >
      <AntdApp>
        <FeedbackBridge />
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  )
}
