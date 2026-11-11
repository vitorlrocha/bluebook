'use strict';
// PWA: manifest, ícones, meta tags do iPhone, critérios de instalação do Chrome e uso sem internet.
const { test, expect, abrir } = require('./apoio');

/* Espera o service worker assumir o controle da página. */
async function swPronto(page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }));
    }
  });
}

test.describe('PWA', () => {
  test('manifest com os campos necessários', async ({ request }) => {
    const r = await request.get('/manifest.json');
    expect(r.ok()).toBe(true);
    const m = await r.json();
    expect(m.name).toContain('Bluebook');
    expect(m.short_name).toBe('Bluebook');
    expect(m.lang).toBe('pt-BR');
    expect(m.display).toBe('standalone');
    expect(m.start_url).toBe('./');
    expect(m.scope).toBe('./');
    expect(m.background_color).toMatch(/^#[0-9A-F]{6}$/i);
    expect(m.theme_color).toMatch(/^#[0-9A-F]{6}$/i);
    const tam = m.icons.map((i) => i.sizes + ' ' + i.purpose);
    expect(tam).toEqual(expect.arrayContaining(['192x192 any', '512x512 any', '192x192 maskable', '512x512 maskable']));
  });

  test('ícones nos tamanhos certos e com fundo (sem transparência)', async ({ page }) => {
    await page.goto('/');
    const res = await page.evaluate(async () => {
      const arqs = { 'icones/icone-192.png': 192, 'icones/icone-512.png': 512, 'icones/apple-touch-icon.png': 180, 'icones/favicon-32.png': 32 };
      const out = {};
      for (const [src, px] of Object.entries(arqs)) {
        const img = new Image(); img.src = src; await img.decode();
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let transparente = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 255) transparente++;
        out[src] = { ok: img.naturalWidth === px && img.naturalHeight === px, transparente };
      }
      return out;
    });
    for (const [src, r] of Object.entries(res)) {
      expect(r.ok, src + ' tamanho').toBe(true);
      expect(r.transparente, src + ' pixels transparentes').toBe(0);
    }
  });

  test('meta tags do iPhone e do Android', async ({ page }) => {
    await page.goto('/');
    const attr = (sel, a) => page.locator(sel).first().getAttribute(a);
    expect(await attr('link[rel="apple-touch-icon"]', 'href')).toBe('icones/apple-touch-icon.png');
    expect(await attr('meta[name="apple-mobile-web-app-capable"]', 'content')).toBe('yes');
    expect(await attr('meta[name="apple-mobile-web-app-status-bar-style"]', 'content')).toBe('default');
    expect(await attr('meta[name="apple-mobile-web-app-title"]', 'content')).toBe('Bluebook');
    expect(await attr('link[rel="manifest"]', 'href')).toBe('manifest.json');
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
    expect(await attr('meta[name="viewport"]', 'content')).toContain('viewport-fit=cover');
  });

  test('Chrome considera o app instalável (sem erros de instalação)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'checagem via protocolo do Chrome');
    await abrir(page);
    await swPronto(page);
    const cdp = await page.context().newCDPSession(page);
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
    expect(installabilityErrors).toEqual([]);
    const { url, errors } = await cdp.send('Page.getAppManifest');
    expect(url).toMatch(/manifest\.json$/);
    expect(errors).toEqual([]);
  });

  test('funciona 100% offline depois da primeira visita', async ({ page, context }) => {
    await abrir(page);
    await swPronto(page);
    // só o cache da versão atual
    const versao = (await (await page.request.get('/sw.js')).text()).match(/var VERSAO = '([0-9a-f]+)'/)[1];
    expect(await page.evaluate(() => caches.keys())).toEqual(['bluebook-' + versao]);

    await context.setOffline(true);
    expect(await page.evaluate(() => navigator.onLine)).toBe(false);
    await page.reload();
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
    await expect(page.locator('.brand h1')).toContainText('Bluebook');

    // busca, CID e plantão sem internet (usa os mesmos caminhos no celular e no computador)
    await page.locator('#search-input').fill('omeprasol');
    await expect(page.locator('#sidebar .med-item').first()).toContainText('Omeprazol');
    await page.locator('.view-tab[data-mode="cid"]').dispatchEvent('click');
    await page.locator('#search-input').fill('J189');
    await expect(page.locator('#sidebar .med-item').first()).toContainText('J18 — ');
    await page.locator('.view-tab[data-mode="plantao"]').dispatchEvent('click');
    await page.locator('#sidebar [data-pl="pcr"]').dispatchEvent('click');   // no celular abre o detalhe
    await page.locator('#pl-kg').fill('20');
    await expect(page.locator('#pl-tab')).toContainText('0,2 mg');

    // outras URLs dentro do escopo (ex.: atalho com parâmetro) também abrem offline
    await page.goto('/?origem=atalho');
    await expect(page.locator('.brand h1')).toContainText('Bluebook');
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
  });

  test('sem service worker (arquivo aberto do disco) o registro é ignorado', async ({ page }) => {
    await page.goto('/');
    // o registro fica em src/atualiza.js e só acontece em http(s)
    const src = (await page.locator('script').allTextContents()).join('\n');
    expect(src).toContain('var temSW = "serviceWorker" in navigator && /^https?:$/.test(location.protocol);');
    expect(src).toContain('navigator.serviceWorker.register("sw.js")');
  });
});
