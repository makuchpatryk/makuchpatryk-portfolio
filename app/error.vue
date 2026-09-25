<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t, localeProperties } = useI18n()
const localePath = useLocalePath()

const is404 = computed(() => props.error.statusCode === 404)

useHead(() => ({ htmlAttrs: { lang: localeProperties.value.language } }))

useSeoMeta({
  title: () => t('meta.notFound.title'),
  description: () => t('meta.notFound.description'),
  robots: 'noindex'
})
</script>

<template>
  <NuxtLayout>
    <section class="gridbg">
      <div class="container-page flex flex-col items-start gap-6 py-24 md:py-40">
        <p class="font-mono text-sm text-accent">{{ is404 ? t('error.title') : error.statusCode }}</p>
        <h1 class="text-4xl font-semibold tracking-[-0.03em] md:text-6xl">
          {{ is404 ? t('error.heading') : error.statusMessage }}
        </h1>
        <p class="max-w-xl text-lg text-text-2">{{ t('error.text') }}</p>
        <NuxtLink
          :to="localePath('/')"
          class="inline-flex min-h-[50px] items-center rounded-md bg-accent px-6 font-mono text-[15px] font-semibold text-accent-fg hover:opacity-90"
        >
          {{ t('error.back') }}
        </NuxtLink>
      </div>
    </section>
  </NuxtLayout>
</template>
