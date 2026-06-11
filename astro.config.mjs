import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ghostkellz.sh',
  vite: {
    plugins: [tailwindcss()],
  },
});
