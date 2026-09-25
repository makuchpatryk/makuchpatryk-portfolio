<script setup lang="ts">
const { t } = useI18n()
const colorMode = useColorMode()

// value is only trusted after mount: the module's inline script already applied the class, so no flash
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const isLight = computed(() => mounted.value && colorMode.value === 'light')
const label = computed(() => (isLight.value ? t('theme.toDark') : t('theme.toLight')))

function toggle() {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <button
    type="button"
    class="inline-flex size-11 items-center justify-center rounded-md border border-border-strong text-text transition-colors hover:border-accent hover:text-accent"
    :aria-label="label"
    @click="toggle"
  >
    <!-- icon swap is pure CSS (.light on <html>) so it never flashes -->
    <svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
    <svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  </button>
</template>

<style>
.theme-icon-sun {
  display: none;
}

.light .theme-icon-sun {
  display: block;
}

.light .theme-icon-moon {
  display: none;
}
</style>
