# Blito Producciones

Sitio oficial de Blito Producciones: productora, sello y tienda de drum kits.

**Producción:** https://blito-producciones.onrender.com

| Capa | Tecnología |
|---|---|
| Framework | Astro 5 (páginas estáticas + rutas en servidor) |
| Servidor | Node 22, `server.mjs` (estáticos con caché inmutable, Brotli, headers de seguridad) |
| Base de datos | Neon Postgres (`db/schema.sql`) |
| Pagos | Mercado Pago Checkout Pro (REST + webhook firmado) |
| Mails | Resend |
| Hosting | Render (deploy automático desde `main`) |

## Desarrollo

```bash
npm install
cp .env.example .env   # completar lo que haga falta
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | Chequeo de tipos de Astro/TypeScript |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción (`server.mjs`) |
| `npm test` | Tests E2E con Playwright (desktop y mobile) |

Para correr la prueba de compra completa, definí `TEST_DATABASE_URL` con una rama de Neon dedicada a tests.
La CI (GitHub Actions) corre check, build y tests en cada push.

## Arquitectura

```
src/
  data/site.ts        contenido: lanzamientos, artistas, kits, servicios, contacto
  components/         secciones de la home, reproductor, portada de kit
  layouts/            Base (SEO, JSON-LD, CSP), Legal
  pages/
    index, kits/, legales/, arrepentimiento, 404
    compra/[id]       estado del pedido y descarga
    api/              demo, suscribir, checkout, mp/webhook, descarga, arrepentimiento
  lib/                env, db, mp, pedidos, tokens, mail
  middleware.ts       rate limit de las APIs
server.mjs            servidor de producción
```

### Flujo de compra

1. `/kits/<slug>` → `POST /api/checkout` crea el pedido y la preferencia de Mercado Pago.
2. El comprador paga en Mercado Pago y vuelve a `/compra/<id>`.
3. El pago se confirma consultando la API de Mercado Pago (al volver y por webhook, lo que llegue primero).
   Se valida monto y moneda; el pedido se marca pago una sola vez y se envía el mail con el link de descarga.
4. `GET /api/descarga` verifica la firma y el vencimiento (7 días, 10 descargas) y transmite el .zip sin exponer su URL.

Un kit se vende online solo si el servidor tiene `MP_ACCESS_TOKEN`, `DOWNLOAD_TOKEN_SECRET` y su archivo en `KIT_ARCHIVOS`.
Si falta algo, la página muestra "Preventa" y anota interesados en `suscriptores`.

### Seguridad

- CSP con hashes por página (scripts y estilos), `frame-ancestors 'none'`, HSTS, nosniff, Referrer-Policy, Permissions-Policy.
- Rate limit por IP en todas las APIs. Honeypot en el formulario de demo.
- El webhook valida la firma `x-signature` de Mercado Pago y nunca confía en el cuerpo: consulta el pago.
- Links de descarga firmados con HMAC y comparados en tiempo constante.

### Performance

Lighthouse mobile: Performance 98, Accesibilidad 100, Buenas prácticas 100, SEO 100.
Imágenes a WebP responsive, fuente variable propia con preload, CSS inline, Brotli, Speculation Rules
para precargar la próxima página y transiciones nativas entre páginas.

## Contenido

Todo el texto editable está en `src/data/site.ts`. Las imágenes van en `src/assets/img/`.

### Video de portada

```bash
scripts/encode-hero.sh ruta/al/video.mov [segundo_inicio] [duracion]
```

Genera WebM 1080p (AV1 o VP9), MP4 1080p y 720p (H.264) y el poster en `public/video/`.
Después: `hero.activo = true` en `src/data/site.ts`.

## Puesta en marcha de la tienda

1. Mercado Pago: cargar `MP_ACCESS_TOKEN` y configurar el webhook (evento *Pagos*) apuntando a `/api/mp/webhook`; cargar `MP_WEBHOOK_SECRET`.
2. Subir el .zip de cada kit a un almacenamiento privado y cargar las URLs en `KIT_ARCHIVOS`.
3. Resend: verificar el dominio, cargar `RESEND_API_KEY` y `MAIL_FROM`.
4. Completar `LEGAL_TITULAR`, `LEGAL_CUIT` y `LEGAL_EMAIL` para los términos.
