// Separação única dos dados e do código do index.html de arquivo único.
// Uso: node ferramentas/extrair.js referencia/index-v71-original.html
// Gera: dados/*.json, src/app.js, src/styles.css, src/index.html (casca com marcadores).
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib_dados');

const orig = process.argv[2];
if (!orig) { console.error('Uso: node ferramentas/extrair.js <index.html original>'); process.exit(2); }
const html = fs.readFileSync(orig, 'utf8');

// <style> único
const st = /<style>\n?([\s\S]*?)<\/style>/.exec(html);
if (!st || html.indexOf('<style', st.index + 1) !== -1) throw new Error('esperado exatamente um <style>');
// <script> principal = o que contém os dados
const re = /<script>([\s\S]*?)<\/script>/g;
let m, principal = null;
while ((m = re.exec(html))) if (m[1].includes('var SEED_MEDS = ')) principal = m;
if (!principal) throw new Error('script principal não encontrado');

const cssIni = st.index + st[0].indexOf(st[1]), cssFim = cssIni + st[1].length;
const jsIni = principal.index + '<script>'.length, jsFim = jsIni + principal[1].length;
if (!(cssFim < jsIni)) throw new Error('ordem inesperada');

let app = html.slice(jsIni, jsFim);
fs.mkdirSync(path.join(L.RAIZ, 'dados'), { recursive: true });
fs.mkdirSync(path.join(L.RAIZ, 'src'), { recursive: true });

// Extrai do fim para o começo para não deslocar as posições.
const achados = L.VARS.map(cfg => ({ cfg, ...L.acharVar(app, cfg.v) })).sort((a, b) => b.ini - a.ini);
for (const { cfg, ini, fim } of achados) {
  const texto = app.slice(ini, fim);
  let valor;
  try { valor = JSON.parse(texto); } catch (e) { valor = L.paraJson(L.avaliar(texto, cfg.refs)); }
  fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, valor), 'utf8');
  const vazio = texto[0] === '[' ? '[]' : '{}';
  app = app.slice(0, ini) + L.MARCA(cfg.v) + vazio + app.slice(fim);
  console.log(cfg.v.padEnd(15), '->', 'dados/' + cfg.arq, Array.isArray(valor) ? valor.length + ' itens' : Object.keys(valor).length + ' chaves');
}

const casca = html.slice(0, cssIni) + '/*@css*/' + html.slice(cssFim, jsIni) + '/*@app*/' + html.slice(jsFim);
fs.writeFileSync(path.join(L.RAIZ, 'src', 'styles.css'), html.slice(cssIni, cssFim), 'utf8');
fs.writeFileSync(path.join(L.RAIZ, 'src', 'app.js'), app, 'utf8');
fs.writeFileSync(path.join(L.RAIZ, 'src', 'index.html'), casca, 'utf8');
console.log('src/app.js', app.length, 'caracteres; src/styles.css', cssFim - cssIni, '; src/index.html', casca.length);
