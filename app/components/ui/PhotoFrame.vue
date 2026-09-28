<script setup lang="ts">
import { site } from '~/data/site'

withDefaults(defineProps<{
  alt: string
  /** compact = 76px hero thumbnail, full = about section portrait */
  size?: 'compact' | 'full'
  placeholder: string
}>(), { size: 'full' })
</script>

<template>
  <div class="rounded-[14px]" :class="size === 'compact' ? 'w-fit rounded-xl' : ''">
    <NuxtImg
      v-if="site.photo"
      :src="site.photo"
      :alt="alt"
      :width="size === 'compact' ? 76 : 440"
      :height="size === 'compact' ? 76 : undefined"
      :loading="size === 'compact' ? 'eager' : 'lazy'"
      format="webp"
      class="rounded-[10px]"
      :class="size === 'compact' ? 'size-[76px] object-cover' : 'h-auto w-full'"
    />
    <div
      v-else
      class="gridbg flex items-center justify-center rounded-[10px] border border-dashed border-border-strong bg-surface font-mono text-muted"
      :class="size === 'compact' ? 'size-[76px] text-[11px]' : 'h-72 text-[13px] md:h-[440px]'"
      role="img"
      :aria-label="alt"
    >
      {{ placeholder }}
    </div>
  </div>
</template>
