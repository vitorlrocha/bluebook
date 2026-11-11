// Lista de trabalho da REVISÃO CLÍNICA, por prioridade, a partir de PENDENCIAS e INCONSISTENCIAS.
// Só organiza o que precisa de conferência humana com fonte: não propõe valores e não altera dados.
// Uso: node ferramentas/revisao.js [--checar]
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib_dados');
const { coletar } = require('./pendencias');
const { analisar } = require('./inconsistencias');

const SAIDA = path.join(L.RAIZ, 'REVISAO_CLINICA.md');
const FONTE = {
  ped: 'SBP (documento científico/guia prático do tema) ou bula Anvisa; conferir também o texto "ob" e "rev" da própria entrada',
  ficha: 'bula no Bulário Eletrônico da Anvisa (seção Posologia, uso pediátrico) e SBP quando houver',
  plantao: 'diretriz citada no protocolo (campo "fonte" do protocolo) e bula Anvisa do fármaco',
  presc: 'diretriz citada na linha "Base:" da própria doença; SBP/Ministério da Saúde (PCDT) para a dose pediátrica',
  pend: 'bula Anvisa (Bulário Eletrônico) e lista CMED vigente; PCDT/Conitec se for medicamento de alto custo',
};
const esc = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function montar() {
  const R = analisar(), P = coletar();
  const itens = [];   // { p: 1|2|3, grupo, onde, oque, conferir, arquivo }
  const add = (p, grupo, onde, oque, conferir, arquivo) => itens.push({ p, grupo, onde, oque, conferir, arquivo });

  // Prioridade 1 — pode levar a dose errada na tela
  R.fichaXped.filter((x) => x[4] === 'alta').forEach((x) => add(1, 'Ficha × calculadora pediátrica (sem sobreposição)', x[0], `Ficha (Pediatria): ${x[2]} · Calculadora: ${x[3]}`, FONTE.ficha, 'dados/seed_meds.json (campo pediatria) e dados/ped_db.json'));
  R.plantaoXped.forEach((x) => add(1, 'Plantão × calculadora pediátrica', `${x[0]} — ${x[1]}`, `Plantão: ${x[2]} · Calculadora: ${x[3]} (${x[4]})`, FONTE.plantao, 'dados/plantao.json e dados/ped_db.json'));
  R.pedInterno.forEach((x) => add(1, 'Calculadora pediátrica: texto × número usado no cálculo', `${x[0]} (${x[1]})`, `${x[2]} — ${x[3]} · ${x[4]}`, FONTE.ped, 'dados/ped_db.json'));
  // Prioridade 2 — divergência de faixa ou dose a confirmar
  R.fichaXped.filter((x) => x[4] !== 'alta').forEach((x) => add(2, 'Ficha × calculadora pediátrica (faixas diferentes)', x[0], `${x[1]} — Ficha: ${x[2]} · Calculadora: ${x[3]}`, FONTE.ficha, 'dados/seed_meds.json (campo pediatria) e dados/ped_db.json'));
  R.prescXped.forEach((x) => add(2, 'Prescrição de doença pediátrica × calculadora', `${x[0]} — ${x[1]}`, `Prescrição: "${x[2]}" · Calculadora: ${x[3]}`, FONTE.presc, 'dados/diseases.json (campo prescricao) e dados/ped_db.json'));
  P.filter((i) => /Posologia|Pediatria|Prescrição|Conduta|Tratamento/.test(i.campo)).forEach((i) => add(2, 'PENDENTE DE VERIFICAÇÃO em dose/conduta', `${i.nome} — ${i.campo}`, i.trecho, FONTE.pend, i.arquivo));
  // Prioridade 3 — completar informação, sem risco de dose
  P.filter((i) => !/Posologia|Pediatria|Prescrição|Conduta|Tratamento/.test(i.campo)).forEach((i) => add(3, 'PENDENTE DE VERIFICAÇÃO em apresentação/nome comercial/outros', `${i.nome} — ${i.campo}`, i.trecho, FONTE.pend, i.arquivo));
  R.semBase.forEach((x) => add(3, 'Prescrição sem a linha "Base:" (referência)', `${x[0]} (${x[1]})`, 'Acrescentar a linha "Base: ..." com a diretriz usada', 'a diretriz que embasou a prescrição (sociedade/ano)', 'dados/diseases.json (campo prescricao)'));
  R.pedSemFicha.forEach((x) => add(3, 'Calculadora pediátrica sem ficha de medicamento', x[0], 'Existe na calculadora, mas não há ficha com esse nome', 'decidir: criar a ficha (com fonte) ou manter só como protocolo de referência', 'dados/ped_db.json e dados/seed_meds.json'));
  return { itens, assoc: R.assoc.length };
}

function markdown() {
  const { itens, assoc } = montar();
  const TIT = { 1: 'Prioridade 1 — pode mostrar dose errada (revisar primeiro)', 2: 'Prioridade 2 — faixas divergentes e doses a confirmar', 3: 'Prioridade 3 — completar informação (sem risco de dose)' };
  let md = '# Revisão clínica — lista de trabalho\n\n' +
    'Gerado por `node ferramentas/revisao.js` a partir de `PENDENCIAS.md` e `INCONSISTENCIAS.md`. **Não edite à mão**: ' +
    'corrija o dado em `dados/*.json` **com fonte e ano** e rode `npm run relatorios` — o item some da lista sozinho.\n\n' +
    '**Regra:** nada aqui foi decidido nem alterado. A ferramenta só aponta onde olhar; quem decide o valor certo é a ' +
    'revisão humana com a fonte em mãos. Diferença entre textos pode ser legítima (indicação, via, idade): nesse caso, ' +
    'deixe as duas doses e escreva a indicação de cada uma.\n\n' +
    '| Prioridade | Itens |\n|---|---:|\n' + [1, 2, 3].map((p) => `| ${TIT[p]} | ${itens.filter((i) => i.p === p).length} |`).join('\n') +
    `\n| **Total** | **${itens.length}** |\n\n` +
    `Informativo: ${assoc} fichas de associação ficaram sem calculadora pediátrica por decisão de projeto (ver INCONSISTENCIAS.md §3).\n`;
  for (const p of [1, 2, 3]) {
    md += `\n## ${TIT[p]}\n`;
    const grupos = [...new Set(itens.filter((i) => i.p === p).map((i) => i.grupo))];
    for (const g of grupos) {
      const arr = itens.filter((i) => i.p === p && i.grupo === g);
      md += `\n### ${g} (${arr.length})\n\nConferir em: ${arr[0].conferir}.\nArquivo: \`${arr[0].arquivo}\`\n\n| Feito | Onde | O que conferir |\n|:---:|---|---|\n`;
      for (const i of arr) md += `| ☐ | ${esc(i.onde)} | ${esc(i.oque)} |\n`;
    }
  }
  return md;
}

if (require.main === module) {
  const md = markdown();
  if (process.argv.includes('--checar')) {
    const atual = fs.existsSync(SAIDA) ? fs.readFileSync(SAIDA, 'utf8') : '';
    if (atual !== md) { console.error('REVISAO_CLINICA.md desatualizado: rode node ferramentas/revisao.js'); process.exit(1); }
    console.log('OK REVISAO_CLINICA.md em dia');
  } else {
    fs.writeFileSync(SAIDA, md, 'utf8');
    const { itens } = montar();
    console.log('OK REVISAO_CLINICA.md:', [1, 2, 3].map((p) => 'P' + p + '=' + itens.filter((i) => i.p === p).length).join(' '), 'total=' + itens.length);
  }
}
module.exports = { montar };
