'use strict';
const { test, expect, abrir } = require('./apoio');

const tb = (page, k) => page.locator(`#tabbar [data-tb="${k}"]`);

test.describe('Navegação no celular', () => {
  test.beforeEach(async ({ page }) => { await abrir(page); });

  test('barra inferior visível e abas do topo ocultas', async ({ page }) => {
    await expect(page.locator('#tabbar')).toBeVisible();
    await expect(page.locator('.view-tabs')).toBeHidden();
    await expect(tb(page, 'home')).toHaveClass(/\bon\b/);
  });

  test('Plantão, Doenças, Remédios e Início pela barra inferior', async ({ page }) => {
    await tb(page, 'plantao').click();
    await expect(tb(page, 'plantao')).toHaveClass(/\bon\b/);
    await expect(page.locator('#detail h2')).toHaveText('Parada cardiorrespiratória');

    await tb(page, 'diseases').click();
    await expect(tb(page, 'diseases')).toHaveClass(/\bon\b/);
    await expect(page.locator('.view-tab[data-mode="diseases"]')).toHaveClass(/active/);

    await tb(page, 'meds').click();
    await expect(page.locator('body')).not.toHaveClass(/bb-home/);
    await expect(page.locator('#sidebar .med-item').first()).toBeVisible();

    await tb(page, 'home').click();
    await expect(page.locator('body')).toHaveClass(/bb-home/);
    await expect(page.locator('#detail .home-quick')).toBeVisible();
  });

  // PROBLEMA CONHECIDO (v71): ao tocar em "Remédios" sem medicamento aberto, a barra destaca
  // "Início", porque sync() considera "meds sem seleção e sem busca" como tela inicial.
  // test.fail: passa enquanto o problema existir e avisa quando for corrigido.
  test('"Remédios" deveria ficar destacado ao abrir a lista', async ({ page }) => {
    test.fail(true, 'Destaque da barra inferior: Remédios x Início');
    await tb(page, 'meds').click();
    await expect(tb(page, 'meds')).toHaveClass(/\bon\b/, { timeout: 2000 });
  });

  test('menu "Mais" abre a folha, navega e fecha', async ({ page }) => {
    const folha = page.locator('#sheet');
    await expect(folha).toBeHidden();
    await tb(page, 'more').click();
    await expect(folha).toBeVisible();
    await folha.locator('[data-tb="cid"]').click();
    await expect(folha).toBeHidden();
    await expect(tb(page, 'more')).toHaveClass(/\bon\b/);
    await expect(page.locator('.view-tab[data-mode="cid"]')).toHaveClass(/active/);

    await tb(page, 'more').click();
    await folha.locator('[data-tb="close"]').click();
    await expect(folha).toBeHidden();
  });

  test('abrir item mostra o detalhe e "Voltar" retorna à lista', async ({ page }) => {
    await tb(page, 'meds').click();
    await page.locator('#search-input').fill('Omeprazol');
    await page.locator('#sidebar .med-item', { hasText: /^Omeprazol/ }).first().click();
    await expect(page.locator('body')).toHaveClass(/showing-detail/);
    await expect(page.locator('#detail h2').first()).toHaveText('Omeprazol');
    await page.locator('#back-btn').click();
    await expect(page.locator('body')).not.toHaveClass(/showing-detail/);
    await expect(page.locator('#sidebar')).toBeVisible();
  });

  test('cada item da folha "Mais" abre sem erro', async ({ page }) => {
    for (const k of ['calc', 'scores', 'cid', 'atb', 'flux', 'ecg', 'lab', 'vac', 'rx']) {
      await tb(page, 'more').click();
      await page.locator(`#sheet [data-tb="${k}"]`).click();
      await expect(page.locator('#sheet')).toBeHidden();
      await expect(page.locator(`.view-tab[data-mode="${k}"]`)).toHaveClass(/active/);
    }
  });
});
