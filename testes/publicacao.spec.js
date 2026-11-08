'use strict';
// Etapa 4: o GitHub Pages serve o app numa subpasta (https://usuario.github.io/bluebook/).
// Simula isso: copia dist/ para <tmp>/site/bluebook/ e serve <tmp>/site. Confere caminhos relativos,
// manifest, service worker com escopo da subpasta, login e uso offline.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { test, expect } = require('./apoio');

const PORTA = 4181;
const BASE = `http://localhost:${PORTA}/bluebook/`;
let srv, site;
/* cópia recursiva simples (fs.cpSync encerra o processo neste Windows/OneDrive) */
function copiar(de, para) {
  fs.mkdirSync(para, { recursive: true });
  for (const n of fs.readdirSync(de)) {
    const a = path.join(de, n), b = path.join(para, n);
    if (fs.statSync(a).isDirectory()) copiar(a, b); else fs.copyFileSync(a, b);
  }
}

test.describe('Publicação em subpasta (GitHub Pages)', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async ({}, info) => {
    if (info.project.name !== 'computador') return;
    site = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-site-'));
    copiar(path.join(__dirname, '..', 'dist'), path.join(site, 'bluebook'));
    srv = spawn(process.execPath, [path.join(__dirname, '..', 'ferramentas', 'servir.js'), site, String(PORTA)], { stdio: 'ignore' });
    for (let i = 0; i < 50; i++) { try { const r = await fetch(BASE); if (r.ok) break; } catch (e) { /* subindo */ } await new Promise((r) => setTimeout(r, 100)); }
  });
  test.afterAll(() => { if (srv) srv.kill(); if (site) fs.rmSync(site, { recursive: true, force: true }); });
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'computador', 'basta um tamanho de tela'); });

  test('nenhum recurso sai da subpasta e nada dá 404', async ({ page }) => {
    const ruins = [];
    page.on('response', (r) => { if (r.status() >= 400) ruins.push(r.status() + ' ' + r.url()); });
    page.on('request', (r) => { const u = r.url(); if (u.startsWith('http') && !u.startsWith(BASE)) ruins.push('fora da subpasta: ' + u); });
    await page.goto(BASE);
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    expect(ruins).toEqual([]);
  });

  test('service worker com escopo da subpasta e app offline', async ({ page, context }) => {
    await page.goto(BASE);
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
    const escopo = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }));
      return reg.scope;
    });
    expect(escopo).toBe(BASE);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
    await page.locator('#search-input').fill('dipirona');
    await expect(page.locator('#sidebar .med-item').first()).toContainText('Dipirona');
  });

  test('manifest resolve start_url e scope para a subpasta', async ({ page }) => {
    await page.goto(BASE);
    const cdp = await page.context().newCDPSession(page);
    const m = await cdp.send('Page.getAppManifest');
    expect(m.url).toBe(BASE + 'manifest.json');
    expect(m.errors).toEqual([]);
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
    expect(installabilityErrors).toEqual([]);
  });
});
