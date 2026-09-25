<script setup lang="ts">
import type { Pipeline } from '~/types/content'

withDefaults(defineProps<{
  pipeline: Pipeline
  /** show the "ingest" / "query" row labels (detail page) */
  labels?: boolean
  /** framed card with padding (detail page) */
  framed?: boolean
}>(), { labels: false, framed: false })

const { t } = useI18n()
</script>

<template>
  <div
    class="flex flex-col gap-4 font-mono text-[11px] md:text-[13px]"
    :class="framed ? 'gridbg rounded-xl border border-border p-4 md:gap-[18px] md:p-8' : ''"
  >
    <template v-for="row in (['ingest', 'query'] as const)" :key="row">
      <div class="flex flex-col gap-2.5">
        <span v-if="labels" class="text-muted">{{ t(`pipeline.${row}`) }}</span>
        <ol class="flex flex-wrap items-center gap-1.5 md:gap-2.5">
          <template v-for="(step, i) in pipeline[row]" :key="step">
            <li v-if="i > 0" class="text-faint" aria-hidden="true">→</li>
            <li
              class="rounded-[5px] border bg-bg px-[9px] py-[7px] md:rounded-md md:px-3.5 md:py-3"
              :class="pipeline.highlight?.includes(step) ? 'border-accent text-accent' : 'border-border-strong text-text'"
            >
              {{ t(`pipeline.steps.${step}`) }}
            </li>
          </template>
        </ol>
      </div>
    </template>
  </div>
</template>
