export function useLocalizedProject(slug: MaybeRefOrGetter<string>) {
  const { all } = useProjects()
  return computed(() => all.value.find(p => p.slug === toValue(slug)) ?? null)
}
