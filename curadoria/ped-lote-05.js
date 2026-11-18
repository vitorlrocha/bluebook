// Lote 05 da calculadora pediátrica (prioridade 3): rótulos FDA lidos em 18/11/2026 pelo DailyMed (NLM/NIH).
// Uso: node curadoria/ped-lote-05.js  (acrescenta no fim; não altera os existentes)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'PED_DB');
const P = L.lerDados(cfg);
const R = (x) => 'Conferida em 11/2026 com o rótulo FDA (DailyMed, 11/2026) ' + x;

const NOVOS = [
  { k: 'linezolida', n: 'Linezolida', v: [
    { via: 'EV/VO (do nascimento a 11 anos)', d: [10, 10], dd: 10, b: 'dose', f: 3, mx: 600, fonte: 'Ref',
      ob: '10 mg/kg de 8/8 h (pneumonia, infecção complicada de pele, enterococo resistente à vancomicina), por 10 a 14 dias. Na infecção de pele não complicada, de 5 a 11 anos, o intervalo é de 12/12 h. A partir de 12 anos: 600 mg de 12/12 h.',
      ap: [{ l: 'Solução injetável 2 mg/mL (bolsa 300 mL)', c: 2 }, { l: 'Comprimido 600 mg', mg: 600, u: 'comprimido(s)' }],
      rev: R('da linezolida: do nascimento aos 11 anos 10 mg/kg de 8/8 h; ≥ 12 anos 600 mg de 12/12 h') },
  ] },
  { k: 'esomeprazol', n: 'Esomeprazol', v: [
    { via: 'VO (suspensão de liberação retardada)', fonte: 'Ref',
      fixo: '1x/dia, 1 h antes da refeição. Esofagite erosiva (DRGE): 1 mês a < 1 ano — 3-5 kg 2,5 mg; > 5-7,5 kg 5 mg; > 7,5-12 kg 10 mg (até 6 semanas); 1 a 11 anos — < 20 kg 10 mg; ≥ 20 kg 10-20 mg (8 semanas); 12 a 17 anos 20-40 mg (4-8 semanas). DRGE sintomática: 1 a 11 anos 10 mg (até 8 semanas); 12 a 17 anos 20 mg (4 semanas).',
      ob: 'Doses por faixa de peso e idade, sem cálculo por kg; doses acima de 1 mg/kg/dia (ou 1,33 mg/kg/dia no lactente) não foram estudadas.',
      ap: [{ l: 'Sachê para suspensão oral (liberação retardada)' }],
      rev: R('do esomeprazol magnésio suspensão oral: tabela pediátrica por indicação, idade e peso') },
  ] },
  { k: 'budesonida (nebulizacao)', n: 'Budesonida (nebulização)', v: [
    { via: 'Nebulização (12 meses a 8 anos)', fonte: 'Ref',
      fixo: 'Dose inicial pela terapia anterior: só broncodilatador 0,5 mg/dia (1x/dia ou 0,25 mg 2x/dia; máx. 0,5 mg/dia); corticoide inalatório 0,5 mg/dia (1x ou 2x/dia; máx. 1 mg/dia); corticoide oral 1 mg/dia (0,5 mg 2x/dia ou 1 mg 1x/dia; máx. 1 mg/dia). Usar a menor dose que controle.',
      ob: 'Asma persistente (manutenção), não para crise aguda. Usar com nebulizador a jato; enxaguar a boca depois.',
      ap: [{ l: 'Suspensão para nebulização 0,25 mg/mL e 0,5 mg/mL' }],
      rev: R('da budesonida suspensão para nebulização: 12 meses-8 anos, dose inicial e máxima conforme a terapia anterior') },
  ] },
];

let n = 0;
for (const e of NOVOS) {
  if (P.some((x) => x.k === e.k)) { console.log('já existe, pulado:', e.k); continue; }
  P.push(e); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, P), 'utf8');
console.log('OK', n, 'medicamento(s) novos na calculadora pediátrica; total', P.length);
