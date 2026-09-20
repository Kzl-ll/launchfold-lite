# Customizing

## Config — `src/site.config.ts`

One typed object controls global settings. Changing `site.name` updates the header, footer, page titles, and JSON-LD everywhere — no component edits needed.

| Field | Purpose |
|---|---|
| `name`, `tagline` | Shown in the header, footer, page titles, and meta description fallback |
| `url` | Used for canonical URLs, the sitemap, JSON-LD, and the waitlist form's `redirect` field — update this before deploying |
| `mode` | `'launch'` only in Lite; `'growth'` is reserved for Launchfold Pro |
| `theme.default` | `'system'` (default), `'light'`, or `'dark'` |
| `brand.accent` / `brand.accentDark` | Accent color per theme, 6-digit hex |
| `brand.radius` | Corner radius used across buttons, cards, inputs (default `'0px'` for the current print-editorial look; set e.g. `'8px'` for softer corners) |
| `links` | `x`, `github`, `email` — empty strings are hidden, not rendered as broken links |
| `waitlist` | Form endpoint, optional Web3Forms key, thanks-page path — see `docs/deploy.md` |
| `legal` | Company name, contact email, last-updated date shown on `/privacy` and `/terms` |
| `demoNotice` | Shows "Demo content: {name} is a fictional product" in the footer — turn off once you've replaced the demo copy |
| `showAttribution` | Footer "Built with Launchfold" link — safe to turn off |

## Content — `src/content/landing/*.yaml`

One YAML file per landing section (`hero`, `problem`, `demo`, `how-it-works`, `founder`, `pricing`, `faq`, `cta`), validated against Zod schemas in `src/content.config.ts`. Edit the YAML directly, or run `/write-copy` to have an agent do it from your `positioning.md` brief. Field-by-field schema reference: `.claude/commands/write-copy.md` or `AGENTS.md`.

Editing content never requires touching a `.astro` file — sections render only from these files (Hard Rule: no hardcoded copy in components).

## Tokens — `src/styles/global.css`

Colors, radius, and spacing are CSS custom properties, defined once and consumed as Tailwind v4 `@theme` utilities (`bg-surface`, `text-muted`, `rounded-brand`, `py-section`, etc.):

- Light values live on `:root`; dark values are under `html[data-theme="dark"]`, with a `prefers-color-scheme` media query as a no-JS fallback.
- `--brand-accent` / `--brand-accent-dark` / `--radius` come from `site.config.ts` via an inline style on `<html>` in `Base.astro` — change the config, not the CSS.
- The `.heading` class carries the serif display treatment (weight 500, tight tracking); the `.label` class carries the uppercase monospace treatment used for eyebrows and badges. Apply either alongside Tailwind's `text-*` size utilities.
- `:focus-visible`, the skip-link, the honeypot-hiding `.honeypot` class, and the `prefers-reduced-motion` override all live here too.

## Images — `src/assets/`

Drop image files (`.svg`, `.png`, `.jpg`, `.webp`, `.avif`) into `src/assets/`, then reference the **filename only** (not a path) from YAML: `hero.yaml`'s `visual.src`, `demo.yaml`'s `media.src`, or `founder.yaml`'s `photo`. A small resolver (`src/lib/images.ts`) maps the filename to an `astro:assets`-optimized image at build time.

If a referenced filename doesn't exist in `src/assets/`, the build fails with a message naming the exact YAML file and field — it won't silently render a broken image.

Founder photos are optional; without one, an initials avatar (generated from `founder.name`) renders instead.
