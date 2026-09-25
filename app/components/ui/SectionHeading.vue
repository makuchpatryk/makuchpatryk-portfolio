<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow: string
  title?: string
  as?: 'h1' | 'h2'
}>(), { as: 'h2' })
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <span class="font-mono text-[13px] text-accent md:text-sm">{{ eyebrow }}</span>
    <component
      :is="as"
      v-if="title"
      class="text-3xl font-semibold tracking-[-0.03em] md:text-5xl"
    >
      {{ title }}
    </component>
  </div>
</template>
