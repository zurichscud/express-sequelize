import { expect, test } from './fixtures'
test.describe('未登录访问', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('访问受保护页面会跳转登录，登录后返回原页面', async ({ page }) => {
    await page.goto('/users')

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible()

    await page.getByLabel('账号').fill('admin')
    await page.getByLabel('密码').fill('123456')
    await page.getByRole('button', { name: /登\s*录/ }).click()

    await expect(page).toHaveURL(/\/users$/)
    await expect(page.getByRole('heading', { name: '用户管理', level: 4 })).toBeVisible()
  })

  test('账号或密码错误时停留在登录页并提示', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('密码').fill('wrong-password')
    await page.getByRole('button', { name: /登\s*录/ }).click()

    await expect(page.locator('.ant-message').getByText('账号或密码错误')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })
})

test.describe('已登录会话', () => {
  test('已登录访问 /login 会跳转仪表盘', async ({ page }) => {
    await page.goto('/login')

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: '仪表盘', level: 4 })).toBeVisible()
  })

  test('退出登录后回到登录页，受保护页面重新拦截', async ({ page }) => {
    await page.goto('/dashboard')

    await page.getByRole('button', { name: '账户菜单' }).click()
    await page.getByRole('menuitem', { name: '退出登录' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.locator('.ant-message').getByText('已退出登录')).toBeVisible()

    await page.goto('/users')
    await expect(page).toHaveURL(/\/login$/)
  })
})
