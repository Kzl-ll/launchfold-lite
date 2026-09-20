// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      // FR-9.3: exclude the thanks page and 404 from the sitemap.
      filter: (page) => !page.includes('/waitlist/thanks') && !page.includes('/404'),
    }),
  ],
});