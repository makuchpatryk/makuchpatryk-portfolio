<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { featured } = useProjects()

const lead = computed(() => featured.value[0])
const rest = computed(() => featured.value.slice(1))
</script>

<template>
  <section id="projects" class="border-b border-border">
    <div class="container-page flex flex-col gap-6 py-10 md:gap-10 md:py-24">
      <UiSectionHeading :eyebrow="t('sections.projects.eyebrow')" :title="t('sections.projects.title')" />
      <ProjectFeatured v-if="lead" :project="lead" />
      <ul v-if="rest.length" class="grid gap-4 md:grid-cols-2 md:gap-6">
        <li v-for="project in rest" :key="project.slug"><ProjectCard :project="project" /></li>
      </ul>
      <NuxtLink
        :to="localePath('/projects')"
        class="inline-flex min-h-11 items-center self-start font-mono text-sm text-accent hover:underline md:text-[15px]"
      >
        {{ t('projectCard.viewAll') }}
      </NuxtLink>
    </div>
  </section>
</template>
