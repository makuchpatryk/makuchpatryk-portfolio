# blind-clue Demo Video + Screenshots — Implementation Plan

## Summary
The `blind-clue` project page has only `media.cover`. This plan adds a silent 60–90 s demo video of a real 3-player game seen from the impostor's seat, a poster and four gallery screenshots with EN/PL captions. The camera player is driven by the screencaster MCP; the two other players are bots in a gitignored Node script talking socket.io. A temporary, uncommitted patch in the impostor repo forces the camera player to be the impostor and the word to be "Penguin". The portfolio copy for blind-clue is corrected at the same time, because it describes events and a scoring step that the code does not have. The debug text that shows in the game UI is fixed by a real commit in the impostor repo.

## Success Criteria
- `public/videos/blind-clue.mp4`: 60–90 s, 720p H.264, faststart, ≤ 15 MiB (`pnpm check:video-size`), no subtitle stream, no narration. No `.vtt` file.
- The video shows: lobby → game created (camera is host) → 2 join requests accepted on camera → Start Game → "YOU ARE THE IMPOSTOR" → 3 clue rounds → voting → "Impostor's Turn to Guess" → `penguin` → "Game Over" with "Impostor Guessed: penguin ✓ Correct!".
- No debug text (`sdsss`, `asdsadsad…`), no Mute toggle flicker, no real email or sub besides the 4-char sub prefix the lobby always shows.
- `public/images/blind-clue/`: new `poster.webp` plus gallery `lobby.webp`, `clues.webp`, `voting.webp`, `result.webp`. All 1280×720, each ≤ ~80 KB. `cover.webp` unchanged (byte-identical).
- `/projects/blind-clue` (EN and PL) renders `<video preload="none">` with no `<track>`; all 4 gallery tiles have captions in both locales.
- blind-clue copy in `en.json` / `pl.json` matches the code: no "scoring", no `joinGame`, no `VotesRevealed`.
- `pnpm lint`, `typecheck`, `test`, `check:locales`, `check:video-size`, `test:e2e` green.
- Impostor repo after the work: only the debug-text fix commit; the demo patch reverted (`git status` clean).
- No token, password or Cognito secret in tracked files, `public/` or `.output/public`.

## Scope & Constraints
**In scope**
- Impostor repo: a temporary demo patch (reverted) and one real commit that removes the debug text.
- Three demo accounts in the Cognito dev pool (`eu-north-1`) via `/api/auth/signup`: Alex (camera), Mia, Sam. They stay after the recording, so re-renders can reuse them.
- `demos/` (gitignored): setup script, bot script, video template, screenshots script, `.build/` with storageState and account credentials.
- Render, encode, poster and gallery conversion; `projects.ts` media; i18n gallery captions and copy fix; e2e test change; docs.

**Out of scope**
- Narration, captions, intro/outro cards, a PL video.
- Login screen on camera.
- Adding scoring to the game, the broken UI sign-in (CSRF token is sent as a header, the backend expects it in the body), the dead `joinGame` emit in `use-lobby.ts`, the word sent to the impostor in `GameStarted`. Noted for the impostor repo, not fixed here.
- The `blind-clue.xyz` TLS problem (demo link stays out).
- Any change in `~/projects/screencaster`.

**Hard constraints**
- Local only: browser at `http://172.17.0.1:5174` (5173 is the ai-book-chat Vite, 8000 is uvicorn), backend `:3000` on `0.0.0.0`.
- Never print `packages/backend/.env` values, access tokens or passwords.
- Commits: portfolio follows its `CLAUDE.md` (Conventional Commits, ≤ 50 chars, no attribution lines). Impostor commit follows the impostor repo's own `CLAUDE.md`. No commit until the user asks.

**Trade-offs**
- Env vars instead of a Vite proxy patch: the client already sends cookies cross-origin (`credentials: "include"`, socket `withCredentials: true`), and `172.17.0.1:5174` → `:3000` is same-site, so `SameSite=Lax` cookies flow. No file edit is needed for networking.
- Impostor forced by player name (`DEMO_IMPOSTOR_NAME`), not by email: `Game` already knows names, so the patch is a few lines with no user-repo lookup. It depends on the lobby name being exactly `Alex`.
- Bots drive the client-side turn logic themselves (`advanceTurn` math). More code in the bot than a "click Next" bot, but no browser, and the user chose socket bots.
- Fixed `wait` times in the template, checked by dry runs. No narration means steps pace only on `wait`.

## Architecture & Design

### High-Level Flow
```
impostor (local)                                  makuchpatryk-new
────────────────                                  ─────────────────
backend  :3000   env CORS_ORIGIN=http://172.17.0.1:5174
                     DEMO_IMPOSTOR_NAME=Alex DEMO_WORD_ID=word_penguin
frontend :5174   env VITE_PORT=5174 VITE_API_URL=http://172.17.0.1:3000
                     VITE_SOCKET_URL=http://172.17.0.1:3000  (vite --host 172.17.0.1)

demos/blind-clue-setup.mjs ── signup (once) / signin Alex, Mia, Sam via API
   ├─> demos/.build/blind-clue-accounts.json   (0600, passwords)
   └─> demos/.build/blind-clue.yaml            (template + inline storageState:
                                                 access_token, csrf_token cookies,
                                                 localStorage impostor_playerName=Alex)
demos/blind-clue-bots.mjs (background) ── Mia + Sam sockets, wait for GameCreated
screencaster render_video demos/.build/blind-clue.yaml
   └─> demos/output/blind-clue.<ts>.mp4 (1080p)
screencaster take_screenshots demos/.build/blind-clue-screenshots.yaml
   └─> demos/output/blind-clue-screenshots/screenshots/NN.png
scripts/encode-video.sh ──> public/videos/blind-clue.mp4
ffmpeg scale=1280:720 ──> poster.webp + 4 gallery webp
app/data/projects.ts media + i18n captions/copy
```

### Game script (what the camera and bots do)
Turn order is join order: Alex (host), Mia, Sam.

| Phase | Camera (Alex, screencaster) | Bots (Mia, Sam) |
|---|---|---|
| Lobby | `/lobby` with name prefilled, rounds 3, click "Create Game" → `/:gameId`, "Waiting for players..." | On `GameCreated`, wait ~1.5 s (camera must join first to be host), then `requestJoin {gameId, playerName, avatar}` |
| Join | click "Allow" twice (wait for "Join Request" modal each time), then "Start Game" | wait for `joinGameSuccess` |
| Rounds 1–3 | on its turn: type clue in "Enter your word...", click "Next Person" | on `PlayerTurnAdvanced` where `players[currentPlayerIndex]` is the bot: wait 1–1.5 s, `submitPlayerWord {gameId, playerId, word, round}`, then `advanceTurn` with the next index / clicked list computed exactly like `game.store.ts` `advancePlayerTurn` |
| Voting | after both bots voted: pick "Mia", click "Show Impostor" (last vote, so its client emits `allPlayersVoted`) | on `VotingStarted`, wait ~1 s, `playerVoted` then `voteImpostor {votedForId: Alex}` |
| Guess | "Impostor's Turn to Guess": type `penguin`, "Submit Guess" | nothing |
| End | hold on "Game Over" ~4 s | exit on `GameEnded` |

Default clues (no letter "k" in anything the camera types; "k" toggles mute in `running-phase.vue:231`):
- Round 1: Alex `wild` (knows only "Animals"), Mia `tuxedo`, Sam `ice`
- Round 2: Alex `cold`, Mia `waddles`, Sam `black and white`
- Round 3: Alex `swims`, Mia `fish`, Sam `Antarctica`

### Key Changes
- **Impostor demo patch (uncommitted, reverted after recording):**
  - `packages/backend/src/core/domain/entities/game.ts` `startGame()` (random pick at lines 83–85): if `process.env.DEMO_IMPOSTOR_NAME` matches a player's name, use that player; else keep random.
  - `packages/backend/src/core/domain/use-cases/create-game.use-case.ts:19`: if `process.env.DEMO_WORD_ID` is set, load that word by id instead of `getRandomWord()` (check the word repository has a by-id read; the orchestrator already resolves words by `wordId`).
- **Impostor commit (real, separate):** remove the debug text at `packages/frontend/src/App.vue:33-35` and `packages/frontend/src/features/lobby/views/lobby-waiting-room.vue:2`. Must land before recording (or be applied in the working tree) so it is not in the frame. The demo patch must not be in this commit.
- **`demos/blind-clue-setup.mjs`** (new, gitignored): refuses non-local origins. Uses its own random CSRF token (`Cookie: csrf_token=X` + body `csrfToken: X`) for `/api/auth/signup` (first run) and `/api/auth/signin`. Writes `demos/.build/blind-clue-accounts.json` (mode 0600) and renders `demos/blind-clue.template.yaml` / `demos/blind-clue-screenshots.template.yaml` into `demos/.build/` with inline storageState (cookie domain `172.17.0.1`, `httpOnly` as the server sets it, `sameSite: Lax`, `secure: false`). Same pattern as `demos/robak-seed.mjs`. Never prints tokens. Access tokens last ~1 h, so it runs right before each render.
- **`demos/blind-clue-bots.mjs`** (new, gitignored): `socket.io-client` (from the impostor repo's `node_modules` or a local `npx` install in a separate dir), `io('http://172.17.0.1:3000', { extraHeaders: { Cookie: 'access_token=…' }, transports: ['websocket'] })`. Plays one game per `GameCreated`, so the same process serves the video run and the screenshots run. Logs each turn (index, round, clicked list) to stdout for debugging.
- **`demos/blind-clue.template.yaml`** (new, gitignored): `name: blind-clue`, `languages: [en]` with no `narration` on steps, `subtitles: false`, `meta.audience: marketing`, no intro/outro, `storageState: __STORAGE_STATE__`. Selectors by text/placeholder (no `data-testid` in the app), confirmed with `explore_page` first.
- **`demos/blind-clue-screenshots.template.yaml`** (new, gitignored): `type: screenshots`, no `subtitles` key (the ai-book-chat attempt was rejected because of it). Shots: lobby with 3 players (before Start), round 2 with clues listed, voting with Mia selected, Game Over. Fallback: frames cut from the render with `ffmpeg -ss`.
- **`app/data/projects.ts`** (blind-clue entry, lines 32–44):
  ```ts
  media: {
    video: 'videos/blind-clue.mp4',
    poster: 'images/blind-clue/poster.webp',
    cover: 'images/blind-clue/cover.webp',
    gallery: [
      'images/blind-clue/lobby.webp',
      'images/blind-clue/clues.webp',
      'images/blind-clue/voting.webp',
      'images/blind-clue/result.webp'
    ]
  },
  ```
  No `captions` (same as `screencaster` and `first-million`).
- **`i18n/locales/en.json` / `pl.json`** (`projects.blind-clue`, line 291):
  - add `gallery` `"0".."3"` describing only what the shots show;
  - rewrite `effect`, `problem.body`, `solution.body` (and any `architecture.body` / `lessons` lines with the same claims) to the real flow: host approves join requests (`requestJoin` / `JoinRequest` / `approveJoin`), turns and rounds over `submitPlayerWord` / `PlayerTurnAdvanced`, votes with `voteImpostor`, a caught impostor gets `ImpostorGuessRequest` and guesses the word; the game ends on a summary screen, no points. Same meaning in both locales.
- **`tests/e2e/interaction.spec.ts:190-194`**: the "detail page without a demo video hides the video section" test uses `projects/blind-clue`; retarget it to `projects/perplex-image` (no video). Add a blind-clue test: `video[preload="none"]` present, `track` count 0.
- **Docs:** `docs/ARCHITECTURE.md:209` add blind-clue to the list of projects with a demo video; `docs/content-checklist.md:24/29/30` note the blind-clue video, gallery and the copy fix.
- **Dependencies:** none in the portfolio. `socket.io-client` only for the gitignored bot script.

### Fit with Project Docs
- **ARCHITECTURE.md**: media paths stay in `app/data/projects.ts` (§5), captions/copy in the locale files (§5), components unchanged (§8 Media, `VideoPlayer` already skips `<track>` without `captions`). `demos/` stays local and gitignored (§3). Video budget (§9) is checked by `check:video-size`.
- **CODE_QUALITY.md**: no new runtime code (KISS/YAGNI). Gallery captions keyed by index like the other projects (DRY). Bot and setup scripts are tooling outside `app/` (separation). Copy fix keeps EN/PL parity enforced by the locale test.
- **Docs to update**: `ARCHITECTURE.md` §14 demo-video line; `content-checklist.md` blind-clue lines. No `Known debt` change.

### Alternative Approaches Considered
- **Bots in a second browser (Playwright):** slower, more fragile, needs UI login (broken by the CSRF bug). Rejected by the user.
- **Backend bot mode in impostor:** cleanest video, but a real feature in another repo. Rejected by the user.
- **Re-render until the random impostor is the camera:** no patch, but ~3 renders per success and the word would not be known to the script. Rejected.
- **Vite proxy patch for same-origin:** works, but adds a second patched file; env vars do the same job with the existing cross-origin cookie setup. Rejected after checking `http-client.ts` / `socket.ts`.
- **Force impostor by email:** needs an email → sub lookup in the users table. Rejected for the name-based override.
- **Gallery from video frames:** single run, but cursor overlay in the frames. Kept as fallback.

## Implementation Steps
1. **Impostor debug-text fix.** Remove the text in `App.vue:33-35` and `lobby-waiting-room.vue:2`. Run the frontend tests. Prepare the commit (message per impostor `CLAUDE.md`); commit when the user asks.
2. **Demo patch.** Apply the `DEMO_IMPOSTOR_NAME` / `DEMO_WORD_ID` overrides in `game.ts` and `create-game.use-case.ts`. Note the files for the revert.
3. **Start the stack.**
   - backend: `cd packages/backend && CORS_ORIGIN=http://172.17.0.1:5174 DEMO_IMPOSTOR_NAME=Alex DEMO_WORD_ID=word_penguin pnpm dev` (background)
   - frontend: `cd packages/frontend && VITE_PORT=5174 VITE_API_URL=http://172.17.0.1:3000 VITE_SOCKET_URL=http://172.17.0.1:3000 pnpm exec vite --host 172.17.0.1` (background)
   - check `curl -sI http://172.17.0.1:5174/` = 200 and `curl -s http://172.17.0.1:3000/health`.
4. **Accounts + storageState.** Write and run `demos/blind-clue-setup.mjs`: sign up `demo-alex@example.test`, `demo-mia@example.test`, `demo-sam@example.test` (random passwords, saved 0600), sign in all three, render `demos/.build/*.yaml`.
5. **Selectors.** `explore_page` on `http://172.17.0.1:5174/lobby` with the storageState: logged in, name field shows `Alex`, socket connected (Create Game works). Confirm selectors for "Create Game", "Allow", "Start Game", "Enter your word...", "Next Person", player button "Mia", "Show Impostor", "Enter your guess...", "Submit Guess".
6. **Bot script.** Write `demos/blind-clue-bots.mjs`; unit-check the `advanceTurn` index/round math against `game.store.ts:233-250` with a tiny inline test; dry run: create a game with `explore_page` actions and watch bot logs through join → start → round 1.
7. **Video.** Write `demos/blind-clue.template.yaml`, rerun setup, start bots, `render_video`. Watch the whole render: camera is impostor, all 3 rounds, Alex is most voted, guess Correct, 60–90 s, nothing stray in the frame. Tune waits; ~3 dry runs max.
8. **Screenshots.** `take_screenshots` with `demos/.build/blind-clue-screenshots.yaml` (new game, bots still running). If rejected or broken, cut frames from the final render.
9. **Encode + images.** `scripts/encode-video.sh demos/output/blind-clue.<ts>.mp4 public/videos/blind-clue.mp4`; `ffprobe` (duration, 720p, no subtitle stream); poster = frame from the "YOU ARE THE IMPOSTOR" round screen; gallery PNGs → 1280×720 webp (`-q:v 80`, lower if > 80 KB).
10. **Portfolio data/copy.** `projects.ts` media; EN/PL gallery captions; EN/PL copy fix.
11. **Tests/docs.** e2e retarget + blind-clue video test; `ARCHITECTURE.md:209`; `content-checklist.md`.
12. **Checks.** `pnpm lint && pnpm typecheck && pnpm test && pnpm check:locales && pnpm check:video-size`, then `pnpm generate && pnpm test:e2e`.
13. **Cleanup.** Stop bots and dev servers; revert the demo patch (`git checkout --` on the two files) and confirm `git status` shows nothing but the fix commit; delete `demos/.build/*.yaml` with tokens (keep `blind-clue-accounts.json` for re-renders), `demos/output`, `.screencaster/jobs.db*`; grep `public/`, `.output/public` and `git diff` for `eyJ`, `access_token`, the demo passwords.
14. **Commit** (when asked): portfolio `feat: add blind-clue demo video` (media, i18n, tests, docs; copy fix may be its own `fix:` commit per "one concern per commit").

### Risks & Mitigations
- **Bots join before the camera and become host.** The first `requestJoin` wins host.
  - Mitigation: bots wait ~1.5 s after `GameCreated` and check that the game's host is not a bot (they get `JoinRequest` only if they are host; if a bot gets `joinGameSuccess` with itself as the only player, log loudly and abort the run).
- **Turn desync.** `advanceTurn` values are computed on the client; a wrong index leaves "Next Person" stuck on camera.
  - Mitigation: copy the formula from `advancePlayerTurn`, log every `PlayerTurnAdvanced`, dry run before rendering.
- **Voting never completes.** Only the client that sees the last vote emits `allPlayersVoted`.
  - Mitigation: bots vote ~1 s after `VotingStarted`, camera waits until both `PlayerVoted` are in (wait on the vote counter or a fixed 4 s). Fallback: the bot that sees the third `PlayerVoted` emits `allPlayersVoted`.
- **Socket connects before cookies / token expired.** The socket is created at app boot and does not retry on a middleware reject.
  - Mitigation: storageState injects the cookie before the first page; setup runs right before each render (token ~1 h).
- **Game deleted between runs.** Games are dropped 2 min after the last socket leaves.
  - Mitigation: each run creates a fresh game; bots play one game per `GameCreated`.
- **Cognito writes in a shared dev pool.** Approved by the user. Clearly named demo accounts; passwords only in `demos/.build` (gitignored, 0600).
- **Voice code on plain http.** `navigator.mediaDevices` is undefined at `172.17.0.1`; error is caught. Check the render has no error toast or banner.

## Test Strategy
- **Unit:** `tests/unit/projects.test.ts` already asserts every media path exists; locale parity test covers new keys and copy edits. No new unit test.
- **E2E:** retargeted no-video test (perplex-image) + blind-clue video test (`preload="none"`, no `track`). Smoke and a11y already cover `projects/blind-clue` via `tests/e2e/helpers.ts:9`.
- **Bot logic:** small inline check of the turn math before the first dry run.
- **Media:** `ffprobe` (60–90 s, 720p, no subtitle stream), `check:video-size`, webp size and 1280×720.
- **Manual:** watch the full video for stray text, wrong role, mute flicker, errors; check gallery captions in EN and PL against each picture; both themes and phone width on the detail page.
- **Impostor:** its frontend tests after the debug-text fix; `git status` clean after the revert.

## Success Checklist
- [ ] Debug text removed in impostor (commit ready)
- [ ] Demo patch applied; stack reachable at `172.17.0.1:5174` / `:3000`
- [ ] 3 demo accounts created; storageState rendered; nothing secret printed
- [ ] Selectors confirmed with `explore_page`
- [ ] Bots dry run: join, 3 rounds, votes, guess
- [ ] Final render 60–90 s, camera is impostor, guess Correct, clean frame
- [ ] MP4 720p, faststart, ≤ 15 MiB, no subtitle stream
- [ ] Poster + 4 gallery webp 1280×720, ≤ ~80 KB; cover untouched
- [ ] `projects.ts` media; EN/PL gallery captions; EN/PL copy matches the code
- [ ] e2e retarget + blind-clue video test green
- [ ] lint, typecheck, test, check:locales, check:video-size, test:e2e green
- [ ] ARCHITECTURE §14 and content-checklist updated
- [ ] Demo patch reverted; temp files with tokens removed; secret grep clean

## Timeline & Estimates
- Debug-text fix, demo patch, stack start: ~1 h
- Setup script, accounts, selectors: ~1.5 h
- Bot script + dry runs: ~2–3 h
- Video renders (≤ 3 dry runs) + screenshots: ~2 h
- Encode, images, data, copy, tests, docs: ~1.5–2 h
- Checks, cleanup: ~0.5–1 h
- **Total: ~9–10 h**, plus buffer for turn/vote sync issues

## Open Questions
- [ ] Clue words: defaults in the game-script table; swap on request.
- [ ] Camera's vote target: `Mia` by default (anything but Alex works).
