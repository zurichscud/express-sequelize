import { expect, test } from './fixtures'
import { uniqueName } from './helpers'

test.describe('分类管理', () => {
  test('新建、编辑并删除分类', async ({ page }) => {
    const name = uniqueName('分类')
    const updatedName = `${name}_更新`

    await page.goto('/categories')
    await expect(page.getByRole('heading', { name: '分类管理', level: 4 })).toBeVisible()
    await expect(page.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible()

    // 新建
    await page.getByRole('button', { name: '新建分类' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.locator('#name').fill(name)
    await dialog.locator('#rank').fill('88')
    await dialog.getByRole('button', { name: /创\s*建/ }).click()

    await expect(page.locator('.ant-message').getByText('分类已创建')).toBeVisible()
    await expect(dialog).toBeHidden()

    let row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: name })
    await expect(row).toBeVisible()
    await expect(row).toContainText('88')

    // 编辑
    await row.getByRole('button', { name: /编\s*辑/ }).click()
    const editDialog = page.getByRole('dialog')
    await expect(editDialog).toBeVisible()
    await expect(editDialog.locator('#name')).toHaveValue(name)

    await editDialog.locator('#name').fill(updatedName)
    await editDialog.locator('#rank').fill('66')
    await editDialog.getByRole('button', { name: /保\s*存/ }).click()

    await expect(page.locator('.ant-message').getByText('分类已更新')).toBeVisible()
    await expect(editDialog).toBeHidden()

    row = page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: updatedName })
    await expect(row).toBeVisible()
    await expect(row).toContainText('66')

    // 删除
    await row.getByRole('button', { name: /删\s*除/ }).click()
    await page
      .locator('.ant-popconfirm:visible')
      .getByRole('button', { name: /删\s*除/ })
      .click()

    await expect(page.locator('.ant-message').getByText('分类已删除')).toBeVisible()
    await expect(
      page.locator('.ant-table-tbody tr.ant-table-row').filter({ hasText: updatedName }),
    ).toHaveCount(0)
  })
})
