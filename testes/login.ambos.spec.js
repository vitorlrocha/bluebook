'use strict';
// Etapa 2: acesso local com e-mail e senha (src/auth.js). Valores FICTÍCIOS de teste.
const path = require('path');
const fs = require('fs');
const AxeBuilder = require('@axe-core/playwright').default;
const { test, expect } = require('./apoio');

test.use({ logado: false });

const EMAIL = 'medico@exemplo.com';
const SENHA = 'senha-de-teste-123';

async function irParaLogin(page) {
  await page.goto('/');
  await expect(page.locator('#auth .auth-card')).toBeVisible();
}
async function criarAcesso(page, { email = EMAIL, senha = SENHA, manter = true } = {}) {
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-senha').fill(senha);
  await page.locator('#auth-senha2').fill(senha);
  if (!manter) await page.locator('#auth-manter').uncheck();
  await page.locator('#auth-ok').click();
  await expect(page.locator('#auth')).toBeHidden();
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
}
async function abrirAjustes(page) {
  await page.locator('#more-btn').click();
  await page.locator('#settings-btn').click();
}
async function entrar(page, senha = SENHA) {
  await page.locator('#auth-senha').fill(senha);
  await page.locator('#auth-ok').click();
}

test.describe('Login local', () => {
  test('primeiro acesso: app escondido até criar o acesso; dados já salvos passam para o e-mail', async ({ page }) => {
    await irParaLogin(page);
    await expect(page.locator('#auth-titulo')).toHaveText('Bluebook');
    await expect(page.locator('.auth-h2')).toHaveText('Criar acesso');
    await expect(page.locator('.app')).toBeHidden();
    // dados pessoais que já existiam no aparelho antes do login
    await page.evaluate(() => localStorage.setItem('bluebook:notes', JSON.stringify({ 'm:Amoxicilina': { t: 'nota antiga', rev: false } })));
    await page.reload();
    await criarAcesso(page);
    await expect(page.locator('.app')).toBeVisible();
    await abrirAjustes(page);
    await expect(page.locator('#conta-email')).toHaveText(EMAIL);
    await expect(page.locator('#settings-conta')).toContainText('1 anotação(ões)');
  });

  test('validações do cadastro', async ({ page }) => {
    await irParaLogin(page);
    await page.locator('#auth-email').fill('sem-arroba');
    await page.locator('#auth-ok').click();
    await expect(page.locator('#auth-msg')).toHaveText('Informe um e-mail válido.');
    await page.locator('#auth-email').fill(EMAIL);
    await page.locator('#auth-senha').fill('curta');
    await page.locator('#auth-ok').click();
    await expect(page.locator('#auth-msg')).toHaveText('A senha precisa ter pelo menos 8 caracteres.');
    await page.locator('#auth-senha').fill(SENHA);
    await page.locator('#auth-senha2').fill(SENHA + 'x');
    await page.locator('#auth-ok').click();
    await expect(page.locator('#auth-msg')).toHaveText('As senhas não conferem.');
    await expect(page.locator('.app')).toBeHidden();
  });

  test('a senha não é guardada; só o hash PBKDF2 com sal', async ({ page }) => {
    await irParaLogin(page);
    await criarAcesso(page);
    const tudo = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)) + JSON.stringify(Object.assign({}, sessionStorage)));
    expect(tudo).not.toContain(SENHA);
    const c = await page.evaluate(() => JSON.parse(localStorage.getItem('bluebook:conta')));
    expect(c.email).toBe(EMAIL);
    expect(c.it).toBe(210000);
    expect(Buffer.from(c.hash, 'base64').length).toBe(32);
    expect(Buffer.from(c.sal, 'base64').length).toBe(16);
  });

  test('sair pelo menu ⋮ e entrar de novo; senha errada é recusada', async ({ page }) => {
    await irParaLogin(page);
    await criarAcesso(page);
    await page.locator('#more-btn').click();
    await expect(page.locator('#logout-btn')).toHaveText('Sair (' + EMAIL + ')');
    await page.locator('#logout-btn').click();
    await expect(page.locator('.auth-h2')).toHaveText('Entrar');
    await expect(page.locator('.app')).toBeHidden();
    await expect(page.locator('#auth-email')).toHaveValue(EMAIL);
    await entrar(page, 'senha-errada-000');
    await expect(page.locator('#auth-msg')).toHaveText('E-mail ou senha incorretos.');
    await expect(page.locator('#auth-senha')).toHaveValue('');
    await entrar(page);
    await expect(page.locator('#auth')).toBeHidden();
    await expect(page.locator('.app')).toBeVisible();
  });

  test('outro e-mail com a senha certa é recusado', async ({ page }) => {
    await irParaLogin(page);
    await criarAcesso(page);
    await page.evaluate(() => window.BBAuth.sair());
    await page.locator('#auth-email').fill('outra.pessoa@exemplo.com');
    await entrar(page);
    await expect(page.locator('#auth-msg')).toHaveText('E-mail ou senha incorretos.');
  });

  test('5 tentativas erradas bloqueiam por 30 s', async ({ page }) => {
    await irParaLogin(page);
    await criarAcesso(page);
    await page.evaluate(() => window.BBAuth.sair());
    for (let i = 0; i < 4; i++) { await entrar(page, 'errada-' + i + '-xxxx'); await expect(page.locator('#auth-msg')).toHaveText('E-mail ou senha incorretos.'); }
    await entrar(page, 'errada-5-xxxx');
    await expect(page.locator('#auth-msg')).toContainText('Muitas tentativas');
    await entrar(page); // mesmo a senha certa espera
    await expect(page.locator('#auth-msg')).toContainText('Aguarde');
    await expect(page.locator('.app')).toBeHidden();
  });

  test('"manter conectado": sessão continua ao reabrir; sem ele, uma aba nova pede login', async ({ page, context }) => {
    await irParaLogin(page);
    await criarAcesso(page);
    await page.reload();
    await expect(page.locator('#auth')).toBeHidden();
    await expect(page.locator('.app')).toBeVisible();
    await page.evaluate(() => window.BBAuth.sair());
    await page.locator('#auth-manter').uncheck();
    await entrar(page);
    await expect(page.locator('#auth')).toBeHidden();
    const outra = await context.newPage();
    await outra.goto('/');
    await expect(outra.locator('.auth-h2')).toHaveText('Entrar');
    await expect(outra.locator('.app')).toBeHidden();
  });

  test('esqueci a senha: apaga acesso e dados pessoais, mantém o conteúdo clínico', async ({ page }) => {
    await irParaLogin(page);
    await criarAcesso(page);
    await page.evaluate(() => localStorage.setItem('bluebook:notes', JSON.stringify({ 'm:Amoxicilina': { t: 'nota' } })));
    await page.evaluate(() => window.BBAuth.sair());
    await page.locator('#auth-esqueci').click();
    await expect(page.locator('.auth-h2')).toHaveText('Esqueci a senha');
    await page.locator('#auth-confirma').fill('apagar não');
    await page.locator('#auth-ok').click();
    await expect(page.locator('#auth-msg')).toHaveText('Digite APAGAR para confirmar.');
    await page.locator('#auth-confirma').fill('APAGAR');
    await page.locator('#auth-ok').click();
    await expect(page.locator('.auth-h2')).toHaveText('Criar acesso');
    await expect(page.locator('#auth-msg')).toHaveText('Acesso e dados pessoais apagados. Crie um acesso novo.');
    expect(await page.evaluate(() => [localStorage.getItem('bluebook:conta'), localStorage.getItem('bluebook:notes')])).toEqual([null, null]);
    await criarAcesso(page, { email: 'novo@exemplo.com' });
    expect(await page.locator('#sidebar .med-item').count()).toBeGreaterThan(1000);
  });

  test('alterar senha em Ajustes', async ({ page }) => {
    await irParaLogin(page);
    await criarAcesso(page);
    await abrirAjustes(page);
    await page.locator('#conta-senha-btn').click();
    await page.locator('#cs-atual').fill('nao-e-esta-000');
    await page.locator('#cs-nova').fill('nova-senha-teste-456');
    await page.locator('#cs-nova2').fill('nova-senha-teste-456');
    await page.locator('#cs-salvar').click();
    await expect(page.locator('#cs-status')).toHaveText('A senha atual está incorreta.');
    await page.locator('#cs-atual').fill(SENHA);
    await page.locator('#cs-salvar').click();
    await expect(page.locator('#cs-status')).toHaveText('Senha alterada.');
    await page.locator('#conta-sair').click();
    await entrar(page);
    await expect(page.locator('#auth-msg')).toHaveText('E-mail ou senha incorretos.');
    await entrar(page, 'nova-senha-teste-456');
    await expect(page.locator('#auth')).toBeHidden();
  });

  test('backup do perfil: leva o e-mail, não leva a senha; outro e-mail é recusado', async ({ page }) => {
    await irParaLogin(page);
    await criarAcesso(page);
    await page.evaluate(() => localStorage.setItem('bluebook:notes', JSON.stringify({ 'm:Amoxicilina': { t: 'nota do perfil' } })));
    await page.reload();
    await abrirAjustes(page);
    const espera = page.waitForEvent('download');
    await page.locator('#perfil-export').click();
    const dl = await espera;
    const texto = fs.readFileSync(await dl.path(), 'utf8');
    const p = JSON.parse(texto);
    expect(p.tipo).toBe('bluebook-perfil');
    expect(p.email).toBe(EMAIL);
    expect(JSON.parse(p.dados['bluebook:notes'])['m:Amoxicilina'].t).toBe('nota do perfil');
    expect(texto).not.toMatch(/hash|sal"|senha-de-teste/);
    // outro e-mail
    const outro = Object.assign({}, p, { email: 'outra.pessoa@exemplo.com' });
    await page.locator('#perfil-file').setInputFiles({ name: 'p.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(outro)) });
    await expect(page.locator('#perfil-status')).toContainText('pertence a outra.pessoa@exemplo.com');
    // mesmo e-mail: restaura a anotação apagada
    await page.evaluate(() => localStorage.removeItem('bluebook:notes'));
    await page.locator('#perfil-file').setInputFiles({ name: 'p.json', mimeType: 'application/json', buffer: Buffer.from(texto) });
    await expect(page.locator('#perfil-status')).toContainText('Perfil importado');
    await page.waitForLoadState('load');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('bluebook:notes'))).toContain('nota do perfil');
  });

  test('"Entrar com o Google" aparece, desativado até a publicação', async ({ page }) => {
    await irParaLogin(page);
    await expect(page.locator('#auth-google')).toBeVisible();
    await expect(page.locator('#auth-google')).toBeDisabled();
    await expect(page.locator('#auth-google-nota')).toHaveText('Disponível depois que o app for publicado na internet.');
  });

  test('funciona aberto direto do arquivo (file://, offline)', async ({ page }) => {
    await page.goto('file://' + path.join(__dirname, '..', 'dist', 'index.html').replace(/\\/g, '/'));
    await expect(page.locator('#auth .auth-card')).toBeVisible();
    await criarAcesso(page);
    await expect(page.locator('.app')).toBeVisible();
  });

  for (const tema of ['light', 'dark']) {
    test(`acessibilidade (axe) e aparência da tela de login — ${tema}`, async ({ page }, info) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.clock.setFixedTime(new Date('2026-11-07T10:00:00-03:00'));
      await irParaLogin(page);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(r.violations.map((v) => v.id + ': ' + v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', '))).toEqual([]);
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      await expect(page).toHaveScreenshot(`login-criar-${tema}.png`, { threshold: 0, maxDiffPixels: 40 });
      await criarAcesso(page);
      await page.evaluate(() => window.BBAuth.sair());
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      await expect(page).toHaveScreenshot(`login-entrar-${tema}.png`, { threshold: 0, maxDiffPixels: 40 });
    });
  }
});
