<script setup lang="ts">
import { site } from '~/data/site'

const { t } = useI18n()
const src = usePublicUrl()(site.cv)

const container = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const textLayer = ref<HTMLElement>()
const linkLayer = ref<HTMLElement>()

const { status, page, pageCount, zoomIn, zoomOut, fit, next, prev } = usePdfDocument(src, { container, canvas, textLayer, linkLayer })

const buttonClass = 'inline-flex size-11 items-center justify-center rounded-md border border-border-strong font-mono text-lg transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50'
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2" role="toolbar" :aria-label="t('cv.eyebrow')">
      <button type="button" :class="buttonClass" :aria-label="t('cv.zoomOut')" :disabled="status !== 'ready'" @click="zoomOut">
        <span aria-hidden="true">−</span>
      </button>
      <button type="button" :class="buttonClass" :aria-label="t('cv.zoomIn')" :disabled="status !== 'ready'" @click="zoomIn">
        <span aria-hidden="true">+</span>
      </button>
      <button type="button" :class="buttonClass" :aria-label="t('cv.fit')" :disabled="status !== 'ready'" @click="fit">
        <span aria-hidden="true">↔</span>
      </button>
      <template v-if="pageCount > 1">
        <button type="button" :class="buttonClass" :aria-label="t('cv.prev')" :disabled="page <= 1" @click="prev">
          <span aria-hidden="true">←</span>
        </button>
        <span class="font-mono text-sm text-muted" aria-live="polite">{{ t('cv.page', { current: page, total: pageCount }) }}</span>
        <button type="button" :class="buttonClass" :aria-label="t('cv.next')" :disabled="page >= pageCount" @click="next">
          <span aria-hidden="true">→</span>
        </button>
      </template>
      <a
        :href="src"
        download
        class="ml-auto inline-flex min-h-11 items-center rounded-md border border-accent px-4 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-accent-fg"
      >
        {{ t('cv.download') }}
      </a>
    </div>

    <p v-if="status === 'error'" role="alert" class="rounded-md border border-border-strong bg-surface p-4 text-text-2">
      {{ t('cv.error') }}
    </p>

    <div class="bg-surface-2 p-3 md:p-6">
      <div ref="container" class="w-full overflow-x-auto">
        <div
          v-if="status === 'loading'"
          class="mx-auto aspect-[210/297] w-full max-w-3xl bg-surface motion-safe:animate-pulse noscript:hidden"
          role="status"
        >
          <span class="sr-only">{{ t('cv.loading') }}</span>
        </div>
        <!-- no <noscript> hint: the browser parses its content as text, which Vue then reports as a hydration mismatch -->
        <!-- the paper stays white in both themes: it is a real document, inverting it would distort colours and links -->
        <div v-show="status === 'ready'" class="relative mx-auto w-fit bg-white">
          <canvas ref="canvas" role="img" :aria-label="t('cv.canvasLabel')" class="block" />
          <div ref="textLayer" class="textLayer" />
          <div ref="linkLayer" class="absolute inset-0 z-10" />
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Unscoped: pdf.js creates the text runs itself. Only the rules the text layer needs (the full pdf_viewer.css is ~170 KB). -->
<style>
.textLayer {
  position: absolute;
  inset: 0;
  overflow: clip;
  line-height: 1;
  text-align: initial;
  forced-color-adjust: none;
  transform-origin: 0 0;
  z-index: 0;
  --min-font-size: 1;
  --text-scale-factor: calc(var(--total-scale-factor) * var(--min-font-size));
  --min-font-size-inv: calc(1 / var(--min-font-size));
}

.textLayer :is(span, br) {
  position: absolute;
  color: transparent;
  white-space: pre;
  cursor: text;
  transform-origin: 0 0;
  user-select: text;
}

.textLayer > :not(.markedContent),
.textLayer .markedContent span:not(.markedContent) {
  z-index: 1;
  --font-height: 0;
  --scale-x: 1;
  --rotate: 0deg;
  font-size: calc(var(--text-scale-factor) * var(--font-height));
  transform: rotate(var(--rotate)) scaleX(var(--scale-x)) scale(var(--min-font-size-inv));
}

.textLayer .markedContent {
  display: contents;
}

.textLayer ::selection {
  background: color-mix(in srgb, var(--accent) 35%, transparent);
  color: transparent;
}

.cvLink {
  position: absolute;
  display: block;
}

.cvLink:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
