<script setup lang="ts">
const props = withDefaults(defineProps<{
  slug: string
  images?: string[]
  /** how many placeholder tiles to show when there are no images */
  placeholders?: number
  cols?: 2 | 3
}>(), { images: () => [], placeholders: 3, cols: 3 })

const { t, te } = useI18n()
const publicUrl = usePublicUrl()

const tiles = computed(() =>
  props.images.length
    ? props.images.map((src, i) => ({
        src,
        caption: te(`projects.${props.slug}.gallery.${i}`) ? t(`projects.${props.slug}.gallery.${i}`) : ''
      }))
    : Array.from({ length: props.placeholders }, () => ({ src: '', caption: t('project.galleryCaption') }))
)

const dialog = ref<HTMLDialogElement>()
const active = ref<{ src: string, caption: string } | null>(null)
const zoomed = ref(false)

function open(tile: { src: string, caption: string }) {
  active.value = tile
  zoomed.value = false
  dialog.value?.showModal()
}

function onClose() {
  active.value = null
}

// click on the backdrop (the dialog element itself, not its content) closes
function onBackdrop(e: MouseEvent) {
  if (e.target === dialog.value) dialog.value?.close()
}
</script>

<template>
  <ul class="grid gap-4" :class="cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'">
    <li v-for="(tile, i) in tiles" :key="i" class="flex flex-col gap-2.5">
      <button
        v-if="tile.src"
        type="button"
        class="cursor-zoom-in rounded-[10px]"
        :aria-label="t('project.imageOpen', { caption: tile.caption || String(i + 1) })"
        @click="open(tile)"
      >
        <NuxtImg
          :src="tile.src"
          :alt="tile.caption"
          width="640"
          height="360"
          loading="lazy"
          class="aspect-video w-full rounded-[10px] border border-border object-cover"
        />
      </button>
      <div
        v-else
        class="flex aspect-video items-center justify-center rounded-[10px] border border-dashed border-border-strong bg-surface font-mono text-[13px] text-muted"
      >
        {{ cols === 2 ? t('project.screenshotPlaceholder', { n: i + 1 }) : t('project.galleryPlaceholder') }}
      </div>
      <p v-if="tile.caption" class="text-sm text-muted">{{ tile.caption }}</p>
    </li>
  </ul>
  <dialog
    ref="dialog"
    class="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none bg-black/90 p-0 backdrop:bg-black/90"
    :aria-label="t('project.imageViewer')"
    @close="onClose"
    @click="onBackdrop"
  >
    <template v-if="active">
      <div class="flex h-full w-full overflow-auto">
        <button
          type="button"
          class="m-auto"
          :class="zoomed ? 'w-[250%] max-w-none shrink-0 cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in'"
          :aria-label="zoomed ? t('project.imageZoomOut') : t('project.imageZoomIn')"
          @click="zoomed = !zoomed"
        >
          <!-- original file: a static build only prerenders IPX variants present in the HTML -->
          <img
            :src="publicUrl(active.src)"
            :alt="active.caption"
            class="block h-auto max-h-dvh w-full object-contain"
            :class="zoomed ? 'max-h-none' : ''"
          >
        </button>
      </div>
      <button
        type="button"
        class="fixed right-4 top-4 rounded-md border border-border-strong bg-surface px-3 py-1.5 font-mono text-[13px] text-text"
        @click="dialog?.close()"
      >
        {{ t('project.imageClose') }}
      </button>
    </template>
  </dialog>
</template>
