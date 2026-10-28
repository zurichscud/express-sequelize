interface MessageLike {
  error: (content: string) => void
  success: (content: string) => void
}

let messageApi: MessageLike | null = null

/** 由 App 在 antd App 上下文中注入，保证请求层的提示也能跟随主题 */
export function bindMessageApi(api: MessageLike) {
  messageApi = api
}

export function showError(content: string) {
  messageApi?.error(content)
}
