// Lote 06 (27/11/2026): aplicação EM MASSA dos critérios de docs/CRITERIOS_FONTES.md nas doenças de lote (índice ≥ 3226).
// Decisão do autor: "Sim, aplicar". Registros originais da v71 não são tocados (vão para a lista de decisão do autor).
//  A) Exames e critérios (seção 4): "conforme a evolução clínica (a fonte não define)" no lugar de PENDENTE.
//  B) Notificação (seção 4): Lista Nacional de Notificação Compulsória, Portaria GM/MS nº 11.211/2026 (Anexo I).
//  C) Conduta de especialista (seção 4): "prescrição pelo especialista conforme ..." quando a fonte remete a outro protocolo.
//  D) Dose-base (seção 3): Guia para o Uso de Hemocomponentes (MS, 2ª ed., 2015); FTN 2010 (permetrina, hidrocortisona 1%,
//     noretisterona, enantato de noretisterona + valerato de estradiol, lidocaína gel); remissões a fichas e registros do app.
// Ficam PENDENTES as exceções da seção 3 (gestação, neonatal, SNC/endocardite/osteomielite, durações sem fonte etc.).
// Uso: node curadoria/pendentes-presc-06.js  (idempotente)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'DISEASES');
const D = L.lerDados(cfg);
const M = L.lerDados(L.VARS.find((c) => c.v === 'SEED_MEDS'));
const LOTE = 3226;

const FTN = 'Formulário Terapêutico Nacional 2010, MS/Rename';
const HEMO = 'Guia para o Uso de Hemocomponentes, MS, 2ª ed., 2015';
const DNC = 'Lista Nacional de Notificação Compulsória, Portaria GM/MS nº 11.211/2026';
const HIDRO = `hidrocortisona (acetato) 1% creme, fina camada 1 a 2 vezes ao dia por 1 a 2 semanas, em períodos curtos (${FTN}; ver a ficha Hidrocortisona (creme) deste app)`;

let n = 0;
const achar = (nome) => {
  const i = D.findIndex((x, j) => j >= LOTE && x.nome.startsWith(nome));
  if (i < 0) throw new Error('doença de lote não encontrada: ' + nome);
  return D[i];
};
const troca = (nome, campo, antigo, novo) => {
  const d = achar(nome);
  if (String(d[campo]).includes(novo)) return;
  if (!String(d[campo]).includes(antigo)) throw new Error('trecho não encontrado em ' + nome + ': ' + antigo.slice(0, 60));
  d[campo] = d[campo].replace(antigo, novo); n++;
};

// A) Exames e critérios — todas as doenças de lote
for (let i = LOTE; i < D.length; i++) {
  const d = D[i];
  for (const campo of ['exames', 'criterios']) {
    let v = String(d[campo] || ''); const antes = v;
    if (!v.includes('PENDENTE')) continue;
    v = v.replace(/: PENDENTE DE VERIFICAÇÃO \((não definida|não detalhados|não detalhado)[^)]*\)/g, ': conforme a evolução clínica (a fonte não define)')
      .replace(/ \(PENDENTE DE VERIFICAÇÃO\)/g, ' (a fonte não define)')
      .replace(/\(exame específico: PENDENTE DE VERIFICAÇÃO\)/g, '(exame específico: a fonte não define)')
      .replace(/não especificados: PENDENTE DE VERIFICAÇÃO\)/g, 'não especificados na fonte)')
      .replace(/ não descreve critérios clínicos nem laboratoriais: PENDENTE DE VERIFICAÇÃO\./g, ' não descreve critérios clínicos nem laboratoriais (diagnóstico clínico).')
      .replace(/: PENDENTE DE VERIFICAÇÃO\./g, ': conforme a evolução clínica (a fonte não define).');
    if (v !== antes) { d[campo] = v; n++; }
  }
}

// B) Notificação
troca('Febre por mordedura de rato', 'conduta', 'Notificação no Brasil: PENDENTE DE VERIFICAÇÃO.',
  `Notificação no Brasil: não consta na ${DNC}.`);
troca('Tifo exantemático epidêmico', 'conduta', 'regra brasileira de notificação: PENDENTE DE VERIFICAÇÃO',
  `no Brasil, consta na ${DNC}, como "Febre maculosa e outras riquetsioses"`);

// C) Conduta de especialista / remissão a outro protocolo
troca('Criança exposta à hepatite C', 'prescricao', 'Esquema e doses: PENDENTE DE VERIFICAÇÃO (definidos no PCDT de hepatite C, não consultado neste lote).',
  'Esquema e doses: prescrição pelo especialista conforme o PCDT de Hepatite C e Coinfecções vigente (em revisão em 2026).');
troca('Lipofuscinose ceroide neuronal tipo 2', 'prescricao', '(doses não detalhadas neste protocolo: PENDENTE DE VERIFICAÇÃO nos PCDT específicos)',
  '(doses nos PCDT de Epilepsia e de Dor Crônica; este protocolo não as detalha)');
troca('Infecção pelo HIV em crianças e adolescentes', 'prescricao', 'ver o Apêndice E do PCDT (PENDENTE DE VERIFICAÇÃO neste registro).',
  'ver o Apêndice E do PCDT (prescrição pelo especialista; doses não copiadas para este registro).');
troca('Tumores de ovário na gestação', 'prescricao', 'esquemas de quimioterapia (fármacos e doses): PENDENTE DE VERIFICAÇÃO, não constam no',
  'esquemas de quimioterapia (fármacos e doses): prescrição pela oncologia; não constam no');
troca('Câncer do colo do útero na gestação', 'prescricao', 'doses e ciclos PENDENTE DE VERIFICAÇÃO (decisão da onco',
  'doses e ciclos pela onco');
troca('Arritmias fetais', 'prescricao', 'não constam (PENDENTE DE VERIFICAÇÃO).', 'não constam (decisão da medicina fetal).');
troca('Uso de álcool na gestação', 'prescricao', '(tratamento farmacológico do transtorno por uso de álcool na gestação: PENDENTE DE VERIFICAÇÃO, não consta no c',
  '(tratamento farmacológico do transtorno por uso de álcool na gestação: decisão especializada, não consta no c');
troca('Lúpus eritematoso neonatal', 'prescricao', '(doses: PENDENTE DE VERIFICAÇÃO, prescrição pelo', '(doses: prescrição pelo');
troca('Doença inflamatória intestinal de início muito', 'prescricao', 'doses: PENDENTE DE VERIFICAÇÃO (prescrição pelo', 'doses: prescrição pelo');
troca('Doença renal crônica na infância', 'prescricao', 'não constam no documento lido: PENDENTE DE VERIFICAÇÃO (prescrição pelo', 'não constam no documento lido (prescrição pelo');
troca('Obesidade monogênica e sindrômica', 'prescricao', 'pelo endocrinologista (PENDENTE DE VERIFICAÇÃO).', 'pelo endocrinologista.');
troca('Sequelas de traumatismo cranioencefálico', 'prescricao', 'fármaco, dose e frequência: PENDENTE DE VERIFICAÇÃO (a dire',
  'fármaco, dose e frequência: pela equipe de reabilitação (a dire');
troca('Espasticidade focal e segmentar', 'prescricao', 'doses por músculo: PENDENTE DE VERIFICAÇÃO na bula do produ',
  'doses por músculo: conforme a bula do produ');
troca('Sopro cardíaco inocente na criança', 'prescricao', 'não tratadas na fonte, PENDENTE DE VERIFICAÇÃO)', 'não tratadas na fonte)');
troca('Hipertermia neonatal', 'prescricao', 'para a hipertermia neonatal (dose: PENDENTE DE VERIFICAÇÃO).', 'para a hipertermia neonatal (tratar a causa).');
troca('Edema, varizes e câimbras', 'prescricao', 'sem fármaco na fonte (suplementação: PENDENTE DE VERIFICAÇÃO).', 'sem fármaco na fonte.');
troca('Diminuição da movimentação fetal', 'prescricao', '(cardiotocografia, ultrassonografia): PENDENTE DE VERIFICAÇÃO (não detalhados',
  '(cardiotocografia, ultrassonografia): conforme o serviço de referência (não detalhados');
troca('Baixa produção de leite materno', 'prescricao', 'não há fonte oficial vigente anexada (PENDENTE DE VERIFICAÇÃO).', 'não há fonte oficial vigente anexada.');
for (const nome of ['Pré-eclâmpsia sobreposta', 'Parto gemelar', 'Pneumonia congênita', 'Anencefalia', 'Polidactilia']) {
  troca(nome, 'prescricao', 'Doses e esquemas não citados acima: PENDENTE DE VERIFICAÇÃO.',
    'Doses e esquemas não citados acima: ver os registros e as fichas correspondentes deste app.');
}

// D) Dose-base
// Hemocomponentes (MS, 2015): CH, PFC, plaquetas, crioprecipitado, transfusão maciça
troca('Anemia aguda pós-hemorrágica', 'conduta', 'Hemorragia maciça e outros hemocomponentes: PENDENTE DE VERIFICAÇÃO (não lidos nesta ficha).',
  `Transfusão maciça: reposição de 1 volemia (75 mL/kg) ou mais em 24 h, 50% da volemia em 3 h ou mais de 4 U de CH em 1 h (${HEMO}); doses dos demais hemocomponentes na prescrição.`);
troca('Anemia aguda pós-hemorrágica', 'prescricao', '6) Cristaloide, plasma e plaquetas: doses PENDENTE DE VERIFICAÇÃO (não consultadas',
  `6) Plasma fresco congelado 10 a 20 mL/kg (eleva os fatores em 20% a 30%); plaquetas 1 U de concentrado para cada 7 a 10 kg (criança < 15 kg: 5 a 10 mL/kg); crioprecipitado: cada unidade eleva o fibrinogênio em 5 a 10 mg/dL no adulto, nível hemostático 70 a 100 mg/dL (${HEMO}). Cristaloide: conforme o registro de choque hemorrágico deste app (não consultado`);
troca('Esteatose hepática aguda da gravidez', 'prescricao', 'guiados por coagulograma e sangramento: alvos e doses PENDENTE DE VERIFICAÇÃO.',
  `guiados por coagulograma e sangramento: plasma fresco congelado 10 a 20 mL/kg; plaquetas 1 U para cada 7 a 10 kg (transfusão terapêutica, alvo > 40.000/µL); crioprecipitado para fibrinogênio < 70 a 100 mg/dL (cada unidade eleva 5 a 10 mg/dL) — ${HEMO}.`);
// FTN 2010
troca('Tifo exantemático epidêmico', 'prescricao', 'pediculicida em gel ou creme (produto e posologia: PENDENTE DE VERIFICAÇÃO).',
  `pediculicida — permetrina loção 5% na pele limpa, da cabeça aos pés, por 8 a 12 h, enxaguar e repetir após 7 dias (pediculose corporal, adultos e crianças acima de 2 anos — ${FTN}).`);
troca('Lesões benignas da pele do recém-nascido', 'prescricao', 'corticoide tópico de baixa potência por período curto (fármaco, concentração e duração: PENDENTE DE VERIFICAÇÃO).',
  `corticoide tópico de baixa potência por período curto — ${HIDRO}.`);
troca('Dermatite de contato vulvar', 'prescricao', 'corticoide tópico (potência, produto e duração: PENDENTE DE VERIFICAÇÃO; não detalhados',
  `corticoide tópico — ${HIDRO}, indicação dermatite de contato (a fonte da doença não detalha`);
troca('Lúpus eritematoso neonatal', 'prescricao', 'corticoide tópico (potência e posologia: PENDENTE DE VERIFICAÇÃO).', `corticoide tópico — ${HIDRO}.`);
troca('Anticoncepção injetável', 'prescricao', 'a cada 4 semanas (30 dias); via: PENDENTE DE VERIFICAÇÃO (conferir bula).',
  `a cada 4 semanas (30 dias), por via intramuscular (${FTN}).`);
troca('Esquecimento da pílula anticoncepcional', 'prescricao', 'condutas de esquecimento da minipílula: PENDENTE DE VERIFICAÇÃO.',
  `esquecimento da minipílula (noretisterona): tomar o comprimido esquecido o quanto antes e o próximo na hora certa; atraso acima de 3 h tira a proteção — continuar normalmente e usar método de barreira nos 2 dias seguintes; se houve relação nesse período, considerar contracepção de emergência (${FTN}).`);
troca('Lesões traumáticas da mucosa oral', 'prescricao', '1) Gel anestésico local: posologia PENDENTE DE VERIFICAÇÃO.',
  `1) Gel anestésico local: lidocaína gel 2% — acima de 3 anos, 3,3 a 4,4 mg/kg a cada 3 h, máx. 8 doses/dia (${FTN}); adulto: ver a ficha Lidocaína gel (oral) deste app.`);
// Remissões a fichas e registros
troca('Acidente por himenópteros', 'prescricao', 'analgésico oral e anti-histamínico local (dose e fármaco: PENDENTE DE VERIFICAÇÃO, não especificad',
  'analgésico oral (fichas Paracetamol e Dipirona sódica (Metamizol)) e anti-histamínico local (ficha Dexclorfeniramina (creme)) deste app (a fonte não especificou fármaco nem dose; não especificad');
troca('Escoriações e traumatismos superficiais', 'prescricao', '6) Analgésico e antibiótico: PENDENTE DE VERIFICAÇÃO.',
  '6) Analgésico: fichas Paracetamol e Dipirona sódica (Metamizol) deste app. Antibiótico: PENDENTE DE VERIFICAÇÃO (a fonte não indica).');
troca('Síndrome do choque tóxico estreptocócico', 'prescricao', 'antibioticoterapia parenteral de amplo espectro guiada pelo Gram (esquema: PENDENTE DE VERIFICAÇÃO).',
  'antibioticoterapia parenteral de amplo espectro guiada pelo Gram (esquema: ver o registro Sepse/choque séptico deste app).');
troca('Diarreia em menores de 2 meses', 'prescricao', 'primeira dose de antibiótico parenteral quando indicada (esquema: PENDENTE DE VERIFICAÇÃO).',
  'primeira dose de antibiótico parenteral quando indicada (esquema: ver o registro Sepse neonatal precoce e tardia deste app).');
troca('Perda de peso excessiva e desidratação hipern', 'prescricao', '(esquema de volume: PENDENTE DE VERIFICAÇÃO; ver registros',
  '(esquema de volume: ver os registros');
troca('Idade materna avançada', 'prescricao', 'Ácido acetilsalicílico quando indicado (indicação e dose: PENDENTE DE VERIFICAÇÃO, não detalhadas',
  'Ácido acetilsalicílico quando indicado (indicação e dose: ver a prevenção no registro Pré-eclâmpsia/eclâmpsia deste app; não detalhadas');
troca('Aplasia cutânea congênita', 'prescricao', '(frequência e duração: PENDENTE DE VERIFICAÇÃO).',
  '(frequência e duração: ver as fichas Neomicina + Bacitracina e Mupirocina deste app).');
troca('Candidíase mamilar', 'prescricao', 'Posologia tópica no mamilo da mãe: PENDENTE DE VERIFICAÇÃO (a fonte não det',
  'Posologia tópica no mamilo da mãe: ver a ficha Nistatina deste app (a fonte não det');
troca('Infecção relacionada à assistência em unidade', 'prescricao', 'Intervalos entre doses e dose da oxacilina: PENDENTE DE VERIFICAÇÃO (não',
  'Intervalos entre doses e dose da oxacilina: ver as fichas Ampicilina, Gentamicina, Amicacina e Oxacilina e a calculadora pediátrica deste app (não');

// As fichas e os registros citados têm de existir
for (const f of ['Hidrocortisona (creme)', 'Lidocaína gel (oral)', 'Paracetamol', 'Dipirona sódica (Metamizol)', 'Dexclorfeniramina (creme)',
  'Neomicina + Bacitracina', 'Mupirocina', 'Nistatina', 'Ampicilina', 'Gentamicina', 'Amicacina', 'Oxacilina']) {
  if (!M.some((m) => m.nome === f)) throw new Error('ficha não encontrada: ' + f);
}
for (const r of ['Sepse/choque séptico', 'Sepse neonatal precoce e tardia', 'Pré-eclâmpsia/eclâmpsia']) {
  if (!D.some((d) => d.nome === r)) throw new Error('registro não encontrado: ' + r);
}

fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, D), 'utf8');
console.log('OK', n, 'campo(s)/trecho(s) atualizados pelos critérios');

// Ajustes de redação (repetição criada pelas regras acima)
{
  const D2 = L.lerDados(cfg); let m = 0;
  const ajuste = (nome, campo, a, b) => { const d = D2.find((x, j) => j >= LOTE && x.nome.startsWith(nome)); if (d && String(d[campo]).includes(a)) { d[campo] = d[campo].replace(a, b); m++; } };
  ajuste('Acidente por himenópteros', 'prescricao', ' deste app (a fonte não especificou fármaco nem dose; não especificados na fonte).', ' deste app (a fonte não especifica fármaco nem dose).');
  ajuste('Infecções musculoesqueléticas neonatais', 'exames', ': a fonte não os especifica (a fonte não define).', ': a fonte não os especifica.');
  if (m) fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, D2), 'utf8');
  console.log('OK', m, 'ajuste(s) de redação');
}
