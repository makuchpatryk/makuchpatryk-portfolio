<script setup lang="ts">
import { site } from '~/data/site'

const { t } = useI18n()
const localePath = useLocalePath()
const getRouteBaseName = useRouteBaseName()
const route = useRoute()
const publicUrl = usePublicUrl()

const sections = ['projects', 'experience', 'stack', 'about', 'contact'] as const
const items = computed(() =>
  sections.map(id => ({
    id,
    label: t(`nav.${id}`),
    to: `${localePath('/')}#${id}`
  }))
)

const isDetail = computed(() => getRouteBaseName(route) === 'projects-slug')
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-border bg-bg">
    <div class="container-page relative flex items-center justify-between gap-4 py-3 font-mono text-sm xl:py-[13px]">
      <NuxtLink :to="localePath('/')" class="inline-flex min-h-11 items-center font-semibold">
        <span class="text-accent">~/</span>{{ site.handle }}
      </NuxtLink>

      <nav :aria-label="t('a11y.primaryNav')" class="hidden items-center gap-6 xl:flex xl:gap-9">
        <template v-if="isDetail">
          <NuxtLink :to="localePath('/projects')" class="inline-flex min-h-11 items-center text-muted transition-colors hover:text-accent">
            {{ t('nav.allProjects') }}
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink
            v-for="(item, i) in items"
            :key="item.id"
            :to="item.to"
            class="inline-flex min-h-11 items-center text-muted transition-colors hover:text-accent"
          >
            <span class="text-faint">{{ String(i + 1).padStart(2, '0') }}.</span>{{ item.label }}
          </NuxtLink>
        </template>
        <a
          :href="publicUrl(site.cv)"
          download
          class="inline-flex min-h-11 items-center rounded-md border border-accent px-[18px] text-accent transition-colors hover:bg-accent hover:text-accent-fg"
        >
          {{ t('nav.cv') }}
        </a>
        <div class="flex items-center gap-1">
          <LayoutLangSwitcher />
          <LayoutThemeToggle />
        </div>
      </nav>

      <div class="xl:hidden">
        <LayoutMobileNav :items="items" />
      </div>
    </div>
  </header>
</template>
