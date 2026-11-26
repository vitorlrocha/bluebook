// Prioridade 2 — PENDENTES de dose nas prescrições de doenças, lote 01 (26/11/2026).
// Só resolve o que o rótulo FDA (DailyMed, NLM/NIH) responde para a MESMA indicação/uso; o restante continua PENDENTE.
// Uso: node curadoria/pendentes-presc-01.js  (idempotente: só troca se o trecho antigo ainda estiver lá)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'DISEASES');
const D = L.lerDados(cfg);

const TROCAS = [
  ['Tifo exantemático epidêmico', 'prescricao',
    '(via oral; via parenteral: PENDENTE DE VERIFICAÇÃO)',
    '(via oral; se via parenteral: doxiciclina injetável 200 mg EV no 1º dia, em 1 ou 2 infusões, depois 100 a 200 mg/dia — rótulo FDA Doxy 100, DailyMed setid 9454f948, conferido em 11/2026)'],
  ['Anticoncepção injetável', 'prescricao',
    'via de administração: PENDENTE DE VERIFICAÇÃO (a fonte não especifica; conferir bula)',
    'via intramuscular profunda, no glúteo ou no deltoide, alternando o local (rótulo FDA da suspensão injetável de acetato de medroxiprogesterona 150 mg/mL, DailyMed setid 0476eac5, conferido em 11/2026)'],
  ['Constipação, flatulência', 'prescricao',
    '(via: PENDENTE DE VERIFICAÇÃO, a fonte não especifica)',
    '(via oral; a simeticona/dimeticona é de uso oral — rótulo FDA de simeticona, DailyMed setid 60b16b10, conferido em 11/2026)'],
  ['Miastenia gravis na gestação', 'prescricao',
    'Piridostigmina via oral, mantida na gestação com ajuste individual (dose: PENDENTE DE VERIFICAÇÃO)',
    'Piridostigmina via oral, mantida na gestação com ajuste individual (rótulo FDA Mestinon, DailyMed setid a851795e, conferido em 11/2026: dose média de 600 mg/dia — 10 comprimidos de 60 mg — em tomadas espaçadas; casos leves 60 a 360 mg/dia; casos graves até 1.500 mg/dia)'],
  ['Prótese valvar mecânica', 'prescricao',
    '(dose inicial: PENDENTE DE VERIFICAÇÃO)',
    '(dose inicial individualizada pela idade, peso, interações, comorbidades e genótipo CYP2C9/VKORC1, com RNI diário até estabilizar — rótulo FDA da varfarina, DailyMed setid 4f276251, conferido em 11/2026)'],
  ['Lesões benignas da pele do recém-nascido', 'prescricao',
    'mupirocina 2% creme ou pomada nas lesões, evitando os olhos (frequência e duração: PENDENTE DE VERIFICAÇÃO)',
    'mupirocina 2% pomada nas lesões, evitando os olhos, 3 vezes ao dia por até 10 dias; reavaliar se não houver resposta em 3 a 5 dias (rótulo FDA da mupirocina pomada, DailyMed setid b8e115ce, conferido em 11/2026; segurança estabelecida de 2 meses a 16 anos — abaixo de 2 meses, uso a critério médico)'],
];

let n = 0;
for (const [nome, campo, antigo, novo] of TROCAS) {
  const d = D.find((x) => x.nome.startsWith(nome));
  if (!d) throw new Error('doença não encontrada: ' + nome);
  if (D.indexOf(d) < 3226) throw new Error('registro original da v71, não alterar aqui: ' + nome);
  if (String(d[campo]).includes(novo)) continue;
  if (!String(d[campo]).includes(antigo)) throw new Error('trecho não encontrado em ' + nome);
  d[campo] = d[campo].replace(antigo, novo); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, D), 'utf8');
console.log('OK', n, 'trecho(s) PENDENTE resolvidos com rótulo FDA');
