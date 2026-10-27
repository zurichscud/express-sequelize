import { expect, test } from './fixtures'
import { API_ORIGIN, getApiAuthHeaders, uniqueName } from './helpers'

test.describe('课程章节', () => {
  test('新增、编辑、删除章节并同步课程章节数', async ({ page, request }) => {
    const headers = await getApiAuthHeaders(request)

    const categoryResponse = await request.post(`${API_ORIGIN}/api/admin/categories`, {
      headers,
      data: { name: uniqueName('章节分类'), rank: -1 },
    })
    expect(categoryResponse.ok()).toBeTruthy()
    const category = (await categoryResponse.json()).data

    const usersResponse = await request.get(`${API_ORIGIN}/api/admin/users?page=1&pageSize=1`, {
      headers,
    })
    expect(usersResponse.ok()).toBeTruthy()
    const users = (await usersResponse.json()).data.list

    const courseName = uniqueName('章节课程')
    const courseResponse = await request.post(`${API_ORIGIN}/api/admin/courses`, {
      headers,
      data: { category_id: category.id, user_id: users[0].id, name: courseName },
    })
    expect(courseResponse.ok()).toBeTruthy()
    expect((await courseResponse.json()).data.chapter_count).toBe(0)

    await page.goto('/courses')
    await page.getByLabel('搜索课程').fill(courseName)
    await page.getByRole('button', { name: /查\s*询/ }).click()

    const row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: courseName })
    await expect(row).toBeVisible()
    await expect(row.locator('td').nth(4)).toContainText('0 / 0')

    await row.getByRole('button', { name: /章\s*节/ }).click()
    const drawer = page.locator('.ant-drawer-section')
    await expect(drawer).toBeVisible()

    const title = uniqueName('章节')
    const updatedTitle = `${title}_更新`

    await drawer.getByRole('button', { name: '新建章节' }).first().click()
    const dialog = page.locator('.ant-modal')
    await expect(dialog).toBeVisible()
    await dialog.locator('#title').fill(title)
    await dialog.locator('#video_url').fill('https://example.com/e2e-chapter.mp4')
    await dialog.locator('#content').fill('E2E 自动测试章节内容')
    await dialog.getByRole('button', { name: /创\s*建/ }).click()

    await expect(page.locator('.ant-message').getByText('章节已创建')).toBeVisible()
    let chapterRow = drawer.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: title })
    await expect(chapterRow).toBeVisible()

    await page.locator('.ant-drawer-close').click()
    await expect(drawer).toBeHidden()
    await expect(row.locator('td').nth(4)).toContainText('0 / 1')

    await row.getByRole('button', { name: /章\s*节/ }).click()
    const editDrawer = page.locator('.ant-drawer-section')
    chapterRow = editDrawer.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: title })
    await chapterRow.getByRole('button', { name: /编\s*辑/ }).click()

    const editDialog = page.locator('.ant-modal')
    await expect(editDialog).toBeVisible()
    await expect(editDialog.locator('#title')).toHaveValue(title)
    await editDialog.locator('#title').fill(updatedTitle)
    await editDialog.getByRole('button', { name: /保\s*存/ }).click()

    await expect(page.locator('.ant-message').getByText('章节已更新')).toBeVisible()
    chapterRow = editDrawer
      .locator('.ant-table-tbody tr.ant-table-row')
      .filter({ hasText: updatedTitle })
    await expect(chapterRow).toBeVisible()

    await chapterRow.getByRole('button', { name: /删\s*除/ }).click()
    await page
      .locator('.ant-popconfirm:visible')
      .getByRole('button', { name: /删\s*除/ })
      .click()

    await expect(page.locator('.ant-message').getByText('章节已删除')).toBeVisible()
    await expect(editDrawer.locator('.ant-table-tbody tr.ant-table-row')).toHaveCount(0)

    await page.locator('.ant-drawer-close').click()
    await expect(editDrawer).toBeHidden()
    await expect(row.locator('td').nth(4)).toContainText('0 / 0')
  })
})
