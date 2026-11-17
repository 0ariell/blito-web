# Blito Producciones

Sitio de Blito: productora, sello y drum kits. Astro 5 + adaptador Node en Render + Neon (Postgres).
Diseño dark fijo (negro + azul LED del estudio), sin modo claro.

- Producción: https://blito-producciones.onrender.com
- Cada push a `main` se publica solo en Render.

## Correr local

```bash
npm install
npm run dev
```

Con `DATABASE_URL` en `.env` los formularios guardan en Neon; sin eso responden OK y no guardan.

## Páginas

- `/`: hero con video, lanzamientos (reproductor YouTube/Spotify), drum kits, artistas, estudio, demo.
- `/kits` y `/kits/<slug>`: tienda de drum kits.
- `POST /api/demo`: guarda demos en la tabla `demos`.
- `POST /api/suscribir`: newsletter y lista de espera de kits en `suscriptores` (campo `origen`).

Esquema en `db/schema.sql`.

## Video de portada

```bash
scripts/encode-hero.sh ruta/al/video.mov [segundo_inicio] [duracion]
```

Genera en `public/video/` un 1080p WebM (AV1 o VP9), 1080p y 720p MP4 (H.264, faststart) y el poster.
Después poner `hero.activo = true` en `src/data/site.ts`. El video arranca muteado, tiene botón de pausa,
se pausa fuera de pantalla y no se reproduce solo con "reducir movimiento".

## Contenido

Todo en `src/data/site.ts`. Imágenes en `src/assets/img/` (Astro las convierte a WebP en varios tamaños).

### Pendiente antes de lanzar
- **Kits (borrador)**: nombres, contenido, cantidades, precios, textos y licencia son provisorios.
- **Cobro**: cargar `comprarUrl` de cada kit (link de pago de Mercado Pago). Sin link, el botón anota en la lista de espera.
- **Entrega de archivos** después del pago: falta definir (link en el mail de Mercado Pago, o webhook + descarga firmada).
- **Créditos**: confirmar con Blito qué hizo en cada tema. Faltan colaboraciones con Eljoan, Facu HDR y DJ Plaga.
- **Fotos y logo**: las del estudio salen de capturas de Instagram, en baja resolución. Reemplazar por originales.
