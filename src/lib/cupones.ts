import { sql } from './db';

export type Cupon = { codigo: string; porcentaje: number; activo: boolean; usos: number; max_usos: number | null; vence: string | null; kits: string[] | null };

/** Devuelve el cupón si se puede usar para ese kit, o un motivo si no. */
export async function validarCupon(codigoRaw: string, kitSlug: string): Promise<{ ok: true; cupon: Cupon } | { ok: false; error: string }> {
  const codigo = codigoRaw.trim().toUpperCase().slice(0, 40);
  if (!codigo) return { ok: false, error: 'Escribí el código.' };
  if (!sql) return { ok: false, error: 'No pudimos validar el código ahora.' };
  const rows = (await sql`select * from cupones where codigo = ${codigo}`) as Cupon[];
  const c = rows[0];
  if (!c || !c.activo) return { ok: false, error: 'Ese código no existe o ya no está activo.' };
  if (c.vence && new Date(c.vence) < new Date()) return { ok: false, error: 'Ese código ya venció.' };
  if (c.max_usos !== null && c.usos >= c.max_usos) return { ok: false, error: 'Ese código ya se usó todas las veces posibles.' };
  if (c.kits && c.kits.length && !c.kits.includes(kitSlug)) return { ok: false, error: 'Ese código no aplica a este kit.' };
  return { ok: true, cupon: c };
}

export const aplicarDescuento = (precio: number, porcentaje: number) => Math.round(precio * (100 - porcentaje) / 100);
