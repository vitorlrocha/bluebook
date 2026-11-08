// Apoio comum aos testes: falha qualquer teste em que o app gere erro de JavaScript.
'use strict';
const base = require('@playwright/test');

/* Conta e sessão de TESTE (valores fictícios, só para os testes; não é a conta de ninguém).
   Desde a Etapa 2 o app abre na tela de login; os testes que não são do login entram já conectados.
   Para testar o login em si: test.use({ logado: false }). */
const EMAIL_TESTE = 'teste@exemplo.com';

const test = base.test.extend({
  logado: [true, { option: true }],
  page: async ({ page, logado }, use) => {
    if (logado) {
      await page.addInitScript((email) => {
        try {
          if (!localStorage.getItem('bluebook:conta')) localStorage.setItem('bluebook:conta', JSON.stringify({ v: 1, email: email, sal: '', hash: '', it: 1 }));
          localStorage.setItem('bluebook:sessao', JSON.stringify({ email: email, ate: Date.now() + 864e5 }));
        } catch (e) { /* página sem armazenamento */ }
      }, EMAIL_TESTE);
    }
    await use(page);
  },
  errosJs: [async ({ page }, use) => {
    const erros = [];
    page.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') erros.push('console.error: ' + m.text()); });
    await use(erros);
    base.expect(erros, 'erros de JavaScript durante o teste').toEqual([]);
  }, { auto: true }],
});

/* Abre o app e espera a biblioteca de medicamentos carregar. */
async function abrir(page) {
  await page.goto('/');
  // No celular a tela inicial esconde a lista; basta ela existir no DOM.
  await base.expect(page.locator('#sidebar .med-item').first()).toBeAttached();
}

/* Vai para uma seção pelas abas do topo (computador). */
async function aba(page, modo) {
  await page.locator(`.view-tab[data-mode="${modo}"]`).click();
  await base.expect(page.locator(`.view-tab[data-mode="${modo}"]`)).toHaveClass(/active/);
}

/* Digita na busca e devolve os nomes dos itens da lista lateral, na ordem. */
async function buscar(page, termo) {
  await page.locator('#search-input').fill(termo);
  const itens = page.locator('#sidebar .med-item .med-item-main');
  await base.expect(itens.first()).toBeVisible();
  return (await itens.evaluateAll((els) => els.map((e) => e.firstChild.textContent.trim())));
}

module.exports = { test, expect: base.expect, abrir, aba, buscar, EMAIL_TESTE };
