<script setup lang="ts">
import type { Tag } from '~/types/content'

defineProps<{
  tags: Tag[]
  active: TagFilterValue
}>()
defineEmits<{ select: [tag: TagFilterValue] }>()

const { t } = useI18n()
</script>

<template>
  <div role="group" :aria-label="t('projectsPage.filterLabel')" class="flex flex-wrap gap-2 font-mono text-[13px]">
    <button
      v-for="tag in (['all', ...tags] as TagFilterValue[])"
      :key="tag"
      type="button"
      :aria-pressed="active === tag"
      class="inline-flex min-h-11 items-center rounded-md border px-4 transition-colors"
      :class="active === tag
        ? 'border-accent bg-accent text-accent-fg'
        : 'border-border-strong text-text hover:border-accent hover:text-accent'"
      @click="$emit('select', tag)"
    >
      {{ tag === 'all' ? t('projectsPage.all') : tag }}
    </button>
  </div>
</template>
