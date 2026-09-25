<script setup lang="ts">
const props = defineProps<{
  src?: string
  poster?: string
  title: string
}>()

const { t } = useI18n()
const publicUrl = usePublicUrl()
const videoSrc = computed(() => (props.src ? publicUrl(props.src) : undefined))
const posterSrc = computed(() => (props.poster ? publicUrl(props.poster) : undefined))
</script>

<template>
  <figure class="flex flex-col gap-4">
    <figcaption class="flex justify-between font-mono text-[13px] text-muted">
      <span><span class="text-accent" aria-hidden="true">▶</span> {{ t('project.videoFile') }}</span>
    </figcaption>
    <!-- preload="none": video bytes are only fetched on play (keeps Lighthouse + GH Pages budget happy) -->
    <video
      v-if="videoSrc"
      class="aspect-video w-full rounded-xl border border-border bg-surface"
      controls
      playsinline
      preload="none"
      :poster="posterSrc"
      :aria-label="t('project.videoLabel', { title })"
    >
      <source :src="videoSrc" type="video/mp4">
      {{ t('project.videoFallback') }}
    </video>
    <div
      v-else
      class="gridbg flex aspect-video w-full flex-col items-center justify-center gap-5 rounded-xl border border-border bg-surface"
    >
      <span class="flex size-[88px] items-center justify-center rounded-full bg-accent text-accent-fg" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
      </span>
      <span class="px-4 text-center font-mono text-sm text-muted">{{ t('project.videoPlaceholder') }}</span>
    </div>
  </figure>
</template>
