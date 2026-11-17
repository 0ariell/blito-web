// Mercado Pago Checkout Pro por REST (sin SDK).
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './env';

// MP_API_BASE permite apuntar a un mock en los tests.
const API = process.env.MP_API_BASE ?? 'https://api.mercadopago.com';

async function mp<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: `Bearer ${env.mpAccessToken()}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function crearPreferencia(o: { pedidoId: string; slug: string; titulo: string; precio: number; email: string }) {
  const site = env.site();
  return mp<{ id: string; init_point: string }>('/checkout/preferences', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': o.pedidoId },
    body: JSON.stringify({
      items: [{ id: o.slug, title: o.titulo, quantity: 1, unit_price: o.precio, currency_id: 'ARS', category_id: 'digital_content' }],
      payer: { email: o.email },
      external_reference: o.pedidoId,
      notification_url: `${site}/api/mp/webhook`,
      back_urls: { success: `${site}/compra/${o.pedidoId}`, pending: `${site}/compra/${o.pedidoId}`, failure: `${site}/compra/${o.pedidoId}` },
      auto_return: 'approved',
      statement_descriptor: 'BLITO PROD',
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }], installments: 1 },
    }),
  });
}

export type Pago = { id: number; status: string; external_reference: string; transaction_amount: number; currency_id: string };
export const obtenerPago = (id: string) => mp<Pago>(`/v1/payments/${encodeURIComponent(id)}`);

/** Valida el header x-signature del webhook (ts=...,v1=...). */
export function firmaValida(dataId: string, requestId: string | null, header: string | null) {
  const secret = env.mpWebhookSecret();
  if (!secret) return true; // sin secreto configurado se confía en la consulta a la API (que igual valida el pago)
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.trim().split('=') as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId ?? ''};ts:${parts.ts};`;
  const a = Buffer.from(createHmac('sha256', secret).update(manifest).digest('hex'));
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
