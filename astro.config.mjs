import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [tailwind()],
  output: 'static', // This is the fix - changed from 'hybrid'
  adapter: netlify(),
  site: 'https://laec.netlify.app',
});