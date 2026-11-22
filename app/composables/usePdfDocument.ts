import type { PDFDocumentProxy, PDFPageProxy, RenderTask, TextLayer } from 'pdfjs-dist'
import { clampPage, fitScale, stepZoom } from '~/utils/pdfZoom'

interface PdfElements {
  container: Ref<HTMLElement | undefined>
  canvas: Ref<HTMLCanvasElement | undefined>
  textLayer: Ref<HTMLElement | undefined>
  linkLayer: Ref<HTMLElement | undefined>
}

type PdfStatus = 'loading' | 'ready' | 'error'

// getAnnotations() is typed any[]; this is the slice of a Link annotation that is used
interface LinkAnnotation { subtype: string, url?: string, rect: number[] }

// Past 2x the extra canvas pixels cost memory and time without a visible gain.
const MAX_DPR = 2

/**
 * pdf.js lifecycle for the CV reader: lazy load, render one page into the given
 * elements (canvas + text layer + link layer), zoom/page state, cleanup.
 * pdf.js touches DOMMatrix and canvas at import time, so it is only imported
 * inside onMounted and never evaluated during prerender.
 */
export function usePdfDocument(src: string, { container, canvas, textLayer, linkLayer }: PdfElements) {
  const status = ref<PdfStatus>('loading')
  const page = ref(1)
  const pageCount = ref(0)
  const zoom = ref(1)

  let pdfjs: typeof import('pdfjs-dist') | undefined
  let pdf: PDFDocumentProxy | undefined
  let renderTask: RenderTask | undefined
  let textTask: TextLayer | undefined
  let renderId = 0
  let frame = 0
  let observer: ResizeObserver | undefined
  let destroy: (() => void) | undefined

  async function render() {
    const doc = pdf
    const box = container.value
    const canvasEl = canvas.value
    const textEl = textLayer.value
    const linksEl = linkLayer.value
    if (!doc || !box || !canvasEl || !textEl || !linksEl) return

    const id = ++renderId
    renderTask?.cancel()
    textTask?.cancel()
    // pdf.js refuses a second render() on a canvas that is still in use
    await renderTask?.promise.catch(() => {})
    if (id !== renderId) return

    const pdfPage = await doc.getPage(page.value)
    if (id !== renderId) return

    const base = pdfPage.getViewport({ scale: 1 })
    const viewport = pdfPage.getViewport({ scale: fitScale(base.width, box.clientWidth) * zoom.value })
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)

    canvasEl.width = Math.floor(viewport.width * dpr)
    canvasEl.height = Math.floor(viewport.height * dpr)
    canvasEl.style.width = `${viewport.width}px`
    canvasEl.style.height = `${viewport.height}px`

    renderTask = pdfPage.render({ canvas: canvasEl, viewport, transform: [dpr, 0, 0, dpr, 0, 0] })
    try {
      await renderTask.promise
    } catch (e) {
      if (id !== renderId) return // superseded by a newer render
      throw e
    }
    if (id !== renderId) return

    await renderTextAndLinks(pdfPage, viewport, textEl, linksEl, id)
    status.value = 'ready'
  }

  async function renderTextAndLinks(
    pdfPage: PDFPageProxy,
    viewport: ReturnType<PDFPageProxy['getViewport']>,
    textEl: HTMLElement,
    linksEl: HTMLElement,
    id: number
  ) {
    textEl.replaceChildren()
    // the text layer CSS sizes and positions its runs from this variable
    textEl.style.setProperty('--total-scale-factor', String(viewport.scale))
    textTask = new pdfjs!.TextLayer({ textContentSource: pdfPage.streamTextContent(), container: textEl, viewport })
    await textTask.render().catch(() => {}) // cancelled by a newer render
    if (id !== renderId) return

    const annotations: LinkAnnotation[] = await pdfPage.getAnnotations({ intent: 'display' })
    if (id !== renderId) return

    // A CV only has external links, so Link annotations are mapped by hand instead of pulling in AnnotationLayer.
    linksEl.replaceChildren(...annotations
      .filter((a): a is LinkAnnotation & { url: string } => a.subtype === 'Link' && !!a.url)
      .map((a) => {
        const [x1, y1] = viewport.convertToViewportPoint(a.rect[0]!, a.rect[1]!)
        const [x2, y2] = viewport.convertToViewportPoint(a.rect[2]!, a.rect[3]!)
        const link = document.createElement('a')
        link.href = a.url
        link.setAttribute('aria-label', a.url)
        link.className = 'cvLink'
        if (/^https?:/.test(a.url)) {
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
        }
        Object.assign(link.style, {
          left: `${Math.min(x1, x2)}px`,
          top: `${Math.min(y1, y2)}px`,
          width: `${Math.abs(x2 - x1)}px`,
          height: `${Math.abs(y2 - y1)}px`
        })
        return link
      }))
  }

  function safeRender() {
    render().catch(() => {
      status.value = 'error'
    })
  }

  onMounted(async () => {
    try {
      const [lib, { default: workerSrc }] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      ])
      pdfjs = lib
      lib.GlobalWorkerOptions.workerSrc = workerSrc
      const task = lib.getDocument({ url: src, verbosity: 0 })
      destroy = () => task.destroy()
      pdf = await task.promise
      pageCount.value = pdf.numPages

      // fires once on observe(), which draws the first page
      let lastWidth = 0
      observer = new ResizeObserver(() => {
        const width = container.value?.clientWidth ?? 0
        if (width === lastWidth) return
        lastWidth = width
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(safeRender)
      })
      if (container.value) observer.observe(container.value)
    } catch {
      status.value = 'error'
    }
  })

  watch([page, zoom], safeRender)

  onBeforeUnmount(() => {
    renderId++
    cancelAnimationFrame(frame)
    observer?.disconnect()
    renderTask?.cancel()
    textTask?.cancel()
    destroy?.()
  })

  return {
    status,
    page,
    pageCount,
    zoom,
    zoomIn: () => { zoom.value = stepZoom(zoom.value, 1) },
    zoomOut: () => { zoom.value = stepZoom(zoom.value, -1) },
    fit: () => { zoom.value = 1 },
    next: () => { page.value = clampPage(page.value + 1, pageCount.value) },
    prev: () => { page.value = clampPage(page.value - 1, pageCount.value) }
  }
}
