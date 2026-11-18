// Lote 01 da calculadora pediátrica (prioridade 3): medicamentos novos na PED_DB, cada um a partir da bula ou do
// resumo oficial lido em 18/11/2026. Uso: node curadoria/ped-lote-01.js  (acrescenta no fim; não altera os existentes)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'PED_DB');
const P = L.lerDados(cfg);
const M = '11/2026';

const NOVOS = [
  { k: 'midazolam', n: 'Midazolam', v: [
    { via: 'IV (sedação, 6 meses a 5 anos)', d: [0.05, 0.1], dd: 0.05, b: 'dose', f: 1, mx: 6, fonte: 'Ref',
      al: 'Risco de depressão respiratória e obstrução de via aérea: só com monitorização e material de ventilação. Não recomendado < 6 meses (salvo benefício maior que o risco).',
      ob: 'Titular lentamente (dose inicial em 2-3 min; esperar 2-5 min antes de repetir). Dose total até 0,6 mg/kg, sem passar de 6 mg. Em < 15 kg, diluir a 1 mg/mL.',
      ap: [{ l: 'Ampola 5 mg/mL (15 mg/3 mL ou 50 mg/10 mL)', c: 5 }, { l: 'Diluído a 1 mg/mL (< 15 kg)', c: 1 }],
      rev: 'Conferida em ' + M + ' com a bula profissional do Dormonid injetável (Farmoquímica): sedação IV 6 meses-5 anos 0,05-0,1 mg/kg, total até 0,6 mg/kg e 6 mg' },
    { via: 'IV (sedação, 6 a 12 anos)', d: [0.025, 0.05], dd: 0.025, b: 'dose', f: 1, mx: 10, fonte: 'Ref',
      al: 'Risco de depressão respiratória: só com monitorização e material de ventilação.',
      ob: 'Titular lentamente. Dose total até 0,4 mg/kg, sem passar de 10 mg. De 13 a 16 anos: doses de adulto.',
      ap: [{ l: 'Ampola 5 mg/mL (15 mg/3 mL ou 50 mg/10 mL)', c: 5 }],
      rev: 'Conferida em ' + M + ' com a bula profissional do Dormonid injetável: sedação IV 6-12 anos 0,025-0,05 mg/kg, total até 0,4 mg/kg e 10 mg' },
    { via: 'IM (sedação, 1 a 15 anos)', d: [0.05, 0.15], dd: 0.05, b: 'dose', f: 1, mx: 10, fonte: 'Ref',
      ob: 'Sedação: 5 a 10 min antes do procedimento; em geral não passar de 10 mg. Via de exceção (dolorosa): prefira a retal. Em < 15 kg, diluir a 1 mg/mL. Crise convulsiva é outra indicação, com outra dose: use o Plantão.',
      ap: [{ l: 'Ampola 5 mg/mL', c: 5 }, { l: 'Diluído a 1 mg/mL (< 15 kg)', c: 1 }],
      rev: 'Conferida em ' + M + ' com a bula profissional do Dormonid injetável: IM 1-15 anos 0,05-0,15 mg/kg, em geral até 10 mg' },
    { via: 'Retal (sedação, > 6 meses)', d: [0.3, 0.5], dd: 0.3, b: 'dose', f: 1, fonte: 'Ref',
      ob: 'Dose total única de 0,3-0,5 mg/kg com aplicador plástico na seringa (completar com água até 10 mL se o volume for pequeno); não repetir. Dose máxima em mg: PENDENTE DE VERIFICAÇÃO (a bula não traz).',
      ap: [{ l: 'Solução da ampola 5 mg/mL', c: 5 }],
      rev: 'Conferida em ' + M + ' com a bula profissional do Dormonid injetável: retal > 6 meses 0,3-0,5 mg/kg em dose única' },
  ] },
  { k: 'levetiracetam', n: 'Levetiracetam', v: [
    { via: 'VO (≥ 6 meses e < 50 kg)', d: [10, 30], dd: 10, b: 'dose', f: 2, mx: 1500, mdk: 60, fonte: 'Ref',
      ob: 'Iniciar 10 mg/kg 2x/dia; subir 10 mg/kg 2x/dia a cada 2 semanas até no máximo 30 mg/kg 2x/dia (adjuvante em crises focais). A partir de 50 kg: dose de adulto (500 a 1.500 mg 2x/dia). Até 25 kg, preferir a solução oral. Insuficiência renal: reduzir.',
      ap: [{ l: 'Solução oral 100 mg/mL', c: 100 }, { l: 'Comprimido 250 mg', mg: 250, u: 'comprimido(s)' }, { l: 'Comprimido 500 mg', mg: 500, u: 'comprimido(s)' }],
      rev: 'Conferida em ' + M + ' com o resumo das características do medicamento Keppra (EMA/emc): 10 mg/kg 2x/dia até 30 mg/kg 2x/dia; ≥ 50 kg dose de adulto' },
    { via: 'VO (1 a < 6 meses)', d: [7, 21], dd: 7, b: 'dose', f: 2, mdk: 42, fonte: 'Ref',
      ob: 'Iniciar 7 mg/kg 2x/dia; subir 7 mg/kg 2x/dia a cada 2 semanas até 21 mg/kg 2x/dia. Usar a solução oral.',
      ap: [{ l: 'Solução oral 100 mg/mL', c: 100 }],
      rev: 'Conferida em ' + M + ' com o resumo das características do medicamento Keppra (EMA/emc): 1 a < 6 meses 7 mg/kg 2x/dia até 21 mg/kg 2x/dia' },
  ] },
  { k: 'cetirizina', n: 'Cetirizina', v: [
    { via: 'VO', fonte: 'Ref',
      fixo: 'Solução oral 1 mg/mL: 2 a 6 anos 2,5 mL (2,5 mg) 2x/dia; 6 a 12 anos 5 mL (5 mg) 2x/dia; a partir de 12 anos 10 mL (10 mg) 1x/dia (pode começar com 5 mg). Contraindicada em menores de 2 anos.',
      ob: 'Dose fixa por idade. Insuficiência renal: ajustar pela depuração de creatinina (ver bula).',
      ap: [{ l: 'Solução oral 1 mg/mL' }, { l: 'Comprimido 10 mg' }],
      rev: 'Conferida em ' + M + ' com a bula profissional do Zyrtec solução oral (GSK): 2-6 anos 2,5 mg 2x/dia; 6-12 anos 5 mg 2x/dia; ≥ 12 anos 10 mg 1x/dia; contraindicada < 2 anos' },
  ] },
  { k: 'penicilina v', n: 'Penicilina V (Fenoximetilpenicilina potássica)', v: [
    { via: 'VO (< 12 anos)', d: [25000, 90000], dd: 40000, b: 'dia', f: 2, mx: 500000, un: 'UI', fonte: 'Ref',
      ob: '25.000 a 90.000 UI/kg/dia divididas em 3 a 6 tomadas; infecções leves a moderadas das vias respiratórias (inclusive ouvido): 40.000 UI/kg/dia em 2 tomadas por 10 dias. Teto por tomada igual à dose de adulto (500.000 UI). Melhor em jejum.',
      ap: [{ l: 'Solução oral 80.000 UI/mL (400.000 UI/5 mL)', c: 80000 }, { l: 'Comprimido 500.000 UI', mg: 500000, u: 'comprimido(s)' }],
      rev: 'Conferida em ' + M + ' com a bula do Pen-Ve-Oral (fenoximetilpenicilina potássica): < 12 anos 25.000-90.000 UI/kg/dia em 3-6 tomadas; vias respiratórias 40.000 UI/kg/dia em 2 tomadas; adulto até 500.000 UI por tomada' },
  ] },
];

let n = 0;
for (const e of NOVOS) {
  if (P.some((x) => x.k === e.k)) { console.log('já existe, pulado:', e.k); continue; }
  P.push(e); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, P), 'utf8');
console.log('OK', n, 'medicamento(s) novos na calculadora pediátrica; total', P.length);
