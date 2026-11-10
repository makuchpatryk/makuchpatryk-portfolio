# robak-remonty Demo Video — Implementation Plan

## Summary
The `robak-remonty` project page (added by `specs/add-robak-remonty-project.md`) shows a placeholder video slot. This plan records an English-narrated video of about 2 minutes with the screencaster MCP from this repo. It shows the public site and the admin flow of the robak-remonty app running **locally** with seeded sample content and generated placeholder photos. The video ships with a separate WebVTT captions track, so the portfolio gains a small, data-driven `captions` media field.

## Success Criteria
- `public/videos/robak-remonty.mp4`:
  - 110–130 s long;
  - 720p H.264, faststart;
  - ≤ 15 MiB (`pnpm check:video-size` passes);
  - no embedded subtitle stream (`ffprobe` shows video + audio only).
- `public/videos/robak-remonty.en.vtt`:
  - starts with `WEBVTT`;
  - has one cue per narrated step;
  - each cue's text equals the script's narration.
- `/projects/robak-remonty` (EN and PL):
  - renders `<video preload="none">` with `<track kind="captions" srclang="en">`;
  - the track's label comes from i18n;
  - shows the poster `images/robak-remonty/poster.webp`.
- No secret in git or in public output. Grepping tracked files, `public/` and `.output/public` for the local `ADMIN_PASSWORD`, `JWT_SECRET` and the session JWT finds nothing.
- `pnpm lint`, `typecheck`, `test`, `check:locales`, `test:e2e` and `lhci` stay green. LHCI must stay at 100 on the sampled pages.

## Scope & Constraints
**In scope:**
- `demos/` folder in this repo:
  - video script template;
  - seed + build script;
  - `.gitignore` rules.
- Recording via the screencaster MCP `render_video`.
- Captions extraction, encode and poster.
- `ProjectMedia.captions` + `<track>` in `VideoPlayer`.
- i18n label, tests and docs.

**Out of scope:**
- Any change to the screencaster code (no `upload` step; photos are pre-seeded).
- Any change to the robak-remonty code.
- Production data or deploys.
- Real or stock photos.
- Burned-in subtitles.
- Per-locale videos or captions. There is one English track, shown on both locales.
- Deleting the old `robak-remonty/demos/robak-przeglad-panelu.yaml`. Note: it holds a local session cookie; the cookie is local-only.

**Hard constraints:**
- **Local only.** Seeding and recording hit `localhost:3000` / `172.17.0.1:3000` only. The seed script refuses any other origin. No `wrangler --remote`.
- **Secrets.** Admin credentials are read from `~/projects/robak-remonty/infra/.env` in memory. They are never printed, never written and never typed on camera.
  - The session cookie exists only in the gitignored `demos/.build/` copy of the script and in `.screencaster/jobs.db` (already gitignored).
  - Both are deleted after the render.
- **Login rate limit.** 5 failures per 15 min locks the IP. The seed script makes exactly one login attempt and fails fast on 401.
- **Honest content.** Every placeholder tile is labelled "Sample photo". The narration says the content is sample data.

**Trade-offs:**
- The session cookie is injected and the login is not typed. The server sets a `Secure` cookie on any non-localhost http (`packages/server/src/http/cookies.ts:8-17`), so a typed login over Docker's `172.17.0.1` cannot stick. Injection also avoids changing the global MCP config to `--network host`.
- Photos are seeded through the API, not uploaded on camera. The video creates an empty album live, then opens a seeded album to show photos. Screencaster stays unchanged.
- The scripts live in this repo, not in robak-remonty. The MCP mounts the session's working directory as `/work`, so "MCP here" requires the script and output inside this repo. The cost is robak-specific tooling in the portfolio repo, kept isolated in `demos/`.

## Architecture & Design

### High-Level Flow
```
robak-remonty (local)                     makuchpatryk-new
─────────────────────                     ────────────────
pnpm dev (0.0.0.0:3000)  <── demos/robak-seed.mjs ──┐  login once (API), create albums,
local D1 + R2                                       │  upload ffmpeg-generated WebP tiles
                                                    └─> demos/.build/robak-remonty.yaml
                                                        (template + storageState cookie, gitignored)
screencaster MCP (docker, /work = this repo)
  render_video(script=demos/.build/robak-remonty.yaml, subtitles: true)
      └─> demos/output/robak-remonty.en.<ts>.mp4  (1080p, soft mov_text track)
ffmpeg -map 0:s:0 -c:s webvtt ──> public/videos/robak-remonty.en.vtt
scripts/encode-video.sh (-sn)  ──> public/videos/robak-remonty.mp4 (720p)
ffmpeg -ss <t> -frames:v 1     ──> public/images/robak-remonty/poster.webp
app/data/projects.ts media { video, poster, captions } ──> VideoPlayer <track>
```

### Key Changes
- **`.gitignore`**: add `demos/.build/` and `demos/output/`. `.screencaster` is already ignored.
- **`demos/robak-remonty.template.yaml`** (new, committed, no secrets). Screencaster video script:
  - `name: robak-remonty`, `languages: [en]`, `subtitles: true`;
  - `meta.title` / `description` / `audience: marketing`;
  - no intro/outro cards (default off);
  - `goto` URLs absolute on `http://172.17.0.1:3000`;
  - the placeholder `storageState: __STORAGE_STATE__` is replaced by the build step.
- **Shot list** (about 20 narrated steps, about 120 s; selectors confirmed with MCP `explore_page` before writing):
  1. `/` home hero (PL). Narration: what the company is and that this is a local copy with sample content.
  2. Language switch: PL to EN (`/en`); mention PL/DE/EN and the per-field fallback to Polish.
  3. Theme toggle to dark and back.
  4. Scroll to the services section: six services, each with its own page.
  5. Scroll to the albums section and open a seeded album.
  6. Photo viewer: next photo, thumbnail, full screen, close.
  7. Reviews section.
  8. `/panel-admin/albumy` (already logged in via cookie): the albums list.
  9. "Nowy album": `fill` the title and description, save; the empty album appears.
  10. Open a seeded album in the editor: photos, cover, publish toggle.
  11. Content/settings screen: language switches and contact data.
  12. Back to the public `/en` album list: the edits are live without a redeploy.
- **`demos/robak-seed.mjs`** (new, Node 22, no deps; run with `node demos/robak-seed.mjs`):
  1. Asserts the target origin is `http://localhost:3000`.
  2. Reads `ADMIN_USER`/`ADMIN_PASSWORD` from the robak `infra/.env` via a path argument, defaulting to `../robak-remonty/infra/.env`.
  3. Makes one `POST /api/admin/login` with an `Origin` header and takes the `session` cookie.
  4. Is idempotent: deletes albums whose title starts with `Sample:`, then creates 3 published albums (2 featured), 4 photos each.
  5. Generates photos with `ffmpeg -f lavfi color=… ,drawtext=text='Sample photo N'` to `.webp` in `demos/.build/photos/` (drawtext is available locally).
  6. Uploads each photo to `/api/admin/albums/:id/images`. The exact payload shape is taken from `robak-remonty/tests/e2e/helpers/admin.ts` and `packages/server/src/http/admin/uploads.ts`.
  7. Writes `demos/.build/robak-remonty.yaml` from the template with an inline `storageState`. The cookie is `session` with domain `172.17.0.1`, path `/`, `httpOnly: true`, `sameSite: Lax` and `secure: false`.
- **`scripts/encode-video.sh`**: add `-sn` so the soft `mov_text` track is not carried into the site MP4. Captions ship as the sidecar `.vtt` only.
- **`app/types/content.ts`**: `ProjectMedia.captions?: string`, a path under `public/` to an English WebVTT file. The language is hard-coded `en` (YAGNI: one caption language).
- **`app/components/project/VideoPlayer.vue`**:
  - new prop `captions?: string`;
  - `captionsSrc` computed via `usePublicUrl`, like `videoSrc`;
  - `<track v-if="captionsSrc" kind="captions" srclang="en" :src="captionsSrc" :label="t('project.captionsLabel')">` after `<source>`, not `default`.
- **`app/pages/projects/[slug].vue:98`**: pass `:captions="p.media?.captions"`.
- **`app/data/projects.ts`** (robak entry): `media.video: 'videos/robak-remonty.mp4'`, `poster: 'images/robak-remonty/poster.webp'`, `captions: 'videos/robak-remonty.en.vtt'`.
- **`i18n/locales/en.json` / `pl.json`**: `project.captionsLabel`, "English" / "angielski". This is the label in the browser's caption menu.
- **Dependencies**: none new. ffmpeg (system) is already used by `encode-video.sh`.

### Fit with Project Docs
- **ARCHITECTURE.md §5**: the media path is data in `projects.ts` and the label is copy in i18n, so no project-specific code is added.
- **ARCHITECTURE.md §4**: the `.vtt` URL goes through `usePublicUrl()`, so it is base-URL safe, which the non-root e2e run proves.
- **CODE_QUALITY**:
  - KISS/YAGNI: one optional string field and no tracks array.
  - DRY: caption timings come from screencaster's own track, not hand-timed.
  - Separation of concerns: `demos/` is tooling, never imported by `app/`, and lint-checked like `scripts/`.
- **Docs to update**:
  - ARCHITECTURE §3 directory map: add `demos/`.
  - ARCHITECTURE §5 `media?` shape: add `captions?`.
  - ARCHITECTURE §8 Media bullet: `<track>` when `media.captions` is set.
  - ARCHITECTURE §14 known limitations: "demo videos are placeholders" no longer holds for every project, so reword it.
  - `docs/content-checklist.md` video line: the captions convention `videos/<slug>.en.vtt`.

### Alternative Approaches Considered
- **Captions: a sidecar VTT extracted from screencaster's `mov_text` (chosen).** The alternatives were a screencaster VTT feature (a change to the tool, and decision 87 there rejects sidecars), hand-timed VTT (drifts, not reproducible) and burn-in (you chose a separate track).
- **Login: cookie injection (chosen).** Typing on camera needs `--network host` in the global MCP config plus throwaway credentials.
- **Seeding: through the admin API (chosen).** It exercises the real WebP/storage/position rules. SQL plus `wrangler r2 object put` would bypass them and depend on the persist path.
- **Location: this repo's `demos/` (chosen).** It is the only place the MCP in this session can see. robak-remonty's `demos/` is gitignored and would need a robak session.

## Implementation Steps
0. **Unblock the MCP (you run this).** `.screencaster/` here is root-owned from an older container run, so `screencaster-mcp` exits with `chmod /work/.screencaster: operation not permitted`.
   1. Run `! sudo chown -R 1000:1000 .screencaster`.
   2. Run `/mcp` to reconnect `screencaster`.
   3. Check `get_options` lists the `en` voice (`en_US-ryan-high`).
1. **Recommended first:** commit the pending, uncommitted robak entry work (`content: add robak-remonty project`) so this change is its own diff.
2. `.gitignore`: add `demos/.build/` and `demos/output/`.
3. Start robak locally on all interfaces so Docker can reach it:
   1. In `~/projects/robak-remonty`, `pnpm db:migrate:local`.
   2. Run `pnpm --filter @robak/web dev --host 0.0.0.0`.
   3. Check that `curl http://172.17.0.1:3000/` returns 200. If Nuxt devtools shows on screen, set `devtools: false` via env for the run, without editing robak.
4. Write `demos/robak-seed.mjs`. Run it twice and confirm 3 `Sample:` albums with 4 photos each, not 6/8. Confirm `/img/...` URLs return 200.
5. Use MCP `explore_page` on `/`, `/en`, an album page and `/panel-admin/albumy`, with the built `storageState`, to collect exact role/name selectors.
6. Write `demos/robak-remonty.template.yaml` from the shot list. Rerun the seed script to produce `demos/.build/robak-remonty.yaml`.
7. MCP `render_video` with `script: demos/.build/robak-remonty.yaml` and `subtitles: true`, then poll `get_render_status`. Check the duration (110–130 s) and watch it for timing, overlays and any secret on screen. Iterate on wait/narration if needed.
8. Captions: `ffmpeg -i demos/output/robak-remonty.en.<ts>.mp4 -map 0:s:0 -c:s webvtt public/videos/robak-remonty.en.vtt`. Review the cue text against the narration.
9. Add `-sn` to `scripts/encode-video.sh`. Run `scripts/encode-video.sh demos/output/robak-remonty.en.<ts>.mp4 public/videos/robak-remonty.mp4`, then `pnpm check:video-size`.
10. Poster: `ffmpeg -ss <hero frame> -i public/videos/robak-remonty.mp4 -frames:v 1 -q:v 80 public/images/robak-remonty/poster.webp`, about 30–80 KB.
11. Clean up: `rm -rf demos/.build`, and drop `.screencaster/jobs.db*` because it stores the submitted script with the cookie.
12. Portfolio code: `content.ts` captions field, `VideoPlayer.vue` track, `[slug].vue` prop, `projects.ts` media, i18n `project.captionsLabel` (EN + PL).
13. Tests (see Test Strategy).
14. Docs: ARCHITECTURE §3/§5/§8/§14 and content-checklist.
15. Checks: lint, typecheck, test, check:locales, check:video-size, generate, test:e2e, lhci.
16. Secret grep: run `git grep` plus a grep of `public/` and `.output/public` for the local `ADMIN_PASSWORD`, `JWT_SECRET` and the `eyJ` JWT prefix. Expect no hits.

Commit (≤ 50 chars): `feat: add robak-remonty demo video`

### Risks & Mitigations
- **Docker can't reach the dev server** (Nuxt binds localhost).
  - Mitigation: `--host 0.0.0.0` and a `curl 172.17.0.1:3000` precheck.
  - Fallback: `pnpm build && pnpm preview` (wrangler, port 8787) with `--ip 0.0.0.0` and `SITE_URL` set accordingly.
- **The injected cookie is rejected** (for example if the JWT `sub` ≠ `ADMIN_USER`, or it has expired).
  - Mitigation: the seed script mints the cookie by a real login right before the render.
  - Mitigation: `explore_page` on `/panel-admin/albumy` must show the panel, not the login form, before rendering.
- **The login rate limit locks you out.**
  - Mitigation: one attempt per run, fail fast on 401, never retry in a loop.
- **The session cookie leaks.**
  - Mitigation: it lives only in gitignored `demos/.build/` and `.screencaster/`, both deleted in step 11.
  - Mitigation: the step 16 grep is a gate before commit.
- **Narration lags the action** (a known screencaster issue, `specs/narration-action-lag.md` there).
  - Mitigation: watch the render and add `wait` steps.
  - Captions are timed on the narration offsets, so they match the audio regardless.
- **The mov_text track survives encoding**, so Safari could show double captions.
  - Mitigation: `-sn` in `encode-video.sh`, plus an `ffprobe` check that no subtitle stream remains.
- **A 2-minute video exceeds the budget.**
  - At CRF 28/720p, a mostly static UI is expected well under 15 MiB; the old 2-minute 1080p demo was 7.4 MB.
  - Fallback: CRF 30.
- **The Lighthouse score drops.**
  - Mitigation: `preload="none"` is unchanged, the track is not `default`, and the poster is small.
  - Run lhci on `/projects/robak-remonty` locally once (not in the CI URL list).

## Test Strategy
- **Unit (`tests/unit/projects.test.ts`)**: each `media` path of every project (`cover`, `gallery[]`, `poster`, `video`, `captions`) exists under `public/`. Each `captions` file starts with `WEBVTT` and has at least one cue. This is cheap and guards against typos and missing files.
- **E2E (`tests/e2e/interaction.spec.ts`, `media` block)**: a new test on `projects/robak-remonty` checks:
  - `video` has `preload="none"`;
  - `video track[kind="captions"][srclang="en"]` exists;
  - a request for its `src` returns 200.

  The non-root base e2e run covers the base-URL case.
- **Locales**: `check:locales` and `locales.test.ts` cover the new `project.captionsLabel`.
- **Manual**:
  - Play the video in Chrome and Firefox and turn on captions from the menu. The text should match the speech.
  - Check both themes and phone width.
  - Watch the full video once for any secret, real customer data or a devtools overlay.
- **Perf**: lhci stays at 100. The video is not fetched before play (`preload="none"`).

## Success Checklist
- [ ] MCP unblocked (`.screencaster` chown) and `render_video` used for the recording
- [ ] Seed script idempotent, local-only, one login attempt
- [ ] MP4 110–130 s, 720p, faststart, ≤ 15 MiB, no subtitle stream
- [ ] VTT valid, cues match narration
- [ ] Poster ≤ ~80 KB
- [ ] `captions` field + `<track>` + i18n label; both locales render it
- [ ] Unit + e2e tests added and passing; lint/typecheck/check:locales/lhci green
- [ ] Docs updated (ARCHITECTURE §3/§5/§8/§14, content-checklist)
- [ ] `demos/.build/` and `.screencaster/jobs.db` removed; secret grep clean

## Timeline & Estimates
- Seed script and selectors: ~2 h
- Script authoring and render iterations: ~3 h
- Captions, encode, poster: ~0.5 h
- Portfolio code, tests, docs: ~1.5 h
- Checks and manual review: ~1 h
- **Total**: ~8 h (about one working day), plus a buffer for render iterations

## Open Questions
None blocking. Step 0 (`sudo chown`) needs you. The upload payload shape in step 4 is read from robak's e2e helper during implementation, not guessed.
