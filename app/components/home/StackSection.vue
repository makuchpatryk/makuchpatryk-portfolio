<script setup lang="ts">
import { stack } from '~/data/stack'

const { t } = useI18n()
</script>

<template>
  <section id="stack" class="border-b border-border">
    <div class="container-page flex flex-col gap-6 py-10 md:gap-9 md:py-24">
      <UiSectionHeading :eyebrow="t('sections.stack.eyebrow')" :title="t('sections.stack.title')" />
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <section
          v-for="group in stack"
          :key="group.id"
          class="flex flex-col gap-4 rounded-xl border bg-surface p-6"
          :class="group.focus ? 'border-accent' : 'border-border'"
        >
          <h3 class="font-mono text-[13px] font-normal" :class="group.focus ? 'text-accent' : 'text-muted'">
            {{ t(`stack.groups.${group.id}`) }}
          </h3>
          <ul class="flex flex-col gap-1 text-base leading-[1.9]">
            <li v-for="item in group.items" :key="item">{{ t(`stack.items.${item}`) }}</li>
          </ul>
        </section>
      </div>
    </div>
  </section>
</template>
