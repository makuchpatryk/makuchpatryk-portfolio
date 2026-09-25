import type { Page } from '@playwright/test'

export const locales = [
  { code: 'en', prefix: '' },
  { code: 'pl', prefix: 'pl/' }
] as const

/** paths relative to Playwright's baseURL (keeps the non-root base check working) */
export const routes = ['', 'projects', 'projects/rag-assistant', 'projects/fullstack-platform']

export async function setTheme(page: Page, theme: 'dark' | 'light') {
  await page.addInitScript(value => localStorage.setItem('theme', value), theme)
}

export const rel = (prefix: string, route: string) => `${prefix}${route}`

/** the mobile menu is a <details>; click its <summary> (the sr-only label is covered by the icon) */
export async function openMobileMenu(page: Page) {
  await page.locator('header summary').click()
}
