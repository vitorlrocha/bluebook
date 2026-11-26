// Prioridade 2 — PENDENTES de dose nas prescrições de doenças, lote 02 (26/11/2026): diretrizes brasileiras.
// Fontes oficiais do Ministério da Saúde lidas no PDF original:
//  - Protocolos de Intervenção para o SAMU 192 – Suporte Avançado de Vida, 2ª ed. (2016): AC7, AC10, AC37 (dor, adulto),
//    AT4 (choque no trauma), APed26 (anafilaxia), APed30 (dor, criança), APed31 (sedação), ATox 3, 4, 7 e 8.
//  - PCDT da Hanseníase (Portaria SCTIE/MS 67/2022), item 10.1.2.
//  - Manual de Vigilância da Leishmaniose Tegumentar (MS, 2017), item 6.2.5 e Quadro 17.
//  - Manual de Recomendações para o Controle da Tuberculose no Brasil, 2ª ed. (MS, 2019), itens 8.2 e 8.6.
// Uso: node curadoria/pendentes-presc-02.js  (idempotente: só troca se o trecho antigo ainda estiver lá)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'DISEASES');
const D = L.lerDados(cfg);

const SAMU = 'Protocolos de Intervenção para o SAMU 192 – Suporte Avançado de Vida, 2ª ed., 2016';
const DOR_ADULTO = `adulto (${SAMU}, AC37): dor leve, dipirona 1 g IV ou VO ou paracetamol 500 mg VO, ou AINE (cetoprofeno 100 a 300 mg IV, tenoxicam 20 a 40 mg IV/IM ou cetorolaco 30 mg IM/IV); dor moderada, dipirona mais tramadol 100 mg IM/IV lento; dor intensa, dipirona mais morfina 2 a 10 mg/70 kg IV (5 a 20 mg/70 kg IM) ou fentanil 100 a 200 mcg IV (2 a 4 mL de 50 mcg/mL), infusão lenta; analgesia criteriosa se PAS < 90 mmHg`;
const DOR_CRIANCA = `criança (APed30): dipirona 10 a 15 mg/kg/dose 6/6 h (máx. 1 g/dose), paracetamol 10 a 15 mg/kg/dose (máx. 75 mg/kg/dia), morfina 0,1 a 0,15 mg/kg/dose (máx. 10 mg/dose) ou fentanil 1 a 2 mcg/kg/dose lento (máx. 100 mcg)`;

const TROCAS = [
  ['Hanseníase: prevenção de incapacidades', 'prescricao',
    '3) Corticoide em neurite e reações: ver registro de reações hansênicas; doses não lidas neste manual (PENDENTE DE VERIFICAÇÃO).',
    '3) Corticoide em neurite e reação tipo 1 (PCDT da Hanseníase 2022, item 10.1.2.1): prednisona VO 1 mg/kg/dia, reduzindo cerca de 10 mg a cada 15 dias até 20 mg/dia, depois 5 mg a cada 15 dias até 5 mg/dia; manter 5 mg/dia por 15 dias e 5 mg em dias alternados por mais 15 dias (em média, no mínimo 6 meses, com monitoração da função neural). No início, profilaxia da estrongiloidíase: albendazol 400 mg/dia por 3 dias ou ivermectina 200 mcg/kg em dose única. Reação tipo 2: talidomida 100 a 400 mg/dia (corticoide como na tipo 1 se neurite, orquite ou episclerite).'],
  ['Leishmaniose mucosa', 'prescricao',
    'dose e duração: PENDENTE DE VERIFICAÇÃO (a fonte remete ao Manual de Vigilância da Leishmaniose Tegumentar, 2017).',
    'antimoniato de meglumina EV ou IM 20 mg Sb+5/kg/dia em dose única diária por 30 dias (máx. 1.215 mg Sb+5/dia, 3 ampolas) mais pentoxifilina 400 mg VO 3 vezes ao dia por 30 dias; abaixo de 12 anos, antimoniato sem pentoxifilina (Manual de Vigilância da Leishmaniose Tegumentar, MS, 2017, item 6.2.5 e Quadro 17).'],
  ['Leishmaniose mucosa', 'prescricao',
    'anfotericina B lipossomal; dose: PENDENTE DE VERIFICAÇÃO.',
    'anfotericina B lipossomal 2 a 3 mg/kg/dia EV em dose única diária, sem dose máxima diária, até a dose total de 35 a 40 mg/kg (mesmo manual, item 6.2.5). Lesão de laringe ou faringe: tratar internado; pode-se usar hidrocortisona 100 mg EV 6/6 h, iniciada antes da 1ª dose e mantida por 48 a 72 h.'],
  ['Síndrome pós-parada cardíaca', 'prescricao',
    '(dose não detalhada no protocolo: PENDENTE DE VERIFICAÇÃO)',
    `(o AC10 não detalha a dose de manutenção; a dose em bolus do protocolo AC7 é lidocaína 1 a 1,5 mg/kg IV/IO, repetível após 5 a 10 minutos com 0,5 a 0,75 mg/kg — ${SAMU})`],
  ['Cuidados pós-ressuscitação no bebê e na criança', 'prescricao',
    'doses não detalhadas na fonte: PENDENTE DE VERIFICAÇÃO.',
    `doses do mesmo manual (APed30 e APed31): fentanil 1 a 2 mcg/kg/dose IV em infusão lenta (máx. 100 mcg); morfina 0,1 a 0,15 mg/kg/dose (máx. 10 mg/dose); midazolam 0,2 a 0,3 mg/kg/dose IV/IO/IM (máx. 10 mg/dose), contraindicado pelo APed31 se instabilidade hemodinâmica.`],
  ['Pneumotórax aberto', 'prescricao',
    '(volume não detalhado neste protocolo: PENDENTE DE VERIFICAÇÃO)',
    '(protocolo AT4: cristaloide isotônico, de preferência ringer lactato aquecido, sem volume fixo, titulado para PAS > 80 mmHg — > 90 mmHg se TCE)'],
  ['Pneumotórax aberto', 'prescricao',
    '(fármaco e dose não detalhados nesta fonte: PENDENTE DE VERIFICAÇÃO)',
    `conforme o manejo da dor do mesmo manual — ${DOR_ADULTO}`],
  ['Trauma abdominal aberto', 'prescricao',
    '(tipo e volume de fluido: PENDENTE DE VERIFICAÇÃO neste protocolo)',
    '(protocolo AT4: cristaloide isotônico, de preferência ringer lactato aquecido a 39 °C, depois SF 0,9%, sem volume fixo, titulado pela PA)'],
  ['Choque na criança', 'prescricao',
    'epinefrina IM conforme protocolo específico (dose não consta neste protocolo: PENDENTE DE VERIFICAÇÃO)',
    'epinefrina 1:1.000 (1 mg/mL) 0,01 mg/kg (0,01 mL/kg) IM na face anterolateral da coxa, máx. 0,3 mg, repetível a cada 5 a 15 minutos (protocolo APed26 do mesmo manual)'],
  ['Síndromes tóxicas', 'prescricao',
    'Doses: PENDENTE DE VERIFICAÇÃO (não constam neste protocolo).',
    'Doses dos protocolos específicos do mesmo manual: atropina (ATox 8) adulto 1 a 2 mg IV/IO a cada 15 min, criança 0,02 a 0,05 mg/kg (mín. 0,1 mg, máx. 1 mg/dose) a cada 3 a 5 min até secar secreções e reverter broncoespasmo; hidroxocobalamina (ATox 7) adulto 5 g IV em 15 min, criança 70 mg/kg IV em 15 min, 2ª dose se o quadro persistir; tiamina 300 mg IM e, se glicemia < 70 mg/dL, glicose 50% 40 mL IV (ATox 4, adulto); diazepam 10 mg IV lento ou VO, ou midazolam 5 a 15 mg IM (ATox 3, adulto); no adulto (ATox 11), naloxona 0,04 mg, depois 0,4 mg, 2 mg e 10 mg IV/IO a cada 2 a 3 min, flumazenil 0,1 a 0,2 mg IV/IO em 15 a 30 s, repetível até 1 mg, e biperideno 3 a 5 mg IM ou EV (evitar naloxona e flumazenil em dependentes, pelo risco de abstinência com convulsões); na criança, naloxona 0,01 mg/kg IV/IO/IM/SC na overdose e flumazenil 0,01 a 0,02 mg/kg (máx. 0,2 mg/dose; total 0,05 mg/kg ou 1 mg) (APed31).'],
  ['Trauma de membros superiores e inferiores', 'prescricao',
    '(fármaco e dose não detalhados neste protocolo: ver protocolo de manejo da dor; PENDENTE DE VERIFICAÇÃO)',
    `(conforme o manejo da dor do mesmo manual — ${DOR_ADULTO}; ${DOR_CRIANCA})`],
  ['Hemorragia externa grave de extremidade', 'prescricao',
    'Analgesia: ver protocolo de manejo da dor (PENDENTE DE VERIFICAÇÃO).',
    `Analgesia conforme o manejo da dor do mesmo manual — ${DOR_ADULTO}; ${DOR_CRIANCA}.`],
  ['Intoxicação por saneantes domésticos', 'prescricao',
    '(fármaco e dose não lidos: PENDENTE DE VERIFICAÇÃO)',
    `(${DOR_ADULTO}; ${DOR_CRIANCA})`],
  ['Tuberculose na gestação', 'conduta',
    'Indicada profilaxia do recém-nascido com isoniazida (dose e duração: PENDENTE DE VERIFICAÇÃO, não constam no capítulo).',
    'Indicada profilaxia do recém-nascido (Manual de Recomendações para o Controle da Tuberculose no Brasil, 2ª ed., MS, 2019, itens 8.2 e 8.6): não vacinar com BCG ao nascer; isoniazida 10 mg/kg/dia (máx. 300 mg/dia) por 3 meses e então prova tuberculínica; se ≥ 5 mm, manter por mais 3 meses (6 meses no total) sem BCG; se < 5 mm, suspender e vacinar com BCG. Alternativa: rifampicina suspensão por 3 meses (mais 1 mês se PT ≥ 5 mm). Antes, afastar tuberculose ativa ou congênita no RN.'],
  // Atenção à Saúde do Recém-Nascido: guia para os profissionais de saúde (MS, 2ª ed., 2014), v. 2 cap. 14.2.1 e v. 3 cap. 23.5.
  ['Infecção relacionada à assistência em unidade neonatal', 'prescricao',
    'Doses e intervalos: PENDENTE DE VERIFICAÇÃO (ver registro de sepse neonatal e a rotina da CCIH).',
    'Doses do mesmo guia (v. 2, cap. 14.2.1, sepse precoce): ampicilina 200 mg/kg/dia com gentamicina 5 mg/kg/dia; amicacina 20 mg/kg/dia quando a unidade tiver resistência à gentamicina. Intervalos entre doses e dose da oxacilina: PENDENTE DE VERIFICAÇÃO (não constam no guia; ver registro de sepse neonatal e a rotina da CCIH).'],
  ['Pneumonia congênita', 'prescricao',
    'nos critérios acima (dose: PENDENTE DE VERIFICAÇÃO).',
    'nos critérios acima: iniciar com 100 mg/kg de fosfolípides; na lesão inflamatória extensa, como pneumonia, considerar doses próximas a 150 mg/kg; intervalo mínimo de cerca de 6 h entre doses, sem vantagem acima de 4 doses (mesmo guia, v. 3, cap. 23.5).'],
];

let n = 0;
for (const [nome, campo, antigo, novo] of TROCAS) {
  const d = D.find((x) => x.nome.startsWith(nome));
  if (!d) throw new Error('doença não encontrada: ' + nome);
  if (D.indexOf(d) < 3226) throw new Error('registro original da v71, não alterar aqui: ' + nome);
  if (String(d[campo]).includes(novo)) continue;
  if (!String(d[campo]).includes(antigo)) throw new Error('trecho não encontrado em ' + nome + ': ' + antigo.slice(0, 50));
  d[campo] = d[campo].replace(antigo, novo); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, D), 'utf8');
console.log('OK', n, 'trecho(s) PENDENTE resolvidos com diretriz brasileira');
