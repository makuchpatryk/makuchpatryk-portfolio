// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['.output/**', '.lighthouseci/**', 'docs/design/boards/**', 'playwright-report/**', 'test-results/**']
  },
  {
    rules: {
      // long Tailwind class lists make these two rules noise rather than signal
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off'
    }
  }
)
