<script setup lang="ts">
import { site } from '~/data/site'

defineProps<{
  items: { id: string, label: string, to: string }[]
}>()

const { t } = useI18n()
const publicUrl = usePublicUrl()
const route = useRoute()
const details = ref<HTMLDetailsElement>()

// <details> keeps the menu usable without JS; JS only adds close-on-navigate / Escape
function close() {
  if (details.value) details.value.open = false
}
watch(() => route.fullPath, close)
</script>

<template>
  <details ref="details" class="group" @keydown.esc="close">
    <summary
      class="flex size-11 cursor-pointer list-none items-center justify-center rounded-md border border-border-strong text-text marker:hidden [&::-webkit-details-marker]:hidden"
    >
      <span class="sr-only group-open:hidden">{{ t('a11y.menuOpen') }}</span>
      <span class="sr-only hidden group-open:inline">{{ t('a11y.menuClose') }}</span>
      <svg class="group-open:hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
        <path d="M4 8h16M4 16h16" />
      </svg>
      <svg class="hidden group-open:block" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </summary>
    <div class="absolute inset-x-0 top-full z-40 border-b border-border bg-bg px-5 pb-5 pt-2 font-mono text-[15px] shadow-lg">
      <nav :aria-label="t('a11y.primaryNav')" class="flex flex-col">
        <NuxtLink
          v-for="(item, i) in items"
          :key="item.id"
          :to="item.to"
          class="flex min-h-12 items-center gap-2 border-b border-border text-muted transition-colors hover:text-accent"
          @click="close"
        >
          <span class="text-faint">{{ String(i + 1).padStart(2, '0') }}.</span>{{ item.label }}
        </NuxtLink>
      </nav>
      <div class="mt-4 flex items-center justify-between gap-3">
        <a
          :href="publicUrl(site.cv)"
          download
          class="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-accent px-4 text-accent"
        >
          {{ t('nav.cv') }}
        </a>
        <LayoutLangSwitcher />
        <LayoutThemeToggle />
      </div>
    </div>
  </details>
</template>
