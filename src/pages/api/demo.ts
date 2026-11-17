import type { APIRoute } from 'astro';
import { sql } from '../../lib/db';

export const prerender = false;

const clean = (v: FormDataEntryValue | null, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  // Honeypot: los bots completan este campo oculto.
  if (clean(form.get('web'), 200)) return Response.json({ ok: true });

  const nombre = clean(form.get('nombre'), 120);
  const contacto = clean(form.get('contacto'), 160);
  const link = clean(form.get('link'), 500);
  const mensaje = clean(form.get('mensaje'), 2000);

  const errors: Record<string, string> = {};
  if (!nombre) errors.nombre = 'Escribí tu nombre o nombre artístico.';
  if (!contacto) errors.contacto = 'Dejá un Instagram, mail o WhatsApp para responderte.';
  if (!/^https?:\/\/\S+\.\S+/.test(link)) errors.link = 'Pegá un link que empiece con https:// (Drive, SoundCloud, YouTube).';
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });

  if (!sql) {
    console.warn('[demo] DATABASE_URL no configurada; demo recibida pero no guardada:', { nombre, contacto, link });
    return Response.json({ ok: true, stored: false });
  }
  await sql`insert into demos (nombre, contacto, link, mensaje) values (${nombre}, ${contacto}, ${link}, ${mensaje || null})`;
  return Response.json({ ok: true, stored: true });
};
