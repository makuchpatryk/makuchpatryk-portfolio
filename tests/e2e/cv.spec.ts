import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const fixture = fileURLToPath(new URL('./fixtures/two-pages-link.pdf', import.meta.url))

const stage = (page: import('@playwright/test').Page) => page.locator('main .overflow-x-auto')

test.describe('cv reader', () => {
  test('renders the page at the container width with text and link layers', async ({ page }) => {
    await page.goto('cv')
    const canvas = page.locator('canvas[role="img"]')
    await expect(canvas).toBeVisible()

    const canvasBox = (await canvas.boundingBox())!
    const containerWidth = await stage(page).evaluate(el => el.clientWidth)
    expect(canvasBox.height).toBeGreaterThan(0)
    expect(Math.abs(canvasBox.width - containerWidth)).toBeLessThan(1)

    await expect(page.locator('.textLayer')).toContainText('Senior Software Engineer')
  })

  // cv.pdf has no link annotations today, so the link layer and page navigation run against a 2-page fixture
  test('maps link annotations to anchors and pages through a longer document', async ({ page }) => {
    await page.route('**/cv.pdf', route => route.fulfill({ path: fixture, contentType: 'application/pdf' }))
    await page.goto('cv')
    await expect(page.locator('canvas[role="img"]')).toBeVisible()

    const github = page.locator('a.cvLink[href="https://github.com/makuchpatryk"]')
    await expect(github).toHaveAttribute('target', '_blank')
    await expect(github).toHaveAttribute('rel', 'noopener noreferrer')

    await expect(page.getByText('1 / 2')).toBeVisible()
    await page.getByRole('button', { name: /next page/i }).click()
    await expect(page.getByText('2 / 2')).toBeVisible()
    await expect(page.locator('.textLayer')).toContainText('Page two')
    await expect(page.locator('a.cvLink')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /next page/i })).toBeDisabled()
  })

  test('zoom in grows the page by one step and fit restores it', async ({ page }) => {
    await page.goto('cv')
    const canvas = page.locator('canvas[role="img"]')
    await expect(canvas).toBeVisible()
    const fitted = (await canvas.boundingBox())!.width

    await page.getByRole('button', { name: /zoom in/i }).click()
    await expect.poll(async () => (await canvas.boundingBox())!.width).toBeCloseTo(fitted * 1.25, -1)

    await page.getByRole('button', { name: /fit to width/i }).click()
    await expect.poll(async () => (await canvas.boundingBox())!.width).toBeCloseTo(fitted, -1)
  })

  test('a single page has no page navigation', async ({ page }) => {
    await page.goto('cv')
    await expect(page.locator('canvas[role="img"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /previous page|next page/i })).toHaveCount(0)
  })

  test('download link serves the pdf', async ({ page }) => {
    await page.goto('cv')
    const link = page.getByRole('link', { name: /download cv\.pdf/i })
    const response = await page.request.get(await link.evaluate(el => (el as HTMLAnchorElement).href))
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/pdf')
  })

  test('a missing pdf shows an alert and keeps the download link', async ({ page }) => {
    await page.route('**/cv.pdf', route => route.fulfill({ status: 404, body: 'not found' }))
    await page.goto('cv')
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('link', { name: /download cv\.pdf/i })).toBeVisible()
  })

  test('pdf.js is loaded on /cv only', async ({ page }) => {
    const pdfChunks = new Set<string>()
    page.on('response', async (r) => {
      if (!/\.m?js$/.test(r.url())) return
      if ((await r.text()).includes('InvalidPDFException')) pdfChunks.add(r.url())
    })
    await page.goto('cv')
    await expect(page.locator('canvas[role="img"]')).toBeVisible()
    expect(pdfChunks.size).toBeGreaterThan(0)

    const requested: string[] = []
    page.on('request', r => requested.push(r.url()))
    await page.goto('')
    await page.waitForLoadState('networkidle')
    for (const url of pdfChunks) expect(requested).not.toContain(url)
    expect(requested.filter(u => /pdf\.worker/.test(u))).toEqual([])
  })

  test('/pl/cv lands on the English page', async ({ page }) => {
    await page.goto('pl/cv')
    await expect(page).toHaveURL(/\/cv\/?$/)
    await expect(page).not.toHaveURL(/\/pl\//)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  })
})
