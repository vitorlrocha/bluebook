// Lote 06 da calculadora pediátrica (prioridade 3): rótulos FDA lidos em 18/11/2026 pelo DailyMed (NLM/NIH).
// Uso: node curadoria/ped-lote-06.js  (acrescenta no fim; na fenitoína, só acrescenta a via oral de manutenção)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'PED_DB');
const P = L.lerDados(cfg);
const R = (x) => 'Conferida em 11/2026 com o rótulo FDA (DailyMed, 11/2026) ' + x;
const fx = (via, texto, ob, ap, rev) => ({ via, fixo: texto, ob, ap: [{ l: ap }], fonte: 'Ref', rev: R(rev) });

const NOVOS = [
  { k: 'enalapril', n: 'Enalapril maleato', v: [
    { via: 'VO (> 1 mês)', d: [0.08, 0.58], dd: 0.08, b: 'dose', f: 1, mx: 40, fonte: 'Ref',
      ob: 'Hipertensão: iniciar 0,08 mg/kg (até 5 mg) 1x/dia e ajustar pela PA. Doses acima de 0,58 mg/kg (ou 40 mg) não foram estudadas em crianças. Evitar se TFG < 30 mL/min/1,73 m² e em recém-nascidos. Monitorar potássio e creatinina.',
      ap: [{ l: 'Comprimido 5 mg', mg: 5, u: 'comprimido(s)' }, { l: 'Comprimido 10 mg', mg: 10, u: 'comprimido(s)' }],
      rev: R('do enalapril solução oral: > 1 mês início 0,08 mg/kg (até 5 mg) 1x/dia; > 0,58 mg/kg ou 40 mg não estudados') } ] },
  { k: 'acetazolamida', n: 'Acetazolamida', v: [
    { via: 'VO (epilepsia, adjuvante)', d: [8, 30], dd: 10, b: 'dia', f: 2, mdk: 30, fonte: 'Ref',
      ob: 'Dose diária total de 8 a 30 mg/kg, dividida. Cuidado com acidose metabólica, hipopotassemia e cálculo renal. Teto em mg: PENDENTE DE VERIFICAÇÃO.',
      ap: [{ l: 'Comprimido 250 mg', mg: 250, u: 'comprimido(s)' }],
      rev: R('da acetazolamida: epilepsia 8-30 mg/kg/dia em doses divididas') } ] },
  { k: 'griseofulvina', n: 'Griseofulvina', v: [
    { via: 'VO (> 2 anos, micronizada)', d: [10, 10], dd: 10, b: 'dia', f: 1, mdk: 10, fonte: 'Ref',
      ob: '10 mg/kg/dia (forma microsize), com alimento gorduroso/leite (absorção maior); pode dividir. Segurança acima de 10 mg/kg/dia não estabelecida em > 2 anos. Tinha do couro cabeludo: tratamento por semanas (ver ficha).',
      ap: [{ l: 'Comprimido 500 mg', mg: 500, u: 'comprimido(s)' }],
      rev: R('da griseofulvina microsize: > 2 anos 10 mg/kg/dia') } ] },
  { k: 'clobazam', n: 'Clobazam', v: [
    fx('VO (Lennox-Gastaut, ≥ 2 anos)', 'Dose diária total por peso (acima de 5 mg/dia, em 2 tomadas): ≤ 30 kg — início 5 mg, dia 7: 10 mg, dia 14: 20 mg; > 30 kg — início 10 mg, dia 7: 20 mg, dia 14: 40 mg.', 'Doses fixas por faixa de peso; reduzir aos poucos ao suspender.', 'Comprimido 10 mg e 20 mg', 'do clobazam (Onfi): ≤ 30 kg 5→10→20 mg/dia; > 30 kg 10→20→40 mg/dia') ] },
  { k: 'pantoprazol', n: 'Pantoprazol', v: [
    fx('EV (DRGE com esofagite, 3 meses a 17 anos)', '1x/dia por até 7 dias: 3 meses a < 1 ano — < 12,5 kg 0,8 mg/kg; ≥ 12,5 kg 10 mg. 1 a 17 anos — até 15 kg 10 mg; > 15 a 40 kg 20 mg; > 40 kg 40 mg.', 'Passar para a via oral assim que possível. Diluição: < 1 ano ≈ 1,3 mg/mL; ≥ 1 ano ≈ 0,4 mg/mL (rótulo).', 'Pó liofilizado 40 mg', 'do pantoprazol IV (Protonix I.V.): tabela pediátrica por idade e peso') ] },
  { k: 'ciprofloxacino', n: 'Ciprofloxacino', nao: ['colirio', 'otolog', 'pomada'], v: [
    { via: 'VO (ITU complicada/pielonefrite, 1 a 17 anos)', d: [10, 20], dd: 10, b: 'dose', f: 2, mx: 750, fonte: 'Ref',
      al: 'Quinolona em criança: risco de lesão articular/tendínea. Usar só quando indicado (ex.: infecção urinária complicada).',
      ob: '10 a 20 mg/kg de 12/12 h por 10 a 21 dias; máximo de 750 mg por dose mesmo acima de 51 kg.',
      ap: [{ l: 'Comprimido 250 mg', mg: 250, u: 'comprimido(s)' }, { l: 'Comprimido 500 mg', mg: 500, u: 'comprimido(s)' }],
      rev: R('do ciprofloxacino: ITU complicada 1-17 anos 10-20 mg/kg de 12/12 h, máx. 750 mg/dose') } ] },
  { k: 'cloridrato de difenidramina', n: 'Cloridrato de difenidramina', v: [
    { via: 'EV/IM (exceto prematuro e recém-nascido)', d: [5, 5], dd: 5, b: 'dia', f: 4, mxd: 300, fonte: 'Ref',
      al: 'Contraindicada em prematuros e recém-nascidos. Pode causar excitação ou convulsão em criança pequena.',
      ob: '5 mg/kg em 24 h (ou 150 mg/m²/24 h), divididos; máximo de 300 mg/dia. Número de tomadas: PENDENTE DE VERIFICAÇÃO (aqui 4 por dia).',
      ap: [{ l: 'Ampola 50 mg/mL', c: 50 }],
      rev: R('da difenidramina injetável: pediatria (exceto prematuros e neonatos) 5 mg/kg/24 h, máx. 300 mg/dia') } ] },
  { k: 'levocetirizina', n: 'Levocetirizina', v: [
    fx('VO', '1x/dia, à noite: 6 a 11 anos 2,5 mg (½ comprimido); a partir de 12 anos 5 mg.', 'Dose fixa por idade. Ajustar na insuficiência renal (a partir de 12 anos).', 'Comprimido 5 mg', 'da levocetirizina: 6-11 anos 2,5 mg/dia; ≥ 12 anos 5 mg/dia à noite') ] },
  { k: 'levotiroxina', n: 'Levotiroxina sódica', nao: ['liotironina'], v: [
    fx('VO (hipotireoidismo)', 'Dose inicial diária por kg: 0-3 meses 10-15 mcg/kg; 3-6 meses 8-10 mcg/kg; 6-12 meses 6-8 mcg/kg; 1-5 anos 5-6 mcg/kg; 6-12 anos 4-5 mcg/kg; > 12 anos com crescimento/puberdade incompletos 2-3 mcg/kg; crescimento completo 1,6 mcg/kg.', '1x/dia em jejum; ajustar por TSH e T4 livre. Comprimido pode ser triturado e misturado em pouca água.', 'Comprimidos 25 a 200 mcg', 'da levotiroxina: tabela pediátrica de dose inicial por idade (mcg/kg/dia)') ] },
  { k: 'loperamida', n: 'Loperamida', v: [
    fx('VO (diarreia aguda, 2 a 12 anos)', '1º dia: 2-5 anos (13-20 kg) 1 mg 3x/dia; 6-8 anos (20-30 kg) 2 mg 2x/dia; 8-12 anos (> 30 kg) 2 mg 3x/dia. A partir de 13 anos: 4 mg e depois 2 mg após cada evacuação líquida.', 'Doses fixas por idade/peso. Não usar com febre alta ou sangue nas fezes; prioridade é a reidratação.', 'Cápsula 2 mg', 'da loperamida: esquema do 1º dia por idade/peso de 2 a 12 anos') ] },
  { k: 'sertralina', n: 'Sertralina', v: [
    fx('VO (TOC)', 'Início: 6 a 12 anos 25 mg/dia; 13 a 17 anos 50 mg/dia; ajustar em intervalos de pelo menos 1 semana.', 'Alerta de ideação suicida em crianças e adolescentes: acompanhar de perto.', 'Comprimido 50 mg', 'da sertralina: TOC 6-12 anos 25 mg/dia, 13-17 anos 50 mg/dia') ] },
  { k: 'anlodipino', n: 'Anlodipino besilato', v: [
    fx('VO (hipertensão, 6 a 17 anos)', '2,5 a 5 mg 1x/dia. Doses acima de 5 mg/dia não foram estudadas em crianças.', 'Dose fixa.', 'Comprimido 2,5 mg e 5 mg', 'do anlodipino: 6-17 anos 2,5-5 mg 1x/dia') ] },
  { k: 'fitomenadiona', n: 'Fitomenadiona (Vitamina K1)', v: [
    fx('IM/SC (recém-nascido)', 'Profilaxia da doença hemorrágica: 0,5 a 1 mg IM na primeira hora de vida, dose única. Tratamento: 1 mg SC ou IM.', 'EV só se inevitável, muito lento (até 1 mg/min), pelo risco de reação grave.', 'Ampola neonatal 2 mg/0,2 mL', 'da fitomenadiona: neonatos profilaxia 0,5-1 mg na 1ª hora; tratamento 1 mg SC/IM') ] },
  { k: 'metilfenidato', n: 'Metilfenidato', v: [
    fx('VO (liberação prolongada, TDAH, 6 a 17 anos)', 'Liberação prolongada (OROS): início 18 mg 1x/dia pela manhã; ajustar semanalmente. Máximo: 6 a 12 anos 54 mg/dia; 13 a 17 anos 72 mg/dia.', 'Para o comprimido de liberação imediata, ver a ficha. Monitorar PA, frequência cardíaca, peso e sono.', 'Comprimido de liberação prolongada 18, 36 e 54 mg', 'do metilfenidato liberação prolongada: início 18 mg/dia; máx. 54 mg (6-12 anos) e 72 mg (13-17 anos)') ] },
  { k: 'fluticasona (spray nasal)', n: 'Fluticasona (spray nasal)', v: [
    fx('Nasal', '4 a 11 anos: 1 jato em cada narina 1x/dia (com supervisão de adulto); a partir de 12 anos: 2 jatos em cada narina 1x/dia na 1ª semana, depois 1-2. Não usar em menores de 4 anos.', 'Dose fixa por idade.', 'Spray nasal 50 mcg/jato', 'do propionato de fluticasona spray nasal: 4-11 anos 1 jato/narina/dia; ≥ 12 anos 2 jatos') ] },
  { k: 'digoxina', n: 'Digoxina', nao: ['metildigoxina'], v: [
    fx('EV (ataque e manutenção, < 10 anos)', 'Ataque EV total (mcg/kg): prematuro 15-25; termo 20-30; 1-24 meses 30-50; 2-5 anos 25-35; 5-10 anos 15-30 — dar metade, depois ¼ a cada 6-8 h (2 vezes). Manutenção EV (mcg/kg/dose, 2x/dia): prematuro 1,9-3,1; termo 3-4,5; 1-24 meses 4,5-7,5; 2-5 anos 3,8-5,3; 5-10 anos 2,3-4,5.', 'Margem terapêutica estreita: ajustar pela função renal, nível sérico e ECG. Por via oral as doses são diferentes (ver ficha).', 'Ampola 0,25 mg/mL', 'do Lanoxin injetável: tabelas pediátricas de ataque e manutenção por idade') ] },
  { k: 'imipenem + cilastatina', n: 'Imipenem + Cilastatina', nao: ['relebactam'], v: [
    { via: 'EV (≥ 3 meses, infecção fora do SNC)', d: [15, 25], dd: 15, b: 'dose', f: 4, mxd: 4000, fonte: 'Ref',
      ob: '15 a 25 mg/kg de 6/6 h; até 4 g/dia. Menores de 3 meses (≥ 1.500 g): 4 semanas-3 meses 25 mg/kg 6/6 h; 1-4 semanas 25 mg/kg 8/8 h; < 1 semana 25 mg/kg 12/12 h. Não indicado em meningite. Até 500 mg: infundir em 20-30 min.',
      ap: [{ l: 'Frasco 500 mg + 500 mg (concentração após diluir: conforme a bula; informe abaixo)' }],
      rev: R('do Primaxin: ≥ 3 meses 15-25 mg/kg de 6/6 h (máx. 4 g/dia); < 3 meses por idade') } ] },
];

let n = 0;
for (const e of NOVOS) {
  if (P.some((x) => x.k === e.k)) { console.log('já existe, pulado:', e.k); continue; }
  P.push(e); n++;
}
// Fenitoína: a entrada existente (ataque EV) ganha a manutenção oral
const fen = P.find((x) => x.k === 'fenitoina');
if (fen && !fen.v.some((r) => /^VO/.test(r.via))) {
  fen.v.push({ via: 'VO (manutenção)', d: [4, 8], dd: 5, b: 'dia', f: 2, mxd: 300, fonte: 'Ref',
    ob: 'Início 5 mg/kg/dia em 2 ou 3 tomadas; manutenção usual 4 a 8 mg/kg/dia; até 300 mg/dia. Ajustar pelo nível sérico.',
    ap: [{ l: 'Comprimido 100 mg', mg: 100, u: 'comprimido(s)' }],
    rev: R('do Dilantin: pediatria início 5 mg/kg/dia em 2-3 tomadas, manutenção 4-8 mg/kg/dia, máx. 300 mg/dia') });
  n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, P), 'utf8');
console.log('OK', n, 'inclusão(ões) na calculadora pediátrica; total', P.length);
