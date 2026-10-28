import { expect, test } from './fixtures'
import { selectOption, uniqueName } from './helpers'

test.describe('文章管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/articles')
    await expect(page.getByRole('heading', { name: '文章管理', level: 4 })).toBeVisible()
    await expect(page.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible()
  })

  test('支持关键词与状态筛选', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr.ant-table-row')

    await page.getByPlaceholder('搜索标题或摘要').fill('utf8mb4')
    await page.getByRole('button', { name: /查\s*询/ }).click()

    await expect(rows.first()).toContainText('utf8mb4')
    expect(await rows.count()).toBeGreaterThanOrEqual(1)

    await page.getByRole('button', { name: /重\s*置/ }).click()
    await expect(page.getByPlaceholder('搜索标题或摘要')).toHaveValue('')
    await expect.poll(() => rows.count()).toBeGreaterThan(1)

    const draftResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/admin/articles') &&
        response.url().includes('status=draft') &&
        response.status() === 200,
    )
    await selectOption(page, page.locator('.filter-card #status'), '草稿')
    await page.getByRole('button', { name: /查\s*询/ }).click()
    await draftResponse

    // 等表格真正切换为草稿结果，避免在旧数据上做断言
    await expect(
      page.locator('.ant-table-tbody tr.ant-table-row .ant-tag').filter({ hasText: '已发布' }),
    ).toHaveCount(0)

    const draftCount = await rows.count()
    expect(draftCount).toBeGreaterThan(0)
    for (let index = 0; index < draftCount; index += 1) {
      await expect(rows.nth(index).locator('.ant-tag')).toHaveText('草稿')
    }
  })

  test('新建、编辑并删除文章', async ({ page }) => {
    const title = uniqueName('文章')
    const updatedTitle = `${title}_已更新`
    const content = 'E2E 自动测试正文内容。'

    await page.getByRole('button', { name: '新建文章' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // 必填校验
    await dialog.getByRole('button', { name: /创\s*建/ }).click()
    await expect(dialog.getByText('请输入文章标题')).toBeVisible()
    await expect(dialog.getByText('请输入文章正文')).toBeVisible()

    await dialog.locator('#title').fill(title)
    await dialog.locator('#author').fill('E2E')
    await dialog.locator('#summary').fill('E2E 自动测试摘要')
    await dialog.locator('#content').fill(content)
    await dialog.getByRole('button', { name: /创\s*建/ }).click()

    await expect(page.locator('.ant-message').getByText('文章已创建')).toBeVisible()
    await expect(dialog).toBeHidden()

    let row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: title })
    await expect(row).toBeVisible()
    await expect(row).toContainText('E2E')

    // 编辑：回填内容、清空摘要、改为草稿
    await row.getByRole('button', { name: /编\s*辑/ }).click()

    const editDialog = page.getByRole('dialog')
    await expect(editDialog).toBeVisible()
    await expect(editDialog.locator('#title')).toHaveValue(title)
    await expect(editDialog.locator('#content')).toHaveValue(content)

    await editDialog.locator('#title').fill(updatedTitle)
    await editDialog.locator('#summary').fill('')
    await selectOption(page, editDialog.locator('#status'), '草稿')
    await editDialog.getByRole('button', { name: /保\s*存/ }).click()

    await expect(page.locator('.ant-message').getByText('文章已更新')).toBeVisible()
    await expect(editDialog).toBeHidden()

    row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: updatedTitle })
    await expect(row).toBeVisible()
    await expect(row.locator('.ant-tag')).toHaveText('草稿')

    // 删除
    await row.getByRole('button', { name: /删\s*除/ }).click()
    await page
      .locator('.ant-popconfirm:visible')
      .getByRole('button', { name: /删\s*除/ })
      .click()

    await expect(page.locator('.ant-message').getByText('文章已删除')).toBeVisible()
    await expect(
      page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: updatedTitle }),
    ).toHaveCount(0)
  })
})
