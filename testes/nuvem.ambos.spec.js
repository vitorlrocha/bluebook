'use strict';
// Conta na nuvem + sincronização automática (src/nuvem.js) com um Firebase SIMULADO em memória:
// Identity Toolkit (contas), securetoken (renovação) e Firestore (um documento por usuário, com a
// pré-condição de updateTime de verdade) são respondidos pelo próprio teste. Nenhuma conta real, nenhum
// dado sai da máquina. Cada "aparelho" é um contexto separado do navegador; todos falam com o mesmo servidor.
const { test, expect, abrir } = require('./apoio');

const EMAIL = 'medico@exemplo.com';
const SENHA = 'senha-de-teste-123';
const MARCA = '— versão do outro aparelho (';

// Como em google.ambos.spec.js: no WebKit o Playwright não intercepta páginas controladas pelo service worker.
test.use({ serviceWorkers: 'block' });
test.setTimeout(90000);

/* ---------------- Firebase simulado ---------------- */
function novoServidor() {
  return {
    usuarios: {},        // e-mail → { uid, senha }
    docs: {},            // uid → { fields, updateTime }
    emails: [],          // pedidos de redefinição de senha
    seq: 0, leituras: 0, gravacoes: 0, conflitos: 0,
    barreira: null,      // { n, fila }: segura as leituras até n aparelhos terem lido (para forçar a corrida)
    googleEmail: null,   // e-mail devolvido pelo "Entrar com o Google" simulado
    protecao: false,     // true = como o Firebase com proteção de enumeração: INVALID_LOGIN_CREDENTIALS
  };
}
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS' };

async function tratar(S, ap, route) {
  const req = route.request(), url = new URL(req.url());
  if (ap.offline) return route.abort('internetdisconnected');
  if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS, body: '' });
  const json = (o, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: CORS, body: JSON.stringify(o) });
  const erroIdt = (m) => json({ error: { code: 400, message: m } }, 400);
  const erroFs = (code, status) => json({ error: { code, message: status, status } }, code);
  const sessao = (email) => { const u = S.usuarios[email]; return { idToken: 'id:' + u.uid, refreshToken: 'rt:' + u.uid, localId: u.uid, email, expiresIn: '3600' }; };
  const porUid = (uid) => Object.keys(S.usuarios).find((e) => S.usuarios[e].uid === uid);

  if (url.hostname === 'identitytoolkit.googleapis.com') {
    const b = JSON.parse(req.postData() || '{}'), acao = url.pathname.split(':')[1];
    if (url.searchParams.get('key') !== 'chave-de-teste-0000000000') return erroIdt('API_KEY_INVALID');
    if (acao === 'signUp') {
      if (S.usuarios[b.email]) return erroIdt('EMAIL_EXISTS');
      if (String(b.password).length < 6) return erroIdt('WEAK_PASSWORD : Password should be at least 6 characters');
      S.usuarios[b.email] = { uid: 'u' + (++S.seq), senha: b.password };
      return json(sessao(b.email));
    }
    if (acao === 'signInWithPassword') {
      const u = S.usuarios[b.email];
      if (!u) return erroIdt(S.protecao ? 'INVALID_LOGIN_CREDENTIALS' : 'EMAIL_NOT_FOUND');
      if (u.senha !== b.password) return erroIdt(S.protecao ? 'INVALID_LOGIN_CREDENTIALS' : 'INVALID_PASSWORD');
      return json(sessao(b.email));
    }
    if (acao === 'sendOobCode') {
      S.emails.push({ tipo: b.requestType, email: b.email });
      return S.usuarios[b.email] ? json({ email: b.email }) : erroIdt('EMAIL_NOT_FOUND');
    }
    if (acao === 'update') {
      const email = porUid(String(b.idToken).slice(3));
      if (!email) return erroIdt('INVALID_ID_TOKEN');
      S.usuarios[email].senha = b.password;
      return json(sessao(email));
    }
    if (acao === 'signInWithIdp') {
      if (!/access_token=tok-teste/.test(b.postBody) || !/providerId=google\.com/.test(b.postBody)) return erroIdt('INVALID_IDP_RESPONSE');
      const email = S.googleEmail;
      if (!S.usuarios[email]) S.usuarios[email] = { uid: 'u' + (++S.seq), senha: null };
      return json(sessao(email));
    }
    return erroIdt('OPERATION_NOT_ALLOWED');
  }
  if (url.hostname === 'securetoken.googleapis.com') {
    const rt = new URLSearchParams(req.postData() || '').get('refresh_token') || '';
    if (!porUid(rt.slice(3))) return json({ error: { code: 400, message: 'TOKEN_EXPIRED', status: 'INVALID_ARGUMENT' } }, 400);
    return json({ id_token: 'id:' + rt.slice(3), refresh_token: rt, user_id: rt.slice(3), expires_in: '3600' });
  }
  // Firestore: só o dono (token do mesmo uid do caminho) lê ou grava usuarios/<uid>, como em firestore.rules.
  const m = url.pathname.match(/^\/v1\/projects\/bluebook-teste\/databases\/\(default\)\/documents\/usuarios\/([^/]+)$/);
  const uid = m && decodeURIComponent(m[1]);
  if (!uid || req.headers().authorization !== 'Bearer id:' + uid || !porUid(uid)) return erroFs(403, 'PERMISSION_DENIED');
  const nome = 'projects/bluebook-teste/databases/(default)/documents/usuarios/' + uid;
  if (req.method() === 'GET') {
    S.leituras++;
    const doc = S.docs[uid];                       // o que o aparelho "viu" é o estado no momento da leitura
    if (S.barreira) {
      const b = S.barreira;
      await new Promise((ok) => { b.fila.push(ok); if (b.fila.length >= b.n) { S.barreira = null; b.fila.forEach((f) => f()); } });
    }
    return doc ? json({ name: nome, fields: doc.fields, createTime: doc.createTime, updateTime: doc.updateTime }) : erroFs(404, 'NOT_FOUND');
  }
  if (req.method() === 'PATCH') {
    if (S.intruso) {
      // "outro aparelho" grava ENTRE a leitura e a gravação deste: o documento muda de versão (updateTime novo)
      // ou passa a existir (se ainda não existia)
      const i = S.intruso; S.intruso = null;
      const d0 = S.docs[uid] || { createTime: '2026-11-11T11:00:00.000000Z', fields: { v: { integerValue: '1' }, reg: { mapValue: { fields: {} } } } };
      const fields = JSON.parse(JSON.stringify(d0.fields));
      fields.reg.mapValue.fields[i.chave] = { mapValue: { fields: { v: { stringValue: i.valor }, mod: { integerValue: String(Date.now()) }, ap: { stringValue: 'intruso' } } } };
      S.docs[uid] = { fields, createTime: d0.createTime, updateTime: new Date(Date.UTC(2026, 10, 11, 12, 0, 0) + (++S.seq)).toISOString().replace('Z', '000Z') };
      S.gravacoes++;
    }
    const doc = S.docs[uid], ut = url.searchParams.get('currentDocument.updateTime'), ex = url.searchParams.get('currentDocument.exists');
    if (ex === 'false' && doc) { S.conflitos++; return erroFs(409, 'ALREADY_EXISTS'); }
    if (ut && (!doc || doc.updateTime !== ut)) { S.conflitos++; return erroFs(400, 'FAILED_PRECONDITION'); }
    if (!ut && ex !== 'false') return erroFs(400, 'INVALID_ARGUMENT');      // o app SEMPRE manda uma pré-condição
    const agora = new Date(Date.UTC(2026, 10, 11, 12, 0, 0) + (++S.seq)).toISOString().replace('Z', '000Z');
    S.docs[uid] = { fields: JSON.parse(req.postData()).fields, createTime: doc ? doc.createTime : agora, updateTime: agora };
    S.gravacoes++;
    return json({ name: nome, fields: S.docs[uid].fields, createTime: S.docs[uid].createTime, updateTime: agora });
  }
  return erroFs(400, 'INVALID_ARGUMENT');
}
/* Registros guardados no servidor para o usuário: { chave: texto ou null }. */
function registros(S, email = EMAIL) {
  const u = S.usuarios[email], d = u && S.docs[u.uid], f = (d && d.fields.reg.mapValue.fields) || {};
  const r = {};
  for (const k of Object.keys(f)) { const c = f[k].mapValue.fields; r[k] = 'stringValue' in c.v ? c.v.stringValue : null; }
  return r;
}
function notaNoServidor(S, chave) { const v = registros(S)['nota|' + chave]; return v ? JSON.parse(v).t : v; }

/* ---------------- Aparelhos ---------------- */
async function aparelho(browser, info, S) {
  const u = info.project.use, opc = { serviceWorkers: 'block' };
  for (const k of ['viewport', 'userAgent', 'deviceScaleFactor', 'isMobile', 'hasTouch', 'baseURL', 'locale', 'timezoneId']) if (u[k] !== undefined) opc[k] = u[k];
  const ctx = await browser.newContext(opc);
  const ap = { ctx, offline: false, erros: [] };
  await ctx.addInitScript(() => { window.__BB_NUVEM_TESTE = { apiKey: 'chave-de-teste-0000000000', projectId: 'bluebook-teste' }; });
  await ctx.route(/^https:\/\/(identitytoolkit|securetoken|firestore)\.googleapis\.com\//, (route) => tratar(S, ap, route));
  ap.page = await ctx.newPage();
  // Mesma regra de apoio.js: erro de JavaScript falha o teste. (Respostas 4xx simuladas e rede cortada aparecem no
  // console do navegador como "Failed to load resource"; fazem parte do cenário e não são erro do app.)
  ap.page.on('pageerror', (e) => ap.erros.push('pageerror: ' + e.message));
  ap.page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_INTERNET_DISCONNECTED|not allowed to request resource|Load failed/i.test(m.text())) ap.erros.push('console.error: ' + m.text()); });
  return ap;
}
async function criarAcesso(page, email = EMAIL, senha = SENHA) {
  await page.goto('/');
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-senha').fill(senha);
  await page.locator('#auth-senha2').fill(senha);
  await page.locator('#auth-ok').click();
  await expect(page.locator('#auth')).toBeHidden();
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
}
async function entrarAparelhoNovo(page, email = EMAIL, senha = SENHA) {
  await page.goto('/');
  await page.locator('#auth-ir-entrar').click();
  await expect(page.locator('.auth-h2')).toHaveText('Entrar');
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-senha').fill(senha);
  await page.locator('#auth-ok').click();
  await expect(page.locator('#auth')).toBeHidden();
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
}
/* Dois aparelhos da mesma conta, já sincronizados. */
async function doisAparelhos(browser, info) {
  const S = novoServidor();
  const A = await aparelho(browser, info, S), B = await aparelho(browser, info, S);
  await criarAcesso(A.page);
  await sinc(A.page);
  await entrarAparelhoNovo(B.page);
  await sinc(B.page);
  return { S, A, B };
}
async function fechar(...aps) {
  for (const ap of aps) { expect(ap.erros, 'erros de JavaScript no aparelho').toEqual([]); await ap.ctx.close(); }
}
const sinc = (page) => page.evaluate(() => window.BBNuvem.sincronizar({ busca: true }).then((e) => e.texto));
const estado = (page) => page.evaluate(() => window.BBNuvem.estado());
const notas = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('bluebook:notes') || '{}'));
const favoritos = (page) => page.evaluate(() => Object.keys((JSON.parse(localStorage.getItem('formulario-clinico:medications') || '{}').fav) || {}));
async function semInternet(ap, sim) {
  ap.offline = sim;
  await ap.ctx.setOffline(sim);
  // garante o mesmo sinal em todos os motores (o WebKit nem sempre dispara o evento sozinho)
  await ap.page.evaluate((off) => {
    Object.defineProperty(navigator, 'onLine', { value: !off, configurable: true });
    window.dispatchEvent(new Event(off ? 'offline' : 'online'));
  }, sim);
}
async function abrirMed(page, nome) {
  if (await page.locator('#back-btn').isVisible()) await page.locator('#back-btn').click();   // celular: volta da ficha para a lista
  await page.locator('#search-input').fill(nome);
  await page.locator('#sidebar .med-item[data-id]').first().click();
  await expect(page.locator('#detail h2').first()).toContainText(nome);
}
async function anotar(page, texto) {      // digita na anotação aberta e sai do campo
  await page.locator('#note-text').fill(texto);
  await page.locator('#note-text').blur();
}
async function abrirAjustes(page) { await page.evaluate(() => document.getElementById('settings-btn').click()); }
const vezes = (texto, parte) => texto.split(parte).length - 1;

/* ---------------- Cenários ---------------- */
test.describe('Nuvem: conta e sincronização entre dois aparelhos', () => {
  test.use({ logado: false });

  test('a) conta criada no A; B entra e recebe a anotação e o favorito do A, sem recarregar', async ({ browser }, info) => {
    const S = novoServidor();
    const A = await aparelho(browser, info, S), B = await aparelho(browser, info, S);
    await criarAcesso(A.page);
    await abrirMed(A.page, 'Amoxicilina');
    await anotar(A.page, 'nota feita no aparelho A');
    await A.page.locator('#detail-fav-btn').click();
    await expect(A.page.locator('#detail-fav-btn')).toHaveClass(/is-fav/);
    expect(await sinc(A.page)).toMatch(/^Sincronizado às \d\d:\d\d$/);
    expect(notaNoServidor(S, 'm:Amoxicilina')).toBe('nota feita no aparelho A');
    expect(registros(S)['favm|amoxicilina']).toBe('1');

    // aparelho novo: entra pela nuvem e sincroniza sozinho logo depois do login
    await entrarAparelhoNovo(B.page);
    await expect.poll(async () => (await notas(B.page))['m:Amoxicilina'] && (await notas(B.page))['m:Amoxicilina'].t).toBe('nota feita no aparelho A');
    expect(await favoritos(B.page)).toEqual(['amoxicilina']);
    await abrirMed(B.page, 'Amoxicilina');
    await expect(B.page.locator('#note-text')).toHaveValue('nota feita no aparelho A');
    await expect(B.page.locator('#detail-fav-btn')).toHaveClass(/is-fav/);

    // mudança posterior no A aparece no B com a ficha aberta, sem recarregar a página
    await B.page.evaluate(() => { window.__naoRecarregou = true; });
    await anotar(A.page, 'nota do A, segunda versão');
    await A.page.locator('#detail-fav-btn').click();
    await sinc(A.page);
    await sinc(B.page);
    await expect(B.page.locator('#note-text')).toHaveValue('nota do A, segunda versão');
    await expect(B.page.locator('#detail-fav-btn')).not.toHaveClass(/is-fav/);
    expect(await B.page.evaluate(() => window.__naoRecarregou)).toBe(true);

    // o aparelho guarda só uid, e-mail e o token de renovação; a senha não fica em lugar nenhum
    const guardado = await B.page.evaluate(() => JSON.parse(localStorage.getItem('bluebook:nuvem')));
    expect(Object.keys(guardado).sort()).toEqual(['email', 'refreshToken', 'uid']);
    for (const ap of [A, B]) {
      const tudo = await ap.page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)) + JSON.stringify(Object.assign({}, sessionStorage)));
      expect(tudo).not.toContain(SENHA);
    }
    expect(JSON.stringify(S.docs)).not.toContain(SENHA);

    // Ajustes → Sincronização
    await abrirAjustes(B.page);
    await expect(B.page.locator('#settings-sinc')).toContainText('Não escreva nas anotações nome ou dados que identifiquem pacientes');
    await expect(B.page.locator('#sinc-status')).toHaveText(/^Sincronizado às \d\d:\d\d$/);
    const antes = S.leituras;
    await B.page.locator('#sinc-agora').click();
    await expect.poll(() => S.leituras).toBe(antes + 1);
    await expect(B.page.locator('#sinc-status')).toHaveText(/^Sincronizado às \d\d:\d\d$/);
    await fechar(A, B);
  });

  test('b) A fica sem internet, edita, reconecta e o B recebe', async ({ browser }, info) => {
    const { S, A, B } = await doisAparelhos(browser, info);
    await semInternet(A, true);
    await abrirMed(A.page, 'Dipirona sódica');
    await anotar(A.page, 'escrita sem internet');
    const gravacoes = S.gravacoes;
    expect(await sinc(A.page)).toBe('Sem internet — será enviado quando voltar');
    expect((await estado(A.page)).pendente).toBe(true);
    await abrirAjustes(A.page);
    await expect(A.page.locator('#sinc-status')).toHaveText('Sem internet — será enviado quando voltar');
    expect(S.gravacoes).toBe(gravacoes);
    expect(notaNoServidor(S, 'm:Dipirona sódica (Metamizol)')).toBeUndefined();
    // a internet volta: o envio acontece sozinho (evento "online")
    await semInternet(A, false);
    await expect.poll(() => notaNoServidor(S, 'm:Dipirona sódica (Metamizol)')).toBe('escrita sem internet');
    await expect(A.page.locator('#sinc-status')).toHaveText(/^Sincronizado às/);
    await sinc(B.page);
    expect((await notas(B.page))['m:Dipirona sódica (Metamizol)'].t).toBe('escrita sem internet');
    // sem mudança local não há gravação: só leitura
    const g2 = S.gravacoes;
    await sinc(A.page); await sinc(B.page);
    expect(S.gravacoes).toBe(g2);
    await fechar(A, B);
  });

  test('c) conflito: A e B editam a mesma anotação sem internet — as duas versões ficam, sem duplicar', async ({ browser }, info) => {
    const { S, A, B } = await doisAparelhos(browser, info);
    await abrirMed(A.page, 'Amoxicilina');
    await anotar(A.page, 'texto base');
    await sinc(A.page); await sinc(B.page);
    await abrirMed(B.page, 'Amoxicilina');
    await expect(B.page.locator('#note-text')).toHaveValue('texto base');

    await semInternet(A, true); await semInternet(B, true);
    await anotar(A.page, 'versão escrita no A');
    await sinc(A.page);                               // sem internet: só registra a hora da mudança
    await A.page.waitForTimeout(30);
    await anotar(B.page, 'versão escrita no B');     // a mais recente
    await sinc(B.page);
    await semInternet(A, false); await sinc(A.page);
    await semInternet(B, false); await sinc(B.page);
    await sinc(A.page);

    const nA = (await notas(A.page))['m:Amoxicilina'].t, nB = (await notas(B.page))['m:Amoxicilina'].t;
    expect(nA).toBe(nB);
    expect(nB).toMatch(/^versão escrita no B\n\n— versão do outro aparelho \(\d\d\/\d\d\/\d{4} \d\d:\d\d\):\nversão escrita no A$/);
    expect(notaNoServidor(S, 'm:Amoxicilina')).toBe(nB);
    await expect(A.page.locator('#note-text')).toHaveValue(nB);      // a tela do A foi atualizada sem recarregar
    // novas sincronizações não anexam de novo nem gravam à toa
    const g = S.gravacoes;
    await sinc(A.page); await sinc(B.page); await sinc(A.page);
    expect(S.gravacoes).toBe(g);
    const fim = (await notas(A.page))['m:Amoxicilina'].t;
    expect(vezes(fim, 'versão escrita no A')).toBe(1);
    expect(vezes(fim, MARCA)).toBe(1);
    // segundo conflito sobre a anotação já mesclada: o trecho antigo não é repetido
    await semInternet(A, true); await semInternet(B, true);
    await anotar(A.page, fim + '\nlinha nova do A'); await sinc(A.page);
    await A.page.waitForTimeout(30);
    await anotar(B.page, 'B reescreveu tudo'); await sinc(B.page);
    await semInternet(A, false); await sinc(A.page);
    await semInternet(B, false); await sinc(B.page);
    await sinc(A.page);
    const f2 = (await notas(A.page))['m:Amoxicilina'].t;
    expect((await notas(B.page))['m:Amoxicilina'].t).toBe(f2);
    expect(f2.startsWith('B reescreveu tudo')).toBe(true);
    expect(vezes(f2, 'versão escrita no A')).toBe(1);
    expect(vezes(f2, 'linha nova do A')).toBe(1);
    await fechar(A, B);
  });

  test('c2) anotação em edição não é sobrescrita pelo que vem da nuvem; as duas versões ficam ao sair do campo', async ({ browser }, info) => {
    const { A, B } = await doisAparelhos(browser, info);
    await abrirMed(A.page, 'Amoxicilina');
    await anotar(A.page, 'texto base');
    await sinc(A.page); await sinc(B.page);
    await abrirMed(B.page, 'Amoxicilina');
    await anotar(A.page, 'A mudou enquanto B digitava');
    await sinc(A.page);
    // B está com o cursor na anotação e digitando
    await B.page.locator('#note-text').focus();
    await B.page.locator('#note-text').fill('B ainda está digitando');
    await sinc(B.page);
    await expect(B.page.locator('#note-text')).toHaveValue('B ainda está digitando');
    await expect(B.page.locator('#note-text')).toBeFocused();
    expect((await notas(B.page))['m:Amoxicilina'].t).toBe('B ainda está digitando');
    // saiu do campo: a próxima sincronização junta as duas versões
    await B.page.locator('#note-text').blur();
    await sinc(B.page);
    const t = (await notas(B.page))['m:Amoxicilina'].t;
    expect(t.startsWith('B ainda está digitando\n\n' + MARCA)).toBe(true);
    expect(vezes(t, 'A mudou enquanto B digitava')).toBe(1);
    await expect(B.page.locator('#note-text')).toHaveValue(t);
    await sinc(A.page);
    expect((await notas(A.page))['m:Amoxicilina'].t).toBe(t);
    await fechar(A, B);
  });

  test('d) exclusão feita no A não é ressuscitada pelo B desatualizado', async ({ browser }, info) => {
    const { S, A, B } = await doisAparelhos(browser, info);
    await abrirMed(A.page, 'Amoxicilina');
    await anotar(A.page, 'anotação que será apagada');
    await A.page.locator('#detail-fav-btn').click();
    await sinc(A.page); await sinc(B.page);
    expect((await notas(B.page))['m:Amoxicilina'].t).toBe('anotação que será apagada');
    expect(await favoritos(B.page)).toEqual(['amoxicilina']);

    // B fica sem internet (desatualizado); A apaga a anotação e tira o favorito
    await semInternet(B, true);
    await anotar(A.page, '');
    await A.page.locator('#detail-fav-btn').click();
    await sinc(A.page);
    expect(registros(S)['nota|m:Amoxicilina']).toBeNull();      // marca de exclusão, não remoção
    expect(registros(S)['favm|amoxicilina']).toBeNull();
    // B, ainda com os dados antigos, faz outra mudança e volta: envia a sua sem trazer de volta o que foi apagado
    await abrirMed(B.page, 'Dipirona sódica');
    await anotar(B.page, 'outra anotação, feita no B');
    await sinc(B.page);
    await semInternet(B, false);
    await sinc(B.page);
    expect(await notas(B.page)).toEqual({ 'm:Dipirona sódica (Metamizol)': expect.objectContaining({ t: 'outra anotação, feita no B' }) });
    expect(await favoritos(B.page)).toEqual([]);
    expect(registros(S)['nota|m:Amoxicilina']).toBeNull();
    expect(registros(S)['favm|amoxicilina']).toBeNull();
    expect(notaNoServidor(S, 'm:Dipirona sódica (Metamizol)')).toBe('outra anotação, feita no B');
    await sinc(A.page);
    expect(Object.keys(await notas(A.page))).toEqual(['m:Dipirona sódica (Metamizol)']);
    expect(await favoritos(A.page)).toEqual([]);
    // favoritar de novo depois da exclusão volta a valer nos dois
    await abrirMed(B.page, 'Amoxicilina');
    await B.page.locator('#detail-fav-btn').click();
    await sinc(B.page); await sinc(A.page);
    expect(await favoritos(A.page)).toEqual(['amoxicilina']);
    await fechar(A, B);
  });

  test('e) pré-condição: outra gravação entre a leitura e a gravação é recusada; o app lê de novo e nada se perde', async ({ browser }, info) => {
    const { S, A } = await doisAparelhos(browser, info);
    await abrirMed(A.page, 'Amoxicilina');
    await anotar(A.page, 'gravada pelo A');
    S.intruso = { chave: 'nota|m:Captopril', valor: JSON.stringify({ t: 'gravada pelo outro aparelho', rev: false }) };
    const conflitos = S.conflitos;
    expect(await sinc(A.page)).toMatch(/^Sincronizado às/);
    expect(S.conflitos).toBe(conflitos + 1);         // a 1ª gravação do A foi recusada pela pré-condição…
    expect(notaNoServidor(S, 'm:Amoxicilina')).toBe('gravada pelo A');                 // …e a 2ª levou a nota do A
    expect(notaNoServidor(S, 'm:Captopril')).toBe('gravada pelo outro aparelho');      // sem apagar a do outro
    expect((await notas(A.page))['m:Captopril'].t).toBe('gravada pelo outro aparelho');
    await fechar(A);
  });

  test('e2) dois aparelhos gravando ao mesmo tempo: nada se perde', async ({ browser }, info) => {
    const { S, A, B } = await doisAparelhos(browser, info);
    S.barreira = { n: 2, fila: [] };                 // os dois leem a MESMA versão antes de qualquer um gravar
    // (sob carga, um ciclo automático pode ocupar a barreira; o resultado tem de ser o mesmo, por isso aqui
    //  só se confere a integridade; a recusa pela pré-condição é conferida de forma determinística no teste e)
    // a mudança e o pedido de sincronização acontecem juntos em cada aparelho, para os dois envios coincidirem
    const mudarESincronizar = (page, chave, texto, fav) => page.evaluate(([k, t, f]) => {
      const n = JSON.parse(localStorage.getItem('bluebook:notes') || '{}'); n[k] = { t, rev: false, at: new Date().toISOString() };
      localStorage.setItem('bluebook:notes', JSON.stringify(n));
      if (f) { const m = JSON.parse(localStorage.getItem('formulario-clinico:medications')) || { v: 2, fav: {}, extras: [] }; m.fav = m.fav || {}; m.fav[f] = true; localStorage.setItem('formulario-clinico:medications', JSON.stringify(m)); }
      return window.BBNuvem.sincronizar({ busca: true }).then((e) => e.texto);
    }, [chave, texto, fav]);
    await Promise.all([
      mudarESincronizar(A.page, 'm:Amoxicilina', 'gravada pelo A', null),
      mudarESincronizar(B.page, 'm:Dipirona sódica (Metamizol)', 'gravada pelo B', 'dipirona sódica (metamizol)'),
    ]);
    S.barreira = null;
    expect(notaNoServidor(S, 'm:Amoxicilina')).toBe('gravada pelo A');
    expect(notaNoServidor(S, 'm:Dipirona sódica (Metamizol)')).toBe('gravada pelo B');
    expect(registros(S)['favm|dipirona sódica (metamizol)']).toBe('1');
    await sinc(A.page); await sinc(B.page);
    for (const ap of [A, B]) {
      const n = await notas(ap.page);
      expect([n['m:Amoxicilina'].t, n['m:Dipirona sódica (Metamizol)'].t]).toEqual(['gravada pelo A', 'gravada pelo B']);
      expect(await favoritos(ap.page)).toEqual(['dipirona sódica (metamizol)']);
    }
    await fechar(A, B);
  });

  test('f) sem internet: o login local continua funcionando; aparelho novo e cadastro avisam que precisam de conexão', async ({ browser }, info) => {
    const S = novoServidor();
    const A = await aparelho(browser, info, S), B = await aparelho(browser, info, S);
    await criarAcesso(A.page);
    await sinc(A.page);
    await A.page.evaluate(() => window.BBAuth.sair());
    await semInternet(A, true);
    const chamadas = [];
    A.page.on('request', (r) => { if (/googleapis/.test(r.url())) chamadas.push(r.url()); });
    await A.page.locator('#auth-senha').fill('senha-errada-000');
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth-msg')).toHaveText('E-mail ou senha incorretos.');
    await A.page.locator('#auth-senha').fill(SENHA);
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth')).toBeHidden();
    await abrirMed(A.page, 'Amoxicilina');
    await anotar(A.page, 'anotação feita offline depois do login local');
    await A.page.locator('#detail-fav-btn').click();
    expect(await sinc(A.page)).toBe('Sem internet — será enviado quando voltar');
    // ocultar e voltar ao app sem internet (gatilhos de envio) não tenta falar com a nuvem nem quebra nada
    // (abrir o app do zero sem internet depende do service worker, coberto em pwa.ambos.spec.js)
    await A.page.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pagehide')); });
    await A.page.waitForTimeout(1500);
    await expect(A.page.locator('#note-text')).toHaveValue('anotação feita offline depois do login local');
    expect(chamadas).toEqual([]);
    // aparelho novo, sem internet
    await B.page.goto('/');
    await semInternet(B, true);
    await B.page.locator('#auth-email').fill('novo@exemplo.com');
    await B.page.locator('#auth-senha').fill(SENHA);
    await B.page.locator('#auth-senha2').fill(SENHA);
    await B.page.locator('#auth-ok').click();
    await expect(B.page.locator('#auth-msg')).toContainText('Sem internet. Para criar o acesso é preciso estar conectado');
    await B.page.locator('#auth-ir-entrar').click();
    await B.page.locator('#auth-email').fill(EMAIL);
    await B.page.locator('#auth-senha').fill(SENHA);
    await B.page.locator('#auth-ok').click();
    await expect(B.page.locator('#auth-msg')).toContainText('Sem internet. Este aparelho ainda não tem o seu acesso salvo');
    await expect(B.page.locator('.app')).toBeHidden();
    // a internet volta no A: o que ficou pendente é enviado sozinho
    await semInternet(A, false);
    await expect.poll(() => notaNoServidor(S, 'm:Amoxicilina')).toBe('anotação feita offline depois do login local');
    await fechar(A, B);
  });

  test('g) esqueci a senha: envia o e-mail de redefinição, não apaga nada; a senha nova entra e passa a valer offline', async ({ browser }, info) => {
    test.setTimeout(180000);      // 6 logins com PBKDF2 (210 mil iterações): lento no WebKit com a suíte inteira rodando
    const S = novoServidor();
    const A = await aparelho(browser, info, S);
    await criarAcesso(A.page);
    await abrirMed(A.page, 'Amoxicilina');
    await anotar(A.page, 'não pode sumir');
    await sinc(A.page);
    await A.page.evaluate(() => window.BBAuth.sair());
    await A.page.locator('#auth-esqueci').click();
    await expect(A.page.locator('.auth-h2').first()).toHaveText('Esqueci a senha');
    await expect(A.page.locator('#auth-email')).toHaveValue(EMAIL);
    await expect(A.page.locator('#auth-apagar')).toBeVisible();          // a opção antiga continua, separada
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth-msg')).toContainText('a mensagem com o link chega em alguns minutos');
    expect(S.emails).toEqual([{ tipo: 'PASSWORD_RESET', email: EMAIL }]);
    expect((await notas(A.page))['m:Amoxicilina'].t).toBe('não pode sumir');
    expect(await A.page.evaluate(() => !!localStorage.getItem('bluebook:conta'))).toBe(true);
    // e-mail desconhecido: mesma mensagem (não revela quem tem conta)
    await A.page.locator('#auth-email').fill('ninguem@exemplo.com');
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth-msg')).toContainText('a mensagem com o link chega em alguns minutos');
    // a pessoa redefiniu a senha pelo link do e-mail (no servidor) e volta para entrar
    S.usuarios[EMAIL].senha = 'senha-nova-redefinida-9';
    await A.page.locator('#auth-voltar').click();
    await A.page.locator('#auth-senha').fill(SENHA);                     // a antiga não vale mais na nuvem, mas o aparelho ainda a conhece
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth')).toBeHidden();
    await A.page.evaluate(() => window.BBAuth.sair());
    await A.page.locator('#auth-senha').fill('senha-nova-redefinida-9');
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth')).toBeHidden();
    await A.page.evaluate(() => window.BBAuth.sair());
    await semInternet(A, true);                                          // o hash local foi refeito com a senha nova
    await A.page.locator('#auth-senha').fill('senha-nova-redefinida-9');
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth')).toBeHidden();
    expect((await notas(A.page))['m:Amoxicilina'].t).toBe('não pode sumir');
    await semInternet(A, false);
    // apagar o acesso deste aparelho NÃO apaga o que está na nuvem
    await A.page.evaluate(() => window.BBAuth.sair());
    await A.page.locator('#auth-esqueci').click();
    await A.page.locator('#auth-confirma').fill('APAGAR');
    await A.page.locator('#auth-apagar').click();
    await expect(A.page.locator('.auth-h2')).toHaveText('Criar acesso');
    expect(await A.page.evaluate(() => [localStorage.getItem('bluebook:notes'), localStorage.getItem('bluebook:nuvem'), localStorage.getItem('bluebook:sinc')])).toEqual([null, null, null]);
    expect(notaNoServidor(S, 'm:Amoxicilina')).toBe('não pode sumir');
    await entrarAparelhoNovo(A.page, EMAIL, 'senha-nova-redefinida-9');
    await expect.poll(async () => ((await notas(A.page))['m:Amoxicilina'] || {}).t).toBe('não pode sumir');
    expect(notaNoServidor(S, 'm:Amoxicilina')).toBe('não pode sumir');
    await fechar(A);
  });

  test('cadastro: e-mail já cadastrado e senha fraca têm mensagens claras', async ({ browser }, info) => {
    const S = novoServidor();
    S.usuarios[EMAIL] = { uid: 'u-antigo', senha: 'outra-senha-qualquer-1' };
    const A = await aparelho(browser, info, S);
    await A.page.goto('/');
    await A.page.locator('#auth-email').fill(EMAIL);
    await A.page.locator('#auth-senha').fill(SENHA);
    await A.page.locator('#auth-senha2').fill(SENHA);
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth-msg')).toContainText('Este e-mail já tem acesso');
    await expect(A.page.locator('.app')).toBeHidden();
    expect(await A.page.evaluate(() => localStorage.getItem('bluebook:conta'))).toBeNull();
    // senha recusada pelo servidor
    await A.ctx.route(/identitytoolkit\.googleapis\.com\/v1\/accounts:signUp/, (r) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS, body: '' })
      : r.fulfill({ status: 400, contentType: 'application/json', headers: CORS, body: JSON.stringify({ error: { code: 400, message: 'WEAK_PASSWORD : Password should be at least 6 characters' } }) }));
    await A.page.locator('#auth-email').fill('outro@exemplo.com');
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth-msg')).toContainText('Senha fraca');
    // aparelho novo com senha errada
    await A.page.locator('#auth-ir-entrar').click();
    await A.page.locator('#auth-email').fill(EMAIL);
    await A.page.locator('#auth-senha').fill('senha-errada-000');
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth-msg')).toContainText('E-mail ou senha incorretos');
    await expect(A.page.locator('.app')).toBeHidden();
    await fechar(A);
  });

  test('conta antiga, só do aparelho, é criada na nuvem no login; alterar senha em Ajustes troca também na nuvem', async ({ browser }, info) => {
    const S = novoServidor();
    S.protecao = true;      // Firebase com proteção de enumeração: não diz se o e-mail existe
    const A = await aparelho(browser, info, S);
    await criarAcesso(A.page);
    await abrirMed(A.page, 'Amoxicilina');
    await anotar(A.page, 'nota de antes da nuvem');
    // simula a conta antiga: existe no aparelho, mas não no Firebase
    S.usuarios = {}; S.docs = {};
    await A.page.evaluate(() => { localStorage.removeItem('bluebook:nuvem'); localStorage.removeItem('bluebook:sinc'); window.BBAuth.sair(); });
    await A.page.reload();
    await A.page.locator('#auth-senha').fill(SENHA);
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth')).toBeHidden();
    await expect.poll(() => S.usuarios[EMAIL] && S.usuarios[EMAIL].senha).toBe(SENHA);
    await expect.poll(() => notaNoServidor(S, 'm:Amoxicilina')).toBe('nota de antes da nuvem');
    // alterar senha
    await abrirAjustes(A.page);
    await A.page.locator('#conta-senha-btn').click();
    await A.page.locator('#cs-atual').fill(SENHA);
    await A.page.locator('#cs-nova').fill('nova-senha-teste-456');
    await A.page.locator('#cs-nova2').fill('nova-senha-teste-456');
    await semInternet(A, true);
    await A.page.locator('#cs-salvar').click();
    await expect(A.page.locator('#cs-status')).toContainText('Sem internet: a senha não foi alterada');
    expect(S.usuarios[EMAIL].senha).toBe(SENHA);
    await semInternet(A, false);
    await A.page.locator('#cs-atual').fill(SENHA);
    await A.page.locator('#cs-nova').fill('nova-senha-teste-456');
    await A.page.locator('#cs-nova2').fill('nova-senha-teste-456');
    await A.page.locator('#cs-salvar').click();
    await expect(A.page.locator('#cs-status')).toHaveText('Senha alterada.');
    expect(S.usuarios[EMAIL].senha).toBe('nova-senha-teste-456');
    await A.page.locator('#conta-sair').click();
    await semInternet(A, true);
    await A.page.locator('#auth-senha').fill('nova-senha-teste-456');
    await A.page.locator('#auth-ok').click();
    await expect(A.page.locator('#auth')).toBeHidden();
    await fechar(A);
  });

  test('entrar com o Google: obtém a conta da nuvem pedindo só e-mail/perfil (sem permissão do Drive)', async ({ browser }, info) => {
    const S = novoServidor();
    S.googleEmail = EMAIL;
    const A = await aparelho(browser, info, S);
    await A.ctx.addInitScript(() => { window.__BB_GOOGLE_CLIENT_ID = 'teste.apps.googleusercontent.com'; });
    await A.ctx.route('https://accounts.google.com/gsi/client', (r) => r.fulfill({
      contentType: 'text/javascript',
      body: `window.google = { accounts: { oauth2: {
        initTokenClient: function (c) { window.__escopos = (window.__escopos || []).concat(c.scope); return { requestAccessToken: function () { setTimeout(function () {
          c.callback({ access_token: 'tok-teste', expires_in: 3600 }); }, 10); } }; },
        hasGrantedAllScopes: function () { return true; }, revoke: function (t, cb) { if (cb) cb(); } } } };`,
    }));
    await A.ctx.route('https://www.googleapis.com/**', (route) => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS, body: '' });
      if (new URL(route.request().url()).pathname === '/oauth2/v3/userinfo') return route.fulfill({ contentType: 'application/json', headers: CORS, body: JSON.stringify({ email: EMAIL, email_verified: true }) });
      return route.fulfill({ status: 404, headers: CORS, body: '{}' });
    });
    await A.page.goto('/');
    await A.page.locator('#auth-google').click();
    await expect(A.page.locator('#auth')).toBeHidden();
    expect(await A.page.evaluate(() => window.__escopos)).toEqual(['openid email profile']);
    expect(S.usuarios[EMAIL]).toBeTruthy();
    expect(await A.page.evaluate(() => localStorage.getItem('bluebook:drive'))).toBeNull();
    await abrirMed(A.page, 'Amoxicilina');
    await anotar(A.page, 'nota de quem entrou pelo Google');
    expect(await sinc(A.page)).toMatch(/^Sincronizado às/);
    expect(notaNoServidor(S, 'm:Amoxicilina')).toBe('nota de quem entrou pelo Google');
    // o backup no Drive continua disponível e só então pede a permissão do Drive
    await abrirAjustes(A.page);
    await expect(A.page.locator('#drive-conectar')).toBeVisible();
    await fechar(A);
  });

  test('o campo "Paciente" da prescrição nunca vai para a nuvem', async ({ browser }, info) => {
    const { S, A, B } = await doisAparelhos(browser, info);
    // ordem fixa: B grava o seu paciente primeiro; depois A preenche prescritor e CRM (mudança mais recente)
    await B.page.evaluate(() => localStorage.setItem('bluebook:rxh', JSON.stringify({ pac: 'Paciente do B', pres: '', crm: '' })));
    await sinc(B.page);
    await A.page.waitForTimeout(20);
    await A.page.evaluate(() => localStorage.setItem('bluebook:rxh', JSON.stringify({ pac: 'Fulano de Tal Fictício', pres: 'Dra. Teste', crm: '00000/SP' })));
    await sinc(A.page); await sinc(B.page);
    expect(JSON.stringify(S.docs)).not.toContain('Fulano');
    expect(JSON.stringify(S.docs)).not.toContain('Paciente do B');
    expect(JSON.parse(registros(S)['um|rxh'])).toEqual({ pres: 'Dra. Teste', crm: '00000/SP' });
    expect(await B.page.evaluate(() => JSON.parse(localStorage.getItem('bluebook:rxh')))).toEqual({ pac: 'Paciente do B', pres: 'Dra. Teste', crm: '00000/SP' });
    await fechar(A, B);
  });
});

test.describe('Nuvem NÃO configurada (como no build de teste e em quem não definiu as variáveis)', () => {
  test('h) nenhuma chamada a googleapis/identitytoolkit e nenhuma seção de sincronização', async ({ page }) => {
    const chamadas = [];
    page.on('request', (r) => { if (/googleapis\.com|identitytoolkit|securetoken|firestore/.test(r.url())) chamadas.push(r.url()); });
    await abrir(page);
    expect(await page.evaluate(() => [window.BB_NUVEM, window.BBNuvem.configurado()])).toEqual([null, false]);
    await page.evaluate(() => {
      localStorage.setItem('bluebook:notes', JSON.stringify({ 'm:Amoxicilina': { t: 'nota local', rev: false } }));
      window.dispatchEvent(new Event('online'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(await page.evaluate(() => window.BBNuvem.sincronizar({ busca: true }).then((e) => e.configurado))).toBe(false);
    await page.locator('#more-btn').click();
    await page.locator('#settings-btn').click();
    await expect(page.locator('#settings-conta')).toBeVisible();
    await expect(page.locator('#settings-sinc')).toHaveCount(0);
    await page.waitForTimeout(2500);
    expect(chamadas).toEqual([]);
    expect(await page.evaluate(() => [localStorage.getItem('bluebook:nuvem'), localStorage.getItem('bluebook:sinc')])).toEqual([null, null]);
  });

  test.describe('login sem nuvem', () => {
    test.use({ logado: false });
    test('criar acesso e esqueci a senha continuam locais, sem chamadas externas', async ({ page }) => {
      const chamadas = [];
      page.on('request', (r) => { if (/googleapis\.com|identitytoolkit|securetoken|firestore/.test(r.url())) chamadas.push(r.url()); });
      await page.goto('/');
      await expect(page.locator('#auth-ir-entrar')).toHaveCount(0);
      await page.locator('#auth-email').fill(EMAIL);
      await page.locator('#auth-senha').fill(SENHA);
      await page.locator('#auth-senha2').fill(SENHA);
      await page.locator('#auth-ok').click();
      await expect(page.locator('#auth')).toBeHidden();
      await page.evaluate(() => window.BBAuth.sair());
      await page.locator('#auth-esqueci').click();
      await expect(page.locator('#auth-ok')).toHaveText('Apagar acesso e dados pessoais');
      await page.locator('#auth-voltar').click();
      await page.locator('#auth-senha').fill(SENHA);
      await page.locator('#auth-ok').click();
      await expect(page.locator('#auth')).toBeHidden();
      await page.waitForTimeout(1500);
      expect(chamadas).toEqual([]);
    });
  });
});
