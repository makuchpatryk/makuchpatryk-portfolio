<script setup lang="ts">
defineProps<{ metrics: { key: string, value: string, label: string }[] }>()
</script>

<template>
  <dl class="grid gap-4 sm:grid-cols-3">
    <div v-for="metric in metrics" :key="metric.key" class="flex flex-col-reverse justify-end gap-2 rounded-xl border border-border bg-surface p-6">
      <dt class="text-sm text-muted">{{ metric.label }}</dt>
      <dd class="text-4xl font-semibold tracking-[-0.03em] text-accent">{{ metric.value }}</dd>
    </div>
  </dl>
</template>
