# Real Projects from GitHub — Implementation Plan

## Summary
`app/data/projects.ts` and `projects.*` copy are still 7 bracketed placeholders with `[github-user]` links. Replace them with 8 real projects built from public GitHub repos (7 under `makuchpatryk`, 1 under the `CodingCru` org). All 8 get full EN + PL detail pages. Real metric numbers come from the owner after review. This clears the "Projects" block of `docs/content-checklist.md`, except for metrics and media.

## Success Criteria
- `projects.ts` holds exactly 8 projects, all `detail: true`, none of the 7 placeholder slugs left anywhere in `app/`, `i18n/`, `tests/`, `lighthouserc.cjs`, `docs/deploy.md`.
- Featured = exactly 3, in this order: `ai-book-chat` (lead, order 1), `blind-clue` (2), `perplex-image` (3).
- `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e` green; `pnpm generate` prerenders 16 detail routes (8 × EN/PL).
- `node scripts/check-placeholders.mjs` lists **only** `[value]` metric placeholders (24 per locale page set) — every other bracket gone. After owner pastes numbers: `--strict` passes.
- Every fact in copy traceable to the repo README / GitHub API (no invented numbers, no invented features).

## Scope & Constraints
- **In scope**: `app/data/projects.ts`, `Tag` union, `projects.*` + `pipeline.steps.*` in both locales, test/config/doc references to old slugs, content-checklist ticks.
- **Out of scope**: images/video (placeholders stay; cover/gallery later), new category, component/util changes, MatchColoursUI / MatchColoursBackend repos, private repos, older repos (quiz 2018, pollsApp, etc.).
- **Hard constraints**: EN/PL key parity and `DETAIL_KEYS` completeness (unit tests); unique titles/OG per page (e2e); no hardcoded leading `/`; KISS/YAGNI per `docs/CODE_QUALITY.md`.
- **Trade-offs (owner decisions)**:
  - Broad tag set (~28 filter buttons) over a short tech-only list — finer filtering, longer filter row.
  - `meta.year` = year repo was **created** (honest over fresh).
  - `ai-workflow` category **kept** with zero projects (type, colour token, `categories.ai-workflow`, `pipeline.label.ai-workflow` untouched) — deliberate YAGNI exception, noted in Known debt.
  - perplex-image role = **sole author** (40/44 commits; rest Copilot bot + 1 commit), `meta.type: 'personal'`, code link to `CodingCru/perplex-image`.

## Architecture & Design

### High-Level Flow
No new flow. Pure content change through the existing path:
```
app/data/projects.ts (8 entries) ─┬─> nuxt.config.ts detailPaths ─> 16 prerendered routes + sitemap
                                  └─> useProjects() ─> localizeProject() reads projects.<slug>.* (en/pl)
                                        ├─ featured[0] ai-book-chat  -> ProjectFeatured (with pipeline)
                                        ├─ featured[1..2]            -> ProjectCard
                                        └─ [slug].vue: meta, pipeline (rag only), MetricGrid, lessons
```

### Key Changes

**`app/data/projects.ts`** — replace whole array:

| order | slug | featured | category | year | tags | stack | links |
|---|---|---|---|---|---|---|---|
| 1 | `ai-book-chat` | ✓ | rag | 2026 | rag, python, fastapi, pgvector, celery, ollama, react | Python, FastAPI, PostgreSQL + pgvector, Celery + Redis, Ollama, Groq, React 19, TypeScript | code `makuchpatryk/ai-book-chat` |
| 2 | `blind-clue` | ✓ | full-stack | 2026 | typescript, vue, fastify, websockets, sqlite, multiplayer, game | TypeScript, Vue 3, Pinia, Fastify, Socket.io, SQLite | demo `https://blind-clue.xyz`, code `makuchpatryk/BlindClue` |
| 3 | `perplex-image` | ✓ | full-stack | 2024 | typescript, nuxt, supabase, pinia, playwright, game, puzzle | Nuxt 3, TypeScript, Pinia, Tailwind, Supabase, Vitest, Playwright | demo `https://perplex-image.vercel.app`, code `CodingCru/perplex-image` |
| 4 | `ai-semantic-db` | | rag | 2026 | rag, python, pgvector, ollama, cli, docker | Python 3.12, Typer, SQLAlchemy, Alembic, PostgreSQL + pgvector, Ollama (bge-m3) | code `makuchpatryk/ai-semantic-db` |
| 5 | `quiz-forge` | | full-stack | 2026 | typescript, nuxt, nestjs, postgres, turborepo, playwright, education | Nuxt 4, NestJS, TypeORM, PostgreSQL, Turborepo, Docker | code `makuchpatryk/quiz-forge` |
| 6 | `lean-track` | | full-stack | 2026 | typescript, vue, fastify, postgres, docker, jwt, nutrition | Vue 3, Fastify, TypeORM, PostgreSQL, Docker | code `makuchpatryk/lean-track` |
| 7 | `match-colours` | | full-stack | 2024 | vue, nuxt, game | Nuxt 3, Vue 3 | demo `https://match-colours.vercel.app`, code `makuchpatryk/MatchColours` |
| 8 | `sudoku` | | full-stack | 2024 | typescript, nextjs, react, game, puzzle | Next.js, React, TypeScript | demo `https://makuchpatryk.github.io/sudoku/`, code `makuchpatryk/sudoku` |

All `detail: true`, `meta.type: 'personal'`, no `media` (placeholders render). Slugs kebab-case to match route style.

**Pipelines** (only `rag` projects — the ingest/query rows are RAG-shaped; full-stack detail pages simply skip the section, as the old `fullstack-platform` did):
- `ai-book-chat`: ingest `documents → parsing → chunking → embeddings → pgvector`; query `question → rewrite → retrieval → rerank → llm → ui`; highlight `pgvector, rerank`.
- `ai-semantic-db`: ingest `schema → records → embeddings → pgvector`; query `question → embeddings → retrieval → cli`; highlight `pgvector`.

**Metrics** (3 per project; keys + drafted labels, values stay `[value]` until owner sends numbers):

| slug | keys → label draft |
|---|---|
| ai-book-chat | `ingest` time to READY for an N-page book · `latency` time to first token · `tests` automated tests |
| blind-clue | `players` players per room · `events` realtime socket events · `tests` automated tests |
| perplex-image | `levels` difficulty levels / max tiles · `tests` unit + e2e tests · `commits` commits |
| ai-semantic-db | `search` query time on N records · `fieldTypes` supported field types · `tests` automated tests |
| quiz-forge | `endpoints` API endpoints · `tests` unit + e2e tests · `packages` workspace packages |
| lean-track | `modules` backend modules · `endpoints` API endpoints · `tests` automated tests |
| match-colours | `levels` levels · `bundle` JS bundle size · `lighthouse` Lighthouse score |
| sudoku | `difficulties` difficulty levels · `bundle` JS bundle size · `lighthouse` Lighthouse score |

Owner can swap any key; keys are just i18n paths.

**`app/types/content.ts`** — extend `Tag` union with: `react, nuxt, nextjs, nestjs, fastify, websockets, sqlite, supabase, celery, ollama, pinia, playwright, turborepo, cli, jwt, game, puzzle, multiplayer, nutrition, education`. Keep existing members (`llm-eval`, `aws`, `ai-workflow` stay; `tests/unit/projects.test.ts:43` uses `'aws'`; unused union members never render because `collectTags` derives from data).

**`i18n/locales/en.json` + `pl.json`**:
- Delete `projects.{rag-assistant, ai-workflow-automation, fullstack-platform, llm-eval-harness, document-search, internal-dashboard, api-gateway}`.
- Add `projects.<slug>` × 8 with all `DETAIL_KEYS` + `metrics.<key>.{value,label}`. Copy sourced from READMEs; `role` lists what was built (e.g. "backend, RAG pipeline, React UI"); `effect` states a verifiable outcome (e.g. "streamed answers with page citations"); `duration` = created→last push month range from GitHub API; `lessons` = 2 items each, marked for owner review in PR description.
- `pipeline.steps`: add `parsing, rewrite, rerank, schema, records, cli`; delete now-unused `trigger, extraction, validation, action, audit, fastapi` (only placeholder `ai-workflow-automation`/`rag-assistant` used them) — YAGNI "unused i18n keys are debt". Keep `pipeline.label.*` for all 3 categories.

**Tests / config / docs** (verified references):
- `tests/e2e/helpers.ts:9` routes → `projects/ai-book-chat`, `projects/blind-clue`.
- `tests/e2e/interaction.spec.ts:38,41,46,171` `rag-assistant` → `ai-book-chat`; `:79-81` next of `ai-book-chat` → `/blind-clue/`; `:88,111` `7` → `8`. `vue` filter check still valid (3 of 8).
- `tests/e2e/smoke.spec.ts:63` `projects/document-search` (was the `detail:false` 404 case; none remain) → `projects/does-not-exist`.
- `lighthouserc.cjs:6` `rag-assistant` → `ai-book-chat`.
- `docs/deploy.md:23` deep-link example → `/projects/ai-book-chat`.
- `docs/content-checklist.md` Projects block: tick list/links/copy/pipeline; metrics + media stay open.
- `docs/CODE_QUALITY.md` Known debt: add "`ai-workflow` category kept with no project (owner choice)".

**Dependencies**: none.

### Fit with Project Docs
- **ARCHITECTURE.md §5**: data in `app/data/projects.ts`, sentences in locale JSON — followed. "A new project is a data entry plus JSON keys" — no component touched.
- **CODE_QUALITY.md**: KISS (no new abstractions), DRY (routes/sitemap/filter keep deriving from data), separation (stack names non-translated in data; prose in i18n). YAGNI bent once: `ai-workflow` category kept by owner choice; recorded in Known debt.
- **Docs to update**: `content-checklist.md`, `deploy.md`, `CODE_QUALITY.md` Known debt. `PRD.md:79` Tag example ends in `|...` — leave.

### Alternative Approaches Considered
- **Tags**: tech-only ~14 (scannable filter) vs broad ~28 — owner chose broad.
- **Pipeline for full-stack projects**: rejected; ingest/query labels are RAG vocabulary, and the detail page already handles absence.
- **Metrics from repo facts now**: rejected by owner — `[value]` placeholders keep the release gate honest until real numbers arrive.
- **Remove `ai-workflow`**: cleaner but ~6 more files; owner chose keep.
- **MatchColours as 3 projects (app, UI module, backend)**: rejected; backend repo empty, UI is internal module.

## Implementation Steps
1. Extend `Tag` union in `app/types/content.ts`.
2. Rewrite `app/data/projects.ts` with the 8 entries above (pipelines, metrics keys).
3. EN copy: delete 7 placeholder blocks, add 8 blocks, update `pipeline.steps` in `i18n/locales/en.json`.
4. PL copy: mirror step 3 in `pl.json` (same keys, natural Polish, not word-by-word).
5. `pnpm typecheck && pnpm test` — parity, DETAIL_KEYS, pipeline-step and featured tests green.
6. Update e2e + Lighthouse references (`helpers.ts`, `interaction.spec.ts`, `smoke.spec.ts`, `lighthouserc.cjs`).
7. `pnpm generate && pnpm test:e2e`; run `node scripts/check-placeholders.mjs` and confirm only `[value]` remain.
8. Docs: `deploy.md`, `content-checklist.md`, `CODE_QUALITY.md` Known debt.
9. Owner reviews copy (esp. `lessons`, `effect`, PL wording) and sends 24 metric values → fill → `--strict` gate passes.

Commits (≤50 chars): `content: replace placeholder projects with repos`, `test: point e2e and lhci at real slugs`, `docs: update checklist and deploy smoke link`.

### Risks & Mitigations
- **Copy overstates repo** (e.g. "fully tested", "multiplayer at scale").
  - Only claims present in README; PR description lists claims per project for owner check.
- **Demo URL dead** (`blind-clue.xyz`, vercel apps) → broken outbound link; e2e won't catch external links.
  - `curl -I` each demo during step 7; drop `links.demo` if not 200.
- **perplex-image README/demo belongs to org** — could change.
  - Link only; no hotlinked assets.
- **28 tag buttons crowd mobile filter row** → layout or 44px target issues.
  - Check `/projects` at 375px in both themes during e2e/axe run; if wrapping is ugly, owner revisits tag list (data-only change).
- **Unique title/OG e2e** fails if two titles collide.
  - Distinct project names; titles not generic.

## Test Strategy
- **Unit** (existing, data-driven): `tests/unit/locales.test.ts` (parity, DETAIL_KEYS, metrics, pipeline steps, categories), `tests/unit/projects.test.ts` (3 featured, featured ⇒ detail, ≥7 projects, unique slugs/orders).
- **E2E** (updated refs): smoke × 2 locales × 2 viewports on new routes, 404 on `does-not-exist`, prev/next `ai-book-chat → blind-clue`, tag filter count 8, no-JS shows 8 cards, axe both themes, non-root base run.
- **Manual**: home lead shows ai-book-chat pipeline; `/pl/projects/sudoku` reads naturally; filter row at 375px; each external link opens correct repo/demo.
- **Gate**: placeholder script output = only metric `[value]`s.

## Success Checklist
- [ ] 8 projects, 3 featured in agreed order, all detail pages prerendered
- [ ] No placeholder slug references left (`grep -rn rag-assistant` etc. empty outside git history)
- [ ] lint, typecheck, unit, e2e green
- [ ] Placeholder gate: only metric values remain; after owner numbers, `--strict` passes
- [ ] Owner approved copy EN + PL
- [ ] `content-checklist.md`, `deploy.md`, `CODE_QUALITY.md` updated

## Timeline & Estimates
- Data + types: ~0.5 h
- EN copy (8 detail blocks): ~2 h
- PL copy: ~1.5 h
- Tests/config/docs + full run: ~1 h
- Review fixes: ~0.5 h
- **Total**: ~5.5 h + owner review/metrics turnaround

## Open Questions
- [ ] Metric values (24) — owner sends after reviewing keys above; any key may be swapped.
- [ ] Media (covers/screenshots) — out of scope now; perplex-image and quiz-forge repos have screenshots that could be copied into `public/images/` later.
