// Prioridade 2 — PENDENTES de dose nas prescrições de doenças, lote 04 (27/11/2026). Decisão do autor: "1 + 2".
//  (2) Dose do Formulário Terapêutico Nacional 2010 (FTN, Ministério da Saúde/Rename), lido no PDF original, quando a
//      monografia traz a MESMA indicação (ou a classe que a ficha já cita, como "anti-histamínico" ou "AINE").
//  (1) Onde o FTN não serve, remeter à ficha do medicamento no próprio app (sem copiar nem inventar dose).
// Ficam PENDENTES: escolha de fármaco que a fonte da doença não faz, doses de gestação/endocardite/IVIG e afins.
// Uso: node curadoria/pendentes-presc-04.js  (idempotente)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'DISEASES');
const D = L.lerDados(cfg);

const FTN = 'Formulário Terapêutico Nacional 2010, MS/Rename';
const DEXCL = `dexclorfeniramina VO: adulto e ≥ 12 anos 2 mg, de 6 a 11 anos 1 mg, de 2 a 6 anos 0,5 mg, a cada 4 a 6 h (${FTN}; abaixo de 2 anos o FTN não traz dose)`;
const ANTIP = 'antipirético: ver as fichas Paracetamol e Dipirona sódica (Metamizol) deste app';
const IBU_AD = `ibuprofeno VO 200 a 600 mg a cada 6 a 8 h, máx. 2,4 g/dia (${FTN}, dor e dismenorreia no adulto)`;

const TROCAS = [
  // Listeriose — FTN, ampicilina (meningite por Listeria) e gentamicina (infecções hospitalares graves)
  ['Listeriose', 'prescricao',
    'ampicilina IV mais gentamicina por 14 a 21 dias (doses: PENDENTE DE VERIFICAÇÃO; a fonte não traz).',
    `ampicilina IV mais gentamicina por 14 a 21 dias. Doses do ${FTN}: ampicilina 12 g/dia em infusão IV, divididos a cada 4 a 6 h (meningite por Listeria no adulto); gentamicina 3 a 5 mg/kg/dia IM ou IV, 1 vez ao dia ou dividida a cada 8 h.`],
  ['Listeriose', 'prescricao',
    'ampicilina ou amoxicilina VO é citada, sem dados de eficácia (dose: PENDENTE DE VERIFICAÇÃO).',
    'ampicilina ou amoxicilina VO é citada, sem dados de eficácia (dose: ver as fichas Ampicilina e Amoxicilina deste app).'],
  ['Listeriose', 'prescricao',
    '3) Gestação e recém-nascido: esquemas PENDENTES DE VERIFICAÇÃO.',
    `3) Recém-nascido (${FTN}, meningite por Listeria, em combinação): ampicilina 50 a 100 mg/kg IV a cada 12 h abaixo de 7 dias, a cada 8 h de 7 a 21 dias e a cada 6 h de 21 a 28 dias; de 1 mês a 12 anos, 50 mg/kg a cada 4 a 6 h (máx. 2 g a cada 4 h); gentamicina 3 mg/kg a cada 12 h até 2 semanas de vida e 2 mg/kg a cada 8 h de 2 semanas a 12 anos. Gestação: esquema PENDENTE DE VERIFICAÇÃO.`],
  ['Listeriose', 'conduta',
    'Recém-nascido e meningite: doses e esquemas PENDENTES DE VERIFICAÇÃO.',
    'Recém-nascido e meningite: doses do Formulário Terapêutico Nacional na prescrição.'],
  // Esteatose hepática aguda — FTN, glicose (hipoglicemia no adulto)
  ['Esteatose hepática aguda', 'prescricao',
    'glicose IV: dose e concentração PENDENTE DE VERIFICAÇÃO.',
    `glicose IV: 25 mL de glicose 50% em veia de grande calibre, a 3 mL/min (${FTN}, hipoglicemia no adulto), guiada pela glicemia capilar.`],
  // Misoprostol — FTN, indução de aborto e do parto
  ['Anencefalia', 'prescricao',
    '2) Misoprostol para interrupção conforme recomendação FIGO 2017 citada pelo manual (doses: PENDENTE DE VERIFICAÇÃO).',
    `2) Misoprostol para interrupção (o manual cita a FIGO 2017, cujo esquema não foi lido). Doses do ${FTN}: 1º trimestre, 800 mcg/dia por via vaginal por 2 dias (800 mcg repetidos em 24 h, 400 mcg 12/12 h ou 200 mcg 6/6 h), podendo repetir após 72 h; 2º trimestre, 200 mcg via vaginal 12/12 h por 2 dias, repetindo a cada 3 a 5 dias; indução do parto, 25 mcg via vaginal a cada 6 h, podendo subir a 50 mcg a cada 6 h, máx. 4 doses.`],
  ['Anencefalia', 'conduta',
    'seguir as recomendações de indução com misoprostol da FIGO 2017 (esquema: PENDENTE DE VERIFICAÇÃO)',
    'seguir as recomendações de indução com misoprostol da FIGO 2017 (doses do Formulário Terapêutico Nacional na prescrição)'],
  ['Malformações fetais incompatíveis', 'prescricao',
    'doses PENDENTE DE VERIFICAÇÃO, não legíveis na extração do texto; consultar a figura original do',
    `doses da figura não legíveis na extração do texto. Doses do ${FTN}: 1º trimestre, 800 mcg/dia via vaginal por 2 dias (800 mcg repetidos em 24 h, 400 mcg 12/12 h ou 200 mcg 6/6 h); 2º trimestre, 200 mcg via vaginal 12/12 h por 2 dias, repetindo a cada 3 a 5 dias; indução do parto, 25 mcg via vaginal 6/6 h, até 50 mcg 6/6 h, máx. 4 doses. Conferir com a figura original do`],
  // Candidíase mamilar — FTN, nistatina (candidíase orofaríngea do recém-nascido e lactente)
  ['Candidíase mamilar', 'prescricao',
    'por 2 semanas (dose/posologia: PENDENTE DE VERIFICAÇÃO; a fonte não detalha).',
    `por 2 semanas. Boca do bebê: nistatina suspensão 100.000 UI localmente a cada 6 h no recém-nascido, e 100.000 UI em cada lado da boca a cada 6 h até 1 ano (${FTN}). Posologia tópica no mamilo da mãe: PENDENTE DE VERIFICAÇÃO (a fonte não detalha).`],
  // Contracepção — FTN, ibuprofeno e sulfato ferroso
  ['Efeitos adversos e problemas com métodos', 'prescricao',
    '1) Sangramento irregular em uso de AOC: AINE (dose: PENDENTE DE VERIFICAÇÃO);',
    `1) Sangramento irregular em uso de AOC: AINE, por exemplo ${IBU_AD};`],
  ['Efeitos adversos e problemas com métodos', 'prescricao',
    '3) Anemia: suplementação de ferro (dose: PENDENTE DE VERIFICAÇÃO neste quadro).',
    `3) Anemia: suplementação de ferro — sulfato ferroso, 50 a 100 mg de ferro elementar VO a cada 12 h (${FTN}, anemia ferropriva no adulto).`],
  ['Efeitos adversos e problemas com métodos', 'prescricao',
    '4) Cólica do DIU: AINE ou hioscina (doses: PENDENTE DE VERIFICAÇÃO).',
    `4) Cólica do DIU: AINE (${IBU_AD}) ou hioscina (ver a ficha Hioscina (Butilbrometo de escopolamina) deste app).`],
  // Bronquite aguda — remeter ao registro de coqueluche; FTN salbutamol
  ['Bronquite aguda', 'prescricao',
    'macrolídeo (ver registro de coqueluche; dose neste contexto PENDENTE DE VERIFICAÇÃO).',
    'macrolídeo nas doses do registro "Coqueluche" deste app.'],
  ['Bronquite aguda', 'prescricao',
    'fármaco e dose PENDENTE DE VERIFICAÇÃO.',
    `salbutamol aerossol 1 a 2 inalações até 4 vezes ao dia, se necessário (${FTN}, dose de manutenção/alívio na asma; na exacerbação, ver o registro de asma).`],
  // Ictioses — FTN, dexclorfeniramina e loratadina
  ['Ictioses hereditárias', 'prescricao',
    'dexclorfeniramina ou loratadina VO (doses PENDENTES DE VERIFICAÇÃO, não detalhadas no PCDT).',
    `dexclorfeniramina VO 2 mg a cada 4 a 6 h no adulto e ≥ 12 anos, 1 mg de 6 a 11 anos, 0,5 mg de 2 a 6 anos; ou loratadina VO 10 mg 1 vez ao dia a partir de 6 anos e 5 mg de 2 a 5 anos (${FTN}; o PCDT não detalha doses).`],
  // Gengivite na gestação e urgências odontológicas — FTN, clorexidina 0,12% (gengivite e antissepsia bucal)
  ['Estrias, cloasma', 'prescricao',
    'bochechos com solução antisséptica (produto: PENDENTE DE VERIFICAÇÃO).',
    `bochechos com solução antisséptica — o FTN indica para gengivite a clorexidina 0,12%, 15 mL em bochecho de 30 s, 2 vezes ao dia, após escovação e fio dental, sem diluir nem engolir (${FTN}).`],
  ['Urgências odontológicas', 'prescricao',
    '(frequência e duração PENDENTE DE VERIFICAÇÃO).',
    `(15 mL em bochecho de 30 s, 2 vezes ao dia, após escovação, sem diluir nem engolir — ${FTN}; duração: PENDENTE DE VERIFICAÇÃO).`],
  // Pirose na gestação — FTN, omeprazol (DRGE sintomática)
  ['Pirose', 'prescricao',
    'Bloqueadores H2 e inibidores da bomba de prótons podem ser considerados; dose: PENDENTE DE VERIFICAÇÃO (não consta na fonte).',
    `Bloqueadores H2 e inibidores da bomba de prótons podem ser considerados; dose no FTN para DRGE sintomática: omeprazol 20 mg VO 1 vez ao dia por 4 semanas (${FTN}; não específico da gestação).`],
  // Hanseníase, efeitos adversos — FTN dexclorfeniramina (urticária); ficha do ácido fólico
  ['Efeitos adversos da poliquimioterapia', 'prescricao',
    '1) Urticária por rifampicina: corticoide e anti-histamínico (dose PENDENTE DE VERIFICAÇÃO; não definida na fonte).',
    `1) Urticária por rifampicina: anti-histamínico — ${DEXCL}; corticoide (dose): PENDENTE DE VERIFICAÇÃO, não definida na fonte.`],
  ['Efeitos adversos da poliquimioterapia', 'prescricao',
    'ácido fólico e complexo B (dose PENDENTE DE VERIFICAÇÃO).',
    'ácido fólico e complexo B (dose: ver a ficha Ácido fólico deste app).'],
  // Resfriado comum — ficha da dipirona
  ['Resfriado comum', 'prescricao',
    'Dipirona como alternativa: dose PENDENTE DE VERIFICAÇÃO.',
    'Dipirona como alternativa: dose na ficha Dipirona sódica (Metamizol) deste app.'],
  // Febre por mordedura de rato — fichas (endocardite continua PENDENTE)
  ['Febre por mordedura de rato', 'prescricao',
    '2) Alergia à penicilina: doxiciclina ou estreptomicina (doses: PENDENTE DE VERIFICAÇÃO).',
    '2) Alergia à penicilina: doxiciclina ou estreptomicina (doses: ver as fichas Doxiciclina e Estreptomicina deste app).'],
  ['Febre por mordedura de rato', 'prescricao',
    '(doses, intervalo e duração total: PENDENTE DE VERIFICAÇÃO; a fonte não traz)',
    '(doses: ver as fichas Penicilina cristalina (Benzilpenicilina potássica) e Penicilina V deste app; duração total: PENDENTE DE VERIFICAÇÃO, a fonte não traz)'],
  // Choque tóxico estreptocócico — fichas
  ['Síndrome do choque tóxico estreptocócico', 'prescricao',
    '(doses, intervalos e duração: PENDENTE DE VERIFICAÇÃO; as fontes lidas não informam)',
    '(doses: ver as fichas Penicilina cristalina (Benzilpenicilina potássica) e Clindamicina deste app; duração: PENDENTE DE VERIFICAÇÃO, as fontes lidas não informam)'],
  // Febre recorrente — o próprio registro já traz as doses dos beta-lactâmicos
  ['Febre recorrente', 'prescricao',
    'beta-lactâmico parenteral 10 a 14 dias (doses: PENDENTE DE VERIFICAÇÃO).',
    'beta-lactâmico parenteral 10 a 14 dias (doses de penicilina G e ceftriaxona do item 2 deste registro; na gestação, conferir na ficha do medicamento).'],
  // Otalgia e dor de crescimento — analgésico simples: fichas
  ['Otalgia', 'prescricao',
    'fármaco, dose e intervalo: PENDENTE DE VERIFICAÇÃO (não definidos no capítulo lido).',
    'analgésico simples (paracetamol ou dipirona; o capítulo não define): doses nas fichas Paracetamol e Dipirona sódica (Metamizol) deste app.'],
  ['Dor de crescimento', 'prescricao',
    'analgésico comum nas crises prolongadas (droga e dose: PENDENTE DE VERIFICAÇÃO, não definidas no documento).',
    'analgésico comum nas crises prolongadas (o documento não define a droga; doses pediátricas nas fichas Paracetamol e Dipirona sódica (Metamizol) e na calculadora pediátrica deste app).'],
  // Mucopolissacaridoses — pré-medicação: FTN dexclorfeniramina (reações a transfusão/hipersensibilidade) + fichas
  ['Mucopolissacaridose tipo I ', 'prescricao',
    '(doses não detalhadas: PENDENTE DE VERIFICAÇÃO)',
    `(o PCDT não detalha doses; ${DEXCL}; ${ANTIP})`],
  ['Mucopolissacaridose tipo II ', 'prescricao',
    '(doses PENDENTES DE VERIFICAÇÃO)',
    `(o PCDT não detalha doses; ${DEXCL}; ${ANTIP})`],
  ['Mucopolissacaridose tipo IV A', 'prescricao',
    '(doses PENDENTES DE VERIFICAÇÃO, não detalhadas no PCDT)',
    `(o PCDT não detalha doses; ${DEXCL}; ${ANTIP})`],
  ['Mucopolissacaridose tipo VI ', 'prescricao',
    '(doses PENDENTES DE VERIFICAÇÃO)',
    `(o PCDT não detalha doses; ${DEXCL}; ${ANTIP})`],
  ['Mucopolissacaridose tipo VII', 'prescricao',
    '(doses PENDENTES DE VERIFICAÇÃO)',
    `(o PCDT não detalha doses; ${DEXCL}; ${ANTIP})`],
];

// Confere que as fichas citadas existem no acervo (para a remissão não apontar para o vazio).
const M = L.lerDados(L.VARS.find((c) => c.v === 'SEED_MEDS'));
for (const nome of ['Ampicilina', 'Amoxicilina', 'Ácido fólico', 'Hioscina (Butilbrometo de escopolamina)', 'Dipirona sódica (Metamizol)', 'Doxiciclina', 'Estreptomicina',
  'Penicilina cristalina (Benzilpenicilina potássica)', 'Clindamicina', 'Paracetamol']) {
  if (!M.some((m) => m.nome === nome || m.nome.startsWith(nome))) throw new Error('ficha não encontrada: ' + nome);
}
if (!M.some((m) => m.nome.startsWith('Penicilina V'))) throw new Error('ficha não encontrada: Penicilina V');
if (!D.some((d) => d.nome === 'Coqueluche')) throw new Error('registro Coqueluche não encontrado');

let n = 0;
for (const [nome, campo, antigo, novo] of TROCAS) {
  const d = D.find((x) => x.nome.startsWith(nome));
  if (!d) throw new Error('doença não encontrada: ' + nome);
  if (D.indexOf(d) < 3226) throw new Error('registro original da v71, não alterar aqui: ' + nome);
  if (String(d[campo]).includes(novo)) continue;
  if (!String(d[campo]).includes(antigo)) throw new Error('trecho não encontrado em ' + nome + ': ' + antigo.slice(0, 60));
  d[campo] = d[campo].replace(antigo, novo); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, D), 'utf8');
console.log('OK', n, 'trecho(s) PENDENTE resolvidos (FTN 2010 ou remissão à ficha)');
