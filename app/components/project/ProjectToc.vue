<script setup lang="ts">
const props = defineProps<{ sections: string[] }>()

const { t } = useI18n()
const active = ref(props.sections[0] ?? '')

// highlight follows scroll; without JS the list is still a plain anchor list
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible[0]) active.value = visible[0].target.id
  }, { rootMargin: '-20% 0px -60% 0px' })
  for (const id of props.sections) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <nav :aria-label="t('project.tocLabel')" class="flex flex-col gap-3.5 font-mono text-sm lg:sticky lg:top-24 lg:self-start">
    <p class="text-xs text-faint">{{ t('project.toc') }}</p>
    <a
      v-for="(id, i) in sections"
      :key="id"
      :href="`#${id}`"
      class="inline-flex min-h-8 items-center transition-colors hover:text-accent"
      :class="active === id ? 'text-accent' : 'text-muted'"
      :aria-current="active === id ? 'location' : undefined"
    >
      {{ String(i + 1).padStart(2, '0') }} {{ t(`project.sections.${id}`) }}
    </a>
  </nav>
</template>
