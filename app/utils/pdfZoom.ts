export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 3
export const ZOOM_STEP = 0.25

/** Scale at which a page of `pageWidth` (PDF points) fills `containerWidth` (CSS px). */
export function fitScale(pageWidth: number, containerWidth: number): number {
  if (pageWidth <= 0 || containerWidth <= 0) return 1
  return containerWidth / pageWidth
}

export function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))
}

export function stepZoom(zoom: number, direction: 1 | -1): number {
  return clampZoom(zoom + direction * ZOOM_STEP)
}

/** 1-based page number kept inside the document. */
export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(1, page), Math.max(1, pageCount))
}
