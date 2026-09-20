---
description: Write or fix landing page copy from positioning.md until the copy lint passes clean.
---

You are rewriting the landing page copy for this Launchfold Lite site from its positioning brief. Follow these steps in order, and don't skip ahead.

## 1. Read the brief and current content

- Read `positioning.md` at the repo root. It has exactly 8 H2 headings: Product, Audience, Painful moment, Outcome, Proof, Alternatives, Objections, Offer.
- Read whatever currently exists in `src/content/landing/*.yaml` so you know the starting point.

## 2. Ask before writing, if the brief is thin

For each of the 8 headings, check whether it's empty, a placeholder (e.g. "TBD"), or vague (fewer than 8 words with no concrete specifics). If any are, ask up to 5 specific questions to fill the real gaps **before writing any copy** — don't invent specifics for someone's real product. If more than 5 headings are gappy, combine related ones into a single question (e.g. Audience + Painful moment can usually be one question) rather than skipping any silently. If every heading already has a real, specific answer, skip straight to step 3.

## 3. Rewrite the landing YAML

Rewrite (or create) the files in `src/content/landing/`. Required files: `hero.yaml`, `problem.yaml`, `faq.yaml`, `cta.yaml`, `pricing.yaml`. Optional: `demo.yaml` (omit if there's nothing to show), `founder.yaml` (becomes **required** if `hero.proof.type` is `none-yet`).

Match these schemas exactly:

**hero.yaml**
- `eyebrow?`: string, max 40 chars — optional, falls back to `audience` if empty
- `audience`, `pain`, `outcome`: strings — **not rendered as-is** on the page; they exist to force you to state them explicitly and are checked by the lint
- `headline`: string — the page's single `<h1>`. Keep it ≤ 70 chars (90 is a hard build error)
- `subheadline`: string, ≤ 160 chars
- `primaryCta`: `{ label, href }` — label becomes the waitlist button text
- `secondaryCta?`: `{ label, href }`
- `proof`: `{ type: 'waitlistCount' | 'metric' | 'quote' | 'founder' | 'none-yet', text? }`
- `visual`: `{ type: 'screenshot' | 'video' | 'embed', src, alt, caption? }` — for `screenshot`, `src` is a filename that must exist in `src/assets/`

**problem.yaml**
- `heading`: string
- `pains`: string[], 2–4 items
- `outcomes`: string[], 2–4 items — each must be ≥ 15 chars and must not repeat a `pains` item word-for-word
- `withoutLabel?` / `withLabel?`: strings — default to "Without {site.name}" / "With {site.name}"

**demo.yaml** (optional)
- `heading`, `subheading?`
- `media`: `{ type: 'screenshot' | 'video' | 'embed', src, alt, caption?, poster? }`

**how-it-works.yaml**
- `heading`: string
- `steps`: exactly 3 items of `{ title, description }`

**founder.yaml** (optional unless `hero.proof.type` is `none-yet`)
- `heading`, `name`, `role`
- `photo?`: filename in `src/assets/`; if omitted, an initials avatar renders instead
- `note`: string, max 400 chars
- `links?`: `{ label, href }[]`

**pricing.yaml**
- `hidden?`: boolean — if `true`, requires `hiddenReason` of ≥ 20 chars and the whole section is removed from the page
- `heading`: string
- `plan`: `{ name, earlyBirdPrice: number, regularPrice: number, currency, period: 'month' | 'year' | 'once', perks: string[] (3–6 items) }`
- `scarcity`: `{ type: 'spots' | 'date', value }`
- `note?`: string

**faq.yaml**
- `heading`: string
- `items`: at least 3 of `{ question, answer, objection: 'price' | 'trust' | 'effort' | 'fit' | 'switching' | 'other' }`

**cta.yaml**
- `heading`, `subheading?`
- `button`: `{ label }`
- `urgency`: `{ type: 'spots' | 'date', value }`
- `reassurance`: string

Don't invent a `visual.src` / `media.src` / `photo` filename that doesn't exist yet — the build fails loudly if it's missing. Reuse the existing placeholder in `src/assets/` (check what's there) or ask the user for a real image first.

## 4. Follow the copy rules

1. Write to the visitor ("you/your") more than about the company ("we/our").
2. Headline states the outcome or the pain in plain words, ≤ 70 characters.
3. Features are written as benefits: what changes for the visitor.
4. CTAs say what the visitor gets ("Reserve my early-bird spot"), never "Submit" / "Learn more" / "Click here".
5. Proof must be honest. Pre-launch proof can be a founder story, a waitlist count, or build-in-public progress. Never invent testimonials for a real product.
6. Every objection listed in `positioning.md` gets a FAQ answer.
7. No filler words (revolutionary, cutting-edge, seamless, game-changing, leverage, unlock, supercharge, empower, world-class, innovative, robust, powerful, effortless, state-of-the-art, disrupt, etc.); no more than one exclamation mark per section.
8. If this is still demo/placeholder content rather than a real product, keep it clearly fictional.

## 5. Run the lint and fix content, not rules

Run `npm run lint:copy -- --json` and read the output. Fix every error and warning by editing the **content** in `src/content/landing/*.yaml`. Repeat until it reports 0 errors and 0 warnings.

**Never** edit `scripts/copy-lint.mjs`, `scripts/copy-lint.rules.mjs`, or add entries to `copylint.config.json`'s `ignoreRules` to make the lint pass. If a rule seems wrong for a legitimate reason, stop and ask the user instead of working around it.

## 6. Summarize

End with:
- The headline you chose, plus 2 alternative headlines you considered and why you didn't pick them.
- A short list of what changed, per file.
- Confirmation that `npm run lint:copy -- --strict` now passes with 0 errors and 0 warnings.
