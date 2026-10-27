import { expect, test as base } from '@playwright/test'
import { cleanupE2EData } from './helpers'

interface Fixtures {
  cleanupTestData: void
  consoleGuard: void
}

/**
 * 公共 fixture：
 * - cleanupTestData：每个用例结束后清理 E2E_ 前缀的数据
 * - consoleGuard：页面出现 console.error 或未捕获异常时直接用例失败
 */
export const test = base.extend<Fixtures>({
  cleanupTestData: [
    async ({ request }, use) => {
      await use()
      await cleanupE2EData(request)
    },
    { auto: true },
  ],

  consoleGuard: [
    async ({ page }, use) => {
      const errors: string[] = []

      page.on('console', (message) => {
        if (message.type() === 'error') {
          errors.push(message.text())
        }
      })
      page.on('pageerror', (error) => {
        errors.push(error.message)
      })

      await use()

      expect(errors, `页面出现控制台错误：\n${errors.join('\n')}`).toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
