import { expect, test } from './fixtures'
import { API_ORIGIN, getApiAuthHeaders, uniqueName } from './helpers'

test.describe('系统设置', () => {
  test('修改站点名称后刷新仍生效，并可恢复', async ({ page, request }) => {
    const headers = await getApiAuthHeaders(request)
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: '系统设置', level: 4 })).toBeVisible()
    await expect(page.locator('#name')).not.toHaveValue('')

    const original = {
      name: await page.locator('#name').inputValue(),
      icp: await page.locator('#icp').inputValue(),
      copyright: await page.locator('#copyright').inputValue(),
    }

    try {
      const updatedName = uniqueName('站点')
      await page.locator('#name').fill(updatedName)
      await page.getByRole('button', { name: /保\s*存/ }).click()

      await expect(page.locator('.ant-message').getByText('站点设置已保存')).toBeVisible()

      await page.reload()
      await expect(page.locator('#name')).toHaveValue(updatedName)

      // 通过 UI 再恢复一次，验证保存链路
      await page.locator('#name').fill(original.name)
      await page.locator('#icp').fill(original.icp)
      await page.locator('#copyright').fill(original.copyright)
      await page.getByRole('button', { name: /保\s*存/ }).click()
      await expect(page.locator('.ant-message').getByText('站点设置已保存')).toBeVisible()
    } finally {
      // 即使断言失败也确保不污染站点设置
      await request.put(`${API_ORIGIN}/api/admin/settings`, { headers, data: original })
    }
  })
})
