<script setup lang="ts">
import type { LocalizedProject } from '~/types/content'

const props = defineProps<{ project: LocalizedProject }>()
const { t } = useI18n()
const localePath = useLocalePath()
const detailPath = computed(() => localePath({ name: 'projects-slug', params: { slug: props.project.slug } }))
</script>

<template>
  <article class="grid rounded-xl border border-border bg-surface lg:grid-cols-12 lg:gap-x-6">
    <div class="gridbg flex flex-col justify-center gap-[22px] rounded-t-xl border-b border-border p-4 font-mono text-[13px] lg:col-span-7 lg:rounded-l-xl lg:rounded-tr-none lg:border-b-0 lg:border-r lg:p-10">
      <template v-if="project.pipeline">
        <span class="text-muted">{{ t('projectCard.pipelineTitle', { label: t(`pipeline.label.${project.category}`) }) }}</span>
        <ProjectPipelineDiagram :pipeline="project.pipeline" />
        <span class="text-faint">{{ t('projectCard.pipelinePlaceholder') }}</span>
      </template>
      <span v-else class="text-faint">{{ t('projectCard.visualPlaceholder') }}</span>
    </div>
    <div class="flex flex-col gap-[18px] p-5 md:p-9 lg:col-span-5 lg:pl-3">
      <span class="font-mono text-[13px] text-accent">{{ t('projectCard.featured') }}</span>
      <h3 class="text-2xl font-semibold tracking-[-0.02em] lg:text-[32px]">
        <NuxtLink v-if="project.detail" :to="detailPath" class="transition-colors hover:text-accent">{{ project.title }}</NuxtLink>
        <template v-else>{{ project.title }}</template>
      </h3>
      <p class="text-base leading-[1.6] text-text-2">{{ project.summary }}</p>
      <dl class="flex flex-col gap-2.5 border-y border-border py-4 text-sm leading-normal">
        <div class="flex gap-3">
          <dt class="w-[72px] shrink-0 font-mono text-muted">{{ t('projectCard.role') }}</dt>
          <dd>{{ project.role }}</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-[72px] shrink-0 font-mono text-muted">{{ t('projectCard.effect') }}</dt>
          <dd>{{ project.effect }}</dd>
        </div>
      </dl>
      <ul class="flex flex-wrap gap-2" :aria-label="t('project.stack')">
        <li v-for="tag in project.tags" :key="tag"><UiTagChip :label="tag" /></li>
      </ul>
      <div class="mt-auto flex flex-wrap gap-x-[22px] font-mono text-sm">
        <UiExternalLink v-if="project.links.demo" :href="project.links.demo" class="inline-flex min-h-11 items-center hover:text-accent">
          {{ t('projectCard.demo') }}
        </UiExternalLink>
        <UiExternalLink v-if="project.links.code" :href="project.links.code" class="inline-flex min-h-11 items-center hover:text-accent">
          {{ t('projectCard.code') }}
        </UiExternalLink>
        <NuxtLink v-if="project.detail" :to="detailPath" class="inline-flex min-h-11 items-center text-accent hover:underline">
          {{ t('projectCard.caseStudy') }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
