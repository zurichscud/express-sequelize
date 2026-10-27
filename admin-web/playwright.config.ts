import { defineConfig, devices } from '@playwright/test'

const APP_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173'
const API_URL = process.env.E2E_API_ORIGIN ?? 'http://127.0.0.1:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: APP_URL,
    locale: 'zh-CN',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      // 后端未启动时自动拉起（依赖根目录的 .env 与 MySQL）
      command: 'npm run dev',
      cwd: '..',
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: `${APP_URL}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
