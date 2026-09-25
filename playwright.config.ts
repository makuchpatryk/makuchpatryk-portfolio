import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PORT || 4173)
const base = process.env.E2E_BASE || '/'

// E2E runs against the built static site (`pnpm generate` first): E2E_BASE=/makuchpatryk/ for the non-root check.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}${base}`,
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } }
  ],
  webServer: {
    command: `node scripts/serve.mjs --dir .output/public --base ${base} --port ${port}`,
    url: `http://localhost:${port}${base}`,
    reuseExistingServer: !process.env.CI
  }
})
