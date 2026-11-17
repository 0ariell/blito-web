import { sql } from './db';
import { obtenerPago } from './mp';
import { linkDescarga } from './tokens';
import { enviarMail, plantilla, esc } from './mail';
import { kits } from '../data/site';

export type Pedido = {
  id: string; kit_slug: string; email: string; estado: 'pendiente' | 'pagado' | 'rechazado';
  monto: number; mp_payment_id: string | null; descargas: number; creado_en: string; pagado_en: string | null;
};

export async function getPedido(id: string): Promise<Pedido | null> {
  if (!sql || !/^[0-9a-f-]{36}$/.test(id)) return null;
  const rows = (await sql`select * from pedidos where id = ${id}`) as Pedido[];
  return rows[0] ?? null;
}

/**
 * Consulta el pago en Mercado Pago (nunca confiamos en lo que llega del navegador o del webhook)
 * y, si está aprobado por el monto correcto, marca el pedido y manda el mail de entrega una sola vez.
 */
export async function procesarPago(paymentId: string) {
  if (!sql) return null;
  const pago = await obtenerPago(paymentId);
  const pedido = await getPedido(pago.external_reference);
  if (!pedido) return null;

  if (pago.status === 'approved') {
    if (pago.currency_id !== 'ARS' || Number(pago.transaction_amount) < Number(pedido.monto)) {
      console.error('[pedido] monto o moneda no coinciden', pedido.id, pago.transaction_amount, pago.currency_id);
      return pedido;
    }
    // update condicional: si dos notificaciones llegan juntas, solo una marca el pago y manda el mail
    const marcados = (await sql`
      update pedidos set estado = 'pagado', mp_payment_id = ${String(pago.id)}, pagado_en = now()
      where id = ${pedido.id} and estado <> 'pagado' returning *`) as Pedido[];
    if (marcados[0]) await mandarEntrega(marcados[0]);
    return marcados[0] ?? (await getPedido(pedido.id));
  }
  if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(pago.status) && pedido.estado === 'pendiente') {
    await sql`update pedidos set estado = 'rechazado', mp_payment_id = ${String(pago.id)} where id = ${pedido.id}`;
  }
  return getPedido(pedido.id);
}

export async function mandarEntrega(p: Pedido) {
  const kit = kits.find((k) => k.slug === p.kit_slug);
  const nombre = kit ? `${kit.nombre} Vol. ${Number(kit.vol)}` : p.kit_slug;
  return enviarMail(
    p.email,
    `Tu kit ${nombre} está listo para descargar`,
    plantilla(
      `Gracias por tu compra`,
      `<p>Ya podés descargar <strong>${esc(nombre)}</strong>. El link dura 7 días; si se te vence, entrá a la página de tu compra y generá uno nuevo.</p><p>Número de pedido: ${p.id}</p>`,
      { texto: 'Descargar kit', url: linkDescarga(p.id) },
    ),
  );
}
