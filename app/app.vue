<script setup lang="ts">
const head = useLocaleHead({ seo: true })
const colorMode = useColorMode()
const route = useRoute()

// English-only pages (/cv) have no real /pl counterpart, so they advertise no hreflang alternates
const links = computed(() => route.meta.enOnly
  ? head.value.link?.filter(l => l.rel !== 'alternate')
  : head.value.link)

useHead(() => ({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang },
  link: links.value,
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
