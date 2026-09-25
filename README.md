# makuchpatryk — portfolio

Static, bilingual (EN default / PL) portfolio for an AI / Software Engineer. Nuxt 4 (`nuxt generate`), Tailwind CSS v4, dark-default terminal aesthetic with a light theme, typed TS content + i18n JSON. Product spec: [`PRD.md`](./PRD.md). Design source: [`docs/design/`](./docs/design).

## Quick start

```bash
pnpm install          # Node 22 (.nvmrc), pnpm 11
pnpm dev              # http://localhost:3000
pnpm generate         # fully static site in .output/public
```

## Scripts

| Script | What |
|---|---|
| `pnpm lint` / `pnpm typecheck` | ESLint (`@nuxt/eslint`) / `vue-tsc` |
| `pnpm test` | Vitest: project filter, locale parity, detail completeness, contrast ratios |
| `pnpm test:e2e` | Playwright against the **built** site (`pnpm generate` first): routes × locales, theme, language, filter, keyboard, axe (both themes) |
| `pnpm lhci` | Lighthouse CI (mobile + desktop, ≥0.95 assertions) |
| `pnpm check:placeholders` | launch gate: `[placeholder]` strings in built HTML |
| `pnpm check:locales` / `pnpm check:video-size` | key parity / video budget |

Pre-commit (Husky + lint-staged): ESLint on staged files + project typecheck. CI is the source of truth.

## Layout

```
app/            components (layout/home/project/ui), composables, data (typed content), pages, utils
i18n/locales/   en.json, pl.json (copy)
public/         cv.pdf, images/, videos/, favicon
scripts/        placeholder gate, locale check, video encode/size, Pages-like static server
tests/          unit (Vitest) + e2e (Playwright)
docs/           design tokens + boards, deploy guide, content checklist
```

Content is edited in `app/data/*` (structure) and `i18n/locales/*.json` (copy) — see [`docs/content-checklist.md`](./docs/content-checklist.md). Tokens and the contrast audit: [`docs/design/tokens.md`](./docs/design/tokens.md).

## Deploy

GitHub Pages via Actions (`.github/workflows/deploy.yml`); host-agnostic build driven by `NUXT_PUBLIC_SITE_URL`, `NUXT_APP_BASE_URL`, `NITRO_PRESET`. Setup, custom domain and other hosts: [`docs/deploy.md`](./docs/deploy.md).
