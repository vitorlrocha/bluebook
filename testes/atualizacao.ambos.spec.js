'use strict';
// v73 — offline-first com atualização automática (src/atualiza.js + src/pwa/sw.js).
// Cenário completo: abrir, usar sem internet, reconectar, detectar uma versão nova publicada, atualizar com
// um toque e conferir que os dados pessoais continuam. O teste sobe um servidor próprio com uma cópia do
// dist/ e "publica" uma versão nova trocando os arquivos dessa cópia.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { test, expect } = require('./apoio');

const PORTAS = { computador: 4185, celular: 4186, iphone: 4187 };
let srv, site, BASE;

function copiar(de, para) {
  fs.mkdirSync(para, { recursive: true });
  for (const n of fs.readdirSync(de)) {
    const a = path.join(de, n), b = path.join(para, n);
    if (fs.statSync(a).isDirectory()) copiar(a, b); else fs.copyFileSync(a, b);
  }
}
/* "Publica" uma versão nova na cópia servida: troca versão/build/data no app, no sw.js e no versao.json. */
function publicarNova(info) {
  const atual = JSON.parse(fs.readFileSync(path.join(site, 'versao.json'), 'utf8'));
  let html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
  const bloco = 'window.BB_VERSAO = ' + JSON.stringify(atual) + ';';
  if (!html.includes(bloco)) throw new Error('bloco de versão não encontrado no index.html');
  fs.writeFileSync(path.join(site, 'index.html'), html.replace(bloco, 'window.BB_VERSAO = ' + JSON.stringify(info) + ';'));
  const sw = fs.readFileSync(path.join(site, 'sw.js'), 'utf8');
  if (!sw.includes("var VERSAO = '" + atual.build + "'")) throw new Error('versão não encontrada no sw.js');
  fs.writeFileSync(path.join(site, 'sw.js'), sw.replace("var VERSAO = '" + atual.build + "'", "var VERSAO = '" + info.build + "'"));
  fs.writeFileSync(path.join(site, 'versao.json'), JSON.stringify(info));
  return atual;
}
async function swNoControle(page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }));
  });
}
async function abrirAjustes(page) { await page.locator('#more-btn').click(); await page.locator('#settings-btn').click(); }

test.describe('Offline-first e atualização automática', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({}, info) => {
    site = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-atual-'));
    copiar(path.join(__dirname, '..', 'dist'), site);
    const porta = PORTAS[info.project.name];
    BASE = `http://localhost:${porta}/`;
    srv = spawn(process.execPath, [path.join(__dirname, '..', 'ferramentas', 'servir.js'), site, String(porta)], { stdio: 'ignore' });
    for (let i = 0; i < 50; i++) { try { const r = await fetch(BASE + 'versao.json'); if (r.ok) break; } catch (e) { /* subindo */ } await new Promise((r) => setTimeout(r, 100)); }
  });
  test.afterEach(() => { if (srv) srv.kill(); if (site) fs.rmSync(site, { recursive: true, force: true }); });

  test('versão e data aparecem na página inicial e em Ajustes; versao.json publicado', async ({ page, request }) => {
    const v = await (await request.get(BASE + 'versao.json')).json();
    expect(v.versao).toMatch(/^\d+\.\d+\.\d+$/);
    expect(v.build).toMatch(/^[0-9a-f]{12}$/);
    expect(new Date(v.data).getFullYear()).toBeGreaterThanOrEqual(2026);
    await page.goto(BASE);
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
    const data = new Date(v.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' });
    await expect(page.locator('#detail .home-versao')).toHaveText(`Versão ${v.versao} · atualizado em ${data}`);
    // 1ª instalação não é atualização: o aviso não pode aparecer (no Safari/iPhone aparecia por engano)
    await swNoControle(page);
    await page.waitForTimeout(1500);
    await expect(page.locator('#atualiza-aviso')).toBeHidden();
    await abrirAjustes(page);
    await expect(page.locator('#versao-aplicar')).toBeHidden();
    await expect(page.locator('#versao-linha')).toHaveText(`Versão ${v.versao} · atualizado em ${data} (build ${v.build})`);
    await expect(page.locator('#versao-verif')).toContainText('Última verificação:');
  });

  test('cenário completo: usar offline → reconectar → versão nova detectada → Atualizar → dados preservados', async ({ page, context }) => {
    test.setTimeout(90000);
    await page.goto(BASE);
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
    await swNoControle(page);
    await expect(page.locator('#offline-aviso')).toBeHidden();
    await expect(page.locator('#atualiza-aviso')).toBeHidden();

    // 1) sem internet: o app abre de novo, mostra o aviso e continua utilizável
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
    await expect(page.locator('#offline-aviso')).toBeVisible();
    await expect(page.locator('#offline-aviso')).toHaveText('Sem internet · usando a versão salva');
    await page.locator('#search-input').fill('omeprasol');
    await expect(page.locator('#sidebar .med-item').first()).toContainText('Omeprazol');
    await page.evaluate(() => localStorage.setItem('bluebook:notes', JSON.stringify({ 'm:Omeprazol': { t: 'anotação feita sem internet', rev: false } })));
    await abrirAjustes(page);
    await page.locator('#versao-verificar').click();
    await expect(page.locator('#versao-status')).toContainText('Sem internet');
    await page.locator('#settings-close').click();

    // 2) uma versão nova é publicada enquanto o aparelho está offline
    const antiga = publicarNova({ versao: '9.9.0', build: 'aaaabbbbcccc', data: '2027-01-15T12:00:00.000Z' });

    // 3) a internet volta: o aviso some, o app procura a versão nova sozinho e baixa em segundo plano
    await page.evaluate(() => { window.__mesmaPagina = true; });
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(page.locator('#offline-aviso')).toBeHidden();
    await expect(page.locator('#atualiza-aviso')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#atualiza-txt')).toHaveText('Nova versão disponível');
    // não recarregou sozinho e continua na versão antiga até o toque
    expect(await page.evaluate(() => window.__mesmaPagina)).toBe(true);
    expect(await page.evaluate(() => window.BB_VERSAO.build)).toBe(antiga.build);

    // 4) um toque em "Atualizar": recarrega na versão nova, com os dados pessoais intactos
    await page.locator('#atualiza-btn').click();
    await expect.poll(() => page.evaluate(() => window.BB_VERSAO && window.BB_VERSAO.build).catch(() => null), { timeout: 30000 }).toBe('aaaabbbbcccc');
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
    await expect(page.locator('#detail .home-versao')).toHaveText('Versão 9.9.0 · atualizado em 15/01/2027');
    await expect(page.locator('#atualiza-aviso')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('bluebook:notes'))).toContain('anotação feita sem internet');
    expect(await page.evaluate(() => caches.keys())).toEqual(['bluebook-aaaabbbbcccc']);
    await abrirAjustes(page);
    await page.locator('#versao-verificar').click();
    await expect(page.locator('#versao-status')).toHaveText('Você já está na versão mais recente.');

    // 5) e a versão nova também abre sem internet
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#detail .home-versao')).toHaveText('Versão 9.9.0 · atualizado em 15/01/2027');
  });

  test('sem tocar em Atualizar, a versão nova entra na próxima abertura do app', async ({ page, context }) => {
    test.setTimeout(90000);
    await page.goto(BASE);
    await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
    await swNoControle(page);
    publicarNova({ versao: '9.9.1', build: 'ddddeeeeffff', data: '2027-02-01T12:00:00.000Z' });
    await abrirAjustes(page);
    await page.locator('#versao-verificar').click();
    await expect(page.locator('#versao-status')).toContainText('Há uma versão nova');
    await expect(page.locator('#atualiza-aviso')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#versao-aplicar')).toBeVisible();
    // fecha o app sem atualizar e abre de novo
    await page.close();
    const outra = await context.newPage();
    await expect.poll(async () => {
      await outra.goto(BASE);
      return outra.evaluate(() => window.BB_VERSAO && window.BB_VERSAO.build).catch(() => null);
    }, { timeout: 40000, intervals: [1000, 2000, 3000] }).toBe('ddddeeeeffff');
  });
});
