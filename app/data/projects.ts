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
    meta: { year: 2026, type: 'personal' },
    pipeline: {
      ingest: ['documents', 'parsing', 'chunking', 'embeddings', 'pgvector'],
      query: ['question', 'rewrite', 'retrieval', 'rerank', 'llm', 'ui'],
      highlight: ['pgvector', 'rerank']
    }
  },
  {
    slug: 'blind-clue',
    featured: true,
    order: 2,
    category: 'full-stack',
    tags: ['typescript', 'vue', 'fastify', 'websockets', 'sqlite', 'multiplayer', 'game'],
    stack: ['TypeScript', 'Vue 3', 'Pinia', 'Fastify', 'Socket.io', 'SQLite'],
    // blind-clue.xyz fails its TLS handshake (checked 2026-10-02), so no demo link until it is fixed
    links: { code: 'https://github.com/makuchpatryk/BlindClue' },
    detail: true,
    meta: { year: 2026, type: 'personal' }
  },
  {
    slug: 'perplex-image',
    featured: false,
    order: 3,
    category: 'full-stack',
    tags: ['typescript', 'nuxt', 'supabase', 'pinia', 'playwright', 'game', 'puzzle'],
    stack: ['Nuxt 3', 'TypeScript', 'Pinia', 'Tailwind', 'Supabase', 'Vitest', 'Playwright'],
    links: { demo: 'https://perplex-image.vercel.app', code: 'https://github.com/CodingCru/perplex-image' },
    detail: true,
    meta: { year: 2024, type: 'personal' }
  },
  {
    slug: 'ai-semantic-db',
    featured: false,
    order: 4,
    category: 'rag',
    tags: ['rag', 'python', 'pgvector', 'ollama', 'cli', 'docker'],
    stack: ['Python 3.12', 'Typer', 'SQLAlchemy', 'Alembic', 'PostgreSQL + pgvector', 'Ollama (bge-m3)'],
    links: { code: 'https://github.com/makuchpatryk/ai-semantic-db' },
    detail: true,
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
    order: 5,
    category: 'full-stack',
    tags: ['typescript', 'nuxt', 'nestjs', 'postgres', 'turborepo', 'playwright', 'education'],
    stack: ['Nuxt 4', 'NestJS', 'TypeORM', 'PostgreSQL', 'Turborepo', 'Docker'],
    links: { code: 'https://github.com/makuchpatryk/quiz-forge' },
    detail: true,
    meta: { year: 2026, type: 'personal' }
  },
  {
    slug: 'lean-track',
    featured: false,
    order: 6,
    category: 'full-stack',
    tags: ['typescript', 'vue', 'fastify', 'postgres', 'docker', 'jwt', 'nutrition'],
    stack: ['Vue 3', 'Fastify', 'TypeORM', 'PostgreSQL', 'Docker'],
    links: { code: 'https://github.com/makuchpatryk/lean-track' },
    detail: true,
    meta: { year: 2026, type: 'personal' }
  },
  {
    slug: 'match-colours',
    featured: false,
    order: 7,
    category: 'full-stack',
    tags: ['vue', 'nuxt', 'game'],
    stack: ['Nuxt 3', 'Vue 3'],
    links: { demo: 'https://match-colours.vercel.app', code: 'https://github.com/makuchpatryk/MatchColours' },
    detail: true,
    meta: { year: 2024, type: 'personal' }
  },
  {
    slug: 'sudoku',
    featured: false,
    order: 8,
    category: 'full-stack',
    tags: ['typescript', 'nextjs', 'react', 'game', 'puzzle'],
    stack: ['Next.js', 'React', 'TypeScript'],
    links: { demo: 'https://makuchpatryk.github.io/sudoku/', code: 'https://github.com/makuchpatryk/sudoku' },
    detail: true,
    meta: { year: 2024, type: 'personal' }
  },
  {
    slug: 'screencaster',
    featured: true,
    order: 9,
    category: 'ai-workflow',
    tags: ['ai-workflow', 'go', 'mcp', 'playwright', 'ffmpeg', 'docker', 'cli'],
    stack: ['Go', 'Playwright', 'Piper TTS', 'ffmpeg', 'SQLite', 'MCP', 'Docker'],
    links: { code: 'https://github.com/makuchpatryk/screencaster' },
    detail: true,
    meta: { year: 2026, type: 'personal' }
  }
]
