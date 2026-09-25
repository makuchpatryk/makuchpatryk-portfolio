import { expect, test } from '@playwright/test'
import { locales, rel, routes } from './helpers'

for (const { code, prefix } of locales) {
  for (const route of routes) {
    test(`smoke ${code} /${route}`, async ({ page }) => {
      const failed: string[] = []
      const errors: string[] = []
      page.on('response', (r) => {
        if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`)
      })
      page.on('pageerror', e => errors.push(e.message))
      page.on('console', (m) => {
        if (m.type() === 'error' || /hydration/i.test(m.text())) errors.push(m.text())
      })

      const response = await page.goto(rel(prefix, route))
      expect(response?.status()).toBe(200)
      await page.waitForLoadState('networkidle')

      await expect(page.locator('html')).toHaveAttribute('lang', code === 'en' ? 'en-US' : 'pl-PL')
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      expect(await page.title()).not.toBe('')
      expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy()
      expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toContain('/_og/')

      const hreflangs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(els => els.map(e => e.getAttribute('hreflang')))
      expect(hreflangs).toEqual(expect.arrayContaining(['en', 'pl']))

      expect(failed, 'failed requests').toEqual([])
      expect(errors, 'console/page errors').toEqual([])
    })
  }
}

test('titles and descriptions are unique across pages × locales', async ({ page }) => {
  const seen = new Map<string, string>()
  for (const { prefix } of locales) {
    for (const route of routes) {
      await page.goto(rel(prefix, route))
      const title = await page.title()
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
      for (const [kind, value] of [['title', title], ['description', description], ['og:image', ogImage]] as const) {
        const key = `${kind}:${value}`
        const clash = seen.get(key)
        // pages that share a placeholder title are only allowed to differ by locale/route
        expect(clash, `duplicate ${kind} "${value}" on ${prefix}${route} and ${clash}`).toBeUndefined()
        seen.set(key, `${prefix}${route}`)
      }
    }
  }
})

test('unknown route serves 404.html with a way home', async ({ page }) => {
  const response = await page.goto('does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: /home|główn/i }).first()).toBeVisible()
})

test('project without detail page is not prerendered', async ({ page }) => {
  const response = await page.goto('projects/document-search')
  expect(response?.status()).toBe(404)
})

test('internal links and public files respect the base URL', async ({ page, baseURL }) => {
  const basePath = new URL(baseURL!).pathname
  await page.goto('')
  const hrefs = await page.locator('a[href^="/"]').evaluateAll(els => els.map(e => e.getAttribute('href')!))
  expect(hrefs.length).toBeGreaterThan(0)
  for (const href of hrefs) expect(href.startsWith(basePath), href).toBe(true)

  const cv = page.locator('a[href$="cv.pdf"]').first()
  const cvResponse = await page.request.get((await cv.evaluate(el => (el as HTMLAnchorElement).href)))
  expect(cvResponse.status()).toBe(200)
  expect(cvResponse.headers()['content-type']).toContain('pdf')

  const sitemap = await page.request.get(new URL('sitemap.xml', baseURL!).toString())
  expect(sitemap.status()).toBe(200)
  // robots.txt only exists at the domain root; project-page hosting (non-root base) skips it
  if (basePath === '/') {
    const robots = await page.request.get(new URL('robots.txt', baseURL!).toString())
    expect(robots.status()).toBe(200)
  }
})
