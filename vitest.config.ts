import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Pure-logic tests only (utils, data, locale files, tokens); components are covered by Playwright on the built site.
export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) }
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts']
  }
})
