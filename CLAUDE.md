# CLAUDE.md — Launchfold Lite

## What this repo is
**Launchfold Lite** is a free (MIT), open-source Astro landing-page kit for SaaS & AI-tool founders **before launch** (waitlist stage).
Its differentiator is being **positioning-first**:
- Copy comes from a structured brief (`positioning.md`).
- Content schemas force conversion copy (audience → pain → outcome → proof).
- A **copy lint** runs before every build and fails on filler copy and missing essentials.

A paid Pro version exists in a separate private repo (`launchfold-pro`): it currently adds a premium motion/interaction layer on top of this same foundation; growth-mode features (blog, changelog, alternatives/vs pages, CMS) are still on its roadmap, not built yet. **Do not add Pro features here** — that includes the motion pack (marquee, custom cursor, magnetic buttons, mask-reveal, hover-lift beyond what already exists below, circle-follow links) and anything that would push this repo's inline JS past its ≤2KB budget.

Source documents (read the relevant parts before every step):
- `PRD.md`: **what** to build and **why**. Personas, features (F1–F13), user stories, functional requirements (FR-…), non-functional requirements (NFR-…), acceptance criteria, out of scope. **PRD wins on conflicts.**
- `BUILD_BRIEF.md`: **how** and **in what order**. Schemas, copy-lint spec, design tokens, demo content, and the step prompts.

Do only the step you are asked to do. When a step is finished, report which requirement IDs are satisfied and how you verified each acceptance criterion. If a requirement is ambiguous, ask before building.

## Stack
- Astro (latest installed, v7 at time of writing), static output, TypeScript strict
- Tailwind CSS v4 via the Vite plugin (already installed with `astro add tailwind`)
- Content from YAML/Markdown validated with Zod (Astro content collections or a typed loader)
- Node scripts in `scripts/` (ESM `.mjs`), tests with `node:test` (no extra test framework)
- Deploy target: Cloudflare (static `dist/`); must also work on Netlify/Vercel

## Hard rules
1. **Zero client JS by default.** Allowed islands: theme toggle and mobile nav only, written as small inline `<script>` blocks (no React/Vue/Svelte). The waitlist form must work without JS (progressive enhancement only).
2. **Minimal dependencies.** Before adding any npm package, state why and ask. Prefer Astro/Tailwind built-ins and small hand-written code.
3. **Verify APIs against the installed version.** Astro changes between majors. Check `node_modules/astro` types or docs.astro.build for the installed version instead of guessing. Never downgrade packages.
4. **No hardcoded copy in components.** All user-facing text comes from `src/content/` or `src/site.config.ts`. Components receive typed props.
5. **Accessibility:** semantic HTML, one `<h1>`, visible focus states, WCAG 2.2 AA contrast in both themes, `prefers-reduced-motion` respected, images need `alt`.
6. **Performance:** Lighthouse mobile ≥ 95 in all categories. Use `astro:assets` for images, no layout shift, system font stack or one self-hosted variable font.
7. **Demo content is fictional.** The sample product is "Shipnote" (a changelog widget for indie SaaS). Never use real company names, logos or testimonials from real people.
8. **Copy lint must pass.** `npm run build` runs `scripts/copy-lint.mjs` first. Never weaken or bypass lint rules to make a build pass. Fix the content instead. Lint rule changes need explicit approval.

## Structure (target)
```
positioning.md              # human-written brief; source of truth for copy
src/site.config.ts          # name, url, mode, brand, links, waitlist settings
src/content/landing/*.yaml  # one file per section (hero, problem, demo, ...)
src/content.config.ts       # Zod schemas for landing sections
src/components/sections/    # Hero.astro, Problem.astro, Demo.astro, ...
src/components/ui/          # Button, Container, Badge, ...
src/layouts/Base.astro      # head, SEO, theme
src/pages/                  # index, privacy, terms, 404, waitlist/thanks
scripts/copy-lint.mjs       # lint (+ scripts/copy-lint.test.mjs)
.claude/commands/           # buyer-facing slash commands (e.g. write-copy.md)
AGENTS.md                   # same guidance for non-Claude agents
```

## Commands
- `npm run dev`: local dev at http://localhost:4321
- `npm run lint:copy`: copy lint only (`--strict` turns warnings into errors)
- `npm run build`: copy lint + `astro build`
- `npm test`: `node --test scripts/`

## Working style
- Keep changes scoped to the current step. List files you changed at the end.
- After finishing, run `npm run build` (and `npm test` when scripts changed) and report results honestly, including failures.
- Prefer small components (< 150 lines). Name things by what users see.
- Don't write documentation files unless the step asks for them.
