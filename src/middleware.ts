import { defineMiddleware } from 'astro:middleware';

// Rate limit simple en memoria para las APIs (una sola instancia en Render).
const hits = new Map<string, { n: number; reset: number }>();
const LIMITS: Record<string, number> = { '/api/consulta': 5, '/api/cupon': 20, '/api/mis-compras': 5, '/api/demo': 5, '/api/suscribir': 10, '/api/checkout': 10, '/api/arrepentimiento': 5 };
const WINDOW = 10 * 60 * 1000;

function autorizado(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return false;
  const user = process.env.ADMIN_USER ?? 'blito';
  const h = req.headers.get('authorization') ?? '';
  if (!h.startsWith('Basic ')) return false;
  const [u, p] = Buffer.from(h.slice(6), 'base64').toString().split(':');
  // comparación sin cortocircuito
  const a = Buffer.from(`${u}:${p}`), b = Buffer.from(`${user}:${pass}`);
  return a.length === b.length && a.equals(b);
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const path = ctx.url.pathname;

  // Panel de administración: Basic Auth; sin ADMIN_PASSWORD configurado no existe.
  if (path === '/admin' || path.startsWith('/admin/')) {
    if (!process.env.ADMIN_PASSWORD) return new Response('No encontrado', { status: 404 });
    if (!autorizado(ctx.request)) {
      return new Response('Necesitás iniciar sesión.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Blito admin", charset="UTF-8"' } });
    }
    if (ctx.request.method === 'POST') {
      const origin = ctx.request.headers.get('origin');
      if (origin && new URL(origin).host !== ctx.url.host && new URL(origin).host !== new URL(process.env.SITE_URL ?? ctx.url.href).host) {
        return new Response('Origen no permitido', { status: 403 });
      }
    }
    const res = await next();
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('X-Robots-Tag', 'noindex');
    return res;
  }
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
