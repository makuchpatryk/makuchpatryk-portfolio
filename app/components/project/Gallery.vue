<script setup lang="ts">
const props = withDefaults(defineProps<{
  slug: string
  images?: string[]
  /** how many placeholder tiles to show when there are no images */
  placeholders?: number
  cols?: 2 | 3
}>(), { images: () => [], placeholders: 3, cols: 3 })

const { t, te } = useI18n()

const tiles = computed(() =>
  props.images.length
    ? props.images.map((src, i) => ({
        src,
        caption: te(`projects.${props.slug}.gallery.${i}`) ? t(`projects.${props.slug}.gallery.${i}`) : ''
      }))
    : Array.from({ length: props.placeholders }, () => ({ src: '', caption: t('project.galleryCaption') }))
)
</script>

<template>
  <ul class="grid gap-4" :class="cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'">
    <li v-for="(tile, i) in tiles" :key="i" class="flex flex-col gap-2.5">
      <NuxtImg
        v-if="tile.src"
        :src="tile.src"
        :alt="tile.caption"
        width="640"
        height="260"
        loading="lazy"
        class="h-[260px] w-full rounded-[10px] border border-border object-cover"
      />
      <div
        v-else
        class="flex h-[260px] items-center justify-center rounded-[10px] border border-dashed border-border-strong bg-surface font-mono text-[13px] text-muted"
      >
        {{ cols === 2 ? t('project.screenshotPlaceholder', { n: i + 1 }) : t('project.galleryPlaceholder') }}
      </div>
      <p v-if="tile.caption" class="text-sm text-muted">{{ tile.caption }}</p>
    </li>
  </ul>
</template>
