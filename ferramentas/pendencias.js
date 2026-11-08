// Lista todos os registros de dados/*.json que contêm "PENDENTE DE VERIFICAÇÃO" e grava PENDENCIAS.md.
// Só lê: não preenche nem altera nada (regra do projeto: nada é preenchido sem fonte).
// Uso: node ferramentas/pendencias.js [--checar]   (--checar: falha se PENDENCIAS.md estiver desatualizado)
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib_dados');

const ALVO = /PENDENTE\s+DE\s+VERIFICA[ÇC][ÃA]O/i;
const SAIDA = path.join(L.RAIZ, 'PENDENCIAS.md');

const SECAO = { SEED_MEDS: 'Medicamentos', DISEASES: 'Doenças', PED_DB: 'Calculadora pediátrica', PLANTAO: 'Plantão', MEDX: 'Detalhes de medicamentos (MEDX)',
  SCORES: 'Escores', CALCS: 'Calculadoras', ATB: 'Antibióticos', VAC: 'Vacinas', FLUX: 'Fluxogramas', ECG: 'ECG', LAB: 'Laboratório', ESPECIALIDADES: 'Especialidades', CLASS_GROUPS: 'Grupos terapêuticos', CID_FULL: 'CID-10' };
const CAMPO = { posologia: 'Posologia', pediatria: 'Pediatria', apresentacoes: 'Apresentações', indicacoes: 'Indicações', contraindicacoes: 'Contraindicações',
  interacoes: 'Interações', observacoes: 'Observações', gestacao: 'Gestação', lactacao: 'Lactação', prescricao: 'Prescrição', conduta: 'Conduta', tratamento: 'Tratamento',
  referencias: 'Nomes comerciais', generico: 'Genérico', classe: 'Classe', via: 'Via', tarja: 'Tarja', introducao: 'Introdução', criterios: 'Critérios', exames: 'Exames', ob: 'Observação (calculadora)', rev: 'Revisão', fonte: 'Fonte' };

function nomeDe(reg, i) { return (reg && (reg.nome || reg.n || reg.name || reg.id || reg.k)) || ('#' + (i + 1)); }
function trecho(txt) {
  const s = String(txt).replace(/\s+/g, ' ');
  const m = s.match(ALVO); const k = m ? m.index : 0;
  let ini = Math.max(0, k - 140), fim = Math.min(s.length, k + (m ? m[0].length : 0) + 100);
  return (ini > 0 ? '…' : '') + s.slice(ini, fim).trim() + (fim < s.length ? '…' : '');
}
/* Percorre o valor e devolve [{caminho, texto}] das strings que contêm o alvo. */
function achar(v, caminho, out) {
  if (typeof v === 'string') { if (ALVO.test(v)) out.push({ caminho, texto: v }); }
  else if (Array.isArray(v)) v.forEach((x, i) => achar(x, caminho.concat(i), out));
  else if (v && typeof v === 'object') Object.keys(v).forEach((k) => achar(v[k], caminho.concat(k), out));
  return out;
}
function rotuloCampo(c) {
  const nomes = c.filter((x) => typeof x === 'string');
  const ult = nomes[nomes.length - 1] || '';
  return CAMPO[ult] || ult || '(texto)';
}

function coletar() {
  const itens = [];
  for (const cfg of L.VARS) {
    const dados = L.lerDados(cfg);
    const regs = Array.isArray(dados) ? dados.map((r, i) => [nomeDe(r, i), r]) : Object.keys(dados).map((k) => [k, dados[k]]);
    for (const [nome, reg] of regs) {
      for (const a of achar(reg, [], [])) {
        let campo = rotuloCampo(a.caminho);
        if (cfg.v === 'PED_DB' && a.caminho[0] === 'v') { const via = reg.v[a.caminho[1]] && reg.v[a.caminho[1]].via; campo += via ? ' — via ' + via : ''; }
        itens.push({ secao: SECAO[cfg.v] || cfg.v, arquivo: 'dados/' + cfg.arq, nome: String(nome), campo, trecho: trecho(a.texto) });
      }
    }
  }
  return itens;
}

function markdown(itens) {
  const regs = new Set(itens.map((i) => i.arquivo + '|' + i.nome));
  const porSecao = {};
  itens.forEach((i) => { (porSecao[i.secao] = porSecao[i.secao] || []).push(i); });
  const esc = (s) => String(s).replace(/\|/g, '\\|');
  let md = '# Pendências de verificação\n\n' +
    'Gerado por `node ferramentas/pendencias.js` a partir de `dados/*.json`. **Não edite à mão**: corrija o dado com fonte e rode a ferramenta de novo.\n\n' +
    'Cada linha é um trecho marcado "PENDENTE DE VERIFICAÇÃO". Regra do projeto: **nada é preenchido sem fonte citada** ' +
    '(preferir SBP, Ministério da Saúde/PCDT, bula Anvisa; citar fonte e ano).\n\n' +
    `**Total: ${regs.size} registro(s), ${itens.length} trecho(s).**\n\n`;
  md += '| Seção | Registros | Trechos |\n|---|---:|---:|\n';
  for (const [s, arr] of Object.entries(porSecao)) md += `| ${s} | ${new Set(arr.map((i) => i.nome)).size} | ${arr.length} |\n`;
  for (const [s, arr] of Object.entries(porSecao)) {
    md += `\n## ${s} (\`${arr[0].arquivo}\`)\n\n| Registro | Campo | Trecho |\n|---|---|---|\n`;
    arr.sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
    for (const i of arr) md += `| ${esc(i.nome)} | ${esc(i.campo)} | ${esc(i.trecho)} |\n`;
  }
  return md;
}

if (require.main === module) {
  const itens = coletar();
  const md = markdown(itens);
  if (process.argv.includes('--checar')) {
    const atual = fs.existsSync(SAIDA) ? fs.readFileSync(SAIDA, 'utf8') : '';
    if (atual !== md) { console.error('PENDENCIAS.md desatualizado: rode node ferramentas/pendencias.js'); process.exit(1); }
    console.log('OK PENDENCIAS.md em dia (' + itens.length + ' trechos)');
  } else {
    fs.writeFileSync(SAIDA, md, 'utf8');
    console.log('OK PENDENCIAS.md:', new Set(itens.map((i) => i.arquivo + '|' + i.nome)).size, 'registros,', itens.length, 'trechos');
  }
}
module.exports = { coletar, ALVO };
