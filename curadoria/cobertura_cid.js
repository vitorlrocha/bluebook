// Mede quais categorias da CID-10 (3 caracteres) não têm nenhuma doença no acervo, por capítulo.
// Só lê dados/. Uso: node curadoria/cobertura_cid.js  → grava curadoria/cid_sem_doenca.json
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('../ferramentas/lib_dados');
const D = L.lerDados(L.VARS.find((c) => c.v === 'DISEASES'));
const C = L.lerDados(L.VARS.find((c) => c.v === 'CID_FULL'));

// categorias citadas pelo acervo (aceita faixas "I20-I25")
const usadas = new Set();
const cats = C.cat.map((c) => (Array.isArray(c) ? c[0] : c.c || c.codigo || c.cod));
const nomeCat = {};
const asterisco = new Set();   // categorias de manifestação (sistema asterisco): não viram doença própria
C.cat.forEach((c) => { nomeCat[c[0]] = c[2]; if (c[1] === '*') asterisco.add(c[0]); });
for (const d of D) {
  for (const parte of String(d.cid || '').split(/[,;/]/)) {
    const t = parte.trim().toUpperCase();
    const faixa = t.match(/^([A-Z]\d\d)(?:\.\d+)?\s*[-–]\s*([A-Z]\d\d)/);
    if (faixa) { cats.forEach((k) => { if (k >= faixa[1] && k <= faixa[2]) usadas.add(k); }); continue; }
    const m = t.match(/^([A-Z]\d\d)/);
    if (m) usadas.add(m[1]);
  }
}
// capítulos que não são "doença para conduta" (causas externas, fatores de contato, códigos especiais)
const fora = /^[VWXYZU]/;
const capDe = (k) => k[0];
const falta = cats.filter((k) => !usadas.has(k) && !fora.test(k) && !asterisco.has(k));
const porLetra = {};
falta.forEach((k) => { (porLetra[capDe(k)] = porLetra[capDe(k)] || []).push(k + ' ' + nomeCat[k]); });
const resumo = Object.fromEntries(Object.entries(porLetra).map(([l, a]) => [l, a.length]));
fs.writeFileSync(path.join(__dirname, 'cid_sem_doenca.json'), JSON.stringify({ totalCategorias: cats.length, comDoenca: usadas.size, semDoenca: falta.length, porLetra: resumo, lista: porLetra }, null, 1));
console.log('categorias:', cats.length, '| com doença:', usadas.size, '| sem doença (fora V-Z,U):', falta.length);
console.log(JSON.stringify(resumo));
