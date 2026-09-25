# Content checklist (launch gate)

The site is built with bracketed placeholders (`[Full Name]`, `[Project 1 name]` …). `node scripts/check-placeholders.mjs` lists every one that is still in the built HTML; the gate must report **none** before a `release*` tag.

Replace copy in `i18n/locales/en.json` **and** `pl.json` (a test enforces identical keys); replace structured data in `app/data/*`.

## Identity — `app/data/site.ts`
- [ ] `name`, `handle` (shown as `~/handle`), `city`
- [ ] `email`
- [ ] GitHub and LinkedIn URLs
- [ ] `photo`: put the file in `public/images/`, set e.g. `'images/photo.jpg'` (rendered with `NuxtImg`, 440×440)
- [ ] Replace `public/cv.pdf` (placeholder PDF), single EN file for both locales
- [ ] Favicon (`public/favicon.svg`) and brand line in `app/components/OgImage/PortfolioCard.satori.vue`

## Copy — both locales
- [ ] `meta.*` page titles and descriptions (home, projects)
- [ ] `hero.tagline`
- [ ] `about.*` (lead, body, currently / looking for / outside code)
- [ ] `experience.<id>.*` and the years in `app/data/experience.ts` (currently `'[2024]'`…)
- [ ] `stack` groups/items if they differ

## Projects — `app/data/projects.ts` + `projects.<slug>.*`
- [ ] Decide the real list (7+), tags, categories, `featured` (exactly 3), `order`, `meta.year`/`type`
- [ ] Links: `links.demo` / `links.code`
- [ ] Card copy for every project: `title`, `summary`, `role`, `effect`
- [ ] For each `detail: true` project (unit test enforces the keys): `duration`, `problem.*`, `solution.*`, `architecture.body`, `lessons[]`, `metrics.<key>.{value,label}`
- [ ] `pipeline` steps (labels live in `pipeline.steps.*`; add new keys in both locales)
- [ ] Media: `media.cover`, `media.gallery[]` (+ optional captions `projects.<slug>.gallery.<n>`), `media.poster`
- [ ] Video: encode with `scripts/encode-video.sh in.mov public/videos/<slug>.mp4` (720p, CRF 28, faststart), set `media.video: 'videos/<slug>.mp4'`. Budget: ≤15 MiB per file, ≤120 MiB total (`pnpm check:video-size`). Add a captions track if the video has speech.

## Before tagging `release`
- [ ] `node scripts/check-placeholders.mjs --strict` passes
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`
- [ ] Both themes and both locales reviewed against `docs/design/design.html`
- [ ] Real-device mobile check and a screen-reader pass on the home page
- [ ] Lighthouse ≥95 (Performance, Accessibility, Best Practices, SEO) on the live URL
- [ ] `SITE_URL` variable is set; live URL, `/pl/`, a detail deep link, `404.html`, sitemap and `cv.pdf` load
