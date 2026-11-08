// Funções compartilhadas por extrair.js, build.js e testar_build.js (Node puro, sem dependências).
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

/* Variáveis de dados do app.
   arq: arquivo em dados/. emit: como o literal é escrito no HTML final.
     - "linhas": um item de 1º nível por linha (necessário para validar_cid.py, que lê DISEASES linha a linha)
     - "uma": tudo numa linha
   sep/kv: separadores de itens e de chave:valor (reproduzem a formatação original).
   arquivo: formatação do .json em dados/ ("registro" = 1 item por linha; "bonito" = indentado; "cid" = 1 código por linha). */
const VARS = [
  { v: 'SEED_MEDS',      arq: 'seed_meds.json',      emit: 'linhas', ind: '    ', fim: '  ', sep: ',',  kv: ':',  arquivo: 'registro' },
  { v: 'DISEASES',       arq: 'diseases.json',       emit: 'linhas', ind: '    ', fim: '  ', sep: ',',  kv: ':',  arquivo: 'registro' },
  { v: 'CLASS_GROUPS',   arq: 'class_groups.json',   emit: 'linhas', ind: '   ',  fim: '  ', sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'MEDX',           arq: 'medx.json',           emit: 'uma',                           sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'ESPECIALIDADES', arq: 'especialidades.json', emit: 'uma',                           sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'ATB',            arq: 'atb.json',            emit: 'linhas', ind: '    ', fim: '  ', sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'VAC',            arq: 'vac.json',            emit: 'linhas', ind: '    ', fim: '  ', sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'FLUX',           arq: 'flux.json',           emit: 'linhas', ind: '    ', fim: '  ', sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'ECG',            arq: 'ecg.json',            emit: 'linhas', ind: '    ', fim: '  ', sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'PLANTAO',        arq: 'plantao.json',        emit: 'linhas', ind: '    ', fim: '  ', sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'CID_FULL',       arq: 'cid_full.json',       emit: 'uma',                           sep: ',',  kv: ':',  arquivo: 'cid' },
  // CALC_ITEMS é derivado de CALCS em tempo de execução (CALCS.map), por isso o que se extrai é CALCS.
  { v: 'CALCS',          arq: 'calcs.json',          emit: 'linhas', ind: '    ', fim: '  ', sep: ', ', kv: ': ', arquivo: 'bonito', refs: ['SEXO'] },
  { v: 'LAB',            arq: 'lab.json',            emit: 'linhas', ind: '    ', fim: '  ', sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'SCORES',         arq: 'scores.json',         emit: 'linhas', ind: '    ', fim: '  ', sep: ', ', kv: ': ', arquivo: 'bonito' },
  { v: 'PED_DB',         arq: 'ped_db.json',         emit: 'linhas', ind: '    ', fim: '  ', sep: ',',  kv: ':',  arquivo: 'bonito' },
];

/* Localiza o fim de um literal de array/objeto JS começando em s[i] ('[' ou '{').
   Trata strings, comentários e expressões regulares. */
function fimLiteral(s, i) {
  let prof = 0, ant = '';
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++;
      while (s[i] !== q) { if (s[i] === '\\') i++; i++; if (i >= s.length) throw new Error('string não fechada'); }
      ant = 'x'; continue;
    }
    if (c === '/' && s[i + 1] === '/') { while (s[i] !== '\n') i++; continue; }
    if (c === '/' && s[i + 1] === '*') { i = s.indexOf('*/', i) + 1; continue; }
    if (c === '/' && /^[,\[(:=!&|?{};]?$/.test(ant)) {
      i++; let cls = false;
      for (;;) {
        if (s[i] === '\\') { i += 2; continue; }
        if (s[i] === '[') cls = true; else if (s[i] === ']') cls = false; else if (s[i] === '/' && !cls) break;
        i++;
      }
      i++; while (/[a-z]/.test(s[i])) i++; i--; ant = 'x'; continue;
    }
    if (c === '[' || c === '{' || c === '(') prof++;
    else if (c === ']' || c === '}' || c === ')') { prof--; if (prof === 0) return i + 1; }
    if (!/\s/.test(c)) ant = c;
  }
  throw new Error('fim do literal não encontrado');
}

/* Encontra "var NOME = <literal>" no texto; devolve {ini, fim} do literal. */
function acharVar(s, nome) {
  const m = new RegExp('\\n\\s*var ' + nome + ' = ').exec(s);
  if (!m) throw new Error('variável não encontrada: ' + nome);
  const ini = m.index + m[0].length;
  if (s[ini] !== '[' && s[ini] !== '{') throw new Error(nome + ' não é um literal');
  return { ini, fim: fimLiteral(s, ini) };
}

/* Avalia o texto de um literal. Identificadores externos (ex.: SEXO) viram marcadores {$ref}. */
function avaliar(texto, refs) {
  refs = refs || [];
  const marc = refs.map(r => ({ $ref: r }));
  return new Function(...refs, 'return ' + texto)(...marc);
}

/* Valor JS (com funções e regex) -> valor JSON puro. */
function paraJson(v) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'number') { if (!isFinite(v)) throw new Error('número não finito'); return v; }
  if (typeof v === 'function') {
    const src = v.toString();
    if (!/^function\b/.test(src)) throw new Error('função em formato não suportado: ' + src.slice(0, 40));
    return { $fn: src.split('\n') };
  }
  if (v instanceof RegExp) return { $re: v.source, flags: v.flags };
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) if (!(i in v) || v[i] === undefined) throw new Error('array com lacuna/undefined');
    return v.map(paraJson);
  }
  if (typeof v === 'object') {
    if (v.$ref) return { $ref: v.$ref };
    const o = {};
    for (const k of Object.keys(v)) { if (v[k] === undefined) throw new Error('undefined em ' + k); o[k] = paraJson(v[k]); }
    return o;
  }
  throw new Error('tipo não suportado: ' + typeof v);
}

/* Valor JSON puro -> texto de literal JS. */
function paraJs(v, sep, kv) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(x => paraJs(x, sep, kv)).join(sep) + ']';
  const ks = Object.keys(v);
  if (ks.length === 1 && ks[0] === '$fn') return v.$fn.join('\n');
  if (ks.length === 1 && ks[0] === '$ref') { if (!/^[A-Z_][A-Z0-9_]*$/.test(v.$ref)) throw new Error('$ref inválido'); return v.$ref; }
  if (ks.length === 2 && ks[0] === '$re') return '/' + v.$re + '/' + v.flags;
  return '{' + ks.map(k => JSON.stringify(k) + kv + paraJs(v[k], sep, kv)).join(sep) + '}';
}

function emitir(cfg, valor) {
  const { sep, kv } = cfg;
  if (cfg.emit === 'uma') return paraJs(valor, sep, kv);
  const aberto = Array.isArray(valor) ? '[' : '{';
  const fechado = Array.isArray(valor) ? ']' : '}';
  const itens = Array.isArray(valor) ? valor.map(x => paraJs(x, sep, kv))
    : Object.keys(valor).map(k => JSON.stringify(k) + kv + paraJs(valor[k], sep, kv));
  return aberto + '\n' + itens.map(x => cfg.ind + x).join(',\n') + '\n' + cfg.fim + fechado;
}

/* Formatação dos arquivos em dados/: legível e com diffs de git por registro. */
function formatarArquivo(cfg, valor) {
  if (cfg.arquivo === 'bonito') return JSON.stringify(valor, null, 2) + '\n';
  if (cfg.arquivo === 'registro') return '[\n' + valor.map(x => '  ' + JSON.stringify(x)).join(',\n') + '\n]\n';
  if (cfg.arquivo === 'cid') {
    return '{\n' + Object.keys(valor).map(k => '  ' + JSON.stringify(k) + ': [\n' +
      valor[k].map(x => '    ' + JSON.stringify(x)).join(',\n') + '\n  ]').join(',\n') + '\n}\n';
  }
  throw new Error('formato desconhecido');
}

function lerDados(cfg) {
  // Remove BOM (alguns editores do Windows o inserem ao salvar).
  return JSON.parse(fs.readFileSync(path.join(RAIZ, 'dados', cfg.arq), 'utf8').replace(/^﻿/, ''));
}

const MARCA = nome => '/*@dados:' + nome + '*/';

module.exports = { RAIZ, VARS, fimLiteral, acharVar, avaliar, paraJson, paraJs, emitir, formatarArquivo, lerDados, MARCA };
