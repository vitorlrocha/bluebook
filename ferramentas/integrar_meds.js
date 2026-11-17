// Integra lotes de medicamentos conferidos com bula (curadoria/meds-lote-NN.json) ao acervo (dados/seed_meds.json).
// Uso: node ferramentas/integrar_meds.js curadoria/meds-lote-01.json [...] [--aplicar]
// Sem --aplicar só mostra o que faria. Acrescenta no FIM (os medicamentos originais não mudam), recusa nome repetido,
// exige os 17 campos preenchidos, pelo menos uma fonte com URL e "Fonte:" nas observações; marca a origem no campo
// "orig" ("meds-NN"), que faz o app mostrar "Literatura · não conferido" em vez de "Revisado pelo autor".
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib_dados');

const args = process.argv.slice(2);
const aplicar = args.includes('--aplicar');
const lotes = args.filter((a) => !a.startsWith('--'));
if (!lotes.length) { console.error('informe ao menos um lote'); process.exit(2); }

const cfg = L.VARS.find((c) => c.v === 'SEED_MEDS');
const M = L.lerDados(cfg);
const CAMPOS = ['nome', 'classe', 'tarja', 'via', 'generico', 'referencias', 'apresentacoes', 'indicacoes', 'posologia',
  'contraindicacoes', 'interacoes', 'observacoes', 'gestacao', 'lactacao', 'pediatria', 'areas', 'esp'];
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const nomes = new Set(M.map((m) => norm(m.nome)));
const esps = new Set(L.lerDados(L.VARS.find((c) => c.v === 'ESPECIALIDADES')).map((e) => (typeof e === 'string' ? e : e.nome || e.n || e[0])));

const novos = [], erros = [];
for (const arq of lotes) {
  const j = JSON.parse(fs.readFileSync(path.resolve(arq), 'utf8').replace(/^﻿/, ''));
  const tag = String(j.lote).startsWith('meds-') ? j.lote : 'meds-' + String(j.lote).padStart(2, '0');
  for (const it of j.medicamentos || []) {
    const r = it.registro || {};
    const rot = `${tag} · ${r.nome}`;
    const faltam = CAMPOS.filter((k) => typeof r[k] !== 'string' || !r[k].trim());
    if (faltam.length) { erros.push(`${rot}: campos vazios ${faltam.join(', ')}`); continue; }
    if (!(it.fontes || []).some((f) => /^https?:\/\//.test(f.url || ''))) { erros.push(`${rot}: sem fonte com URL`); continue; }
    if (!/Fonte:/.test(r.observacoes)) { erros.push(`${rot}: observações sem "Fonte:"`); continue; }
    const espRuim = r.esp.split(';').map((s) => s.trim()).filter((s) => s && esps.size && !esps.has(s));
    if (espRuim.length) { erros.push(`${rot}: especialidade desconhecida ${espRuim.join(', ')}`); continue; }
    if (nomes.has(norm(r.nome))) { erros.push(`${rot}: nome já existe no acervo — pulado`); continue; }
    nomes.add(norm(r.nome));
    const novo = {}; CAMPOS.forEach((k) => { novo[k] = r[k]; }); novo.orig = tag;
    novos.push(novo);
  }
}
erros.forEach((e) => console.log('AVISO ' + e));
console.log(`${novos.length} medicamento(s) a acrescentar (acervo: ${M.length} → ${M.length + novos.length})`);
if (!aplicar) { console.log('(simulação; use --aplicar para gravar)'); process.exit(0); }
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, M.concat(novos)), 'utf8');
console.log('OK gravado em dados/' + cfg.arq);
