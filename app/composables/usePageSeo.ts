interface PageSeo {
  title: string
  description: string
  ogSubtitle?: string
}

/** Unique title/description/OG image per page × locale. */
export function usePageSeo(seo: MaybeRefOrGetter<PageSeo>) {
  const value = computed(() => toValue(seo))

  useSeoMeta({
    title: () => value.value.title,
    description: () => value.value.description,
    ogTitle: () => value.value.title,
    ogDescription: () => value.value.description,
    twitterCard: 'summary_large_image'
  })

  defineOgImage('PortfolioCard', {
    title: value.value.title,
    subtitle: value.value.ogSubtitle ?? value.value.description
  })
}
