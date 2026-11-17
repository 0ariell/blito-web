// Mock mínimo de la API de Mercado Pago para los tests E2E.
import http from 'node:http';
const prefs = new Map();
http.createServer(async (req, res) => {
  let body = '';
  for await (const c of req) body += c;
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'POST' && req.url === '/checkout/preferences') {
    const p = JSON.parse(body);
    const id = 'pref-' + prefs.size;
    prefs.set(id, p);
    // el "checkout" del mock vuelve directo al sitio con el pago aprobado
    return res.end(JSON.stringify({ id, init_point: `${p.back_urls.success}?payment_id=${900 + prefs.size}&status=approved` }));
  }
  const m = req.url.match(/^\/v1\/payments\/(\d+)$/);
  if (m) {
    const last = [...prefs.values()].at(-1);
    return res.end(JSON.stringify({ id: Number(m[1]), status: 'approved', external_reference: last.external_reference, transaction_amount: last.items[0].unit_price, currency_id: 'ARS' }));
  }
  if (req.url === '/kit.zip') { res.setHeader('Content-Type', 'application/zip'); return res.end('PK-fake-zip'); }
  res.statusCode = 404; res.end('{}');
}).listen(4599, () => console.log('mp mock 4599'));
