import { defineMiddleware } from 'astro:middleware';

// Rate limit simple en memoria para las APIs (una sola instancia en Render).
const hits = new Map<string, { n: number; reset: number }>();
const LIMITS: Record<string, number> = { '/api/demo': 5, '/api/suscribir': 10, '/api/checkout': 10, '/api/arrepentimiento': 5 };
const WINDOW = 10 * 60 * 1000;

export const onRequest = defineMiddleware(async (ctx, next) => {
  const path = ctx.url.pathname;
  const limit = LIMITS[path];
  if (limit && ctx.request.method === 'POST') {
    const ip = ctx.request.headers.get('cf-connecting-ip') ?? ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ctx.clientAddress;
    const key = `${path}:${ip}`;
    const now = Date.now();
    const h = hits.get(key);
    if (!h || h.reset < now) hits.set(key, { n: 1, reset: now + WINDOW });
    else if (++h.n > limit) {
      return Response.json(
        { ok: false, error: 'Hiciste muchos intentos seguidos. Esperá unos minutos y probá de nuevo.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((h.reset - now) / 1000)) } },
      );
    }
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }
  const res = await next();
  if (path.startsWith('/api/')) res.headers.set('Cache-Control', 'no-store');
  return res;
});
