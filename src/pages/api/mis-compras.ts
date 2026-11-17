import type { APIRoute } from 'astro';
import { reenviarCompras } from '../../lib/pedidos';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const email = String((await request.formData()).get('email') ?? '').trim().toLowerCase().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: 'Revisá el mail: tiene que ser algo como nombre@mail.com.' }, { status: 422 });
  }
  try { await reenviarCompras(email); } catch (e) { console.error('[mis-compras]', e); }
  // Misma respuesta siempre: así nadie puede averiguar qué mails compraron.
  return Response.json({ ok: true });
};
