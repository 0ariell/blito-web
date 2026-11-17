import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { kits } from './src/data/site.ts';

const site = process.env.SITE_URL ?? 'https://blito-producciones.onrender.com';

export default defineConfig({
  site,
  trailingSlash: 'never',
  // server.mjs envuelve el handler para poner headers de seguridad en todas las respuestas.
  adapter: node({ mode: 'middleware' }),
  integrations: [
    sitemap({
      filter: (page) => !/\/(compra|api|admin)(\/|$)/.test(page),
      // las páginas de kits se renderizan en el servidor, así que se agregan a mano
      customPages: kits.map((k) => `${site}/kits/${k.slug}`),
    }),
  ],
  // Los formularios son públicos y sin sesión; detrás del proxy de Render el chequeo
  // de origen falla (http vs https). La protección real está en el rate limit del middleware.
  security: { checkOrigin: false },
  image: { responsiveStyles: false },
  // CSS dentro del HTML: un pedido menos antes de pintar (las páginas son livianas).
  build: { inlineStylesheets: 'always' },
  experimental: {
    // CSP con hashes de cada script y estilo que Astro genera.
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "media-src 'self'",
        "connect-src 'self'",
        'frame-src https://www.youtube-nocookie.com https://open.spotify.com',
        "form-action 'self' https://www.mercadopago.com.ar",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      // La API del reproductor de YouTube (se carga recién cuando alguien toca play).
      scriptDirective: { resources: ["'self'", 'https://www.youtube.com'] },
    },
  },
});
