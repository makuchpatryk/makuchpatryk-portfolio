<script setup lang="ts">
import { site } from '~/data/site'

const { t } = useI18n()
</script>

<template>
  <section id="contact" class="gridbg">
    <div class="container-page flex flex-col gap-5 py-12 md:gap-6 md:py-28">
      <span class="font-mono text-[13px] text-accent md:text-sm">{{ t('sections.contact.eyebrow') }}</span>
      <h2 class="text-balance text-[2.75rem] font-semibold leading-none tracking-[-0.04em] md:text-7xl xl:text-[6rem]">
        {{ t('contact.headingA') }}<br>
        {{ t('contact.headingB') }} <span class="text-accent">AI</span>{{ t('contact.headingEnd') }}
      </h2>
      <a
        :href="`mailto:${site.email}`"
        class="inline-flex min-h-11 items-center self-start font-mono text-base underline decoration-border-strong underline-offset-[6px] hover:decoration-accent md:text-[26px] md:underline-offset-8"
      >
        <span class="mr-2 text-accent" aria-hidden="true">$</span>{{ t('contact.mail') }} {{ site.email }}
      </a>
      <div class="flex flex-wrap gap-x-5 font-mono text-[13px] md:hidden">
        <UiExternalLink :href="site.links.github" class="inline-flex min-h-11 items-center hover:text-accent">{{ t('contact.github') }}</UiExternalLink>
        <UiExternalLink :href="site.links.linkedin" class="inline-flex min-h-11 items-center hover:text-accent">{{ t('contact.linkedin') }}</UiExternalLink>
      </div>
    </div>
  </section>
</template>
