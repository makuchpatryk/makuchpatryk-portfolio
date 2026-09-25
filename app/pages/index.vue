<script setup lang="ts">
import { site } from '~/data/site'

const { t } = useI18n()

usePageSeo(() => ({
  title: t('meta.home.title'),
  description: t('meta.home.description'),
  ogSubtitle: t('meta.ogHomeSubtitle')
}))

useSchemaOrg([
  definePerson({
    name: site.name,
    jobTitle: 'AI Engineer / Software Engineer',
    email: site.email,
    sameAs: [site.links.github, site.links.linkedin]
  })
])
</script>

<template>
  <div>
    <HomeHeroSection />
    <!-- below the fold: hydrate when scrolled into view (lower TBT); the HTML is already prerendered -->
    <LazyHomeProjectsSection hydrate-on-visible />
    <LazyHomeExperienceSection hydrate-on-visible />
    <LazyHomeStackSection hydrate-on-visible />
    <LazyHomeAboutSection hydrate-on-visible />
    <LazyHomeContactSection hydrate-on-visible />
  </div>
</template>
