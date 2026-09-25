import type { Category, LocalizedProject, Project, Tag } from '../types/content'

export type TagFilterValue = Tag | 'all'

export function sortProjects(list: readonly Project[]): Project[] {
  return [...list].sort((a, b) => a.order - b.order)
}

export function featuredProjects(list: readonly Project[]): Project[] {
  return sortProjects(list).filter(p => p.featured)
}

export function detailProjects(list: readonly Project[]): Project[] {
  return sortProjects(list).filter(p => p.detail)
}

export function collectTags(list: readonly Project[]): Tag[] {
  const seen = new Set<Tag>()
  for (const p of sortProjects(list)) {
    for (const tag of p.tags) seen.add(tag)
  }
  return [...seen]
}

export function filterProjects(list: readonly Project[], tag: TagFilterValue): Project[] {
  const sorted = sortProjects(list)
  return tag === 'all' ? sorted : sorted.filter(p => p.tags.includes(tag))
}

/** prev/next among detail projects (wraps around); null when there is nothing else to show */
export function adjacentDetailProjects(list: readonly Project[], slug: string): { prev: Project | null, next: Project | null } {
  const detail = detailProjects(list)
  const index = detail.findIndex(p => p.slug === slug)
  if (index === -1 || detail.length < 2) return { prev: null, next: null }
  return {
    prev: detail[(index - 1 + detail.length) % detail.length]!,
    next: detail[(index + 1) % detail.length]!
  }
}

const CATEGORY_TEXT: Record<Category, string> = {
  'rag': 'text-cat-rag',
  'ai-workflow': 'text-cat-ai-workflow',
  'full-stack': 'text-cat-full-stack'
}

export function categoryTextClass(category: Category): string {
  return CATEGORY_TEXT[category]
}

type Translate = (key: string) => string
type Exists = (key: string) => boolean

/**
 * Resolves the card-level copy for a project. `translate` should already fall back to the default locale
 * (vue-i18n `fallbackLocale`); `exists` lets us fall back to the slug instead of showing a raw key.
 */
export function localizeProject(project: Project, translate: Translate, exists: Exists = () => true): LocalizedProject {
  const read = (field: string) => {
    const key = `projects.${project.slug}.${field}`
    return exists(key) ? translate(key) : project.slug
  }
  return {
    ...project,
    title: read('title'),
    summary: read('summary'),
    role: read('role'),
    effect: read('effect')
  }
}
