<script setup lang="ts">
const props = defineProps<{
  src?: string
  poster?: string
  captions?: string
  title: string
}>()

const { t } = useI18n()
const publicUrl = usePublicUrl()
const videoSrc = computed(() => (props.src ? publicUrl(props.src) : undefined))
const posterSrc = computed(() => (props.poster ? publicUrl(props.poster) : undefined))
const captionsSrc = computed(() => (props.captions ? publicUrl(props.captions) : undefined))
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
      <!-- off until the viewer turns it on: not `default` -->
      <track
        v-if="captionsSrc"
        kind="captions"
        srclang="en"
        :src="captionsSrc"
        :label="t('project.captionsLabel')"
      >
      {{ t('project.videoFallback') }}
    </video>
  </figure>
</template>
