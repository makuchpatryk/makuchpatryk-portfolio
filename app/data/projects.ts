import type { Project } from '../types/content'

export const projects: Project[] = [
  {
    slug: 'ai-book-chat',
    featured: true,
    order: 1,
    category: 'rag',
    tags: ['rag', 'python', 'fastapi', 'pgvector', 'celery', 'ollama', 'react'],
    stack: ['Python', 'FastAPI', 'PostgreSQL + pgvector', 'Celery + Redis', 'Ollama', 'Groq', 'React 19', 'TypeScript'],
    links: { code: 'https://github.com/makuchpatryk/ai-book-chat' },
    detail: true,
    media: { cover: 'images/ai-book-chat/cover.webp' },
    meta: { year: 2026, type: 'personal' },
    pipeline: {
      ingest: ['documents', 'parsing', 'chunking', 'embeddings', 'pgvector'],
      query: ['question', 'rewrite', 'retrieval', 'rerank', 'llm', 'ui'],
      highlight: ['pgvector', 'rerank']
    }
  },
  {
    slug: 'blind-clue',
    featured: false,
    order: 3,
    category: 'full-stack',
    tags: ['typescript', 'vue', 'fastify', 'websockets', 'sqlite', 'multiplayer', 'game'],
    stack: ['TypeScript', 'Vue 3', 'Pinia', 'Fastify', 'Socket.io', 'SQLite'],
    // blind-clue.xyz fails its TLS handshake (checked 2026-10-02), so no demo link until it is fixed
    links: { code: 'https://github.com/makuchpatryk/BlindClue' },
    detail: true,
    media: { cover: 'images/blind-clue/cover.webp' },
    meta: { year: 2026, type: 'personal' }
  },
  {
    slug: 'perplex-image',
    featured: false,
    order: 4,
    category: 'full-stack',
    tags: ['typescript', 'nuxt', 'supabase', 'pinia', 'playwright', 'game', 'puzzle'],
    stack: ['Nuxt 3', 'TypeScript', 'Pinia', 'Tailwind', 'Supabase', 'Vitest', 'Playwright'],
    links: { demo: 'https://perplex-image.vercel.app', code: 'https://github.com/CodingCru/perplex-image' },
    detail: true,
    media: { cover: 'images/perplex-image/cover.webp' },
    meta: { year: 2024, type: 'personal' }
  },
  {
    slug: 'ai-semantic-db',
    featured: false,
    order: 5,
    category: 'rag',
    tags: ['rag', 'python', 'pgvector', 'ollama', 'cli', 'docker'],
    stack: ['Python 3.12', 'Typer', 'SQLAlchemy', 'Alembic', 'PostgreSQL + pgvector', 'Ollama (bge-m3)'],
    links: { code: 'https://github.com/makuchpatryk/ai-semantic-db' },
    detail: true,
    media: { cover: 'images/ai-semantic-db/cover.webp' },
    meta: { year: 2026, type: 'personal' },
    pipeline: {
      ingest: ['schema', 'records', 'embeddings', 'pgvector'],
      query: ['question', 'embeddings', 'retrieval', 'cli'],
      highlight: ['pgvector']
    }
  },
  {
    slug: 'quiz-forge',
    featured: false,
    order: 6,
    category: 'full-stack',
    tags: ['typescript', 'nuxt', 'nestjs', 'postgres', 'turborepo', 'playwright', 'education'],
    stack: ['Nuxt 4', 'NestJS', 'TypeORM', 'PostgreSQL', 'Turborepo', 'Docker'],
    links: { code: 'https://github.com/makuchpatryk/quiz-forge' },
    detail: true,
    media: { cover: 'images/quiz-forge/cover.webp' },
    meta: { year: 2026, type: 'personal' }
  },
  {
    slug: 'lean-track',
    featured: false,
    order: 7,
    category: 'full-stack',
    tags: ['typescript', 'vue', 'fastify', 'postgres', 'docker', 'jwt', 'nutrition'],
    stack: ['Vue 3', 'Fastify', 'TypeORM', 'PostgreSQL', 'Docker'],
    links: { code: 'https://github.com/makuchpatryk/lean-track' },
    detail: true,
    media: { cover: 'images/lean-track/cover.webp' },
    meta: { year: 2026, type: 'personal' }
  },
  {
    slug: 'match-colours',
    featured: false,
    order: 8,
    category: 'full-stack',
    tags: ['vue', 'nuxt', 'game'],
    stack: ['Nuxt 3', 'Vue 3'],
    links: { demo: 'https://match-colours.vercel.app', code: 'https://github.com/makuchpatryk/MatchColours' },
    detail: true,
    media: { cover: 'images/match-colours/cover.webp' },
    meta: { year: 2024, type: 'personal' }
  },
  {
    slug: 'sudoku',
    featured: false,
    order: 9,
    category: 'full-stack',
    tags: ['typescript', 'nextjs', 'react', 'game', 'puzzle'],
    stack: ['Next.js', 'React', 'TypeScript'],
    links: { demo: 'https://makuchpatryk.github.io/sudoku/', code: 'https://github.com/makuchpatryk/sudoku' },
    detail: true,
    media: { cover: 'images/sudoku/cover.webp' },
    meta: { year: 2024, type: 'personal' }
  },
  {
    slug: 'screencaster',
    featured: true,
    order: 10,
    category: 'ai-workflow',
    tags: ['ai-workflow', 'go', 'mcp', 'playwright', 'ffmpeg', 'docker', 'cli'],
    stack: ['Go', 'Playwright', 'Piper TTS', 'ffmpeg', 'SQLite', 'MCP', 'Docker'],
    links: { code: 'https://github.com/makuchpatryk/screencaster' },
    detail: true,
    media: {
      video: 'videos/screencaster.mp4',
      poster: 'images/screencaster/poster.webp',
      cover: 'images/screencaster/cover.webp',
      gallery: ['images/screencaster/script.webp', 'images/screencaster/render.webp']
    },
    meta: { year: 2026, type: 'personal' }
  },
  {
    slug: 'first-million',
    featured: true,
    order: 2,
    category: 'full-stack',
    tags: ['typescript', 'vue', 'websockets', 'multiplayer', 'game'],
    stack: ['TypeScript', 'Vue 3', 'Vite', 'Cloudflare Workers', 'Durable Objects', 'Firebase Auth', 'Zod'],
    links: { demo: 'https://first-milion.pages.dev', code: 'https://github.com/makuchpatryk/first-milion' },
    detail: true,
    media: {
      video: 'videos/first-million.mp4',
      poster: 'images/first-million/poster.webp',
      cover: 'images/first-million/cover.webp',
      gallery: ['images/first-million/setup.webp', 'images/first-million/margin-call.webp']
    },
    meta: { year: 2026, type: 'personal' }
  }
]
