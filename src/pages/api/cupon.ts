import type { APIRoute } from 'astro';
import { validarCupon, aplicarDescuento } from '../../lib/cupones';
import { kits, ars } from '../../data/site';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const f = await request.formData();
  const kit = kits.find((k) => k.slug === String(f.get('kit') ?? ''));
  if (!kit) return Response.json({ ok: false, error: 'Kit inválido.' }, { status: 400 });
  const r = await validarCupon(String(f.get('codigo') ?? ''), kit.slug);
  if (!r.ok) return Response.json(r, { status: 422 });
  const total = aplicarDescuento(kit.precioArs, r.cupon.porcentaje);
  return Response.json({ ok: true, codigo: r.cupon.codigo, porcentaje: r.cupon.porcentaje, total, totalTexto: ars(total) });
};
