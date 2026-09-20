# AGENTS.md — Launchfold Lite

This file is for AI coding agents other than Claude Code (Cursor, Codex, etc.) working on this repo on the site owner's behalf. Claude Code users get the same workflow via the `/write-copy` and `/check-copy` slash commands in `.claude/commands/`.

## What this repo is

Launchfold Lite is a positioning-first Astro landing page kit for a pre-launch SaaS/AI waitlist page. Copy comes from `positioning.md`, lives in typed YAML content files, and is enforced by a copy lint that runs before every build.

## Writing or fixing the landing copy

When asked to write or fix this site's copy, follow this workflow:

1. **Read the brief.** `positioning.md` at the repo root has exactly 8 H2 headings: Product, Audience, Painful moment, Outcome, Proof, Alternatives, Objections, Offer. Read the current `src/content/landing/*.yaml` files too.

2. **Ask before writing, if the brief is thin.** For each heading, check whether it's empty, a placeholder, or vague (fewer than 8 words with no concrete specifics). If any are, ask up to 5 specific questions before writing — don't invent specifics for someone's real product. Combine related headings into one question if there are more than 5 gaps.

3. **Rewrite the landing YAML** in `src/content/landing/` to match the schemas below. Required files: `hero.yaml`, `problem.yaml`, `faq.yaml`, `cta.yaml`, `pricing.yaml`. Optional: `demo.yaml` (omit if nothing to show), `founder.yaml` (required if `hero.proof.type` is `none-yet`).

   - **hero.yaml**: `eyebrow?` (max 40 chars, falls back to `audience`), `audience`, `pain`, `outcome` (not rendered as-is — they force you to state them), `headline` (single `<h1>`, ≤ 70 chars, 90 is a hard error), `subheadline` (≤ 160 chars), `primaryCta { label, href }`, `secondaryCta? { label, href }`, `proof { type: waitlistCount | metric | quote | founder | none-yet, text? }`, `visual { type: screenshot | video | embed, src, alt, caption? }` (screenshot `src` is a filename in `src/assets/`).
   - **problem.yaml**: `heading`, `pains` (2–4 items), `outcomes` (2–4 items, each ≥ 15 chars, none repeating a `pains` item word-for-word), `withoutLabel?` / `withLabel?` (default "Without/With {site.name}").
   - **demo.yaml** (optional): `heading`, `subheading?`, `media { type, src, alt, caption?, poster? }`.
   - **how-it-works.yaml**: `heading`, `steps` (exactly 3 of `{ title, description }`).
   - **founder.yaml** (optional unless proof type is `none-yet`): `heading`, `name`, `role`, `photo?` (filename in `src/assets/`, else an initials avatar renders), `note` (max 400 chars), `links? { label, href }[]`.
   - **pricing.yaml**: `hidden?` (requires `hiddenReason` ≥ 20 chars if true, removes the section), `heading`, `plan { name, earlyBirdPrice, regularPrice, currency, period: month | year | once, perks (3–6 items) }`, `scarcity { type: spots | date, value }`, `note?`.
   - **faq.yaml**: `heading`, `items` (≥ 3 of `{ question, answer, objection: price | trust | effort | fit | switching | other }`).
   - **cta.yaml**: `heading`, `subheading?`, `button { label }`, `urgency { type: spots | date, value }`, `reassurance`.

   Don't invent a `visual.src` / `media.src` / `photo` filename that doesn't exist — the build fails loudly if it's missing. Reuse the existing placeholder in `src/assets/` or ask the user for a real image.

4. **Follow the copy rules:**
   1. Write to the visitor ("you/your") more than about the company ("we/our").
   2. Headline states the outcome or the pain in plain words, ≤ 70 characters.
   3. Features are written as benefits: what changes for the visitor.
   4. CTAs say what the visitor gets, never "Submit" / "Learn more" / "Click here".
   5. Proof must be honest — a founder story, waitlist count, or build-in-public progress. Never invent testimonials.
   6. Every objection in `positioning.md` gets a FAQ answer.
   7. No filler words (revolutionary, cutting-edge, seamless, game-changing, leverage, unlock, supercharge, empower, world-class, innovative, robust, powerful, effortless, state-of-the-art, disrupt, etc.); at most one exclamation mark per section.

5. **Run `npm run lint:copy -- --json`** and fix every error/warning by editing content in `src/content/landing/*.yaml`. Repeat until 0 errors, 0 warnings. **Never** edit `scripts/copy-lint.mjs`, `scripts/copy-lint.rules.mjs`, or `copylint.config.json`'s `ignoreRules` to make it pass — if a rule seems wrong, ask the user instead.

6. **Summarize**: the headline chosen plus 2 alternatives, what changed per file, and confirmation that `npm run lint:copy -- --strict` passes clean.

## Repo rules that apply to you

- **Zero client JS by default.** Don't add React/Vue/Svelte or any framework runtime. The only JS allowed is the existing small inline `<script>` blocks for the theme toggle and mobile nav.
- **Minimal dependencies.** Don't add npm packages without a clear reason; this kit intentionally has very few.
- **No hardcoded copy in components.** All visitor-facing text comes from `src/content/` or `src/site.config.ts`, not from `.astro` component files.
- **Accessibility matters.** Semantic HTML, one `<h1>`, visible focus states, labels on form inputs, `alt` text on images.
- **The copy lint must pass.** `npm run build` runs it first and fails the build on errors. Fix content, don't weaken the lint.
- **Don't touch `scripts/`** unless you were specifically asked to change lint behavior — and even then, get explicit confirmation first.
