'use strict';
// Etapa 5: "Entrar com o Google" e backup no Google Drive (src/google.js), com o Google SIMULADO:
// o script accounts.google.com/gsi/client e a API googleapis.com são respondidos pelo próprio teste.
// Nenhuma conta real, nenhum dado sai da máquina. Valores fictícios.
const { test, expect, EMAIL_TESTE } = require('./apoio');

const SENHA = 'senha-de-teste-123';

// No WebKit (iPhone), o Playwright não intercepta requisições de páginas controladas pelo service worker;
// o SW não é o assunto destes testes (está coberto em pwa.ambos.spec.js), então fica desligado aqui.
test.use({ serviceWorkers: 'block' });

/* Instala o Google falso. Devolve o "Drive" em memória para o teste inspecionar. */
async function simularGoogle(page, { email = EMAIL_TESTE, negar = false } = {}) {
  const drive = { conteudo: null, envios: 0, semToken: 0, email };
  await page.addInitScript(() => { window.__BB_GOOGLE_CLIENT_ID = 'teste.apps.googleusercontent.com'; });
  await page.route('https://accounts.google.com/gsi/client', (r) => r.fulfill({
    contentType: 'text/javascript',
    body: `window.google = { accounts: { oauth2: {
      initTokenClient: function (c) { return { requestAccessToken: function () { setTimeout(function () {
        c.callback(${negar ? "{ error: 'access_denied' }" : "{ access_token: 'tok-teste', expires_in: 3600 }"}); }, 10); } }; },
      hasGrantedAllScopes: function () { return true; },
      revoke: function (t, cb) { if (cb) cb(); } } } };`,
  }));
  // O Safari (WebKit) aplica CORS também às respostas simuladas: responder como a API real responde.
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS' };
  await page.route('https://www.googleapis.com/**', async (route) => {
    const req = route.request(), url = new URL(req.url());
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS, body: '' });
    if (req.headers().authorization !== 'Bearer tok-teste') { drive.semToken++; return route.fulfill({ status: 401, headers: CORS, body: '{}' }); }
    const json = (o) => route.fulfill({ contentType: 'application/json', headers: CORS, body: JSON.stringify(o) });
    if (url.pathname === '/oauth2/v3/userinfo') return json({ email: drive.email, email_verified: true });
    if (url.pathname === '/drive/v3/files' && req.method() === 'GET') return json({ files: drive.conteudo ? [{ id: 'arq1' }] : [] });
    if (url.pathname === '/upload/drive/v3/files' && req.method() === 'POST') {
      const partes = req.postData().split(/\r\n\r\n/);
      drive.conteudo = JSON.parse(partes[2].split('\r\n--')[0]); drive.envios++;
      return json({ id: 'arq1' });
    }
    if (url.pathname === '/upload/drive/v3/files/arq1' && req.method() === 'PATCH') { drive.conteudo = JSON.parse(req.postData()); drive.envios++; return json({ id: 'arq1' }); }
    if (url.pathname === '/drive/v3/files/arq1' && url.searchParams.get('alt') === 'media') return json(drive.conteudo);
    return route.fulfill({ status: 404, headers: CORS, body: '{}' });
  });
  return drive;
}
async function abrirAjustes(page) { await page.locator('#more-btn').click(); await page.locator('#settings-btn').click(); }
async function anotar(page, texto) {
  await page.evaluate((t) => { const n = JSON.parse(localStorage.getItem('bluebook:notes') || '{}'); n['m:Amoxicilina'] = { t, rev: false }; localStorage.setItem('bluebook:notes', JSON.stringify(n)); }, texto);
}
async function sairDoApp(page) {   // simula trocar de app/fechar: dispara o salvamento automático
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
}

test.describe('Entrar com o Google', () => {
  test.use({ logado: false });

  test('sem uso do Google, o app nunca chama os servidores do Google', async ({ page }) => {
    const google = [];
    page.on('request', (r) => { if (/google/.test(new URL(r.url()).hostname)) google.push(r.url()); });
    await page.goto('/');
    await expect(page.locator('#auth .auth-card')).toBeVisible();
    await page.waitForTimeout(500);
    expect(google).toEqual([]);
  });

  test('primeiro acesso pelo Google: entra, liga o Drive; senha só depois de definida', async ({ page }) => {
    const drive = await simularGoogle(page, { email: 'medico@exemplo.com' });
    await page.goto('/');
    await expect(page.locator('#auth-google')).toBeEnabled();
    await page.locator('#auth-google').click();
    await expect(page.locator('#auth')).toBeHidden();
    await expect(page.locator('.app')).toBeVisible();
    const c = await page.evaluate(() => JSON.parse(localStorage.getItem('bluebook:conta')));
    expect(c).toMatchObject({ email: 'medico@exemplo.com', google: true });
    expect(c.hash).toBeUndefined();
    // backup automático logo após entrar
    await expect.poll(() => drive.envios, { timeout: 8000 }).toBeGreaterThan(0);
    expect(drive.conteudo).toMatchObject({ tipo: 'bluebook-perfil', email: 'medico@exemplo.com' });
    // sem senha: entrar por senha explica o motivo
    await page.evaluate(() => window.BBAuth.sair());
    await page.locator('#auth-senha').fill('qualquer-coisa-123');
    await page.locator('#auth-ok').click();
    await expect(page.locator('#auth-msg')).toContainText('criado com o Google');
    // define a senha em Ajustes e passa a entrar sem internet
    await page.locator('#auth-google').click();
    await expect(page.locator('#auth')).toBeHidden();
    await abrirAjustes(page);
    await expect(page.locator('#conta-senha-btn')).toHaveText('Definir senha (para entrar sem internet)');
    await page.locator('#conta-senha-btn').click();
    await expect(page.locator('#cs-atual')).toHaveCount(0);
    await page.locator('#cs-nova').fill(SENHA);
    await page.locator('#cs-nova2').fill(SENHA);
    await page.locator('#cs-salvar').click();
    await expect(page.locator('#cs-status')).toContainText('Senha definida');
    await page.locator('#conta-sair').click();
    await page.context().setOffline(true);
    await page.locator('#auth-senha').fill(SENHA);
    await page.locator('#auth-ok').click();
    await expect(page.locator('#auth')).toBeHidden();
  });

  test('Google de outro e-mail não entra num aparelho que já tem acesso', async ({ page }) => {
    await simularGoogle(page, { email: 'outra.pessoa@exemplo.com' });
    await page.goto('/');
    await page.locator('#auth-email').fill('medico@exemplo.com');
    await page.locator('#auth-senha').fill(SENHA);
    await page.locator('#auth-senha2').fill(SENHA);
    await page.locator('#auth-ok').click();
    await expect(page.locator('#auth')).toBeHidden();
    await page.evaluate(() => window.BBAuth.sair());
    await page.locator('#auth-google').click();
    await expect(page.locator('#auth-msg')).toContainText('já tem o acesso de medico@exemplo.com');
    await expect(page.locator('.app')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('bluebook:drive'))).toBeNull();
  });

  test('acesso negado no Google mostra mensagem e não entra', async ({ page }) => {
    await simularGoogle(page, { negar: true });
    await page.goto('/');
    await page.locator('#auth-google').click();
    await expect(page.locator('#auth-msg')).toHaveText('Acesso ao Google não autorizado.');
    await expect(page.locator('.app')).toBeHidden();
  });
});

test.describe('Backup no Google Drive', () => {
  test('conectar em Ajustes faz o 1º backup; e-mail diferente é recusado', async ({ page }) => {
    const drive = await simularGoogle(page, { email: 'outra.pessoa@exemplo.com' });
    await page.goto('/');
    await abrirAjustes(page);
    await page.locator('#drive-conectar').click();
    await expect(page.locator('#drive-msg')).toContainText('é diferente da conta do Bluebook');
    expect(drive.envios).toBe(0);
    drive.email = EMAIL_TESTE;
    await page.locator('#drive-conectar').click();
    await expect(page.locator('#drive-msg')).toHaveText('Conectado. Backup feito.');
    await expect(page.locator('#drive-status')).toContainText('em dia');
    expect(drive.envios).toBe(1);
    expect(JSON.stringify(drive.conteudo)).not.toMatch(/hash|senha/);
  });

  test('salvamento automático: mudança vai sozinha; sem internet espera e envia quando volta', async ({ page, context }) => {
    const drive = await simularGoogle(page);
    await page.goto('/');
    await abrirAjustes(page);
    await page.locator('#drive-conectar').click();
    await expect(page.locator('#drive-msg')).toHaveText('Conectado. Backup feito.');
    await anotar(page, 'primeira nota');
    await sairDoApp(page);
    await expect.poll(() => drive.conteudo && drive.conteudo.dados['bluebook:notes'] || '').toContain('primeira nota');
    // sem internet
    await context.setOffline(true);
    await anotar(page, 'nota offline');
    await sairDoApp(page);
    await page.waitForTimeout(500);
    expect(drive.conteudo.dados['bluebook:notes']).not.toContain('nota offline');
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect.poll(() => drive.conteudo.dados['bluebook:notes']).toContain('nota offline');
  });

  test('acesso do Google expirado: aparece "Sincronizar" e um toque envia', async ({ page }) => {
    const drive = await simularGoogle(page);
    await page.clock.install();
    await page.goto('/');
    await abrirAjustes(page);
    await page.locator('#drive-conectar').click();
    await expect(page.locator('#drive-msg')).toHaveText('Conectado. Backup feito.');
    await page.locator('#settings-close').click();
    await page.clock.fastForward('02:00:00');      // token de ~1 h vence
    await anotar(page, 'depois de 2 horas');
    await page.clock.fastForward('00:00:30');      // passa o intervalo do salvamento automático
    await expect(page.locator('#drive-aviso')).toBeVisible();
    await expect(page.locator('#drive-aviso')).toContainText('Backup no Google Drive pendente');
    await page.locator('#drive-sync').click();
    await expect.poll(() => drive.conteudo.dados['bluebook:notes']).toContain('depois de 2 horas');
    await expect(page.locator('#drive-aviso')).toBeHidden();
  });

  test('restaurar do Drive traz o perfil de volta', async ({ page }) => {
    const drive = await simularGoogle(page);
    await page.goto('/');
    await anotar(page, 'nota que vai para o Drive');
    await page.reload();
    await abrirAjustes(page);
    await page.locator('#drive-conectar').click();
    await expect(page.locator('#drive-msg')).toHaveText('Conectado. Backup feito.');
    expect(drive.conteudo.dados['bluebook:notes']).toContain('nota que vai para o Drive');
    await page.evaluate(() => localStorage.removeItem('bluebook:notes'));
    page.once('dialog', (d) => d.accept());
    await page.locator('#drive-restaurar').click();
    await page.waitForEvent('load');
    expect(await page.evaluate(() => localStorage.getItem('bluebook:notes'))).toContain('nota que vai para o Drive');
  });

  test('aviso de LGPD na seção do Drive', async ({ page }) => {
    await simularGoogle(page);
    await page.goto('/');
    await abrirAjustes(page);
    await expect(page.locator('#settings-drive')).toContainText('Não escreva nas anotações nome ou dados que identifiquem pacientes');
  });
});
