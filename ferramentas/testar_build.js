// Teste de equivalência: dist/index.html x index.html original.
// Uso: node ferramentas/testar_build.js [original] [dist]
// Confere: contagens esperadas e cada variável de dados com o mesmo valor (funções e regex comparadas
// pelo texto-fonte). Informa se o restante do arquivo (HTML, CSS, código) ainda é idêntico à v71.
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
// Doenças: desde a v74 o acervo cresce por lotes revisados (curadoria/, ferramentas/integrar_lote.js). As 3.226
// originais têm de continuar intactas e na mesma ordem; as novas só podem ser ACRESCENTADAS depois delas.
const novas = cd.doencas - esperado.doencas;
for (const k of Object.keys(esperado)) {
  if (k === 'doencas') ok(cd[k] >= esperado[k], `doencas: dist ${cd[k]} (originais ${esperado[k]} + ${novas} novas de lotes revisados)`);
  else if (k === 'medicamentos') ok(cd[k] >= esperado[k], `medicamentos: dist ${cd[k]} (originais ${esperado[k]} + ${cd[k] - esperado[k]} de lotes conferidos com bula)`);
  else ok(cd[k] === esperado[k], `${k}: dist ${cd[k]} (esperado ${esperado[k]}, original ${cnt(a)[k]})`);
}

// 2. Dados
const CORRECOES = {
  SEED_MEDS: { chave: (m) => m.nome, itens: ['Secnidazol'] },            // campo Pediatria falava de metronidazol
  PLANTAO: { chave: (p) => p.id, itens: ['sepse'] },                       // hidrocortisona: dose sem fonte → PENDENTE
};
for (const cfg of L.VARS) {
  let igual = true;
  const vb = (cfg.v === 'DISEASES' || cfg.v === 'SEED_MEDS') ? b.vals[cfg.v].valor.slice(0, a.vals[cfg.v].valor.length) : b.vals[cfg.v].valor;
  try { assert.deepStrictEqual(vb, a.vals[cfg.v].valor); } catch (e) { igual = false; }
  // Doses pediátricas: desde 11/2026 a conferência com bulas pode corrigir uma entrada. Vale se os medicamentos
  // continuam os mesmos e na mesma ordem e se TODA via de cada entrada alterada traz o registro da conferência (rev).
  // Medicamentos NOVOS na calculadora (prioridade 3, curadoria/ped-lote-*.js) só podem ser acrescentados no fim, e
  // também precisam do registro de conferência em toda via.
  if (!igual && cfg.v === 'PED_DB') {
    const va = a.vals[cfg.v].valor, todos = b.vals[cfg.v].valor, base = todos.slice(0, va.length), novos = todos.slice(va.length);
    const mud = base.filter((e, i) => { try { assert.deepStrictEqual(e, va[i]); return false; } catch (x) { return true; } });
    const mesmos = base.length === va.length && base.every((e, i) => e.k === va[i].k);
    const semRev = mud.concat(novos).filter((e) => e.v.some((r) => !/conferid/i.test(r.rev || '')));
    igual = mesmos && !semRev.length;
    console.log(`INFO  PED_DB: ${mud.length} entrada(s) corrigidas e ${novos.length} nova(s) (${novos.map((e) => e.n).join(', ') || '—'}), todas conferidas com fonte` +
      (semRev.length ? `; SEM registro de conferência: ${semRev.map((e) => e.n).join(', ')}` : '') + (mesmos ? '' : '; lista de medicamentos originais mudou'));
  }
  // Calculadoras e escores NOVOS (prioridade 4, curadoria/calcs-lote-*.js e escores-lote-*.js): os originais continuam
  // idênticos e na mesma ordem; os novos só entram no fim e cada um precisa de referência (e fórmula ou interpretação).
  if (!igual && (cfg.v === 'CALCS' || cfg.v === 'SCORES')) {
    const va = a.vals[cfg.v].valor, todos = b.vals[cfg.v].valor, novas = todos.slice(va.length);
    let base = true; try { assert.deepStrictEqual(todos.slice(0, va.length), va); } catch (x) { base = false; }
    const semRef = novas.filter((c) => !c.ref || !c.id || !(cfg.v === 'CALCS' ? c.formula : c.interp));
    igual = base && !semRef.length;
    console.log(`INFO  ${cfg.v}: ${novas.length} item(ns) novo(s) (${novas.map((c) => c.id).join(', ') || '—'})` +
      (semRef.length ? `; SEM fórmula/referência: ${semRef.map((c) => c.id).join(', ')}` : '') + (base ? '' : '; calculadoras originais mudaram'));
  }
  // Correções clínicas aprovadas pelo autor (revisão de prioridade 1, docs/PROPOSTAS_P1.md, 17/11/2026): só os itens
  // listados aqui podem diferir da v71; qualquer outra diferença continua sendo falha.
  if (!igual && CORRECOES[cfg.v]) {
    const va = a.vals[cfg.v].valor, chave = CORRECOES[cfg.v].chave, ok_ = CORRECOES[cfg.v].itens;
    const mud = vb.filter((e, i) => { try { assert.deepStrictEqual(e, va[i]); return false; } catch (x) { return true; } });
    const fora = mud.filter((e) => !ok_.includes(chave(e)));
    igual = vb.length === va.length && !fora.length;
    console.log(`INFO  ${cfg.v}: ${mud.length} item(ns) corrigido(s) com aprovação do autor (${mud.map(chave).join(', ')})` +
      (fora.length ? `; FORA DA LISTA: ${fora.map(chave).join(', ')}` : ''));
  }
  const bytes = a.vals[cfg.v].texto === b.vals[cfg.v].texto;
  const n = Array.isArray(a.vals[cfg.v].valor) ? a.vals[cfg.v].valor.length : Object.keys(a.vals[cfg.v].valor).length;
  ok(igual, `${cfg.v.padEnd(15)} ${String(n).padStart(5)} itens, mesmo valor${bytes ? ' (texto idêntico)' : ' (só formatação difere)'}`);
}

// 3. Resto do arquivo. Era idêntico na v72 (Etapa 1); a partir da Etapa 3 o código muda de propósito
//    (PWA, limpeza), então aqui só informa. Os dados e as contagens continuam obrigatórios.
if (a.resto === b.resto) console.log(`OK    HTML/CSS/código fora dos dados idêntico à v71 (${a.resto.length} caracteres)`);
else {
  let i = 0; while (a.resto[i] === b.resto[i]) i++;
  const lin = a.resto.slice(0, i).split('\n').length;
  console.log(`INFO  HTML/CSS/código difere da v71 (esperado após mudanças de código); 1ª diferença perto da linha ${lin} ` +
    `(${a.resto.length} → ${b.resto.length} caracteres)`);
}
ok(/var CALC_ITEMS = CALCS\.map\(/.test(B), 'CALC_ITEMS continua derivado de CALCS');

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO OK');
process.exit(falhas ? 1 : 0);
