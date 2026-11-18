// Lote 02 da calculadora pediátrica (prioridade 3): rótulos FDA lidos em 18/11/2026 pelo DailyMed (NLM/NIH).
// Uso: node curadoria/ped-lote-02.js  (acrescenta no fim; não altera os existentes)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'PED_DB');
const P = L.lerDados(cfg);
const M = '11/2026';
const DM = 'rótulo FDA (DailyMed, ' + M + ')';

const NOVOS = [
  { k: 'cefadroxila', n: 'Cefadroxila', v: [
    { via: 'VO', d: [30, 30], dd: 30, b: 'dia', f: 2, mxd: 2000, fonte: 'Ref',
      ob: '30 mg/kg/dia divididos de 12/12 h (infecção urinária e pele). Faringite/amigdalite estreptocócica e impetigo: 30 mg/kg/dia em dose única ou de 12/12 h, por 10 dias. Teto diário = dose de adulto (até 2 g/dia na infecção urinária; 1 g/dia na faringite e pele). Ajustar na insuficiência renal.',
      ap: [{ l: 'Suspensão 250 mg/5 mL (50 mg/mL)', c: 50 }, { l: 'Suspensão 500 mg/5 mL (100 mg/mL)', c: 100 }, { l: 'Cápsula 500 mg', mg: 500, u: 'cápsula(s)' }],
      rev: 'Conferida em ' + M + ' com o ' + DM + ' da cefadroxila: crianças 30 mg/kg/dia de 12/12 h (ou 1x/dia na faringite e impetigo); adultos 1-2 g/dia' },
  ] },
  { k: 'fentanil', n: 'Fentanil', nao: ['transdermico'], v: [
    { via: 'IV (anestesia, 2 a 12 anos)', d: [2, 3], dd: 2, b: 'dose', f: 1, un: 'mcg', fonte: 'Ref',
      al: 'Opioide potente: depressão respiratória e rigidez torácica. Só com monitorização, via aérea e naloxona disponíveis.',
      ob: 'Indução e manutenção anestésica em crianças de 2 a 12 anos: dose reduzida, a partir de 2 a 3 mcg/kg. Fora da anestesia (analgesia/sedação) e em menores de 2 anos: seguir o protocolo do serviço. Dose máxima em mcg: PENDENTE DE VERIFICAÇÃO (o rótulo não traz teto pediátrico).',
      ap: [{ l: 'Ampola 50 mcg/mL', c: 50 }],
      rev: 'Conferida em ' + M + ' com o ' + DM + ' do citrato de fentanila (Hospira): crianças de 2 a 12 anos, dose reduzida a partir de 2-3 mcg/kg' },
  ] },
  { k: 'cetamina', n: 'Cetamina', nao: ['(s-)'], v: [
    { via: 'IV (indução anestésica)', d: [1, 4.5], dd: 2, b: 'dose', f: 1, fonte: 'Ref',
      al: 'Só com monitorização e via aérea disponível. Uso anestésico por mais de 3 h em crianças ≤ 3 anos: risco de neurotoxicidade (rótulo).',
      ob: 'IV lenta em 60 s: 1 a 4,5 mg/kg (média de 2 mg/kg, anestesia de 5-10 min) ou 1 a 2 mg/kg a 0,5 mg/kg/min. A faixa é a do rótulo (sem tabela pediátrica separada). Dose máxima em mg: PENDENTE DE VERIFICAÇÃO.',
      ap: [{ l: 'Frasco 50 mg/mL', c: 50 }],
      rev: 'Conferida em ' + M + ' com o ' + DM + ' do Ketalar (cloridrato de cetamina): IV 1-4,5 mg/kg, média 2 mg/kg' },
    { via: 'IM (indução anestésica)', d: [6.5, 13], dd: 6.5, b: 'dose', f: 1, fonte: 'Ref',
      al: 'Só com monitorização e via aérea disponível.',
      ob: 'IM 6,5 a 13 mg/kg; 9 a 13 mg/kg em geral dá anestesia em 3-4 min, por 12-25 min (rótulo; a bula brasileira do Ketamin cita 9-13 mg/kg IM em crianças). Dose máxima em mg: PENDENTE DE VERIFICAÇÃO.',
      ap: [{ l: 'Frasco 50 mg/mL', c: 50 }],
      rev: 'Conferida em ' + M + ' com o ' + DM + ' do Ketalar: IM 6,5-13 mg/kg; e bula profissional do Ketamin (Cristália): crianças 9-13 mg/kg IM' },
  ] },
  { k: 'naloxona', n: 'Naloxona', v: [
    { via: 'IV/IM/SC (intoxicação por opioide)', d: [0.01, 0.1], dd: 0.01, b: 'dose', f: 1, mx: 2, fonte: 'Ref',
      ob: 'Dose inicial usual em crianças: 0,01 mg/kg IV; sem resposta, dose seguinte de 0,1 mg/kg. Recém-nascido (depressão por opioide): 0,01 mg/kg IV, IM ou SC. Repetir conforme a resposta; a ação é mais curta que a de muitos opioides (vigiar). Teto por dose = dose inicial máxima de adulto (2 mg). A AAP não recomenda IM/SC na intoxicação (absorção irregular).',
      ap: [{ l: 'Ampola 0,4 mg/mL', c: 0.4 }],
      rev: 'Conferida em ' + M + ' com o ' + DM + ' do cloridrato de naloxona: crianças 0,01 mg/kg IV, depois 0,1 mg/kg se necessário; neonatos 0,01 mg/kg; adulto inicial 0,4-2 mg' },
  ] },
];

let n = 0;
for (const e of NOVOS) {
  if (P.some((x) => x.k === e.k)) { console.log('já existe, pulado:', e.k); continue; }
  P.push(e); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, P), 'utf8');
console.log('OK', n, 'medicamento(s) novos na calculadora pediátrica; total', P.length);
