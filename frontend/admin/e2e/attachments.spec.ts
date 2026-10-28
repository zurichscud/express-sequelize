import { expect, test } from './fixtures'
import { selectOption } from './helpers'

test.describe('附件管理', () => {
  test('列表加载、关键词搜索与类型筛选', async ({ page }) => {
    await page.goto('/attachments')

    await expect(page.getByRole('heading', { name: '附件管理' })).toBeVisible()
    await expect(page.getByLabel('搜索附件')).toBeVisible()

    // 关键词过滤
    await page.getByLabel('搜索附件').fill('不存在的附件-keyword')
    await page.getByRole('button', { name: /查\s*询/ }).click()
    await expect(page.locator('.ant-table-placeholder')).toContainText('暂无数据')

    // 重置后按类型筛选
    await page.getByRole('button', { name: /重\s*置/ }).click()
    await selectOption(page, page.getByLabel('附件类型'), '图片')
    await expect(page.locator('.ant-table-tbody')).toBeVisible()
  })
})
