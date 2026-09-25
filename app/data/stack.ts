import type { StackGroup } from '../types/content'

export const stack: StackGroup[] = [
  { id: 'ai', focus: true, items: ['rag', 'agents', 'embeddings', 'llmApi', 'llmEval'] },
  { id: 'backend', items: ['python', 'fastapi', 'postgres', 'rest'] },
  { id: 'cloud', items: ['aws', 'docker', 'cicd', 'git'] },
  { id: 'frontend', items: ['typescript', 'vue'] }
]

/** lines of the hero terminal (`cat stack.yaml`); tech names are not translated */
export const terminalStack: { key: string, items: string[] }[] = [
  { key: 'ai', items: ['rag', 'ai-workflows', 'llm-eval'] },
  { key: 'backend', items: ['python', 'fastapi', 'postgres'] },
  { key: 'cloud', items: ['aws', 'docker'] },
  { key: 'frontend', items: ['typescript', 'vue'] }
]
