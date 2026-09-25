<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const items = computed(() =>
  locales.value.map(l => (typeof l === 'string' ? { code: l, language: l } : l))
)
</script>

<template>
  <nav :aria-label="t('a11y.languageSwitch')" class="flex items-center font-mono text-sm">
    <NuxtLink
      v-for="l in items"
      :key="l.code"
      :to="switchLocalePath(l.code as 'en' | 'pl')"
      :hreflang="l.language"
      :lang="l.code"
      :aria-label="t(`lang.${l.code}`)"
      :aria-current="l.code === locale ? 'true' : undefined"
      class="inline-flex h-11 min-w-9 items-center justify-center px-2 uppercase transition-colors hover:text-accent"
      :class="l.code === locale ? 'text-accent' : 'text-muted'"
    >
      {{ l.code }}
    </NuxtLink>
  </nav>
</template>
