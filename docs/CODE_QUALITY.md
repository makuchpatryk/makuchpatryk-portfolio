# Code quality

The rules this codebase is written and reviewed against. They are a checklist for authors and reviewers, not a scoring system: when two rules pull in different directions, pick the simpler code and say why in the PR.

Order of precedence when they conflict: **KISS and YAGNI first** (this is a small static site), then the rest. Structure is in [ARCHITECTURE.md](./ARCHITECTURE.md).

| Rule | One line |
|---|---|
| [KISS](#kiss) | The simplest thing that works and reads clearly |
| [YAGNI](#yagni) | Don't build what isn't needed now |
| [DRY](#dry) | One source of truth for each piece of knowledge |
| [Separation of concerns](#separation-of-concerns) | Data, copy, logic and presentation live apart |
| [SOLID](#solid) | Small, focused units with stable seams |
| [Law of Demeter](#law-of-demeter) | Talk to neighbours, not to neighbours' internals |
| [Composition over inheritance](#composition-over-inheritance) | Build from small parts instead of hierarchies |

## KISS

Prefer the boring solution. Reach for a new abstraction, library or module only when the plain version has already become a problem.

Do:
- Use platform features before JavaScript. The mobile menu is a `<details>/<summary>` (works without JS), the theme icon swap is CSS, the tag filter is a list of buttons over a pure function.
- Keep functions short and single-purpose. `filterProjects(list, tag)` is 3 lines and trivially testable.
- Choose the flatter data shape. Placeholder content is plain bracketed strings, not a placeholder framework.
- Write code that a reader can follow top to bottom without holding state in their head. Early returns over nested conditions.

Don't:
- Add a state library, a CMS, a custom router or a content pipeline. Typed TS plus JSON is enough (see the decision table in ARCHITECTURE.md §14).
- Clever one-liners that need a comment to decode. Rename or split instead.

## YAGNI

Build for the requirements in the [PRD](./PRD.md), not for ones we might get.

Do:
- Delete code that has no caller. Unused helpers, props and i18n keys are debt.
- Add an option when the second real use appears, not before.
- Keep out-of-scope items out: blog, contact form, analytics, search, interactive terminal, server code (PRD §4).

Don't:
- Add a prop "in case" (`ProjectCard` has one extra prop, `as`, because `/projects` really needs `h2`).
- Generalise for a second locale, host or theme that doesn't exist. Two locales and two themes are supported; the code doesn't pretend to handle N.
- Pre-build abstractions around third-party modules "so we can swap them later". If a module is replaced, that is the time to introduce the seam.

Rule of thumb: if the justification starts with "later we might…", don't.

## DRY

Every piece of knowledge has exactly one authoritative place. Duplication of *knowledge* is the problem; two lines that merely look alike are not.

Single sources of truth in this repo:

| Knowledge | Lives in |
|---|---|
| Colours, spacing tokens, themes | CSS variables in `app/assets/css/main.css` (components use token utilities, never hex codes or `dark:`) |
| Project facts (slug, tags, order, detail) | `app/data/projects.ts`. Prerender routes, sitemap, prev/next and the filter all derive from it |
| Which i18n keys a detail project needs | `DETAIL_KEYS` in `app/types/content.ts`, used by the unit test |
| Filtering/sorting/adjacency rules | `app/utils/projects.ts` |
| Public file URLs respecting the base | `usePublicUrl()` |
| Page SEO and OG image | `usePageSeo()` |
| Copy | `i18n/locales/*.json`; never inline a user-visible string in a component |

Do:
- Derive, don't copy: routes from data, labels from i18n keys, contrast checks from the CSS file.
- Extract on the **third** occurrence (rule of three), and only if the copies change for the same reason.
- Enforce sameness with tests where drift is likely (EN/PL key parity, detail-key completeness, contrast).

Don't:
- Merge things that merely look similar but evolve independently (an accent button and a bordered button share classes today, not necessarily tomorrow).
- Extract so early that the shared code grows boolean flags to serve each caller.

Known duplication (candidates to extract when next touched):
- The section header markup (`<p class="font-mono text-[13px] text-accent">` + `<h2>`) repeats five times in `pages/projects/[slug].vue`; a `ProjectSection` component would own it.
- `detailPath` is computed the same way in `ProjectCard`, `ProjectFeatured` and `ProjectNav`; a `useProjectPath()` composable would own it.
- The repeated link class strings (`inline-flex min-h-11 items-center hover:text-accent`, about ten places) belong in one `@layer components` class or a `UiLink` component.

## Separation of concerns

Each layer has one job and knows as little as possible about the others.

| Layer | Job | Must not |
|---|---|---|
| `app/data/*` | structure and non-translated facts | contain sentences or markup |
| `i18n/locales/*` | every user-visible sentence, per locale | contain logic |
| `app/utils/*` | pure logic | import Nuxt, Vue or i18n (this is why Vitest can test it directly) |
| `app/composables/*` | glue: reactivity, i18n, router, head | render markup |
| `app/components/*` | presentation and interaction | fetch or compute domain rules |
| `app/pages/*` | compose components, wire a page to data and SEO | hold reusable UI |
| `scripts/*`, `tests/*` | tooling | be imported by `app/` |

Do:
- Keep styling in the design tokens and Tailwind classes; keep behaviour in composables; keep rules in utils.
- Keep host concerns out of app code. Base URL, site URL and preset come from env (`NUXT_APP_BASE_URL`, `NUXT_PUBLIC_SITE_URL`, `NITRO_PRESET`); code uses `usePublicUrl()`, `NuxtLink` and `NuxtImg`, never a hardcoded leading `/` for public files.
- Keep content changes out of code changes. Adding a project is a data entry plus JSON keys, with tests guarding completeness.

Don't:
- Put a domain rule in a template (`v-if` chains that encode business logic). Move it to a util and test it.
- Import a component from a util, or `app/` code from `nuxt.config.ts` beyond the data it needs (`nuxt.config.ts` imports only `app/data/projects` and uses relative imports there because the `~` alias isn't available at config time).

## SOLID

Applied pragmatically to functions, composables and components rather than to class hierarchies.

**Single responsibility.** One reason to change per unit.
- `useProjectFilter` owns filter state and URL sync; `filterProjects` owns the rule; `TagFilter` owns only the buttons.
- `ThemeToggle` toggles; `color-mode` persists.
- If a file needs "and" to describe it, split it.

**Open/closed.** Extend by adding data or a new component, not by editing working code.
- A new project, tag, category or stack group is a data entry plus copy; no component changes.
- A new page reuses `usePageSeo` and the default layout.
- Where branching on a type appears (`categoryTextClass`), keep it in one lookup table so the change is one line.

**Liskov substitution.** Anything that stands in for another must honour its contract.
- Components that fill the same slot take the same props shape (`ProjectCard` and `ProjectFeatured` both accept a `LocalizedProject`).
- Placeholder and real content go through the same code path (`PhotoFrame`, `VideoPlayer`, `Gallery` render a placeholder or media from the same props), so filling content never changes behaviour.

**Interface segregation.** Small, specific props and function signatures.
- `MetricGrid` takes `{ key, value, label }[]`, not a whole `Project` and the i18n object.
- `localizeProject(project, translate, exists)` takes two function arguments, not the i18n instance.
- Don't pass a big object when the component uses one field of it.

**Dependency inversion.** Depend on abstractions at the seams you actually test or swap.
- Pure utils receive `translate` and `exists` as parameters, so tests pass fakes instead of mocking vue-i18n.
- Pages depend on composables (`useProjects`), not on `data/projects.ts` plus i18n directly (`pages/projects/index.vue` still reads `projects` for the filter's source list; see Known debt).
- Don't add interfaces or DI containers where there is only one implementation and no test seam (YAGNI).

## Law of Demeter

A unit should talk to its direct collaborators, not reach through them into their internals. Avoid `a.b.c.d` chains that couple the caller to the shape of a distant object.

Do:
- Pass exactly what a component needs. `VideoPlayer` receives `src`, `poster` and `title`, not the project.
- Resolve once, near the source, then pass the flat result. `useProjects()` returns `LocalizedProject` objects with `title`, `summary`, `role` and `effect` already resolved, so templates never assemble `t('projects.' + slug + '.title')` themselves.
- Give a value a name when it is reached through more than one hop (`const gallery = computed(() => p.value.media?.gallery)`).
- Let a composable or util answer a question (`adjacentDetailProjects(list, slug)`) instead of the caller digging through the list.

Don't:
- Chain through unrelated objects (`route.matched[0].meta.foo.bar`). Add a small accessor.
- Let a child know its parent's structure. Children get props and emit events; they don't read the parent's state.
- Read i18n message internals (`tm()` AST). Use `useMessageList()`, which returns plain strings.

A short, flat, typed property path on a *data* object (`project.links.demo`) is fine; the rule targets reaching through behaviour and hidden structure.

## Composition over inheritance

Build behaviour by combining small pieces. There are no class hierarchies and no component `extends`/mixins in this codebase, and none should be added.

Do:
- **Composables for shared behaviour.** `useProjects` builds on `useI18n` and `localizeProject`; `useLocalizedProject` builds on `useProjects`; `usePageSeo` wraps `useSeoMeta` and `defineOgImage`.
- **Components for shared UI.** `ProjectPipelineDiagram` is used by both `ProjectFeatured` and the detail page (`framed`/`labels` props); `SectionHeading` is used by every section.
- **Slots and props over subclassing.** `ExternalLink` wraps any content via a slot; `SectionHeading` renders `h1` or `h2` through an `as` prop.
- **Small pure functions** combined in a composable, not a base class with overridable methods.

Don't:
- Create a `BaseCard` that `ProjectCard` and `ExperienceCard` "extend". Compose a shared inner component instead.
- Use mixins or `extends` in components. Use composables.
- Pass long boolean-flag lists to make one component impersonate several. Split into separate components that share an inner piece.

## Working agreements

- **Types.** TypeScript `strict`. No `any`; use `unknown` and narrow. Domain types live in `app/types/content.ts`.
- **Naming.** Components `PascalCase`, composables `useX`, utils are verbs (`filterProjects`), i18n keys mirror the data (`projects.<slug>.title`). Match the surrounding code.
- **Comments.** Explain *why* (a constraint, a gotcha, a decision), not *what*. Delete comments that restate the code. Non-obvious choices (e.g. why `ThemeToggle` uses unscoped CSS) get one.
- **Errors.** Fail at build time where possible: `failOnError` on prerender, parity and completeness tests, the placeholder gate. Don't add runtime error handling for cases that cannot happen.
- **Accessibility is part of "done".** Semantic elements, one `h1`, 44px targets, visible focus, both themes pass axe.
- **Small diffs.** One concern per commit, Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`), short subject in imperative mood.

## Enforcement

Rules that a machine can check are checked; the rest are review points.

| Check | Where | Guards |
|---|---|---|
| ESLint + stylistic (`@nuxt/eslint`) | `pnpm lint`, pre-commit, CI | style, unused code, Nuxt config order |
| `vue-tsc` strict | `pnpm typecheck`, pre-commit, CI | types, prop contracts |
| Vitest | `pnpm test`, CI | utils (KISS/separation), locale parity and detail completeness (DRY), contrast tokens |
| Playwright + axe | `pnpm test:e2e`, CI | behaviour, base-URL independence, accessibility |
| Lighthouse CI | `pnpm lhci`, CI | performance, SEO, best practices |
| Placeholder gate | `pnpm check:placeholders`, CI, `release*` tag | content completeness |

## Review checklist

Before opening a PR, ask:

1. **KISS**: could this be simpler? Is there a platform feature that does it?
2. **YAGNI**: does every line serve a current requirement? Anything unused?
3. **DRY**: is any knowledge now stored in two places? Did I copy where I should derive?
4. **Separation**: is each change in the right layer (data / copy / util / composable / component / page)?
5. **SOLID**: does each unit have one reason to change? Are props minimal? Can it be tested without mocking the world?
6. **Demeter**: am I reaching through objects? Should I pass a flat value or add an accessor?
7. **Composition**: am I extending instead of composing?
8. **Proof**: tests for logic, both locales and both themes checked, lint and typecheck clean.

## Known debt

Tracked here so it is deliberate, not forgotten. Fix opportunistically when touching the area.

- Section header markup repeated in `pages/projects/[slug].vue` (DRY, see above).
- `detailPath` computed in three components (DRY).
- Repeated link/button class strings (DRY).
- `pages/projects/index.vue` passes raw `projects` from `app/data` into `useProjectFilter` while also using `useProjects()`; the filter could take slugs from `useProjects()` instead (separation, dependency direction).
- `pages/projects/[slug].vue` is long: header, video, five sections and gallery in one file. Splitting the sections into components would help once a second detail layout or more sections appear (not before, per YAGNI).
- `nuxt.config.ts` builds sitemap URLs itself; if more page types are added, move that helper out of the config.
