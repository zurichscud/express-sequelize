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

async function fetchList<T extends ListItem>(
  api: APIRequestContext,
  path: string,
  params?: Record<string, string | number>,
): Promise<T[]> {
  const response = await api.get(apiUrl(path), { params })
  if (!response.ok()) return []

  const payload = (await response.json()) as ApiEnvelope<{ list: T[] }>
  return payload.data?.list ?? []
}

/**
 * 清理由 E2E 用例创建的数据（失败用例遗留的数据也会被下一次运行清掉）。
 * 删除顺序：文章 -> 课程 -> 分类 -> 用户，避免外键约束导致删除失败。
 */
export async function cleanupE2EData(api: APIRequestContext) {
  const articles = await fetchList(api, '/articles', {
    keyword: TEST_PREFIX,
    page: 1,
    pageSize: 100,
  })
  for (const article of articles) {
    await api.delete(apiUrl(`/articles/${article.id}`))
  }

  const courses = await fetchList(api, '/courses', {
    keyword: TEST_PREFIX,
    page: 1,
    pageSize: 100,
  })
  for (const course of courses) {
    await api.delete(apiUrl(`/courses/${course.id}`))
  }

  const categories = (await fetchList(api, '/categories')).filter((category) =>
    (category.name ?? '').startsWith(TEST_PREFIX),
  )
  for (const category of categories) {
    await api.delete(apiUrl(`/categories/${category.id}`))
  }

  const users = await fetchList(api, '/users', {
    keyword: TEST_PREFIX,
    page: 1,
    pageSize: 100,
  })
  for (const user of users) {
    await api.delete(apiUrl(`/users/${user.id}`))
  }
}

/** 通过 UI 使用演示账号登录，成功后停在仪表盘 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel('账号').fill('admin')
  await page.getByLabel('密码').fill('admin123')
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
