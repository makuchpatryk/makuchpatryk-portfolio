import { describe, expect, it } from 'vitest'
import { projects } from '../../app/data/projects'
import type { Project } from '../../app/types/content'
import {
  adjacentDetailProjects,
  collectTags,
  detailProjects,
  featuredProjects,
  filterProjects,
  localizeProject,
  sortProjects
} from '../../app/utils/projects'

const make = (over: Partial<Project> & Pick<Project, 'slug'>): Project => ({
  featured: false,
  order: 1,
  category: 'rag',
  tags: [],
  stack: [],
  links: {},
  detail: false,
  meta: { year: 2025, type: 'personal' },
  ...over
})

describe('filterProjects', () => {
  const list = [
    make({ slug: 'a', order: 2, tags: ['python', 'rag'] }),
    make({ slug: 'b', order: 1, tags: ['python'] }),
    make({ slug: 'c', order: 3, tags: ['vue'] })
  ]

  it('returns everything, ordered, for "all"', () => {
    expect(filterProjects(list, 'all').map(p => p.slug)).toEqual(['b', 'a', 'c'])
  })

  it('keeps only projects with the tag', () => {
    expect(filterProjects(list, 'python').map(p => p.slug)).toEqual(['b', 'a'])
    expect(filterProjects(list, 'vue').map(p => p.slug)).toEqual(['c'])
  })

  it('returns an empty list for an unused tag', () => {
    expect(filterProjects(list, 'aws')).toEqual([])
  })

  it('does not mutate the input', () => {
    const copy = [...list]
    filterProjects(list, 'all')
    expect(list).toEqual(copy)
  })
})

describe('selection helpers', () => {
  it('orders by `order`', () => {
    expect(sortProjects(projects).map(p => p.order)).toEqual([...projects.map(p => p.order)].sort((a, b) => a - b))
  })

  it('selects exactly the 3 featured projects from the placeholder data', () => {
    expect(featuredProjects(projects)).toHaveLength(3)
    expect(projects.length).toBeGreaterThanOrEqual(7)
  })

  it('lists detail projects only', () => {
    expect(detailProjects(projects).every(p => p.detail)).toBe(true)
  })

  it('collects each tag once', () => {
    const tags = collectTags(projects)
    expect(new Set(tags).size).toBe(tags.length)
  })

  it('every featured project has a detail page (home links to case studies)', () => {
    expect(featuredProjects(projects).every(p => p.detail)).toBe(true)
  })

  it('has unique slugs and orders', () => {
    expect(new Set(projects.map(p => p.slug)).size).toBe(projects.length)
    expect(new Set(projects.map(p => p.order)).size).toBe(projects.length)
  })
})

describe('adjacentDetailProjects', () => {
  const list = [
    make({ slug: 'a', order: 1, detail: true }),
    make({ slug: 'skip', order: 2, detail: false }),
    make({ slug: 'b', order: 3, detail: true }),
    make({ slug: 'c', order: 4, detail: true })
  ]

  it('walks only detail projects and wraps around', () => {
    expect(adjacentDetailProjects(list, 'b')).toMatchObject({ prev: { slug: 'a' }, next: { slug: 'c' } })
    expect(adjacentDetailProjects(list, 'a')).toMatchObject({ prev: { slug: 'c' }, next: { slug: 'b' } })
    expect(adjacentDetailProjects(list, 'c')).toMatchObject({ prev: { slug: 'b' }, next: { slug: 'a' } })
  })

  it('returns nothing for unknown / non-detail slugs or a single detail project', () => {
    expect(adjacentDetailProjects(list, 'skip')).toEqual({ prev: null, next: null })
    expect(adjacentDetailProjects([make({ slug: 'only', detail: true })], 'only')).toEqual({ prev: null, next: null })
  })
})

describe('localizeProject', () => {
  const project = make({ slug: 'demo' })

  it('reads card copy from projects.<slug>.*', () => {
    const t = (key: string) => `t:${key}`
    expect(localizeProject(project, t)).toMatchObject({
      title: 't:projects.demo.title',
      summary: 't:projects.demo.summary',
      role: 't:projects.demo.role',
      effect: 't:projects.demo.effect'
    })
  })

  it('falls back to the slug when a key is missing instead of leaking the raw key', () => {
    const localized = localizeProject(project, key => key, () => false)
    expect(localized.title).toBe('demo')
  })
})
