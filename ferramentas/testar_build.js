// Teste de equivalência: dist/index.html x index.html original.
// Uso: node ferramentas/testar_build.js [original] [dist]
// Confere: contagens esperadas; cada variável de dados com o mesmo valor (funções e regex comparadas
// pelo texto-fonte); e todo o restante do arquivo (HTML, CSS, código) idêntico byte a byte.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const L = require('./lib_dados');

const orig = process.argv[2] || path.join(L.RAIZ, 'referencia', 'index-v71-original.html');
const dist = process.argv[3] || path.join(L.RAIZ, 'dist', 'index.html');
const A = fs.readFileSync(orig, 'utf8'), B = fs.readFileSync(dist, 'utf8');

function decompor(s) {
  const vals = {}, spans = [];
  for (const cfg of L.VARS) {
    const { ini, fim } = L.acharVar(s, cfg.v);
    const texto = s.slice(ini, fim);
    vals[cfg.v] = { valor: L.paraJson(L.avaliar(texto, cfg.refs)), texto };
    spans.push({ ini, fim, v: cfg.v });
  }
  spans.sort((a, b) => b.ini - a.ini);
  let resto = s;
  for (const sp of spans) resto = resto.slice(0, sp.ini) + '@' + sp.v + '@' + resto.slice(sp.fim);
  return { vals, resto };
}

const a = decompor(A), b = decompor(B);
let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'FALHA') + ' ' + msg); if (!cond) falhas++; };

// 1. Contagens
const cnt = d => ({
  doencas: d.vals.DISEASES.valor.length,
  medicamentos: d.vals.SEED_MEDS.valor.length,
  cidCategorias: d.vals.CID_FULL.valor.cat.length,
  cidSubcategorias: d.vals.CID_FULL.valor.sub.length,
});
const esperado = { doencas: 3226, medicamentos: 1851, cidCategorias: 2045, cidSubcategorias: 12451 };
const cd = cnt(b);
for (const k of Object.keys(esperado)) ok(cd[k] === esperado[k], `${k}: dist ${cd[k]} (esperado ${esperado[k]}, original ${cnt(a)[k]})`);

// 2. Dados
for (const cfg of L.VARS) {
  let igual = true;
  try { assert.deepStrictEqual(b.vals[cfg.v].valor, a.vals[cfg.v].valor); } catch (e) { igual = false; }
  const bytes = a.vals[cfg.v].texto === b.vals[cfg.v].texto;
  const n = Array.isArray(a.vals[cfg.v].valor) ? a.vals[cfg.v].valor.length : Object.keys(a.vals[cfg.v].valor).length;
  ok(igual, `${cfg.v.padEnd(15)} ${String(n).padStart(5)} itens, mesmo valor${bytes ? ' (texto idêntico)' : ' (só formatação difere)'}`);
}

// 3. Resto do arquivo
ok(a.resto === b.resto, `HTML/CSS/código fora dos dados idêntico (${a.resto.length} caracteres)`);
ok(/var CALC_ITEMS = CALCS\.map\(/.test(B), 'CALC_ITEMS continua derivado de CALCS');

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO OK');
process.exit(falhas ? 1 : 0);
