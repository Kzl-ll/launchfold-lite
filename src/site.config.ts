export type Mode = 'launch' | 'growth'; // Lite only supports 'launch'
export const site = {
  name: 'Shipnote',
  tagline: 'Changelog that lives inside your app',
  url: 'https://example.com',            // used for canonical + sitemap
  mode: 'launch' as Mode,
  locale: 'en',
  theme: { default: 'system' as 'system' | 'light' | 'dark' },
  brand: { accent: '#8C2F1E', accentDark: '#E0785F', radius: '0px' },
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

// FR-7.5: production build fails on an empty waitlist endpoint unless explicitly allowed.
if (import.meta.env.PROD && !site.waitlist.endpoint && import.meta.env.LAUNCHFOLD_ALLOW_NO_WAITLIST !== '1') {
  throw new Error(
    'PUBLIC_WAITLIST_ENDPOINT is empty. Set it before building for production, or set ' +
      'LAUNCHFOLD_ALLOW_NO_WAITLIST=1 to build anyway (waitlist forms will show "Waitlist opens soon").',
  );
}
