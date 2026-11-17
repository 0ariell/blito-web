// Servidor de producción.
// - Sirve los archivos estáticos de dist/client con caché correcta (assets con hash: inmutables).
// - Delega el resto (páginas dinámicas y APIs) al handler de Astro.
// - Pone headers de seguridad y Speculation Rules en todas las respuestas.
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync, constants as Z } from 'node:zlib';
import { handler } from './dist/server/entry.mjs';

const PORT = Number(process.env.PORT ?? 4321);
const HOST = process.env.HOST ?? '0.0.0.0';
const ROOT = fileURLToPath(new URL('./dist/client/', import.meta.url));
const rules = await readFile(new URL('./speculation-rules.json', import.meta.url));

const SECURITY = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // La CSP de scripts y estilos va en <meta> con hashes (Astro). Acá van las directivas que el meta no admite.
  'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  'Speculation-Rules': '"/speculation-rules.json"',
};

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};

async function findStatic(pathname) {
  let rel;
  try { rel = normalize(decodeURIComponent(pathname)); } catch { return null; }
  if (rel.includes('..')) return null;
  for (const candidate of [rel, join(rel, 'index.html'), `${rel}.html`]) {
    const file = join(ROOT, candidate);
    if (!file.startsWith(ROOT)) return null;
    try { const s = await stat(file); if (s.isFile()) return { file, size: s.size, mtime: s.mtime }; } catch {}
  }
  return null;
}

// Texto comprimido una vez y guardado en memoria (Brotli o gzip según el navegador).
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.webmanifest', '.svg']);
const cache = new Map();
async function compressed(file, enc, mtime) {
  const key = `${file}:${enc}:${mtime.getTime()}`;
  if (!cache.has(key)) {
    const raw = await readFile(file);
    cache.set(key, enc === 'br' ? brotliCompressSync(raw, { params: { [Z.BROTLI_PARAM_QUALITY]: 11 } }) : gzipSync(raw, { level: 9 }));
  }
  return cache.get(key);
}

async function serveFile(req, res, { file, size, mtime }, pathname) {
  const ext = extname(file);
  const immutable = pathname.startsWith('/_astro/');
  const etag = `W/"${size.toString(16)}-${mtime.getTime().toString(16)}"`;
  res.setHeader('Content-Type', TYPES[ext] ?? 'application/octet-stream');
  res.setHeader('Cache-Control', immutable ? 'public, max-age=31536000, immutable' : ext === '.html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=86400');
  res.setHeader('ETag', etag);
  if (req.headers['if-none-match'] === etag) { res.writeHead(304); return res.end(); }

  res.setHeader('Vary', 'Accept-Encoding');
  const accept = String(req.headers['accept-encoding'] ?? '');
  const enc = COMPRESSIBLE.has(ext) ? (/\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : null) : null;
  if (enc) {
    const body = await compressed(file, enc, mtime);
    res.writeHead(200, { 'Content-Encoding': enc, 'Content-Length': body.length });
    return res.end(req.method === 'HEAD' ? undefined : body);
  }

  // Rangos: necesarios para que el video de portada se pueda adelantar y arranque rápido en Safari.
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  res.setHeader('Accept-Ranges', 'bytes');
  if (range) {
    const start = range[1] ? Number(range[1]) : size - Number(range[2]);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); return res.end(); }
    res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    return req.method === 'HEAD' ? res.end() : createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Length': size });
  return req.method === 'HEAD' ? res.end() : createReadStream(file).pipe(res);
}

http
  .createServer(async (req, res) => {
    for (const [k, v] of Object.entries(SECURITY)) res.setHeader(k, v);
    const { pathname } = new URL(req.url ?? '/', 'http://x');

    if (pathname === '/healthz') { res.writeHead(200); return res.end('ok'); }
    if (pathname === '/speculation-rules.json') {
      res.writeHead(200, { 'Content-Type': 'application/speculationrules+json', 'Cache-Control': 'public, max-age=3600' });
      return res.end(rules);
    }
    // Sin barra final: una sola URL canónica por página.
    if (pathname.length > 1 && pathname.endsWith('/')) {
      res.writeHead(301, { Location: pathname.replace(/\/+$/, '') + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '') });
      return res.end();
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && !pathname.startsWith('/api/')) {
      const found = await findStatic(pathname);
      if (found) return serveFile(req, res, found, pathname);
    }
    handler(req, res);
  })
  .listen(PORT, HOST, () => console.log(`Blito escuchando en http://${HOST}:${PORT}`));
