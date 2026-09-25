<script setup lang="ts">
import { site } from '~/data/site'

const { t } = useI18n()
const localePath = useLocalePath()
const publicUrl = usePublicUrl()
const projectsLink = computed(() => `${localePath('/')}#projects`)
</script>

<template>
  <section id="top" class="gridbg border-b border-border">
    <div class="container-page grid items-center gap-8 py-11 lg:grid-cols-12 lg:gap-x-6 lg:py-28">
      <div class="flex flex-col gap-[22px] lg:col-span-7 lg:gap-7">
        <div class="flex items-center gap-3.5 lg:block">
          <div class="lg:hidden">
            <UiPhotoFrame size="compact" :alt="t('hero.photoAlt', { name: site.name })" :placeholder="t('about.photoPlaceholder')" />
          </div>
          <p class="inline-flex items-center gap-2.5 self-start rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted lg:px-3.5 lg:py-2 lg:text-[13px]">
            <span class="size-2 rounded-full bg-accent" aria-hidden="true" />
            <span class="hidden lg:inline">{{ t('hero.status', { city: site.city }) }}</span>
            <span class="lg:hidden">{{ t('hero.statusShort') }}</span>
          </p>
        </div>
        <h1 class="text-balance text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-6xl xl:text-[4.75rem] xl:leading-[1.02]">
          {{ site.name }}<br>
          <span class="text-accent">{{ t('hero.role1') }}</span> <span class="text-faint" aria-hidden="true">/</span> {{ t('hero.role2') }}
        </h1>
        <p class="max-w-[600px] text-base leading-[1.6] text-muted lg:text-[19px]">{{ t('hero.tagline') }}</p>
        <div class="flex flex-col gap-2.5 font-mono text-sm sm:flex-row sm:flex-wrap sm:gap-3.5 lg:text-[15px]">
          <NuxtLink
            :to="projectsLink"
            class="inline-flex min-h-[50px] items-center justify-center rounded-md bg-accent px-6 font-semibold text-accent-fg transition-opacity hover:opacity-90"
          >
            {{ t('hero.viewProjects') }}
          </NuxtLink>
          <UiExternalLink
            :href="site.links.github"
            class="hidden min-h-[50px] items-center rounded-md border border-border-strong px-6 transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            {{ t('hero.github') }}
          </UiExternalLink>
          <UiExternalLink
            :href="site.links.linkedin"
            class="hidden min-h-[50px] items-center rounded-md border border-border-strong px-6 transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            {{ t('hero.linkedin') }}
          </UiExternalLink>
          <a
            :href="publicUrl(site.cv)"
            download
            class="inline-flex min-h-[50px] items-center justify-center rounded-md border border-border-strong px-6 transition-colors hover:border-accent hover:text-accent sm:hidden"
          >
            {{ t('nav.cv') }}
          </a>
        </div>
      </div>
      <div class="lg:col-span-5">
        <HomeTerminalBlock class="hidden lg:flex" />
        <HomeTerminalBlock compact class="lg:hidden" />
      </div>
    </div>
  </section>
</template>
