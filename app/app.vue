<script setup lang="ts">
const head = useLocaleHead({ seo: true })
const colorMode = useColorMode()

useHead(() => ({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang },
  link: head.value.link,
  meta: [
    ...(head.value.meta ?? []),
    { name: 'theme-color', content: colorMode.value === 'light' ? '#F7F8FA' : '#0B0D10' },
    { name: 'color-scheme', content: 'dark light' }
  ]
}))
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
