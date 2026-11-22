<script setup lang="ts">
definePageMeta({ enOnly: true })

const { t, locale } = useI18n()

// The CV is English only (PRD §2), so a Polish visit lands on the English page.
if (locale.value !== 'en') await navigateTo('/cv', { redirectCode: 302 })

usePageSeo(() => ({
  title: t('meta.cv.title'),
  description: t('meta.cv.description'),
  ogSubtitle: t('meta.ogCvSubtitle')
}))
</script>

<template>
  <div>
    <header class="gridbg border-b border-border">
      <div class="container-page py-12 md:py-20">
        <UiSectionHeading as="h1" :eyebrow="t('cv.eyebrow')" :title="t('cv.title')" />
      </div>
    </header>
    <section class="container-page py-10 md:py-16">
      <CvReader />
    </section>
  </div>
</template>
