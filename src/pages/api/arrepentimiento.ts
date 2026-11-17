import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { sql } from '../../lib/db';
import { enviarMail, plantilla, esc } from '../../lib/mail';
import { env } from '../../lib/env';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const f = await request.formData();
  const nombre = String(f.get('nombre') ?? '').trim().slice(0, 120);
  const email = String(f.get('email') ?? '').trim().toLowerCase().slice(0, 200);
  const pedido = String(f.get('pedido') ?? '').trim().slice(0, 80);
  const motivo = String(f.get('motivo') ?? '').trim().slice(0, 1000);
  const errors: Record<string, string> = {};
  if (!nombre) errors.nombre = 'Escribí tu nombre y apellido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Escribí el mail con el que compraste.';
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });
  if (!sql) return Response.json({ ok: false, error: 'No pudimos registrar el pedido. Escribinos por WhatsApp.' }, { status: 503 });

  const codigo = 'ARR-' + randomBytes(4).toString('hex').toUpperCase();
  await sql`insert into arrepentimientos (codigo, pedido, email, nombre, motivo) values (${codigo}, ${pedido || null}, ${email}, ${nombre}, ${motivo || null})`;
  await enviarMail(email, `Recibimos tu solicitud de arrepentimiento (${codigo})`,
    plantilla('Recibimos tu solicitud', `<p>Tu código de trámite es <strong>${codigo}</strong>. Te respondemos por este medio en un plazo máximo de 10 días hábiles.</p>`));
  const aviso = env.notifyEmail();
  if (aviso) await enviarMail(aviso, `Arrepentimiento ${codigo}`, plantilla('Nueva solicitud de arrepentimiento', `<p>${esc(nombre)} (${esc(email)})<br>Pedido: ${esc(pedido || '-')}<br>${esc(motivo || '')}</p>`));
  return Response.json({ ok: true, codigo });
};
