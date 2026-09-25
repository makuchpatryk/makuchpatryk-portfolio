import tailwindcss from '@tailwindcss/vite'
import { projects } from './app/data/projects'

// Build stays host-agnostic: base URL and site URL come from env (see docs/deploy.md).
// NUXT_PUBLIC_SITE_URL is the ORIGIN only (https://user.github.io); modules append NUXT_APP_BASE_URL themselves.
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://makuchpatryk.example').replace(/\/$/, '')
const baseURL = process.env.NUXT_APP_BASE_URL || '/'

const detailPaths = projects.filter(p => p.detail).map(p => `/projects/${p.slug}`)
const pagePaths = ['/', '/projects', ...detailPaths]
const localePrefix = { en: '', pl: '/pl' } as const
type LocaleCode = keyof typeof localePrefix

const localized = (code: LocaleCode, path: string) => (localePrefix[code] + (path === '/' ? '' : path)) || '/'

// every URL lists all language versions (hreflang) so search engines pair EN/PL pages
function sitemapUrls(locale: LocaleCode) {
  return pagePaths.map(path => ({
    loc: localized(locale, path),
    alternatives: [
      { hreflang: 'en', href: localized('en', path) },
      { hreflang: 'pl', href: localized('pl', path) },
      { hreflang: 'x-default', href: localized('en', path) }
    ]
  }))
}

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-og-image',
    'nuxt-schema-org'
  ],
  ssr: true,
  devtools: { enabled: false },
  app: {
    baseURL,
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` }]
    }
  },
  css: ['~/assets/css/main.css'],
  site: {
    url: siteUrl,
    name: 'makuchpatryk',
    defaultLocale: 'en'
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'theme'
  },
  runtimeConfig: {
    public: {
      siteUrl
    }
  },
  experimental: {
    // tiny static payloads: inline them in the HTML instead of an extra _payload.json round trip
    payloadExtraction: false
  },
  compatibilityDate: '2026-01-01',
  nitro: {
    // preset comes from the NITRO_PRESET env (github_pages in the deploy workflow), never hardcoded
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ['/', '/pl', '/projects', '/pl/projects', ...detailPaths.flatMap(p => [p, `/pl${p}`])]
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  typescript: {
    strict: true
  },
  eslint: {
    config: { stylistic: { commaDangle: 'never', braceStyle: '1tbs' } }
  },
  fonts: {
    defaults: {
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext']
    }
  },
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'pl', language: 'pl-PL', name: 'Polski', file: 'pl.json' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    baseUrl: siteUrl,
    vueI18n: './i18n.config.ts'
  },
  image: {
    format: ['avif', 'webp'],
    quality: 80
  },
  ogImage: {
    defaults: { width: 1200, height: 630 }
  },
  robots: {
    // robots.txt is only valid at the domain root, so project-page hosting (base != '/') skips it
    robotsTxt: baseURL === '/',
    groups: [{ userAgent: '*', allow: '/' }]
  },
  sitemap: {
    zeroRuntime: true,
    // explicit per-locale sitemaps: the automatic i18n split mis-sorts URLs when hosted under a base path
    autoI18n: false,
    sitemaps: {
      'en-US': { includeAppSources: false, urls: sitemapUrls('en') },
      'pl-PL': { includeAppSources: false, urls: sitemapUrls('pl') }
    }
  }
})
