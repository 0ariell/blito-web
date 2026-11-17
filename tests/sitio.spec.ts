import { test, expect } from '@playwright/test';

const paginas = ['/', '/kits', '/kits/cabina-vol-1', '/legales/terminos', '/legales/privacidad', '/arrepentimiento'];

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

test('el reproductor abre y cierra devolviendo el foco', async ({ page, isMobile }) => {
  await page.goto('/');
  const card = page.locator('.card__btn').first();
  await card.click();
  const dlg = page.locator('dialog[data-player]');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\//);
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await expect(dlg.locator('iframe')).toHaveCount(0);
  if (!isMobile) await expect(card).toBeFocused();
});

test('filtros de lanzamientos', async ({ page }) => {
  await page.goto('/');
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
  await page.goto('/#demo');
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
