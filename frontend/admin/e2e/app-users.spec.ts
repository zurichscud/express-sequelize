import { expect, test } from './fixtures'
import { API_ORIGIN, getApiAuthHeaders, uniqueName } from './helpers'

test.describe('前台用户管理', () => {
  test('新建、编辑并删除前台用户', async ({ page }) => {
    const suffix = Date.now().toString(36)
    const username = `E2E_AppUser_${suffix}`
    const email = `${username.toLowerCase()}@example.com`
    const nickname = `E2E 前台用户 ${suffix}`

    await page.goto('/app-users')
    await expect(page.getByRole('heading', { name: '前台用户管理', level: 4 })).toBeVisible()

    // 新建，先验证密码长度
    await page.getByRole('button', { name: '新建用户' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.locator('#email').fill(email)
    await dialog.locator('#username').fill(username)
    await dialog.locator('#nickname').fill(nickname)
    await dialog.locator('#password').fill('12345')
    await dialog.getByRole('button', { name: /创\s*建/ }).click()
    await expect(dialog.getByText('密码长度需在 6-72 位之间')).toBeVisible()

    await dialog.locator('#password').fill('123456')
    await dialog.getByRole('button', { name: /创\s*建/ }).click()

    await expect(page.locator('.ant-message').getByText('前台用户已创建')).toBeVisible()
    await expect(dialog).toBeHidden()

    let row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: username })
    await expect(row).toBeVisible()
    await expect(row).toContainText(email)
    await expect(row).toContainText(nickname)

    // 编辑昵称与性别
    await row.getByRole('button', { name: /编\s*辑/ }).click()
    const editDialog = page.getByRole('dialog')
    await expect(editDialog).toBeVisible()
    await expect(editDialog.locator('#username')).toHaveValue(username)
    await expect(editDialog.locator('#password')).toHaveValue('')

    await editDialog.locator('#nickname').fill(`${nickname} 改`)
    await editDialog.getByRole('button', { name: /保\s*存/ }).click()

    await expect(page.locator('.ant-message').getByText('前台用户已更新')).toBeVisible()
    await expect(editDialog).toBeHidden()

    row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: username })
    await expect(row).toBeVisible()
    await expect(row).toContainText(`${nickname} 改`)

    // 删除
    await row.getByRole('button', { name: /删\s*除/ }).click()
    await page
      .locator('.ant-popconfirm:visible')
      .getByRole('button', { name: /删\s*除/ })
      .click()

    await expect(page.locator('.ant-message').getByText('前台用户已删除')).toBeVisible()
    await expect(
      page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: username }),
    ).toHaveCount(0)
  })

  test('名下存在课程时不可删除', async ({ request }) => {
    const headers = await getApiAuthHeaders(request)
    const suffix = Date.now().toString(36)

    const userResponse = await request.post(`${API_ORIGIN}/api/admin/app-users`, {
      headers,
      data: {
        email: `e2e_appuser_course_${suffix}@example.com`,
        password: '123456',
        username: `E2E_AppUserCourse_${suffix}`,
        nickname: 'E2E 课程归属用户',
        sex: 'unknown',
      },
    })
    expect(userResponse.ok()).toBeTruthy()
    const user = (await userResponse.json()).data

    const categoryResponse = await request.post(`${API_ORIGIN}/api/admin/categories`, {
      headers,
      data: { name: uniqueName('前台用户分类'), rank: -1 },
    })
    expect(categoryResponse.ok()).toBeTruthy()
    const category = (await categoryResponse.json()).data

    const courseResponse = await request.post(`${API_ORIGIN}/api/admin/courses`, {
      headers,
      data: { category_id: category.id, user_id: user.id, name: uniqueName('归属课程') },
    })
    expect(courseResponse.ok()).toBeTruthy()

    const deleteResponse = await request.delete(`${API_ORIGIN}/api/admin/app-users/${user.id}`, {
      headers,
    })
    expect(deleteResponse.status()).toBe(400)
    const payload = await deleteResponse.json()
    expect(payload.message).toContain('无法删除')
  })
})
