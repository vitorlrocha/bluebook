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
// v72: a sigla entre parênteses do próprio registro sobe na relevância ("Ácido acetilsalicílico (AAS)" em 1º).
const MUDANCAS_INTENCIONAIS = new Set(['meds:AAS', 'meds:aas']);

async function coletar(page, url, nV71) {
  await page.goto(url);
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
  return page.evaluate(([MODOS, nV71]) => {
    const inp = document.getElementById('search-input');
    /* Retrato da barra lateral: { html, quadro }.
       - html: a lista da aba, SEM o quadro da busca em todo o app e sem as doenças novas dos lotes (índice >= nº de
         doenças da v71, pois os lotes entram no fim do acervo). Grupos que ficaram vazios saem e o "(n)" de
         "Resultados por relevância" é recontado — assim tudo que existia na v71 tem de continuar igual.
       - quadro: os resultados do quadro da busca global, menos doenças, códigos CID de doenças e categorias CID-10 (cuja busca inclui os nomes das doenças do app; mudam com o acervo). */
    function retrato() {
      const sb = document.getElementById('sidebar').cloneNode(true);
      const box = sb.querySelector('details.gs-box');
      const quadro = box ? [...box.querySelectorAll('.gs-item')].map((b) => b.getAttribute('data-gk') + '|' + String(b.getAttribute('data-gv')).replace(/^local-\d+-(\d+)-[a-z0-9]+$/, 'med$1')).filter((x) => !/^(d|cc|cid)\|/.test(x)) : null;
      if (box) box.remove();
      sb.querySelectorAll('.med-item[data-idx]').forEach((b) => { if (Number(b.getAttribute('data-idx')) >= nV71) b.remove(); });
      let ant = null;
      [...sb.children].forEach((el) => {
        if (!el.classList.contains('letter-group-label')) { ant = null; return; }
        const prox = el.nextElementSibling;
        if (!prox || prox.classList.contains('letter-group-label') || (ant && ant.textContent === el.textContent)) el.remove(); else ant = el;
      });
      const rel = sb.querySelector('.letter-group-label');
      if (rel && /^Resultados por relevância \(\d+\)$/.test(rel.textContent)) rel.textContent = 'Resultados por relevância (' + sb.querySelectorAll('.med-item').length + ')';
      return { html: sb.innerHTML.replace(/local-\d+-\d+-[a-z0-9]+/g, 'ID'), quadro };
    }
    const out = {};
    for (const [modo, termos] of Object.entries(MODOS)) {
      document.querySelector(`.view-tab[data-mode="${modo}"]`).click();
      for (const t of termos) { inp.value = t; inp.dispatchEvent(new Event('input', { bubbles: true })); out[modo + ':' + t] = retrato(); }
      inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
      out[modo + ':(vazio)'] = retrato();
    }
    return out;
  }, [MODOS, nV71]);
}

test('buscas produzem a mesma lista que a v71', async ({ page, browserName }, info) => {
  test.skip(info.project.name !== 'computador', 'basta um tamanho de tela');
  test.setTimeout(90000);
  // nº de doenças da v71, lido do próprio arquivo de referência (1 doença por linha começando com {"area":)
  const nV71 = (require('fs').readFileSync(ORIGINAL, 'utf8').match(/^ {4}\{"area":/gm) || []).length;
  expect(nV71).toBeGreaterThan(3000);
  await page.route('**/v71-original.html', (r) => r.fulfill({ path: ORIGINAL, contentType: 'text/html; charset=utf-8' }));
  const antes = await coletar(page, '/v71-original.html', nV71);
  const depois = await coletar(page, '/', nV71);
  // Lista da aba: idêntica à v71 (fora as mudanças intencionais).
  // Aba CID-10: o texto de busca de cada categoria inclui as doenças do app com aquele código, então as doenças novas
  // podem ACRESCENTAR categorias à lista (nunca tirar). Ali vale: todos os itens da v71 continuam, na mesma ordem.
  const pecas = (h) => h.match(/<div class="letter-group-label">[\s\S]*?<\/div>|<button[\s\S]*?<\/button>|<div class="no-results">[\s\S]*?<\/div>/g) || [];
  function soDaV71(hDepois, hAntes) {
    const v71 = new Set(pecas(hAntes)), fica = pecas(hDepois).filter((p) => p.startsWith('<div') || v71.has(p));
    return fica.filter((p, i) => !p.startsWith('<div class="letter-group-label"') || (fica[i + 1] && fica[i + 1].startsWith('<button'))).join('');
  }
  const igual = (k) => antes[k].html === depois[k].html
    || (k.startsWith('cid:') && pecas(antes[k].html).join('') === soDaV71(depois[k].html, antes[k].html));
  const listas = Object.keys(antes).filter((k) => !igual(k) && !MUDANCAS_INTENCIONAIS.has(k));
  expect(listas, 'buscas com resultado diferente da v71').toEqual([]);
  // Quadro da busca em todo o app (v74: sempre aberto, também na Prescrição; nas abas de referência não repete a
  // própria seção): os resultados de outras seções que a v71 mostrava continuam lá, na mesma ordem.
  const quadros = Object.keys(antes).filter((k) => {
    if (!antes[k].quadro) return false;
    const modo = k.split(':')[0], esperado = antes[k].quadro.filter((x) => x.split('|')[0] !== modo);
    return JSON.stringify(esperado) !== JSON.stringify(depois[k].quadro || []);
  });
  expect(quadros, 'quadro da busca global diferente da v71').toEqual([]);
  expect(Object.keys(antes).length).toBeGreaterThan(80);
});
