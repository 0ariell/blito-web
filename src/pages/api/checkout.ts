import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { sql } from '../../lib/db';
import { crearPreferencia } from '../../lib/mp';
import { ventaHabilitada } from '../../lib/env';
import { kits } from '../../data/site';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const slug = String(form.get('kit') ?? '');
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200);
  const acepta = form.get('acepta') === 'on';
  const kit = kits.find((k) => k.slug === slug && k.estado === 'venta');
  const back = (msg: string) => redirect(`/kits/${slug}?error=${encodeURIComponent(msg)}#comprar`, 303);

  if (!kit || !sql || !ventaHabilitada(slug)) return back('Este kit todavía no se puede comprar online.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return back('Revisá el mail: ahí te mandamos el link de descarga.');
  if (!acepta) return back('Para comprar tenés que aceptar los términos y condiciones.');

  const id = randomUUID();
  await sql`insert into pedidos (id, kit_slug, email, monto) values (${id}, ${slug}, ${email}, ${kit.precioArs})`;
  try {
    const pref = await crearPreferencia({ pedidoId: id, slug, titulo: `${kit.nombre} Vol. ${Number(kit.vol)} (drum kit)`, precio: kit.precioArs, email });
    await sql`update pedidos set mp_preference_id = ${pref.id} where id = ${id}`;
    return redirect(pref.init_point, 303);
  } catch (e) {
    console.error('[checkout]', e);
    return back('Mercado Pago no respondió. Probá de nuevo en un minuto.');
  }
};
