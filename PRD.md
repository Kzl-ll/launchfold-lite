# PRD.md — Launchfold Lite v0.1
**Product Requirements Document** · Status: Approved for build · Last updated: 2026-09-16

> **How to use this file (for Claude Code):**
> - `PRD.md` defines **what** to build and **why**, with testable acceptance criteria.
> - `BUILD_BRIEF.md` defines **how** and **in which order** (schemas, lint spec, step prompts).
> - `CLAUDE.md` defines repo rules.
> - If PRD and BUILD_BRIEF conflict, **PRD wins**. If something is ambiguous, **ask before building**.
> - Requirement IDs (`FR-…`, `NFR-…`, `US-…`) are referenced in commits and step reports.
> - Priority uses MoSCoW: **Must** = required for v0.1; **Should** = do if time allows in the same step; **Could** = later.

---

## 1. Overview

### 1.1 Problem
Technical founders launching a SaaS or AI tool need a waitlist landing page. Existing templates solve *design* (sections, dark mode, Lighthouse 100) but not *what to say*. In our research, 16 of 31 founder complaints (52%) were about unclear value propositions, egocentric copy, missing proof, missing demo/pricing, and no urgency. Founders also lose days redesigning pages instead of talking to users.

### 1.2 Solution
**Launchfold Lite** is a free, MIT-licensed Astro kit that produces a fast, credible waitlist landing page **from a positioning brief**:
1. The founder fills `positioning.md` (audience, pain, outcome, proof, alternatives, objections, offer).
2. Copy lives in typed content files whose schemas force conversion essentials.
3. A **copy lint** blocks the build when copy is filler, egocentric or missing essentials.
4. An AI command (`/write-copy`) writes and fixes copy from the brief until the lint passes.
5. The site deploys as static files to free hosting.

### 1.3 Goals (v0.1)
| # | Goal | Measure |
|---|---|---|
| G1 | A founder can go from clone to deployed waitlist page quickly | ≤ 60 min with `/write-copy`; ≤ 15 min to deploy following README |
| G2 | Generated pages avoid the common copy failures | 0 lint errors required to build; demo passes `--strict` |
| G3 | Pages are fast and accessible by default | Lighthouse mobile ≥ 95 on all four categories |
| G4 | Lite works as marketing for Launchfold | "Built with Launchfold" attribution (removable); README links Pro waitlist |

### 1.4 Business goals (context only; not code requirements)
Week 8 after public launch: ≥ 100 GitHub stars or ≥ 300 demo visitors/week, and ≥ 5 Pro presales. Lite also serves as the portfolio and the engine for client spec work.

### 1.5 Non-goals
Lite is not a CMS, blog, docs site, multi-page marketing site, or app boilerplate. See §8.

---

## 2. Personas

### P1: "Dana", the technical founder (primary user of the kit)
- Solo or two-person team building a SaaS/AI tool; comfortable with Git, npm and a code editor; uses Claude Code or Cursor.
- No designer or copywriter. Launching in 2–8 weeks and needs a waitlist now.
- **Wants:** a page that looks credible, explains the product in 5 seconds, collects emails, costs $0 to host, and that she owns.
- **Frustrations:** spends days on UI; copy feels "salesy and egocentric"; no social proof before launch; builders like Framer/Webflow cost money per site and lock her in.

### P2: "Visitor", the founder's prospective customer (end user of the generated page)
- Arrives from X, Reddit, Product Hunt, Hacker News or a DM, often on mobile, with little patience.
- **Wants to know within 5 seconds:** is this for me, what problem it solves, what I get, and whether it's legit.
- **Converts if:** the problem matches theirs, they can see the product, there is some proof, price is clear, objections are answered, and joining is easy and low-risk.

### P3: "Agent", an AI coding assistant working on Dana's behalf
- Claude Code, Cursor or Codex editing the repo on instruction.
- **Needs:** explicit rules (`CLAUDE.md`, `AGENTS.md`), typed schemas, machine-readable lint output (`--json`), and a slash command workflow.

### P4: "Maintainer", the Launchfold team
- **Needs:** small, readable codebase; minimal dependencies; clear upgrade path to Pro (separate repo); no support burden from fragile features.

---

## 3. User journeys

### J1: Dana sets up a page (P1 + P3)
1. Finds Launchfold Lite on GitHub → reads README → clicks demo.
2. Clones repo → `npm install` → `npm run dev` → sees Shipnote demo page.
3. Opens `positioning.md` → replaces Shipnote answers with her product.
4. Runs `/write-copy` in Claude Code → agent asks about any missing answers → rewrites `src/content/landing/*.yaml` → runs lint → fixes until clean.
5. Edits `src/site.config.ts` (name, URL, accent color, links) → replaces demo screenshot → turns off demo notice.
6. Creates a free Web3Forms key → sets env vars → `npm run build` passes.
7. Connects repo to Cloudflare → deploys → shares link.

### J2: Visitor evaluates and joins (P2)
1. Lands on page (mobile) → reads headline + subheadline → recognizes their problem.
2. Sees proof line and product visual → scrolls to Before/After → Demo → How it works.
3. Reads founder note (trust) → sees early-bird price and scarcity.
4. Opens 1–2 FAQ answers → enters email in final CTA → submits.
5. Lands on thanks page → understands what happens next → optionally shares.

### J3: Dana's copy gets blocked (P1)
1. Dana writes CTA "Submit" and headline "The revolutionary all-in-one platform".
2. `npm run build` fails: `ERROR E004 … "Submit" is generic` plus warnings for filler words.
3. Dana (or `/write-copy`) fixes content → build passes.

---

## 4. Features and user stories

### Feature map
| ID | Feature | Priority | Build step |
|---|---|---|---|
| F1 | Project setup & site configuration | Must | 1 |
| F2 | Positioning brief | Must | 2 |
| F3 | Typed landing content & validation | Must | 2 |
| F4 | Copy lint | Must | 3 |
| F5 | Landing page sections | Must | 4 |
| F6 | Theming & design tokens | Must | 4 |
| F7 | Waitlist capture | Must | 5 |
| F8 | Legal & utility pages | Must | 5 |
| F9 | SEO & social sharing | Must | 6 |
| F10 | AI assistant layer | Must | 7 |
| F11 | Documentation & onboarding | Must | 8 |
| F12 | Deployment & security headers | Must | 9 |
| F13 | Launchfold attribution & Pro hooks | Should | 4, 8 |

---

### F1: Project setup & site configuration
**US-1.1 (Must):** As Dana, I want one config file for global settings so that I can rebrand without touching components.
- **FR-1.1** `src/site.config.ts` exports a typed `site` object with fields defined in BUILD_BRIEF §4.1.
- **FR-1.2** `mode` accepts only `'launch'` in Lite. The type union reserves `'growth'` for Pro; setting `'growth'` fails type-check or build with the message "Growth mode is available in Launchfold Pro."
- **FR-1.3** `brand.accent` and `brand.accentDark` must be 6-digit hex; invalid values fail the build with a readable message.
- **FR-1.4** `site.url` is used for canonical URLs, sitemap and absolute redirect URLs.
- **FR-1.5** npm scripts exist: `dev`, `build` (runs copy lint first), `lint:copy`, `test`, `preview`.
- **Acceptance:**
  - Given I change `site.name` to "Acme Notes", when I run `npm run dev`, then the header, footer, title tag and JSON-LD all show "Acme Notes".
  - Given `brand.accent` is `"teal"`, when I build, then the build fails naming `brand.accent`.

**US-1.2 (Should):** As Dana, I want a warning if my accent color is unreadable so that buttons stay accessible.
- **FR-1.6** Build warns if white text on `brand.accent` has contrast < 4.5:1, or if `brand.accentDark` on dark background < 4.5:1.

---

### F2: Positioning brief
**US-2.1 (Must):** As Dana, I want a guided brief that makes me think through positioning before writing copy, so that my page speaks to a specific person and pain.
- **FR-2.1** `positioning.md` exists at the repo root with exactly these H2 headings: Product, Audience, Painful moment, Outcome, Proof, Alternatives, Objections, Offer.
- **FR-2.2** Each heading has a one-line HTML comment under it explaining what a good answer looks like, with one weak and one strong example (e.g. Audience: weak "everyone who uses software" / strong "solo SaaS founders shipping weekly").
- **FR-2.3** Ships pre-filled with the fictional Shipnote answers (BUILD_BRIEF §8).
- **Acceptance:** Given a heading is empty, when copy lint runs, then W106 names the empty heading.

---

### F3: Typed landing content & validation
**US-3.1 (Must):** As Dana, I want each page section's copy in its own simple file so that I can edit words without reading component code.
- **FR-3.1** One YAML file per section in `src/content/landing/`: hero, problem, demo, how-it-works, founder, pricing, faq, cta.
- **FR-3.2** Every file is validated with Zod schemas per BUILD_BRIEF §4.2, including min/max counts (e.g. exactly 3 steps, 2–4 pains, ≥ 3 FAQ items).
- **FR-3.3** Validation errors fail the build and name file, field path and expected type/limit.
- **FR-3.4** `founder.yaml` is optional **unless** `hero.proof.type` is `none-yet`. `demo.yaml` is optional; if missing, the Demo section and nav link are not rendered.
- **FR-3.5** `pricing.yaml` with `hidden: true` removes the Pricing section and nav link, and requires `hiddenReason`.
- **Acceptance:**
  - Given I delete `outcome` from hero.yaml, when I build, then it fails with a message containing `hero.yaml` and `outcome`.
  - Given how-it-works.yaml has 4 steps, when I build, then it fails saying exactly 3 are required.

---

### F4: Copy lint (core differentiator)
**US-4.1 (Must):** As Dana, I want the build to stop me from shipping filler or incomplete copy so that my page avoids the mistakes that kill conversions.
**US-4.2 (Must):** As an Agent, I want machine-readable lint results so that I can fix copy automatically.
- **FR-4.1** Implements all rules E001–E006 and W001–W107 exactly as specified in BUILD_BRIEF §5.
- **FR-4.2** Each finding prints severity, rule ID, file › field path, the offending text (truncated to 60 chars), and a **specific fix suggestion**.
- **FR-4.3** Exit code 1 on any error; `--strict` also fails on warnings; `--json` outputs `{errors: [], warnings: [], summary: {errors, warnings}}`.
- **FR-4.4** `npm run build` runs lint before `astro build`, and errors stop the build.
- **FR-4.5** Rule word lists live in `scripts/copy-lint.rules.mjs` so maintainers can extend them. Buyers can add words via an optional `copylint.config.json` (`extraFillerWords: string[]`, `ignoreRules: string[]`). Ignored rules are printed as "ignored" in the summary so nothing is silently hidden.
- **FR-4.6** Every rule has a passing and a failing fixture test.
- **FR-4.7** Lint runs in < 1 second on the demo content.
- **Acceptance:**
  - Given `cta.button.label` is "Submit", when I run `npm run build`, then the build fails with E004 and a suggestion like "Say what they get, e.g. 'Join the beta'."
  - Given the subheadline contains "seamless", when I run `npm run lint:copy`, then W101 is shown and exit code is 0; with `--strict` exit code is 1.
  - Given demo content, when I run `npm run lint:copy -- --strict`, then there are 0 errors and 0 warnings.

---

### F5: Landing page sections
**US-5.1 (Must):** As a Visitor, I want to understand what the product is and who it's for within 5 seconds so that I can decide whether to keep reading.
**US-5.2 (Must):** As a Visitor, I want to see the product and some proof so that I trust it's real.
**US-5.3 (Must):** As a Visitor, I want price and objections answered so that joining feels low-risk.
**US-5.4 (Must):** As Dana, I want sections to render only from content so that removing optional content cleanly removes the section.

Section order is fixed: Header → Hero → Problem/Outcome → Demo → How it works → Founder → Pricing → FAQ → Final CTA → Footer.

| ID | Section | Requirements |
|---|---|---|
| FR-5.1 | **Header** | Text logo from `site.name`, linking to top. Anchor nav generated from rendered sections (Demo, How it works, Pricing, FAQ). Primary button linking to `#waitlist`. Theme toggle. On < 768px, nav collapses into an accessible menu button (`aria-expanded`, Esc closes, focus returns to button). Skip link "Skip to content" as first focusable element. |
| FR-5.2 | **Hero** | Optional eyebrow (falls back to `audience`). Single `<h1>` = headline. Subheadline paragraph. Inline waitlist form (F7) using `primaryCta.label` as button text. Proof line under the form, rendered according to `proof.type` (`none-yet` renders nothing). Optional secondary CTA (link style, e.g. to `#demo`). Visual (screenshot/video/embed) on the right at ≥ 1024px and below text on mobile. The visual is the LCP candidate, so it loads eagerly with explicit dimensions. |
| FR-5.3 | **Problem/Outcome** | Heading + two lists side by side (stacked on mobile), labelled "Without {site.name}" and "With {site.name}" (labels overridable in YAML). Inline SVG icons with `aria-hidden`. |
| FR-5.4 | **Demo** | Heading, optional subheading. Screenshot: framed in a simple browser chrome, `astro:assets` optimized. Video: `<video controls muted playsinline preload="metadata" poster>`, never autoplay. Embed: lazy `<iframe>` with `title`. Optional caption as `<figcaption>`. |
| FR-5.5 | **How it works** | Heading + exactly 3 ordered steps (`<ol>`) with visible step numbers, title and description. |
| FR-5.6 | **Founder note** | Heading, photo (optional; fallback: initials avatar generated from name), name, role, note (≤ 400 chars), optional links. Rendered as a `<figure>`/`<blockquote>`-style card. |
| FR-5.7 | **Pricing** | One early-bird card: plan name, early-bird price (large, mono), regular price struck through with screen-reader text "Regular price {regular}/{period}", period label, perks list (3–6), scarcity badge (spots or date), button to `#waitlist`, optional note. Not rendered if `hidden: true`. |
| FR-5.8 | **FAQ** | Heading + items using native `<details>/<summary>` (no JS), all closed by default, keyboard operable. |
| FR-5.9 | **Final CTA** | Section `id="waitlist"`. Heading, optional subheading, waitlist form (F7) with `button.label`, urgency badge, reassurance text under the button. |
| FR-5.10 | **Footer** | `site.name` + tagline, social/email links (only non-empty ones), Privacy and Terms links, © current year. Demo notice "Demo content: {site.name} is a fictional product" when `demoNotice: true`. Attribution (F13). |

- **FR-5.11** No component contains hardcoded user-facing copy except neutral UI labels (e.g. "Menu", "Toggle theme", "Skip to content"), which live in `src/content/ui.yaml` so they can be translated later.
- **Acceptance:**
  - Given demo content, when a tester with no context views the hero on a 375px screen for 5 seconds, then they can state who it's for and what it does (manual 5-second test with 3 people).
  - Given I delete demo.yaml, when I build, then no Demo section or nav link exists and the build passes.
  - Given pricing.yaml has `hidden: true` and a valid reason, when I build, then no Pricing section or nav link exists.

---

### F6: Theming & design tokens
**US-6.1 (Must):** As a Visitor, I want the page to respect my light/dark preference so that it's comfortable to read.
**US-6.2 (Must):** As Dana, I want to change the look via tokens so that my page doesn't look like every other template.
- **FR-6.1** Colors, radius and spacing are CSS custom properties defined once (Tailwind v4 `@theme`), with light and dark values per BUILD_BRIEF §7.
- **FR-6.2** Default theme follows `site.theme.default` (`system` = `prefers-color-scheme`). The toggle cycles or switches light/dark, persists in `localStorage` (wrapped in try/catch), and applies before first paint (no flash).
- **FR-6.3** Accent colors come from `site.config` and are injected as CSS variables.
- **FR-6.4** All text/background token pairs meet WCAG AA in both themes.
- **FR-6.5** Motion is limited to hover/focus transitions ≤ 200ms and is disabled under `prefers-reduced-motion`.
- **Acceptance:** Given OS dark mode and no saved choice, when I load the page, then it renders dark with no light flash; toggling to light persists after reload.

---

### F7: Waitlist capture
**US-7.1 (Must):** As a Visitor, I want to join the waitlist with just my email so that it takes seconds.
**US-7.2 (Must):** As Dana, I want signups delivered to a free service without running a backend so that hosting stays $0.
- **FR-7.1** Plain HTML form: `method="POST"`, `action = site.waitlist.endpoint`. Fields:
  - email (`type="email"`, `required`, `autocomplete="email"`, visible label, or visually hidden label with placeholder not used as the only label)
  - hidden `access_key` (if configured)
  - hidden `redirect` = absolute URL of `/waitlist/thanks`
  - hidden `source` = `hero` or `cta`
  - honeypot field hidden from users and assistive tech
- **FR-7.2** Works with JavaScript disabled.
- **FR-7.3** Two instances (hero, final CTA) have unique input IDs.
- **FR-7.4** Dev behavior: if `endpoint` is empty in `npm run dev`, the form renders disabled with a visible developer note: "Set PUBLIC_WAITLIST_ENDPOINT to enable signups."
- **FR-7.5** Production behavior: `npm run build` **fails** if `endpoint` is empty, with a clear message, unless env `LAUNCHFOLD_ALLOW_NO_WAITLIST=1` is set (then forms render as a "Waitlist opens soon" note).
- **FR-7.6** `/waitlist/thanks` page:
  - confirms signup
  - states what happens next (from `cta.reassurance`)
  - offers a share link (static X/Twitter intent URL with `site.url`)
  - links back home
  - is `noindex`
- **FR-7.7** `.env.example` documents `PUBLIC_WAITLIST_ENDPOINT` and `PUBLIC_WEB3FORMS_KEY`.
- **Acceptance:**
  - Given a valid Web3Forms endpoint and key on a deploy preview, when I submit an email with JS disabled, then the email arrives in the Web3Forms inbox and I land on `/waitlist/thanks`.
  - Given an empty endpoint, when I run `npm run build`, then it fails with the message naming `PUBLIC_WAITLIST_ENDPOINT`.

---

### F8: Legal & utility pages
**US-8.1 (Must):** As Dana, I want starter privacy and terms pages so that I'm not launching with none.
- **FR-8.1** `/privacy` and `/terms`:
  - generated from `site.legal`
  - plain language
  - a visible banner: "Template, not legal advice. Review before publishing."
  - the privacy page states that email is collected via the configured form provider and that no analytics or cookies are used by default
- **FR-8.2** `404` page with a short message and a link home, `noindex`.
- **Acceptance:** Given the demo, when I open `/privacy`, `/terms`, `/does-not-exist`, then each renders in both themes with header and footer.

---

### F9: SEO & social sharing
**US-9.1 (Must):** As Dana, I want correct SEO and share previews so that links look professional on X, LinkedIn and Slack.
- **FR-9.1** Every page has title (`{page} · {site.name}`; home = `{site.name}: {site.tagline}`), meta description (≤ 160 chars, from hero subheadline on home), canonical, Open Graph (title, description, url, image, type) and Twitter card `summary_large_image`.
- **FR-9.2** `public/og.png` 1200×630 (placeholder OK in v0.1; README TODO to replace).
- **FR-9.3** `@astrojs/sitemap` generates sitemap excluding `/waitlist/thanks` and 404. `robots.txt` references it.
- **FR-9.4** JSON-LD: `Organization` (name, url, logo if present, sameAs links) and `SoftwareApplication` (name, description, applicationCategory `BusinessApplication`, `offers` from pricing unless hidden).
- **FR-9.5** Semantic HTML: one `<h1>`, sequential headings, landmarks (`header`, `main`, `footer`, `nav`).
- **Acceptance:** Given the built `dist/index.html`, then it contains exactly one `<h1>`, a canonical link, og:image, and two valid JSON-LD blocks (checked in Google Rich Results Test after deploy).

---

### F10: AI assistant layer
**US-10.1 (Must):** As Dana using Claude Code, I want one command that writes my landing copy from my brief so that I don't have to be a copywriter.
**US-10.2 (Must):** As an Agent (non-Claude), I want the same workflow documented so that Cursor/Codex users get the same result.
- **FR-10.1** `.claude/commands/write-copy.md` instructs the agent to:
  1. Read `positioning.md`, `BUILD_BRIEF §4.2` schema summary (copied into the command so buyers don't need BUILD_BRIEF) and current YAML.
  2. If any positioning heading is empty or vague (< 8 words), ask Dana up to 5 specific questions **before** writing.
  3. Rewrite all landing YAML following schemas and copy rules (§6).
  4. Run `npm run lint:copy -- --json`; fix content until 0 errors and 0 warnings; **never edit lint rules or config ignores**.
  5. Output a summary: headline chosen + 2 alternatives, and what changed per file.
- **FR-10.2** `AGENTS.md` contains the same workflow plus repo rules relevant to buyers.
- **FR-10.3** `prompts/write-copy.md`: a standalone prompt for chat assistants (paste brief → receive YAML).
- **FR-10.4 (Should)** `.claude/commands/check-copy.md`: runs lint and explains findings in plain language without editing.
- **Acceptance:** Given a fresh clone with a new positioning brief, when Dana runs `/write-copy` in Claude Code, then the session ends with `npm run lint:copy -- --strict` passing and no changes to `scripts/`.

---

### F11: Documentation & onboarding
**US-11.1 (Must):** As Dana, I want a README that gets me deployed fast so that I can evaluate the kit in one sitting.
- **FR-11.1** README sections:
  - one-line pitch
  - demo link
  - GIF placeholder (lint failing → passing)
  - "Why positioning-first" (3 sentences)
  - features
  - Quick start in ≤ 5 steps
  - customizing (config, content, tokens, images)
  - copy lint rules table
  - deploy summary
  - Lite vs Pro table (Pro "coming soon", link placeholder)
  - fictional demo notice
  - license
- **FR-11.2** `docs/copy-lint.md` (every rule with bad/good example), `docs/deploy.md` (Cloudflare first, Netlify, Vercel with non-commercial Hobby note), `docs/customize.md`.
- **FR-11.3** `LICENSE` (MIT, holder placeholder), `CHANGELOG.md` (0.1.0).
- **Acceptance:** Given a developer who has never seen the repo, when they follow README only, then they deploy a working page in ≤ 15 minutes (tested by Person B).

---

### F12: Deployment & security headers
**US-12.1 (Must):** As Dana, I want to deploy for free with safe defaults so that I don't have to research hosting.
- **FR-12.1** `astro build` produces fully static `dist/` deployable to Cloudflare, Netlify or Vercel without adapters.
- **FR-12.2** `public/_headers` (Cloudflare/Netlify format) sets:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` disabling camera/mic/geolocation
  - `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
  - long immutable cache for `/_astro/*`
- **FR-12.3 (Should)** A CSP that allows self, the inline theme/nav scripts (by hash or documented `'unsafe-inline'`), and `form-action` to the waitlist endpoint origin, documented in `docs/deploy.md`.
- **FR-12.4** `.env` is gitignored; no secrets are committed; only `PUBLIC_*` values reach the client.
- **Acceptance:** Given a Cloudflare deploy, when I inspect response headers of `/`, then the headers above are present and the form still submits.

---

### F13: Launchfold attribution & Pro hooks
**US-13.1 (Should):** As Maintainer, I want an unobtrusive "Built with Launchfold" link so that Lite spreads, while buyers can remove it.
- **FR-13.1** `site.showAttribution` (default `true`) renders a small footer link "Built with Launchfold" to the Launchfold URL (placeholder constant in `src/lib/launchfold.ts`).
- **FR-13.2** No Pro code, feature flags or upsell banners on the buyer's page. Pro is mentioned only in README/docs.
- **Acceptance:** Given `showAttribution: false`, then the link is absent.

---

## 5. Non-functional requirements

| ID | Category | Requirement | How to verify |
|---|---|---|---|
| NFR-1 | Performance | Lighthouse mobile ≥ 95 for Performance, Accessibility, Best Practices, SEO | Chrome DevTools Lighthouse on deploy preview |
| NFR-2 | Performance | LCP ≤ 2.0s and CLS < 0.05 (Lighthouse simulated mobile) | Lighthouse |
| NFR-3 | Performance | Client JS ≤ 2 KB total (theme + nav inline scripts), no framework runtime | Inspect `dist/` |
| NFR-4 | Performance | Home page transfer ≤ 300 KB on first load including hero image | DevTools Network |
| NFR-5 | Accessibility | WCAG 2.2 AA: contrast, focus visible, keyboard-only operation, skip link, labels, `lang`, reduced motion | Manual keyboard pass + Lighthouse + axe browser extension |
| NFR-6 | Compatibility | Node ≥ 22.12; latest 2 versions of Chrome, Firefox, Edge, Safari; iOS Safari 16+ | Manual spot check |
| NFR-7 | Responsiveness | No horizontal scroll or clipped text at 320, 375, 768, 1024, 1280, 1920px | Manual |
| NFR-8 | Privacy | No cookies, analytics or third-party scripts by default; only the form provider receives data | Inspect network requests |
| NFR-9 | Security | No secrets in repo; security headers per FR-12.2; honeypot on forms | Review + header check |
| NFR-10 | Maintainability | TypeScript strict with no `any`; components ≤ 150 lines; no hardcoded copy in components; dependencies limited to astro, tailwind, @astrojs/sitemap, yaml, zod (if not provided by astro) | Code review |
| NFR-11 | Developer experience | `npm run build` ≤ 30s on a typical laptop; no build warnings on demo content; clear error messages that name file + field | Run build |
| NFR-12 | Licensing | MIT; all bundled images/icons created by us or MIT/CC0 with attribution in `docs/credits.md`; no real brands or people | Review |

---

## 6. Copy & content rules (apply to demo content and `/write-copy`)
1. Write to the visitor ("you/your") more than about the company ("we/our").
2. Headline states the outcome or the pain in plain words, ≤ 70 characters.
3. Features are written as benefits: what changes for the visitor.
4. CTAs say what the visitor gets ("Reserve my early-bird spot"), never "Submit/Learn more".
5. Proof must be honest. Pre-launch proof can be a founder story, waitlist count or build-in-public progress. Never invent testimonials for a real product.
6. Every objection in `positioning.md` gets a FAQ answer.
7. No filler words from the lint list; no more than one exclamation mark per section.
8. Demo content must be clearly fictional (Shipnote, "demo number" labels).

---

## 7. Release criteria: v0.1 is done when
- [ ] All **Must** requirements above pass their acceptance criteria.
- [ ] `npm test` and `npm run build` pass; `npm run lint:copy -- --strict` passes on demo content.
- [ ] NFR-1 to NFR-9 verified on a Cloudflare deploy preview.
- [ ] A 5-second test with 3 people: at least 2 correctly say who Shipnote is for and what it does.
- [ ] A developer unfamiliar with the repo deploys using README only in ≤ 15 minutes.
- [ ] Repo is still private until the Week 4 public launch.

---

## 8. Out of scope for Lite (do not build)
Blog; changelog pages; docs site; `/alternatives` and `/vs` pages; use-case/integration pages; multiple pages beyond those listed; i18n routing; CMS (Keystatic etc.); multiple style presets; analytics adapters and cookie banner; A/B testing; auth, payments, dashboards; React/Vue/Svelte islands; animations libraries (GSAP, Lottie); `mode: 'growth'` behavior. These belong to **Launchfold Pro** (separate private repo).

---

## 9. Assumptions & open questions
| # | Item | Default until answered |
|---|---|---|
| A1 | Waitlist provider | Web3Forms (free tier) as documented default; any provider accepting HTML form POST works |
| A2 | Launchfold website URL for attribution | Placeholder constant `https://launchfold.dev` (update when domain is confirmed) |
| A3 | Demo product name "Shipnote" | Keep unless Person B finds a real product with that name |
| A4 | OG image | Placeholder until Person B designs 1200×630 PNG |
| A5 | Founder photo in demo | Initials avatar (no real person photos) |

---

## 10. Traceability: requirements → build steps
| Build step (BUILD_BRIEF §6) | Implements |
|---|---|
| Step 1: Structure & config | F1 (FR-1.1–1.5), NFR-10 |
| Step 2: Brief, schemas, demo content | F2, F3, §6 rules for demo content |
| Step 3: Copy lint | F4, FR-1.6 (Should) |
| Step 4: Design + sections | F5, F6, F13, NFR-3/5/7 |
| Step 5: Waitlist, legal, 404 | F7, F8 |
| Step 6: SEO | F9 |
| Step 7: AI layer | F10 |
| Step 8: Docs | F11 |
| Step 9: QA & deploy prep | F12, NFR-1–12, §7 release criteria |
