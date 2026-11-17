import type { APIRoute } from 'astro';
import { firmaValida } from '../../../lib/mp';
import { procesarPago } from '../../../lib/pedidos';

export const prerender = false;

// Mercado Pago avisa acá cada cambio de un pago. Respondemos 200 rápido; ante error, 500 para que reintente.
export const POST: APIRoute = async ({ request, url }) => {
  let body: any = {};
  try { body = await request.json(); } catch {}
  const type = url.searchParams.get('type') ?? body.type;
  const dataId = url.searchParams.get('data.id') ?? body?.data?.id;
  if (type !== 'payment' || !dataId) return new Response(null, { status: 200 });

  if (!firmaValida(String(dataId), request.headers.get('x-request-id'), request.headers.get('x-signature'))) {
    return new Response('firma inválida', { status: 401 });
  }
  try {
    await procesarPago(String(dataId));
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error('[webhook]', e);
    return new Response(null, { status: 500 });
  }
};
