// Lote 03 da calculadora pediátrica (prioridade 3): rótulos FDA lidos em 18/11/2026 pelo DailyMed (NLM/NIH).
// Uso: node curadoria/ped-lote-03.js  (acrescenta no fim; não altera os existentes)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'PED_DB');
const P = L.lerDados(cfg);
const R = (x) => 'Conferida em 11/2026 com o rótulo FDA (DailyMed, 11/2026) ' + x;

const NOVOS = [
  { k: 'ceftazidima', n: 'Ceftazidima', v: [
    { via: 'EV (1 mês a 12 anos)', d: [30, 50], dd: 30, b: 'dose', f: 3, mxd: 6000, fonte: 'Ref',
      ob: '30 a 50 mg/kg EV de 8/8 h, até 6 g/dia; a dose maior fica para imunodeprimidos ou fibrose cística. Recém-nascido (0-4 semanas): 30 mg/kg de 12/12 h. Ajustar na insuficiência renal.',
      ap: [{ l: 'Frasco 1 g (concentração após reconstituir: conforme a bula do produto; informe abaixo)' }],
      rev: R('da ceftazidima: 1 mês-12 anos 30-50 mg/kg de 8/8 h até 6 g/dia; neonatos 30 mg/kg de 12/12 h') },
  ] },
  { k: 'amicacina', n: 'Amicacina', v: [
    { via: 'EV/IM', d: [15, 15], dd: 15, b: 'dia', f: 2, mxd: 1500, mdk: 15, fonte: 'Ref',
      al: 'Nefrotoxicidade e ototoxicidade: dose total de todas as vias até 15 mg/kg/dia; monitorar função renal e, se possível, nível sérico.',
      ob: '15 mg/kg/dia divididos em 2 ou 3 doses iguais (7,5 mg/kg de 12/12 h ou 5 mg/kg de 8/8 h); não passar de 1,5 g/dia. Ajustar na insuficiência renal.',
      ap: [{ l: 'Ampola 50 mg/mL (100 mg/2 mL)', c: 50 }, { l: 'Ampola 250 mg/mL (500 mg/2 mL)', c: 250 }],
      rev: R('da amicacina: adultos, crianças e lactentes 15 mg/kg/dia em 2-3 doses, máx. 1,5 g/dia') },
  ] },
  { k: 'piperacilina + tazobactam', n: 'Piperacilina + Tazobactam', v: [
    { via: 'EV (> 9 meses e até 40 kg)', d: [112.5, 112.5], dd: 112.5, b: 'dose', f: 3, mx: 4500, fonte: 'Ref',
      ob: '112,5 mg/kg (100 mg de piperacilina + 12,5 mg de tazobactam) EV em 30 min: de 8/8 h na apendicite/peritonite; de 6/6 h na pneumonia hospitalar (mude doses/dia para 4). Acima de 40 kg: dose de adulto. Dose pediátrica na insuficiência renal não definida.',
      ap: [{ l: 'Frasco 4,5 g + 20 mL de diluente = 202,5 mg/mL (diluir depois a 20-80 mg/mL de piperacilina)', c: 202.5 }],
      rev: R('da piperacilina-tazobactam: > 9 meses 112,5 mg/kg de 8/8 h (apendicite/peritonite) ou 6/6 h (pneumonia hospitalar); > 40 kg adulto') },
    { via: 'EV (2 a 9 meses)', d: [90, 90], dd: 90, b: 'dose', f: 3, fonte: 'Ref',
      ob: '90 mg/kg (80 mg de piperacilina + 10 mg de tazobactam) EV em 30 min: de 8/8 h na apendicite/peritonite; de 6/6 h na pneumonia hospitalar. Dose máxima em mg: PENDENTE DE VERIFICAÇÃO (o rótulo não traz teto nessa faixa).',
      ap: [{ l: 'Frasco 2,25 g + 10 mL de diluente = 202,5 mg/mL (diluir depois a 20-80 mg/mL de piperacilina)', c: 202.5 }],
      rev: R('da piperacilina-tazobactam: 2-9 meses 90 mg/kg de 8/8 h ou 6/6 h conforme a indicação') },
  ] },
  { k: 'eritromicina', n: 'Eritromicina', nao: ['gel', 'topic', 'colirio', 'pomada'], v: [
    { via: 'VO (etilsuccinato/estearato)', d: [30, 50], dd: 40, b: 'dia', f: 4, mxd: 4000, fonte: 'Ref',
      ob: '30 a 50 mg/kg/dia divididos de 6/6 h nas infecções leves a moderadas; nas graves a dose pode ser dobrada; até 4 g/dia. Confira o sal e a concentração do frasco.',
      ap: [{ l: 'Suspensão 125 mg/5 mL (25 mg/mL)', c: 25 }, { l: 'Suspensão 250 mg/5 mL (50 mg/mL)', c: 50 }],
      rev: R('do etilsuccinato de eritromicina: crianças 30-50 mg/kg/dia de 6/6 h, graves até o dobro, até 4 g/dia') },
  ] },
  { k: 'flumazenil', n: 'Flumazenil', v: [
    { via: 'EV (> 1 ano)', d: [0.01, 0.01], dd: 0.01, b: 'dose', f: 1, mx: 0.2, fonte: 'Ref',
      al: 'Pode precipitar convulsão (uso crônico de benzodiazepínico, antidepressivo tricíclico). A sedação pode voltar: vigiar.',
      ob: '0,01 mg/kg (até 0,2 mg) EV em 15 s; sem resposta em 45 s, repetir 0,01 mg/kg (até 0,2 mg) a cada 60 s, no máximo 4 vezes; dose total até 0,05 mg/kg ou 1 mg, o que for menor. Eficácia estabelecida a partir de 1 ano.',
      ap: [{ l: 'Ampola 0,1 mg/mL (0,5 mg/5 mL)', c: 0.1 }],
      rev: R('do flumazenil: > 1 ano 0,01 mg/kg (até 0,2 mg), repetir até 4 vezes, total até 0,05 mg/kg ou 1 mg') },
  ] },
];

let n = 0;
for (const e of NOVOS) {
  if (P.some((x) => x.k === e.k)) { console.log('já existe, pulado:', e.k); continue; }
  P.push(e); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, P), 'utf8');
console.log('OK', n, 'medicamento(s) novos na calculadora pediátrica; total', P.length);
