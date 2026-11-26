// Escores clínicos — lote 01 (prioridade 4), 25/11/2026.
// Cada escore traz a referência publicada de onde vêm os itens, os pontos e a interpretação. Só acrescenta no fim.
// Uso: node curadoria/escores-lote-01.js
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'SCORES');
const S = L.lerDados(cfg);
const fn = (f) => ({ $fn: [f.toString()] });
const P = (id, label, pts) => ({ id, label, pts: pts || 1 });
const O = (id, label, opts) => ({ id, label, opts });
const ok = (t, c) => ({ nivel: 'ok', t, c });
const UE = 'Urgência e Emergência', CM = 'Clínica Médica', PED = 'Pediatria';
/* As funções interp rodam dentro do app; os objetos de retorno são escritos por extenso para não depender de helpers. */

const NOVOS = [
  { id: 'rcri', nome: 'RCRI / Lee (risco cardíaco em cirurgia não cardíaca)', areas: [CM, 'Cirurgia Geral'], especialidade: 'Cardiologia',
    desc: 'Estima o risco de complicação cardíaca maior no pós-operatório de cirurgia não cardíaca.',
    fields: [P('a', 'Cirurgia de alto risco (intraperitoneal, intratorácica ou vascular suprainguinal)'), P('b', 'Doença arterial coronariana'), P('c', 'Insuficiência cardíaca'),
      P('d', 'Doença cerebrovascular (AVC ou AIT)'), P('e', 'Diabetes em uso de insulina'), P('f', 'Creatinina pré-operatória > 2 mg/dL')],
    max: 6,
    interp: fn(function (s) {
      if (s === 0) return { nivel: 'ok', t: 'Classe I (0 ponto) — risco ≈ 0,4%', c: 'Risco cardíaco baixo (coorte original de Lee).' };
      if (s === 1) return { nivel: 'ok', t: 'Classe II (1 ponto) — risco ≈ 0,9%', c: 'Risco baixo a intermediário.' };
      if (s === 2) return { nivel: 'warn', t: 'Classe III (2 pontos) — risco ≈ 6,6%', c: 'Risco elevado: avaliar capacidade funcional e necessidade de exames conforme a diretriz.' };
      return { nivel: 'bad', t: 'Classe IV (≥ 3 pontos) — risco ≈ 11%', c: 'Risco alto: avaliação cardiológica e otimização antes da cirurgia eletiva.' };
    }),
    ref: 'Lee TH et al. Circulation 1999;100:1043-9 (taxas da coorte de validação).' },
  { id: 'stopbang', nome: 'STOP-Bang (apneia obstrutiva do sono)', areas: [CM], especialidade: 'Pneumologia',
    desc: 'Rastreia apneia obstrutiva do sono, inclusive no pré-operatório.',
    fields: [P('s', 'Ronco alto (ouvido através de porta fechada)'), P('t', 'Cansaço ou sonolência durante o dia'), P('o', 'Alguém viu parar de respirar durante o sono'), P('p', 'Hipertensão arterial (tratada ou não)'),
      P('b', 'IMC > 35 kg/m²'), P('a', 'Idade > 50 anos'), P('n', 'Circunferência do pescoço > 40 cm'), P('g', 'Sexo masculino')],
    max: 8,
    interp: fn(function (s) {
      if (s <= 2) return { nivel: 'ok', t: 'Baixo risco (0–2)', c: 'Baixa probabilidade de apneia moderada a grave.' };
      if (s <= 4) return { nivel: 'warn', t: 'Risco intermediário (3–4)', c: 'Considerar polissonografia conforme o quadro clínico.' };
      return { nivel: 'bad', t: 'Alto risco (5–8)', c: 'Alta probabilidade de apneia moderada a grave: investigar.' };
    }),
    ref: 'Chung F et al. Anesthesiology 2008;108:812-21; Chung F et al. Chest 2016;149:631-8.' },
  { id: 'rockall', nome: 'Rockall (hemorragia digestiva alta)', areas: [UE, 'Gastroenterologia e Hepatologia'], especialidade: 'Gastroenterologia e Hepatologia',
    desc: 'Estima risco de ressangramento e morte na hemorragia digestiva alta. Os dois últimos itens dependem da endoscopia.',
    fields: [O('i', 'Idade', [['< 60 anos', 0], ['60–79 anos', 1], ['≥ 80 anos', 2]]),
      O('c', 'Choque', [['Sem choque (FC < 100 e PAS ≥ 100)', 0], ['Taquicardia (FC ≥ 100, PAS ≥ 100)', 1], ['Hipotensão (PAS < 100)', 2]]),
      O('m', 'Comorbidade', [['Nenhuma grave', 0], ['Insuficiência cardíaca, doença coronariana ou outra comorbidade grave', 2], ['Insuficiência renal, insuficiência hepática ou câncer disseminado', 3]]),
      O('d', 'Diagnóstico endoscópico', [['Mallory-Weiss, sem lesão e sem estigmas', 0], ['Todos os outros diagnósticos', 1], ['Neoplasia do trato digestivo alto', 2]]),
      O('e', 'Estigmas de sangramento recente', [['Nenhum ou só mancha escura', 0], ['Sangue no TGI alto, coágulo aderido, vaso visível ou sangramento ativo', 2]])],
    max: 11,
    interp: fn(function (s) {
      if (s <= 2) return { nivel: 'ok', t: 'Baixo risco (≤ 2, escore completo)', c: 'Baixo risco de ressangramento e morte. Antes da endoscopia (só os 3 primeiros itens), 0 ponto também é baixo risco.' };
      if (s <= 5) return { nivel: 'warn', t: 'Risco intermediário (3–5)', c: 'Internar e observar.' };
      return { nivel: 'bad', t: 'Alto risco (≥ 6)', c: 'Alto risco de ressangramento e morte.' };
    }),
    ref: 'Rockall TA et al. Gut 1996;38:316-21.' },
  { id: 'aims65', nome: 'AIMS65 (mortalidade na hemorragia digestiva alta)', areas: [UE, 'Gastroenterologia e Hepatologia'], especialidade: 'Gastroenterologia e Hepatologia',
    desc: 'Estima a mortalidade hospitalar na hemorragia digestiva alta com dados da admissão.',
    fields: [P('a', 'Albumina < 3,0 g/dL'), P('i', 'INR > 1,5'), P('m', 'Alteração do estado mental'), P('s', 'PA sistólica ≤ 90 mmHg'), P('e', 'Idade ≥ 65 anos')],
    max: 5,
    interp: fn(function (s) {
      if (s <= 1) return { nivel: 'ok', t: 'Baixo risco (0–1)', c: 'Mortalidade hospitalar baixa.' };
      return { nivel: 'bad', t: 'Alto risco (≥ 2)', c: 'Mortalidade hospitalar aumenta com cada ponto; monitorização intensiva.' };
    }),
    ref: 'Saltzman JR et al. Gastrointest Endosc 2011;74:1215-24.' },
  { id: 'ranson', nome: 'Ranson (pancreatite aguda não biliar)', areas: [CM, 'Cirurgia Geral'], especialidade: 'Gastroenterologia e Hepatologia',
    desc: 'Gravidade da pancreatite aguda com critérios da admissão e das primeiras 48 h (versão para causa não biliar).',
    fields: [P('a1', 'Admissão: idade > 55 anos'), P('a2', 'Admissão: leucócitos > 16.000/mm³'), P('a3', 'Admissão: glicemia > 200 mg/dL'), P('a4', 'Admissão: DHL > 350 U/L'), P('a5', 'Admissão: AST > 250 U/L'),
      P('b1', '48 h: queda do hematócrito > 10 pontos'), P('b2', '48 h: aumento da ureia (BUN) > 5 mg/dL'), P('b3', '48 h: cálcio < 8 mg/dL'), P('b4', '48 h: PaO₂ < 60 mmHg'),
      P('b5', '48 h: déficit de base > 4 mEq/L'), P('b6', '48 h: sequestro de líquidos > 6 L')],
    max: 11,
    interp: fn(function (s) {
      if (s <= 2) return { nivel: 'ok', t: 'Leve (0–2)', c: 'Baixa mortalidade esperada.' };
      return { nivel: 'bad', t: 'Grave (≥ 3)', c: 'Pancreatite grave: monitorização em unidade de maior complexidade; mortalidade cresce com o número de critérios.' };
    }),
    ref: 'Ranson JH et al. Surg Gynecol Obstet 1974;139:69-81. Na pancreatite biliar os pontos de corte são outros (Ranson 1979).' },
  { id: 'spesi', nome: 'PESI simplificado (sPESI — embolia pulmonar)', areas: [UE, CM], especialidade: 'Pneumologia',
    desc: 'Estima a mortalidade em 30 dias na embolia pulmonar aguda e ajuda a identificar quem pode ter alta precoce.',
    fields: [P('a', 'Idade > 80 anos'), P('c', 'Câncer'), P('d', 'Insuficiência cardíaca ou doença pulmonar crônica'), P('f', 'FC ≥ 110 bpm'), P('p', 'PA sistólica < 100 mmHg'), P('s', 'SatO₂ < 90%')],
    max: 6,
    interp: fn(function (s) {
      if (s === 0) return { nivel: 'ok', t: 'Baixo risco (0)', c: 'Mortalidade em 30 dias ≈ 1,0% na validação; candidato a tratamento ambulatorial se não houver outros impedimentos.' };
      return { nivel: 'bad', t: 'Alto risco (≥ 1)', c: 'Mortalidade em 30 dias ≈ 10,9% na validação; internar e estratificar (VD e troponina).' };
    }),
    ref: 'Jiménez D et al. Arch Intern Med 2010;170:1383-9.' },
  { id: 'khorana', nome: 'Khorana (TEV em paciente com câncer)', areas: ['Hematologia e Oncologia'], especialidade: 'Hematologia e Oncologia',
    desc: 'Estima o risco de tromboembolismo venoso em paciente ambulatorial que vai iniciar quimioterapia.',
    fields: [O('l', 'Local do câncer', [['Outros locais', 0], ['Pulmão, linfoma, ginecológico, bexiga ou testículo', 1], ['Estômago ou pâncreas (muito alto risco)', 2]]),
      P('p', 'Plaquetas antes da quimioterapia ≥ 350.000/mm³'), P('h', 'Hemoglobina < 10 g/dL ou uso de eritropoetina'), P('w', 'Leucócitos antes da quimioterapia > 11.000/mm³'), P('i', 'IMC ≥ 35 kg/m²')],
    max: 6,
    interp: fn(function (s) {
      if (s === 0) return { nivel: 'ok', t: 'Baixo risco (0)', c: 'Risco baixo de TEV.' };
      if (s === 1) return { nivel: 'warn', t: 'Risco intermediário (1)', c: 'Sem indicação rotineira de profilaxia.' };
      return { nivel: 'bad', t: s >= 3 ? 'Alto risco (≥ 3)' : 'Risco intermediário-alto (2)', c: 'A ASCO (2023) admite oferecer tromboprofilaxia a partir de 2 pontos, se não houver alto risco de sangramento.' };
    }),
    ref: 'Khorana AA et al. Blood 2008;111:4902-7; Key NS et al. J Clin Oncol 2023;41:3063-71 (diretriz ASCO).' },
  { id: 'ich', nome: 'ICH score (hemorragia intracerebral)', areas: [UE], especialidade: 'Neurologia',
    desc: 'Estima a mortalidade em 30 dias na hemorragia intraparenquimatosa espontânea.',
    fields: [O('g', 'Glasgow', [['13–15', 0], ['5–12', 1], ['3–4', 2]]), P('v', 'Volume do hematoma ≥ 30 mL'), P('i', 'Extensão intraventricular'), P('t', 'Origem infratentorial'), P('a', 'Idade ≥ 80 anos')],
    max: 6,
    interp: fn(function (s) {
      var m = ['0%', '13%', '26%', '72%', '97%', '100%', '100%'][s];
      return { nivel: s <= 1 ? 'ok' : s === 2 ? 'warn' : 'bad', t: s + ' ponto(s) — mortalidade em 30 dias ≈ ' + m, c: 'Valores da coorte original. Não usar o escore isolado para limitar suporte (AHA/ASA 2022).' };
    }),
    ref: 'Hemphill JC et al. Stroke 2001;32:891-7; Greenberg SM et al. Stroke 2022;53:e282-e361 (diretriz AHA/ASA).' },
  { id: 'rass', nome: 'RASS (agitação e sedação de Richmond)', areas: [UE, CM], especialidade: 'Urgência e Emergência',
    desc: 'Mede o nível de agitação ou sedação, principalmente na UTI.',
    fields: [O('r', 'Nível', [['+4 Combativo, violento, perigo imediato', 4], ['+3 Muito agitado: puxa ou remove tubos e cateteres', 3], ['+2 Agitado: movimentos sem propósito, briga com o ventilador', 2], ['+1 Inquieto, ansioso, sem agressividade', 1], ['0 Alerta e calmo', 0],
      ['−1 Sonolento: mantém olhos abertos > 10 s à voz', -1], ['−2 Sedação leve: acorda à voz, contato visual < 10 s', -2], ['−3 Sedação moderada: movimento ou abertura ocular à voz, sem contato visual', -3],
      ['−4 Sedação profunda: sem resposta à voz, movimento ao estímulo físico', -4], ['−5 Não desperta a nenhum estímulo', -5]])],
    min: -5,
    interp: fn(function (s) {
      if (s >= 2) return { nivel: 'bad', t: 'Agitação (' + (s > 0 ? '+' : '') + s + ')', c: 'Procurar causa (dor, delirium, abstinência, hipoxemia) e tratar.' };
      if (s >= -2) return { nivel: 'ok', t: 'Alerta a sedação leve (' + (s > 0 ? '+' : '') + s + ')', c: 'Faixa de sedação leve, em geral a preferida na UTI (diretriz PADIS 2018). Com RASS ≥ −3, aplicar CAM-ICU para delirium.' };
      return { nivel: 'warn', t: 'Sedação moderada a profunda (' + s + ')', c: 'Reavaliar a necessidade de sedação profunda.' };
    }),
    ref: 'Sessler CN et al. Am J Respir Crit Care Med 2002;166:1338-44; Devlin JW et al. Crit Care Med 2018;46:e825-e873 (PADIS).' },
  { id: 'mrs', nome: 'Escala de Rankin modificada', areas: [CM], especialidade: 'Neurologia',
    desc: 'Grau de incapacidade ou dependência após AVC.',
    fields: [O('r', 'Situação', [['0 — Sem sintomas', 0], ['1 — Sem incapacidade significativa: faz todas as atividades habituais', 1], ['2 — Incapacidade leve: cuida de si sem ajuda, mas não faz todas as atividades anteriores', 2],
      ['3 — Incapacidade moderada: precisa de alguma ajuda, mas anda sem ajuda', 3], ['4 — Moderadamente grave: não anda nem cuida de si sem ajuda', 4], ['5 — Grave: acamado, incontinente, cuidado constante', 5], ['6 — Óbito', 6]])],
    max: 6,
    interp: fn(function (s) {
      if (s <= 2) return { nivel: 'ok', t: 'mRS ' + s + ' — independente', c: 'mRS 0–2 é o desfecho "funcional independente" usado nos estudos de AVC.' };
      if (s <= 5) return { nivel: 'warn', t: 'mRS ' + s + ' — dependente', c: 'Precisa de ajuda em grau crescente.' };
      return { nivel: 'bad', t: 'mRS 6 — óbito', c: '' };
    }),
    ref: 'van Swieten JC et al. Stroke 1988;19:604-7.' },
  { id: 'killip', nome: 'Killip-Kimball (infarto agudo)', areas: [UE], especialidade: 'Cardiologia',
    desc: 'Classifica a insuficiência cardíaca no infarto agudo pelo exame físico.',
    fields: [O('k', 'Classe', [['I — Sem sinais de congestão', 1], ['II — B3 e/ou estertores em bases (< 50% dos campos)', 2], ['III — Edema agudo de pulmão', 3], ['IV — Choque cardiogênico', 4]])],
    min: 1,
    interp: fn(function (s) {
      var m = { 1: '6%', 2: '17%', 3: '38%', 4: '81%' }[s];
      return { nivel: s === 1 ? 'ok' : s === 2 ? 'warn' : 'bad', t: 'Killip ' + ['', 'I', 'II', 'III', 'IV'][s] + ' — mortalidade hospitalar ≈ ' + m + ' (série original)', c: 'A mortalidade atual é menor com reperfusão, mas a classe continua prognóstica.' };
    }),
    ref: 'Killip T, Kimball JT. Am J Cardiol 1967;20:457-64.' },
  { id: 'mmrc', nome: 'mMRC (dispneia)', areas: [CM], especialidade: 'Pneumologia',
    desc: 'Grau de dispneia nas atividades do dia a dia (usado na DPOC).',
    fields: [O('m', 'Grau', [['0 — Só com exercício intenso', 0], ['1 — Ao apressar o passo no plano ou subir ladeira leve', 1], ['2 — Anda mais devagar que pessoas da mesma idade ou para para respirar no próprio ritmo', 2],
      ['3 — Para para respirar após ≈ 100 m ou poucos minutos no plano', 3], ['4 — Não sai de casa pela falta de ar, ou dispneia ao se vestir', 4]])],
    max: 4,
    interp: fn(function (s) {
      if (s <= 1) return { nivel: 'ok', t: 'mMRC ' + s + ' — menos sintomático', c: 'Na classificação GOLD, mMRC 0–1 entra no grupo de menos sintomas.' };
      return { nivel: 'warn', t: 'mMRC ' + s + ' — mais sintomático', c: 'Na classificação GOLD, mMRC ≥ 2 indica mais sintomas.' };
    }),
    ref: 'Bestall JC et al. Thorax 1999;54:581-6; GOLD 2024.' },
  { id: 'sirs', nome: 'Critérios de SIRS', areas: [UE, CM], especialidade: 'Urgência e Emergência',
    desc: 'Síndrome da resposta inflamatória sistêmica (definição de 1992).',
    fields: [P('t', 'Temperatura > 38 °C ou < 36 °C'), P('f', 'FC > 90 bpm'), P('r', 'FR > 20 irpm ou PaCO₂ < 32 mmHg'), P('l', 'Leucócitos > 12.000 ou < 4.000/mm³ ou > 10% de bastões')],
    max: 4,
    interp: fn(function (s) {
      if (s < 2) return { nivel: 'ok', t: 'Sem SIRS (' + s + ' critério)', c: 'Não preenche SIRS.' };
      return { nivel: 'warn', t: 'SIRS (' + s + ' critérios)', c: 'Desde o Sepsis-3 (2016), sepse é definida por disfunção orgânica (SOFA); SIRS segue útil como alerta de infecção.' };
    }),
    ref: 'Bone RC et al. Chest 1992;101:1644-55; Singer M et al. JAMA 2016;315:801-10 (Sepsis-3).' },
  { id: 'nexus', nome: 'NEXUS (imagem da coluna cervical no trauma)', areas: [UE, 'Ortopedia e Traumatologia'], especialidade: 'Ortopedia e Traumatologia',
    desc: 'Identifica quem pode dispensar imagem da coluna cervical após trauma. Marque o que estiver PRESENTE.',
    fields: [P('a', 'Dor à palpação na linha média posterior da coluna cervical'), P('b', 'Déficit neurológico focal'), P('c', 'Alteração do nível de consciência'), P('d', 'Intoxicação'), P('e', 'Lesão dolorosa que distrai')],
    max: 5,
    interp: fn(function (s) {
      if (s === 0) return { nivel: 'ok', t: 'Nenhum critério presente', c: 'Baixo risco: pode dispensar imagem da coluna cervical.' };
      return { nivel: 'warn', t: s + ' critério(s) presente(s)', c: 'Não dá para liberar pela regra NEXUS: fazer imagem.' };
    }),
    ref: 'Hoffman JR et al. N Engl J Med 2000;343:94-9.' },
  { id: 'pram', nome: 'PRAM (gravidade da asma na criança)', areas: [PED, UE], especialidade: 'Pediatria',
    desc: 'Avalia a gravidade da crise de asma em crianças de 2 a 17 anos.',
    fields: [O('s', 'Retração supraesternal', [['Ausente', 0], ['Presente', 2]]), O('e', 'Contração dos escalenos', [['Ausente', 0], ['Presente', 2]]),
      O('a', 'Entrada de ar', [['Normal', 0], ['Diminuída nas bases', 1], ['Diminuída difusamente', 2], ['Ausente ou mínima', 3]]),
      O('w', 'Sibilância', [['Ausente', 0], ['Só expiratória', 1], ['Inspiratória e expiratória', 2], ['Audível sem estetoscópio ou tórax silencioso', 3]]),
      O('o', 'SatO₂ em ar ambiente', [['≥ 95%', 0], ['92–94%', 1], ['< 92%', 2]])],
    max: 12,
    interp: fn(function (s) {
      if (s <= 3) return { nivel: 'ok', t: 'Leve (0–3)', c: 'Crise leve.' };
      if (s <= 7) return { nivel: 'warn', t: 'Moderada (4–7)', c: 'Crise moderada.' };
      return { nivel: 'bad', t: 'Grave (8–12)', c: 'Crise grave.' };
    }),
    ref: 'Chalut DS et al. J Pediatr 2000;137:762-8; Ducharme FM et al. J Pediatr 2008;152:476-80.' },
  { id: 'flacc', nome: 'FLACC (dor na criança que não fala)', areas: [PED], especialidade: 'Pediatria',
    desc: 'Avalia a dor por comportamento em crianças de 2 meses a 7 anos ou sem comunicação verbal.',
    fields: [O('f', 'Face', [['Sem expressão particular ou sorriso', 0], ['Careta ou testa franzida ocasional, retraída, desinteressada', 1], ['Testa franzida frequente ou constante, mandíbula cerrada, queixo trêmulo', 2]]),
      O('l', 'Pernas', [['Posição normal ou relaxadas', 0], ['Inquietas, agitadas, tensas', 1], ['Chutando ou pernas encolhidas', 2]]),
      O('a', 'Atividade', [['Quieta, posição normal, move-se com facilidade', 0], ['Contorcendo-se, mudando de posição, tensa', 1], ['Arqueada, rígida ou com movimentos bruscos', 2]]),
      O('c', 'Choro', [['Sem choro', 0], ['Gemidos ou choramingo, queixa ocasional', 1], ['Choro contínuo, gritos ou soluços, queixas frequentes', 2]]),
      O('k', 'Consolabilidade', [['Contente, relaxada', 0], ['Acalma com toque, abraço ou conversa', 1], ['Difícil de consolar', 2]])],
    max: 10,
    interp: fn(function (s) {
      if (s === 0) return { nivel: 'ok', t: 'Sem dor (0)', c: 'Relaxada e confortável.' };
      if (s <= 3) return { nivel: 'ok', t: 'Dor leve (1–3)', c: 'Desconforto leve.' };
      if (s <= 6) return { nivel: 'warn', t: 'Dor moderada (4–6)', c: 'Tratar a dor e reavaliar.' };
      return { nivel: 'bad', t: 'Dor intensa (7–10)', c: 'Tratar a dor e reavaliar.' };
    }),
    ref: 'Merkel SI et al. Pediatr Nurs 1997;23:293-7.' },
  { id: 'nips', nome: 'NIPS (dor no recém-nascido)', areas: [PED], especialidade: 'Pediatria',
    desc: 'Avalia a dor em recém-nascidos a termo e prematuros.',
    fields: [O('f', 'Expressão facial', [['Relaxada', 0], ['Contraída', 1]]), O('c', 'Choro', [['Ausente', 0], ['Resmungo', 1], ['Vigoroso', 2]]),
      O('r', 'Respiração', [['Relaxada', 0], ['Diferente do basal', 1]]), O('b', 'Braços', [['Relaxados', 0], ['Fletidos ou estendidos', 1]]),
      O('p', 'Pernas', [['Relaxadas', 0], ['Fletidas ou estendidas', 1]]), O('e', 'Estado de alerta', [['Dormindo ou calmo', 0], ['Agitado', 1]])],
    max: 7,
    interp: fn(function (s) {
      if (s <= 3) return { nivel: 'ok', t: 'Sem dor significativa (0–3)', c: 'Manter medidas de conforto e reavaliar.' };
      return { nivel: 'bad', t: 'Dor (≥ 4)', c: 'Tratar a dor (medidas não farmacológicas e analgesia conforme o caso) e reavaliar.' };
    }),
    ref: 'Lawrence J et al. Neonatal Netw 1993;12:59-66.' },
  { id: 'capurro', nome: 'Capurro somático (idade gestacional do RN)', areas: [PED, 'Ginecologia e Obstetrícia'], especialidade: 'Pediatria',
    desc: 'Estima a idade gestacional do recém-nascido pelo exame físico (5 características somáticas).',
    fields: [O('p', 'Textura da pele', [['Muito fina, gelatinosa', 0], ['Fina e lisa', 5], ['Algo mais grossa, discreta descamação superficial', 10], ['Grossa, rugas superficiais, descamação nas mãos e pés', 15], ['Grossa, apergaminhada, com gretas profundas', 20]]),
      O('o', 'Forma da orelha', [['Chata, disforme, pavilhão não encurvado', 0], ['Pavilhão parcialmente encurvado na borda', 8], ['Pavilhão parcialmente encurvado em toda a parte superior', 16], ['Pavilhão totalmente encurvado', 24]]),
      O('g', 'Glândula mamária', [['Não palpável', 0], ['Palpável, < 5 mm', 5], ['Palpável, 5–10 mm', 10], ['Palpável, > 10 mm', 15]]),
      O('s', 'Pregas plantares', [['Sem pregas', 0], ['Marcas mal definidas na metade anterior', 5], ['Marcas bem definidas na metade anterior e sulcos no terço anterior', 10], ['Sulcos na metade anterior', 15], ['Sulcos em mais da metade anterior', 20]]),
      O('m', 'Formação do mamilo', [['Apenas visível', 0], ['Aréola pigmentada, diâmetro < 7,5 mm', 5], ['Aréola pigmentada, pontiaguda, borda não elevada, < 7,5 mm', 10], ['Borda elevada, > 7,5 mm', 15]])],
    max: 94,
    interp: fn(function (s) {
      var d = 204 + s, sem = Math.floor(d / 7), dd = d % 7;
      return { nivel: d < 259 ? 'warn' : 'ok', t: 'IG ≈ ' + sem + ' semanas e ' + dd + ' dias (' + d + ' dias)', c: d < 259 ? 'Pré-termo (< 37 semanas).' : d >= 294 ? 'Pós-termo (≥ 42 semanas).' : 'A termo (37 a 41 semanas e 6 dias).' };
    }),
    ref: 'Capurro H et al. J Pediatr 1978;93:120-2. IG (dias) = 204 + soma dos pontos.' },
  { id: 'pas', nome: 'PAS — escore de apendicite pediátrica (Samuel)', areas: [PED, 'Cirurgia Geral'], especialidade: 'Pediatria',
    desc: 'Ajuda a estimar a probabilidade de apendicite aguda em crianças e adolescentes com dor abdominal.',
    fields: [P('t', 'Dor em fossa ilíaca direita à tosse, percussão ou salto', 2), P('a', 'Anorexia'), P('f', 'Febre (≥ 38 °C)'), P('n', 'Náusea ou vômito'),
      P('d', 'Dor à palpação da fossa ilíaca direita', 2), P('l', 'Leucocitose (> 10.000/mm³)'), P('p', 'Neutrofilia (> 75%)'), P('m', 'Migração da dor para a fossa ilíaca direita')],
    max: 10,
    interp: fn(function (s) {
      if (s >= 6) return { nivel: 'bad', t: 'Compatível com apendicite (≥ 6)', c: 'Avaliação cirúrgica.' };
      return { nivel: 'warn', t: s + ' ponto(s) — abaixo do ponto de corte de 6', c: 'Não exclui apendicite: considerar ultrassom e reavaliação seriada conforme o quadro.' };
    }),
    ref: 'Samuel M. J Pediatr Surg 2002;37:877-81.' },
  { id: 'ciwa', nome: 'CIWA-Ar (abstinência alcoólica)', areas: [UE, 'Psiquiatria'], especialidade: 'Psiquiatria',
    desc: 'Mede a gravidade da síndrome de abstinência alcoólica e orienta o tratamento guiado por sintomas.',
    fields: [
      O('n', 'Náusea e vômito', [['0 — Nenhum', 0], ['1 — Náusea leve, sem vômito', 1], ['2', 2], ['3', 3], ['4 — Náusea intermitente com ânsia', 4], ['5', 5], ['6', 6], ['7 — Náusea constante, ânsia e vômitos frequentes', 7]]),
      O('t', 'Tremor', [['0 — Sem tremor', 0], ['1 — Não visível, mas sentido na ponta dos dedos', 1], ['2', 2], ['3', 3], ['4 — Moderado, com braços estendidos', 4], ['5', 5], ['6', 6], ['7 — Grave, mesmo sem estender os braços', 7]]),
      O('s', 'Sudorese', [['0 — Nenhuma', 0], ['1 — Palmas levemente úmidas', 1], ['2', 2], ['3', 3], ['4 — Gotas de suor na testa', 4], ['5', 5], ['6', 6], ['7 — Encharcado de suor', 7]]),
      O('a', 'Ansiedade', [['0 — Tranquilo', 0], ['1 — Levemente ansioso', 1], ['2', 2], ['3', 3], ['4 — Moderadamente ansioso ou reservado', 4], ['5', 5], ['6', 6], ['7 — Equivalente a pânico', 7]]),
      O('g', 'Agitação', [['0 — Atividade normal', 0], ['1 — Um pouco mais ativo que o normal', 1], ['2', 2], ['3', 3], ['4 — Moderadamente inquieto', 4], ['5', 5], ['6', 6], ['7 — Anda de um lado para o outro ou se debate', 7]]),
      O('k', 'Alterações táteis (coceira, formigamento, insetos)', [['0 — Nenhuma', 0], ['1 — Muito leve', 1], ['2 — Leve', 2], ['3 — Moderada', 3], ['4 — Alucinações moderadamente graves', 4], ['5 — Graves', 5], ['6 — Extremamente graves', 6], ['7 — Contínuas', 7]]),
      O('u', 'Alterações auditivas', [['0 — Nenhuma', 0], ['1 — Muito leve', 1], ['2 — Leve', 2], ['3 — Moderada', 3], ['4 — Alucinações moderadamente graves', 4], ['5 — Graves', 5], ['6 — Extremamente graves', 6], ['7 — Contínuas', 7]]),
      O('v', 'Alterações visuais', [['0 — Nenhuma', 0], ['1 — Muito leve', 1], ['2 — Leve', 2], ['3 — Moderada', 3], ['4 — Alucinações moderadamente graves', 4], ['5 — Graves', 5], ['6 — Extremamente graves', 6], ['7 — Contínuas', 7]]),
      O('c', 'Cefaleia, cabeça pesada', [['0 — Nenhuma', 0], ['1 — Muito leve', 1], ['2 — Leve', 2], ['3 — Moderada', 3], ['4 — Moderadamente grave', 4], ['5 — Grave', 5], ['6 — Muito grave', 6], ['7 — Extremamente grave', 7]]),
      O('o', 'Orientação', [['0 — Orientado, faz contas em série', 0], ['1 — Não faz contas em série ou incerto da data', 1], ['2 — Desorientado na data por até 2 dias', 2], ['3 — Desorientado na data por mais de 2 dias', 3], ['4 — Desorientado no lugar e/ou na pessoa', 4]])],
    max: 67,
    interp: fn(function (s) {
      if (s < 10) return { nivel: 'ok', t: 'Abstinência leve (< 10)', c: 'Em geral sem necessidade de medicação; reavaliar periodicamente.' };
      if (s < 20) return { nivel: 'warn', t: 'Abstinência moderada (10–19)', c: 'Considerar benzodiazepínico no esquema guiado por sintomas e reavaliar.' };
      return { nivel: 'bad', t: 'Abstinência grave (≥ 20)', c: 'Alto risco de convulsão e delirium tremens: tratar e monitorizar.' };
    }),
    ref: 'Sullivan JT et al. Br J Addict 1989;84:1353-7.' },
];

let n = 0;
for (const e of NOVOS) {
  if (!e.ref || !e.interp) throw new Error('sem referência: ' + e.id);
  if (S.some((x) => x.id === e.id)) { console.log('já existe, pulado:', e.id); continue; }
  S.push(e); n++;
}
void ok;
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, S), 'utf8');
console.log('OK', n, 'escore(s) novos; total', S.length);
