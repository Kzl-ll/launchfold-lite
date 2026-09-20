# Launchfold Lite

**The positioning-first Astro landing kit for SaaS & AI tools: go from positioning brief to waitlist page with copy that converts.**

Demo: _(add your deploy preview link here once you've deployed — see [Quick start](#quick-start))_

<!-- TODO: record a short GIF here showing `npm run build` failing with a copy-lint ERROR (e.g. a "Submit" CTA), then passing after the fix. Recording it is more convincing than describing it. -->
> 🎬 **GIF placeholder** — `npm run build` failing on a generic CTA (`ERROR E004 ... "Submit" is generic`), then passing after the copy is fixed. See `docs/copy-lint.md` for the actual rules this catches.

## Why positioning-first

Every landing page template solves design — sections, dark mode, a decent Lighthouse score. None of them solve *what to say*. Across 31 founder complaints about landing pages, 52% were about unclear value propositions, egocentric copy, and missing proof — not layout. Launchfold Lite starts from a structured positioning brief and runs a copy lint before every build, so filler copy and missing conversion essentials fail the build instead of shipping.

## Features

- **Positioning brief → typed copy.** Fill in `positioning.md`; content lives in schema-validated YAML, not scattered across components.
- **Copy lint.** Blocks the build on generic CTAs, filler words, egocentric copy, missing FAQ answers, and more — see the [rules table](#copy-lint-rules) below.
- **`/write-copy`.** A Claude Code command (plus a standalone prompt for any chat assistant) that writes and fixes your copy until the lint passes clean.
- **Zero client JS by default.** Only two small inline scripts (theme toggle, mobile nav). No framework runtime.
- **Light/dark theme**, accessible by default (skip link, visible focus states, semantic landmarks, `prefers-reduced-motion`).
- **Waitlist form that works without JS**, with a honeypot and progressive enhancement — see `docs/deploy.md` for wiring up a real provider.
- **SEO out of the box**: sitemap, robots.txt, Open Graph/Twitter tags, JSON-LD.
- **Deploys free** to Cloudflare Pages, Netlify, or Vercel as static `dist/`.

## Quick start

1. Clone the repo and install dependencies: `npm install` (or `docker compose up dev` if you'd rather not install Node locally).
2. Edit `positioning.md` with your product's real answers.
3. Run `/write-copy` in Claude Code (or paste `prompts/write-copy.md` into any chat assistant) to generate landing copy and get it lint-clean.
4. Run `npm run build` (or `docker compose --profile build run --rm build`).
5. Deploy the `dist/` folder — see `docs/deploy.md` (Cloudflare Pages is the fastest path).

## Customizing

- **Config:** `src/site.config.ts` — name, tagline, URL, brand colors, radius, social links, waitlist settings, legal info.
- **Content:** `src/content/landing/*.yaml` — one file per section, validated by Zod schemas in `src/content.config.ts`.
- **Tokens:** `src/styles/global.css` — colors (light/dark), radius, spacing, and the `.heading` type treatment, all as CSS custom properties.
- **Images:** drop files in `src/assets/` and reference the filename from YAML (`visual.src`, `media.src`, `photo`); the build fails with a clear error if a referenced file is missing.

Full reference: `docs/customize.md`.

## Copy lint rules

Every rule below has passing and failing test fixtures in `scripts/fixtures/`. Full explanations with bad/good examples: `docs/copy-lint.md`.

| ID | Severity | Rule |
|---|---|---|
| E001 | error | Placeholder text anywhere (`lorem`, `ipsum`, `TODO`, `TBD`, `Your Product`, `Company Name`, `xxx`, `[insert`) |
| E002 | error | Required section file missing (`hero`, `problem`, `faq`, `cta`, `pricing`); hidden pricing needs a `hiddenReason` ≥ 20 chars |
| E003 | error | `hero.headline` over 90 characters |
| E004 | error | Generic CTA label (`Submit`, `Click here`, `Learn more`, `Send`, `OK`) |
| E005 | error | Fewer than 3 FAQ items |
| E006 | error | `hero.proof.type` is `none-yet` and `founder.yaml` is missing |
| W001 | warn | `hero.headline` over 70 characters |
| W002 | warn | Weak CTA label (`Get started`, `Sign up`, `Subscribe`, `Join` alone) |
| W101 | warn | Filler words (revolutionary, seamless, game-changing, leverage, unlock, empower, world-class, innovative, robust, effortless, state-of-the-art, disrupt, and more) |
| W102 | warn | More "we/our/us" than "you/your" across the landing copy |
| W103 | warn | A `problem.outcomes` item under 15 characters, or one that repeats a `pains` item |
| W104 | warn | `hero.subheadline` over 160 characters |
| W105 | warn | More than one exclamation mark in a single section |
| W106 | warn | An empty required heading in `positioning.md` |
| W107 | warn | `hero.headline` shares no meaningful word with `hero.outcome` or `hero.pain` |

Run `npm run lint:copy` any time, or `npm run lint:copy -- --strict` to also fail on warnings. `npm run build` always runs the lint first.

## Deploy

Static output, no adapter needed — works on Cloudflare Pages, Netlify, or Vercel (non-commercial only on the free Hobby tier). Full steps, env vars, and security headers: `docs/deploy.md`.

## Lite vs Pro

| | Lite (this repo) | Pro |
|---|---|---|
| Waitlist landing page | ✅ | ✅ |
| Positioning brief + copy lint | ✅ | ✅ |
| Blog, changelog, alternatives/vs pages | – | 🔜 coming soon |
| CMS-backed content | – | 🔜 coming soon |
| Price | Free, MIT | _(link placeholder — Pro waitlist TBD)_ |

## Demo content

"Shipnote" is a fictional product used throughout this repo's demo content — not a real company. Turn off the footer notice by setting `demoNotice: false` in `src/site.config.ts` once you've replaced it with your own copy.

## License

MIT — see [LICENSE](LICENSE).
