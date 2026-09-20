import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const landingDir = './src/content/landing';

// Neutral, non-marketing UI strings (FR-5.11) - separate from landing copy so
// they're never subject to the copy lint's marketing-copy rules.
const ui = defineCollection({
  loader: glob({ pattern: 'ui.yaml', base: './src/content' }),
  schema: z.object({
    skipToContent: z.string(),
    menu: z.string(),
    toggleTheme: z.string(),
  }),
});

const hero = defineCollection({
  loader: glob({ pattern: 'hero.yaml', base: landingDir }),
  schema: z.object({
    eyebrow: z.string().max(40).optional(),
    audience: z.string(),
    pain: z.string(),
    outcome: z.string(),
    headline: z.string(),
    subheadline: z.string(),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
    proof: z.object({
      type: z.enum(['waitlistCount', 'metric', 'quote', 'founder', 'none-yet']),
      text: z.string().optional(),
    }),
    visual: z.object({
      type: z.enum(['screenshot', 'video', 'embed']),
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    }),
  }),
});

const problem = defineCollection({
  loader: glob({ pattern: 'problem.yaml', base: landingDir }),
  schema: z.object({
    heading: z.string(),
    pains: z.array(z.string()).min(2).max(4),
    outcomes: z.array(z.string()).min(2).max(4),
    // FR-5.3: list labels default to "Without/With {site.name}" but can be overridden.
    withoutLabel: z.string().optional(),
    withLabel: z.string().optional(),
  }),
});

// optional file: FR-3.4 - if missing, the Demo section and nav link are not rendered.
const demo = defineCollection({
  loader: glob({ pattern: 'demo.yaml', base: landingDir }),
  schema: z.object({
    heading: z.string(),
    subheading: z.string().optional(),
    media: z.object({
      type: z.enum(['screenshot', 'video', 'embed']),
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
      poster: z.string().optional(),
    }),
  }),
});

const howItWorks = defineCollection({
  loader: glob({ pattern: 'how-it-works.yaml', base: landingDir }),
  schema: z.object({
    heading: z.string(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .length(3, 'Exactly 3 steps are required'),
  }),
});

// optional file: FR-3.4 - required only when hero.proof.type is 'none-yet' (enforced by copy-lint E006, not here).
const founder = defineCollection({
  loader: glob({ pattern: 'founder.yaml', base: landingDir }),
  schema: z.object({
    heading: z.string(),
    name: z.string(),
    role: z.string(),
    photo: z.string().optional(),
    note: z.string().max(400),
    links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  }),
});

const pricing = defineCollection({
  loader: glob({ pattern: 'pricing.yaml', base: landingDir }),
  schema: z.object({
    hidden: z.boolean().optional(),
    hiddenReason: z.string().optional(),
    heading: z.string(),
    plan: z.object({
      name: z.string(),
      earlyBirdPrice: z.number(),
      regularPrice: z.number(),
      currency: z.string(),
      period: z.enum(['month', 'year', 'once']),
      perks: z.array(z.string()).min(3).max(6),
    }),
    scarcity: z.object({
      type: z.enum(['spots', 'date']),
      value: z.string(),
    }),
    note: z.string().optional(),
  })
    // FR-3.5: hidden: true requires a hiddenReason of at least 20 characters.
    .refine((data) => !data.hidden || (data.hiddenReason?.length ?? 0) >= 20, {
      message: 'hiddenReason must be at least 20 characters when hidden is true',
      path: ['hiddenReason'],
    }),
});

const faq = defineCollection({
  loader: glob({ pattern: 'faq.yaml', base: landingDir }),
  schema: z.object({
    heading: z.string(),
    items: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
          objection: z.enum(['price', 'trust', 'effort', 'fit', 'switching', 'other']),
        }),
      )
      .min(3, 'At least 3 FAQ items are required'),
  }),
});

const cta = defineCollection({
  loader: glob({ pattern: 'cta.yaml', base: landingDir }),
  schema: z.object({
    heading: z.string(),
    subheading: z.string().optional(),
    button: z.object({ label: z.string() }),
    urgency: z.object({
      type: z.enum(['spots', 'date']),
      value: z.string(),
    }),
    reassurance: z.string(),
  }),
});

export const collections = { hero, problem, demo, howItWorks, founder, pricing, faq, cta, ui };
