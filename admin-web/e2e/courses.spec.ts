import { expect, test } from './fixtures'
import {
  API_ORIGIN,
  getApiAuthHeaders,
  selectFirstOption,
  selectOption,
  uniqueName,
} from './helpers'

test.describe('课程管理', () => {
  test('新建、推荐、编辑并删除课程', async ({ page, request }) => {
    const headers = await getApiAuthHeaders(request)
    const categoryName = uniqueName('课程分类')
    const categoryResponse = await request.post(`${API_ORIGIN}/api/admin/categories`, {
      headers,
      data: { name: categoryName, rank: -1 },
    })
    expect(categoryResponse.ok()).toBeTruthy()

    const courseName = uniqueName('课程')
    const updatedName = `${courseName}_更新`

    // 分类与用户下拉数据在进入页面时加载，先挂好监听避免竞态
    const categoriesLoaded = page.waitForResponse(
      (response) => response.url().includes('/api/admin/categories') && response.status() === 200,
    )
    const usersLoaded = page.waitForResponse(
      (response) =>
        response.url().includes('/api/admin/users') &&
        response.url().includes('pageSize=100') &&
        response.status() === 200,
    )

    await page.goto('/courses')
    await Promise.all([categoriesLoaded, usersLoaded])

    await expect(page.getByRole('heading', { name: '课程管理', level: 4 })).toBeVisible()
    await expect(page.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible()

    // 新建
    await page.getByRole('button', { name: '新建课程' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.locator('#name').fill(courseName)
    await selectOption(page, dialog.locator('#category_id'), categoryName)
    await selectFirstOption(page, dialog.locator('#user_id'))

    await dialog.getByRole('button', { name: /创\s*建/ }).click()

    await expect(page.locator('.ant-message').getByText('课程已创建')).toBeVisible()
    await expect(dialog).toBeHidden()

    let row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: courseName })
    await expect(row).toBeVisible()
    await expect(row).toContainText(categoryName)
    await expect(row.getByRole('switch')).toHaveAttribute('aria-checked', 'false')

    // 列表内切换推荐
    await row.getByRole('switch').click()
    await expect(page.locator('.ant-message').getByText('已设为推荐课程')).toBeVisible()
    await expect(row.getByRole('switch')).toHaveAttribute('aria-checked', 'true')

    // 编辑
    await row.getByRole('button', { name: /编\s*辑/ }).click()
    const editDialog = page.getByRole('dialog')
    await expect(editDialog).toBeVisible()
    await expect(editDialog.locator('#name')).toHaveValue(courseName)

    await editDialog.locator('#name').fill(updatedName)
    await editDialog.locator('#content').fill('E2E 自动测试课程内容')
    await editDialog.getByRole('button', { name: /保\s*存/ }).click()

    await expect(page.locator('.ant-message').getByText('课程已更新')).toBeVisible()
    await expect(editDialog).toBeHidden()

    row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: updatedName })
    await expect(row).toBeVisible()

    // 删除
    await row.getByRole('button', { name: /删\s*除/ }).click()
    await page
      .locator('.ant-popconfirm:visible')
      .getByRole('button', { name: /删\s*除/ })
      .click()

    await expect(page.locator('.ant-message').getByText('课程已删除')).toBeVisible()
    await expect(
      page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: updatedName }),
    ).toHaveCount(0)
  })
})
