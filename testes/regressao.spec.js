'use strict';
// Regressão contra a v71: as mesmas buscas, no original e no build atual, devem produzir exatamente
// a mesma lista (HTML da barra lateral). Garante que otimizações e limpezas não mudam resultados.
// Se uma mudança INTENCIONAL de comportamento alterar uma busca, adicione o termo em MUDANCAS_INTENCIONAIS.
const path = require('path');
const { test, expect } = require('./apoio');

const ORIGINAL = path.join(__dirname, '..', 'referencia', 'index-v71-original.html');
const MODOS = {
  meds: ['d', 'di', 'dip', 'dipirona', 'omeprasol', 'AAS', 'aas', 'Novalgina', 'antibiótico', 'antibiotico', 'ibp', 'isrs', 'insulina nph',
    'tansulosina', 'amoxicilina clavulanato', 'pediatria', 'xyzxyz', 'ácido', 'mg', '5', 'ieca', 'bb', 'anticoagulante oral'],
  diseases: ['i', 'ia', 'IAM', 'PAC', 'apendisite', 'pneumonia', 'dor toracica', 'dor torácica', 'cid:J18', 'cid:I20-I25', 'J18.9', 'avc', 'dpoc',
    'insuficiencia cardiaca', 'dm2', 'gestação', 'crianca febre', 'zzzz', 'sepse'],
  cid: ['J18.9', 'J189', 'J18', 'j', 'pneumonia', 'apendicite aguda', 'K35', 'A00', 'Z99', 'diabetes'],
  scores: ['wells', 'curb', 'glasgow', 'tep', 'a'],
  atb: ['pac', 'itu', 'celulite', 'm'],
  rx: ['dip', 'amox'],
  vac: ['hpv', 'crianca'], flux: ['pcr', 'sepse'], ecg: ['qt', 'bloqueio'], lab: ['sodio', 'tsh'], calc: ['imc', 'renal'], plantao: ['pcr', 'convul', 'anafilaxia'],
};
const MUDANCAS_INTENCIONAIS = new Set([]);

async function coletar(page, url) {
  await page.goto(url);
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
  return page.evaluate((MODOS) => {
    const norm = (h) => h.replace(/local-\d+-\d+-[a-z0-9]+/g, 'ID');
    const inp = document.getElementById('search-input');
    const out = {};
    for (const [modo, termos] of Object.entries(MODOS)) {
      document.querySelector(`.view-tab[data-mode="${modo}"]`).click();
      for (const t of termos) {
        inp.value = t; inp.dispatchEvent(new Event('input', { bubbles: true }));
        out[modo + ':' + t] = norm(document.getElementById('sidebar').innerHTML);
      }
      inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
      out[modo + ':(vazio)'] = norm(document.getElementById('sidebar').innerHTML);
    }
    return out;
  }, MODOS);
}

test('buscas produzem a mesma lista que a v71', async ({ page, browserName }, info) => {
  test.skip(info.project.name !== 'computador', 'basta um tamanho de tela');
  test.setTimeout(90000);
  await page.route('**/v71-original.html', (r) => r.fulfill({ path: ORIGINAL, contentType: 'text/html; charset=utf-8' }));
  const antes = await coletar(page, '/v71-original.html');
  const depois = await coletar(page, '/');
  const diferentes = Object.keys(antes).filter((k) => antes[k] !== depois[k] && !MUDANCAS_INTENCIONAIS.has(k));
  expect(diferentes, 'buscas com resultado diferente da v71').toEqual([]);
  expect(Object.keys(antes).length).toBeGreaterThan(80);
});
