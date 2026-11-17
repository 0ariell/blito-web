import type { APIRoute } from 'astro';
import { sql } from '../../lib/db';
import { env } from '../../lib/env';
import { enviarMail, plantilla, esc } from '../../lib/mail';
import { intereses } from '../../data/site';

export const prerender = false;
const s = (v: FormDataEntryValue | null, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const POST: APIRoute = async ({ request }) => {
  const f = await request.formData();
  if (s(f.get('web'), 100)) return Response.json({ ok: true }); // honeypot
  const d = {
    nombre: s(f.get('nombre'), 120),
    instagram: s(f.get('instagram'), 80).replace(/^@?/, '@').replace(/^@$/, ''),
    email: s(f.get('email'), 200).toLowerCase(),
    whatsapp: s(f.get('whatsapp'), 40),
    interes: s(f.get('interes'), 30),
    idea: s(f.get('idea'), 3000),
    referencias: s(f.get('referencias'), 1000),
  };
  const errors: Record<string, string> = {};
  if (!d.nombre) errors.nombre = 'Escribí tu nombre o nombre artístico.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.email = 'Escribí un mail válido: ahí te mandamos la propuesta.';
  if (!intereses.some((i) => i.id === d.interes)) errors.interes = 'Elegí qué estás buscando.';
  if (d.idea.length < 10) errors.idea = 'Contanos un poco más de tu idea (al menos una línea).';
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });
  if (!sql) return Response.json({ ok: false, error: 'No pudimos guardar tu consulta. Escribinos por WhatsApp.' }, { status: 503 });

  await sql`insert into consultas (nombre, instagram, email, whatsapp, interes, idea, referencias)
            values (${d.nombre}, ${d.instagram || null}, ${d.email}, ${d.whatsapp || null}, ${d.interes}, ${d.idea}, ${d.referencias || null})`;
  const interes = intereses.find((i) => i.id === d.interes)!.label;
  await enviarMail(d.email, 'Recibimos tu consulta', plantilla(
    `Hola ${d.nombre}, recibimos tu consulta`,
    `<p>Blito va a escuchar lo que mandaste y te escribe con una propuesta.</p><p><strong>Te interesa:</strong> ${esc(interes)}</p>`,
  ));
  const aviso = env.notifyEmail();
  if (aviso) {
    await enviarMail(aviso, `Consulta: ${interes} (${d.nombre})`, plantilla(`Nueva consulta: ${interes}`,
      `<p><strong>${esc(d.nombre)}</strong> ${esc(d.instagram)}<br>${esc(d.email)} ${esc(d.whatsapp)}</p><p>${esc(d.idea).replace(/\n/g, '<br>')}</p>${d.referencias ? `<p>Referencias: ${esc(d.referencias)}</p>` : ''}`));
  }
  return Response.json({ ok: true });
};
