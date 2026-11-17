import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './env';

const TTL = 7 * 24 * 60 * 60; // el link de descarga dura 7 días

const sign = (data: string) => createHmac('sha256', env.tokenSecret()!).update(data).digest('base64url');

export function linkDescarga(pedidoId: string) {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const sig = sign(`${pedidoId}.${exp}`);
  return `${env.site()}/api/descarga?p=${pedidoId}&e=${exp}&s=${sig}`;
}

export function verificarDescarga(p: string, e: string, s: string): 'ok' | 'vencido' | 'invalido' {
  if (!env.tokenSecret() || !p || !e || !s) return 'invalido';
  const a = Buffer.from(sign(`${p}.${e}`));
  const b = Buffer.from(s);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return 'invalido';
  return Number(e) < Date.now() / 1000 ? 'vencido' : 'ok';
}
