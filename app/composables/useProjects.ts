import { projects } from '~/data/projects'
import type { LocalizedProject } from '~/types/content'

export function useProjects() {
  const { t, te } = useI18n()

  const all = computed<LocalizedProject[]>(() =>
    sortProjects(projects).map(p => localizeProject(p, t, key => te(key)))
  )
  const featured = computed(() => all.value.filter(p => p.featured))
  const detail = computed(() => all.value.filter(p => p.detail))

  return { all, featured, detail }
}
