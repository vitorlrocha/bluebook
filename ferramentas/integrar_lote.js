// Integra lotes de doenças APROVADOS (curadoria/lote-NN.json) ao acervo (dados/diseases.json).
// Uso: node ferramentas/integrar_lote.js curadoria/lote-01.json [curadoria/lote-02.json ...] [--aplicar]
// Sem --aplicar só mostra o que faria. Regras: acrescenta no FIM (as originais não mudam), recusa nome repetido
// (no acervo ou entre lotes), exige os 10 campos, a linha "Base:" e CID existente; marca a origem no campo "orig"
// ("lote-NN"), usado pelo app para mostrar "Literatura · não conferido pelo autor".
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib_dados');

const args = process.argv.slice(2);
const aplicar = args.includes('--aplicar');
const lotes = args.filter((a) => !a.startsWith('--'));
if (!lotes.length) { console.error('informe ao menos um lote'); process.exit(2); }

const cfg = L.VARS.find((c) => c.v === 'DISEASES');
const D = L.lerDados(cfg);
const C = L.lerDados(L.VARS.find((c) => c.v === 'CID_FULL'));
const cids = new Set(C.cat.map((c) => c[0]).concat(C.sub.map((s) => s[0])));
const CAMPOS = ['area', 'nome', 'introducao', 'criterios', 'exames', 'tratamento', 'conduta', 'prescricao', 'cid', 'esp'];
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const nomes = new Set(D.map((d) => norm(d.nome)));

let novos = [], erros = [];
for (const arq of lotes) {
  const j = JSON.parse(fs.readFileSync(path.resolve(arq), 'utf8').replace(/^﻿/, ''));
  const tag = 'lote-' + String(j.lote).padStart(2, '0');
  for (const it of j.doencas || []) {
    const r = it.registro || {};
    const rot = `${tag} · ${r.nome}`;
    const faltam = CAMPOS.filter((k) => typeof r[k] !== 'string' || !r[k].trim());
    if (faltam.length) { erros.push(`${rot}: campos vazios ${faltam.join(', ')}`); continue; }
    if (!/(^|\n)\s*Base\s*:/i.test(r.prescricao)) { erros.push(`${rot}: prescrição sem linha "Base:"`); continue; }
    const ruins = r.cid.split(/[,;]/).map((c) => c.trim().toUpperCase().replace('.', '')).filter(Boolean).filter((c) => !cids.has(c));
    if (ruins.length) { erros.push(`${rot}: CID inexistente ${ruins.join(', ')}`); continue; }
    if (nomes.has(norm(r.nome))) { erros.push(`${rot}: nome já existe no acervo — pulado`); continue; }
    nomes.add(norm(r.nome));
    const novo = {}; CAMPOS.forEach((k) => { novo[k] = r[k]; }); novo.orig = tag;
    novos.push(novo);
  }
}
erros.forEach((e) => console.log('AVISO ' + e));
console.log(`${novos.length} doença(s) a acrescentar (acervo: ${D.length} → ${D.length + novos.length})`);
if (!aplicar) { console.log('(simulação; use --aplicar para gravar)'); process.exit(0); }
const arqDados = path.join(L.RAIZ, 'dados', cfg.arq);
const texto = L.formatarArquivo ? L.formatarArquivo(cfg, D.concat(novos)) : JSON.stringify(D.concat(novos), null, 1);
fs.writeFileSync(arqDados, texto, 'utf8');
console.log('OK gravado em ' + path.relative(L.RAIZ, arqDados));
