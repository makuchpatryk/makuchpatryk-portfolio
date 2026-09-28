import type { StackGroup } from '../types/content'

export const stack: StackGroup[] = [
  { id: 'ai', focus: true, items: ['llmApi', 'agents', 'embeddings', 'llmEval', 'rag'] },
  { id: 'backend', items: ['python', 'fastapi', 'nodejs', 'nestjs', 'postgres'] },
  { id: 'cloud', items: ['aws', 'docker', 'cicd', 'git'] },
  { id: 'frontend', items: ['typescript', 'vue', 'nuxt', 'tailwind'] }
]

/** lines of the hero terminal (`cat stack.yaml`); tech names are not translated */
export const terminalStack: { key: string, items: string[] }[] = [
  { key: 'ai', items: ['ai-integration', 'ai-workflows', 'rag'] },
  { key: 'backend', items: ['python', 'fastapi', 'nestjs', 'postgres'] },
  { key: 'cloud', items: ['aws', 'azure', 'docker'] },
  { key: 'frontend', items: ['typescript', 'vue'] }
]
