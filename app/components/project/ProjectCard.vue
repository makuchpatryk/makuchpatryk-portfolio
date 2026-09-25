<script setup lang="ts">
import type { LocalizedProject } from '~/types/content'

const props = withDefaults(defineProps<{
  project: LocalizedProject
  /** heading level of the title: h3 under a section h2 (home), h2 under the page h1 (/projects) */
  as?: 'h2' | 'h3'
}>(), { as: 'h3' })
const { t } = useI18n()
const localePath = useLocalePath()
const detailPath = computed(() => localePath({ name: 'projects-slug', params: { slug: props.project.slug } }))
</script>

<template>
  <article class="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-[18px] md:gap-4 md:p-7">
    <div class="flex justify-between font-mono text-xs text-muted md:text-[13px]">
      <span>{{ String(project.order).padStart(2, '0') }}</span>
      <span :class="categoryTextClass(project.category)">{{ t(`categories.${project.category}`) }}</span>
    </div>
    <NuxtImg
      v-if="project.media?.cover"
      :src="project.media.cover"
      alt=""
      width="640"
      height="220"
      loading="lazy"
      class="h-[220px] w-full rounded-lg border border-border object-cover"
    />
    <div
      v-else
      class="gridbg hidden h-[220px] items-center justify-center rounded-lg border border-border font-mono text-[13px] text-faint md:flex"
    >
      {{ t('projectCard.visualPlaceholder') }}
    </div>
    <component :is="as" class="text-[22px] font-semibold tracking-[-0.02em] md:text-2xl">
      <NuxtLink v-if="project.detail" :to="detailPath" class="transition-colors hover:text-accent">{{ project.title }}</NuxtLink>
      <template v-else>{{ project.title }}</template>
    </component>
    <p class="text-[15px] leading-[1.6] text-text-2">{{ project.summary }}</p>
    <ul class="flex flex-wrap gap-1.5 md:gap-2" :aria-label="t('project.stack')">
      <li v-for="tag in project.tags" :key="tag"><UiTagChip :label="tag" /></li>
    </ul>
    <div class="mt-auto flex flex-wrap gap-x-[18px] font-mono text-[13px] md:gap-x-[22px] md:text-sm">
      <UiExternalLink v-if="project.links.demo" :href="project.links.demo" class="inline-flex min-h-11 items-center hover:text-accent">
        {{ t('projectCard.demo') }}
      </UiExternalLink>
      <UiExternalLink v-if="project.links.code" :href="project.links.code" class="inline-flex min-h-11 items-center hover:text-accent">
        {{ t('projectCard.code') }}
      </UiExternalLink>
      <NuxtLink v-if="project.detail" :to="detailPath" class="inline-flex min-h-11 items-center text-accent hover:underline">
        {{ t('projectCard.details') }}
      </NuxtLink>
    </div>
  </article>
</template>
