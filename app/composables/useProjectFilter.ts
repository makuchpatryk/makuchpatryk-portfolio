import type { Project, Tag } from '~/types/content'

/**
 * Single-select tag filter synced to `?tag=`. State starts at `all` and is read from the query only after
 * mount, so prerendered HTML (all projects visible, works without JS) never mismatches on hydration.
 */
export function useProjectFilter(projects: readonly Project[]) {
  const route = useRoute()
  const router = useRouter()
  const tags = collectTags(projects)

  const active = ref<TagFilterValue>('all')
  const ready = ref(false)

  function fromQuery(value: unknown): TagFilterValue {
    const raw = Array.isArray(value) ? value[0] : value
    return typeof raw === 'string' && (tags as string[]).includes(raw) ? (raw as Tag) : 'all'
  }

  onMounted(() => {
    active.value = fromQuery(route.query.tag)
    ready.value = true
  })

  watch(() => route.query.tag, (value) => {
    if (ready.value) active.value = fromQuery(value)
  })

  function setTag(tag: TagFilterValue) {
    active.value = tag
    const { tag: _omit, ...rest } = route.query
    router.replace({ query: tag === 'all' ? rest : { ...rest, tag } })
  }

  const filtered = computed(() => filterProjects(projects, active.value))

  return { tags, active, setTag, filtered }
}
