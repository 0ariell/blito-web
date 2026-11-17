# Blito Producciones: maqueta web

Astro 5 + adaptador Node (Render) + Neon para el formulario de demos. No hace falta Supabase:
la única cosa dinámica es guardar demos, y eso es una tabla en Neon.

## Correr local

```bash
npm install
npm run dev
```

## Deploy

1. Neon: crear proyecto y correr `db/schema.sql` en el SQL Editor.
2. Render: New → Blueprint con este repo (usa `render.yaml`). Cargar `DATABASE_URL` con el connection string de Neon.
3. Sin `DATABASE_URL`, el formulario responde OK pero no guarda nada (útil para mostrar la maqueta).

## Contenido

Todo el texto editable está en `src/data/site.ts`.

### Pendiente antes de publicar
- **Roles y años de los créditos**: están como supuestos (`confirmar: true`). Confirmar con Blito qué hizo en cada tema.
- **Fotos**: las de `public/img/ig-*.jpg` están recortadas de una captura de Instagram y tienen baja resolución. Reemplazarlas por los originales.
- **Logo**: `public/img/logo-bp.png` también sale de una captura. Pedir el SVG.
- **Más créditos y artistas**: agregar en `creditos` y `artistas`; las miniaturas de YouTube van en `public/img/yt-<id>.jpg`.
- **Dominio**: `site` en `astro.config.mjs` usa `blitoproducciones.com` como provisorio.
