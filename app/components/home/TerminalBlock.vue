<script setup lang="ts">
import { site } from '~/data/site'
import { terminalStack } from '~/data/stack'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const { t } = useI18n()
</script>

<template>
  <div
    class="flex flex-col rounded-xl border border-border bg-surface font-mono leading-[1.75]"
    :class="compact ? 'text-xs' : 'text-sm'"
  >
    <div v-if="!compact" class="flex items-center gap-2 border-b border-border px-[18px] py-3.5">
      <span class="size-2.5 rounded-full bg-border-strong" aria-hidden="true" />
      <span class="size-2.5 rounded-full bg-border-strong" aria-hidden="true" />
      <span class="size-2.5 rounded-full bg-border-strong" aria-hidden="true" />
      <span class="ml-2.5 text-xs text-muted">{{ t('hero.terminal.title', { handle: site.handle }) }}</span>
    </div>
    <div class="flex flex-col p-4" :class="compact ? '' : 'px-[22px] pb-6 pt-5'">
      <template v-if="!compact">
        <span><span class="text-accent" aria-hidden="true">$</span> {{ t('hero.terminal.whoami') }}</span>
        <span class="text-muted">{{ t('hero.terminal.whoamiOut') }}</span>
      </template>
      <span :class="compact ? '' : 'mt-2.5'"><span class="text-accent" aria-hidden="true">$</span> {{ t('hero.terminal.catStack') }}</span>
      <span v-for="line in terminalStack" :key="line.key">
        <span class="text-muted">{{ line.key }}:</span> <span class="yaml-list">{{ line.items.join(', ') }}</span>
      </span>
      <span v-if="!compact" class="mt-2.5"><span class="text-accent" aria-hidden="true">$</span> <span class="cursor" aria-hidden="true" /></span>
    </div>
  </div>
</template>
