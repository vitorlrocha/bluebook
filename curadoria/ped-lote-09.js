// Lote 09 da calculadora pediátrica (prioridade 3): terceira rodada de rótulos FDA do DailyMed (NLM/NIH), 25/11/2026.
// Cada entrada foi escrita a partir do trecho lido do rótulo (setid no campo rev); sem número no rótulo = PENDENTE.
// Medicamentos de intervalo semanal/mensal ficam como texto fixo (a calculadora mostraria "por dia").
// Uso: node curadoria/ped-lote-09.js  (acrescenta no fim; não altera os existentes)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'PED_DB');
const P = L.lerDados(cfg);
const R = (nome, setid, x) => 'Conferida em 11/2026 com o rótulo FDA de ' + nome + ' (DailyMed setid ' + setid + '): ' + x;
const C = (via, o, rev) => Object.assign({ via, b: 'dose', f: 1, fonte: 'Ref', rev }, o);
const F = (via, fixo, ob, ap, rev) => ({ via, fixo, ob, ap: [{ l: ap }], fonte: 'Ref', rev });
const PEND = ' Dose máxima em mg: PENDENTE DE VERIFICAÇÃO (o trecho lido do rótulo não traz teto pediátrico).';
const cp = (l, mg, u) => ({ l, mg, u: u || 'comprimido(s)' });

const NOVOS = [
  // ——— Anti-infecciosos
  { k: 'anidulafungina', n: 'Anidulafungina', v: [
    C('EV (ataque no 1º dia, ≥ 1 mês)', { d: [3, 3], dd: 3, mx: 200, ob: 'Dose única de ataque de 3 mg/kg (até 200 mg) no 1º dia; depois 1,5 mg/kg 1x/dia (até 100 mg).', ap: [{ l: 'Frasco 100 mg (concentração após reconstituir: informe abaixo)' }] }, R('Eraxis', 'a88d9010', '≥ 1 mês 3 mg/kg (máx. 200 mg) no dia 1')),
    C('EV (manutenção, ≥ 1 mês)', { d: [1.5, 1.5], dd: 1.5, mx: 100, ob: '1,5 mg/kg 1x/dia (até 100 mg).', ap: [{ l: 'Frasco 100 mg (concentração após reconstituir: informe abaixo)' }] }, R('Eraxis', 'a88d9010', 'manutenção 1,5 mg/kg (máx. 100 mg) 1x/dia'))] },
  { k: 'caspofungina', n: 'Caspofungina', v: [F('EV (3 meses a 17 anos)', 'Dose por superfície corporal (Mosteller): ataque 70 mg/m² no 1º dia, depois 50 mg/m² 1x/dia. Nunca passar de 70 mg por dia.', 'Com rifampicina ou outros indutores: 70 mg/m²/dia (máx. 70 mg). Para doses < 50 mg, preferir o frasco de 50 mg (5 mg/mL).', 'Frasco 50 e 70 mg', R('Cancidas', '3bad23a6', 'pediatria 70 mg/m² no dia 1, depois 50 mg/m²; máx. 70 mg/dia'))] },
  { k: 'micafungina', n: 'Micafungina', v: [
    C('EV (candidemia, ≥ 4 meses)', { d: [2, 2], dd: 2, mxd: 100, ob: '2 mg/kg 1x/dia (máx. 100 mg/dia). Abaixo de 4 meses (sem meningoencefalite): 4 mg/kg 1x/dia.', ap: [{ l: 'Frasco 50 e 100 mg (concentração após reconstituir: informe abaixo)' }] }, R('micafungina', 'a95f901e', '≥ 4 meses candidemia 2 mg/kg (máx. 100 mg)')),
    C('EV (candidíase esofágica, ≥ 4 meses e ≤ 30 kg)', { d: [3, 3], dd: 3, ob: '≤ 30 kg: 3 mg/kg 1x/dia. Acima de 30 kg: 2,5 mg/kg 1x/dia (máx. 150 mg/dia).', ap: [{ l: 'Frasco 50 e 100 mg (concentração após reconstituir: informe abaixo)' }] }, R('micafungina', 'a95f901e', 'esofágica ≤ 30 kg 3 mg/kg; > 30 kg 2,5 mg/kg (máx. 150 mg)')),
    C('EV (profilaxia em TCTH, ≥ 4 meses)', { d: [1, 1], dd: 1, mxd: 50, ob: '1 mg/kg 1x/dia (máx. 50 mg/dia).', ap: [{ l: 'Frasco 50 mg (concentração após reconstituir: informe abaixo)' }] }, R('micafungina', 'a95f901e', 'profilaxia 1 mg/kg (máx. 50 mg)'))] },
  { k: 'isavuconazol', n: 'Isavuconazol', v: [
    C('EV (1 a < 3 anos, < 18 kg)', { d: [15, 15], dd: 15, mx: 372, un: 'mg (sulfato de isavuconazônio)', ob: 'Ataque: 15 mg/kg de 8/8 h por 6 doses (48 h); manutenção 15 mg/kg 1x/dia, 12-24 h após a última dose de ataque. 74,5 mg do sulfato = 40 mg de isavuconazol.', ap: [{ l: 'Frasco 372 mg (concentração após reconstituir: informe abaixo)' }] }, R('Cresemba', '8f7f73b8', '1-< 3 anos < 18 kg 15 mg/kg')),
    C('EV (3 a < 18 anos, < 37 kg)', { d: [10, 10], dd: 10, mx: 372, un: 'mg (sulfato de isavuconazônio)', ob: 'Ataque: 10 mg/kg de 8/8 h por 6 doses; manutenção 10 mg/kg 1x/dia. 37 kg ou mais: 372 mg (1 frasco) no mesmo esquema. Cápsulas só a partir de 6 anos e 16 kg (tabela por peso na bula).', ap: [{ l: 'Frasco 372 mg (concentração após reconstituir: informe abaixo)' }] }, R('Cresemba', '8f7f73b8', '3-< 18 anos < 37 kg 10 mg/kg; ≥ 37 kg 372 mg'))] },
  { k: 'levofloxacino', n: 'Levofloxacino', nao: ['colirio'], v: [C('VO/EV (antraz inalatório pós-exposição ou peste, ≥ 6 meses)', { d: [8, 8], dd: 8, f: 2, mx: 250,
    ob: '8 mg/kg de 12/12 h (máx. 250 mg por dose). Comprimidos só acima de 30 kg. Uso pediátrico por mais de 14 dias não foi estudado. Doses a partir de 50 kg: PENDENTE DE VERIFICAÇÃO.',
    ap: [cp('Comprimido 250 mg', 250)] }, R('levofloxacino comprimido', '46a3c619', '≥ 6 meses 8 mg/kg 12/12 h (máx. 250 mg/dose)'))] },
  { k: 'lincomicina', n: 'Lincomicina', v: [
    C('IM (> 1 mês)', { d: [10, 10], dd: 10, ob: 'Infecções graves: 10 mg/kg IM a cada 24 h. Mais graves: 10 mg/kg a cada 12 h ou com mais frequência.' + PEND, ap: [{ l: 'Ampola (concentração: informe abaixo)' }] }, R('Lincocin', 'c01906fa', '> 1 mês IM 10 mg/kg a cada 24 h ou 12 h')),
    C('EV (> 1 mês)', { d: [10, 20], dd: 10, b: 'dia', f: 2, ob: '10 a 20 mg/kg/dia conforme a gravidade, em doses divididas como no adulto (ver bula), sempre diluída e em infusão.' + PEND, ap: [{ l: 'Ampola (concentração: informe abaixo)' }] }, R('Lincocin', 'c01906fa', '> 1 mês EV 10-20 mg/kg/dia divididos'))] },
  { k: 'minociclina', n: 'Minociclina', v: [C('VO (> 8 anos)', { d: [2, 2], dd: 2, f: 2,
    ob: 'Ataque 4 mg/kg; depois 2 mg/kg de 12/12 h, sem passar da dose usual do adulto. Abaixo de 8 anos: risco de manchar os dentes.' + PEND,
    ap: [cp('Comprimido 100 mg', 100)] }, R('minociclina cápsula', '9013ca48', '> 8 anos 4 mg/kg e depois 2 mg/kg 12/12 h'))] },
  { k: 'sulfadiazina (oral)', n: 'Sulfadiazina (oral)', v: [C('VO (> 2 meses)', { d: [150, 150], dd: 150, b: 'dia', f: 4, mxd: 6000,
    ob: 'Início: metade da dose de 24 h (75 mg/kg). Manutenção 150 mg/kg/dia (ou 4 g/m²) em 4 a 6 tomadas; máx. 6 g/dia. Profilaxia de febre reumática: < 30 kg 500 mg/dia; > 30 kg 1 g/dia. Abaixo de 2 meses só junto com pirimetamina na toxoplasmose congênita.',
    ap: [cp('Comprimido 500 mg', 500)] }, R('sulfadiazina', '6032d6f7', '> 2 meses 150 mg/kg/dia em 4-6 tomadas, máx. 6 g'))] },
  { k: 'remdesivir', n: 'Remdesivir', v: [
    C('EV (≥ 28 dias e 3 a < 40 kg — manutenção)', { d: [2.5, 2.5], dd: 2.5, ob: 'Ataque 5 mg/kg no 1º dia; depois 2,5 mg/kg 1x/dia. 40 kg ou mais: 200 mg no 1º dia e 100 mg/dia. Entre 1,5 e < 3 kg: PENDENTE DE VERIFICAÇÃO (tabela da bula).', ap: [{ l: 'Frasco 100 mg (concentração após diluir: informe abaixo)' }] }, R('Veklury', 'c0978fa8', '≥ 28 dias 3-< 40 kg 5 mg/kg no dia 1 e 2,5 mg/kg/dia')),
    C('EV (< 28 dias e ≥ 1,5 kg — manutenção)', { d: [1.25, 1.25], dd: 1.25, ob: 'Ataque 2,5 mg/kg no 1º dia; depois 1,25 mg/kg 1x/dia.', ap: [{ l: 'Frasco 100 mg (concentração após diluir: informe abaixo)' }] }, R('Veklury', 'c0978fa8', '< 28 dias ≥ 1,5 kg 2,5 mg/kg no dia 1 e 1,25 mg/kg/dia'))] },
  { k: 'zanamivir', n: 'Zanamivir', v: [F('Inalatório', 'Tratamento (≥ 7 anos): 10 mg (2 inalações) 2x/dia por 5 dias. Profilaxia domiciliar (≥ 5 anos): 10 mg 1x/dia por 10 dias.', 'Dose fixa.', 'Pó para inalação 5 mg/blíster', R('Relenza', 'd7c3bcc3', 'tratamento ≥ 7 anos 10 mg 2x/dia; profilaxia ≥ 5 anos 10 mg 1x/dia'))] },
  { k: 'rifapentina', n: 'Rifapentina', v: [F('VO (tuberculose latente, ≥ 2 anos)', '1x por semana por 12 semanas, com isoniazida: 10-14 kg 300 mg; 14,1-25 kg 450 mg; 25,1-32 kg 600 mg; 32,1-50 kg 750 mg; > 50 kg 900 mg (máx.).', 'Isoniazida junto: 2 a 11 anos 25 mg/kg; ≥ 12 anos 15 mg/kg (máx. 900 mg), 1x por semana.', 'Comprimido 150 mg', R('Priftin', '3a64fb70', 'ILTB por peso semanal, máx. 900 mg'))] },
  { k: 'bedaquilina', n: 'Bedaquilina', v: [F('VO (TB resistente, ≥ 2 anos e ≥ 8 kg)', 'Semanas 1-2 (1x/dia) → semanas 3-24 (3x por semana, ≥ 48 h entre doses): 8-< 10 kg 80 → 40 mg; 10-< 15 kg 120 → 60 mg; 15-< 30 kg 200 → 100 mg; ≥ 30 kg 400 → 200 mg.', 'Com alimento. Monitorar ECG (QT) conforme a bula.', 'Comprimido 20 e 100 mg', R('Sirturo', '1534c9ae', 'tabela pediátrica por peso'))] },
  { k: 'triclabendazol', n: 'Triclabendazol', v: [C('VO (fasciolíase, ≥ 6 anos)', { d: [10, 10], dd: 10, f: 2, ob: 'Duas doses de 10 mg/kg com 12 h de intervalo (tratamento de um dia só).' + PEND, ap: [cp('Comprimido 250 mg', 250)] }, R('Egaten', '5552884e', '≥ 6 anos 2 doses de 10 mg/kg com 12 h'))] },
  { k: 'pirantel', n: 'Pirantel (pamoato)', v: [C('VO (dose única, ≥ 2 anos)', { d: [11, 11], dd: 11, mx: 1000, un: 'mg (base)', ob: 'Dose única de 11 mg de pirantel base por kg (5 mg/lb), sem passar de 1 g.', ap: [{ l: 'Comprimido mastigável (mg de base: informe abaixo)' }] }, R('pirantel (oxiurose)', '5799a28e', '≥ 2 anos 11 mg/kg em dose única, máx. 1 g'))] },
  { k: 'ofloxacino (otologico)', n: 'Ofloxacino (otológico)', v: [F('Otológico', 'Otite externa: 6 meses a 13 anos — 5 gotas (0,25 mL) no ouvido afetado 1x/dia por 7 dias; ≥ 13 anos — 10 gotas 1x/dia por 7 dias. Otite média aguda com tubo de ventilação (1 a 12 anos): 5 gotas 2x/dia.', 'Aquecer o frasco na mão 1-2 min antes (evita tontura).', 'Solução otológica 3 mg/mL', R('ofloxacino otológico', '8db221b1', '6 meses-13 anos 5 gotas 1x/dia; ≥ 13 anos 10 gotas'))] },
  // ——— Antivirais (HIV, hepatites)
  { k: 'rilpivirina', n: 'Rilpivirina', v: [F('VO (HIV)', '1x/dia com refeição: 14-< 20 kg 12,5 mg (comprimido dispersível pediátrico); 20-< 25 kg 15 mg (dispersível); ≥ 25 kg 25 mg (comprimido).', 'Dose fixa por peso.', 'Comprimido 25 mg', R('Edurant', '03880372', 'tabela pediátrica por peso'))] },
  { k: 'doravirina', n: 'Doravirina', v: [F('VO (HIV, ≥ 35 kg)', '100 mg 1x/dia, com ou sem alimento.', 'Dose fixa.', 'Comprimido 100 mg', R('Pifeltro', '76ce1f00', '≥ 35 kg 100 mg 1x/dia'))] },
  { k: 'tenofovir alafenamida', n: 'Tenofovir alafenamida', v: [F('VO (hepatite B, ≥ 6 anos e ≥ 25 kg)', '25 mg 1x/dia com alimento.', 'Dose fixa.', 'Comprimido 25 mg', R('Vemlidy', '72e6b33c', '≥ 6 anos e ≥ 25 kg 25 mg 1x/dia'))] },
  { k: 'sofosbuvir', n: 'Sofosbuvir', v: [F('VO (hepatite C, ≥ 3 anos)', '1x/dia por peso: ≥ 35 kg 400 mg; 17-< 35 kg 200 mg; < 17 kg 150 mg (sachê de granulado).', 'Combinação com ribavirina ou outro antiviral conforme genótipo (ver bula).', 'Comprimido 400 mg', R('Sovaldi', '80beab2c', '≥ 3 anos tabela por peso'))] },
  // ——— Anestesia / bloqueio neuromuscular
  { k: 'rocuronio', n: 'Rocurônio', v: [C('EV (intubação)', { d: [0.45, 0.6], dd: 0.6, ob: 'Dose inicial 0,6 mg/kg; 0,45 mg/kg pode bastar conforme a técnica e a idade. Não recomendado para sequência rápida em pediatria (rótulo). Só com via aérea e ventilação garantidas.' + PEND, ap: [{ l: 'Frasco (concentração: informe abaixo)' }] }, R('rocurônio', '31e15c3f', 'pediatria 0,6 mg/kg (ou 0,45 mg/kg)'))] },
  { k: 'vecuronio', n: 'Vecurônio', v: [C('EV (intubação, 10 a 16 anos)', { d: [0.08, 0.1], dd: 0.08, ob: '10-16 anos: mesma dose por kg do adulto (0,08-0,1 mg/kg). 1 a 10 anos podem precisar de dose inicial um pouco maior e reforços mais frequentes. Abaixo de 7 semanas: não estabelecido.' + PEND, ap: [{ l: 'Frasco 10 mg (concentração após reconstituir: informe abaixo)' }] }, R('vecurônio', 'b012b1b1', '10-16 anos 0,08-0,1 mg/kg como adulto'))] },
  { k: 'neostigmina', n: 'Neostigmina', v: [C('EV (reversão de bloqueio, todas as idades)', { d: [0.03, 0.07], dd: 0.03, mx: 5,
    ob: '0,03 a 0,07 mg/kg conforme o grau de bloqueio (monitor de TOF). Dose total máxima 0,07 mg/kg ou 5 mg, o que for menor. Observar o efeito de um anticolinérgico (ex.: atropina) antes, para reduzir o risco de bradicardia.',
    ap: [{ l: 'Ampola (concentração: informe abaixo)' }] }, R('neostigmina', '6080b3f2', 'pediatria igual ao adulto: 0,03-0,07 mg/kg, máx. 5 mg'))] },
  // ——— Neurologia
  { k: 'canabidiol', n: 'Canabidiol', v: [
    C('VO (Lennox-Gastaut ou Dravet)', { d: [2.5, 10], dd: 2.5, f: 2, mdk: 20, ob: 'Início 2,5 mg/kg 2x/dia; após 1 semana, 5 mg/kg 2x/dia. Máximo 10 mg/kg 2x/dia (20 mg/kg/dia).', ap: [{ l: 'Solução oral (concentração: informe abaixo)' }] }, R('Epidiolex', '8bf27097', 'LGS/Dravet 2,5 → 5 → máx. 10 mg/kg 2x/dia')),
    C('VO (complexo da esclerose tuberosa)', { d: [2.5, 12.5], dd: 2.5, f: 2, mdk: 25, ob: 'Início 2,5 mg/kg 2x/dia; subir 2,5 mg/kg 2x/dia por semana até 12,5 mg/kg 2x/dia (25 mg/kg/dia).', ap: [{ l: 'Solução oral (concentração: informe abaixo)' }] }, R('Epidiolex', '8bf27097', 'CET até 12,5 mg/kg 2x/dia'))] },
  { k: 'estiripentol', n: 'Estiripentol', v: [C('VO (Dravet, ≥ 6 meses e ≥ 7 kg)', { d: [50, 50], dd: 50, b: 'dia', f: 2, mxd: 3000,
    ob: '50 mg/kg/dia: 25 mg/kg 2x/dia (a partir de 10 kg pode ser 16,67 mg/kg 3x/dia). Abaixo de 1 ano, no máximo 2 tomadas por dia. Máx. 3.000 mg/dia.',
    ap: [{ l: 'Cápsula 250 mg', mg: 250, u: 'cápsula(s)' }] }, R('Diacomit', '58304ba8', '50 mg/kg/dia em 2-3 tomadas, máx. 3.000 mg'))] },
  { k: 'fenfluramina', n: 'Fenfluramina', v: [C('VO (Dravet ou Lennox-Gastaut)', { d: [0.1, 0.35], dd: 0.1, f: 2, mxd: 26,
    ob: 'Início 0,1 mg/kg 2x/dia, subindo por semana até 0,35 mg/kg 2x/dia (máx. 26 mg/dia). Com estiripentol + clobazam: máx. 0,2 mg/kg 2x/dia (17 mg/dia).',
    ap: [{ l: 'Solução oral (concentração: informe abaixo)' }] }, R('Fintepla', 'e88f360e', '0,1 → 0,35 mg/kg 2x/dia, máx. 26 mg/dia'))] },
  { k: 'felbamato', n: 'Felbamato', v: [C('VO (Lennox-Gastaut, 2 a 14 anos)', { d: [15, 45], dd: 15, b: 'dia', f: 3, mdk: 45,
    ob: 'Início 15 mg/kg/dia em 3 ou 4 tomadas (reduzindo os outros anticonvulsivantes em 20%); subir 15 mg/kg/dia por semana até 45 mg/kg/dia.' + PEND,
    ap: [cp('Comprimido 400 mg', 400)] }, R('Felbatol', '2f522701', 'LGS 2-14 anos 15 → 45 mg/kg/dia'))] },
  { k: 'primidona', n: 'Primidona', v: [C('VO (< 8 anos, manutenção)', { d: [10, 25], dd: 10, b: 'dia', f: 3,
    ob: 'Esquema de início: dias 1-3 50 mg à noite; dias 4-6 50 mg 2x/dia; dias 7-9 100 mg 2x/dia; a partir do dia 10, 125-250 mg 3x/dia. Manutenção usual 125-250 mg 3x/dia ou 10-25 mg/kg/dia divididos.' + PEND,
    ap: [cp('Comprimido 100 mg', 100)] }, R('primidona', 'dc018b1d', '< 8 anos 10-25 mg/kg/dia ou 125-250 mg 3x/dia'))] },
  { k: 'tiagabina', n: 'Tiagabina', v: [F('VO (12 a 18 anos)', 'Início 4 mg 1x/dia; na 2ª semana dose diária +4 mg; depois +4 a 8 mg por semana até a resposta ou 32 mg/dia.', 'Esquema para quem usa indutor enzimático (ver bula para os demais).', 'Comprimido 5 mg', R('Gabitril', '72b7f357', '12-18 anos início 4 mg, até 32 mg/dia'))] },
  // ——— Psiquiatria
  { k: 'asenapina', n: 'Asenapina', v: [F('Sublingual (mania bipolar, 10 a 17 anos)', '2,5 a 10 mg 2x/dia, ajustando conforme resposta e tolerância.', 'Dose fixa.', 'Comprimido sublingual 5 mg', R('Saphris', '5429f134', '10-17 anos 2,5-10 mg 2x/dia'))] },
  { k: 'lurasidona', n: 'Lurasidona', v: [F('VO', 'Esquizofrenia (13-17 anos): início 40 mg 1x/dia, faixa 40-80 mg/dia. Depressão bipolar (10-17 anos): início 20 mg 1x/dia, faixa 20-80 mg/dia.', 'Dose fixa.', 'Comprimido 40 mg', R('Latuda', 'afad3051', 'adolescentes 40-80 mg; bipolar 10-17 anos 20-80 mg'))] },
  { k: 'paliperidona', n: 'Paliperidona', nao: ['palmitato'], v: [F('VO (esquizofrenia, 12 a 17 anos)', 'Início 3 mg 1x/dia. Nos estudos, doses até 6 mg (< 51 kg) e 12 mg (≥ 51 kg) não trouxeram mais eficácia e tiveram mais efeitos adversos.', 'Dose fixa.', 'Comprimido 3 mg', R('Invega', '7b8e5b26', '12-17 anos início 3 mg 1x/dia'))] },
  { k: 'dexmetilfenidato', n: 'Dexmetilfenidato', v: [F('VO (TDAH, ≥ 6 anos)', 'Sem uso prévio de metilfenidato: 2,5 mg 2x/dia (5 mg/dia); subir 2,5 a 5 mg por semana até no máximo 20 mg/dia (10 mg 2x/dia).', 'Tomadas com pelo menos 4 h de intervalo.', 'Comprimido 5 mg', R('Focalin', '2016f5c2', '2,5 mg 2x/dia até máx. 20 mg/dia'))] },
  { k: 'duloxetina', n: 'Duloxetina', v: [F('VO', 'Ansiedade generalizada (7-17 anos): 30 mg 1x/dia por 2 semanas, depois considerar 60 mg 1x/dia. Fibromialgia (13-17 anos): início 30 mg 1x/dia.', 'Doses acima de 60 mg/dia sem benefício adicional comprovado. Alerta de ideação suicida.', 'Cápsula 30 mg', R('duloxetina', '3ac53025', 'TAG 7-17 anos 30 → 60 mg/dia'))] },
  // ——— Cardiologia / hipertensão
  { k: 'lisinopril', n: 'Lisinopril', v: [C('VO (hipertensão, ≥ 6 anos)', { d: [0.07, 0.61], dd: 0.07, mx: 40,
    ob: 'Início 0,07 mg/kg 1x/dia (até 5 mg). Ajustar pela PA até 0,61 mg/kg (até 40 mg) 1x/dia. Dose inicial vale para TFG > 30 mL/min/1,73 m².',
    ap: [cp('Comprimido 5 mg', 5), cp('Comprimido 10 mg', 10)] }, R('lisinopril', '8824e5e5', '≥ 6 anos 0,07 mg/kg (até 5 mg) → máx. 0,61 mg/kg ou 40 mg'))] },
  { k: 'metoprolol succinato', n: 'Metoprolol succinato', v: [C('VO (hipertensão, ≥ 6 anos)', { d: [1, 2], dd: 1, mx: 200,
    ob: 'Início 1 mg/kg 1x/dia (dose inicial máx. 50 mg). Acima de 2 mg/kg (ou 200 mg) por dia não foi estudado em crianças.',
    ap: [cp('Comprimido de liberação prolongada 25 mg', 25), cp('Comprimido de liberação prolongada 50 mg', 50)] }, R('metoprolol succinato', '459fe5ce', '≥ 6 anos 1 mg/kg (início até 50 mg), > 2 mg/kg não estudado'))] },
  { k: 'metildopa', n: 'Metildopa', v: [C('VO (criança)', { d: [10, 65], dd: 10, b: 'dia', f: 2, mdk: 65, mxd: 3000,
    ob: 'Início 10 mg/kg/dia em 2 a 4 tomadas. Máximo 65 mg/kg/dia ou 3 g/dia, o que for menor.',
    ap: [cp('Comprimido 250 mg', 250)] }, R('metildopa', '9e22e1d8', '10 mg/kg/dia em 2-4 tomadas; máx. 65 mg/kg ou 3 g'))] },
  { k: 'bosentana', n: 'Bosentana', v: [F('VO (hipertensão pulmonar)', '≤ 12 anos (2x/dia, início e manutenção): 4-8 kg 16 mg; > 8-16 kg 32 mg; > 16-24 kg 48 mg; > 24-40 kg 64 mg. > 12 anos: 62,5 mg 2x/dia por 4 semanas; se > 40 kg, depois 125 mg 2x/dia.', 'Monitorar transaminases conforme a bula.', 'Comprimido 62,5 mg', R('Tracleer', '749e42fb', 'tabela pediátrica por peso'))] },
  { k: 'sildenafila', n: 'Sildenafila', v: [F('VO (hipertensão pulmonar, 1 a 17 anos)', '≤ 20 kg: 10 mg 3x/dia. > 20 kg: 20 mg 3x/dia. Pode-se aumentar conforme sintomas e tolerância.', 'Indicação pediátrica é só a hipertensão arterial pulmonar.', 'Comprimido 20 mg', R('Revatio', '3bb9363e', '≤ 20 kg 10 mg 3x/dia; > 20 kg 20 mg 3x/dia'))] },
  { k: 'dalteparina', n: 'Dalteparina', v: [
    C('SC (TEV, nascimento a < 2 anos)', { d: [150, 150], dd: 150, f: 2, un: 'UI', ob: 'Dose inicial 150 UI/kg 2x/dia (RN ≥ 35 semanas de idade gestacional). Ajustar de 25 em 25 UI/kg para anti-Xa 0,5-1 UI/mL.', ap: [{ l: 'Seringa (UI/mL: informe abaixo)' }] }, R('Fragmin', '23527b8b', '< 2 anos 150 UI/kg 2x/dia')),
    C('SC (TEV, 2 a < 8 anos)', { d: [125, 125], dd: 125, f: 2, un: 'UI', ob: 'Dose inicial 125 UI/kg 2x/dia. Ajustar pelo anti-Xa (0,5-1 UI/mL).', ap: [{ l: 'Seringa (UI/mL: informe abaixo)' }] }, R('Fragmin', '23527b8b', '2-< 8 anos 125 UI/kg 2x/dia')),
    C('SC (TEV, 8 a < 17 anos)', { d: [100, 100], dd: 100, f: 2, un: 'UI', ob: 'Dose inicial 100 UI/kg 2x/dia. Ajustar pelo anti-Xa (0,5-1 UI/mL).', ap: [{ l: 'Seringa (UI/mL: informe abaixo)' }] }, R('Fragmin', '23527b8b', '8-< 17 anos 100 UI/kg 2x/dia'))] },
  // ——— Lipídios
  { k: 'pravastatina', n: 'Pravastatina', v: [F('VO (HF heterozigótica, ≥ 8 anos)', '8 a 13 anos: 20 mg 1x/dia. 14 a 18 anos: início 40 mg 1x/dia.', 'Dose fixa por idade.', 'Comprimido 20 mg', R('pravastatina', '40aa2d36', '8-13 anos 20 mg; 14-18 anos 40 mg'))] },
  { k: 'pitavastatina', n: 'Pitavastatina', v: [F('VO (≥ 8 anos)', '2 a 4 mg 1x/dia.', 'Dose fixa.', 'Comprimido 2 mg', R('Livalo', '44dcbf97', 'adultos e ≥ 8 anos 2-4 mg/dia'))] },
  { k: 'fluvastatina', n: 'Fluvastatina', v: [F('VO (HF heterozigótica, ≥ 10 anos)', 'Liberação prolongada: 80 mg 1x/dia, para quem precisa de 80 mg/dia.', 'Dose fixa.', 'Comprimido LP 80 mg', R('Lescol XL', '726ea2db', '≥ 10 anos 80 mg 1x/dia'))] },
  { k: 'evolocumabe', n: 'Evolocumabe', v: [F('SC (≥ 10 anos)', 'HF heterozigótica: 140 mg a cada 2 semanas OU 420 mg 1x por mês. HF homozigótica: início 420 mg 1x por mês.', 'Dose fixa.', 'Caneta 140 mg/mL', R('Repatha', 'cd61e902', '≥ 10 anos 140 mg 2/2 sem ou 420 mg/mês'))] },
  { k: 'alirocumabe', n: 'Alirocumabe', v: [F('SC (HF heterozigótica, ≥ 8 anos)', '< 50 kg: 150 mg a cada 4 semanas. ≥ 50 kg: 300 mg a cada 4 semanas. Resposta insuficiente: < 50 kg 75 mg a cada 2 semanas; ≥ 50 kg 150 mg a cada 2 semanas.', 'Dose fixa por peso.', 'Caneta 75 e 150 mg', R('Praluent', '446f6b5c', '≥ 8 anos < 50 kg 150 mg/4 sem; ≥ 50 kg 300 mg/4 sem'))] },
  // ——— Endocrinologia
  { k: 'metimazol', n: 'Metimazol (Tiamazol)', v: [C('VO (hipertireoidismo, criança — início)', { d: [0.4, 0.4], dd: 0.4, b: 'dia', f: 3,
    ob: 'Início 0,4 mg/kg/dia dividido em 3 tomadas de 8/8 h. Manutenção: PENDENTE DE VERIFICAÇÃO. Preferido ao propiltiouracil em crianças (risco hepático).' + PEND,
    ap: [cp('Comprimido 5 mg', 5)] }, R('metimazol', '06bb4bcc', 'pediatria início 0,4 mg/kg/dia em 3 tomadas'))] },
  { k: 'liraglutida', n: 'Liraglutida', nao: ['3 mg'], v: [F('SC (DM2, ≥ 10 anos)', 'Início 0,6 mg 1x/dia por pelo menos 1 semana; se precisar, 1,2 mg/dia e depois 1,8 mg/dia (cada passo após ≥ 1 semana).', 'Dose fixa.', 'Caneta 6 mg/mL', R('Victoza', '5a9ef4ea', 'pediatria 0,6 → 1,2 → 1,8 mg/dia'))] },
  { k: 'dulaglutida', n: 'Dulaglutida', v: [F('SC (DM2, ≥ 10 anos)', '0,75 mg 1x por semana; se precisar, 1,5 mg 1x por semana (máximo pediátrico) após ≥ 4 semanas.', 'Dose fixa.', 'Caneta 0,75 e 1,5 mg', R('Trulicity', '463050bd', 'pediatria 0,75 → máx. 1,5 mg/semana'))] },
  // ——— Hematologia
  { k: 'hidroxiureia', n: 'Hidroxiureia (hidroxicarbamida)', v: [C('VO (anemia falciforme, criança)', { d: [20, 35], dd: 20, mdk: 35,
    ob: 'Início 20 mg/kg 1x/dia (peso real ou ideal, o menor). Subir 5 mg/kg/dia a cada 8 semanas (ou antes, em crise grave) até a dose máxima tolerada ou 35 mg/kg/dia, com hemograma em faixa aceitável.',
    ap: [cp('Cápsula 500 mg', 500, 'cápsula(s)')] }, R('Siklos', '76957c0d', 'crianças 20 mg/kg/dia, até 35 mg/kg/dia'))] },
  { k: 'eritropoetina', n: 'Eritropoetina alfa', v: [F('EV/SC', 'Doença renal crônica (≥ 1 mês): início 50 UI/kg 3x por semana; iniciar só com Hb < 10 g/dL; reduzir ou suspender se Hb perto de 12 g/dL. Quimioterapia (≥ 5 anos): 600 UI/kg EV 1x por semana.', 'Na DRC em hemodiálise, preferir EV. Avaliar ferro antes.', 'Frasco 4.000 UI', R('Epogen', '1f2d0b28', 'DRC 50 UI/kg 3x/semana; quimio ≥ 5 anos 600 UI/kg/semana'))] },
  { k: 'pegfilgrastim', n: 'Pegfilgrastim', v: [F('SC (quimioterapia mielossupressora)', '≥ 45 kg: 6 mg 1x por ciclo. Abaixo de 45 kg: dose por peso — PENDENTE DE VERIFICAÇÃO (tabela da bula).', 'Dose fixa.', 'Seringa 6 mg/0,6 mL', R('pegfilgrastim (biossimilar)', 'c48fe1a7', '≥ 45 kg 6 mg por ciclo'))] },
  { k: 'filgrastim peguilado', n: 'Filgrastim peguilado', v: [F('SC (quimioterapia mielossupressora)', '≥ 45 kg: 6 mg 1x por ciclo. Abaixo de 45 kg: dose por peso — PENDENTE DE VERIFICAÇÃO (tabela da bula).', 'Dose fixa.', 'Seringa 6 mg/0,6 mL', R('pegfilgrastim (biossimilar)', 'c48fe1a7', '≥ 45 kg 6 mg por ciclo'))] },
  // ——— Imunobiológicos (intervalos semanais ou maiores: texto fixo)
  { k: 'abatacepte', n: 'Abatacepte', v: [F('EV/SC (AIJ poliarticular)', 'EV (≥ 6 anos): < 75 kg 10 mg/kg; ≥ 75 kg dose de adulto (máx. 1.000 mg), em 30 min (intervalos: ver bula). SC (≥ 2 anos, 1x por semana): 10-< 25 kg 50 mg; 25-< 50 kg 87,5 mg; ≥ 50 kg 125 mg.', 'Profilaxia de DECH aguda: ver bula.', 'Frasco EV 250 mg', R('Orencia', '0836c6ac', 'AIJp EV 10 mg/kg (< 75 kg); SC por peso'))] },
  { k: 'adalimumabe', n: 'Adalimumabe', v: [F('SC', 'AIJ poliarticular ou uveíte (≥ 2 anos), a cada 2 semanas: 15-< 30 kg 20 mg; ≥ 30 kg 40 mg. Doença de Crohn (≥ 6 anos): 17-< 40 kg 80 mg no dia 1, 40 mg no dia 15 e 20 mg a cada 2 semanas a partir do dia 29; ≥ 40 kg 160 mg no dia 1, 80 mg no dia 15 e 40 mg a cada 2 semanas.', 'Dose fixa por peso.', 'Seringa 40 mg', R('adalimumabe (biossimilar Amjevita)', 'd7862491', 'AIJ/uveíte e Crohn pediátrico por peso'))] },
  { k: 'infliximabe', n: 'Infliximabe', v: [F('EV (Crohn ou retocolite, ≥ 6 anos)', '5 mg/kg nas semanas 0, 2 e 6, depois a cada 8 semanas, em infusão de pelo menos 2 h.', 'Dose por peso a cada aplicação (não é diária).', 'Frasco 100 mg', R('Remicade', 'a0a046c1', 'pediatria ≥ 6 anos 5 mg/kg 0-2-6 e 8/8 semanas'))] },
  { k: 'tocilizumabe', n: 'Tocilizumabe', v: [F('EV/SC (AIJ poliarticular)', 'EV a cada 4 semanas: < 30 kg 10 mg/kg; ≥ 30 kg 8 mg/kg. SC: < 30 kg 162 mg a cada 3 semanas; ≥ 30 kg: PENDENTE DE VERIFICAÇÃO.', 'AIJ sistêmica (≥ 2 anos) e síndrome de liberação de citocinas: dose PENDENTE DE VERIFICAÇÃO.', 'Frasco 80 mg/4 mL', R('Actemra', '2e5365ff', 'AIJp EV < 30 kg 10 mg/kg; ≥ 30 kg 8 mg/kg'))] },
  { k: 'tofacitinibe', n: 'Tofacitinibe', v: [F('VO (AIJ poliarticular ou artrite psoriásica, ≥ 2 anos e ≥ 10 kg)', '2x/dia: 10-< 20 kg 3,2 mg (3,2 mL da solução); 20-< 40 kg 4 mg (4 mL); ≥ 40 kg 5 mg.', 'Risco de trombose (ver bula).', 'Comprimido 5 mg', R('Xeljanz', 'cf74ba2f', 'pediatria por peso 3,2 / 4 / 5 mg 2x/dia'))] },
  { k: 'ustequinumabe', n: 'Ustequinumabe', v: [F('SC (psoríase em placas, ≥ 6 anos)', 'Por peso: < 60 kg 0,75 mg/kg; 60-100 kg 45 mg; > 100 kg 90 mg. Intervalos de aplicação: ver bula.', 'Crohn pediátrico (≥ 2 anos): dose EV inicial por peso, ver bula.', 'Seringa 45 mg', R('Stelara', 'c77a9664', 'psoríase pediátrica < 60 kg 0,75 mg/kg'))] },
  { k: 'secuquinumabe', n: 'Secuquinumabe', v: [F('SC (psoríase em placas, criança)', 'Semanas 0, 1, 2, 3 e 4 e depois a cada 4 semanas: < 50 kg 75 mg; ≥ 50 kg 150 mg.', 'Outras indicações pediátricas: ver bula.', 'Seringa 75 e 150 mg', R('Cosentyx', '77c4b13e', 'psoríase pediátrica < 50 kg 75 mg; ≥ 50 kg 150 mg'))] },
  { k: 'dupilumabe', n: 'Dupilumabe', v: [F('SC', 'Dermatite atópica (6 meses a 5 anos, sem ataque), a cada 4 semanas: 5-< 15 kg 200 mg; 15-< 30 kg 300 mg. Esofagite eosinofílica (≥ 1 ano e ≥ 15 kg): 15-< 30 kg 200 mg a cada 2 semanas; 30-< 40 kg 300 mg a cada 2 semanas; ≥ 40 kg 300 mg por semana.', 'Dermatite atópica de 6 a 17 anos: tabela com dose de ataque na bula.', 'Seringa 200 e 300 mg', R('Dupixent', '595f437d', 'DA 6 meses-5 anos e EoE por peso'))] },
  { k: 'mepolizumabe', n: 'Mepolizumabe', v: [F('SC (asma grave)', '6 a 11 anos: 40 mg a cada 4 semanas. 12 a 17 anos: 100 mg a cada 4 semanas.', 'Dose fixa por idade.', 'Frasco 100 mg', R('Nucala', 'fefb887c', 'asma 6-11 anos 40 mg; ≥ 12 anos 100 mg a cada 4 semanas'))] },
  // ——— Outros
  { k: 'dornase alfa', n: 'Dornase alfa', v: [F('Inalatório (fibrose cística)', '2,5 mg (1 ampola) nebulizado 1x/dia. Alguns pacientes se beneficiam de 2x/dia.', 'Usar nebulizador recomendado na bula.', 'Ampola 2,5 mg/2,5 mL', R('Pulmozyme', 'd8c78a7e', '2,5 mg 1x/dia'))] },
  { k: 'pancrelipase', n: 'Pancrelipase', v: [
    C('VO (> 12 meses a < 4 anos)', { d: [1000, 1000], dd: 1000, un: 'unidades de lipase', mdk: 10000, ob: 'Início 1.000 unidades de lipase/kg por refeição. Não passar de 2.500 U/kg/refeição, 10.000 U/kg/dia ou 4.000 U/g de gordura/dia sem investigar.', ap: [{ l: 'Cápsula 10.000 U de lipase', mg: 10000, u: 'cápsula(s)' }] }, R('Creon', '073201aa', '> 12 meses-< 4 anos 1.000 U/kg/refeição')),
    C('VO (≥ 4 anos)', { d: [500, 500], dd: 500, un: 'unidades de lipase', mdk: 10000, ob: 'Início 500 unidades de lipase/kg por refeição. Não passar de 2.500 U/kg/refeição ou 10.000 U/kg/dia.', ap: [{ l: 'Cápsula 25.000 U de lipase', mg: 25000, u: 'cápsula(s)' }] }, R('Creon', '073201aa', '≥ 4 anos 500 U/kg/refeição'))] },
  { k: 'isotretinoina (oral)', n: 'Isotretinoína (oral)', v: [C('VO (acne nodular grave, ≥ 12 anos)', { d: [0.5, 1], dd: 0.5, b: 'dia', f: 2,
    ob: '0,5 a 1 mg/kg/dia em 2 tomadas por 15 a 20 semanas. Contraindicada na gestação (ver bula).',
    ap: [cp('Cápsula 20 mg', 20, 'cápsula(s)')] }, R('isotretinoína', '9f1c8971', '≥ 12 anos 0,5-1 mg/kg/dia em 2 tomadas'))] },
  { k: 'rabeprazol', n: 'Rabeprazol', v: [F('VO (≥ 12 anos)', 'DRGE sintomática: 20 mg 1x/dia (duração: PENDENTE DE VERIFICAÇÃO).', 'De 1 a 11 anos o rótulo indica outra formulação (granulado).', 'Comprimido 20 mg', R('Aciphex', '1eb38279', 'adolescentes ≥ 12 anos DRGE 20 mg'))] },
  { k: 'oximetazolina', n: 'Oximetazolina', v: [F('Nasal (6 a < 12 anos, com supervisão de adulto)', '2 ou 3 jatos em cada narina, no máximo a cada 10-12 h.', 'Abaixo de 6 anos: perguntar ao médico (rótulo).', 'Solução nasal 0,05%', R('oximetazolina nasal', '58e88fa2', '6-< 12 anos 2-3 jatos de 10-12 h'))] },
];

let n = 0;
for (const e of NOVOS) {
  if (P.some((x) => x.k === e.k)) { console.log('já existe, pulado:', e.k); continue; }
  P.push(e); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, P), 'utf8');
console.log('OK', n, 'medicamento(s) novos na calculadora pediátrica; total', P.length);
