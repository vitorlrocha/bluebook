// Impressão digital dos estilos computados (getComputedStyle, inclusive ::before/::after) de todos os
// elementos em várias telas, temas e larguras. Serve para provar que uma limpeza de CSS não mudou nada.
// Uso: node ferramentas/estilos_computados.js saida.json        (gera)
//      node ferramentas/estilos_computados.js --comparar a.json b.json
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

if (process.argv[2] === '--comparar') {
  const A = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), B = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
  const a = A.estados, b = B.estados;
  let dif = 0, tot = 0;
  for (const estado of Object.keys(a)) {
    const ea = a[estado], eb = b[estado] || {};
    for (const k of Object.keys(ea)) {
      tot++;
      if (ea[k] !== eb[k]) {
        // compara valores independentemente da ordem das propriedades
        const pa = A.dic[ea[k]], pb = B.dic[eb[k]] || {};
        const props = [...new Set([...Object.keys(pa), ...Object.keys(pb)])].filter((p) => pa[p] !== pb[p]);
        if (!props.length) continue;
        dif++;
        if (dif <= 15) console.log('DIFERENTE', estado, k, props.slice(0, 6).map((p) => `${p}: ${pa[p]} → ${pb[p]}`).join(' | '));
      }
    }
    if (Object.keys(ea).length !== Object.keys(eb).length) { dif++; console.log('Nº de elementos diferente em', estado); }
  }
  console.log(dif ? `${dif} diferença(s) em ${tot} elementos` : `IDÊNTICO: ${tot} elementos (com ::before/::after) em ${Object.keys(a).length} estados`);
  process.exit(dif ? 1 : 0);
}

const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');
const PORTA = 4192;
const ESTADOS = [
  ['inicio', []], ['meds', [['tab', 'meds']]], ['ficha-dipirona', [['busca', 'Dipirona sódica'], ['clicar', '#sidebar .med-item[data-id]'], ['preencher', '#fp-weight', '10']]],
  ['busca-universal', [['busca', 'pneumonia']]], ['doenca', [['tab', 'diseases'], ['busca', 'Infarto agudo do miocárdio (IAM)'], ['clicar', '#sidebar .med-item[data-idx]']]],
  ['plantao', [['tab', 'plantao'], ['clicar', '#sidebar [data-pl="pcr"]'], ['preencher', '#pl-kg', '70']]], ['escore', [['tab', 'scores'], ['clicar', '#sidebar [data-score="curb65"]']]],
  ['cid', [['tab', 'cid'], ['busca', 'J189'], ['clicar', '#sidebar .med-item']]], ['atb', [['tab', 'atb'], ['clicar', '#sidebar .med-item']]], ['rx', [['tab', 'rx']]],
  ['vac', [['tab', 'vac'], ['clicar', '#sidebar .med-item']]], ['calc', [['tab', 'calc'], ['clicar', '#sidebar .med-item']]], ['lab', [['tab', 'lab'], ['clicar', '#sidebar .med-item']]],
  ['modal-calc', [['clicar', '#calc-btn'], ['clicar', '.calc-tab[data-tab="ped"]']]], ['menu', [['clicar', '#more-btn']]], ['folha-mais', [['clicar', '#tabbar [data-tb="more"]']]],
  ['sem-resultado', [['busca', 'xyzxyz']]],
];

(async () => {
  const saida = process.argv[2];
  if (!saida) { console.error('Uso: node ferramentas/estilos_computados.js saida.json'); process.exit(2); }
  const srv = spawn(process.execPath, [path.join(__dirname, 'servir.js'), path.join(__dirname, '..', 'dist'), String(PORTA)], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 600));
  const nav = await chromium.launch();
  const out = {}, dic = {};   // dic: hash → propriedades (conjuntos de estilo idênticos são guardados uma vez)
  for (const [larg, alt] of [[1366, 860], [390, 844]]) {
    for (const tema of ['light', 'dark']) {
      const ctx = await nav.newContext({ viewport: { width: larg, height: alt }, colorScheme: tema, serviceWorkers: 'block' });
      for (const [nome, passos] of ESTADOS) {
        const page = await ctx.newPage();
        await page.goto(`http://localhost:${PORTA}/`);
        await page.locator('#sidebar .med-item').first().waitFor({ state: 'attached' });
        for (const p of passos) {
          if (p[0] === 'tab') await page.locator(`.view-tab[data-mode="${p[1]}"]`).dispatchEvent('click');
          if (p[0] === 'busca') await page.locator('#search-input').fill(p[1]);
          if (p[0] === 'clicar') await page.locator(p[1]).first().dispatchEvent('click');
          if (p[0] === 'preencher') await page.locator(p[1]).fill(p[2]);
        }
        await page.waitForTimeout(100);
        const dados = await page.evaluate(() => {
          const r = {};
          const els = Array.from(document.querySelectorAll('*'));
          let nSide = 0;
          els.forEach((el, i) => {
            if (el.closest('#sidebar') && el.classList.contains('med-item') && ++nSide > 40) return;
            if (el.closest('#sidebar .med-item') && nSide > 40) return;
            const key = i + ':' + el.tagName + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
            const p = {};
            for (const ps of [null, '::before', '::after']) {
              const cs = getComputedStyle(el, ps);
              if (ps && (cs.content === 'none' || cs.content === 'normal')) continue;
              for (let j = 0; j < cs.length; j++) p[(ps || '') + cs[j]] = cs.getPropertyValue(cs[j]);
            }
            r[key] = p;
          });
          return r;
        });
        const est = {};
        for (const [k, p] of Object.entries(dados)) {
          const h = crypto.createHash('sha1').update(JSON.stringify(p)).digest('hex');
          dic[h] = p; est[k] = h;
        }
        out[`${larg}-${tema}-${nome}`] = est;
        await page.close();
      }
      await ctx.close();
    }
  }
  fs.writeFileSync(saida, JSON.stringify({ estados: out, dic }));
  console.log('OK', Object.keys(out).length, 'estados,', Object.values(out).reduce((a, e) => a + Object.keys(e).length, 0), 'elementos,', Object.keys(dic).length, 'estilos distintos →', saida);
  await nav.close(); srv.kill();
})();
