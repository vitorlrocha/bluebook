// Lote 08 da calculadora pediátrica (prioridade 3): segunda rodada de rótulos FDA do DailyMed (NLM/NIH), 24/11/2026.
// Cada entrada foi escrita a partir do trecho lido do rótulo (setid no campo rev); sem número no rótulo = PENDENTE.
// Uso: node curadoria/ped-lote-08.js  (acrescenta no fim; não altera os existentes)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'PED_DB');
const P = L.lerDados(cfg);
const R = (nome, setid, x) => 'Conferida em 11/2026 com o rótulo FDA de ' + nome + ' (DailyMed setid ' + setid.slice(0, 8) + '): ' + x;
const C = (via, o, rev) => Object.assign({ via, b: 'dose', f: 1, fonte: 'Ref', rev }, o);
const F = (via, fixo, ob, ap, rev) => ({ via, fixo, ob, ap: [{ l: ap }], fonte: 'Ref', rev });
const PEND = ' Dose máxima em mg: PENDENTE DE VERIFICAÇÃO (o trecho lido do rótulo não traz teto pediátrico).';

const NOVOS = [
  { k: 'baloxavir marboxila', n: 'Baloxavir marboxila', v: [F('VO (influenza, ≥ 5 anos)', 'Dose única: 20 a < 80 kg — 40 mg; 80 kg ou mais — 80 mg. Suspensão oral (frasco): < 20 kg — 2 mg/kg; 20 a < 80 kg — 40 mg (20 mL).', 'Dose única, o mais cedo possível após o início dos sintomas.', 'Comprimido 20 e 40 mg', R('Xofluza', 'b58b2899', '≥ 5 anos: 20-< 80 kg 40 mg; ≥ 80 kg 80 mg; suspensão < 20 kg 2 mg/kg'))] },
  { k: 'beractanto', n: 'Beractanto', v: [C('Intratraqueal (prematuro com SDR)', { d: [100, 100], dd: 100, un: 'mg (fosfolipídios)',
    ob: '100 mg de fosfolipídios/kg de peso ao nascer (4 mL/kg) por dose; até 4 doses, com intervalo de pelo menos 6 h, nas primeiras 48 h de vida.',
    ap: [{ l: 'Suspensão 25 mg/mL', c: 25 }] }, R('Survanta', '7ef9e3a5', '100 mg/kg (4 mL/kg), até 4 doses, ≥ 6 h, até 48 h de vida'))] },
  { k: 'poractanto alfa', n: 'Poractanto alfa', v: [C('Intratraqueal (prematuro com SDR)', { d: [200, 200], dd: 200, un: 'mg (fosfolipídios)', mdk: 400,
    ob: 'Dose inicial 2,5 mL/kg de peso ao nascer (200 mg/kg). Até 2 doses adicionais de 1,25 mL/kg (100 mg/kg) a cada ≈ 12 h. Total máximo 5 mL/kg (400 mg/kg).',
    ap: [{ l: 'Suspensão 80 mg/mL', c: 80 }] }, R('Curosurf', '99bef307', 'inicial 2,5 mL/kg; repetir 1,25 mL/kg até 2x; total máx. 5 mL/kg'))] },
  { k: 'efavirenz', n: 'Efavirenz', v: [F('VO (HIV, ≥ 3 anos e ≥ 10 kg)', '1x/dia por peso: 10-< 15 kg 200 mg; 15-< 20 kg 250 mg; 20-< 25 kg 300 mg; 25-< 32,5 kg 350 mg; 32,5-< 40 kg 400 mg; ≥ 40 kg 600 mg.', 'Com rifampicina e ≥ 50 kg: 800 mg/dia.', 'Comprimido 600 mg', R('Sustiva', '04b5c345', 'tabela pediátrica por peso; > 40 kg 600 mg'))] },
  { k: 'hidroxicloroquina', n: 'Hidroxicloroquina (sulfato)', v: [C('VO (malária, profilaxia, ≥ 31 kg)', { d: [6.5, 6.5], dd: 6.5, mx: 400,
    ob: 'Profilaxia: 6,5 mg/kg (até 400 mg) 1x por semana, começando 2 semanas antes da viagem e mantendo 4 semanas após. Tratamento (≥ 31 kg): 13 mg/kg (até 800 mg), depois 6,5 mg/kg (até 400 mg) com 6, 24 e 48 h. Acima de 5 mg/kg/dia em uso crônico aumenta o risco de retinopatia.',
    ap: [{ l: 'Comprimido 200 mg', mg: 200, u: 'comprimido(s)' }] }, R('Plaquenil', '34496b43', '≥ 31 kg profilaxia 6,5 mg/kg até 400 mg/semana; tratamento 13 mg/kg e 6,5 mg/kg'))] },
  { k: 'lansoprazol', n: 'Lansoprazol', v: [F('VO (DRGE)', '1 a 11 anos (DRGE e esofagite erosiva, até 12 semanas): ≤ 30 kg 15 mg 1x/dia; > 30 kg 30 mg 1x/dia. 12 a 17 anos: DRGE não erosiva 15 mg 1x/dia (até 8 semanas); esofagite erosiva 30 mg 1x/dia.', 'Dose fixa por peso/idade.', 'Cápsula 15 e 30 mg', R('Prevacid', '71ba78cb', '1-11 anos ≤ 30 kg 15 mg, > 30 kg 30 mg; 12-17 anos 15 ou 30 mg'))] },
  { k: 'losartana', n: 'Losartana potássica', v: [C('VO (hipertensão, criança)', { d: [0.7, 1.4], dd: 0.7, mx: 100,
    ob: 'Início 0,7 mg/kg 1x/dia (até 50 mg); ajustar pela PA. Doses acima de 1,4 mg/kg (ou 100 mg) por dia não foram estudadas em crianças.',
    ap: [{ l: 'Comprimido 50 mg', mg: 50, u: 'comprimido(s)' }] }, R('Cozaar', '9949448f', 'início 0,7 mg/kg (até 50 mg); > 1,4 mg/kg ou 100 mg não estudados'))] },
  { k: 'naproxeno', n: 'Naproxeno', nao: ['sodico'], v: [C('VO (artrite idiopática juvenil, > 2 anos)', { d: [10, 10], dd: 10, b: 'dia', f: 2, mdk: 15,
    ob: '≈ 10 mg/kg/dia em 2 tomadas. Em > 2 anos, doses únicas de 2,5-5 mg/kg (suspensão), sem passar de 15 mg/kg/dia.',
    ap: [{ l: 'Comprimido 250 mg', mg: 250, u: 'comprimido(s)' }] }, R('naproxeno', '307aa67f', 'AIJ ≈ 10 mg/kg/dia em 2 tomadas; máx. 15 mg/kg/dia'))] },
  { k: 'posaconazol', n: 'Posaconazol', v: [C('EV (profilaxia, ≥ 2 anos e ≥ 10 kg)', { d: [6, 6], dd: 6, f: 1, mx: 300,
    ob: 'Ataque: 6 mg/kg (até 300 mg) 2x no 1º dia; manutenção 6 mg/kg (até 300 mg) 1x/dia a partir do 2º dia. Comprimido de liberação retardada só acima de 40 kg (300 mg 2x no 1º dia, depois 1x/dia).',
    ap: [{ l: 'Frasco EV 300 mg (concentração após diluir: informe abaixo)' }] }, R('Noxafil', 'b073b082', 'EV ≥ 10 kg 6 mg/kg (máx. 300 mg) 2x no dia 1, depois 1x/dia'))] },
  { k: 'pregabalina', n: 'Pregabalina', v: [
    C('VO (crises focais, ≥ 30 kg)', { d: [2.5, 10], dd: 2.5, b: 'dia', f: 2, mdk: 10, mxd: 600, ob: 'Início 2,5 mg/kg/dia; máximo 10 mg/kg/dia (até 600 mg), em 2 ou 3 tomadas.', ap: [{ l: 'Cápsula 50 mg', mg: 50, u: 'cápsula(s)' }, { l: 'Cápsula 75 mg', mg: 75, u: 'cápsula(s)' }] }, R('Lyrica', '60185c88', '≥ 30 kg 2,5 → 10 mg/kg/dia (máx. 600 mg)')),
    C('VO (crises focais, < 30 kg, ≥ 1 mês)', { d: [3.5, 14], dd: 3.5, b: 'dia', f: 3, mdk: 14, ob: 'Início 3,5 mg/kg/dia; máximo 14 mg/kg/dia. 1 mês a < 4 anos: 3 tomadas/dia; ≥ 4 anos: 2 ou 3 tomadas.', ap: [{ l: 'Cápsula 50 mg', mg: 50, u: 'cápsula(s)' }] }, R('Lyrica', '60185c88', '< 30 kg 3,5 → 14 mg/kg/dia'))] },
  { k: 'quetiapina', n: 'Quetiapina', v: [F('VO', 'Esquizofrenia (13-17 anos): dia 1 25 mg 2x/dia, aumentando até 400-800 mg/dia (máx. 800 mg/dia). Mania bipolar (10-17 anos, monoterapia): dia 1 25 mg 2x/dia, com aumento progressivo (ver bula).', 'Dose fixa com escalonamento.', 'Comprimido 25 mg', R('Seroquel', '8ae62aaf', 'adolescentes 13-17 anos esquizofrenia 400-800 mg/dia; bipolar 10-17 anos início 25 mg 2x/dia'))] },
  { k: 'tenofovir (disoproxila)', n: 'Tenofovir (disoproxila)', v: [F('VO (≥ 12 anos e ≥ 35 kg)', '300 mg 1x/dia, com ou sem alimento (HIV-1 ou hepatite B crônica).', 'Abaixo de 35 kg o rótulo traz outras formulações (pó oral).', 'Comprimido 300 mg', R('Viread', '1fdae465', '≥ 12 anos e ≥ 35 kg 300 mg 1x/dia'))] },
  { k: 'valsartana', n: 'Valsartana', v: [C('VO (hipertensão, 1 a 16 anos)', { d: [1, 4], dd: 1, mx: 160,
    ob: 'Início 1 mg/kg 1x/dia (até 40 mg); em casos selecionados 2 mg/kg. Ajustar pela PA até 4 mg/kg 1x/dia (máx. 160 mg/dia). De 1 a 5 anos, preferir a suspensão oral.',
    ap: [{ l: 'Comprimido 40 mg', mg: 40, u: 'comprimido(s)' }] }, R('Diovan', '5ddba454', '1-16 anos início 1 mg/kg (até 40 mg), até 4 mg/kg (máx. 160 mg)'))] },
  { k: 'vigabatrina', n: 'Vigabatrina', v: [
    C('VO (espasmos infantis)', { d: [50, 150], dd: 50, b: 'dia', f: 2, mdk: 150, ob: 'Início 50 mg/kg/dia (25 mg/kg 2x/dia); aumentar 25-50 mg/kg/dia a cada 3 dias até no máximo 150 mg/kg/dia (75 mg/kg 2x/dia). Alerta de perda visual permanente.', ap: [{ l: 'Sachê 500 mg', mg: 500, u: 'sachê(s)' }] }, R('Sabril', 'a5d389d2', 'espasmos infantis 50 → 150 mg/kg/dia em 2 tomadas')),
    F('VO (crises focais refratárias, 2 a 16 anos)', 'Dose diária total (em 2 tomadas), início → manutenção: 10-15 kg 350 → 1.050 mg; > 15-20 kg 450 → 1.300 mg; > 20-25 kg 500 → 1.500 mg; > 25-60 kg 500 → 2.000 mg. Acima de 60 kg: dose de adulto.', 'Aumentos semanais conforme a resposta.', 'Comprimido 500 mg', R('Sabril', 'a5d389d2', 'crises focais 2-16 anos tabela por peso'))] },
  { k: 'brivaracetam', n: 'Brivaracetam', v: [
    C('VO (≥ 1 mês, 20 a < 50 kg)', { d: [0.5, 2], dd: 0.5, f: 2, ob: 'Início 0,5-1 mg/kg 2x/dia; manutenção 0,5-2 mg/kg 2x/dia (1-4 mg/kg/dia).' + PEND, ap: [{ l: 'Comprimido 25 mg', mg: 25, u: 'comprimido(s)' }] }, R('Briviact', '3cf2f439', '20-< 50 kg 0,5-2 mg/kg 2x/dia')),
    C('VO (11 a < 20 kg)', { d: [0.5, 2.5], dd: 0.5, f: 2, ob: 'Início 0,5-1,25 mg/kg 2x/dia; manutenção 0,5-2,5 mg/kg 2x/dia (1-5 mg/kg/dia).' + PEND, ap: [{ l: 'Comprimido 10 mg', mg: 10, u: 'comprimido(s)' }] }, R('Briviact', '3cf2f439', '11-< 20 kg 0,5-2,5 mg/kg 2x/dia')),
    C('VO (< 11 kg)', { d: [0.75, 3], dd: 0.75, f: 2, ob: 'Início 0,75-1,5 mg/kg 2x/dia; manutenção 0,75-3 mg/kg 2x/dia (1,5-6 mg/kg/dia). Acima de 50 kg: 25-50 mg 2x/dia (manutenção 25-100 mg 2x/dia).' + PEND, ap: [{ l: 'Comprimido 10 mg', mg: 10, u: 'comprimido(s)' }] }, R('Briviact', '3cf2f439', '< 11 kg 0,75-3 mg/kg 2x/dia'))] },
  { k: 'aripiprazol', n: 'Aripiprazol', nao: ['acao prolongada'], v: [F('VO', 'Dose diária (início / recomendada / máxima): esquizofrenia em adolescentes 2 / 10 / 30 mg; mania bipolar pediátrica 2 / 10 / 30 mg; irritabilidade no autismo 2 / 5-10 / 15 mg; Tourette < 50 kg 2 / 5 / 10 mg e ≥ 50 kg 2 / 10 / 20 mg.', 'Metabolizador lento da CYP2D6: metade da dose usual.', 'Comprimido 5 e 10 mg', R('Abilify', 'c040bd1d', 'tabela de doses pediátricas por indicação'))] },
  { k: 'aztreonam', n: 'Aztreonam', v: [C('EV (criança)', { d: [30, 30], dd: 30, f: 3, mdk: 120,
    ob: '30 mg/kg de 8/8 h (infecções leves a moderadas) ou de 6/6 ou 8/8 h (moderadas a graves); máx. 120 mg/kg/dia.',
    ap: [{ l: 'Frasco 1 g (concentração após reconstituir: informe abaixo)' }] }, R('Azactam', '9a105eaf', 'pediatria 30 mg/kg de 6/6-8/8 h, máx. 120 mg/kg/dia'))] },
  { k: 'fluoxetina', n: 'Fluoxetina', nao: ['semanal'], v: [F('VO (TOC, criança e adolescente)', 'Adolescentes e crianças de maior peso: início 10 mg/dia, 20 mg/dia após 2 semanas; faixa 20-60 mg/dia. Crianças de menor peso: início 10 mg/dia; faixa 20-30 mg/dia.', 'Alerta de ideação suicida em crianças e adolescentes.', 'Solução oral gotas 20 mg/mL', R('Prozac', 'c88f33ed', 'TOC pediátrico: início 10 mg, faixas 20-60 e 20-30 mg/dia'))] },
  { k: 'oxibutinina', n: 'Oxibutinina', v: [F('VO (> 5 anos)', 'Xarope 5 mg/5 mL: 5 mg (1 colher de chá) 2x/dia; máximo 5 mg 3x/dia.', 'Dose fixa.', 'Comprimido 5 mg', R('oxibutinina xarope', 'fe4ed76b', '> 5 anos 5 mg 2x/dia, máx. 5 mg 3x/dia'))] },
  { k: 'clorpromazina', n: 'Clorpromazina', v: [C('VO (problemas graves de comportamento, 6 meses a 12 anos)', { d: [0.55, 0.55], dd: 0.55, f: 4,
    ob: '1/4 mg por libra (≈ 0,55 mg/kg) VO a cada 4-6 h, se necessário (ex.: criança de 18 kg ≈ 10 mg). Não usar abaixo de 6 meses salvo situação que ameace a vida.' + PEND,
    ap: [{ l: 'Comprimido 25 mg', mg: 25, u: 'comprimido(s)' }] }, R('clorpromazina comprimido', 'd43718e5', 'pediatria 6 meses-12 anos VO 1/4 mg/lb (≈ 0,55 mg/kg) de 4/4-6/6 h'))] },
];

let n = 0;
for (const e of NOVOS) {
  if (P.some((x) => x.k === e.k)) { console.log('já existe, pulado:', e.k); continue; }
  P.push(e); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, P), 'utf8');
console.log('OK', n, 'medicamento(s) novos na calculadora pediátrica; total', P.length);
