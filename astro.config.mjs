import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jpmx.pro',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') && !page.endsWith('/404') })],
  build: {
    format: 'directory',
  },
});
