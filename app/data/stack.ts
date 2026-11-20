import type { StackGroup } from '../types/content'

export const stack: StackGroup[] = [
  { id: 'backend', items: ['python', 'fastapi', 'nodejs', 'nestjs', 'postgres'] },
  { id: 'cloud', items: ['aws', 'docker', 'cicd', 'git'] },
  { id: 'frontend', items: ['typescript', 'vue', 'nuxt', 'tailwind'] },
  { id: 'ai', focus: true, items: ['llmApi', 'embeddings', 'llmEval', 'rag'] }
]

/** lines of the hero terminal (`cat stack.yaml`); tech names are not translated */
export const terminalStack: { key: string, items: string[] }[] = [
  { key: 'backend', items: ['python', 'fastapi', 'nestjs', 'postgres'] },
  { key: 'cloud', items: ['aws', 'azure', 'docker'] },
  { key: 'frontend', items: ['typescript', 'vue'] },
  { key: 'ai', items: ['ai-integration', 'rag'] }
]
