import { describe, expect, it } from 'vitest'
// @ts-expect-error plain .mjs script shared with `pnpm check:locales`
import { compareLocales, flattenKeys, readLocale } from '../../scripts/check-locales.mjs'
import { experience } from '../../app/data/experience'
import { projects } from '../../app/data/projects'
import { stack } from '../../app/data/stack'
import { DETAIL_KEYS } from '../../app/types/content'

const en = readLocale('en')
const pl = readLocale('pl')

const get = (obj: unknown, path: string) =>
  path.split('.').reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj)

describe('locale files', () => {
  it('en and pl have identical key sets', () => {
    const { missingInFirst, missingInSecond } = compareLocales(en, pl)
    expect(missingInSecond, 'missing in pl.json').toEqual([])
    expect(missingInFirst, 'missing in en.json').toEqual([])
  })

  it('has no empty strings', () => {
    for (const [name, locale] of [['en', en], ['pl', pl]] as const) {
      const empty = (flattenKeys(locale) as string[]).filter(key => get(locale, key) === '')
      expect(empty, `${name}.json`).toEqual([])
    }
  })
})

describe('detail completeness', () => {
  for (const project of projects) {
    for (const [name, locale] of [['en', en], ['pl', pl]] as const) {
      const base = `projects.${project.slug}`

      it(`${project.slug} (${name}) has card copy`, () => {
        for (const key of ['title', 'summary', 'role', 'effect']) {
          expect(get(locale, `${base}.${key}`), `${base}.${key}`).toBeTruthy()
        }
      })

      if (project.detail) {
        it(`${project.slug} (${name}) has all detail keys`, () => {
          for (const key of DETAIL_KEYS) {
            expect(get(locale, `${base}.${key}`), `${base}.${key}`).toBeTruthy()
          }
        })

        it(`${project.slug} (${name}) has value+label for every metric`, () => {
          for (const metric of project.metrics ?? []) {
            expect(get(locale, `${base}.metrics.${metric.key}.value`)).toBeTruthy()
            expect(get(locale, `${base}.metrics.${metric.key}.label`)).toBeTruthy()
          }
        })

        it(`${project.slug} (${name}) has translations for all pipeline steps`, () => {
          for (const step of [...(project.pipeline?.ingest ?? []), ...(project.pipeline?.query ?? [])]) {
            expect(get(locale, `pipeline.steps.${step}`), `pipeline.steps.${step}`).toBeTruthy()
          }
        })
      }
    }
  }
})

describe('data ↔ copy', () => {
  it('every experience entry has copy in both locales', () => {
    for (const e of experience) {
      for (const locale of [en, pl]) {
        for (const key of ['role', 'company', 'location', 'bullets']) {
          expect(get(locale, `experience.${e.id}.${key}`), `experience.${e.id}.${key}`).toBeTruthy()
        }
      }
    }
  })

  it('every stack group and item has a label in both locales', () => {
    for (const group of stack) {
      for (const locale of [en, pl]) {
        expect(get(locale, `stack.groups.${group.id}`)).toBeTruthy()
        for (const item of group.items) expect(get(locale, `stack.items.${item}`), item).toBeTruthy()
      }
    }
  })

  it('every category has a label in both locales', () => {
    for (const category of new Set(projects.map(p => p.category))) {
      for (const locale of [en, pl]) {
        expect(get(locale, `categories.${category}`)).toBeTruthy()
        expect(get(locale, `pipeline.label.${category}`)).toBeTruthy()
      }
    }
  })
})
