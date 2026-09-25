# Architecture

How the portfolio is built and why. For setup see the [README](../README.md), for hosting see [deploy.md](./deploy.md), for the product spec see [PRD.md](./PRD.md), for the rules code is written against see [CODE_QUALITY.md](./CODE_QUALITY.md).

## 1. Overview

A fully static, bilingual (EN default, PL) portfolio. `nuxt generate` prerenders every route to real `index.html` files, so the site works without JavaScript for content; hydration only enhances the theme toggle, tag filter and mobile menu. There is no server runtime, CMS, database or analytics.

```
 app/data/*.ts  ─┐                    ┌─> prerendered HTML (SSR at build time)
 i18n/locales/*  ├─> Nuxt 4 (SSG) ───┤
 app/components  ─┘                    └─> .output/public  ─> any static host
```

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | Nuxt 4, `ssr: true`, built with `nuxt generate` |
| Styling | Tailwind CSS v4 (CSS-first, `@tailwindcss/vite`), CSS-variable design tokens |
| i18n | `@nuxtjs/i18n`, strategy `prefix_except_default`, no browser-language redirect |
| Theme | `@nuxtjs/color-mode` (dark default, `.light` class on `<html>`) |
| Fonts | `@nuxt/fonts`: Geist + Geist Mono, self-hosted at build time, `latin` + `latin-ext` (Polish diacritics) |
| Images | `@nuxt/image` (build-time optimisation, avif/webp) |
| SEO | `nuxt-og-image` (satori), `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org` |
| Quality | ESLint (`@nuxt/eslint`), `vue-tsc` (TypeScript 5.9), Vitest, Playwright + axe, Lighthouse CI, Husky + lint-staged |
| Tooling | pnpm 11, Node 22 |

## 3. Directory map

```
app/
  app.vue, error.vue         root (locale head, theme-color) and 404/error page
  layouts/default.vue        skip link, header, <main id="main">, footer
  pages/                     index.vue, projects/index.vue, projects/[slug].vue
  components/
    layout/                  SiteHeader, SiteFooter, MobileNav, ThemeToggle, LangSwitcher
    home/                    Hero, TerminalBlock, Projects, Experience, Stack, About, Contact sections
    project/                 ProjectCard, ProjectFeatured, PipelineDiagram, TagFilter,
                             MetricGrid, VideoPlayer, Gallery, ProjectToc, ProjectNav
    ui/                      TagChip, ExternalLink, SectionHeading, PhotoFrame
    OgImage/                 PortfolioCard.satori.vue (OG image template)
  composables/               useProjects, useLocalizedProject, useProjectFilter,
                             usePageSeo, usePublicUrl, useMessageList
  data/                      site.ts, projects.ts, experience.ts, stack.ts   (typed, non-translated content)
  types/content.ts           domain types + DETAIL_KEYS
  utils/projects.ts          pure logic (filter, sort, adjacency, localize)
  assets/css/main.css        Tailwind import, tokens, base/components layers
i18n/
  i18n.config.ts             vue-i18n options (fallbackLocale: en)
  locales/en.json, pl.json   all copy
public/                      cv.pdf, favicon.svg, images/, videos/
scripts/                     check-placeholders, check-locales, check-video-size, encode-video, serve
tests/                       unit/ (Vitest) and e2e/ (Playwright)
docs/                        this file, deploy.md, content-checklist.md, design/ (tokens, boards)
```

Nuxt name mapping: components are auto-imported with their folder as a prefix (`layout/SiteHeader.vue` → `<LayoutSiteHeader>`, `home/HeroSection.vue` → `<HomeHeroSection>`); Nuxt de-duplicates the prefix when the filename already starts with it (`project/ProjectCard.vue` → `<ProjectCard>`).

## 4. Rendering and routing

- **Build**: `nuxt generate` prerenders `/`, `/projects`, `/projects/<slug>` for every project with `detail: true`, each in EN and under `/pl`. The route list is derived from `app/data/projects.ts` in `nuxt.config.ts`; `crawlLinks` is on and `failOnError` makes a broken link fail the build. `404.html` and `200.html` are emitted too.
- **Every route is a real file.** GitHub Pages has no rewrite rules, so there is no SPA fallback: deep links resolve to their own `index.html`.
- **Locales**: EN lives at `/`, PL at `/pl/*`. `detectBrowserLanguage` is off, so a Polish browser still lands on EN and switches deliberately. The switcher uses `useSwitchLocalePath`, so the current path is kept.
- **Not-found**: a slug without `detail: true` is not prerendered; the page also throws a 404 `createError` if reached client-side.
- **Payloads**: `experimental.payloadExtraction` is off; payloads are tiny and inlined in the HTML, avoiding an extra `_payload.json` request per page.

### Base URL and host independence

The build has no host logic. Three env vars decide everything (details in [deploy.md](./deploy.md)):

| Var | Effect |
|---|---|
| `NUXT_APP_BASE_URL` | `app.baseURL` (`/` or `/<repo>/`) |
| `NUXT_PUBLIC_SITE_URL` | site **origin only**; canonical, hreflang, sitemap and OG URLs. The modules append the base path themselves |
| `NITRO_PRESET` | `github_pages` in the deploy workflow only (emits `.nojekyll` so `_nuxt/` isn't dropped by Jekyll) |

Rule for code: never hardcode a leading `/` for files in `public/`. Use `NuxtLink`/`NuxtImg` for routes and images, and `usePublicUrl()` (wraps `withBase` around `app.baseURL`) for raw `<a href="cv.pdf">` and `<video src>`.

## 5. Content model

Content is split by whether it needs translating:

| Where | What | Example |
|---|---|---|
| `app/data/*.ts` (typed) | structure, ids, links, tags, order, non-translated strings | `projects.ts`, `site.ts` |
| `i18n/locales/{en,pl}.json` | every user-visible sentence | `projects.<slug>.title` |

```ts
interface Project {
  slug: string; featured: boolean; order: number
  category: 'rag' | 'ai-workflow' | 'full-stack'   // drives the accent colour
  tags: Tag[]; stack: string[]
  links: { demo?: string; code?: string }
  detail: boolean                                   // true => /projects/[slug] is prerendered
  media?: { video?; poster?; cover?; gallery? }
  meta: { year: number; type: 'commercial' | 'personal' }
  pipeline?: { ingest: string[]; query: string[]; highlight?: string[] }  // step keys -> i18n
  metrics?: { key: string }[]                       // label/value via i18n
}
```

Copy layout per project: `projects.<slug>.{title,summary,role,effect}` for cards, plus for detail projects `duration`, `problem.{heading,body}`, `solution.{heading,body}`, `architecture.body`, `lessons[]` and `metrics.<key>.{value,label}`. The list of required detail keys is `DETAIL_KEYS` in `app/types/content.ts`; a unit test asserts every `detail: true` project defines all of them in both locales, and that EN/PL key sets are identical.

Other copy: `experience.<id>.*`, `stack.groups.*` / `stack.items.*`, `pipeline.steps.*`, section/page strings. Array messages (bullets, lessons) are read with `useMessageList()` (`tm` + `rt`).

### Placeholders

Content ships as bracketed placeholders (`[Full Name]`, `[Project 1 name]`, `'[2024]'`). They are numbered per project so titles, descriptions and OG images stay unique while content is fake. `scripts/check-placeholders.mjs` scans built HTML (text and attributes, not scripts/styles) and is the launch gate. Legit brackets are safe: section numbers (`[01]`) don't match, and the hero terminal's `[rag, ai-workflows]` is drawn with CSS `::before/::after`, so brackets never appear in the HTML.

## 6. Data flow on a page

```
data/projects.ts ──> useProjects() ──> localizeProject(p, t, te) ──> LocalizedProject
                          │                    (reads projects.<slug>.* from i18n,
                          │                     falls back to slug, never a raw key)
                          ├─> featured  ──> HomeProjectsSection (1 lead + 2 cards)
                          ├─> all       ──> /projects (filtered by useProjectFilter)
                          └─> detail    ──> [slug].vue, prev/next (adjacentDetailProjects)
```

Pure logic (`app/utils/projects.ts`) has no Nuxt imports, so Vitest tests it directly: `filterProjects`, `collectTags`, `featuredProjects`, `detailProjects`, `adjacentDetailProjects` (wraps around), `localizeProject`.

### Tag filter

`useProjectFilter` holds a single selected tag (or `all`), synced to `?tag=`. State starts as `all` and reads the query only after mount, so prerendered HTML (all projects visible, works without JS) never mismatches on hydration. Buttons use `aria-pressed`; the result count is an `aria-live` status.

## 7. Theme and design tokens

- Tokens are CSS variables in `app/assets/css/main.css`: dark on `:root`, light on `.light`. Tailwind maps them with `@theme inline` (`bg-bg`, `text-muted`, `border-border`, `text-cat-rag`, …), so components never use `dark:` variants and the palette lives in one place.
- `@nuxtjs/color-mode` injects an inline script that sets the class on `<html>` before first paint (no flash). `ThemeToggle` swaps its sun/moon icon with pure CSS keyed on `.light`, and only trusts `colorMode.value` after mount, so hydration never mismatches.
- `<meta name="theme-color">` follows the theme via `app.vue`.
- Contrast is a tested invariant: `tests/unit/contrast.test.ts` parses `main.css` and asserts WCAG AA (4.5:1) for every text token on bg/surface/surface-2 in both themes. The design's `faint` colour failed AA and was lifted; rationale in [design/tokens.md](./design/tokens.md).
- Category colours (`rag`, `ai-workflow`, `full-stack`) are literal class names in `categoryTextClass()` so Tailwind's scanner sees them.

## 8. Layout and components

- **Shell**: `layouts/default.vue` renders a skip link, `SiteHeader`, `<main id="main" tabindex="-1">` and `SiteFooter`. `error.vue` reuses the layout and sets `lang` itself (it renders outside `app.vue`).
- **Header**: full nav from `xl`, `MobileNav` below. `MobileNav` is a `<details>/<summary>`, so it opens without JS; JS only adds close-on-navigate and Escape. On detail pages the desktop nav becomes "← all projects".
- **Nav anchors**: section links are `localePath('/') + '#projects'` etc., so they also work from other pages.
- **Home** is one page of sections (`projects`, `experience`, `stack`, `about`, `contact`) matching the design boards; there are no separate `/about` or `/stack` routes.
- **Detail page**: header meta grid, video slot, sticky table of contents (IntersectionObserver highlights the current section), five sections, gallery, prev/next among detail projects.
- **Media**: `VideoPlayer` renders `<video preload="none" playsinline controls>` with a `usePublicUrl` source when `media.video` is set, else a placeholder. `PhotoFrame`, `ProjectCard` and `Gallery` use `NuxtImg` when an image path exists and placeholders otherwise.

## 9. Hydration and performance

- Above the fold (header, hero) hydrates normally. Home sections below the hero use `<LazyHome…Section hydrate-on-visible />`: their HTML is prerendered, they hydrate on scroll, lowering total blocking time.
- Fonts: two self-hosted variable files (Geist, Geist Mono) with `font-display: swap`.
- Images: build-time optimisation, explicit width/height, lazy loading below the fold.
- Budget for video is enforced by `pnpm check:video-size` (≤15 MiB per file, ≤120 MiB total).

Measured on a slow dev box (Lighthouse `benchmarkIndex` 570): desktop 100 on all four categories; mobile accessibility/best-practices/SEO 100, performance 75–88. The CI Lighthouse job is non-blocking until mobile is confirmed on a GitHub runner.

## 10. SEO

- `usePageSeo({ title, description, ogSubtitle })` sets `useSeoMeta` and `defineOgImage('PortfolioCard', …)` for each page × locale. Titles/descriptions/OG images must be unique; an e2e test enforces it.
- `app.vue` calls `useLocaleHead({ seo: true })` for `lang`, canonical, `hreflang` pairs (+ `x-default`) and `og:locale`.
- OG images are rendered at build time by satori from `OgImage/PortfolioCard.satori.vue` (Geist, dark card), one per page per locale.
- Sitemaps are explicit per locale in `nuxt.config.ts` (`en-US`, `pl-PL`), each URL carrying its hreflang alternatives. The automatic i18n split mixed EN and PL URLs under a base path, so it is disabled. `robots.txt` is generated only when the base is `/`.
- `definePerson` (schema.org) on the home page. No analytics, no cookie banner.

## 11. Accessibility

Skip link, one `h1` per page with a logical heading order (project titles are `h2` under `/projects`, `h3` under the home section heading), `aria-current` on the active language and TOC entry, 44px minimum targets, visible `:focus-visible` outlines, `prefers-reduced-motion` disables smooth scroll and the blinking cursor, external links carry an sr-only "opens in a new tab" note. Both themes are checked with axe.

## 12. Testing

| Layer | Tool | Covers |
|---|---|---|
| Unit | Vitest (`tests/unit`) | filter/selection/adjacency logic, `localizeProject` fallback, EN/PL key parity, detail-key completeness, data ↔ copy links, contrast ratios |
| E2E | Playwright (`tests/e2e`) against the **built** site | route smoke × 2 locales × 2 viewports (no failed requests, no console errors), unique titles/OG, theme toggle + persistence + no flash, language switch, tag filter incl. `?tag=` restore, no-JS rendering, keyboard/skip link/focus, 404, base-URL correctness, axe WCAG 2.1 AA in dark and light |
| Perf/a11y | Lighthouse CI (`lighthouserc.cjs`) | 6 URLs × mobile/desktop, ≥0.95 assertions |

`scripts/serve.mjs` is a small static server that mimics GitHub Pages (directory index, `404.html` fallback, gzip, optional base path); Playwright's `webServer` uses it. E2E runs twice in CI: root base, and `/makuchpatryk/` with the `github_pages` preset to prove asset, video and `cv.pdf` URLs survive a subpath.

## 13. CI/CD

```
pull_request ─> ci.yml: lint, typecheck, unit, locale parity, video budget, generate, placeholder gate
                        ├─> e2e (root + non-root base)
                        └─> lighthouse (non-blocking for now)

push main / release* tag ─> deploy.yml: ci.yml ─> build (NITRO_PRESET=github_pages) ─> upload-pages-artifact ─> deploy-pages
```

The placeholder gate warns on `main` and fails the build on a `release*` tag. Locally, Husky + lint-staged run ESLint on staged files and the project typecheck; CI stays the source of truth.

## 14. Design decisions and gotchas

| Decision | Reason |
|---|---|
| Typed TS + JSON instead of Markdown/CMS | type safety, one place for copy, enforceable parity tests |
| CSS-variable tokens instead of `dark:` variants | one palette, zero per-component theme code |
| `ssr: true` + `generate` instead of an SPA shell | prerendered HTML is needed for SEO, OG tags and no-JS content |
| `color-mode` module instead of a custom composable | ships the no-flash inline script |
| `<details>` for the mobile menu | works without JS |
| Site URL is origin-only | modules append the base path; a path in `SITE_URL` doubles it |
| TypeScript pinned to 5.9 | `vue-tsc` 3.3 cannot drive TypeScript 7 |
| No `inlineStyles: true` | it inlined `@font-face` URLs without the base path and broke fonts under a subpath (caught by the non-root e2e run) |
| No scoped `:global(.light)` in `ThemeToggle` | the scoped CSS compiled to a bare `.light { display: none }` that hid `<html>` in light mode; the rules are plain unscoped CSS instead |
| Explicit per-locale sitemaps | automatic locale split is wrong under a base path |
| pnpm `allowBuilds` in `pnpm-workspace.yaml` | pnpm 11 blocks dependency build scripts (esbuild, sharp, resvg) unless allowed |

Known limitations: no `robots.txt` on a project-page subpath (only valid at a domain root); mobile Lighthouse performance is unconfirmed on CI hardware; demo videos are placeholders until real files are added.
