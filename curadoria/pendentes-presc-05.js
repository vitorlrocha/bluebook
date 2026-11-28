// Prioridade 2 — PENDENTES nas prescrições de doenças, lote 05 (27/11/2026), segunda varredura (decisão do autor: "1 + 2").
// Fontes brasileiras lidas no PDF original:
//  - PCDT da Miastenia Gravis (Portaria Conjunta SAES/SCTIE/MS nº 11/2022), item de tratamento (prednisona).
//  - PCDT para Atenção Integral às Pessoas com IST (MS, 2022), item 11.5.2 (ácido tricloroacético).
//  - Manual de Normas e Procedimentos para Vacinação (MS, 2024): BCG e hepatite B.
// Remissões às fichas/registros do app quando a fonte não traz dose (sem copiar dose).
// Uso: node curadoria/pendentes-presc-05.js  (idempotente)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const cfg = L.VARS.find((c) => c.v === 'DISEASES');
const D = L.lerDados(cfg);
const M = L.lerDados(L.VARS.find((c) => c.v === 'SEED_MEDS'));

const TROCAS = [
  ['Sepse na gestação', 'prescricao',
    'na sepse materna: PENDENTE DE VERIFICAÇÃO (a fonte obstétrica lida não traz posologia).',
    'na sepse materna: a fonte obstétrica lida não traz posologia; doses do adulto nas fichas Ampicilina, Gentamicina, Clindamicina, Metronidazol, Amoxicilina + Clavulanato de potássio, Cefazolina, Oxacilina e Ceftriaxona deste app (conferir a segurança na gestação em cada ficha).'],
  ['Sepse na gestação', 'prescricao',
    'Dose: PENDENTE DE VERIFICAÇÃO.\n6) Controle do foco',
    'Dose: ver a ficha Noradrenalina deste app (a fonte obstétrica não traz).\n6) Controle do foco'],
  ['Kwashiorkor', 'prescricao',
    'doses PENDENTE DE VERIFICAÇÃO neste registro; ver as doses do registro',
    'doses no registro'],
  ['Marasmo', 'prescricao',
    'doses PENDENTE DE VERIFICAÇÃO neste registro; ver as doses do registro',
    'doses no registro'],
  ['Distúrbios do magnésio no recém', 'prescricao',
    'furosemida (dose não consta na fonte: PENDENTE DE VERIFICAÇÃO).',
    'furosemida (a fonte não traz a dose; ver a ficha Furosemida injetável e a calculadora pediátrica deste app).'],
  ['Investigação e vigilância de contatos de hanseníase', 'prescricao',
    '(dose e via conforme calendário do PNI: PENDENTE DE VERIFICAÇÃO, fonte não detalha)',
    '(0,1 mL por via intradérmica a partir de 1 ano de idade, nas duas apresentações em uso — Manual de Normas e Procedimentos para Vacinação, MS, 2024)'],
  ['Miastenia gravis na gestação', 'prescricao',
    '2) Corticoide como imunossupressor de escolha (dose: PENDENTE DE VERIFICAÇÃO)',
    '2) Corticoide como imunossupressor de escolha — prednisona iniciada em dose baixa, 15 a 20 mg/dia, com aumento gradual até no máximo 1 mg/kg/dia; alternativa em dias alternados, começando com 10 mg e subindo 10 mg a cada 3 dias até 0,75 mg/kg (forma ocular) ou até 100 mg ou 1,5 mg/kg em dias alternados (forma generalizada); após a melhora máxima, reduzir aos poucos (PCDT da Miastenia Gravis, Portaria Conjunta SAES/SCTIE/MS nº 11/2022; o PCDT considera a prednisona compatível com a amamentação)'],
  ['Lesões intraepiteliais cervicais e citologia alterada na gestação', 'prescricao',
    '(concentração, aplicação e frequência: PENDENTE DE VERIFICAÇÃO, não constam no capítulo)',
    '(80% a 90% em solução, aplicada pelo profissional com aplicador de algodão só sobre a lesão, evitando a mucosa sã, até o branqueamento; começar com aplicações semanais, número de sessões conforme a resposta; nunca para uso domiciliar; pode ser usado na gestação — PCDT para Atenção Integral às Pessoas com IST, MS, 2022, item 11.5.2)'],
  ['Hepatite C na gestação', 'prescricao',
    'Vacinar contra hepatites A e B se suscetível (esquema: consultar calendário vigente; PENDENTE DE VERIFICAÇÃO no capítulo).',
    'Vacinar contra hepatites A e B se suscetível: hepatite B em 3 doses (0, 1 e 6 meses), conforme o Manual de Normas e Procedimentos para Vacinação (MS, 2024); hepatite A: esquema e disponibilidade para a gestante PENDENTE DE VERIFICAÇÃO.'],
];

for (const nome of ['Ampicilina', 'Gentamicina', 'Clindamicina', 'Metronidazol', 'Amoxicilina + Clavulanato de potássio', 'Cefazolina', 'Oxacilina',
  'Ceftriaxona', 'Noradrenalina', 'Furosemida injetável']) {
  if (!M.some((m) => m.nome === nome)) throw new Error('ficha não encontrada: ' + nome);
}
if (!D.some((d) => d.nome === 'Desnutrição grave (SAM)')) throw new Error('registro Desnutrição grave (SAM) não encontrado');

let n = 0;
for (const [nome, campo, antigo, novo] of TROCAS) {
  const idx = D.findIndex((x, i) => i >= 3226 && x.nome.startsWith(nome));
  if (idx < 0) throw new Error('doença de lote não encontrada: ' + nome);
  const d = D[idx];
  if (String(d[campo]).includes(novo)) continue;
  if (!String(d[campo]).includes(antigo)) throw new Error('trecho não encontrado em ' + nome + ': ' + antigo.slice(0, 60));
  d[campo] = d[campo].replace(antigo, novo); n++;
}
fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, D), 'utf8');
console.log('OK', n, 'trecho(s) PENDENTE resolvidos');
