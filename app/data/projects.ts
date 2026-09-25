import type { Project } from '../types/content'

export const projects: Project[] = [
  {
    slug: 'rag-assistant',
    featured: true,
    order: 1,
    category: 'rag',
    tags: ['python', 'fastapi', 'rag', 'pgvector', 'aws'],
    stack: ['Python', 'FastAPI', 'pgvector', 'AWS'],
    links: { demo: 'https://example.com/[demo]', code: 'https://github.com/[github-user]/[repo]' },
    detail: true,
    meta: { year: 2025, type: 'commercial' },
    pipeline: {
      ingest: ['documents', 'chunking', 'embeddings', 'pgvector'],
      query: ['question', 'retrieval', 'llm', 'fastapi', 'ui'],
      highlight: ['pgvector', 'llm']
    },
    metrics: [{ key: 'accuracy' }, { key: 'latency' }, { key: 'cost' }]
  },
  {
    slug: 'ai-workflow-automation',
    featured: true,
    order: 2,
    category: 'ai-workflow',
    tags: ['python', 'ai-workflow', 'aws'],
    stack: ['Python', 'AWS'],
    links: { demo: 'https://example.com/[demo]', code: 'https://github.com/[github-user]/[repo]' },
    detail: true,
    meta: { year: 2025, type: 'commercial' },
    pipeline: {
      ingest: ['trigger', 'extraction', 'llm'],
      query: ['validation', 'action', 'audit'],
      highlight: ['llm']
    },
    metrics: [{ key: 'time' }, { key: 'volume' }, { key: 'errors' }]
  },
  {
    slug: 'fullstack-platform',
    featured: true,
    order: 3,
    category: 'full-stack',
    tags: ['fastapi', 'postgres', 'vue', 'typescript'],
    stack: ['FastAPI', 'PostgreSQL', 'Vue', 'TypeScript'],
    links: { demo: 'https://example.com/[demo]', code: 'https://github.com/[github-user]/[repo]' },
    detail: true,
    meta: { year: 2024, type: 'personal' },
    metrics: [{ key: 'users' }, { key: 'uptime' }, { key: 'deploys' }]
  },
  {
    slug: 'llm-eval-harness',
    featured: false,
    order: 4,
    category: 'ai-workflow',
    tags: ['python', 'llm-eval', 'docker'],
    stack: ['Python', 'Docker'],
    links: { code: 'https://github.com/[github-user]/[repo]' },
    detail: true,
    meta: { year: 2025, type: 'personal' },
    metrics: [{ key: 'cases' }, { key: 'runtime' }, { key: 'regressions' }]
  },
  {
    slug: 'document-search',
    featured: false,
    order: 5,
    category: 'rag',
    tags: ['rag', 'postgres', 'pgvector'],
    stack: ['PostgreSQL', 'pgvector'],
    links: { code: 'https://github.com/[github-user]/[repo]' },
    detail: false,
    meta: { year: 2024, type: 'personal' }
  },
  {
    slug: 'internal-dashboard',
    featured: false,
    order: 6,
    category: 'full-stack',
    tags: ['vue', 'typescript', 'docker'],
    stack: ['Vue', 'TypeScript', 'Docker'],
    links: { demo: 'https://example.com/[demo]' },
    detail: false,
    meta: { year: 2023, type: 'commercial' }
  },
  {
    slug: 'api-gateway',
    featured: false,
    order: 7,
    category: 'full-stack',
    tags: ['python', 'fastapi', 'aws', 'docker'],
    stack: ['Python', 'FastAPI', 'AWS'],
    links: { code: 'https://github.com/[github-user]/[repo]' },
    detail: false,
    meta: { year: 2023, type: 'commercial' }
  }
]
