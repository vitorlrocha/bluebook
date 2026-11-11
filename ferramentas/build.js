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
const atualiza = ler('src/atualiza.js'); // atualização automática, versão e data, v73
for (const mk of ['/*@css*/', '/*@versao*/', '/*@atualiza*/', '/*@google*/', '/*@auth*/', '/*@app*/']) if (casca.split(mk).length !== 2) throw new Error('marcador da casca: ' + mk);
// Usa função na substituição para que "$" nos dados não seja interpretado.
const semVersao = casca.replace('/*@css*/', () => css).replace('/*@atualiza*/', () => atualiza).replace('/*@google*/', () => google).replace('/*@auth*/', () => auth).replace('/*@app*/', () => app);

/* Data da última mudança do app/conteúdo: data do último commit que tocou src/ ou dados/ (igual em qualquer
   máquina e no GitHub Actions). Sem git, usa a data do build. */
function dataDoConteudo() {
  const { execFileSync } = require('child_process');
  const cands = ['git'];
  try {
    const base = path.join(process.env.LOCALAPPDATA || '', 'GitHubDesktop');
    for (const d of fs.readdirSync(base).filter((n) => /^app-/.test(n)).sort().reverse()) cands.push(path.join(base, d, 'resources', 'app', 'git', 'cmd', 'git.exe'));
  } catch (e) { /* sem GitHub Desktop */ }
  for (const g of cands) {
    try {
      const s = execFileSync(g, ['log', '-1', '--format=%cI', '--', 'src', 'dados'], { cwd: L.RAIZ, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (s) return new Date(s).toISOString();
    } catch (e) { /* tenta o próximo */ }
  }
  return new Date().toISOString();
}

// Arquivos do PWA (manifest, ícones e service worker) ao lado do index.html.
const pasta = path.dirname(saida);
const pwa = path.join(L.RAIZ, 'src', 'pwa');
fs.mkdirSync(pasta, { recursive: true });
// O código do build é o hash de tudo MENOS o bloco de versão (senão seria circular).
const hash = require('crypto').createHash('sha256').update(semVersao);
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

// Versão exibida no app (Ajustes → Sobre e página inicial) e publicada em versao.json, que o app consulta
// para saber se há versão nova: { versao: número do package.json, build: hash do conteúdo, data: ISO }.
const info = { versao: require(path.join(L.RAIZ, 'package.json')).version, build: versao, data: dataDoConteudo() };
const out = semVersao.replace('/*@versao*/', () => 'window.BB_VERSAO = ' + JSON.stringify(info) + ';');
fs.writeFileSync(saida, out, 'utf8');
fs.writeFileSync(path.join(pasta, 'versao.json'), JSON.stringify(info) + '\n', 'utf8');
console.log('OK', path.relative(L.RAIZ, saida), (Buffer.byteLength(out) / 1048576).toFixed(2) + ' MB');
console.log('OK PWA: manifest.json, sw.js, icones/, versao.json — versão ' + info.versao + ' (build ' + versao + ', ' + info.data.slice(0, 10) + ')');
