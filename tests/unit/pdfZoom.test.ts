import { describe, expect, it } from 'vitest'
import { clampPage, clampZoom, fitScale, stepZoom, ZOOM_MAX, ZOOM_MIN } from '../../app/utils/pdfZoom'

describe('fitScale', () => {
  it('scales the page to the container width', () => {
    expect(fitScale(600, 300)).toBe(0.5)
    expect(fitScale(600, 1200)).toBe(2)
  })

  it('falls back to 1 for an unmeasured page or container', () => {
    expect(fitScale(0, 300)).toBe(1)
    expect(fitScale(600, 0)).toBe(1)
  })
})

describe('clampZoom', () => {
  it('keeps values inside the range', () => {
    expect(clampZoom(1)).toBe(1)
    expect(clampZoom(0.1)).toBe(ZOOM_MIN)
    expect(clampZoom(10)).toBe(ZOOM_MAX)
  })
})

describe('stepZoom', () => {
  it('moves by one step', () => {
    expect(stepZoom(1, 1)).toBe(1.25)
    expect(stepZoom(1, -1)).toBe(0.75)
  })

  it('stops at the limits', () => {
    expect(stepZoom(ZOOM_MAX, 1)).toBe(ZOOM_MAX)
    expect(stepZoom(ZOOM_MIN, -1)).toBe(ZOOM_MIN)
  })
})

describe('clampPage', () => {
  it('keeps the page inside 1..count', () => {
    expect(clampPage(0, 3)).toBe(1)
    expect(clampPage(2, 3)).toBe(2)
    expect(clampPage(4, 3)).toBe(3)
  })

  it('never goes below 1 for an empty document', () => {
    expect(clampPage(5, 0)).toBe(1)
  })
})
