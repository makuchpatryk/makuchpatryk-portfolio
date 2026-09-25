import { expect, test } from '@playwright/test'
import { openMobileMenu, setTheme } from './helpers'

test.describe('theme', () => {
  test('toggle switches and persists across reload', async ({ page, isMobile }) => {
    await page.goto('')
    await expect(page.locator('html')).toHaveClass(/dark/)
    if (isMobile) await openMobileMenu(page)
    await page.getByRole('button', { name: /light theme|jasny motyw/i }).click()
    await expect(page.locator('html')).toHaveClass(/light/)
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light')

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/light/)
  })

  test('no flash: saved theme is applied before the document finishes parsing', async ({ page }) => {
    await setTheme(page, 'light')
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        (window as unknown as { __themeAtDcl: string }).__themeAtDcl = document.documentElement.className
      })
    })
    await page.goto('')
    expect(await page.evaluate(() => (window as unknown as { __themeAtDcl: string }).__themeAtDcl)).toContain('light')
    // and it survives hydration without an attribute mismatch warning
  })

  test('default is dark', async ({ page }) => {
    await page.goto('')
    expect(await page.locator('html').getAttribute('class')).toContain('dark')
    expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe('#0B0D10')
  })
})

test.describe('language', () => {
  test('switcher keeps the path', async ({ page, isMobile }) => {
    await page.goto('projects/rag-assistant')
    if (isMobile) await openMobileMenu(page)
    await page.getByRole('link', { name: 'Polski' }).first().click()
    await expect(page).toHaveURL(/\/pl\/projects\/rag-assistant\/?$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl-PL')

    if (isMobile) await openMobileMenu(page)
    await page.getByRole('link', { name: 'English' }).first().click()
    await expect(page).toHaveURL(/\/projects\/rag-assistant\/?$/)
    await expect(page).not.toHaveURL(/\/pl\//)
  })

  test('no automatic redirect based on browser language', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'pl-PL' })
    const page = await context.newPage()
    await page.goto('')
    await expect(page).not.toHaveURL(/\/pl\/?$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    await context.close()
  })
})

test.describe('navigation', () => {
  test('nav anchors scroll to their sections', async ({ page, isMobile }) => {
    await page.goto('')
    if (isMobile) await openMobileMenu(page)
    await page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: /stack/ }).first().click()
    await expect(page).toHaveURL(/#stack$/)
    await expect(page.locator('#stack')).toBeInViewport()
  })

  test('home links to /projects and a case study', async ({ page }) => {
    await page.goto('')
    await page.getByRole('link', { name: /all projects/i }).click()
    await expect(page).toHaveURL(/\/projects\/?$/)
    await page.getByRole('link', { name: /details/i }).first().click()
    await expect(page).toHaveURL(/\/projects\/[a-z-]+\/?$/)
    await expect(page.getByRole('navigation', { name: /table of contents/i })).toBeVisible()
  })

  test('detail page: prev/next cycles among detail projects', async ({ page }) => {
    await page.goto('projects/rag-assistant')
    await page.getByRole('link', { name: /next project/i }).click()
    await expect(page).toHaveURL(/ai-workflow-automation/)
  })
})

test.describe('tag filter', () => {
  test('filters to one tag, syncs ?tag= and restores from the URL', async ({ page }) => {
    await page.goto('projects')
    const cards = page.getByRole('article')
    const total = await cards.count()
    expect(total).toBe(7)

    await page.getByRole('button', { name: 'vue', exact: true }).click()
    await expect(page).toHaveURL(/tag=vue/)
    const filtered = await cards.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThan(total)
    await expect(page.getByRole('button', { name: 'vue', exact: true })).toHaveAttribute('aria-pressed', 'true')

    await page.reload()
    await expect(cards).toHaveCount(filtered)

    await page.getByRole('button', { name: 'all', exact: true }).click()
    await expect(page).not.toHaveURL(/tag=/)
    await expect(cards).toHaveCount(total)
  })

  test('shows every project without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('http://localhost:' + (process.env.PORT || 4173) + (process.env.E2E_BASE || '/') + 'projects')
    await expect(page.getByRole('article')).toHaveCount(7)
    await context.close()
  })
})

test.describe('no-JS content', () => {
  test('home renders content, sections and mobile menu works without JS', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('http://localhost:' + (process.env.PORT || 4173) + (process.env.E2E_BASE || '/'))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    for (const id of ['projects', 'experience', 'stack', 'about', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
    }
    await context.close()
  })
})

test.describe('keyboard', () => {
  test('skip link is first, becomes visible and moves focus to main', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard flow is desktop-only')
    await page.goto('')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: /skip to content/i })
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
  })

  test('every tab stop in the header shows a visible focus indicator', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard flow is desktop-only')
    await page.goto('')
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab')
      const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement
        const style = getComputedStyle(el)
        return { tag: el.tagName, style: style.outlineStyle, width: parseFloat(style.outlineWidth) }
      })
      if (outline.tag === 'BODY') continue
      expect(outline.style, `tab stop ${i + 1}`).not.toBe('none')
      expect(outline.width).toBeGreaterThan(0)
    }
  })

  test('mobile menu opens with the keyboard and closes on Escape', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only')
    await page.goto('')
    const summary = page.locator('header summary')
    await summary.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('header details')).toHaveAttribute('open', '')
    await page.keyboard.press('Escape')
    await expect(page.locator('header details')).not.toHaveAttribute('open', '')
  })
})

test.describe('media', () => {
  test('detail page shows the video slot (placeholder until a demo video is configured)', async ({ page }) => {
    await page.goto('projects/rag-assistant')
    await expect(page.getByText('demo.mp4')).toBeVisible()
    const videos = page.locator('video')
    if (await videos.count()) {
      await expect(videos.first()).toHaveAttribute('preload', 'none')
      await expect(videos.first()).toHaveAttribute('playsinline', '')
    }
  })
})
