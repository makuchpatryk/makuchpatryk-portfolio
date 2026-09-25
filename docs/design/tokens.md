# Design tokens

Source: `docs/design/design.html` (3 boards, unpacked copies in `docs/design/boards/`). Tokens live in `app/assets/css/main.css` as CSS variables (`:root` = dark, `.light` = derived light) and are mapped to Tailwind utilities through `@theme inline` (`bg-bg`, `text-muted`, `border-border`, …). Components never use `dark:` variants.

| Token | Dark | Light | Notes |
|---|---|---|---|
| bg | `#0B0D10` | `#F7F8FA` | page |
| surface | `#12151A` | `#FFFFFF` | cards |
| surface-2 | `#1A1E24` | `#EEF0F3` | chips, hover |
| border | `#232830` | `#DDE1E7` | non-text |
| border-strong | `#343A44` | `#B9C0CA` | non-text |
| text | `#E6E8EB` | `#14171C` | |
| text-2 | `#B4BAC4` | `#3D4450` | body copy |
| muted | `#8B93A1` | `#5B6472` | labels |
| faint | `#7F8896` (was `#5C6470`) | `#636D7B` | see below |
| accent | `#5EEAD4` | `#0F766E` | teal is unusable on light |
| accent-fg | `#0B0D10` | `#FFFFFF` | text on accent buttons |
| cat-rag / ai-workflow / full-stack / extra | `#5EEAD4 #FDBA74 #A5B4FC #A3E635` | `#0F766E #9A3412 #4F46E5 #3F6212` | tag/category colours |

## Contrast audit

The design's `faint` (`#5C6470`) measured 3.25:1 on bg (3.06 on surface, 2.80 on surface-2) and was used ~12× for text (arrows, hints) → fails WCAG AA. It is lifted to pass 4.5:1 on all three surfaces. `border-strong` stays as-is: it is a non-text boundary.

`tests/unit/contrast.test.ts` recomputes ratios for every text-token × surface pair in both themes by parsing `main.css`, so a token edit that breaks AA fails CI.

The design's `{{accent}}` tweak variable maps to the single `--accent` variable.
