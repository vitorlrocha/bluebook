// Lote 04 da calculadora pediátrica (prioridade 3): rótulos FDA lidos em 18/11/2026 pelo DailyMed (NLM/NIH).
// Uso: node curadoria/ped-lote-04.js  (acrescenta no fim; na cefuroxima, só acrescenta a via EV)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'PED_DB');
const P = L.lerDados(cfg);
const R = (x) => 'Conferida em 11/2026 com o rótulo FDA (DailyMed, 11/2026) ' + x;

const NOVOS = [
  { k: 'cefepima', n: 'Cefepima', v: [
    { via: 'EV (até 40 kg)', d: [50, 50], dd: 50, b: 'dose', f: 2, mx: 2000, fonte: 'Ref',
      ob: '50 mg/kg por dose de 12/12 h (infecção urinária, pele, pneumonia); de 8/8 h na neutropenia febril (mude doses/dia para 3). Teto por dose = dose de adulto (2 g). Ajustar na insuficiência renal.',
      ap: [{ l: 'Frasco 1 g + 10 mL de diluente ≈ 100 mg/mL (EV)', c: 100 }],
      rev: R('da cefepima: pediatria até 40 kg 50 mg/kg/dose de 12/12 h, 8/8 h na neutropenia febril; adulto até 2 g/dose') },
  ] },
  { k: 'cefotaxima', n: 'Cefotaxima', v: [
    { via: 'EV/IM (1 mês a 12 anos, < 50 kg)', d: [50, 180], dd: 100, b: 'dia', f: 4, mxd: 12000, fonte: 'Ref',
      ob: '50 a 180 mg/kg/dia divididos em 4 a 6 doses iguais. Recém-nascido: 50 mg/kg/dose de 12/12 h (0-7 dias) ou de 8/8 h (8-28 dias). A partir de 50 kg: dose de adulto, até 12 g/dia.',
      ap: [{ l: 'Frasco 1 g + 10 mL de diluente ≈ 95 mg/mL (EV)', c: 95 }],
      rev: R('do Claforan (cefotaxima): 29 dias-12 anos < 50 kg 50-180 mg/kg/dia em 4-6 doses; neonatos 50 mg/kg 12/12 h ou 8/8 h; máx. 12 g/dia') },
  ] },
  { k: 'montelucaste', n: 'Montelucaste', v: [
    { via: 'VO (asma)', fonte: 'Ref',
      fixo: '1 vez ao dia, à noite: 2 a 5 anos 4 mg (comprimido mastigável ou granulado); 6 a 14 anos 5 mg (mastigável); a partir de 15 anos 10 mg. Não tomar outra dose em menos de 24 h.',
      ob: 'Dose fixa por idade. Alerta do rótulo: eventos neuropsiquiátricos (agitação, pesadelos, depressão, ideação suicida) — orientar a família e suspender se aparecerem.',
      ap: [{ l: 'Comprimido mastigável 4 mg e 5 mg; granulado 4 mg; comprimido 10 mg' }],
      rev: R('do montelucaste sódico: asma 2-5 anos 4 mg, 6-14 anos 5 mg, ≥ 15 anos 10 mg 1x/dia') },
  ] },
  { k: 'oxcarbazepina', n: 'Oxcarbazepina', v: [
    { via: 'VO (adjuvante, 2 a 16 anos)', d: [8, 10], dd: 8, b: 'dia', f: 2, mxd: 600, fonte: 'Ref',
      ob: 'Início: 8 a 10 mg/kg/dia em 2 tomadas, em geral sem passar de 600 mg/dia. Manutenção (alcançada em 2 semanas) pelo peso: 20-29 kg 900 mg/dia; 29,1-39 kg 1.200 mg/dia; > 39 kg 1.800 mg/dia. De 2 a < 4 anos pode precisar de até 60 mg/kg/dia. O teto de 600 mg/dia aqui vale só para o início.',
      ap: [{ l: 'Suspensão oral 60 mg/mL', c: 60 }, { l: 'Comprimido 300 mg', mg: 300, u: 'comprimido(s)' }],
      rev: R('da oxcarbazepina suspensão: 2-16 anos início 8-10 mg/kg/dia (até 600 mg/dia) 2x/dia; manutenção por peso 900/1.200/1.800 mg/dia') },
  ] },
  { k: 'topiramato', n: 'Topiramato', v: [
    { via: 'VO (adjuvante, 2 a 16 anos)', d: [5, 9], dd: 5, b: 'dia', f: 2, mdk: 9, fonte: 'Ref',
      ob: 'Alvo de cerca de 5 a 9 mg/kg/dia em 2 tomadas. Início: 25 mg/dia (ou 1 a 3 mg/kg/dia) à noite na 1ª semana; aumentar 1 a 3 mg/kg/dia a cada 1-2 semanas. Pode baixar o bicarbonato (acidose metabólica) e causar oligoidrose/febre: hidratar e monitorar.',
      ap: [{ l: 'Comprimido 25 mg', mg: 25, u: 'comprimido(s)' }, { l: 'Comprimido 50 mg', mg: 50, u: 'comprimido(s)' }],
      rev: R('do topiramato: adjuvante 2-16 anos ~5-9 mg/kg/dia em 2 tomadas; início 25 mg (1-3 mg/kg/dia) à noite') },
  ] },
  { k: 'valaciclovir', n: 'Valaciclovir', v: [
    { via: 'VO (varicela, 2 a < 18 anos)', d: [20, 20], dd: 20, b: 'dose', f: 3, mx: 1000, fonte: 'Ref',
      ob: 'Varicela em imunocompetente: 20 mg/kg 3x/dia por 5 dias, sem passar de 1 g 3x/dia; iniciar ao primeiro sinal (até 24 h do exantema). Herpes labial: só a partir de 12 anos (dose de adulto).',
      ap: [{ l: 'Comprimido 500 mg', mg: 500, u: 'comprimido(s)' }],
      rev: R('do valaciclovir: varicela 2-< 18 anos 20 mg/kg 3x/dia por 5 dias, máx. 1 g 3x/dia') },
  ] },
];

let n = 0;
for (const e of NOVOS) {
  if (P.some((x) => x.k === e.k)) { console.log('já existe, pulado:', e.k); continue; }
  P.push(e); n++;
}
// Cefuroxima: a entrada existente (VO) ganha a via EV, do rótulo da cefuroxima sódica injetável
const cfu = P.find((x) => x.k === 'cefuroxima');
if (cfu && !cfu.v.some((r) => /^EV/.test(r.via))) {
  cfu.v.push({ via: 'EV/IM (> 3 meses)', d: [50, 100], dd: 75, b: 'dia', f: 3, mxd: 6000, fonte: 'Ref',
    ob: '50 a 100 mg/kg/dia divididos de 6/6 ou 8/8 h; 100 mg/kg/dia nas infecções graves; osso e articulação 150 mg/kg/dia de 8/8 h — sem passar da dose máxima de adulto. Ajustar na insuficiência renal.',
    ap: [{ l: 'Frasco 750 mg + 8,3 mL de água para injeção ≈ 90 mg/mL (EV)', c: 90 }],
    rev: R('da cefuroxima sódica injetável: > 3 meses 50-100 mg/kg/dia de 6/6 ou 8/8 h; osso 150 mg/kg/dia; sem passar da dose de adulto') });
  n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, P), 'utf8');
console.log('OK', n, 'inclusão(ões) na calculadora pediátrica; total', P.length);
