# BUILD_BRIEF.md — Launchfold Lite v0.1

Read the section a step points to. Do **one step at a time**.
Requirements, user stories and acceptance criteria live in **`PRD.md`**. This brief covers the how and the order. If the two conflict, **PRD.md wins**. Each step lists the PRD features it implements; verify their acceptance criteria before reporting done.

---

## 1. Product
**One-liner:** The positioning-first Astro landing kit for SaaS & AI tools: go from positioning brief to waitlist page with copy that converts.

**Why it exists (research, Sep 2026):** Across 31 founder complaints about landing pages, the biggest single theme was design time (8). That is already solved by every template. But **16 of 31 (52%)** were about *what to say and what to prove*: unclear value proposition, egocentric feature copy, no proof before launch, no demo, no pricing, no urgency. None of the 10 Astro SaaS templates we reviewed helps with copy. Their demo text is generic filler. Launchfold Lite fixes that.

**Lite = "launch mode"** (pre-launch, waitlist). A later paid Pro adds "growth mode" in a separate repo. Don't build Pro features here.

## 2. Audience
Technical solo/duo founders of SaaS or AI tools who are about to launch, have no designer or copywriter, and want a fast, credible waitlist page they fully own.

## 3. Scope
### In (v0.1)
- One landing page with sections in this order: **Hero → Problem/Outcome → Demo → How it works → Founder note → Early-bird pricing → FAQ → Final CTA → Footer**
- `positioning.md` brief + typed landing content (YAML) + schema validation
- **Copy lint** (§5) wired into `npm run build`, with tests
- Waitlist form (works without JS), thanks page, privacy + terms templates, 404
- SEO basics: meta/OG/Twitter tags, canonical, sitemap, robots.txt, JSON-LD (Organization + SoftwareApplication)
- Light/dark theme (system default + toggle), responsive, accessible
- AI layer: `.claude/commands/write-copy.md`, `AGENTS.md`, `prompts/write-copy.md`
- README, docs, MIT LICENSE, CHANGELOG
- Cloudflare-ready static output (`_headers` file)

### Out (do not build)
Blog, changelog pages, docs site, alternatives/vs pages, i18n, CMS, multiple style presets, analytics adapters, A/B testing, auth, payments, React/Vue islands.

---

## 4. Content model

### 4.1 `src/site.config.ts`
```ts
export type Mode = 'launch' | 'growth'; // Lite only supports 'launch'
export const site = {
  name: 'Shipnote',
  tagline: 'Changelog that lives inside your app',
  url: 'https://example.com',            // used for canonical + sitemap
  mode: 'launch' as Mode,
  locale: 'en',
  theme: { default: 'system' as 'system' | 'light' | 'dark' },
  brand: { accent: '#0F766E', accentDark: '#2DD4BF', radius: '8px' },
  links: { x: '', github: '', email: 'hello@example.com' },
  waitlist: {
    endpoint: import.meta.env.PUBLIC_WAITLIST_ENDPOINT ?? '',
    accessKey: import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '',  // optional; Web3Forms keys are public by design
    successPath: '/waitlist/thanks',
  },
  legal: { companyName: 'Shipnote (fictional demo)', contactEmail: 'hello@example.com', lastUpdated: '2026-09-16' },
  demoNotice: true, // shows "Demo content: Shipnote is a fictional product" in footer
  showAttribution: true, // footer "Built with Launchfold" link (PRD F13)
} as const;
```
Keep exact field names; types may be refined.

### 4.2 Landing sections: `src/content/landing/<section>.yaml`
Validate with Zod. Use Astro content collections if the installed version supports typed single-object YAML cleanly; otherwise load with the `yaml` package (pre-approved dependency) in `src/lib/landing.ts` and validate with Zod. Invalid content **must fail the build** with a readable message naming file + field.

| File | Schema |
|---|---|
| `hero.yaml` | `eyebrow?: string(max 40)`, `audience: string`, `pain: string`, `outcome: string`, `headline: string`, `subheadline: string`, `primaryCta: {label: string, href: string}`, `secondaryCta?: {label, href}`, `proof: {type: 'waitlistCount' \| 'metric' \| 'quote' \| 'founder' \| 'none-yet', text?: string}`, `visual: {type: 'screenshot' \| 'video' \| 'embed', src: string, alt: string, caption?: string}` |
| `problem.yaml` | `heading: string`, `pains: string[2..4]`, `outcomes: string[2..4]` |
| `demo.yaml` | `heading: string`, `subheading?: string`, `media: {type: 'screenshot' \| 'video' \| 'embed', src, alt, caption?, poster?}` |
| `how-it-works.yaml` | `heading: string`, `steps: [{title, description}]` exactly 3 |
| `founder.yaml` | `heading: string`, `name: string`, `role: string`, `photo?: string`, `note: string(max 400)`, `links?: [{label, href}]` |
| `pricing.yaml` | `hidden?: boolean`, `hiddenReason?: string`, `heading: string`, `plan: {name, earlyBirdPrice: number, regularPrice: number, currency: string, period: 'month' \| 'year' \| 'once', perks: string[3..6]}`, `scarcity: {type: 'spots' \| 'date', value: string}`, `note?: string` |
| `faq.yaml` | `heading: string`, `items: [{question, answer, objection: 'price' \| 'trust' \| 'effort' \| 'fit' \| 'switching' \| 'other'}]` min 3 |
| `cta.yaml` | `heading: string`, `subheading?: string`, `button: {label: string}`, `urgency: {type: 'spots' \| 'date', value: string}`, `reassurance: string` |

`hero.audience`, `hero.pain`, `hero.outcome` are **not rendered as-is**. They exist so the author (and the lint) must state them. `audience` may be shown as the eyebrow if `eyebrow` is empty.

---

## 5. Copy lint spec: `scripts/copy-lint.mjs`
Reads `positioning.md` and `src/content/landing/*.yaml`. Rule lists live in `scripts/copy-lint.rules.mjs`.

**Output format:**
```
copy-lint: 1 error, 2 warnings
ERROR E004 landing/cta.yaml › button.label: "Submit" is generic. Say what they get, e.g. "Join the beta".
WARN  W101 landing/hero.yaml › subheadline: "seamless" is filler. Name the concrete result instead.
```
Exit code 1 on any error. `--strict` also exits 1 on warnings. `--json` prints machine-readable output (used by `/write-copy`).

| ID | Severity | Rule |
|---|---|---|
| E001 | error | Placeholder text anywhere: `lorem`, `ipsum`, `TODO`, `TBD`, `Your Product`, `Company Name`, `xxx`, `[insert` (case-insensitive) |
| E002 | error | Required section file missing: hero, problem, faq, cta, pricing. Pricing may set `hidden: true` only with `hiddenReason` ≥ 20 chars |
| E003 | error | `hero.headline` > 90 characters |
| E004 | error | Generic CTA label: `Submit`, `Click here`, `Learn more`, `Send`, `OK` (for `hero.primaryCta.label`, `cta.button.label`) |
| E005 | error | FAQ has fewer than 3 items |
| E006 | error | `hero.proof.type` is `none-yet` and `founder.yaml` is missing |
| W001 | warn | `hero.headline` > 70 characters |
| W002 | warn | Weak CTA label: `Get started`, `Sign up`, `Subscribe`, `Join` (alone). Suggest stating the benefit |
| W101 | warn | Filler words: revolutionary, next-gen, next-generation, cutting-edge, all-in-one, seamless, seamlessly, game-changer, game-changing, leverage, synergy, unlock, supercharge, empower, world-class, best-in-class, innovative, robust, powerful, effortless, state-of-the-art, disrupt |
| W102 | warn | Across all landing copy, count of `we/our/us` > count of `you/your` (egocentric copy) |
| W103 | warn | `problem.outcomes` item that is < 15 chars or repeats a `pains` item |
| W104 | warn | `hero.subheadline` > 160 characters |
| W105 | warn | More than 1 exclamation mark in a single section |
| W106 | warn | `positioning.md` has an empty required heading: Audience, Painful moment, Outcome, Proof, Alternatives, Objections, Offer |
| W107 | warn | `hero.headline` contains none of the meaningful words (≥ 4 letters) from `hero.outcome` or `hero.pain` |

Tests: `scripts/copy-lint.test.mjs` using `node:test`, with fixtures in `scripts/fixtures/<rule-id>/pass` and `/fail` for **every** rule.

---

## 6. Steps: copy-paste prompts

### Step 1: Structure & config (≈2 h)
**Implements (PRD.md):** F1 · NFR-10. Start the prompt with: "Also read PRD.md F1 and verify their acceptance criteria."
**Prompt:**
> Read CLAUDE.md and BUILD_BRIEF.md §3–4. Do Step 1 only: create the folder structure from CLAUDE.md, `src/site.config.ts` exactly per §4.1, a minimal `src/layouts/Base.astro` (html lang, meta charset/viewport, title from config, global CSS import), and confirm Tailwind v4 is wired through one global CSS file. Update package.json scripts: `dev`, `lint:copy` (temporary script that prints "copy-lint: not implemented" and exits 0), `build` = `npm run lint:copy && astro build`, `test` = `node --test scripts/`. Make `src/pages/index.astro` show `site.name` and `site.tagline`. Run `npm run build` and report.

**Done when:** build passes · index shows name + tagline from config · no extra dependencies added.

### Step 2: Positioning brief, schemas, demo content (≈3 h)
**Implements (PRD.md):** F2, F3 · PRD §6 copy rules. Start the prompt with: "Also read PRD.md F2, F3 and verify their acceptance criteria."
**Prompt:**
> Read BUILD_BRIEF.md §4 and §8. Do Step 2 only: create `positioning.md` using the template and Shipnote answers in §8; create all landing YAML files in `src/content/landing/` with the Shipnote copy from §8; implement Zod schemas and a typed loader per §4.2 (the `yaml` package is pre-approved). Temporarily render each section's heading on the index page to prove data loads. Invalid content must fail the build with file + field in the message. Run `npm run build`, then show me the error you get after temporarily deleting `outcome` from hero.yaml (restore it afterwards).

**Done when:** all sections load typed · deleting a required field fails the build with a readable error.

### Step 3: Copy lint (≈4 h). This is the differentiator; take care
**Implements (PRD.md):** F4 · FR-1.6 (Should). Start the prompt with: "Also read PRD.md F4 and verify their acceptance criteria."
**Prompt:**
> Read BUILD_BRIEF.md §5. Do Step 3 only: implement `scripts/copy-lint.mjs` and `scripts/copy-lint.rules.mjs` exactly per the spec (all rule IDs, messages naming file › field, `--strict`, `--json`, exit codes). Write `scripts/copy-lint.test.mjs` with pass/fail fixtures for every rule. Replace the temporary `lint:copy` script. Fix any Shipnote demo copy that triggers errors or warnings by editing content, not rules. Run `npm test` and `npm run build` and report both.

**Done when:**
- `npm test` passes.
- `npm run build` shows 0 errors and 0 warnings.
- Manual check:
  - Change the CTA to "Submit" → build fails with E004.
  - Add "revolutionary" → W101 warning.
  - `npm run lint:copy -- --strict` fails on that warning.

### Step 4: Design system + sections (≈10–14 h). Use plan mode (Shift+Tab) first
**Implements (PRD.md):** F5, F6, F13 · NFR-3, NFR-5, NFR-7. Start the prompt with: "Also read PRD.md F5, F6, F13 and verify their acceptance criteria."
**Prompt:**
> Read BUILD_BRIEF.md §3, §4.2 and §7. Plan first, then do Step 4: build design tokens in the global CSS (Tailwind v4 `@theme`, light + dark via CSS variables, accent from site.config), UI primitives (Container, Button, Badge, SectionHeading), and one component per section in `src/components/sections/` in the §3 order, plus Header (logo text, anchor nav, theme toggle, mobile nav) and Footer (links, legal, demo notice). Compose them on the index page. Mobile-first; test widths 375/768/1280. Only inline scripts for theme toggle (persist choice; no flash of wrong theme) and mobile nav. Use `astro:assets` for images; put a placeholder product screenshot in `src/assets/` (a simple generated SVG/PNG frame is fine, labeled as demo). Run `npm run build` and list components created.

**Done when:**
- It looks intentional at 375, 768 and 1280 px in light and dark.
- Keyboard navigation works with visible focus.
- `dist/` contains no JS bundles beyond the small inline scripts.
- Lighthouse mobile ≥ 95 (human checks).

### Step 5: Waitlist, legal, 404 (≈3 h)
**Implements (PRD.md):** F7, F8. Start the prompt with: "Also read PRD.md F7, F8 and verify their acceptance criteria."
**Prompt:**
> Do Step 5 only:
> - **Waitlist form** (hero + final CTA): a plain HTML `<form method="POST">` to `site.waitlist.endpoint`. Include the optional Web3Forms `access_key` hidden field, a `redirect` hidden field to the absolute thanks URL, a honeypot field, an email input with label, and an accessible success/error path. It must work with JS disabled. If `endpoint` is empty in dev, render the form disabled with a visible note telling the developer to set `PUBLIC_WAITLIST_ENDPOINT`. In a production build, an empty endpoint must fail the build unless `LAUNCHFOLD_ALLOW_NO_WAITLIST=1` (PRD FR-7.4, FR-7.5).
> - **Pages:** `/waitlist/thanks`, `/privacy` and `/terms`, with generic templates using `site.legal` and a visible banner "Template, not legal advice. Review before publishing", plus a helpful `404`.
> - Add `.env.example`.
>
> Run `npm run build`.

**Done when:** form posts to a real Web3Forms endpoint in a deploy preview · works with JS disabled · legal pages show the banner.

### Step 6: SEO (≈2 h)
**Implements (PRD.md):** F9. Start the prompt with: "Also read PRD.md F9 and verify their acceptance criteria."
**Prompt:**
> Do Step 6 only: add an SEO component in Base.astro (title template, description, canonical, Open Graph + Twitter tags using `/og.png`, theme-color for both schemes), `@astrojs/sitemap` (pre-approved; add via `npx astro add sitemap --yes`), `public/robots.txt` pointing to the sitemap, and JSON-LD for Organization and SoftwareApplication (include `offers` from pricing.yaml unless hidden). Add a placeholder `public/og.png` note in README TODO. Person B will design the real 1200×630 image. Run `npm run build` and show the rendered `<head>` of index.html.

**Done when:** head tags correct · JSON-LD validates in Google's Rich Results Test (human checks after deploy) · sitemap generated.

### Step 7: AI layer (≈2 h)
**Implements (PRD.md):** F10. Start the prompt with: "Also read PRD.md F10 and verify their acceptance criteria."
**Prompt:**
> Do Step 7 only:
> - **`.claude/commands/write-copy.md`:** a Claude Code slash command that:
>   1. Reads `positioning.md`. If any required heading is empty, it asks the user those questions first.
>   2. Rewrites `src/content/landing/*.yaml` following the §4.2 schemas.
>   3. Runs `npm run lint:copy -- --json` and fixes content until there are 0 errors and 0 warnings, never editing lint rules.
>   4. Summarizes the changes.
> - **`AGENTS.md`:** the same workflow for other agents, plus repo rules from CLAUDE.md that apply to buyers.
> - **`prompts/write-copy.md`:** a standalone prompt for chat assistants.
>
> Test `/write-copy` mentally against the Shipnote brief and report any gaps.

**Done when:** a fresh Claude Code session can run `/write-copy` and end with a clean lint.

### Step 8: README & docs (≈2 h)
**Implements (PRD.md):** F11. Start the prompt with: "Also read PRD.md F11 and verify their acceptance criteria."
**Prompt:**
> Do Step 8 only:
> - **README.md:** one-line pitch; a "Why positioning-first" section of 3 sentences; a GIF placeholder showing lint failing then passing; features; a 5-minute quick start (clone → edit positioning.md → `/write-copy` → `npm run build` → deploy); a copy lint rules table; a Lite vs Pro table with Pro marked "coming soon" (link placeholder); a fictional demo notice; license.
> - **Docs:** `docs/copy-lint.md`, `docs/deploy.md` (Cloudflare first, then Netlify; note that Vercel Hobby is non-commercial only).
> - **Also:** `LICENSE` (MIT, holder left as `<COPYRIGHT HOLDER>` for humans to fill) and `CHANGELOG.md` with 0.1.0.
>
> Keep it scannable.

**Done when:** a stranger could deploy in under 15 minutes following README only.

### Step 9: QA & deploy prep (≈3 h)
**Implements (PRD.md):** F12 · NFR-1…NFR-12 · PRD §7 release criteria. Start the prompt with: "Also read PRD.md F12 and verify their acceptance criteria."
**Prompt:**
> Do Step 9 only: audit the built site for accessibility (landmarks, heading order, labels, contrast tokens in both themes, focus, reduced motion), performance (image sizes, font loading, no CLS), and correctness (all links, anchors, 404). Add `public/_headers` for Cloudflare with sensible security headers and long cache for hashed assets. Fix issues found. Run `npm test` and `npm run build`. Give me a short checklist of what I must verify manually in the browser and Lighthouse.

**Done when:** all items in START_HERE.md "Final checklist" are ticked.

---

## 7. Design direction
- **Feel:** calm, technical, credible. It should read like a product built by engineers who respect the reader. The page sells a *product*, so product visuals get the most space.
- **Tokens (light / dark):**
  - bg `#F7F8FA` / `#0B0D10`
  - surface `#FFFFFF` / `#12151A`
  - fg `#0E1116` / `#E8EBEF`
  - muted `#5A6473` / `#9AA4B2`
  - border `#E3E6EB` / `#232830`
  - accent from config (`#0F766E` / `#2DD4BF`)
  - radius 8px
- **Type:** system UI stack for body and headings (headings weight ~650, slightly tight tracking); monospace for eyebrows/labels/prices. No web font in Lite.
- **Layout:** max width ~1120px, generous section spacing via `clamp()`, 1 column on mobile, 2-column hero on ≥ 1024px (copy left, product visual right).
- **Avoid:** gradient blobs, glassmorphism, fake "trusted by" logos, emoji icons, stock illustrations, centered-everything layouts, animated counters.
- **Motion:** subtle hover/focus transitions only; disabled under `prefers-reduced-motion`.

---

## 8. Demo positioning: "Shipnote" (fictional)
Use this for `positioning.md` and the landing YAML. Refine wording so lint passes. Don't add real company names.

### `positioning.md` template (fill headings exactly)
```md
# Positioning brief

## Product
Shipnote: an embeddable "what's new" changelog widget for indie SaaS apps.

## Audience
Solo and two-person SaaS founders who ship updates every week.

## Painful moment
A user cancels and says "it didn't have X", but X shipped three weeks ago. Release notes sit on a page nobody visits.

## Outcome
Every release reaches active users inside the app, so the work you ship turns into retention instead of silence.

## Proof
Built by a founder who needed it for their own SaaS. 212 founders on the waitlist (demo number).

## Alternatives
A changelog page nobody visits; tweets your users never see; big feedback suites priced for teams.

## Objections
- Will it slow down my app?
- I don't have time to write release notes.
- What happens to the price after beta?
- Does it work with my stack?

## Offer
Early-bird: $5/month locked for life for the first 100 founders (regular $12/month).
```

### Suggested landing copy (starting point)
- **Hero headline:** "Turn every release into a reason to stay"
- **Subheadline:** "Shipnote shows your changelog inside your app, so the features you ship this week reach the users who would otherwise cancel."
- **Primary CTA:** "Join the early-bird list" · **Proof:** waitlistCount, "212 founders already on the list (demo)"
- **Pains:** "Release notes live on a page nobody opens" · "Users cancel over features you already shipped" · "Writing announcements eats your shipping day"
- **Outcomes:** "Updates appear where your users already work" · "Fewer cancellations over missing features" · "Write once in markdown, publish everywhere in one click"
- **How it works:**
  1. "Add one script tag"
  2. "Write the update in markdown"
  3. "Users see it next time they open your app"
- **Founder note:** Alex Rivera, founder (fictional), ≤ 400 chars about shipping features nobody noticed
- **Pricing:** Early-bird plan $5/month (regular $12). Scarcity: spots, "First 100 founders". Perks:
  - Unlimited updates
  - Custom brand colors
  - Email digest for inactive users
  - Price locked for life
- **FAQ:** answer the 4 objections (tag each objection type)
- **Final CTA:** heading "Your next release deserves an audience" · button "Reserve my early-bird spot" · urgency spots "First 100 founders" · reassurance "One email at launch. No spam, unsubscribe anytime."
