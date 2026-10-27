import { expect, test } from './fixtures'

test.describe('仪表盘', () => {
  test('展示统计数据、图表与最新文章', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: '仪表盘', level: 4 })).toBeVisible()

    for (const title of ['文章总数', '注册用户', '课程总数', '内容分类']) {
      await expect(page.getByText(title, { exact: true })).toBeVisible()
    }

    await expect(page.getByText('用户增长趋势', { exact: true })).toBeVisible()
    await expect(page.getByText('用户性别分布', { exact: true })).toBeVisible()
    await expect(page.getByText('最新文章', { exact: true })).toBeVisible()

    const articleRows = page.locator('.ant-table-tbody tr.ant-table-row')
    await expect(articleRows.first()).toBeVisible()
    expect(await articleRows.count()).toBeGreaterThan(0)
  })

  test('侧边栏导航可切换页面', async ({ page }) => {
    await page.goto('/dashboard')

    await page.getByRole('menuitem', { name: '文章管理' }).click()
    await expect(page).toHaveURL(/\/articles$/)
    await expect(page.getByRole('heading', { name: '文章管理', level: 4 })).toBeVisible()

    await page.getByRole('menuitem', { name: '用户管理' }).click()
    await expect(page).toHaveURL(/\/users$/)
    await expect(page.getByRole('heading', { name: '用户管理', level: 4 })).toBeVisible()
  })

  test('未知路由显示 404 并可返回仪表盘', async ({ page }) => {
    await page.goto('/not-exist-page')

    await expect(page.getByText('抱歉，你访问的页面不存在')).toBeVisible()

    await page.getByRole('button', { name: '返回仪表盘' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })
})
