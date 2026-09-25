<script setup lang="ts">
import { site } from '~/data/site'

const { t } = useI18n()

const facts = [
  { label: 'about.now', value: 'about.nowValue' },
  { label: 'about.looking', value: 'about.lookingValue' },
  { label: 'about.outside', value: 'about.outsideValue' }
] as const
</script>

<template>
  <section id="about" class="border-b border-border">
    <div class="container-page grid items-start gap-8 py-10 md:py-24 lg:grid-cols-12 lg:gap-x-6">
      <div class="flex flex-col gap-3.5 lg:col-span-4">
        <UiPhotoFrame :alt="t('hero.photoAlt', { name: site.name })" :placeholder="t('about.photoPlaceholder')" />
        <div class="flex justify-between font-mono text-[13px] text-muted">
          <span>{{ site.name }}</span>
          <span>{{ site.city }} · remote</span>
        </div>
      </div>
      <div class="flex flex-col gap-6 lg:col-span-8 lg:pl-8">
        <UiSectionHeading :eyebrow="t('sections.about.eyebrow')" :title="t('sections.about.title')" />
        <p class="text-xl leading-[1.5] tracking-[-0.01em] md:text-2xl">{{ t('about.lead') }}</p>
        <p class="text-[17px] leading-[1.75] text-text-2">{{ t('about.body') }}</p>
        <dl class="mt-2 grid gap-4 sm:grid-cols-3">
          <div v-for="fact in facts" :key="fact.label" class="flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-5">
            <dt class="font-mono text-xs text-muted">{{ t(fact.label) }}</dt>
            <dd class="text-[15px] leading-normal">{{ t(fact.value) }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
