// Monta dist/index.html (arquivo único, offline) a partir de src/ e dados/.
// Uso: node ferramentas/build.js [saida]
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib_dados');

const saida = process.argv[2] || path.join(L.RAIZ, 'dist', 'index.html');
const ler = f => fs.readFileSync(path.join(L.RAIZ, f), 'utf8');

let app = ler('src/app.js');
for (const cfg of L.VARS) {
  const marca = L.MARCA(cfg.v);
  const i = app.indexOf(marca);
  if (i < 0 || app.indexOf(marca, i + 1) >= 0) throw new Error('marcador ausente ou repetido: ' + marca);
  const vazio = app.substr(i + marca.length, 2);
  if (vazio !== '[]' && vazio !== '{}') throw new Error('marcador sem [] ou {}: ' + marca);
  const texto = L.emitir(cfg, L.lerDados(cfg));
  if (/<\/script|<!--/i.test(texto)) throw new Error(cfg.v + ': texto contém </script ou <!-- e quebraria o HTML');
  app = app.slice(0, i) + texto + app.slice(i + marca.length + 2);
}
if (/\/\*@dados:/.test(app)) throw new Error('sobrou marcador de dados em app.js');

const casca = ler('src/index.html');
const css = ler('src/styles.css');
const auth = ler('src/auth.js');     // acesso local (login), v72 Etapa 2
const google = ler('src/google.js'); // Entrar com o Google + backup no Drive, v72 Etapa 5
for (const mk of ['/*@css*/', '/*@google*/', '/*@auth*/', '/*@app*/']) if (casca.split(mk).length !== 2) throw new Error('marcador da casca: ' + mk);
// Usa função na substituição para que "$" nos dados não seja interpretado.
const out = casca.replace('/*@css*/', () => css).replace('/*@google*/', () => google).replace('/*@auth*/', () => auth).replace('/*@app*/', () => app);

fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, out, 'utf8');
console.log('OK', path.relative(L.RAIZ, saida), (Buffer.byteLength(out) / 1048576).toFixed(2) + ' MB');

// Arquivos do PWA (manifest, ícones e service worker) ao lado do index.html.
const pasta = path.dirname(saida);
const pwa = path.join(L.RAIZ, 'src', 'pwa');
const hash = require('crypto').createHash('sha256').update(out);
fs.copyFileSync(path.join(pwa, 'manifest.json'), path.join(pasta, 'manifest.json'));
hash.update(fs.readFileSync(path.join(pwa, 'manifest.json')));
fs.mkdirSync(path.join(pasta, 'icones'), { recursive: true });
for (const f of fs.readdirSync(path.join(pwa, 'icones')).sort()) {
  const b = fs.readFileSync(path.join(pwa, 'icones', f));
  fs.writeFileSync(path.join(pasta, 'icones', f), b);
  hash.update(b);
}
const sw = fs.readFileSync(path.join(pwa, 'sw.js'), 'utf8');
hash.update(sw);
const versao = hash.digest('hex').slice(0, 12);
if (sw.split('__VERSAO__').length !== 2) throw new Error('sw.js: marcador __VERSAO__ ausente ou repetido');
fs.writeFileSync(path.join(pasta, 'sw.js'), sw.replace('__VERSAO__', versao), 'utf8');
fs.writeFileSync(path.join(pasta, '.nojekyll'), '');   // GitHub Pages: servir arquivos sem processar
console.log('OK PWA: manifest.json, sw.js (versão ' + versao + '), icones/');
