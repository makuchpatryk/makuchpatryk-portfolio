import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../../app/assets/css/main.css', import.meta.url), 'utf8')

function tokens(selector: string): Record<string, string> {
  const block = css.match(new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`))?.[1] ?? ''
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map(m => [m[1]!, m[2]!]))
}

const dark = tokens(':root')
const light = { ...dark, ...tokens('.light') }

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const surfaces = ['bg', 'surface', 'surface-2']
const textTokens = ['text', 'text-2', 'muted', 'faint', 'accent', 'cat-rag', 'cat-ai-workflow', 'cat-full-stack', 'cat-extra']

describe('contrast helper', () => {
  it('matches known values', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1)
    // the original design token that this project had to lift
    expect(contrast('#5C6470', '#0B0D10')).toBeCloseTo(3.25, 1)
  })
})

for (const [name, theme] of [['dark', dark], ['light', light]] as const) {
  describe(`${name} theme (WCAG AA text, 4.5:1)`, () => {
    it('parsed the token block', () => {
      expect(Object.keys(theme).length).toBeGreaterThan(10)
    })

    for (const fg of textTokens) {
      for (const bg of surfaces) {
        it(`${fg} on ${bg}`, () => {
          expect(contrast(theme[fg]!, theme[bg]!)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }

    it('accent-fg on accent (buttons)', () => {
      expect(contrast(theme['accent-fg']!, theme.accent!)).toBeGreaterThanOrEqual(4.5)
    })
  })
}
