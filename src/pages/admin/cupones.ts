import type { APIRoute } from 'astro';
import { sql } from '../../lib/db';
import { kits } from '../../data/site';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const f = await request.formData();
  const back = (msg: string) => redirect(`/admin?msg=${encodeURIComponent(msg)}#cupones`, 303);
  if (!sql) return back('Falta la base de datos.');
  const codigo = String(f.get('codigo') ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,40}$/.test(codigo)) return back('El código tiene que tener entre 3 y 40 letras, números, guiones.');

  if (f.get('accion') === 'alternar') {
    await sql`update cupones set activo = not activo where codigo = ${codigo}`;
    return back(`Cupón ${codigo} actualizado.`);
  }
  const porcentaje = Number(f.get('porcentaje'));
  if (!Number.isInteger(porcentaje) || porcentaje < 1 || porcentaje > 100) return back('El porcentaje tiene que ser entre 1 y 100.');
  const max = f.get('max_usos') ? Number(f.get('max_usos')) : null;
  const vence = f.get('vence') ? `${f.get('vence')}T23:59:59-03:00` : null;
  const kit = String(f.get('kit') ?? '');
  const kitsCupon = kit && kits.some((k) => k.slug === kit) ? [kit] : null;
  try {
    await sql`insert into cupones (codigo, porcentaje, max_usos, vence, kits) values (${codigo}, ${porcentaje}, ${max}, ${vence}, ${kitsCupon})`;
  } catch {
    return back(`Ya existe un cupón ${codigo}.`);
  }
  return back(`Cupón ${codigo} creado: ${porcentaje}% de descuento.`);
};
