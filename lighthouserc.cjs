// Lighthouse CI against the built static site. Run `pnpm generate` first.
// Two form factors × 6 URLs (home, /projects, one detail page × EN/PL). Themes: LH runs the default (dark) theme;
// light-theme contrast is covered by axe in tests/e2e/a11y.spec.ts and tests/unit/contrast.test.ts.
const port = process.env.LH_PORT || 4175
const base = `http://localhost:${port}`
const urls = ['/', '/projects', '/projects/rag-assistant', '/pl', '/pl/projects', '/pl/projects/rag-assistant']
const preset = process.env.LH_FORM_FACTOR || 'mobile'
// Mobile perf runs under 4x CPU + slow-4G throttling: Vue/Nuxt/vue-i18n boot alone costs ~300 ms TBT, so 0.95 is out of
// reach without dropping hydration (measured on a GitHub runner: 0.81-0.94). Desktop and every other category keep 0.95.
const minPerformance = preset === 'desktop' ? 0.95 : 0.75

module.exports = {
  ci: {
    collect: {
      url: urls.map(u => `${base}${u}`),
      numberOfRuns: 1,
      startServerCommand: `node scripts/serve.mjs --port ${port}`,
      startServerReadyPattern: 'serving',
      settings: {
        preset: preset === 'desktop' ? 'desktop' : undefined,
        chromeFlags: '--no-sandbox --headless=new'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: minPerformance }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }]
      }
    },
    upload: { target: 'filesystem', outputDir: `.lighthouseci/${preset}` }
  }
}
