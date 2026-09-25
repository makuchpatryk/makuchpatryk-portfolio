<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-3 focus:font-mono focus:text-sm focus:text-accent-fg"
    >
      {{ t('a11y.skip') }}
    </a>
    <LayoutSiteHeader />
    <main id="main" tabindex="-1" class="flex-1 outline-none">
      <slot />
    </main>
    <LayoutSiteFooter />
  </div>
</template>
