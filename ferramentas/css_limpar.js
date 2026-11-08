// Limpeza segura do CSS acumulado (src/styles.css).
// Remove apenas o que é comprovadamente inerte:
//  1) declaração sobrescrita: a MESMA propriedade, para o MESMO seletor, redefinida mais adiante no
//     mesmo contexto (@media) ou fora de qualquer @media, sem inversão por !important. Na cascata, a
//     posterior sempre vence (mesma especificidade, ordem maior), então a anterior nunca é aplicada;
//  2) seletor morto: usa classe ou id que não aparece em lugar nenhum do HTML/JS (src/index.html, src/app.js);
//  3) regras e blocos @media que ficaram vazios.
// Por cautela, uma declaração posterior com recurso que algum navegador possa ignorar (color-mix, env(),
// -webkit-, unidades novas, seletores modernos) não é usada para eliminar a anterior (que serve de reserva).
// Uso: node ferramentas/css_limpar.js            (só relatório)
//      node ferramentas/css_limpar.js --aplicar  (reescreve src/styles.css)
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'src', 'styles.css');
const css = fs.readFileSync(ARQ, 'utf8');
const corpus = fs.readFileSync(path.join(RAIZ, 'src', 'app.js'), 'utf8') + '\n' + fs.readFileSync(path.join(RAIZ, 'src', 'index.html'), 'utf8');

/* ---------- Parser simples (comentários, strings, @media aninhado) ---------- */
function parse(s) {
  let i = 0;
  function bloco(fim) {
    const nos = [];
    while (i < s.length) {
      while (i < s.length && /\s/.test(s[i])) i++;
      if (i >= s.length) break;
      if (s[i] === '}') { if (fim) { i++; return nos; } throw new Error('} inesperado em ' + i); }
      if (s.startsWith('/*', i)) { const j = s.indexOf('*/', i) + 2; nos.push({ t: 'com', txt: s.slice(i, j) }); i = j; continue; }
      // prelúdio até { ou ;
      let j = i, par = 0, q = null;
      while (j < s.length) {
        const c = s[j];
        if (q) { if (c === '\\') j++; else if (c === q) q = null; }
        else if (c === '"' || c === "'") q = c;
        else if (c === '(') par++; else if (c === ')') par--;
        else if (par === 0 && (c === '{' || c === ';')) break;
        else if (s.startsWith('/*', j)) { j = s.indexOf('*/', j) + 1; }
        j++;
      }
      const pre = s.slice(i, j).replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (s[j] === ';') { nos.push({ t: 'atstmt', txt: pre + ';' }); i = j + 1; continue; }
      i = j + 1;
      if (/^@(media|supports)\b/.test(pre)) { nos.push({ t: 'at', pre, filhos: bloco(true) }); continue; }
      // corpo bruto até a chave correspondente
      let k = i, prof = 1; q = null;
      while (k < s.length && prof) {
        const c = s[k];
        if (q) { if (c === '\\') k++; else if (c === q) q = null; }
        else if (c === '"' || c === "'") q = c;
        else if (s.startsWith('/*', k)) { k = s.indexOf('*/', k) + 1; }
        else if (c === '{') prof++; else if (c === '}') prof--;
        k++;
      }
      const corpo = s.slice(i, k - 1);
      i = k;
      if (pre[0] === '@') { nos.push({ t: 'atraw', pre, corpo }); continue; }
      nos.push({ t: 'regra', sel: pre, decls: declaracoes(corpo) });
    }
    if (fim) throw new Error('bloco não fechado');
    return nos;
  }
  return bloco(false);
}
function declaracoes(corpo) {
  corpo = corpo.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = []; let ini = 0, par = 0, q = null;
  for (let j = 0; j <= corpo.length; j++) {
    const c = corpo[j];
    if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '(') par++; else if (c === ')') par--;
    else if ((c === ';' && par === 0) || j === corpo.length) {
      const d = corpo.slice(ini, j).trim(); ini = j + 1;
      if (!d) continue;
      const p = d.indexOf(':');
      if (p < 0) throw new Error('declaração inválida: ' + d);
      let val = d.slice(p + 1).trim(), imp = false;
      if (/!\s*important\s*$/i.test(val)) { imp = true; val = val.replace(/\s*!\s*important\s*$/i, ''); }
      const raw = d.slice(0, p).trim();   // propriedades personalizadas (--x) diferenciam maiúsculas
      out.push({ prop: raw.startsWith('--') ? raw : raw.toLowerCase(), propRaw: raw, val, imp, morta: false });
    }
  }
  return out;
}
function seletores(sel) {   // divide "a, b" respeitando parênteses/colchetes
  const out = []; let ini = 0, par = 0;
  for (let j = 0; j <= sel.length; j++) {
    const c = sel[j];
    if (c === '(' || c === '[') par++; else if (c === ')' || c === ']') par--;
    else if ((c === ',' && par === 0) || j === sel.length) { out.push(sel.slice(ini, j).trim().replace(/\s+/g, ' ')); ini = j + 1; }
  }
  return out;
}

/* ---------- Análise ---------- */
const arvore = parse(css);
const regras = [];   // {no, ctx, sels, ordem}
(function andar(nos, ctx) {
  for (const n of nos) {
    if (n.t === 'regra') regras.push({ no: n, ctx, sels: seletores(n.sel) });
    else if (n.t === 'at') andar(n.filhos, ctx ? ctx + ' && ' + n.pre.replace(/\s+/g, ' ') : n.pre.replace(/\s+/g, ' '));
  }
})(arvore, '');

// 2) seletores mortos
const presente = (nome) => new RegExp('(^|[^A-Za-z0-9_-])' + nome.replace(/[-]/g, '\\-') + '($|[^A-Za-z0-9_-])').test(corpus);
const prefixoDinamico = (nome) => { const m = nome.match(/^(.+-)[^-]+$/); return m && new RegExp('["\'\\s]' + m[1].replace(/-/g, '\\-') + '["\']\\s*\\+').test(corpus); };
const nomesMortos = new Set();
function seletorMorto(s) {
  const semAttr = s.replace(/\[[^\]]*\]/g, '').replace(/:not\([^)]*\)/g, '');
  const nomes = (semAttr.match(/[.#][A-Za-z_][A-Za-z0-9_-]*/g) || []).map((x) => x.slice(1));
  const mortos = nomes.filter((n) => !presente(n) && !prefixoDinamico(n));
  mortos.forEach((n) => nomesMortos.add(n));
  return mortos.length > 0;
}
let selRemovidos = 0;
for (const r of regras) {
  const vivos = r.sels.filter((s) => !seletorMorto(s));
  selRemovidos += r.sels.length - vivos.length;
  r.sels = vivos;
  r.no.sel = vivos.join(', ');
}

// 1) declarações sobrescritas
const ARRISCADO = /color-mix\(|env\(|-webkit-|\b\d*\.?\d+(dvh|svh|lvh|dvw|svw|lvw)\b|backdrop|:has\(|:is\(|:where\(|:focus-visible|clamp\(|\bmin\(|\bmax\(|@supports/i;
const regraArriscada = (r) => ARRISCADO.test(r.no.sel);
let declRemovidas = 0;
regras.forEach((r, i) => {
  if (!r.sels.length) return;
  for (const d of r.no.decls) {
    const coberto = r.sels.every((s) => regras.slice(i + 1).some((l) =>
      (l.ctx === r.ctx || l.ctx === '') && l.sels.includes(s) && !regraArriscada(l) &&
      l.no.decls.some((x) => x.prop === d.prop && !(d.imp && !x.imp) && !ARRISCADO.test(x.val))));
    if (coberto) { d.morta = true; declRemovidas++; }
  }
  // dentro da mesma regra: a última declaração da mesma propriedade vence
  const vistos = {};
  for (let k = r.no.decls.length - 1; k >= 0; k--) {
    const d = r.no.decls[k];
    if (d.morta) continue;
    const ant = vistos[d.prop];
    if (ant && !(d.imp && !ant.imp) && !ARRISCADO.test(ant.val)) { d.morta = true; declRemovidas++; }
    else if (!ant) vistos[d.prop] = d;
  }
});

/* ---------- Saída ---------- */
let regrasVazias = 0;
function emitir(nos, ind) {
  const out = [];
  for (const n of nos) {
    if (n.t === 'com') out.push(ind + n.txt);
    else if (n.t === 'atstmt') out.push(ind + n.txt);
    else if (n.t === 'atraw') out.push(ind + n.pre + ' {' + n.corpo.replace(/\s+/g, ' ').trimEnd() + ' }');
    else if (n.t === 'regra') {
      const ds = n.decls.filter((d) => !d.morta);
      if (!n.sel || !ds.length) { regrasVazias++; continue; }
      out.push(ind + n.sel + ' { ' + ds.map((d) => d.propRaw + ': ' + d.val + (d.imp ? ' !important' : '') + ';').join(' ') + ' }');
    } else if (n.t === 'at') {
      const dentro = emitir(n.filhos, ind + '  ');
      if (!dentro.some((x) => !/^\s*\/\*/.test(x))) { regrasVazias++; continue; }
      out.push(ind + n.pre + ' {', ...dentro, ind + '}');
    }
  }
  return out;
}
const novo = emitir(arvore, '').join('\n') + '\n';
const nDecl = regras.reduce((a, r) => a + r.no.decls.length, 0);
console.log(`Regras: ${regras.length}; declarações: ${nDecl}`);
console.log(`Declarações sobrescritas (inertes): ${declRemovidas}`);
console.log(`Seletores mortos removidos: ${selRemovidos} — nomes inexistentes no HTML/JS: ${[...nomesMortos].sort().join(', ') || '(nenhum)'}`);
console.log(`Regras/blocos que ficaram vazios: ${regrasVazias}`);
console.log(`Tamanho: ${css.length} → ${novo.length} caracteres`);
if (process.argv.includes('--aplicar')) { fs.writeFileSync(ARQ, novo, 'utf8'); console.log('src/styles.css reescrito.'); }
