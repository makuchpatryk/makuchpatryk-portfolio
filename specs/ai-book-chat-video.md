# ai-book-chat Demo Video + Screenshots — Implementation Plan

## Summary
The `ai-book-chat` project page has only `media.cover`. This plan adds a narrated ~75 s demo video, a poster, an English WebVTT captions track and four gallery screenshots, following the `robak-remonty` precedent (`specs/robak-remonty-video.md`). Recording uses the screencaster MCP against the real app running locally, with the book *AI Engineering* (Chip Huyen) already ingested, and the real Groq LLM. No portfolio component code changes: the captions field, `<track>`, i18n label and encode script already exist.

## Success Criteria
- `public/videos/ai-book-chat.mp4`: 60–90 s, 720p H.264, faststart, ≤ 15 MiB (`pnpm check:video-size`), no subtitle stream (`ffprobe` shows video + audio only).
- `public/videos/ai-book-chat.en.vtt`: starts with `WEBVTT`, one cue per narrated step, cue text equals narration.
- `public/images/ai-book-chat/`: `poster.webp`, replaced `cover.webp`, and gallery `chat.webp`, `citations.webp`, `library.webp`, `document.webp`. All 1280×720, each ≤ ~80 KB.
- `/projects/ai-book-chat` (EN and PL): `<video preload="none">` with `<track kind="captions" srclang="en">`; gallery tiles carry captions in both locales.
- Video and screenshots show only UI the app really renders (inline `p.N` chips, no panel, no dark theme).
- No secret anywhere: `LLM_TOKEN` value absent from tracked files, `public/` and `.output/public`.
- `pnpm lint`, `typecheck`, `test`, `check:locales`, `check:video-size`, `test:e2e` and `lhci` stay green (lhci 100 on sampled pages; `/projects/ai-book-chat` and `/pl/projects/ai-book-chat` are already in `lighthouserc.cjs`).
- No change in `~/projects/screencaster` or `~/projects/ai-book-chat`.

## Scope & Constraints
**In scope**
- Start the ai-book-chat stack locally; check reachability from Docker.
- `demos/ai-book-chat.template.yaml` (video) and `demos/ai-book-chat-screenshots.yaml` (screenshots). Both are in the gitignored `demos/`.
- Render, caption extraction, encode, poster, cover and gallery conversion.
- `projects.ts` media, i18n gallery captions, e2e test fix, docs.

**Out of scope**
- Follow-ups, "not in the book" demo, overview, quiz, upload.
- A sources panel and a dark variant (user chose to show the real UI only).
- Any code change in ai-book-chat or screencaster.
- Separate DB, wiping or re-ingesting data. Recording uses the current DB (user: nothing private in it).
- PL narration or PL captions: one English track on both locales, as for robak.

**Hard constraints**
- Local only: `goto` URLs on `http://172.17.0.1:5173` (`docker0` confirmed as `172.17.0.1`).
- Never print or commit `LLM_TOKEN`. Do not open `/health` on camera.
- Groq free tier: at most ~3 dry-run renders.
- Commit message follows the project `CLAUDE.md`: Conventional Commits, ≤ 50 chars, no `Co-Authored-By`, no "Generated with" line.

**Trade-offs**
- Fixed `wait` times instead of a "stream done" signal. The app has no stable done element, and `wait: <selector>` only waits for visibility. Mitigated by dry runs and a check of the final render.
- Screenshots come from a separate `take_screenshots` run, not video frames. Cleaner (no cursor overlay), but a second set of Groq calls and extra conversation rows in the local DB.
- Screencaster viewport is fixed at 1920×1080, so shots are downscaled to 1280×720 to match the existing gallery.
- The book is copyrighted. The video shows only short answer text and page chips, no pages of the book. User chose it knowingly.

## Architecture & Design

### High-Level Flow
```
ai-book-chat (local)                              makuchpatryk-new
────────────────────                              ─────────────────
docker compose up postgres redis api worker
  (api :8000 host net, Ollama :11434 on host)
cd apps/web && pnpm exec vite --host 172.17.0.1
  (/api proxied to localhost:8000)
screencaster MCP (docker, /work = this repo)
  render_video demos/ai-book-chat.template.yaml (subtitles: true)
      └─> demos/output/ai-book-chat.en.<ts>.mp4  (1080p, soft mov_text)
  take_screenshots demos/ai-book-chat-screenshots.yaml
      └─> demos/output/ai-book-chat-screenshots/screenshots/NN.png
ffmpeg -map 0:s:0 -c:s webvtt ──> public/videos/ai-book-chat.en.vtt
scripts/encode-video.sh (-sn already) ──> public/videos/ai-book-chat.mp4
ffmpeg scale=1280:720 ──> poster / cover / gallery .webp
app/data/projects.ts media {...} ──> VideoPlayer <track>, Gallery
```

### Key Changes
- **`demos/ai-book-chat.template.yaml`** (new, gitignored): `name: ai-book-chat`, `languages: [en]`, `subtitles: true`, `meta.audience: marketing`, no intro/outro, no `storageState` (the app has no auth, so no cookie risk).
- **`demos/ai-book-chat-screenshots.yaml`** (new, gitignored): `type: screenshots`.
- **`app/data/projects.ts`** (ai-book-chat entry, lines 4-20):
  ```ts
  media: {
    video: 'videos/ai-book-chat.mp4',
    poster: 'images/ai-book-chat/poster.webp',
    captions: 'videos/ai-book-chat.en.vtt',
    cover: 'images/ai-book-chat/cover.webp',
    gallery: [
      'images/ai-book-chat/chat.webp',
      'images/ai-book-chat/citations.webp',
      'images/ai-book-chat/library.webp',
      'images/ai-book-chat/document.webp'
    ]
  }
  ```
  `[slug].vue` shows the first two inline in Solution and the rest in the gallery section (captions offset by 2, fixed in d427fc0).
- **`i18n/locales/en.json`, `pl.json`**: new `projects.ai-book-chat.gallery` with keys `"0"`–`"3"` (chat answer, page-reference chips, library, book overview). Captions must not mention a panel or dark theme. EN/PL parity enforced by `check:locales`.
- **`tests/e2e/interaction.spec.ts:178-186`**: the test "detail page shows the video slot (placeholder…)" does `getByText('demo.mp4')` for `projects/ai-book-chat` and **fails once a real video exists**. Replace it with a test on `projects/ai-book-chat` that mirrors the robak one (`video[preload=none]`, one `track[kind=captions][srclang=en]`, track `src` returns 200). If no project still shows the placeholder, drop the placeholder test.
- **`docs/ARCHITECTURE.md:209`**: "demo videos exist for `screencaster`, `first-million` and `robak-remonty`" gains `ai-book-chat`; adjust the "other projects still show the placeholder" tail to match what is true after the change (check the other projects first).
- **`docs/content-checklist.md`**: tick/adjust the ai-book-chat media line if one exists.
- **Unchanged (verified):** `content.ts` (`captions?`), `VideoPlayer.vue` (`<track>`), `[slug].vue:98`, `encode-video.sh` (`-sn`), `project.captionsLabel` (EN "English", PL "angielski"), `tests/unit/projects.test.ts` (covers every media path and the `WEBVTT` header automatically), `.gitignore` (`demos/`, `.screencaster`).
- **Dependencies:** none.

### Fit with Project Docs
- **ARCHITECTURE §5:** media paths are data in `projects.ts`; labels are copy in i18n; no project-specific code.
- **ARCHITECTURE §4:** poster, video and VTT URLs already go through `usePublicUrl()`.
- **ARCHITECTURE §14:** known-limitations line updated (above).
- **CODE_QUALITY:** KISS/YAGNI (data + assets only, no new code path), DRY (unit test already guards file existence), separation of concerns (`demos/` is tooling, never imported by `app/`).
- **Docs to update:** ARCHITECTURE §14, content-checklist.

### Alternative Approaches Considered
- **Citations (decided with user):** show inline `p.N` chips only. Rejected: build `SourcesPanel` in ai-book-chat first (scope change, delays the video); faking a panel in the portfolio (fabricated UI); no citation shot at all.
- **Dark variant (decided with user):** skipped. Rejected: injecting `.dark` via storageState/localStorage (shows a state the app does not offer; screencaster has no JS step).
- **Captions:** extract screencaster's `mov_text` track (same as robak). Rejected: hand-timed VTT (drifts).
- **Vite host:** `--host 172.17.0.1` binds only the docker bridge, not the LAN. Fallback `--host 0.0.0.0` for the recording only. Vite 6 only restricts non-IP hostnames, so the IP host passes.
- **Gallery source:** separate `take_screenshots` run (chosen) over video frames (cursor overlay, single run). Frames stay as fallback.

## Implementation Steps
0. **Environment checks (no changes).**
   1. `docker0` is `172.17.0.1` (confirmed).
   2. Ollama on `:11434` with `nomic-embed-text` (`ollama list`).
   3. `.screencaster/` is owned by `patryk`, so the robak `chown` blocker does not apply.
1. **Start ai-book-chat (you run these; the containers are stopped).**
   1. `cd ~/projects/ai-book-chat && docker compose up -d postgres redis api worker`.
   2. `cd apps/web && pnpm exec vite --host 172.17.0.1 --port 5173`.
   3. Check: `curl -sI http://172.17.0.1:5173/documents` returns 200; `curl -s http://172.17.0.1:5173/api/documents` lists *AI Engineering* with status `READY`. If it is missing or not READY, stop and ask: the premise "already ingested" failed.
   4. Ask one manual question in the browser. Confirm the answer contains `p.N` chips and no "Not in this document" note. The default demo question is "How should I evaluate an LLM application?". Swap it if the answer is ungrounded or has no chips.
2. **Selectors.** MCP `explore_page` on `/documents`, the book page, and a chat page after one question. Record the working selector for each of:
   - the book link (sidebar `NavLink`, `features/documents/components/DocumentListItem.tsx`);
   - the "New chat" button (`ConversationList.tsx`);
   - the composer `textarea[placeholder="Ask a question..."]` (Enter sends). The send button is icon-only, so use Enter;
   - the answer card and an inline chip (`MarkdownAnswer.tsx` renders `p.N` spans, so find a stable selector such as `text=/^p\.\d+/`).
3. **Write `demos/ai-book-chat.template.yaml`.** Shot list, ~75 s total:
   | # | Steps | Narration (en) |
   |---|---|---|
   | 1 | `goto /documents`, `wait 1000` | "This is AI Book Chat, a local app that answers questions about a PDF and points to the pages it used. The book is AI Engineering by Chip Huyen, already processed." |
   | 2 | click the book, `wait 1000` | "Each book has its own conversations, listed in the sidebar." |
   | 3 | click New chat, `wait 500` | "I start a new chat. Questions are scoped to this one document." |
   | 4 | `fill` the question | "I ask in plain language." |
   | 5 | `press Enter`, `wait 1500` | "The question is rewritten into a standalone query, matched with pgvector, re-ranked by an LLM, and the answer streams in." |
   | 6 | `wait ~15000` (tune; no narration) | none |
   | 7 | `scroll` to a chip, `wait 800` | "The page references in the answer point back to the book, so every claim can be checked." |
   | 8 | `goto /documents`, `wait 2000` | "It runs on a laptop: Postgres with pgvector, Celery for ingestion, Ollama for embeddings and Groq for the chat model." |

   The narration says Groq is hosted, so it never claims the app is fully offline.
4. **Render (≤ 3 attempts).** MCP `render_video` with `script: demos/ai-book-chat.template.yaml`, then poll `get_render_status`. Check: duration 60–90 s, the stream is visible, the answer is complete and grounded, no devtools overlay and no secret on screen. Tune the waits and narration.
5. **Screenshots.** `demos/ai-book-chat-screenshots.yaml`, 1920×1080:
   1. `goto /documents`, `screenshot: true` → library.
   2. Open the book, `screenshot: true` → book overview.
   3. New chat, fill, Enter, `wait ~25000`, `scroll` so question and answer fill the viewport, `screenshot: true` → chat.
   4. Close-up of the answer with its `p.N` chips: `screenshot: {clip: {x,y,width,height}}` with a 16:9 region, since the gallery tiles are `aspect-video object-cover`. Optional `annotate` on one chip.

   Run `take_screenshots`, poll `get_render_status`, and view every PNG before converting.
6. **Convert assets (from the repo root).**
   1. Captions: `ffmpeg -i demos/output/ai-book-chat.en.<ts>.mp4 -map 0:s:0 -c:s webvtt public/videos/ai-book-chat.en.vtt`. Compare each cue with the narration.
   2. Encode: `scripts/encode-video.sh demos/output/ai-book-chat.en.<ts>.mp4 public/videos/ai-book-chat.mp4`, then `pnpm check:video-size`. `ffprobe` must show no subtitle stream.
   3. Poster: `ffmpeg -ss <t> -i public/videos/ai-book-chat.mp4 -frames:v 1 -vf scale=1280:720 -q:v 80 public/images/ai-book-chat/poster.webp` at the frame with the finished answer.
   4. Gallery and cover: `ffmpeg -i <png> -vf scale=1280:720 -q:v 80 <name>.webp`. The cover replaces `cover.webp` (the chat shot), and the others become `chat`, `citations`, `library` and `document`. Check each is ≤ ~80 KB.
7. **Portfolio code and data.** `projects.ts` media, i18n gallery captions (EN + PL), e2e test fix (see Key Changes).
8. **Docs.** ARCHITECTURE §14 line, content-checklist.
9. **Checks.** `pnpm lint && pnpm typecheck && pnpm test && pnpm check:locales && pnpm check:video-size && pnpm test:e2e`, then `lhci` (the ai-book-chat URLs are already in `lighthouserc.cjs`).
10. **Secret gate and cleanup.**
    - In the shell only: `TOKEN=$(grep '^LLM_TOKEN=' ~/projects/ai-book-chat/.env | cut -d= -f2-)`, then `git grep -F -- "$TOKEN"` and the same grep over `public/` and `.output/public`. Expect no hits. Never echo `$TOKEN`.
    - `rm -rf demos/output`.
    - `.screencaster/jobs.db*` still holds the robak submitted script (it has a session cookie). Delete it after the last render, with no job queued. Do not delete it while a render runs.
11. **Manual QA.** Play in Chrome and Firefox with captions on; check light and dark portfolio themes and phone width; watch the whole video once for secrets or private data.

Commit (≤ 50 chars): `feat: add ai-book-chat demo video`. A second commit is optional: `feat: add ai-book-chat gallery shots`. Commit only when you ask.

## Risks & Mitigations
- **Vite unreachable from Docker.** Mitigation: `--host 172.17.0.1` plus the `curl` precheck. Fallback: `--host 0.0.0.0` for the run only.
- **LLM variance:** slow answer, Groq rate limit, ungrounded answer, no `p.N` chips.
  - Mitigation: pick a question the book clearly answers, verify manually in step 1.4, cap dry runs at 3, check the final render. Fallback: a second question.
- **Fixed waits cut the stream or leave dead time.** Mitigation: size waits from the dry run; check the finished answer in the render and the screenshots.
- **Chips are small in a 1920×1080 → 1280×720 shot.** Mitigation: the dedicated clip close-up (step 5.4) with an optional `annotate`.
- **Narration lags the action** (known screencaster issue). Mitigation: short narration per step, watch the render. Cue timing follows the narration offsets.
- **"Already READY" premise wrong** (stack was down for 7 weeks). Mitigation: step 1.3 gate, stop and ask if it fails.
- **Stale robak cookie in `.screencaster/jobs.db`.** Mitigation: step 10 deletion; it is gitignored in any case.
- **Secret exposure.** Mitigation: the app never displays the token, no `/health` on camera, step 10 grep.
- **Local DB gains conversations** from dry runs and screenshot runs. Mitigation: acceptable; delete from the UI if wanted. They appear in the sidebar, so delete the extras before the final render.
- **Lighthouse.** Mitigation: `preload="none"`, non-default track, small webp.

## Test Strategy
- **Unit:** `tests/unit/projects.test.ts` (existing) covers every ai-book-chat media path and the `WEBVTT` header. No new test.
- **E2E:** replace the `demo.mp4` placeholder test with a captions/preload test for `projects/ai-book-chat` (see Key Changes). The non-root base run covers the base-URL case.
- **Locales:** `check:locales` and `locales.test.ts` for the new gallery keys.
- **Media:** `ffprobe` (duration, 720p, no subtitle stream), `check:video-size`, VTT against narration, each webp 1280×720 and ≤ ~80 KB.
- **Manual:** captions in Chrome and Firefox, both themes, phone width, full watch for secrets.
- **Perf:** lhci at 100 on the ai-book-chat pages.

## Success Checklist
- [ ] Stack reachable at `172.17.0.1:5173`; `/api/documents` shows *AI Engineering* `READY`
- [ ] Selectors confirmed with `explore_page`
- [ ] Video rendered: 60–90 s, complete grounded answer, no secret or overlay
- [ ] VTT matches narration
- [ ] MP4 720p, faststart, ≤ 15 MiB, no subtitle stream
- [ ] Poster, cover and 4 gallery webp at 1280×720, each ≤ ~80 KB
- [ ] `projects.ts` media set; gallery captions in EN and PL
- [ ] e2e `demo.mp4` test replaced and green
- [ ] lint, typecheck, test, check:locales, check:video-size, test:e2e, lhci green
- [ ] ARCHITECTURE §14 and checklist updated
- [ ] Secret grep clean; `demos/output` and `.screencaster/jobs.db*` removed

## Timeline & Estimates
- Stack start, reachability, selectors: ~1.5–2 h
- Script and 2–3 render iterations: ~2–2.5 h
- Screenshots and asset conversion: ~1 h
- Portfolio data, i18n, e2e, docs: ~1 h
- Checks and manual QA: ~1 h
- **Total: ~7 h**, plus buffer for LLM-driven re-renders

## Open Questions
- [ ] Demo question: default "How should I evaluate an LLM application?", confirmed or swapped in step 1.4 against the real answer.
- [ ] If *AI Engineering* turns out not READY, re-ingest it (needs your OK, since it writes to your DB).
