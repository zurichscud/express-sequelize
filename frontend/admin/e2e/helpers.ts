import { expect } from '@playwright/test'
import type { APIRequestContext, Locator, Page } from '@playwright/test'
export const API_ORIGIN = process.env.E2E_API_ORIGIN ?? 'http://127.0.0.1:3000'

/** E2E 测试数据统一前缀，便于失败后自动清理 */
export const TEST_PREFIX = 'E2E_'

export function uniqueName(label: string) {
  return `${TEST_PREFIX}${label}_${Date.now().toString(36)}`
}

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

interface ListItem {
  id: number
  name?: string | null
}

function apiUrl(path: string) {
  return `${API_ORIGIN}/api/admin${path}`
}

let apiToken: string | null = null

/** 获取后端 JWT，供 E2E 直接调用接口准备/清理数据 */
export async function getApiAuthHeaders(api: APIRequestContext) {
  if (!apiToken) {
    const response = await api.post(apiUrl('/users/login'), {
      data: { account: 'admin', password: '123456' },
    })
    const payload = (await response.json()) as ApiEnvelope<{ token: string }>
    if (!response.ok() || payload.code !== 0) {
      throw new Error(`E2E API 登录失败：${payload.message || response.status()}`)
    }
    apiToken = payload.data.token
  }
  return { Authorization: `Bearer ${apiToken}` }
}

async function fetchList<T extends ListItem>(
  api: APIRequestContext,
  path: string,
  params?: Record<string, string | number>,
): Promise<T[]> {
  const headers = await getApiAuthHeaders(api)
  const response = await api.get(apiUrl(path), { params, headers })
  if (!response.ok()) return []

  const payload = (await response.json()) as ApiEnvelope<{ list: T[] }>
  return payload.data?.list ?? []
}

/**
 * 清理由 E2E 用例创建的数据（失败用例遗留的数据也会被下一次运行清掉）。
 * 删除顺序：文章 -> 课程 -> 分类 -> 用户，避免外键约束导致删除失败。
 */
export async function cleanupE2EData(api: APIRequestContext) {
  const headers = await getApiAuthHeaders(api)

  const articles = await fetchList(api, '/articles', {
    keyword: TEST_PREFIX,
    page: 1,
    pageSize: 100,
  })
  for (const article of articles) {
    await api.delete(apiUrl(`/articles/${article.id}`), { headers })
  }

  const courses = await fetchList(api, '/courses', {
    keyword: TEST_PREFIX,
    page: 1,
    pageSize: 100,
  })
  for (const course of courses) {
    await api.delete(apiUrl(`/courses/${course.id}`), { headers })
  }

  const categories = (await fetchList(api, '/categories')).filter((category) =>
    (category.name ?? '').startsWith(TEST_PREFIX),
  )
  for (const category of categories) {
    await api.delete(apiUrl(`/categories/${category.id}`), { headers })
  }

  const users = await fetchList(api, '/users', {
    keyword: TEST_PREFIX,
    page: 1,
    pageSize: 100,
  })
  for (const user of users) {
    await api.delete(apiUrl(`/users/${user.id}`), { headers })
  }

  // 前台用户最后清理：名下课程必须已在上方删除，否则接口会拒绝删除
  const appUsers = await fetchList(api, '/app-users', {
    keyword: TEST_PREFIX,
    page: 1,
    pageSize: 100,
  })
  for (const appUser of appUsers) {
    await api.delete(apiUrl(`/app-users/${appUser.id}`), { headers })
  }
}

/** 通过 UI 使用种子账号登录，成功后停在仪表盘 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel('账号').fill('admin')
  await page.getByLabel('密码').fill('123456')
  await page.getByRole('button', { name: /登\s*录/ }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

/** 打开 antd Select 并选择指定文本的选项 */
export async function selectOption(page: Page, trigger: Locator, optionText: string) {
  await trigger.click()
  await page
    .locator('.ant-select-dropdown:visible')
    .locator('.ant-select-item-option')
    .filter({ hasText: optionText })
    .first()
    .click()
  await expect(page.locator('.ant-select-dropdown:visible')).toHaveCount(0)
}

/** 打开 antd Select 并选择第一个选项（用于不依赖具体用户名的场景） */
export async function selectFirstOption(page: Page, trigger: Locator) {
  await trigger.click()
  await page
    .locator('.ant-select-dropdown:visible')
    .locator('.ant-select-item-option')
    .first()
    .click()
  await expect(page.locator('.ant-select-dropdown:visible')).toHaveCount(0)
}
