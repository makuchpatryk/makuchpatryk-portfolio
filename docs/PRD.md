# makuchpatryk — Portfolio Site PRD & Implementation Plan

> **Status: implemented.** Sections 1–12 are the original plan, corrected where the build differs (marked *Updated*). §13 lists every deviation, results and what is left. Architecture as built: [ARCHITECTURE.md](./ARCHITECTURE.md).

## 1. Summary
Static, bilingual (EN default / PL) developer portfolio for an AI / Software Engineer. Nuxt 4 SSG, Tailwind, dark-default terminal aesthetic with light toggle, content hardcoded as typed TS data + i18n JSON. Deployed to GitHub Pages via GitHub Actions (host-agnostic build, so moving later is a config change). Goal: recruiters/clients land, see 3 featured AI projects, drill into case studies, download CV, contact by mail/GitHub/LinkedIn.

## 2. Locked decisions
| Area | Decision |
|---|---|
| Framework | Nuxt 4, `nuxt generate` only (no server runtime) |
| Tooling | pnpm, Node LTS, TS strict, Tailwind CSS, ESLint, vue-tsc |
| Modules | @nuxtjs/i18n, @nuxt/image, @nuxt/fonts (Geist, Geist Mono self-host), @nuxtjs/color-mode, @nuxtjs/sitemap, @nuxtjs/robots, nuxt-og-image, nuxt-schema-org |
| i18n | EN at `/`, PL at `/pl/*`, strategy `prefix_except_default`, no browser-language redirect, hreflang, switcher in header |
| Content | Typed TS in `app/data/*` + copy in `i18n/locales/{en,pl}.json`. No markdown/CMS |
| Theme | Dark default (design), light derived, toggle, persisted, no flash |
| Projects | 7+; home shows 3 featured; `/projects` index w/ tag filter; `/projects/[slug]` only for projects with `detail: true` |
| CV | single static `public/cv.pdf` (EN), same for both locales |
| Video | self-hosted mp4 in `public/videos/` (size-capped, see risks) |
| Contact | mailto + GitHub + LinkedIn. No form |
| SEO | meta, OG, per-page OG image, sitemap, robots, hreflang, JSON-LD Person. No analytics, no cookie banner |
| Quality | ESLint, vue-tsc, Vitest, Playwright smoke, GitHub Actions; Lighthouse ≥95 x4, WCAG AA both themes, keyboard nav |
| Git hooks | Husky + lint-staged pre-commit (lint + typecheck on staged files); CI remains the source of truth |
| Tag filter | Single tag at a time (+ `all`), synced to `?tag=` |
| Theme impl | `@nuxtjs/color-mode` module (not custom composable) |
| Hero terminal | static text + blinking cursor; disabled under `prefers-reduced-motion` |
| Content status | Build with placeholders; content fill = separate checklist + launch gate |
| Host | **GitHub Pages** (Actions-based deploy). Nitro preset `github_pages`. Build stays host-agnostic: base URL + site URL come from env, no host logic in app code. *Updated:* `SITE_URL` is the site **origin only** (`https://user.github.io`); the modules append the base path |
| Deploy | `.github/workflows/deploy.yml`: on push to `main` → reuse CI → `pnpm generate` → upload `.output/public` → `actions/deploy-pages`. Domain: none yet (`user.github.io/<repo>/`); custom domain later = `public/CNAME` + base `/` |
| Name | package `makuchpatryk` (folder stays `makuchpatryk-new`) |

## 3. Success criteria
1. `pnpm generate` yields fully static `.output/public`; site works with JS disabled for content (hydration only enhances toggle/filter).
2. Lighthouse (mobile+desktop) ≥95 Performance/Accessibility/Best-Practices/SEO on home, /projects, one detail page, both locales, both themes.
3. axe: zero WCAG 2.1 AA violations incl. contrast in both themes; whole site operable by keyboard.
4. EN/PL locale files have identical key sets (test-enforced); every page has unique title/description/OG image/hreflang pair.
5. Launch gate script finds zero `[placeholder]` strings in built HTML.

## 4. Scope
In: home (hero, projects, experience, stack, about, contact), /projects, /projects/[slug], 404, header/footer, theme toggle, language switcher, SEO suite, CI.
Out: blog, CMS, contact form, analytics, cookie banner, auto language redirect, interactive terminal, server code, search.

## 5. Design analysis (from design.html — 3 boards)
Boards: Desktop 1440 (home), Mobile 390 (home), Project detail 1440.
Tokens (dark): bg `#0B0D10`, surface `#12151A`, surface-2 `#1A1E24`, border `#232830`, border-strong `#343A44`, text `#E6E8EB`, text-2 `#B4BAC4`, muted `#8B93A1`, faint `#5C6470`, accent teal `#5EEAD4`; secondary accents `#FDBA74 #A5B4FC #A3E635` (tag/category colors). Fonts Geist / Geist Mono. Design has `{{accent}}` tweak var → single `--accent` CSS var.
Contrast audit (computed): `#5C6470` = 3.25:1 on bg → **fails AA** for text (used ~12x in design). `#343A44` is border only (fine, non-text). Fix (*updated, as built*): token `faint` lifted to `#7F8896` dark / `#636D7B` light (≥4.5:1 on bg, surface and surface-2; enforced by `tests/unit/contrast.test.ts`). Light palette (derived): bg `#F7F8FA`, surface `#FFFFFF`, surface-2 `#EEF0F3`, border `#DDE1E7`, border-strong `#B9C0CA`, text `#14171C`, text-2 `#3D4450`, muted `#5B6472`, accent `#0F766E`, accent-fg `#FFFFFF`; category colours `#0F766E #9A3412 #4F46E5 #3F6212`. Detail: [design/tokens.md](./design/tokens.md).
Terminal nav labels `01.projekty … 05.kontakt` → i18n keys; header has cv.pdf button, mobile collapses nav.

## 6. Architecture

### 6.1 Structure
```
app/
  app.vue, error.vue
  layouts/default.vue        # skip link, header, <main>, footer
  assets/css/main.css        # tailwind + CSS var tokens (:root dark, .light)
  components/
    layout/  SiteHeader, SiteFooter, ThemeToggle, LangSwitcher, MobileNav
    home/    HeroSection, TerminalBlock, ProjectsSection, ExperienceSection, StackSection, AboutSection, ContactSection
    project/ ProjectCard, ProjectFeatured, TagFilter, PipelineDiagram, MetricGrid, VideoPlayer, Gallery, ProjectToc, ProjectNav
    ui/      TagChip, ExternalLink, SectionHeading, PhotoFrame
    OgImage/ PortfolioCard.satori.vue
  composables/ useProjectFilter, useProjects, useLocalizedProject, usePageSeo, usePublicUrl, useMessageList
  utils/     projects.ts   # pure filter/sort/adjacency/localize logic (unit-tested)
  data/      projects.ts, experience.ts, stack.ts, site.ts (social links, email)
  pages/     index.vue, projects/index.vue, projects/[slug].vue
  types/     content.ts
i18n/          i18n.config.ts
i18n/locales/ en.json, pl.json
public/      cv.pdf, videos/, images/, favicon
scripts/     check-placeholders.mjs, check-locales.mjs (also used by unit test), check-video-size.mjs, encode-video.sh, serve.mjs
tests/       unit/, e2e/
.github/workflows/ ci.yml (reusable, `workflow_call` + PR trigger), deploy.yml
nuxt.config.ts, eslint.config.mjs, playwright.config.ts, vitest.config.ts, lighthouserc.cjs, lint-staged.config.mjs, .env.example   # Tailwind v4 is CSS-first: no tailwind.config
docs/        PRD.md, ARCHITECTURE.md, deploy.md, content-checklist.md, design/ (design.html, boards/, tokens.md)
```
### 6.2 Data model (TS)
```ts
type Tag = 'rag'|'ai-workflow'|'llm-eval'|'python'|'fastapi'|'postgres'|'pgvector'|'aws'|'docker'|'vue'|'typescript'|...
interface Project {
  slug: string; featured: boolean; order: number
  category: 'rag'|'ai-workflow'|'full-stack'|...   // maps to accent color
  tags: Tag[]; stack: string[]
  links: { demo?: string; code?: string }
  detail: boolean                 // true => /projects/[slug] prerendered
  media?: { video?: string; poster?: string; cover?: string; gallery?: string[] }
  meta: { year: number; type: 'commercial'|'personal' }
  pipeline?: { ingest: string[]; query: string[]; highlight?: string[] } // keys -> i18n; highlight = accent steps
  metrics?: { key: string }[]      // label+value via i18n
}
```
i18n copy: `projects.<slug>.{title,summary,role,effect,problem,solution,architecture,results,lessons,...}`.
`Experience {id, from, to|null, current}` (years are `string | number` so placeholders like `'[2024]'` are caught by the launch gate) + i18n `experience.<id>.{role,company,location,bullets[]}`. `StackGroup {id, items[]}`.
Rule: a data entry with `detail:true` must have all detail i18n keys in both locales → enforced by unit test.

### 6.3 Routing / SSG
i18n `prefix_except_default`, default EN. Routes: `/`, `/projects`, `/projects/:slug` + `/pl/...`. `nitro.prerender.routes` generated from `projects.filter(detail)` × locales; `crawlLinks: true`; `404.html` generated. Home section nav = `localePath('/') + '#projects'`.
Env: `NUXT_PUBLIC_SITE_URL` (origin only: canonical/sitemap/OG), `NUXT_APP_BASE_URL` (subpath hosting). Local default `/` + placeholder domain.
GitHub Pages specifics:
- Preset: `NITRO_PRESET=github_pages` (set in deploy workflow env, not hardcoded, so local/other-host builds stay generic). Preset emits `.nojekyll` (else Jekyll drops `_nuxt/`) and `404.html`.
- Project repo (`user.github.io/<repo>/`): `NUXT_APP_BASE_URL=/<repo>/`, `NUXT_PUBLIC_SITE_URL=https://user.github.io` (*updated*: origin only — the SEO modules append the base, so a path here doubled it to `/<repo>/<repo>/`). User-site repo (`user.github.io`) or custom domain: base `/`.
- All internal asset/link URLs go through Nuxt (`NuxtLink`, `NuxtImg`, `useRuntimeConfig().app.baseURL` for raw `<video src>`/`cv.pdf` hrefs) — no hardcoded leading `/` for public files.
- SPA-style client routing is not used; every route is a real prerendered `index.html`, so deep links work without rewrites (GH Pages has none).

### 6.4 Theme
`@nuxtjs/color-mode`: `preference:'dark'`, `fallback:'dark'`, `classSuffix:''`, storageKey `theme`. Tokens as CSS vars (`--bg` …), Tailwind maps `bg-bg`, `text-muted` to vars, so components carry zero dark:-variants. Toggle = button with `aria-pressed`/label. `<meta name=theme-color>` per theme.

### 6.5 Tag filter
`useProjectFilter(projects)` — single-select tag (or `all`), synced to `?tag=` (user decision). Pure function `filterProjects(list, tag)` unit-tested. Without JS all projects visible (progressive enhancement).

### 6.6 SEO
`useSeoMeta` per page from i18n; nuxt-og-image component template (satori, Geist font, dark theme card, title/subtitle) per page × locale; `schema-org` Person on home; sitemap with i18n alternates; robots allow all (+ sitemap URL). *Updated:* sitemaps are declared explicitly per locale (`en-US`, `pl-PL`) with hreflang alternatives, because the automatic locale split mixed EN/PL URLs under a base path; `robots.txt` is emitted only when the base is `/` (the robots module refuses to emit it under a subpath).

### 6.7 Media
`@nuxt/image` (ipx at build) for photo/screenshots: webp/avif, explicit width/height, lazy below fold. Video: `<video preload="none" poster controls playsinline>` + `<source src=/videos/x.mp4>`.

### 6.8 Alternatives considered
- Content: Nuxt Content/markdown (rejected by user), CMS (overkill). Chosen: typed TS + i18n JSON → type safety, single place for copy.
- Theme: custom composable vs @nuxtjs/color-mode → module (handles no-flash script). Tailwind `dark:` variants vs CSS-var tokens → tokens (cleaner, one palette place).
- OG: static per-locale image vs nuxt-og-image → module (per-page requirement).
- Filter: multi-select vs single → single (user decision; simple, shareable URL).
- Theme: module vs custom composable → module (user decision).
- Git hooks: CI-only vs Husky → Husky + lint-staged (user decision).
- Rendering: `ssr:false` (SPA shell) rejected → `ssr:true` + `nuxt generate` so HTML is prerendered (needed for SEO/OG/no-JS content).
- Routes: separate /about /stack /experience /contact pages rejected → sections of home only, matching design boards.
- Hosting-specific config vs env-driven → env-driven.

## 7. Implementation steps
Phase 0 — Bootstrap
1. `git init`; `.gitignore` (node_modules, .nuxt, .output, dist, .idea, .env, playwright-report).
2. `pnpm dlx nuxi init` Nuxt 4 into repo root (keep design.html → `docs/design/design.html`); package name `makuchpatryk`; `packageManager`, `engines.node`.
3. Add modules; `nuxt.config.ts` (ssr true, prerender, i18n, colorMode, fonts, image, site url/base env; preset chosen via `NITRO_PRESET`, not hardcoded).
4. ESLint (`@nuxt/eslint`), vue-tsc script (*updated:* TypeScript pinned to 5.9 — vue-tsc 3.3 cannot drive TS 7; needs a root `tsconfig.json` with project references), Husky + lint-staged pre-commit (eslint --fix + vue-tsc), Prettier optional.
5. CI skeleton `ci.yml` (triggers: `pull_request` + `workflow_call`): install → lint → typecheck → unit → generate.
Phase 1 — Design system
6. Extract tokens to `main.css` (dark+light), Tailwind theme mapping, fonts (Geist, Geist Mono).
7. Contrast tune (fix faint token), document in `docs/design/tokens.md`; unit test computing ratios for token pairs both themes.
8. UI primitives: TagChip, ExternalLink, SectionHeading (`[01] projekty` style), focus-visible ring, skip link.
Phase 2 — Shell
9. SiteHeader/Footer/MobileNav, ThemeToggle, LangSwitcher (`switchLocalePath`), cv.pdf link.
10. i18n config + en/pl skeleton for nav/footer; hreflang & `lang` attr.
Phase 3 — Home
11. Data files + types + placeholder content (7 projects, 3 featured; 2 experience; 4 stack groups).
12. Hero + TerminalBlock (static, cursor CSS anim + reduced-motion).
13. ProjectsSection (featured + cards + link to /projects), PipelineDiagram.
14. Experience timeline, Stack, About (photo w/ NuxtImg), Contact.
Phase 4 — Projects
15. `useProjectFilter` + TagFilter + `/projects` index.
16. `/projects/[slug]`: header meta, links, VideoPlayer, ProjectToc, sections 01–05, MetricGrid, Gallery, ProjectNav (prev/next among detail projects).
17. 404 (`error.vue`), not-found for slug w/o detail.
Phase 5 — SEO & perf
18. useSeoMeta helper, OG image template, sitemap, robots, schema-org.
19. Image/video optimization pass; ffmpeg script `scripts/encode-video.sh` (720p H.264 CRF 28, faststart).
Phase 6 — Quality
20. Vitest: filter, locale-key parity, detail-completeness, contrast ratios.
21. Playwright on built site (`serve .output/public`): smoke per route × locale, theme toggle persists, lang switch, filter, keyboard tab-through, axe both themes.
22. Lighthouse CI (`@lhci/cli`) with assertions ≥0.95.
23. `scripts/check-placeholders.mjs` (launch gate; warn in CI, fail on `release` tag).
Phase 7 — Deploy prep
24. `.github/workflows/deploy.yml` (GitHub Pages):
    ```yaml
    name: deploy
    on:
      push: { branches: [main] }
      workflow_dispatch:
    permissions: { contents: read, pages: write, id-token: write }
    concurrency: { group: pages, cancel-in-progress: true }
    jobs:
      ci:
        uses: ./.github/workflows/ci.yml
      build:
        needs: ci
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: pnpm/action-setup@v4
          - uses: actions/setup-node@v4
            with: { node-version-file: .nvmrc, cache: pnpm }
          - run: pnpm install --frozen-lockfile
          - run: pnpm generate
            env:
              NITRO_PRESET: github_pages
              NUXT_APP_BASE_URL: ${{ vars.BASE_URL || format('/{0}/', github.event.repository.name) }}
              NUXT_PUBLIC_SITE_URL: ${{ vars.SITE_URL }}   # origin only
          - run: node scripts/check-placeholders.mjs   # warn now; --strict on a `release*` tag
          - uses: actions/upload-pages-artifact@v3
            with: { path: .output/public }
      deploy:
        needs: build
        runs-on: ubuntu-latest
        environment: { name: github-pages, url: ${{ steps.d.outputs.page_url }} }
        steps:
          - id: d
            uses: actions/deploy-pages@v4
    ```
    One-time repo setup: Settings → Pages → Source = **GitHub Actions**; repo variables `SITE_URL` (origin, e.g. `https://user.github.io`) (+ `BASE_URL` only for custom domain = `/`). Add `.nvmrc`.
25. `docs/deploy.md`: GH Pages setup steps, custom-domain switch (`public/CNAME`, `BASE_URL=/`, `SITE_URL=https://domain`, DNS), and fallback notes for other hosts (Cloudflare Pages 25 MiB/file, Netlify, Vercel: drop the preset env, set same two vars).
26. E2E run once against non-root base (`NUXT_APP_BASE_URL=/makuchpatryk/`) to prove asset/video/cv links.
27. README.

## 8. Risks & mitigations
1. **Self-hosted video vs host limits** (GH Pages: ~1 GB site / 100 MB per file soft limits + repo bloat; CF Pages 25 MiB/file if we move). Mitigation: encode to ≤15 MiB each, `preload=none`, budget ≤120 MB total `public/videos`, CI size check; fallback = YouTube unlisted embed for oversized clips.
2. **Design contrast failures** (`#5C6470` 3.25:1; teal on light). Mitigation: token audit, lifted faint, dark accent in light theme, axe in CI both themes.
3. **Theme flash / hydration mismatch.** Mitigation: color-mode inline script, class on `<html>`, e2e test for no-flash.
4. **OG image generation in SSG build** (satori/resvg native deps in CI). Mitigation: pin versions, cache, fallback static OG per locale if generation fails.
5. **i18n drift & placeholders shipping.** Mitigation: key-parity test, detail-completeness test, placeholder launch gate.
6. **GH Pages subpath breaks asset URLs / missing `.nojekyll` drops `_nuxt/`.** Mitigation: `github_pages` preset, env base URL, raw `<video>`/PDF hrefs built from `app.baseURL`, e2e with non-root base (step 26), post-deploy smoke of live URL.

7. **Perf on slow hardware.** Mobile Lighthouse performance measured 75–88 on a slow dev box (benchmarkIndex 570); desktop 100. Mitigation: lazy hydration below the fold, inline payloads; CI Lighthouse job non-blocking until confirmed on a GitHub runner.

## 9. Test strategy
Unit (Vitest): `filterProjects`, locale parity, detail completeness, contrast calc, project ordering/featured selection, `localizedProject` fallback. E2E (Playwright, built site): route smoke ×2 locales; nav anchors; theme toggle & persistence (no flash); language switch keeps path; tag filter; video element present; 404; keyboard (skip link, tab order, focus visible); axe both themes. Perf/a11y: LHCI ≥95 x4. Manual: real-device mobile, screen reader pass on home.

## 10. Success checklist
- [~] Criteria in §3 met with evidence — axe (0 violations, both themes) and unit/e2e results done; Lighthouse desktop 100, mobile performance 75–88 locally, to be confirmed on CI (see §13)
- [~] CI green (lint, types, unit, e2e, lhci) — lint/types/unit/e2e green locally at root and non-root base; workflows written but not yet run on GitHub; lhci job is non-blocking
- [~] Both themes reviewed vs design.html boards — desktop home, detail (light) and mobile home compared visually; user review of light theme pending
- [ ] Content checklist complete; placeholder gate passes (`docs/content-checklist.md`; 326 placeholders remain by design)
- [ ] cv.pdf, photo, OG, favicon in place — OG template and favicon done; `cv.pdf` is a placeholder PDF, photo not provided
- [ ] Pages source = GitHub Actions; `SITE_URL` var set; deploy workflow green; live URL, `/pl/`, deep link to a detail page, `404.html`, sitemap and cv.pdf all load

## 11. Estimates
Phase 0–1: ~1 day (+0.25 for hooks). Phase 2–3: ~2 days. Phase 4: ~1.5 days. Phase 5: ~1 day. Phase 6: ~1.5 days. Phase 7: ~0.75 day. Total ≈ 7.5 days + buffer; content writing separate.

## 12. Open questions
- Language-switcher preference persistence: not planned (no auto-redirect makes it pointless). Revisit only if redirect is added.
- Custom domain (none yet; needed only for `SITE_URL`/DNS switch). Repo name / GitHub user for the default Pages URL.
- Real project list/tags/categories → content phase.
- Light-theme review by user after derivation (still open).
- Real demo videos (none yet; no ffmpeg on the dev machine, so `encode-video.sh` is untested) and captions for videos with speech.

## 13. Implementation status and deviations

All 27 steps of §7 are done except where noted. Verified: lint, `vue-tsc`, 116 unit tests, 86 Playwright tests (root base and `/makuchpatryk/` base with the `github_pages` preset), axe WCAG 2.1 AA with zero violations in both themes and both locales.

### Deviations from the plan
| Plan | As built | Why |
|---|---|---|
| `SITE_URL=https://user.github.io/<repo>` | origin only; base comes from `NUXT_APP_BASE_URL` | modules append the base, path doubled URLs |
| `nitro.preset: 'static'` in config | preset only via `NITRO_PRESET` env | `generate` implies static; og-image warned on the unknown preset |
| `tailwind.config.ts` | Tailwind v4 CSS-first (`@theme inline` in `main.css`) | v4 idiom |
| `faint` ≈ `#7A8391` | `#7F8896` dark, `#636D7B` light | measured to pass 4.5:1 on all three surfaces |
| `i18n/locales/i18n.config.ts` | `i18n/i18n.config.ts` | location the module expects |
| TypeScript latest | pinned 5.9 | vue-tsc 3.3 incompatible with TS 7 |
| automatic sitemap i18n | explicit per-locale sitemaps | auto split wrong under a base path |
| `robots.txt` always | only when base is `/` | robots module rejects it under a subpath |
| — | `experimental.payloadExtraction: false`, `hydrate-on-visible` on home sections | fewer requests, lower TBT |
| — | mobile nav is `<details>/<summary>` | works without JS |
| — | placeholders are bracketed and numbered per project; years like `'[2024]'` counted by the gate | unique titles/OG while content is fake; gate catches data-level placeholders |
| gate: fail on `release` tag | `release*` tag triggers deploy and `--strict` | matches the plan, needs the tag pattern allowed on the `github-pages` environment |
| CI: lhci assertions | separate job with `continue-on-error` | mobile perf unconfirmed on CI hardware |
| — | `scripts/serve.mjs` (GitHub-Pages-like server) instead of `serve` | directory index, 404.html, gzip, base path |
| — | pnpm `allowBuilds` in `pnpm-workspace.yaml` | pnpm 11 blocks dependency build scripts |

### Tried and reverted
- `features.inlineStyles: () => true`: inlined `@font-face` URLs lost the base path (fonts 404 under `/repo/`); no measurable FCP gain. Removed.

### Left to do
- Real content and assets (`docs/content-checklist.md`): identity, copy, project list, photo, real `cv.pdf`, demo videos (+ captions if there is speech).
- GitHub setup (Pages source, `SITE_URL`), first workflow run, post-deploy smoke.
- Confirm mobile Lighthouse ≥95 on a CI runner, then drop `continue-on-error`.
- User review of the light theme.
