import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://jpmx.pro',
  output: 'static',
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/admin') && !page.endsWith('/404') })],
  build: {
    format: 'directory',
  },
});
