import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/img/*.{jpg,png}', { eager: true });

export function img(name: string): ImageMetadata {
  const f = files[`/src/assets/img/${name}`];
  if (!f) throw new Error(`Imagen no encontrada: src/assets/img/${name}`);
  return f.default;
}
