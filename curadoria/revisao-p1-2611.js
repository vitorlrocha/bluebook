// Revisão clínica de prioridade 1 — decisões do autor em 26/11/2026.
// 1) Fichas cujo campo Pediatria era texto de OUTRO remédio: trocado pela dose do rótulo FDA (mesma fonte da calculadora).
// 2) Hidroxizina: teto diário separado por idade, como no rótulo FDA (< 6 anos 50 mg/dia; ≥ 6 anos 100 mg/dia).
// 3) Prednisolona/prednisona na crise de asma: teto da GINA 2024 (40 mg; < 2 anos 20 mg), igual ao Plantão.
// Uso: node curadoria/revisao-p1-2611.js  (idempotente)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const salvar = (cfg, v) => fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, v), 'utf8');

// 1) Fichas
const cS = L.VARS.find((c) => c.v === 'SEED_MEDS'), S = L.lerDados(cS);
const PED = {
  'Etossuximida': 'Permitida na crise de ausência. Rótulo FDA (Zarontin, DailyMed setid 19c924c2, conferido em 11/2026): a dose ótima para a maioria das crianças é 20 mg/kg/dia, com início e aumento graduais conforme a bula. Número de tomadas e teto: PENDENTE DE VERIFICAÇÃO.',
  'Rufinamida': 'Permitida a partir de 1 ano na síndrome de Lennox-Gastaut. Rótulo FDA (DailyMed setid e2ba061a, conferido em 11/2026): início 10 mg/kg/dia em 2 tomadas com alimento, aumentando cerca de 10 mg/kg a cada 2 dias até 45 mg/kg/dia (máx. 3.200 mg/dia). Com valproato, começar abaixo de 10 mg/kg/dia.',
  'Estiripentol': 'Permitido a partir de 6 meses e 7 kg na síndrome de Dravet. Rótulo FDA (Diacomit, DailyMed setid 58304ba8, conferido em 11/2026): 50 mg/kg/dia em 2 ou 3 tomadas (abaixo de 1 ano, no máximo 2 tomadas por dia); máx. 3.000 mg/dia.',
  'Felbamato': 'Síndrome de Lennox-Gastaut de 2 a 14 anos, como terapia adjuvante. Rótulo FDA (Felbatol, DailyMed setid 2f522701, conferido em 11/2026): início 15 mg/kg/dia em 3 ou 4 tomadas, reduzindo os outros anticonvulsivantes em 20%, e aumento de 15 mg/kg/dia por semana até 45 mg/kg/dia. Teto em mg: PENDENTE DE VERIFICAÇÃO.',
  'Sulfadiazina (oral)': 'Contraindicada abaixo de 2 meses, exceto junto com pirimetamina na toxoplasmose congênita. Rótulo FDA (sulfadiazina, DailyMed setid 6032d6f7, conferido em 11/2026): acima de 2 meses, começar com metade da dose de 24 h; manutenção 150 mg/kg/dia (ou 4 g/m²) em 4 a 6 tomadas, máx. 6 g/dia. Profilaxia de febre reumática: < 30 kg 500 mg/dia; > 30 kg 1 g/dia.',
};
for (const [nome, txt] of Object.entries(PED)) {
  const m = S.find((x) => x.nome === nome);
  if (!m) throw new Error('ficha não encontrada: ' + nome);
  console.log(nome + ':\n  antes: ' + m.pediatria + '\n  agora: ' + txt);
  m.pediatria = txt;
}
salvar(cS, S);

// 2) e 3) Calculadora pediátrica
const cP = L.VARS.find((c) => c.v === 'PED_DB'), P = L.lerDados(cP);
const hid = P.find((e) => e.k === 'hidroxizina');
if (hid.v.length === 1) {
  const base = hid.v[0];
  const rev = 'Conferida em 11/2026 com o rótulo FDA do cloridrato de hidroxizina (DailyMed): < 6 anos máx. 50 mg/dia; ≥ 6 anos 50-100 mg/dia. Teto separado por idade em 26/11/2026 (revisão P1).';
  hid.v = [
    Object.assign({}, base, { via: 'VO (< 6 anos)', mxd: 50, rev }),
    Object.assign({}, base, { via: 'VO (≥ 6 anos)', mxd: 100, rev }),
  ];
}
const HOB = 'HILF: peso ÷ 3 = mL a cada 8 h (≈ 0,67 mg/kg/dose; 2 mg/kg/dia). Sedação: 0,6 mg/kg dose única (rótulo).';
hid.v[0].ob = HOB + ' Rótulo: prurido/ansiedade abaixo de 6 anos, máx. 50 mg/dia em doses divididas.';
hid.v[1].ob = HOB + ' Rótulo: prurido/ansiedade a partir de 6 anos, 50-100 mg/dia em doses divididas.';
const GINA = 'Teto da GINA 2024 na crise de asma, igual ao Plantão (decisão do autor, 26/11/2026). Entre 2 e 5 anos a GINA pode trazer teto menor: PENDENTE DE VERIFICAÇÃO.';
for (const k of ['prednisolona', 'prednisona']) {
  const e = P.find((x) => x.k === k);
  if (e.v.some((v) => /asma/.test(v.via))) continue;
  const base = e.v[0], rev = base.rev + '. ' + GINA;
  e.v = [
    Object.assign({}, base, { via: 'VO (crise de asma, ≥ 2 anos)', mx: 40, ob: '1-2 mg/kg/dia 1x/dia por 3-5 dias, máx. 40 mg/dia (GINA 2024). ' + base.ob, rev }),
    Object.assign({}, base, { via: 'VO (crise de asma, < 2 anos)', mx: 20, ob: '1-2 mg/kg/dia 1x/dia por 3-5 dias, máx. 20 mg/dia abaixo de 2 anos (GINA 2024). ' + base.ob, rev }),
    Object.assign({}, base, { via: 'VO (outras indicações)', ob: base.ob + ' Teto de 60 mg da diretriz NHLBI; na asma use as vias acima.' }),
  ];
}
// 4) Formas tópicas que herdavam a dose sistêmica pela regra de começo de nome (ex.: "Prednisolona (colírio)" mostrava
//    a dose oral). Só acrescenta exclusões ("nao"); nenhuma dose muda. Lidocaína gel (oral) continua com a dose máxima.
const TOP = {
  hidrocortisona: ['creme', 'pomada'], dexametasona: ['colirio', 'pomada', 'creme'], metronidazol: ['gel', 'creme', 'vaginal'],
  prednisolona: ['colirio'], aciclovir: ['pomada', 'creme'], gentamicina: ['colirio', 'pomada', 'creme'], clindamicina: ['gel', 'creme', 'locao'],
  ivermectina: ['creme', 'locao'], dexclorfeniramina: ['creme'],
};
for (const [k, nao] of Object.entries(TOP)) {
  const e = P.find((x) => x.k === k);
  if (!e) throw new Error('sem entrada: ' + k);
  if (e.v.some((v) => !/conferid/i.test(v.rev || ''))) throw new Error('entrada sem conferência: ' + k);
  e.nao = [...new Set((e.nao || []).concat(nao))];
}
salvar(cP, P);
console.log('OK');
