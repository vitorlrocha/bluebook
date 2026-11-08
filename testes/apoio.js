// Apoio comum aos testes: falha qualquer teste em que o app gere erro de JavaScript.
'use strict';
const base = require('@playwright/test');

const test = base.test.extend({
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

module.exports = { test, expect: base.expect, abrir, aba, buscar };
