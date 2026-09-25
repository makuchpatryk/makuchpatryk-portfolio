<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <span class="rounded bg-surface-2 px-2.5 py-1 font-mono text-xs text-text">{{ label }}</span>
</template>
