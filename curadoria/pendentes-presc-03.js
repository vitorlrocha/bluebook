// Prioridade 2 — PENDENTES de dose nas prescrições de doenças, lote 03 (27/11/2026): diretriz brasileira.
// Fonte: Ministério da Saúde, Cadernos de Atenção Básica nº 28, v. II, Acolhimento à demanda espontânea (2013),
// Quadro 61 "Fármacos utilizados para o tratamento de enfermidades odontológicas" (p. 206), lido no PDF original.
// Só entram analgésico e anti-inflamatório quando a ficha já indica a classe. A escolha de antibiótico, de miorrelaxante e
// de gel anestésico para um quadro que a fonte não especifica continua PENDENTE. A linha pediátrica do ibuprofeno e da
// codeína no quadro é ambígua na extração e não foi usada.
// Uso: node curadoria/pendentes-presc-03.js  (idempotente)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'DISEASES');
const D = L.lerDados(cfg);

const Q61 = 'Cadernos de Atenção Básica nº 28, v. II, Quadro 61';
const ANALG = `paracetamol, adulto 3 a 4 g/dia em 3 ou 4 tomadas (máx. 4 g/dia), criança < 12 anos 10 a 15 mg/kg/dose a cada 4 a 6 h; ou paracetamol + codeína, adulto 1 a 2 comprimidos a cada 4 a 6 h (máx. 8 comprimidos/dia) (${Q61}; conferir em bula Anvisa)`;
const IBU = `ibuprofeno, adulto 200 a 400 mg VO a cada 4 a 6 h (máx. 3.200 mg/dia) (${Q61}; conferir em bula Anvisa)`;

const TROCAS = [
  ['Hemorragia bucal pós-exodontia', 'prescricao',
    '2) Analgésico conforme necessidade (dose: PENDENTE DE VERIFICAÇÃO neste capítulo; ver Quadro 61 e bula Anvisa).',
    `2) Analgésico conforme necessidade: ${ANALG}.`],
  ['Alveolite pós-exodontia', 'prescricao',
    '1) Alveolite supurada: antibiótico e analgésico (evitar AINEs e salicilatos). Fármaco, dose e duração: PENDENTE DE VERIFICAÇÃO (a fonte não os especifica para este quadro; ver Quadro 61 e bula Anvisa).',
    `1) Alveolite supurada: antibiótico e analgésico (evitar AINEs e salicilatos). Analgésico: ${ANALG}. Antibiótico (fármaco, dose e duração): PENDENTE DE VERIFICAÇÃO (a fonte não o especifica para este quadro; o Quadro 61 lista amoxicilina e estolato de eritromicina para enfermidades odontológicas em geral).`],
  ['Luxação da articulação temporomandibular', 'prescricao',
    '1) Analgésico e miorrelaxante (fármaco, dose e duração: PENDENTE DE VERIFICAÇÃO, não especificados na fonte).',
    `1) Analgésico: ${ANALG}. Miorrelaxante (fármaco, dose e duração): PENDENTE DE VERIFICAÇÃO, não especificado na fonte.`],
  ['Luxação da articulação temporomandibular', 'prescricao',
    '2) Anti-inflamatório no deslocamento de disco e na disfunção muscular (dose: PENDENTE DE VERIFICAÇÃO).',
    `2) Anti-inflamatório no deslocamento de disco e na disfunção muscular: ${IBU}.`],
  ['Lesões traumáticas da mucosa oral', 'prescricao',
    '2) Analgésico se dor intensa (dose: PENDENTE DE VERIFICAÇÃO).',
    `2) Analgésico se dor intensa: ${ANALG}.`],
  ['Cárie dentária', 'prescricao',
    '4) Dor odontogênica: analgésico simples, dose PENDENTE DE VERIFICAÇÃO; antibiótico não é tratamento da cárie.',
    `4) Dor odontogênica: analgésico simples — paracetamol, adulto 3 a 4 g/dia em 3 ou 4 tomadas (máx. 4 g/dia), criança < 12 anos 10 a 15 mg/kg/dose a cada 4 a 6 h (${Q61}, 2013; conferir em bula Anvisa); antibiótico não é tratamento da cárie.`],
  // PCDT da Doença de Chagas (Portaria Conjunta SAES/SCTIE/MS nº 57/2018), item de populações especiais e Tabela 6.
  ['Doença de Chagas na gestação', 'prescricao',
    '(decisão especializada; doses de benznidazol/nifurtimox: PENDENTE DE VERIFICAÇÃO, não constam no capítulo)',
    '(decisão especializada; o PCDT da Doença de Chagas, Portaria Conjunta SAES/SCTIE/MS nº 57/2018, indica o benznidazol, de preferência a partir do 2º trimestre — na forma aguda grave, em qualquer idade gestacional —, na dose do adulto: 5 mg/kg/dia em 1 a 3 tomadas por 60 dias, ou 300 mg/dia pelo número de dias igual ao peso em kg, máx. 80 dias; forma aguda não grave no 1º trimestre: aguardar o 2º trimestre, com decisão compartilhada; forma crônica: não tratar na gestação)'],
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
