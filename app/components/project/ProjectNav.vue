<script setup lang="ts">
import type { LocalizedProject } from '~/types/content'

defineProps<{
  prev: LocalizedProject | null
  next: LocalizedProject | null
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const detailPath = (slug: string) => localePath({ name: 'projects-slug', params: { slug } })
const card = 'flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-7 transition-colors hover:border-accent'
</script>

<template>
  <nav :aria-label="t('project.nav')" class="grid gap-4 md:grid-cols-3 md:gap-6">
    <NuxtLink v-if="prev" :to="detailPath(prev.slug)" :class="card">
      <span class="font-mono text-[13px] text-muted">{{ t('project.previous') }}</span>
      <span class="text-2xl font-semibold tracking-[-0.02em]">{{ prev.title }}</span>
    </NuxtLink>
    <span v-else class="hidden md:block" />
    <NuxtLink :to="localePath('/projects')" :class="card">
      <span class="font-mono text-[13px] text-muted">{{ t('project.back') }}</span>
      <span class="text-2xl font-semibold tracking-[-0.02em]">{{ t('project.allProjects') }}</span>
    </NuxtLink>
    <NuxtLink v-if="next" :to="detailPath(next.slug)" :class="[card, 'md:items-end md:text-right']">
      <span class="font-mono text-[13px] text-accent">{{ t('project.next') }}</span>
      <span class="text-2xl font-semibold tracking-[-0.02em]">{{ next.title }}</span>
    </NuxtLink>
  </nav>
</template>
