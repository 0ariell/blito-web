import { test, expect } from '@playwright/test';

const paginas = ['/', '/lanzamientos', '/blito', '/demo', '/produccion', '/kits', '/kits/cabina-vol-1', '/kits/clande-vol-1', '/kits/mis-compras', '/legales/terminos', '/legales/privacidad', '/arrepentimiento'];

for (const path of paginas) {
  test(`${path} carga sin errores ni CSP rota ni scroll horizontal`, async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(ancho).toBeLessThanOrEqual(0);
    expect(errores).toEqual([]);
  });
}

test('headers de seguridad', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['strict-transport-security']).toContain('max-age');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['speculation-rules']).toBeTruthy();
});

test('404 real para rutas que no existen', async ({ page }) => {
  expect((await page.goto('/no-existe'))?.status()).toBe(404);
  expect((await page.goto('/kits/no-existe'))?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('no está en el catálogo');
});

test('el reproductor propio abre con portada y controles, y cierra devolviendo el foco', async ({ page, isMobile }) => {
  await page.goto('/');
  const card = page.locator('.card__btn').first();
  await card.click();
  const dlg = page.locator('dialog[data-player]');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('[data-poster]')).toHaveAttribute('src', /_astro|_image/);
  await expect(dlg.getByRole('slider', { name: 'Posición del video' })).toBeVisible();
  // El iframe de YouTube no recibe el mouse: los controles son los de la web
  await expect(dlg.locator('.pl__frame')).toHaveCSS('pointer-events', 'none');
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  if (!isMobile) await expect(card).toBeFocused();
});

test('filtros de lanzamientos', async ({ page }) => {
  await page.goto('/lanzamientos');
  await page.getByRole('button', { name: 'Producciones' }).click();
  await expect(page.getByRole('button', { name: 'Producciones' })).toHaveAttribute('aria-pressed', 'true');
  const visibles = page.locator('.card:not([hidden])');
  await expect(visibles).toHaveCount(3);
});

test('menú mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Menú' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('link', { name: 'Drum kits' }).first().click();
  await expect(page).toHaveURL(/\/kits$/);
});

test('validación del formulario de demo', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Nombre o nombre artístico').fill('Test');
  await page.getByLabel('Instagram, mail o WhatsApp').fill('@test');
  await page.getByLabel('Link al tema').fill('no-es-un-link');
  await page.getByRole('button', { name: 'Enviar demo' }).click();
  await expect(page.locator('#e-link')).toContainText('https://');
  await expect(page.getByLabel('Link al tema')).toHaveAttribute('aria-invalid', 'true');
});

test('compra completa con Mercado Pago (mock) y descarga', async ({ page }) => {
  test.skip(!process.env.TEST_DATABASE_URL, 'requiere TEST_DATABASE_URL (rama de Neon para tests)');
  await page.goto('/kits/cabina-vol-1');
  await page.getByLabel('Tu mail', { exact: true }).fill('comprador@test.dev');
  await page.getByRole('checkbox', { name: /términos/ }).check();
  await page.getByRole('button', { name: 'Pagar con Mercado Pago' }).click();
  await expect(page.getByText('Pago aprobado')).toBeVisible();
  const descarga = page.waitForEvent('download');
  await page.getByRole('link', { name: /Descargar kit/ }).click();
  expect((await descarga).suggestedFilename()).toBe('blito-cabina-vol-1.zip');
});

test('el webhook rechaza firmas inválidas y acepta las válidas', async ({ request }) => {
  const { createHmac } = await import('node:crypto');
  const malo = await request.post('/api/mp/webhook?type=payment&data.id=123', {
    data: { type: 'payment', data: { id: '123' } },
    headers: { 'x-signature': 'ts=1,v1=deadbeef', 'x-request-id': 'r1' },
  });
  expect(malo.status()).toBe(401);

  // tipo distinto de "payment": se ignora con 200 sin tocar nada
  const ts = String(Date.now());
  const v1 = createHmac('sha256', 'whsec-test').update(`id:456;request-id:r2;ts:${ts};`).digest('hex');
  const otro = await request.post('/api/mp/webhook?type=merchant_order&data.id=456', {
    data: {}, headers: { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': 'r2' },
  });
  expect(otro.status()).toBe(200);
});

test('un link de descarga adulterado no sirve', async ({ request }) => {
  const res = await request.get('/api/descarga?p=00000000-0000-0000-0000-000000000000&e=9999999999&s=falso');
  expect(res.status()).toBe(403);
});

test('galería detrás de escena: se desplaza con los botones', async ({ page, isMobile }) => {
  test.skip(isMobile, 'en mobile se desliza con el dedo');
  await page.goto('/blito#backstage');
  const track = page.locator('#gal-track');
  await expect(page.getByRole('button', { name: 'Fotos anteriores' })).toBeDisabled();
  await page.getByRole('button', { name: 'Fotos siguientes' }).click();
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
});

test('producción: el botón de mensualidad preselecciona el interés y valida', async ({ page }) => {
  await page.goto('/produccion');
  await page.getByRole('link', { name: 'Quiero la mensualidad' }).click();
  await expect(page.getByRole('radio', { name: 'Mensualidad con acompañamiento' })).toBeChecked();
  await page.getByRole('button', { name: 'Enviar consulta' }).click();
  await expect(page.locator('#ce-nombre')).not.toBeEmpty();
});

test('producción: consulta completa se guarda', async ({ page }) => {
  test.skip(!process.env.TEST_DATABASE_URL, 'requiere TEST_DATABASE_URL');
  await page.goto('/produccion?interes=beat#contacto');
  await expect(page.getByRole('radio', { name: 'Beat a medida' })).toBeChecked();
  await page.getByLabel('Nombre o nombre artístico').fill('Artista Test');
  await page.getByLabel('Mail', { exact: true }).fill('artista@test.dev');
  await page.getByRole('textbox', { name: 'Tu idea' }).fill('Quiero un beat de RKT para un tema que ya tengo escrito.');
  await page.getByRole('button', { name: 'Enviar consulta' }).click();
  await expect(page.getByText('¡Listo! Recibimos tu consulta.')).toBeVisible();
});

test('kits: filtro por género en la URL', async ({ page }) => {
  await page.goto('/kits');
  await page.getByRole('button', { name: 'Turreo' }).click();
  await expect(page).toHaveURL(/genero=turreo/);
  await expect(page.locator('.kl__grid > li:not([hidden])')).toHaveCount(1);
});

test('kits: cupón válido baja el precio y uno inválido avisa', async ({ page }) => {
  test.skip(!process.env.TEST_DATABASE_URL, 'requiere TEST_DATABASE_URL');
  await page.goto('/kits/cabina-vol-1');
  await page.getByText('¿Tenés un código de descuento?').click();
  await page.getByLabel('Código de descuento').fill('nada');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('.kd__cmsg')).toContainText('no existe');
  await page.getByLabel('Código de descuento').fill('prueba10');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('.kd__cmsg')).toContainText('10%');
  await expect(page.locator('.kd__price [data-total]')).toHaveText(/16\.200/);
});

test('recuperar compras responde igual exista o no el mail', async ({ request }) => {
  const r = await request.post('/api/mis-compras', { form: { email: 'nadie@test.dev' } });
  expect(await r.json()).toEqual({ ok: true });
});

test('panel: pide contraseña y entra con la correcta', async ({ request, browser }) => {
  expect((await request.get('/admin')).status()).toBe(401);
  const ctx = await browser.newContext({ httpCredentials: { username: 'blito', password: 'admin-test' } });
  const p = await ctx.newPage();
  expect((await p.goto('/admin'))?.status()).toBe(200);
  await expect(p.getByRole('heading', { name: 'Panel' })).toBeVisible();
  await ctx.close();
});

test('volver arriba aparece al bajar y sube', async ({ page }) => {
  await page.goto('/produccion');
  const btn = page.getByRole('link', { name: 'Volver arriba' });
  await page.mouse.wheel(0, 3000);
  await expect(btn).toHaveClass(/is-on/);
  await btn.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
});
