import type { APIRoute } from 'astro';
import { sql } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200);
  const origen = String(form.get('origen') ?? 'web').trim().slice(0, 80);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: 'Revisá el mail: tiene que ser algo como nombre@mail.com.' }, { status: 422 });
  }
  if (!sql) {
    console.warn('[suscribir] DATABASE_URL no configurada:', email, origen);
    return Response.json({ ok: true, stored: false });
  }
  await sql`insert into suscriptores (email, origen) values (${email}, ${origen}) on conflict (email, origen) do nothing`;
  return Response.json({ ok: true, stored: true });
};
