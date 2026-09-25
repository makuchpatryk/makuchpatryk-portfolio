# Deploy

The site is fully static (`nuxt generate` → `.output/public`). The build is host-agnostic: everything host-specific comes from three env vars.

| Var | Meaning | Example |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | site **origin only** (canonical, hreflang, sitemap, OG image URLs) | `https://user.github.io` |
| `NUXT_APP_BASE_URL` | path the site is served from | `/makuchpatryk/` or `/` |
| `NITRO_PRESET` | `github_pages` on GitHub Pages only (adds `.nojekyll`, `404.html`); omit elsewhere | `github_pages` |

> Deviation from the PRD: `SITE_URL` must be the **origin without the repo path**. The SEO modules append `NUXT_APP_BASE_URL` themselves, so `https://user.github.io/makuchpatryk` would produce `.../makuchpatryk/makuchpatryk/...` URLs.

## GitHub Pages (Actions)

One-time setup:

1. Repo → **Settings → Pages → Source = GitHub Actions**.
2. Repo → **Settings → Secrets and variables → Actions → Variables**: add `SITE_URL` (e.g. `https://<user>.github.io`). Add `BASE_URL=/` only when using a custom domain or a `<user>.github.io` user-site repo.
3. Push to `main`. `deploy.yml` runs CI (`ci.yml`), builds with `NITRO_PRESET=github_pages`, uploads `.output/public` and deploys.

Without `BASE_URL` the workflow uses `/<repo-name>/` (project page: `https://<user>.github.io/<repo>/`).

Post-deploy smoke check (manual): live URL, `/pl/`, a deep link such as `/projects/rag-assistant`, a non-existent path (serves `404.html`), `/sitemap_index.xml`, `/cv.pdf`.

### Launch gate

`scripts/check-placeholders.mjs` scans the built HTML for `[placeholder]` strings. It only warns on `main`; pushing a tag matching `release*` runs it with `--strict` and fails the build. Note: the `github-pages` environment only accepts deployments from `main` by default — add the tag pattern under **Settings → Environments → github-pages → Deployment branches and tags** if you want tag-triggered deploys.

### Known limitation on a project-page subpath

- `robots.txt` is not generated (it is only valid at the domain root; the robots module refuses to emit it under a base path).

## Custom domain

1. Add `public/CNAME` containing the domain (e.g. `example.com`).
2. Set repo variables `BASE_URL=/` and `SITE_URL=https://example.com`.
3. DNS: `A` records to GitHub Pages IPs (or `CNAME` to `<user>.github.io` for a subdomain); enable *Enforce HTTPS* in Pages settings.

## Other hosts

Drop `NITRO_PRESET` and set the same two vars; the output is plain static files.

- **Cloudflare Pages**: 25 MiB per-file limit (videos are capped at 15 MiB by `pnpm check:video-size`). Build command `pnpm generate`, output `.output/public`.
- **Netlify / Vercel**: build `pnpm generate`, publish `.output/public`. `404.html` is picked up automatically.

## Verifying a build locally

```bash
NUXT_PUBLIC_SITE_URL=https://example.com pnpm generate
pnpm test:e2e                       # serves .output/public at http://localhost:4173/

# non-root base (what a GitHub project page looks like)
NITRO_PRESET=github_pages NUXT_APP_BASE_URL=/makuchpatryk/ NUXT_PUBLIC_SITE_URL=https://user.github.io pnpm generate
PORT=4174 E2E_BASE=/makuchpatryk/ pnpm test:e2e
```

`scripts/serve.mjs` mimics GitHub Pages (directory index, `404.html`, gzip, base path).
