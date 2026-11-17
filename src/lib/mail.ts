import { env } from './env';

/** Envía un mail con Resend. Sin RESEND_API_KEY no hace nada y devuelve false. */
export async function enviarMail(to: string, subject: string, html: string) {
  const key = env.resendKey();
  if (!key) { console.warn('[mail] RESEND_API_KEY no configurada, no se envió:', subject); return false; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.mailFrom(), to, subject, html }),
  });
  if (!res.ok) console.error('[mail] Resend', res.status, await res.text());
  return res.ok;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const plantilla = (titulo: string, cuerpo: string, boton?: { texto: string; url: string }) => `
<div style="background:#000;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#fff">
  <div style="max-width:520px;margin:0 auto">
    <p style="font-size:28px;font-weight:900;letter-spacing:-1px;margin:0 0 24px">BLITO</p>
    <h1 style="font-size:22px;margin:0 0 12px">${esc(titulo)}</h1>
    <div style="color:#c9cbe0;font-size:15px;line-height:1.6">${cuerpo}</div>
    ${boton ? `<p style="margin:28px 0"><a href="${boton.url}" style="background:#2b30f2;color:#fff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:999px;display:inline-block">${esc(boton.texto)}</a></p>` : ''}
    <p style="color:#7d81a3;font-size:12px;margin-top:32px">Blito Producciones, Buenos Aires.</p>
  </div>
</div>`;
export { esc };
