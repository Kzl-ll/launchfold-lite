# Copy lint rules

`npm run lint:copy` reads `positioning.md` and every file in `src/content/landing/*.yaml` and checks them against the rules below. `npm run build` always runs it first — errors fail the build; warnings only fail the build with `npm run lint:copy -- --strict`.

Rule word lists live in `scripts/copy-lint.rules.mjs`. You can extend the filler-word list or silence specific rules via an optional `copylint.config.json` at the repo root:

```json
{
  "extraFillerWords": ["synergize", "frictionless"],
  "ignoreRules": ["W105"]
}
```

Ignored rules still run — they're printed as `ignored` in the summary so nothing is silently hidden.

## Errors (fail the build)

### E001 — Placeholder text anywhere
Catches `lorem`, `ipsum`, `TODO`, `TBD`, `Your Product`, `Company Name`, `xxx`, `[insert` (case-insensitive) in `positioning.md` or any landing YAML field.

- ❌ `headline: "TODO: write a real headline"`
- ✅ `headline: "Turn every release into a reason to stay"`

### E002 — Required section file missing
`hero.yaml`, `problem.yaml`, `faq.yaml`, `cta.yaml`, and `pricing.yaml` must all exist. `pricing.yaml` may skip rendering with `hidden: true`, but only alongside a `hiddenReason` of at least 20 characters explaining why.

- ❌ `pricing.yaml` deleted entirely, or `hidden: true` with no `hiddenReason`
- ✅ `hidden: true` + `hiddenReason: "We haven't finalized pricing for the beta yet."`

### E003 — Headline too long
`hero.headline` over 90 characters.

- ❌ `"The revolutionary all-in-one platform that completely transforms how modern SaaS teams communicate product updates to their most engaged users"` (140+ chars)
- ✅ `"Turn every release into a reason to stay"` (42 chars)

### E004 — Generic CTA label
`hero.primaryCta.label` or `cta.button.label` is `Submit`, `Click here`, `Learn more`, `Send`, or `OK`.

- ❌ `label: "Submit"`
- ✅ `label: "Join the early-bird list"`

### E005 — Not enough FAQ items
Fewer than 3 items in `faq.yaml`.

- ❌ 2 FAQ items
- ✅ 3+ FAQ items, ideally one per objection in `positioning.md`

### E006 — Missing founder proof
`hero.proof.type` is `none-yet` but `founder.yaml` doesn't exist. If you have no waitlist count or metric yet, a founder note is the fallback proof.

- ❌ `proof: { type: none-yet }` with no `founder.yaml`
- ✅ Either add `founder.yaml`, or set `proof.type` to `waitlistCount` / `metric` / `quote` / `founder` with real (even small) numbers

## Warnings (fail the build only with `--strict`)

### W001 — Headline getting long
`hero.headline` over 70 characters (but under the 90-char E003 limit).

- ❌ `"Turn every single release your team ships into a genuine reason for users to stick around"` (91 chars would actually hit E003 — keep it under 70)
- ✅ `"Turn every release into a reason to stay"`

### W002 — Weak CTA label
`Get started`, `Sign up`, `Subscribe`, or `Join` used alone, without stating the benefit.

- ❌ `label: "Join"`
- ✅ `label: "Reserve my early-bird spot"`

### W101 — Filler words
Words that sound like marketing but say nothing concrete: revolutionary, next-gen, cutting-edge, all-in-one, seamless(ly), game-changer/-changing, leverage, synergy, unlock, supercharge, empower, world-class, best-in-class, innovative, robust, powerful, effortless, state-of-the-art, disrupt.

- ❌ `"A seamless, revolutionary way to ship updates"`
- ✅ `"Shows your changelog inside your app, where users already are"`

### W102 — Egocentric copy
More "we/our/us" than "you/your" across all landing copy.

- ❌ `"We built our platform because we believe we know best for our customers."`
- ✅ `"You ship the update, your users see it inside the app they already have open."`

### W103 — Weak outcome
A `problem.outcomes` item under 15 characters, or one that just repeats a `pains` item.

- ❌ `outcomes: ["Better UX"]` or `outcomes: ["Release notes live on a page nobody opens"]` (identical to a pain)
- ✅ `outcomes: ["Updates appear where your users already work"]`

### W104 — Subheadline too long
`hero.subheadline` over 160 characters.

- ❌ A 200-character run-on sentence
- ✅ `"Shipnote shows your changelog inside your app, so the features you ship this week reach the users who would otherwise cancel."` (125 chars)

### W105 — Too many exclamation marks
More than one `!` in a single section's combined text.

- ❌ `headline: "Ship faster!"` + `subheadline: "Really, try it today!"` (2 in one file)
- ✅ At most one per file, or none

### W106 — Empty positioning heading
One of `positioning.md`'s Audience / Painful moment / Outcome / Proof / Alternatives / Objections / Offer headings has no content under it (comments don't count).

- ❌ `## Audience` followed immediately by the next `##` heading
- ✅ A real, specific answer under every heading

### W107 — Headline disconnected from the brief
`hero.headline` shares no word of 4+ letters with `hero.outcome` or `hero.pain`.

- ❌ `headline: "Grow your business today"` when `outcome: "Every release reaches active users who would otherwise cancel"`
- ✅ `headline: "Turn every release into a reason to stay"` (shares "release" with the outcome)
