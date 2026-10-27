import { expect, test } from './fixtures'

test.describe('主题', () => {
  test('切换深色主题后刷新保持，并能切回浅色', async ({ page }) => {
    await page.goto('/dashboard')

    const html = page.locator('html')

    await expect(html).toHaveAttribute('data-theme', 'light')

    await page.getByRole('switch', { name: '切换到深色模式' }).click()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('switch', { name: '切换到浅色模式' }).click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })
})
