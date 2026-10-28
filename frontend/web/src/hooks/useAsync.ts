import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/api/request'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * 通用异步加载：依赖变化时自动重新请求，支持手动重试
 * loader 通过 ref 保存，调用方无需 useCallback 包裹
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const loaderRef = useRef(loader)
  loaderRef.current = loader
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    loaderRef
      .current()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (active) setState({ data: null, loading: false, error: getErrorMessage(error) })
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const reload = useCallback(() => setVersion((value) => value + 1), [])

  return { ...state, reload }
}
