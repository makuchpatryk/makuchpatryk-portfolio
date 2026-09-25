<script setup lang="ts">
import { projects } from '~/data/projects'

const { t } = useI18n()
const { all } = useProjects()
const { tags, active, setTag, filtered } = useProjectFilter(projects)

const visible = computed(() => {
  const slugs = new Set(filtered.value.map(p => p.slug))
  return all.value.filter(p => slugs.has(p.slug))
})

usePageSeo(() => ({
  title: t('meta.projects.title'),
  description: t('meta.projects.description'),
  ogSubtitle: t('meta.ogProjectsSubtitle')
}))
</script>

<template>
  <div>
    <header class="gridbg border-b border-border">
      <div class="container-page flex flex-col gap-6 py-12 md:py-20">
        <UiSectionHeading as="h1" :eyebrow="t('projectsPage.eyebrow')" :title="t('projectsPage.title')" />
        <p class="max-w-2xl text-lg leading-[1.6] text-muted">{{ t('projectsPage.lead') }}</p>
        <ProjectTagFilter :tags="tags" :active="active" @select="setTag" />
      </div>
    </header>
    <section class="container-page flex flex-col gap-6 py-10 md:py-16">
      <p class="font-mono text-[13px] text-muted" role="status" aria-live="polite">
        {{ t('projectsPage.count', { count: visible.length }) }}
      </p>
      <ul v-if="visible.length" class="grid gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
        <li v-for="project in visible" :key="project.slug"><ProjectCard :project="project" as="h2" /></li>
      </ul>
      <p v-else class="text-text-2">{{ t('projectsPage.empty') }}</p>
    </section>
  </div>
</template>
