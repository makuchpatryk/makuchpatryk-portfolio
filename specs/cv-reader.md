# CV reader at /cv — Implementation Plan

## Summary

Visitors can only download `public/cv.pdf` today. Every link carries `download`, so the CV can't be read on the site and can't be shared as a page. This plan adds a prerendered `/cv` page with a pdf.js canvas reader. The CV is English only, so there is no `/pl/cv` page. The reader shows one page at a time, has a custom toolbar (zoom −/+, fit, prev/next when there is more than one page, download), and puts a text layer and link layer over the canvas. Every CV entry point now goes to `/cv`.

## Success Criteria

- `pnpm generate` emits `cv/index.html` only. `/pl/cv` redirects to `/cv`. Neither prerendered HTML file nor the home page's JS references pdf.js. The pdf.js chunk loads only on `/cv`, and a Playwright request listing on `/` proves it.
- On `/cv` at the desktop and mobile Playwright viewports, the page renders into a `<canvas>` with non-zero size. By default the canvas width equals the container width. `.textLayer` contains `Senior Software Engineer`, and the `github.com/makuchpatryk` link annotation is an `<a target="_blank">` in the link layer.
- Zoom in grows the canvas CSS width by one step. Fit restores the container width. Download links to `cv.pdf`, and fetching that link returns 200 with `application/pdf`. Prev/next and the page counter are absent because `cv.pdf` has 1 page.
- When `cv.pdf` returns 404 (route interception), the page shows a `role="alert"` message and a download link. With JS off, `/cv` still shows the heading and a working download link.
- `pnpm lint`, `typecheck`, `test`, `check:locales`, `generate`, `check:placeholders` and `test:e2e` (root base and `/makuchpatryk/` base) are green. Axe reports 0 violations on `/cv` in both themes.

## Scope & Constraints

- **In scope:**
  - `/cv` page and reader component
  - composable and pure util
  - entry-point links (header, mobile nav, hero CTA, footer)
  - i18n keys, prerender and sitemap entries
  - e2e and unit tests
  - updates to ARCHITECTURE and PRD
- **Out of scope:**
  - continuous scroll, thumbnails, search, print
  - custom pinch gesture
  - keyboard shortcuts
  - dark inversion of the PDF
  - a Polish CV or a `/pl/cv` route. There is one English `cv.pdf` (PRD §2).
  - the `/cv` page in Lighthouse CI. It is client-heavy, and the LHCI list measures content pages.
- **Hard constraints:**
  - The site is static SSG on GitHub Pages, with no server and no custom headers.
  - pdf.js must never be evaluated during SSR, because it touches `DOMMatrix` and canvas.
  - Every public or worker URL must survive the `/makuchpatryk/` base path.
  - No `dark:` variants and no hex colours.
  - All copy lives in i18n with EN/PL parity.
  - No bracketed placeholder text, because the placeholder gate rejects it.
- **Trade-offs:**
  - **Native browser pinch is left alone.** This follows WCAG 1.4.4. The reader offers −/+ and fit buttons, and doesn't implement its own pinch gesture.
  - **The paper stays white in both themes.** It is a real CV, and inverting it would distort its colours and links. Only the toolbar and the surround use theme tokens.
  - **Prev/next and the counter are hidden when `pageCount === 1`.** The code still supports N pages, so a longer CV needs no code change.

## Architecture & Design

### High-Level Flow

```
SiteHeader / MobileNav / Hero CTA / SiteFooter
        │  NuxtLink to '/cv' (literal path, so PL pages land on the English CV)
        ▼
app/pages/cv.vue  (prerendered: usePageSeo, h1, <CvReader>)
        │
        ▼
<CvReader>  SSR output: toolbar shell with the download <a>, A4 skeleton, <noscript> hint
        │ onMounted
        ▼
usePdfDocument(containerRef, src)
   ├─ Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')])
   ├─ GlobalWorkerOptions.workerSrc = workerUrl ; getDocument({ url: publicUrl(site.cv), verbosity: 0 })
   ├─ renderPage(n, scale): cancel the previous RenderTask → canvas (DPR ≤ 2)
   │                        → TextLayer → link layer (getAnnotations, subtype Link + url)
   ├─ ResizeObserver(container) → recompute fit scale (rAF-throttled)
   └─ onBeforeUnmount: renderTask.cancel(), loadingTask.destroy()
        │
        ▼
state { status: 'loading' | 'ready' | 'error', page, pageCount, zoom }
   scale = fitScale(pageWidth, containerWidth) × zoom      ← utils/pdfZoom.ts (pure)
```

### Key Changes

- **`package.json`**: add `pdfjs-dist@6.5.438` (published 2026-11-01) with an exact pin. Before coding, check the v6 API names (`TextLayer`, `page.render({ canvas, viewport })`, the worker path, and the CSS variable the text layer needs).
- **`app/utils/pdfZoom.ts` (new, pure, no Nuxt imports)**:
  - `fitScale(pageWidth, containerWidth)`
  - `clampZoom(z)` clamps to the range `[0.5, 3]`
  - `stepZoom(z, dir)` changes the zoom by ±0.25 and clamps it
  - `clampPage(n, count)`

  This keeps the rules in `utils/` per CODE_QUALITY, so Vitest can test them directly.
- **`app/composables/usePdfDocument.ts` (new)**: owns the pdf.js lifecycle:
  - lazy import
  - document load
  - render with task cancellation
  - text and link layers
  - `ResizeObserver`
  - cleanup

  It exposes `status`, `page`, `pageCount` and `zoom`, plus `zoomIn`, `zoomOut`, `fit`, `next` and `prev`. It renders no markup; it only writes into the container elements it is given.
- **`app/components/cv/CvReader.vue` (new, `<CvReader>`)**:
  - Toolbar of 44px buttons with `aria-label`s from i18n: zoom out, zoom in, fit, and `v-if="pageCount > 1"` prev/next with a counter (`aria-live="polite"`).
  - The download `<a :href="publicUrl(site.cv)" download>` is always SSR-rendered.
  - Stage: `bg-surface-2` surround, a canvas with `aria-label`, an absolutely positioned `.textLayer` and a link layer.
  - Skeleton: an A4 aspect box whose pulse is off under `prefers-reduced-motion`. It is shown while `status === 'loading'`.
  - Error: `role="alert"` with copy and the download link.
  - `<noscript>`: a hint pointing to the download link, with CSS that hides the skeleton.
  - Imports `pdfjs-dist/web/pdf_viewer.css`, so the CSS lands in the `/cv` chunk only. If that file is large, inline just the `.textLayer` rules instead.
- **`app/pages/cv.vue` (new)**:
  - `usePageSeo({ title: t('meta.cv.title'), description: t('meta.cv.description'), ogSubtitle: t('meta.ogCvSubtitle') })`
  - Header block as in `pages/projects/index.vue` (`gridbg border-b`, `UiSectionHeading as="h1"`), then `<CvReader />`.
- **Entry points** (keep the existing classes; swap `<a :href download>` for `<NuxtLink to="/cv">`):
  - `app/components/layout/SiteHeader.vue:46` keeps the bordered accent button.
  - `app/components/layout/MobileNav.vue:48`.
  - `app/components/layout/SiteFooter.vue:21`.
  - `app/components/home/HeroSection.vue:43-49`: the mobile-only `sm:hidden` download anchor becomes a "view CV" CTA visible on every viewport. It gets the secondary style (`border-border-strong hover:border-accent`); "view projects" stays primary.
  - `usePublicUrl` and `site` imports that become unused are removed. Active state comes from NuxtLink's automatic `aria-current="page"`.
- **`i18n/locales/en.json`, `pl.json`**:
  - `nav.cv` and `contact.cv` change from `"cv.pdf ↓"` to `"cv"`.
  - New: `hero.viewCv`, `meta.cv.{title,description}`, `meta.ogCvSubtitle`.
  - New: `cv.{eyebrow,title,loading,error,download,zoomIn,zoomOut,fit,prev,next,page,canvasLabel,noscript}`. `cv.page` is `"{current} / {total}"`. PL values are English copies, because the page is English only. The parity test still needs the keys in both files.
- **`nuxt.config.ts`**: `pagePaths` gains `'/cv'` (sitemap), and `nitro.prerender.routes` gains `'/cv'` only.
- **`/pl/cv` redirect**: `cv.vue` redirects a PL visit to `/cv`. Verify in the @nuxtjs/i18n docs that `/cv` does not advertise `/pl/cv` as an hreflang alternate.
- **No change** to `app/data/site.ts`. `site.cv = 'cv.pdf'` stays the single source.
- **API or data model**: none.

### Fit with Project Docs

- **ARCHITECTURE.md**:
  - The page lives in `pages/` and the component in `components/cv/`.
  - Lifecycle glue goes in `composables/` and rules in `utils/` (§3 layers).
  - `/cv` is a real prerendered file (§4).
  - URLs go through `usePublicUrl()` and the Vite `?url` worker import (§4 base URL).
  - Tokens only (§7).
  - Content works without JS: the download link and heading are SSR-rendered (§1).
  - The heavy JS is a lazy chunk on one route (§9).
  - Targets are 44px, focus is visible, the counter is `aria-live`, and axe runs in both themes (§11).
- **CODE_QUALITY.md**:
  - KISS: raw pdfjs-dist with no Vue wrapper. The link layer maps `Link` annotations by hand instead of using `AnnotationLayer` and `PDFLinkService`, since a CV has no internal destinations.
  - YAGNI: no thumbnails, search or custom pinch. Prev/next is hidden at 1 page, but the logic exists because the user asked for page navigation.
  - DRY: `site.cv` and `usePublicUrl()` stay the only sources.
  - Separation: util, composable and component, each with one job.
  - Rule bent: the composable touches DOM elements that the component passes in as refs. That is the minimum glue pdf.js needs, and the composable still renders no template.
- **Docs to update**:
  - ARCHITECTURE §2 (stack row "PDF: pdfjs-dist, lazy on /cv"), §3 (directory map), §4 (prerendered routes), §8 (header CV link plus a new "CV reader" bullet), §9 (lazy pdf.js chunk), §12 (new e2e and unit coverage).
  - PRD lines 6, 18, 47 and 140 (CV is viewed, not only downloaded). PRD line 219 is stale (`cv.pdf` is real now) and should be marked done.

### Alternative Approaches Considered

- **`<iframe>`/`<embed>` of cv.pdf**: zero dependencies, but no custom toolbar or theming, and poor results on iOS and Android. Rejected; the user chose pdf.js.
- **`vue-pdf-embed` or a similar wrapper**: less glue, but it adds a third-party Vue layer with its own worker and toolbar opinions. Rejected.
- **pdf.js `AnnotationLayer` with `PDFLinkService`**: handles internal destinations, but pulls in `pdf_viewer.mjs` and adds API surface. Rejected; external URL links are mapped by hand.
- **Copy the worker into `public/`**: adds a vendored file of about 1 MB that must be bumped by hand. Rejected in favour of the Vite `?url` import, which is hashed into `_nuxt/` and respects the base.
- **All logic in the component**: fewer files, but no unit-testable rules. Rejected per the user's choice and the CODE_QUALITY layering.
- **Block native pinch (`touch-action`)**: keeps the render sharp, but regresses WCAG 1.4.4. Rejected per the user's choice.

## Implementation Steps

1. `pnpm add pdfjs-dist@6.5.438`. Read the package's `types` to confirm the `TextLayer`, `render` and worker paths for v6.
2. Write `app/utils/pdfZoom.ts` and `tests/unit/pdfZoom.test.ts`, test first. Cover `fitScale`, `clampZoom` bounds, `stepZoom` at the limits, and `clampPage`.
3. Add the i18n keys to `en.json` and `pl.json`, and change `nav.cv` and `contact.cv`. Run `pnpm check:locales`.
4. Write `app/composables/usePdfDocument.ts`:
   - lazy import of pdfjs and the worker URL
   - `getDocument({ url, verbosity: 0 })`
   - `renderPage`, which cancels the previous task and ignores `RenderingCancelledException`
   - text layer and link layer (`<a target="_blank" rel="noopener noreferrer">`, rect via `viewport.convertToViewportRectangle`)
   - rAF-throttled `ResizeObserver`
   - cleanup in `onBeforeUnmount`
5. Write `app/components/cv/CvReader.vue`: toolbar, stage, skeleton, error and noscript, wired to the composable.
6. Write `app/pages/cv.vue` with `usePageSeo` and the heading.
7. Add `/cv` to `nuxt.config.ts` (`pagePaths` and the prerender routes), and add the `/pl/cv` redirect in `cv.vue`. Run `pnpm generate` to confirm the build and the absence of SSR errors.
8. Switch the entry points: SiteHeader, MobileNav, SiteFooter, and the HeroSection CTA (visible on every viewport). Remove unused imports.
9. Update the tests:
   - Do not add `'cv'` to `routes` in `tests/e2e/helpers.ts`, because that list is crossed with locales. Give `/cv` its own EN-only checks in smoke, axe and unique titles.
   - Point the `cv.pdf` check in `tests/e2e/smoke.spec.ts:74` at the reader's download link on `cv`.
   - Make the CV link in the header and mobile menu navigate to `/cv` (`interaction.spec.ts`).
   - Add `/cv` to the no-JS test: the download link is present.
10. Add `tests/e2e/cv.spec.ts`:
    - the canvas renders at the container width
    - the text layer contains `Senior Software Engineer`
    - the github link sits in the link layer
    - zoom in, then fit
    - no prev/next at 1 page
    - a 404 shows the alert and the fallback link
    - `/` doesn't request the pdf.js chunk
11. Update the docs: ARCHITECTURE §2, §3, §4, §8, §9, §12 and PRD lines 6, 18, 47, 140, 219.
12. Run the full gate: lint, typecheck, test, check:locales, generate, check:placeholders, e2e at root and at `E2E_BASE=/makuchpatryk/` with `NITRO_PRESET=github_pages`. Compare the `_nuxt` entry chunk size before and after.

### Risks & Mitigations

- **pdf.js evaluated during prerender breaks `generate`** (`DOMMatrix`, `Promise.withResolvers`).
  - Mitigation: only a dynamic import inside `onMounted`; no top-level import anywhere in `app/`. Step 7 catches it early.
  - Fallback: wrap `<CvReader>` in `<ClientOnly>` with the skeleton as `#fallback`. The download link stays outside it so it is still SSR-rendered.
- **Worker or PDF returns 404 under the `/makuchpatryk/` base.**
  - Mitigation: the worker uses a Vite `?url` import and the PDF uses `usePublicUrl()`. The non-root e2e run proves both.
- **Smoke tests fail on console output.** pdf.js logs warnings through `console`, and the smoke spec asserts no console errors.
  - Mitigation: `verbosity: 0`. Ignore `RenderingCancelledException` on fast clicks and resizes.
- **Text or link layer drifts from the canvas at some zoom levels**, or the v6 text-layer CSS variable is missing.
  - Mitigation: build all three layers from the same `viewport`, and set the CSS scale variable the v6 TextLayer expects (step 1 checks which). `cv.spec.ts` tests at fit and after zoom.
- **Older browsers (Safari < 17.4) lack the modern APIs pdf.js 6 needs.**
  - Mitigation: a load error falls into the error state, which keeps the download link, so the CV is always reachable. No polyfills (YAGNI).
- **Bundle growth leaks into other routes.**
  - Mitigation: one dynamic import, the CSS imported only in `CvReader`, and a request check on `/` in `cv.spec.ts`.

## Test Strategy

- **Unit (Vitest)**: `tests/unit/pdfZoom.test.ts` covers fit scale, zoom clamp and step, and page clamp. The existing locale parity test covers the new keys.
- **E2E (Playwright, built site, 2 viewports, 2 locales)**:
  - `cv.spec.ts`: render, text layer, link layer, zoom and fit, page nav hidden at 1 page, error state through route interception, no pdf.js on `/`.
  - `smoke`: `/cv` in routes, `cv.pdf` 200 and `application/pdf` from the reader link, no console errors or failed requests.
  - `a11y`: axe on `/cv` in dark and light.
  - `interaction`: header and mobile-menu CV links reach `/cv`.
  - no-JS: the download link exists.
  - Everything runs at both the root base and the `/makuchpatryk/` base.
- **Manual**:
  - iOS Safari and Android Chrome: fit-to-width, native pinch still works, buttons tappable.
  - Both themes (white paper, themed chrome).
  - Text selection and copy.
  - Clicking the github, linkedin and mailto links.
  - `/pl/cv` copy.
- **Performance**: compare the `_nuxt` entry chunk byte size before and after (expect noise only).

## Success Checklist

- [ ] All success criteria met (with evidence)
- [ ] Unit and e2e tests passing (root and non-root base)
- [ ] Code review approved
- [ ] ARCHITECTURE §2, §3, §4, §8, §9, §12 and PRD updated
- [ ] No regressions: header, mobile menu, footer and hero links; theme toggle; language switch on `/cv` ends on `/cv` through the `/pl/cv` redirect

## Timeline & Estimates

- Implementation (util, composable, component, page, links, i18n, config): ~5 h
- Testing (unit, cv.spec, updates to the existing specs, non-root run, manual mobile): ~2.5 h
- Review and polish (docs, bundle check, copy): ~1 h
- **Total**: ~8.5 h plus buffer

## Open Questions

- [ ] Final copy for `nav.cv`/`contact.cv` (proposed `"cv"`) and `hero.viewCv` (proposed "view CV →" / "zobacz CV →"). This can be tuned during implementation.
