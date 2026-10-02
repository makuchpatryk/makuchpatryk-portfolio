# Content checklist (launch gate)

The site is built with bracketed placeholders (`[Full Name]`, `[Project 1 name]` …). `node scripts/check-placeholders.mjs` lists every one that is still in the built HTML; the gate must report **none** before a `release*` tag.

Replace copy in `i18n/locales/en.json` **and** `pl.json` (a test enforces identical keys); replace structured data in `app/data/*`.

## Identity — `app/data/site.ts`
- [x] `name`, `handle` (shown as `~/handle`), `city`
- [x] `email`
- [x] GitHub and LinkedIn URLs
- [x] `photo`: put the file in `public/images/`, set e.g. `'images/photo.jpg'` (rendered with `NuxtImg`, 440×440)
- [ ] Replace `public/cv.pdf` (placeholder PDF), single EN file for both locales
- [ ] Favicon (`public/favicon.svg`) and brand line in `app/components/OgImage/PortfolioCard.satori.vue`

## Copy — both locales
- [ ] `meta.*` page titles and descriptions (home, projects)
- [x] `hero.tagline`
- [x] `about.*` (lead, body, currently / looking for / outside code) — `outsideValue` left bracketed on purpose, no CV source for hobbies
- [x] `experience.<id>.*` and the years in `app/data/experience.ts` — 3 roles (`codest`/`coldrun`/`ergonode`); Scooploop/Tekpaw (2017–2022) still open
- [x] `stack` groups/items — backend/cloud/frontend expanded from the CV; `ai` group untouched

## Projects — `app/data/projects.ts` + `projects.<slug>.*`
- [x] Decide the real list (7+), tags, categories, `featured` (exactly 3), `order`, `meta.year`/`type` — 8 projects from GitHub, `ai-workflow` category kept but unused
- [x] Links: `links.demo` / `links.code` — `blind-clue.xyz` fails its TLS handshake, demo link left out until it is fixed
- [x] Card copy for every project: `title`, `summary`, `role`, `effect`
- [x] For each `detail: true` project (unit test enforces the keys): `duration`, `problem.*`, `solution.*`, `architecture.body`, `lessons[]` — drafted from READMEs, `lessons` and PL wording await owner review
- [ ] `metrics.<key>.value` for every project (24 values, still `[value]` / `[wartość]`)
- [x] `pipeline` steps (labels live in `pipeline.steps.*`; add new keys in both locales)
- [ ] Media: `media.cover`, `media.gallery[]` (+ optional captions `projects.<slug>.gallery.<n>`), `media.poster`
- [ ] Video: encode with `scripts/encode-video.sh in.mov public/videos/<slug>.mp4` (720p, CRF 28, faststart), set `media.video: 'videos/<slug>.mp4'`. Budget: ≤15 MiB per file, ≤120 MiB total (`pnpm check:video-size`). Add a captions track if the video has speech.

## Before tagging `release`
- [ ] `node scripts/check-placeholders.mjs --strict` passes
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`
- [ ] Both themes and both locales reviewed against `docs/design/design.html`
- [ ] Real-device mobile check and a screen-reader pass on the home page
- [ ] Lighthouse ≥95 (Performance, Accessibility, Best Practices, SEO) on the live URL
- [ ] `SITE_URL` variable is set; live URL, `/pl/`, a detail deep link, `404.html`, sitemap and `cv.pdf` load
