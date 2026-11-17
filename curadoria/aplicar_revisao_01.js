// Aplica ao lote-01.json os ajustes da curadoria/revisao-lote-01.md (texto antigo -> novo).
// Cada troca precisa achar o texto antigo exatamente uma vez no campo indicado; senão aborta.
'use strict';
const fs = require('fs');
const path = require('path');
const arq = path.join(__dirname, 'lote-01.json');
const lote = JSON.parse(fs.readFileSync(arq, 'utf8'));
const porNome = n => {
  const i = lote.doencas.findIndex(d => d.registro.nome.startsWith(n));
  if (i < 0) throw new Error('registro não encontrado: ' + n);
  return lote.doencas[i];
};
const log = [];
function troca(nome, campo, antigo, novo) {
  const item = porNome(nome);
  const alvo = campo === 'observacoes' ? item : item.registro;
  const txt = alvo[campo];
  const n = txt.split(antigo).length - 1;
  if (n !== 1) throw new Error(`${nome}/${campo}: texto antigo encontrado ${n} vezes: ${antigo.slice(0, 60)}`);
  alvo[campo] = txt.replace(antigo, novo);
  log.push(`${nome} | ${campo}`);
}

// 1. Hipertensão gestacional
troca('Hipertensão gestacional', 'exames',
  'Pesquisa seriada de proteinúria (urina 24 h, relação proteína/creatinina ou fita: 1+ ≈ 30 mg/dL); exames para afastar disfunção de órgão-alvo (hemograma com plaquetas, transaminases, creatinina, DHL, bilirrubinas);',
  'Monitorar o surgimento de pré-eclâmpsia: proteinúria (urina 24 h, relação proteína/creatinina ou fita: 1+ ≈ 30 mg/dL) e, se houver suspeita, os exames mínimos da pré-eclâmpsia (hemograma com plaquetas, DHL, bilirrubinas, creatinina, AST);');
troca('Hipertensão gestacional', 'criterios', 'sentada, manguito adequado', 'sentada, manguito de 13 cm no braço direito, na altura do coração');

// 2. Sepse na gestação
const S = 'Sepse na gestação';
troca(S, 'criterios', '(FR > 22 irpm, PAS < 100 mmHg, alteração do nível de consciência)',
  '(FR ≥ 22 irpm, PAS ≤ 100 mmHg, alteração do nível de consciência (Glasgow < 15))');
troca(S, 'criterios', 'necessidade de vasopressor para PAM ≥ 65 mmHg ou lactato > 2 mmol/L.',
  'necessidade de vasopressor para manter PAM ≥ 65 mmHg e lactato > 2 mmol/L apesar de reposição volêmica adequada (Sepsis-3, referência do cap. 38).');
troca(S, 'exames', '; avaliação da vitalidade fetal.', '.');
troca(S, 'tratamento', '(cada hora de atraso aumenta a mortalidade)', '(o atraso do antibiótico aumenta a mortalidade a cada hora)');
troca(S, 'conduta', 'lactato, culturas, antibiótico, cristaloide (Ringer lactato)', 'lactato, culturas, antibiótico, oxigênio, cristaloide (Ringer lactato)');
troca(S, 'prescricao', 'ceftriaxona 2 g IV 1 vez ao dia + azitromicina 500 mg IV ou VO 1 vez ao dia por 5 dias.',
  'ceftriaxona 2 g IV 1 vez ao dia (duração não informada na fonte: PENDENTE DE VERIFICAÇÃO) + azitromicina 500 mg IV ou VO 1 vez ao dia por 5 dias.');
troca(S, 'prescricao', 'Cristaloide (Ringer lactato) 30 mL/kg o mais rápido possível, idealmente em 30 a 60 min, se hipotensão ou lactato elevado; reavaliar volemia e risco de congestão pulmonar (volume específico para gestante: PENDENTE DE VERIFICAÇÃO).',
  'Cristaloide (Ringer lactato) 20 mL/kg nas primeiras 3 horas, com meta de PAM > 65 mmHg (MS 2022, cap. 38, fig. 3); reavaliar volemia e risco de congestão pulmonar a cada etapa. Fontes não específicas da gestação (Fiocruz 2019; Anvisa) citam 30 mL/kg em 30 a 60 min.');
troca(S, 'prescricao', 'cap. 27, 28 e 38 (2022)', 'cap. 27, 28 e 38, incluindo a fig. 3 do cap. 38 (2022)');
troca(S, 'observacoes', '3) O volume de 30 mL/kg vem de fonte geral (Anvisa) e do portal da Fiocruz; há debate sobre volume menor em gestantes; marcado PENDENTE para volume específico. 4) A figura do qSOFA do manual é imagem; os limiares (FR > 22, PAS < 100, consciência alterada) foram tirados do portal da Fiocruz.',
  '3) Após a revisão de fontes: o volume passou a seguir a fig. 3 do cap. 38 do manual do MS (20 mL/kg até a 3ª hora, lida pelo revisor); 30 mL/kg (Fiocruz, Anvisa) ficou só como menção. 4) A figura do qSOFA do manual é imagem e não pôde ser lida; os limiares seguem a Sepsis-3 (Singer 2016, referência do cap. 38): FR ≥ 22, PAS ≤ 100, Glasgow < 15. Choque séptico exige vasopressor e lactato > 2 juntos.');

// 3. Esteatose hepática aguda da gravidez
const E = 'Esteatose hepática aguda';
troca(E, 'introducao', 'Associa-se a defeito fetal da oxidação de ácidos graxos (principalmente deficiência de LCHAD).',
  'Associa-se a defeito da oxidação de ácidos graxos na unidade feto-placentária (sobretudo deficiência de LCHAD), em geral com mãe heterozigota.');
troca(E, 'exames', 'glicemia (repetida)', 'glicemia');
troca(E, 'exames', 'Biópsia hepática raramente necessária.', 'A histologia (esteatose microvesicular) é patognomônica e faz parte dos critérios de Swansea.');
troca(E, 'tratamento', 'pois a falência hepática progride enquanto o feto estiver no útero', 'pois a disfunção hepática só regride após o parto');
troca(E, 'conduta', 'se cesárea, incisão vertical, preparo para hemorragia e drenos', 'se cesárea, preparo para hemorragia, incisão vertical se houver coagulopatia e drenos');

// 4. Covid-19 e influenza na gestação
const C = 'Covid-19 e influenza';
troca(C, 'prescricao', 'ceftriaxona 2 g IV 1 vez ao dia + azitromicina 500 mg IV ou VO 1 vez ao dia por 5 dias.',
  'ceftriaxona 2 g IV 1 vez ao dia (duração: PENDENTE DE VERIFICAÇÃO) + azitromicina 500 mg IV ou VO 1 vez ao dia por 5 dias.');
troca(C, 'tratamento', 'idealmente até 48 h (há benefício até 72 h ou mais nas graves)',
  'iniciar o quanto antes, sem esperar exame; na gestante o maior benefício é até 72 h, mas ainda há benefício quando iniciado entre o 3º e o 4º dia (Guia de Influenza 2023)');
troca(C, 'exames', 'teste rápido ou RT-PCR para influenza quando disponível',
  'pesquisa de influenza (RT-PCR ou teste rápido) em caso de dúvida diagnóstica, sintomas prolongados ou fora da sazonalidade; não atrasar o oseltamivir por causa do exame');
troca(C, 'conduta', 'Notificar SRAG.',
  'Notificar SRAG. Quimioprofilaxia de gestante exposta: não recomendada de rotina pelo Guia de Influenza 2023 (o manual de 2022 a indicava para não vacinadas expostas há até 48 h).');
troca(C, 'observacoes', 'Por isso não incluí a quimioprofilaxia na prescrição; o revisor decide.',
  'Após a revisão, prevalece o Guia de 2023: a conduta diz que a quimioprofilaxia não é de rotina. O manual de 2022 limitava o oseltamivir a < 48 h; também prevalece o Guia de 2023 (maior benefício até 72 h, ainda útil no 3º-4º dia).');

// 5. Resfriado comum
const R = 'Resfriado comum';
troca(R, 'introducao', 'Adultos têm 2 a 5 episódios por ano e crianças 6 a 8.', 'Adultos têm 2 a 5 infecções de vias aéreas superiores por ano e crianças 6 a 8.');
troca(R, 'tratamento', 'Antibiótico não deve ser usado.', 'Antibiótico não deve ser usado de rotina.');
troca(R, 'conduta', 'Cuidado com queimaduras na inalação de vapor em crianças pequenas.',
  'Cuidado com queimaduras na inalação de vapor em crianças pequenas. A SBPT (2006) admite anti-histamínico de 1ª geração com descongestionante; o MS (2013) não recomenda anti-histamínico em não atópicos.');
troca(R, 'prescricao', '1) Soro fisiológico 0,9% nasal, várias vezes ao dia, para desobstrução.', '1) Soro fisiológico 0,9% nasal para desobstrução (frequência não definida na fonte).');
troca(R, 'prescricao', '\n4) Adulto com sintomas intensos (opção da SBPT, não endossada pelo MS para não atópicos): dexclorfeniramina 2 mg VO até 4 vezes ao dia; evitar em quem dirige ou opera máquinas.\n5) NÃO prescrever', '\n4) NÃO prescrever');
troca(R, 'observacoes', 'Mantive o MS como base e a dexclorfeniramina como opção marcada; o naproxeno foi deixado de fora. O revisor decide.',
  'Após a revisão de fontes, prevalece o MS: a dexclorfeniramina saiu da prescrição (fica só a nota da divergência na conduta) e o naproxeno continua de fora.');
lote.doencas.find(d => d.registro.nome.startsWith(R)).fontes[1].usadoPara =
  'etiologia viral, ausculta normal, imagem desnecessária na 1ª semana, antibiótico não indicado de rotina, posição sobre anti-histamínico com descongestionante (citada na conduta)';
log.push(`${R} | fontes[1].usadoPara`);

// 6. Bronquite aguda
const B = 'Bronquite aguda';
troca(B, 'introducao', 'Pode causar obstrução e hiper-responsividade brônquica transitórias (até 40%), com duração de até 6 semanas.',
  'Até 40% têm broncoespasmo e hiper-responsividade passageiros, que somem em menos de 6 semanas.');
troca(B, 'criterios', 'Sinais que afastam o quadro simples e pedem avaliação de pneumonia ou outra causa grave: confusão mental, FR ≥ 30 irpm, PAS < 90 ou PAD ≤ 60 mmHg, SpO2 ≤ 94%, idade ≥ 65 anos com alteração de ausculta, FC > 125, temperatura < 35 ou > 40 °C, queda do estado geral.',
  'Sinais de gravidade (Anvisa/CAMO-Net): confusão mental, FR ≥ 30 irpm, PAS < 90 ou PAD ≤ 60 mmHg ou SpO2 ≤ 94% → encaminhar ao hospital. Idade ≥ 65 anos, alteração de ausculta, comorbidade (diabetes, insuficiência cardíaca, imunossupressão, neoplasia, insuficiência renal, cirrose), queda do estado geral, FR > 25, FC > 125 ou temperatura < 35 ou > 40 °C → radiografia de tórax e conduzir como possível pneumonia.');
troca(B, 'exames', ' Hemograma e PCR se houver dúvida com pneumonia ou sinusite bacteriana.', '');
troca(B, 'tratamento', 'Broncodilatador só se houver sinais de obstrução ao fluxo aéreo ou doença de vias aéreas de base (asma).',
  'Broncodilatador só se houver sinais de obstrução ao fluxo aéreo (SBPT) ou doença de vias aéreas de base, como asma (NICE).');
troca(B, 'prescricao', 'Na gestação, evitar doxiciclina; amoxicilina é preferida.', 'Na gestação, não usar doxiciclina; amoxicilina é a preferida (se precisar de macrolídeo, eritromicina).');

// 7. Urgências odontológicas
const O = 'Urgências odontológicas';
troca(O, 'criterios', 'vitalidade pulpar preservada', 'vitalidade pulpar em geral preservada (exceto na lesão endopério)');
troca(O, 'exames', '; radiografia periapical quando disponível', '');
troca(O, 'exames', 'Infecção disseminada: avaliação de via aérea e sinais de sepse; exames de imagem e laboratório em serviço de urgência.',
  'Infecção disseminada: avaliar via aérea e sinais de sepse e acionar o serviço de urgência (SAMU).');
troca(O, 'tratamento', 'clorexidina 0,12% em doença periodontal', 'clorexidina 0,12% na doença periodontal necrosante e na pericoronarite');
troca(O, 'conduta', 'Orientar retorno se a dor persistir ou o edema aumentar.',
  'Orientar retorno se a dor persistir ou o edema aumentar. O CAB 28 (2013) associa antimicrobiano à pulpotomia na pulpite irreversível; a indicação de antibiótico sem sinais de infecção disseminada está PENDENTE DE VERIFICAÇÃO em fonte mais recente.');
troca(O, 'prescricao', 'estolato de eritromicina 1 a 2 g/dia divididos a cada 6 a 12 h', 'estolato de eritromicina 1 a 2 g/dia, em tomadas a cada 6 ou 12 h (Quadro 61; conferir em bula Anvisa)');
troca(O, 'prescricao', 'Clorexidina 0,12% em bochechos na doença periodontal e pericoronarite', 'Clorexidina 0,12% em bochechos na doença periodontal necrosante e na pericoronarite');
troca(O, 'observacoes', '1) O CAB 28 prevê antimicrobiano junto à pulpotomia na pulpite irreversível; a literatura atual tende a não indicar antibiótico na pulpite sem sinais de infecção disseminada. Não incluí essa indicação na prescrição e peço conferência do revisor.',
  '1) Após a revisão de fontes, a conduta mostra a posição do CAB 28 (antimicrobiano junto à pulpotomia na pulpite irreversível) e marca como PENDENTE a indicação sem sinais de infecção disseminada. A Figura 45 (gatilhos para acionar o SAMU) é imagem e deve ser conferida pelo autor.');
troca(O, 'observacoes', '5) Abscesso periodontal não tem subcódigo próprio na CID-10 DATASUS; K05.2 (periodontite aguda) é o mais próximo.',
  '5) K05.2 (periodontite aguda) inclui o abscesso periodontal na CID-10 da OMS (confirmado pelo revisor).');

// 8. Pronação dolorosa: retirada do lote (decisão do autor)
const nAntes = lote.doencas.length;
lote.doencas = lote.doencas.filter(d => !d.registro.nome.startsWith('Pronação dolorosa'));
if (lote.doencas.length !== nAntes - 1) throw new Error('Pronação dolorosa não removida');
log.push('Pronação dolorosa | registro retirado do lote');

// 9. Lesões benignas da pele do RN
const P = 'Lesões benignas da pele';
troca(P, 'introducao', 'favorecida por calor, excesso de roupa e produtos oclusivos', 'favorecida por prematuridade, calor, excesso de roupa e produtos oclusivos');
troca(P, 'criterios', '; RN em bom estado geral.', '.');
troca(P, 'conduta', 'Reavaliar se o RN tiver febre, recusa alimentar, letargia ou lesões que progridem com crostas melicéricas.',
  'Se o RN não estiver bem, pensar em infecção. Reavaliar se houver sinais sistêmicos de infecção ou lesões que se espalham e formam crostas amarelo-acastanhadas (impetigo).');

// 10. Criança exposta à hepatite C
const H = 'Criança exposta à hepatite C';
troca(H, 'introducao', 'Não há vacina, imunoglobulina nem intervenção na gestação ou no RN que reduza a transmissão.',
  'Não há vacina nem imunoglobulina, e não há via de parto preferencial; para reduzir o risco, evitar procedimentos invasivos, parto laborioso e ruptura de membranas por mais de 6 h (PCDT 2020).');
troca(H, 'conduta', 'Identificar a exposição no pré-natal e registrar na caderneta.', 'Identificar a exposição no pré-natal.');
troca(H, 'conduta', 'Encaminhar a mãe para tratamento da hepatite C após a gestação e o aleitamento (antivirais contraindicados na gestação).',
  'Encaminhar a mãe ao especialista após o parto para tratamento da hepatite C (antivirais contraindicados na gestação).');

fs.writeFileSync(arq, JSON.stringify(lote, null, 2) + '\n', 'utf8');
console.log(log.length + ' alterações:\n' + log.join('\n'));
