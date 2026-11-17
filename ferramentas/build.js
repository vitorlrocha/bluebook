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
const nuvemJs = ler('src/nuvem.js');   // conta na nuvem + sincronização (Firebase por REST)
const atualiza = ler('src/atualiza.js'); // atualização automática, versão e data, v73
for (const mk of ['/*@css*/', '/*@versao*/', '/*@atualiza*/', '/*@google*/', '/*@nuvem*/', '/*@auth*/', '/*@app*/']) if (casca.split(mk).length !== 2) throw new Error('marcador da casca: ' + mk);
// Usa função na substituição para que "$" nos dados não seja interpretado.
const semVersao = casca.replace('/*@css*/', () => css).replace('/*@atualiza*/', () => atualiza).replace('/*@google*/', () => google).replace('/*@nuvem*/', () => nuvemJs).replace('/*@auth*/', () => auth).replace('/*@app*/', () => app);

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
/* Banco na nuvem (Firebase): a configuração vem de variáveis de ambiente, nunca do código.
   - No seu computador: arquivo .env na raiz (fora do git; modelo em .env.exemplo).
   - Na publicação: "Repository variables" do GitHub (Settings → Secrets and variables → Actions → Variables).
   São identificadores PÚBLICOS do projeto (o Firebase prevê que fiquem visíveis no app); quem protege os dados
   são as regras de acesso (firestore.rules). Chaves secretas de administração NUNCA entram aqui.
   Sem as variáveis, o app é gerado sem nuvem (só local), como antes. */
function lerEnv() {
  const env = Object.assign({}, process.env);
  try {
    for (const linha of fs.readFileSync(path.join(L.RAIZ, '.env'), 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in process.env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch (e) { /* sem .env */ }
  return env;
}
const env = lerEnv();
// BB_SEM_NUVEM=1 força o app sem nuvem mesmo com .env (usado pelos testes: nunca falam com o Firebase real).
const nuvem = !env.BB_SEM_NUVEM && env.BB_FIREBASE_API_KEY && env.BB_FIREBASE_PROJECT_ID
  ? { apiKey: env.BB_FIREBASE_API_KEY, projectId: env.BB_FIREBASE_PROJECT_ID }
  : null;
if (nuvem && !/^[A-Za-z0-9_-]{20,}$/.test(nuvem.apiKey)) throw new Error('BB_FIREBASE_API_KEY com formato inesperado');
if (nuvem && !/^[a-z0-9-]{4,}$/.test(nuvem.projectId)) throw new Error('BB_FIREBASE_PROJECT_ID com formato inesperado');

// O código do build é o hash de tudo MENOS o bloco de versão (senão seria circular); inclui a config da nuvem.
const hash = require('crypto').createHash('sha256').update(semVersao).update(JSON.stringify(nuvem));
fs.copyFileSync(path.join(pwa, 'manifest.json'), path.join(pasta, 'manifest.json'));
hash.update(fs.readFileSync(path.join(pwa, 'manifest.json')));
// Política de privacidade e termos de uso (página própria, também guardada para uso offline pelo sw.js)
fs.copyFileSync(path.join(pwa, 'privacidade.html'), path.join(pasta, 'privacidade.html'));
hash.update(fs.readFileSync(path.join(pwa, 'privacidade.html')));
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
const out = semVersao.replace('/*@versao*/', () => 'window.BB_VERSAO = ' + JSON.stringify(info) + '; window.BB_NUVEM = ' + JSON.stringify(nuvem) + ';');
fs.writeFileSync(saida, out, 'utf8');
fs.writeFileSync(path.join(pasta, 'versao.json'), JSON.stringify(info) + '\n', 'utf8');
console.log('OK', path.relative(L.RAIZ, saida), (Buffer.byteLength(out) / 1048576).toFixed(2) + ' MB');
console.log('OK PWA: manifest.json, sw.js, icones/, versao.json — versão ' + info.versao + ' (build ' + versao + ', ' + info.data.slice(0, 10) + ')');
console.log(nuvem ? 'OK nuvem: Firebase projeto ' + nuvem.projectId : 'AVISO sem nuvem: BB_FIREBASE_API_KEY/BB_FIREBASE_PROJECT_ID não definidas (app só local)');
