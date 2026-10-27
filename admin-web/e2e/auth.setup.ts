import { mkdir } from 'node:fs/promises'
import { expect, test as setup } from '@playwright/test'
import { loginAsAdmin } from './helpers'

const STORAGE_STATE = 'e2e/.auth/admin.json'

setup('登录并保存登录态', async ({ page }) => {
  await loginAsAdmin(page)

  await expect(page.getByRole('heading', { name: '仪表盘', level: 4 })).toBeVisible()

  await mkdir('e2e/.auth', { recursive: true })
  await page.context().storageState({ path: STORAGE_STATE })
})
