# Add robak-remonty Project — Implementation Plan

## Summary
Add `robak-remonty` (K&R Robak Remonty — multilingual PL/DE/EN renovation-company showcase site + Polish admin panel, Nuxt 4 + Hono on one Cloudflare Worker, D1 + R2) as a 10th project in `app/data/projects.ts`, following the exact pattern `specs/real-projects-from-github.md` established. Not featured. Media (cover + 2 gallery shots) captured from the live site with the `screencaster` CLI's `type: screenshots` mode.

## Success Criteria
- `projects.ts` has an 11th-order entry `robak-remonty`, `detail: true`, `featured: false`, category `full-stack`.
- EN + PL `projects.robak-remonty.*` cover all `DETAIL_KEYS`; `node scripts/check-locales.mjs` passes (key parity).
- 3 PNG screenshots captured via `screencaster render` from `https://remontyrobak.com`, converted to `.webp`, placed in `public/images/robak-remonty/`.
- `pnpm typecheck && pnpm lint && pnpm test` green; `featuredProjects` test still returns exactly 3 (unchanged).
- No invented facts — copy sourced only from `robak-remonty`'s own `README.md` / `docs/PRD.md` and the live site.

## Scope & Constraints
- **In scope:** one data entry, `Tag` union additions, EN+PL locale blocks, 3 screenshots, `content-checklist.md` tick.
- **Out of scope:** metrics (none of the 9 existing entries use them — skip, consistent with current data), featured status, admin-panel authenticated screens (login screen only, no credentials shown/typed).
- **Hard constraint:** `ADMIN_USER`/`ADMIN_PASSWORD` are secrets — screenshot only the unauthenticated `/panel-admin` login form, never submit credentials.
- **Trade-off:** `meta.type: 'commercial'` (real client, K&R Robak Remonty) — the only commercial entry among the 10; everything else is `'personal'`.

## Architecture & Design

### Key Changes
**`app/types/content.ts`** — extend `Tag` union: add `hono`, `cloudflare`, `i18n`.

**`app/data/projects.ts`** — append:
```ts
{
  slug: 'robak-remonty',
  featured: false,
  order: 11,
  category: 'full-stack',
  tags: ['typescript', 'nuxt', 'hono', 'cloudflare', 'i18n'],
  stack: ['Nuxt 4', 'Hono', 'Cloudflare Workers', 'D1', 'R2', 'TypeScript'],
  links: { demo: 'https://remontyrobak.com', code: 'https://github.com/makuchpatryk/robak-remonty' },
  detail: true,
  media: {
    cover: 'images/robak-remonty/cover.webp',
    gallery: ['images/robak-remonty/services.webp', 'images/robak-remonty/admin.webp']
  },
  meta: { year: 2026, type: 'commercial' }
}
```

**Media capture** — `screencaster render` (binary already at `~/screencaster`, native, no docker/MCP needed):
1. Write `demos/robak-remonty-shots.yaml` (new file, screencaster repo's `demos/` convention) — `type: screenshots`:
   - `goto: https://remontyrobak.com/` → `screenshot` (viewport, 1920×1080) → `cover.png`
   - `scroll` to services section → `screenshot` → `services.png`
   - `goto: https://remontyrobak.com/panel-admin` → `wait` for login form → `screenshot` → `admin.png`
2. `~/screencaster render demos/robak-remonty-shots.yaml` → PNGs land in `<outputDir>/robak-remonty-shots/screenshots/`.
3. Convert each to `.webp` (`ffmpeg -i NN.png -q:v 80 name.webp`, matching existing file sizes ~30-80KB) into `public/images/robak-remonty/`.

**`i18n/locales/en.json` + `pl.json`** — add `projects.robak-remonty` block with all `DETAIL_KEYS` (`title`, `summary`, `role`, `effect`, `duration`, `problem.heading/body`, `solution.heading/body`, `architecture.body`, `lessons[]`), sourced from `robak-remonty/README.md` and `docs/PRD.md` §1-2 (business problem, value prop) and `docs/ARCHITECTURE.md` (tech design). `duration` = Oct–Nov 2026 (first commit 2026-10-16, still active). `role`: "solo build: Nuxt SSR + Hono API, D1/R2 data layer, admin panel, i18n, deploy pipeline".

**`docs/content-checklist.md`** — tick the new project's row if the checklist tracks per-project status (check format before editing).

### Fit with Project Docs
- **ARCHITECTURE.md §5** (data-driven projects): followed exactly — one data entry + i18n keys, no component touched.
- **CODE_QUALITY.md**: DRY — media/screenshot capture reuses `screencaster`'s existing `type: screenshots` CLI feature (already implemented, per `screencaster/specs/screenshots.md` checkpoints CP1-CP4 done) rather than a one-off script.

### Alternative Approaches Considered
- **Screenshot the local dev server** (`pnpm dev` + local D1) vs. **the live site** (chosen): live site is already deployed, publicly reachable (verified 200 OK), and gives real production-rendered pixels (fonts, images) with zero local setup risk (wrangler state, migrations). Local dev only needed if the live admin panel were unreachable.
- **Featured vs. list-only** (chosen list-only, per user's explicit answer).

## Implementation Steps
1. Extend `Tag` union (`hono`, `cloudflare`, `i18n`) in `app/types/content.ts`.
2. Write `demos/robak-remonty-shots.yaml` in the `screencaster` repo's `demos/` folder; run `~/screencaster render` against it.
3. Convert the 3 PNGs to `.webp` via `ffmpeg`; copy into `public/images/robak-remonty/` as `cover.webp`, `services.webp`, `admin.webp`.
4. Append the `robak-remonty` entry to `app/data/projects.ts`.
5. Add `projects.robak-remonty` block to `i18n/locales/en.json`.
6. Add the mirrored PL block to `i18n/locales/pl.json` (natural Polish, not word-for-word).
7. `pnpm run lint`, `node scripts/check-locales.mjs`, `pnpm typecheck`, `pnpm test`.
8. `pnpm generate` — confirm `/projects/robak-remonty` (+ `/pl`, `/de` if site has those locale prefixes) prerenders.
9. Visual check: open the generated project card + detail page locally.

Commit (≤50 chars): `content: add robak-remonty project`

### Risks & Mitigations
- **Risk:** live site screenshot captures transient content (e.g. a different review, future "Realizacje" photos) that goes stale.
  - Mitigation: acceptable — same risk existing covers/galleries already carry; screenshots aren't pinned to a commit.
- **Risk:** `/panel-admin` screenshot accidentally shows a logged-in state if a session cookie is cached in the capture browser.
  - Mitigation: screencaster launches a fresh browser context per run (no `StorageState` passed) — always logged-out.
- **Risk:** copy overstates scope (e.g. implying live customer photo galleries that don't exist yet — "Realizacje" is empty on the current live site).
  - Mitigation: copy describes the *platform* (showcase site + admin panel for managing albums/services/reviews), not specific gallery content.

## Test Strategy
- **Unit:** existing `tests/unit/projects.test.ts` (unique slugs/orders, featured count stays 3) and `tests/unit/locales.test.ts` (EN/PL parity, DETAIL_KEYS) — run as-is, no new tests needed (data-driven).
- **Manual:** `/projects` page shows the new card; `/projects/robak-remonty` detail page renders cover + gallery + both links resolve (200).

## Success Checklist
- [ ] `robak-remonty` entry added, order 11, not featured, `detail: true`
- [ ] 3 webp images in `public/images/robak-remonty/`
- [ ] EN + PL copy complete, `check-locales.mjs` passes
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green
- [ ] Demo + code links both resolve

## Open Questions
None — demo URL confirmed live (200, `remontyrobak.com`), repo confirmed local at `~/projects/robak-remonty`, admin route confirmed (`/panel-admin`).
