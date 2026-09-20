# Changelog

All notable changes to this project are documented in this file.

## [0.1.0] - 2026-09-17

Initial release.

- Positioning brief (`positioning.md`) and typed, Zod-validated landing content in `src/content/landing/*.yaml`.
- Copy lint (`scripts/copy-lint.mjs`) with rules E001–E006, W001–W002, W101–W107, `--strict`, `--json`, and a `copylint.config.json` extension point.
- Full landing page: Hero, Problem/Outcome, Demo, How it works, Founder, Pricing, FAQ, Final CTA, Header, Footer.
- Light/dark theme with system-preference fallback, WCAG AA contrast, visible focus states, `prefers-reduced-motion` support.
- Waitlist form (works without JS, honeypot, dev/production endpoint validation), `/waitlist/thanks`, `/privacy`, `/terms`, `404` pages.
- SEO: sitemap, robots.txt, Open Graph/Twitter tags, JSON-LD (Organization, SoftwareApplication).
- `/write-copy` and `/check-copy` Claude Code commands, `AGENTS.md`, and a standalone chat-assistant prompt.
- Docker-based dev/build/preview workflow (`Dockerfile`, `compose.yaml`).
