<script setup lang="ts">
import { experience } from '~/data/experience'

const { t } = useI18n()
const list = useMessageList()

const items = computed(() =>
  experience.map(e => ({
    ...e,
    role: t(`experience.${e.id}.role`),
    company: t(`experience.${e.id}.company`),
    location: t(`experience.${e.id}.location`),
    bullets: list(`experience.${e.id}.bullets`),
    period: `${e.from} — ${e.to ?? t('sections.experience.now')}`
  }))
)
</script>

<template>
  <section id="experience" class="border-b border-border">
    <div class="container-page flex flex-col gap-6 py-10 md:gap-9 md:py-24">
      <UiSectionHeading :eyebrow="t('sections.experience.eyebrow')" :title="t('sections.experience.title')" />
      <ol class="flex flex-col rounded-xl border border-border bg-surface">
        <li
          v-for="item in items"
          :key="item.id"
          class="grid gap-3 border-b border-border p-4 last:border-b-0 md:p-8 lg:grid-cols-12 lg:gap-x-6"
        >
          <div class="flex flex-col gap-1 font-mono text-xs md:gap-2 md:text-[13px] lg:col-span-3">
            <span :class="item.current ? 'text-accent' : 'text-faint'">
              {{ item.current ? t('sections.experience.current') : t('sections.experience.previous') }}
            </span>
            <span class="text-muted">{{ item.period }}</span>
          </div>
          <div class="flex flex-col gap-1 lg:col-span-4 lg:gap-1.5">
            <h3 class="text-lg font-semibold md:text-[22px]">{{ item.role }}</h3>
            <p class="text-sm text-muted md:text-[15px]">{{ item.company }} · {{ item.location }}</p>
          </div>
          <ul class="flex list-disc flex-col gap-2 pl-[18px] text-[15px] leading-[1.55] text-text-2 lg:col-span-5">
            <li v-for="bullet in item.bullets" :key="bullet">{{ bullet }}</li>
          </ul>
        </li>
      </ol>
    </div>
  </section>
</template>
