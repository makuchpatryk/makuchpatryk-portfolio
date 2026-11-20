# perplex-image Demo Video + Poster + Copy Fix — Implementation Plan

## Summary
The `perplex-image` project page (`app/data/projects.ts:56-75`) has a cover and five gallery shots but no video and no poster. This plan adds a silent 45–60 s desktop demo recorded from the live Vercel demo with the screencaster MCP, plus a `poster.webp` cut from the encoded MP4. The same pass corrects EN/PL copy that describes a Pexels image source, a "20×30" level and a Pinia role the code does not have. screencaster has no drag or modifier-click, so the video shows the menu, picker, Play, single-tile selection, Preview and Pause, but no tile moves (user's choice).

## Success Criteria
- `public/videos/perplex-image.mp4`: 45–60 s, 720p H.264, yuv420p, faststart, no subtitle stream, ≤ 15 MiB (`pnpm check:video-size`). No `.vtt`, no `<track>`.
- The video shows, in order: menu → "Choose manually" picker → one picked image → Play → game board → one tile click-selected (blue ring) → Preview open/close → PAUSE → Continue. No win screen, no tile swap.
- `public/images/perplex-image/poster.webp`: 1280×720, ≤ ~80 KB, a frame of the MP4. `cover.webp` and `play/picker/grid/preview/pause.webp` byte-identical (`git diff --stat` shows no change on them).
- `app/data/projects.ts` `perplex-image` media adds `video` and `poster`; `cover` and `gallery` unchanged.
- EN and PL `projects.perplex-image`: no "Pexels"; levels described as 9, 15 and 18 columns (no "20×30"); Pinia sentence says it holds the image list and chosen picture. Same meaning in both locales.
- `/projects/perplex-image` (EN and PL) renders `<video preload="none">` with no `<track>`.
- `pnpm lint`, `typecheck`, `test`, `check:locales`, `check:video-size`, `test:e2e` green.

## Scope & Constraints
**In scope**
- `demos/perplex-image.template.yaml` (gitignored) and a screencaster render against `https://perplex-image.vercel.app`.
- Encode, poster frame, `projects.ts` media, EN/PL copy fix (Pexels, levels, Pinia), e2e change, one docs line.

**Out of scope**
- Tile drags, group drag, win screen (screencaster cannot do them). Extending screencaster is a separate task in another repo.
- Any change to `~/projects/PerplexImage` (no patch, no commit).
- Narration, captions, intro/outro, mobile viewport, new gallery shots, cover change.
- Other copy errors found but not chosen for this task: touch claims ("palcem", "every screen"), "shows progress", "API proxy" role wording, "never runs out of images", `gallery.4` "Pause hides the tiles". They stay as is.

**Hard constraints**
- Source is the live demo. `/api/get-images` can 504 on cold start, then returns 18 Supabase images. Warm it up before each render.
- screencaster viewport is fixed 1920×1080 (`browser.go:25-28`). No `viewport` key.
- `demos/` stays local and gitignored. No secrets, no `storageState`.
- Commits (later, on request): Conventional Commits, ≤ 50 chars, no attribution lines (project `CLAUDE.md`).

**Trade-offs**
- No drag means the core mechanic is not on camera. Accepted for the standard screencaster look and no extra tooling. The existing gallery shots (play, grid, pause) still show the board.
- Live site is a dated snapshot; the shuffle differs each run. Steps select tiles by DOM order, not pixels.

## Architecture & Design

### High-Level Flow
```
curl warm-up /api/get-images (retry until 200)
demos/perplex-image.template.yaml ── screencaster render_video
   └─> demos/output/perplex-image.<ts>.mp4 (1080p)
scripts/encode-video.sh ──> public/videos/perplex-image.mp4
ffmpeg -ss <t> scale=1280:720 ──> public/images/perplex-image/poster.webp
app/data/projects.ts media + i18n copy + e2e + ARCHITECTURE line
```

### Video script (no narration, `subtitles: false`, `meta.audience: marketing`)
Selectors to confirm with `explore_page` before the first render.

| Beat | Step |
|---|---|
| Menu | `goto https://perplex-image.vercel.app`, `wait` ~2 s |
| Picker | click "Choose manually", `wait` for `img[alt="Image"]` thumbnails, hover over a few, click the image chosen in the dry run (strong, distinct shapes) |
| Play | click "Play", `wait` for `[data-testid="puzzle-piece"]` |
| Board | `wait` ~2 s on the shuffled board, click one tile (`[data-testid="puzzle-piece"] >> nth=N`) so the blue selection ring shows, `wait`, click it again to deselect |
| Preview | click "Preview", `wait` ~2.5 s, click `[aria-label="Close preview"]` |
| Pause | click "PAUSE", `wait` ~2.5 s (modal `data-testid="pause-modal"`), click "Continue", `wait` ~2 s |

Level labels are not clicked: the inputs are invisible and a Shuffle icon overlays the label (their own e2e uses `dispatchEvent`). The default level plays. Pacing is by `wait` only; the dry run tunes it to 45–60 s.

### Key Changes
- **`app/data/projects.ts` (64–73):** add `video: 'videos/perplex-image.mp4'` and `poster: 'images/perplex-image/poster.webp'` inside `media`. No `captions`.
- **`i18n/locales/en.json` / `pl.json` (`projects.perplex-image`, line 331 and 338):**
  - `solution.body`: image comes from Supabase storage (Pexels removed); levels "9, 15 or 18 columns of tiles" instead of "(9×13, 15×23 or 20×30 tiles)" because the real tile count depends on the image (adapter fixes 1600×1200, live boards are 63/165/252 tiles, so "9×13" is not a tile count); Pinia "holds the image list and the chosen picture" (only `modules/core/store/images.ts` is a store); Nitro server routes read images from Supabase through an adapter so the service key stays on the server.
  - `lessons[1]`: "the image source sits behind an adapter, so another source could replace Supabase storage without touching the game".
  - Everything else untouched. Gallery captions untouched.
- **`tests/e2e/interaction.spec.ts`:**
  - `:197` retarget "detail page without a demo video hides the video section" to `projects/sudoku` (only other no-video detail project).
  - add a perplex-image test next to blind-clue's (`:191-195`): `video[preload="none"]` present, `video track` count 0.
- **`docs/ARCHITECTURE.md:209`:** add `perplex-image` to the list of projects with a silent demo video.
- **`docs/content-checklist.md`:** no perplex-image lines exist; no change.
- **Dependencies:** none.

### Fit with Project Docs
- **ARCHITECTURE.md:** media paths in `projects.ts`, copy in locale files (§5); `VideoPlayer` already renders `preload="none"` with no `<track>` when `captions` is absent (§8); `demos/` local and gitignored (§3); video budget by `check:video-size` (§9). No component change.
- **CODE_QUALITY.md:** no new runtime code (KISS/YAGNI). Copy keeps EN/PL parity enforced by the locale test (DRY). Recording tooling lives in `demos/`, never imported by `app/` (separation).
- **Docs to update:** `ARCHITECTURE.md` line 209 only. No Known debt change.

### Alternative Approaches Considered
- **Screencaster, no drag (chosen):** standard pipeline, no new tooling; video lacks tile movement.
- **Playwright script in `demos/`:** native `dragTo` and Shift-click would show real swaps and a group drag; loses screencaster cursor/pipeline unless `cursor.js` is injected. Not chosen by user.
- **Extend screencaster with `drag` and `click.modifiers`:** cleanest long term, but a separate Go task in another repo. Possible follow-up.
- **Hybrid segments joined by ffmpeg:** rejected, each render restarts the browser so puzzle state cannot carry over.
- **Extra copy fixes (touch, progress, proxy, "never runs out", pause caption):** valid findings, deferred by user.

## Implementation Steps
1. Warm the live demo: `curl` `/api/get-images` until 200. Confirm 18 images in the picker.
2. `explore_page` on the live site: confirm selectors (Choose manually, `img[alt="Image"]`, Play, `puzzle-piece`, Preview close, PAUSE, Continue) and pick the image with distinct shapes. Note its index.
3. Write `demos/perplex-image.template.yaml` per the table above (`name: perplex-image`, `subtitles: false`, no narration, no storageState, `outputDir: ../output`).
4. Dry-run render. Check duration with `ffprobe`, extract frames, confirm every beat is visible. Tune `wait` times. If the game hangs on "Loading..." re-warm and retry.
5. Final render.
6. `scripts/encode-video.sh demos/output/perplex-image.<ts>.mp4 public/videos/perplex-image.mp4`. `ffprobe`: 720p, H.264, no subtitle stream, 45–60 s.
7. Poster: `ffmpeg -ss <t> -i public/videos/perplex-image.mp4 -frames:v 1 -vf scale=1280:720 public/images/perplex-image/poster.webp`, a frame from the Preview overlay (full picture, strong composition). Keep ≤ ~80 KB (lower quality if larger).
8. Edit `app/data/projects.ts` media.
9. Edit EN and PL copy (`solution.body`, `lessons[1]`). Read both side by side; `pnpm check:locales` checks keys only.
10. Edit `tests/e2e/interaction.spec.ts` (retarget to `sudoku`, add perplex-image video test).
11. Edit `docs/ARCHITECTURE.md:209`.
12. `pnpm check:video-size`, `lint`, `typecheck`, `test`, `check:locales`, then `pnpm generate` and `pnpm test:e2e`.
13. `git status`: only `projects.ts`, both locale files, `interaction.spec.ts`, `ARCHITECTURE.md`, `perplex-image.mp4`, `poster.webp`. No commit.

### Risks & Mitigations
- **Cold start 504 or empty picker on camera.** Warm up with curl right before rendering; the `wait` for thumbnails is explicit. Re-render if the first frames show a loader.
- **Click on a tile does not select or `>> nth=` selector unsupported.** Try `[data-testid="puzzle-piece"]:nth-of-type(N)` or `hover` only; if no selection ring can be shown, drop that beat and show Preview and Pause only.
- **Video feels thin without any tile move.** Pace the beats and hover the picker; if it is under 45 s, hold the board longer. A follow-up screencaster `drag` change would fix it properly.
- **Live site changes after recording** (UI, images). The video is a snapshot; note the date in the commit only if useful.
- **Copy loses meaning in one locale.** Compare EN and PL by eye after editing.
- **`sudoku` gains a video later and the no-video test fails.** It fails loudly; retarget then.

## Test Strategy
- **Unit (Vitest):** existing `tests/unit/projects.test.ts` asserts media files exist (covers video and poster) and EN/PL parity.
- **E2E (Playwright):** no-video test on `sudoku`; new perplex-image test for `preload="none"` and zero `track`.
- **Media (scripted):** `ffprobe` on the MP4; `check:video-size`; `file` on the poster (1280×720, ≤ ~80 KB).
- **Manual:** open `/projects/perplex-image` EN and PL, play the video, check poster, read the new copy.

## Success Checklist
- [ ] MP4 45–60 s, 720p, faststart, no subtitle stream, ≤ 15 MiB, shows every planned beat
- [ ] `poster.webp` 1280×720, ≤ ~80 KB; cover and 5 gallery shots unchanged
- [ ] `projects.ts` media has `video` and `poster`
- [ ] EN/PL copy: no Pexels, no 20×30, Pinia sentence corrected, parity checked
- [ ] e2e green incl. new video test and `sudoku` retarget
- [ ] `ARCHITECTURE.md` line 209 updated
- [ ] lint, typecheck, test, check:locales, check:video-size, test:e2e pass
- [ ] `demos/` not staged; no commit

## Timeline & Estimates
- Warm-up, explore, template and dry runs: ~1.5 h
- Final render, encode, poster, frame review: ~45 min
- Data, copy, tests, docs: ~45 min
- Full check run: ~30 min
- **Total: ~3.5 h**, plus ~1 h if the tile click beat needs rework.

## Open Questions
- [ ] Poster frame: Preview overlay (default) or board with selected tile? Decided at render time from frames.
