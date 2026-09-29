<script setup lang="ts">
import { site } from '~/data/site'

defineProps<{
  alt: string
  placeholder: string
}>()
</script>

<template>
  <div class="rounded-[14px]">
    <NuxtImg
      v-if="site.photo"
      :src="site.photo"
      :alt="alt"
      width="440"
      height="587"
      loading="lazy"
      format="webp"
      class="h-auto w-full rounded-[10px]"
    />
    <div
      v-else
      class="gridbg flex h-72 items-center justify-center rounded-[10px] border border-dashed border-border-strong bg-surface font-mono text-[13px] text-muted md:h-[440px]"
      role="img"
      :aria-label="alt"
    >
      {{ placeholder }}
    </div>
  </div>
</template>
