'use strict';
// Navegação no computador (projeto "computador").
const { test, expect, abrir, aba } = require('./apoio');

const MODOS = ['plantao', 'meds', 'diseases', 'scores', 'rx', 'atb', 'vac', 'flux', 'ecg', 'calc', 'lab', 'cid'];

test.describe('Navegação no computador', () => {
  test.beforeEach(async ({ page }) => { await abrir(page); });

  test('abas do topo visíveis e barra inferior oculta', async ({ page }) => {
    await expect(page.locator('.view-tabs')).toBeVisible();
    await expect(page.locator('#tabbar')).toBeHidden();
    await expect(page.locator('#sidebar')).toBeVisible();
    await expect(page.locator('#detail')).toBeVisible();
  });

  test('cada aba abre sua lista', async ({ page }) => {
    for (const m of MODOS) {
      await aba(page, m);
      await expect(page.locator('#sidebar')).not.toBeEmpty();
    }
  });

  test('página inicial mostra a cobertura com as contagens', async ({ page }) => {
    const cov = page.locator('#detail .cov-tot');
    await expect(cov).toContainText('3.226doenças');
    await expect(cov).toContainText('1.851medicamentos');
    await expect(cov).toContainText('2.045categorias CID-10');
    await expect(cov).toContainText('12.451subcategorias CID-10');
  });

  test('atalho "/" foca a busca e Enter abre o primeiro resultado', async ({ page }) => {
    await page.locator('body').press('/');
    await expect(page.locator('#search-input')).toBeFocused();
    await page.keyboard.type('Omeprazol');
    await page.keyboard.press('Enter');
    await expect(page.locator('#detail h2').first()).toHaveText('Omeprazol');
  });

  test('botão Aa alterna o tamanho do texto e lembra a escolha', async ({ page }) => {
    const lbl = page.locator('#fs-lbl');
    await expect(lbl).toHaveText('115%');
    await page.locator('#fs-btn').click();
    await expect(lbl).toHaveText('130%');
    await page.reload();
    await expect(page.locator('#fs-lbl')).toHaveText('130%');
  });

  test('não há botões de editar, excluir ou novo medicamento', async ({ page }) => {
    await page.locator('#search-input').fill('Omeprazol');
    await page.locator('#sidebar .med-item', { hasText: /^Omeprazol/ }).first().click();
    await expect(page.locator('#detail h2').first()).toHaveText('Omeprazol');
    await expect(page.getByRole('button', { name: /^(editar|excluir|novo medicamento|\+ novo)/i })).toHaveCount(0);
  });
});
