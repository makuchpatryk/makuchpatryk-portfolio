export type Category = 'rag' | 'ai-workflow' | 'full-stack'
export type Tag
  = | 'rag'
    | 'ai-workflow'
    | 'llm-eval'
    | 'python'
    | 'fastapi'
    | 'postgres'
    | 'pgvector'
    | 'aws'
    | 'docker'
    | 'vue'
    | 'typescript'

export interface Pipeline {
  ingest: string[]
  query: string[]
  /** step keys rendered in accent colour */
  highlight?: string[]
}

export interface ProjectMedia {
  video?: string
  poster?: string
  cover?: string
  gallery?: string[]
}

export interface Project {
  slug: string
  featured: boolean
  order: number
  category: Category
  tags: Tag[]
  stack: string[]
  links: { demo?: string, code?: string }
  /** true => /projects/[slug] is prerendered */
  detail: boolean
  media?: ProjectMedia
  meta: { year: number, type: 'commercial' | 'personal' }
  pipeline?: Pipeline
  /** keys under `projects.<slug>.metrics.<key>.{value,label}` */
  metrics?: { key: string }[]
}

export interface Experience {
  id: string
  from: string | number
  to: string | number | null
  current: boolean
}

export interface StackGroup {
  id: string
  /** highlighted group (main focus) */
  focus?: boolean
  /** keys under `stack.items.<key>` */
  items: string[]
}

export interface SocialLinks {
  github: string
  linkedin: string
}

export interface SiteData {
  /** shell handle shown as `~/handle` */
  handle: string
  name: string
  city: string
  email: string
  links: SocialLinks
  /** path relative to `public/`, null => placeholder box */
  photo: string | null
  cv: string
}

/** i18n keys every detail project must define in both locales (relative to `projects.<slug>`). */
export const DETAIL_KEYS = [
  'title',
  'summary',
  'role',
  'effect',
  'duration',
  'problem.heading',
  'problem.body',
  'solution.heading',
  'solution.body',
  'architecture.body',
  'lessons'
] as const

export interface LocalizedProject extends Project {
  title: string
  summary: string
  role: string
  effect: string
}
