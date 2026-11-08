// Mede o tempo de carregamento e o tempo de cada busca (por tecla) no dist/index.html.
// Usa o Chromium do Playwright (dependência de desenvolvimento) e o servidor local.
// Uso: node ferramentas/medir_desempenho.js [--cpu=4]   (--cpu simula um aparelho N× mais lento)
'use strict';
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('@playwright/test');

const PORTA = 4190;
const cpu = Number((process.argv.find((a) => a.startsWith('--cpu=')) || '--cpu=1').split('=')[1]);
const BUSCAS = [
  ['meds', 'dipirona'], ['meds', 'omeprasol'], ['meds', 'AAS'], ['meds', 'Novalgina'], ['meds', 'antibiotico'],
  ['diseases', 'IAM'], ['diseases', 'apendisite'], ['diseases', 'pneumonia'], ['diseases', 'dor toracica'],
  ['cid', 'J189'], ['cid', 'pneumonia'], ['scores', 'wells'],
];

(async () => {
  const srv = spawn(process.execPath, [path.join(__dirname, 'servir.js'), path.join(__dirname, '..', 'dist'), String(PORTA)], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 600));
  const nav = await chromium.launch();
  const ctx = await nav.newContext({ serviceWorkers: 'block', viewport: { width: 1366, height: 860 } });
  const page = await ctx.newPage();
  if (cpu > 1) { const c = await ctx.newCDPSession(page); await c.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }

  const cargas = [];
  for (let i = 0; i < 3; i++) {
    await page.goto(`http://localhost:${PORTA}/`, { waitUntil: 'load' });
    await page.locator('#sidebar .med-item').first().waitFor({ state: 'attached' });
    cargas.push(await page.evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0];
      return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), lista: Math.round(performance.now()) };
    }));
  }
  console.log(`Carregamento (CPU ${cpu}x), 3 vezes — DOMContentLoaded / load / lista pronta (ms):`);
  cargas.forEach((c) => console.log(`  ${c.dcl} / ${c.load} / ${c.lista}`));

  console.log('\nBusca: tempo do evento input (filtrar + desenhar a lista + busca universal), média de 3 (ms):');
  const resultado = [];
  for (const [modo, termo] of BUSCAS) {
    await page.evaluate((m) => document.querySelector(`.view-tab[data-mode="${m}"]`).click(), modo);
    const t = await page.evaluate((termo) => {
      const inp = document.getElementById('search-input');
      const vezes = [], porTecla = [];
      for (let k = 0; k < 3; k++) {
        inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
        // digitação tecla a tecla, como no uso real
        let maior = 0;
        for (let i = 1; i <= termo.length; i++) {
          inp.value = termo.slice(0, i);
          const t0 = performance.now(); inp.dispatchEvent(new Event('input', { bubbles: true })); const dt = performance.now() - t0;
          if (dt > maior) maior = dt;
        }
        porTecla.push(maior);
        inp.value = termo;
        const t0 = performance.now(); inp.dispatchEvent(new Event('input', { bubbles: true })); vezes.push(performance.now() - t0);
      }
      const med = (a) => a.reduce((x, y) => x + y, 0) / a.length;
      return { final: med(vezes), piorTecla: med(porTecla), itens: document.querySelectorAll('#sidebar .med-item').length };
    }, termo);
    resultado.push({ modo, termo, ...t });
    console.log(`  ${(modo + ' "' + termo + '"').padEnd(28)} termo completo ${t.final.toFixed(1).padStart(7)}   pior tecla ${t.piorTecla.toFixed(1).padStart(7)}   (${t.itens} itens)`);
  }
  const pior = Math.max(...resultado.map((r) => Math.max(r.final, r.piorTecla)));
  console.log(`\nPior caso: ${pior.toFixed(1)} ms ${pior > 100 ? '(ACIMA de 100 ms)' : '(dentro de 100 ms)'}`);
  await nav.close(); srv.kill();
})();
