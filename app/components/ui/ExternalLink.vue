<script setup lang="ts">
defineProps<{ href: string }>()
const { t } = useI18n()
</script>

<template>
  <a :href="href" target="_blank" rel="noopener noreferrer">
    <slot />
    <span class="sr-only"> {{ t('a11y.externalNote') }}</span>
  </a>
</template>
