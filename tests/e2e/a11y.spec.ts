import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { locales, rel, routes } from './helpers'

const themes = ['dark', 'light'] as const

for (const theme of themes) {
  for (const { code, prefix } of locales) {
    for (const route of routes) {
      test(`axe WCAG 2.1 AA — ${theme} ${code} /${route}`, async ({ page }) => {
        await page.addInitScript(value => localStorage.setItem('theme', value), theme)
        await page.goto(rel(prefix, route))
        await page.waitForLoadState('networkidle')
        await expect(page.locator('html')).toHaveClass(new RegExp(theme))

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()

        const summary = results.violations.map(v => `${v.id} (${v.impact}): ${v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(' | ')}`)
        expect(summary).toEqual([])
      })
    }
  }
}

test('axe — mobile menu open', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only')
  await page.goto('')
  await page.locator('header summary').click()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(results.violations.map(v => v.id)).toEqual([])
})

test('axe — 404 page', async ({ page }) => {
  await page.goto('does-not-exist')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(results.violations.map(v => v.id)).toEqual([])
})
