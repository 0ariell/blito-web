import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Páginas estáticas por defecto; solo /api/demo corre en el servidor (Render).
export default defineConfig({
  site: 'https://blitoproducciones.com',
  adapter: node({ mode: 'standalone' }),
  server: { host: true },
  // /api/demo es un formulario público sin sesión: no hay nada que proteger con CSRF,
  // y detrás del proxy de Render el chequeo de origen falla (http vs https).
  security: { checkOrigin: false },
});
