// Lighthouse CI against the built static site. Run `pnpm generate` first.
// Two form factors × 6 URLs (home, /projects, one detail page × EN/PL). Themes: LH runs the default (dark) theme;
// light-theme contrast is covered by axe in tests/e2e/a11y.spec.ts and tests/unit/contrast.test.ts.
const port = process.env.LH_PORT || 4175
const base = `http://localhost:${port}`
const urls = ['/', '/projects', '/projects/rag-assistant', '/pl', '/pl/projects', '/pl/projects/rag-assistant']
const preset = process.env.LH_FORM_FACTOR || 'mobile'

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
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }]
      }
    },
    upload: { target: 'filesystem', outputDir: `.lighthouseci/${preset}` }
  }
}
