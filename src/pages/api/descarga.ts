import type { APIRoute } from 'astro';
import { sql } from '../../lib/db';
import { env } from '../../lib/env';
import { verificarDescarga } from '../../lib/tokens';
import { getPedido } from '../../lib/pedidos';

export const prerender = false;
const MAX_DESCARGAS = 10;

const texto = (msg: string, status: number) => new Response(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

export const GET: APIRoute = async ({ url }) => {
  const p = url.searchParams.get('p') ?? '';
  const v = verificarDescarga(p, url.searchParams.get('e') ?? '', url.searchParams.get('s') ?? '');
  if (v === 'invalido') return texto('Link de descarga inválido.', 403);
  if (v === 'vencido') return Response.redirect(`${env.site()}/compra/${p}?vencido=1`, 302);

  const pedido = await getPedido(p);
  if (!pedido || pedido.estado !== 'pagado' || !sql) return texto('Este pedido no está pago.', 403);
  if (pedido.descargas >= MAX_DESCARGAS) return texto('Llegaste al límite de descargas. Escribinos y te ayudamos.', 429);

  const archivo = env.kitArchivos()[pedido.kit_slug];
  if (!archivo) return texto('El archivo no está disponible. Escribinos y te lo mandamos.', 503);
  const upstream = await fetch(archivo);
  if (!upstream.ok || !upstream.body) return texto('No pudimos traer el archivo. Probá de nuevo en un rato.', 502);

  await sql`update pedidos set descargas = descargas + 1 where id = ${pedido.id}`;
  // Se transmite desde acá: la URL real del archivo nunca llega al navegador.
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="blito-${pedido.kit_slug}.zip"`,
      ...(upstream.headers.get('content-length') ? { 'Content-Length': upstream.headers.get('content-length')! } : {}),
      'Cache-Control': 'no-store',
    },
  });
};
