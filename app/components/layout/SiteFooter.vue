<script setup lang="ts">
import { site } from '~/data/site'

const { t } = useI18n()
const publicUrl = usePublicUrl()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border">
    <div class="container-page flex flex-col gap-4 py-8 font-mono text-[13px] text-muted md:flex-row md:items-center md:justify-between">
      <p>{{ t('footer.copyright', { year, name: site.name }) }}</p>
      <nav :aria-label="t('a11y.footerNav')" class="flex flex-wrap gap-x-7 gap-y-1">
        <UiExternalLink :href="site.links.github" class="inline-flex min-h-11 items-center hover:text-accent">
          {{ t('contact.github') }}
        </UiExternalLink>
        <UiExternalLink :href="site.links.linkedin" class="inline-flex min-h-11 items-center hover:text-accent">
          {{ t('contact.linkedin') }}
        </UiExternalLink>
        <a :href="`mailto:${site.email}`" class="inline-flex min-h-11 items-center hover:text-accent">{{ t('footer.mail') }}</a>
        <a :href="publicUrl(site.cv)" download class="inline-flex min-h-11 items-center hover:text-accent">{{ t('contact.cv') }}</a>
      </nav>
    </div>
  </footer>
</template>
