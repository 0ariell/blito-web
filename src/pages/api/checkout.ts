import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { sql } from '../../lib/db';
import { crearPreferencia } from '../../lib/mp';
import { ventaHabilitada } from '../../lib/env';
import { kits } from '../../data/site';
import { validarCupon, aplicarDescuento } from '../../lib/cupones';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const slug = String(form.get('kit') ?? '');
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200);
  const acepta = form.get('acepta') === 'on';
  const nombre = String(form.get('nombre') ?? '').trim().slice(0, 120);
  const codigo = String(form.get('cupon') ?? '').trim();
  const kit = kits.find((k) => k.slug === slug && k.estado === 'venta');
  const back = (msg: string) => redirect(`/kits/${slug}?error=${encodeURIComponent(msg)}#comprar`, 303);

  if (!kit || !sql || !ventaHabilitada(slug)) return back('Este kit todavía no se puede comprar online.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return back('Revisá el mail: ahí te mandamos el link de descarga.');
  if (!acepta) return back('Para comprar tenés que aceptar los términos y condiciones.');

  let monto = kit.precioArs;
  let cupon: string | null = null;
  if (codigo) {
    const r = await validarCupon(codigo, slug);
    if (!r.ok) return back(r.error);
    monto = aplicarDescuento(kit.precioArs, r.cupon.porcentaje);
    cupon = r.cupon.codigo;
  }

  const id = randomUUID();
  await sql`insert into pedidos (id, kit_slug, email, nombre, monto, precio_lista, cupon)
            values (${id}, ${slug}, ${email}, ${nombre || null}, ${monto}, ${kit.precioArs}, ${cupon})`;
  try {
    const pref = await crearPreferencia({ pedidoId: id, slug, titulo: `${kit.nombre} Vol. ${Number(kit.vol)} (drum kit)`, precio: monto, email });
    await sql`update pedidos set mp_preference_id = ${pref.id} where id = ${id}`;
    return redirect(pref.init_point, 303);
  } catch (e) {
    console.error('[checkout]', e);
    return back('Mercado Pago no respondió. Probá de nuevo en un minuto.');
  }
};
