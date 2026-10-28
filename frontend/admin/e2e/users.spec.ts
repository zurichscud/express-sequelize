import { expect, test } from './fixtures'
import { API_ORIGIN, getApiAuthHeaders, selectOption } from './helpers'

test.describe('系统用户', () => {
  test('超级管理员账号不可编辑或删除', async ({ page, request }) => {
    const headers = await getApiAuthHeaders(request)

    const updateResponse = await request.put(`${API_ORIGIN}/api/admin/users/1`, {
      headers,
      data: { nickname: '不可修改' },
    })
    expect(updateResponse.status()).toBe(403)

    const deleteResponse = await request.delete(`${API_ORIGIN}/api/admin/users/1`, { headers })
    expect(deleteResponse.status()).toBe(403)

    await page.goto('/users')
    const row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: '@admin' })
    await expect(row).toBeVisible()
    await expect(row).toContainText('超级管理员')
    await expect(row.getByRole('button', { name: /编\s*辑/ })).toHaveCount(0)
    await expect(row.getByRole('button', { name: /删\s*除/ })).toHaveCount(0)
  })

  test('新建、编辑并删除用户', async ({ page }) => {
    const suffix = Date.now().toString(36)
    const username = `E2E_user_${suffix}`
    const email = `${username.toLowerCase()}@example.com`
    const nickname = `E2E 用户 ${suffix}`

    await page.goto('/users')
    await expect(page.getByRole('heading', { name: '系统用户', level: 4 })).toBeVisible()
    await expect(page.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible()

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

    await expect(page.locator('.ant-message').getByText('用户已创建')).toBeVisible()
    await expect(dialog).toBeHidden()

    let row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: username })
    await expect(row).toBeVisible()
    await expect(row).toContainText('普通用户')
    await expect(row).toContainText(email)

    // 编辑昵称与角色
    await row.getByRole('button', { name: /编\s*辑/ }).click()
    const editDialog = page.getByRole('dialog')
    await expect(editDialog).toBeVisible()
    await expect(editDialog.locator('#username')).toHaveValue(username)
    await expect(editDialog.locator('#password')).toHaveValue('')

    await editDialog.locator('#nickname').fill(`${nickname} 改`)
    await selectOption(page, editDialog.locator('#role'), '管理员')
    await editDialog.getByRole('button', { name: /保\s*存/ }).click()

    await expect(page.locator('.ant-message').getByText('用户已更新')).toBeVisible()
    await expect(editDialog).toBeHidden()

    row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: username })
    await expect(row).toBeVisible()
    await expect(row).toContainText('管理员')
    await expect(row).toContainText(`${nickname} 改`)

    // 删除
    await row.getByRole('button', { name: /删\s*除/ }).click()
    await page
      .locator('.ant-popconfirm:visible')
      .getByRole('button', { name: /删\s*除/ })
      .click()

    await expect(page.locator('.ant-message').getByText('用户已删除')).toBeVisible()
    await expect(
      page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: username }),
    ).toHaveCount(0)
  })
})
