import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getSettings } from '@/api/settings'
import type { SiteInfo } from '@/types'

const FALLBACK: SiteInfo = {
  name: '课程与实践笔记',
  icp: '',
  copyright: '',
}

interface SiteContextValue {
  site: SiteInfo
  ready: boolean
}

const SiteContext = createContext<SiteContextValue>({ site: FALLBACK, ready: false })

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteInfo>(FALLBACK)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    getSettings()
      .then((setting) => {
        if (!active) return
        setSite({
          name: setting.name || FALLBACK.name,
          icp: setting.icp || '',
          copyright: setting.copyright || '',
        })
      })
      .catch(() => {
        // 站点设置加载失败不影响页面主体，使用兜底名称
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => ({ site, ready }), [site, ready])
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  return useContext(SiteContext)
}

/** 设置页面标题，站点名从站点设置中读取 */
export function usePageTitle(title?: string) {
  const { site } = useSite()

  useEffect(() => {
    document.title = title ? `${title} · ${site.name}` : `${site.name} · 课程与实践笔记`
  }, [title, site.name])
}
