'use strict';
const { test, expect, abrir, aba, buscar } = require('./apoio');

test.describe('CID-10', () => {
  test.beforeEach(async ({ page }) => { await abrir(page); await aba(page, 'cid'); });

  for (const codigo of ['J18.9', 'J189']) {
    test(`código "${codigo}" encontra a categoria J18 e a subcategoria J18.9`, async ({ page }) => {
      const nomes = await buscar(page, codigo);
      expect(nomes[0]).toMatch(/^J18 — Pneumonia/);
      await page.locator('#sidebar .med-item').first().click();
      await expect(page.locator('#detail h2')).toHaveText(/^J18 — /);
      await expect(page.locator('#detail')).toContainText('J18.9 — Pneumonia não especificada');
      await expect(page.locator('#detail')).toContainText('Capítulo X (J00-J99)');
    });
  }

  test('busca por descrição encontra o código', async ({ page }) => {
    const nomes = await buscar(page, 'apendicite aguda');
    expect(nomes.some((n) => n.startsWith('K35 — '))).toBe(true);
  });

  test('tabela completa: 2.045 categorias na lista', async ({ page }) => {
    await expect(page.locator('#sidebar .med-item')).toHaveCount(2045);
  });

  test('ficha de doença leva ao CID pelo link do código', async ({ page }) => {
    await aba(page, 'diseases');
    await buscar(page, 'Pneumonia adquirida na comunidade (PAC)');
    await page.locator('#sidebar .med-item', { hasText: 'Pneumonia adquirida na comunidade (PAC)' }).first().click();
    await page.locator('#detail .cid-go', { hasText: 'J18.9' }).click();
    await expect(page.locator('.view-tab[data-mode="cid"]')).toHaveClass(/active/);
    await expect(page.locator('#detail h2')).toHaveText(/^J18 — /);
  });
});
