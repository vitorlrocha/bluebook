'use strict';
// Acessibilidade: auditoria axe-core (WCAG 2.1 A/AA) nas telas principais, em tema claro e escuro,
// navegação por teclado (Esc, foco), botão Aa e legibilidade dos campos.
const AxeBuilder = require('@axe-core/playwright').default;
const { test, expect, abrir } = require('./apoio');

const TELAS = {
  inicio: async () => {},
  ficha: async (page) => { await page.locator('#search-input').fill('Dipirona sódica'); await page.locator('#sidebar .med-item[data-id]').first().dispatchEvent('click'); },
  doenca: async (page) => {
    await page.locator('.view-tab[data-mode="diseases"]').dispatchEvent('click');
    await page.locator('#search-input').fill('IAM');
    await page.locator('#sidebar .med-item[data-idx]').first().dispatchEvent('click');
  },
  plantao: async (page) => { await page.locator('.view-tab[data-mode="plantao"]').dispatchEvent('click'); await page.locator('#sidebar [data-pl="pcr"]').dispatchEvent('click'); },
  escore: async (page) => { await page.locator('.view-tab[data-mode="scores"]').dispatchEvent('click'); await page.locator('#sidebar [data-score="curb65"]').dispatchEvent('click'); },
  cid: async (page) => { await page.locator('.view-tab[data-mode="cid"]').dispatchEvent('click'); await page.locator('#search-input').fill('J189'); await page.locator('#sidebar .med-item').first().dispatchEvent('click'); },
  busca: async (page) => { await page.locator('#search-input').fill('pneumonia'); },
};

for (const tema of ['light', 'dark']) {
  test.describe(`axe WCAG 2.1 AA (${tema})`, () => {
    test.use({ colorScheme: tema });
    for (const [nome, preparar] of Object.entries(TELAS)) {
      test(nome, async ({ page }) => {
        await abrir(page);
        await preparar(page);
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const resumo = r.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
        expect(resumo).toEqual([]);
      });
    }
  });
}

test.describe('Teclado e leitura', () => {
  test('Esc fecha o menu ⋮ e devolve o foco ao botão', async ({ page }, info) => {
    test.skip(info.project.name !== 'computador', 'menu ⋮ do cabeçalho');
    await abrir(page);
    await page.locator('#more-btn').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#more-menu')).toBeVisible();
    await expect(page.locator('#more-btn')).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator('#more-menu')).toBeHidden();
    await expect(page.locator('#more-btn')).toBeFocused();
  });

  test('folha "Mais": teclado abre com foco no 1º item e Esc fecha', async ({ page }, info) => {
    test.skip(info.project.name !== 'celular', 'barra inferior só no celular');
    await abrir(page);
    await page.locator('#tabbar [data-tb="more"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#sheet')).toBeVisible();
    await expect(page.locator('#sheet [data-tb="calc"]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#sheet')).toBeHidden();
    await expect(page.locator('#tabbar [data-tb="more"]')).toBeFocused();
  });

  test('Esc fecha janela modal', async ({ page }) => {
    await abrir(page);
    await page.locator('#calc-btn').dispatchEvent('click');
    await expect(page.locator('#calc-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#calc-overlay')).toHaveCount(0);
  });

  test('botão Aa: nome acessível contém o texto visível e o tamanho atual', async ({ page }) => {
    await abrir(page);
    const btn = page.locator('#fs-btn');
    await expect(btn).toHaveAttribute('aria-label', /Aa 115%/);
    await btn.dispatchEvent('click');
    await expect(btn).toHaveAttribute('aria-label', /Aa 130%/);
  });

  test('no maior tamanho de texto (145%) não há rolagem horizontal', async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('bluebook:zoom', '1.45'); } catch (e) {} });
    await abrir(page);
    await expect(page.locator('#fs-lbl')).toHaveText('145%');
    for (const m of ['meds', 'plantao', 'diseases']) {
      await page.locator(`.view-tab[data-mode="${m}"]`).dispatchEvent('click');
      await page.locator('#sidebar .med-item').first().dispatchEvent('click');
      const larg = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, tela: document.documentElement.clientWidth }));
      expect(larg.doc, `rolagem horizontal em ${m}`).toBeLessThanOrEqual(larg.tela + 1);
    }
  });

  test('campos de seleção legíveis no tema escuro (texto ≠ fundo)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await abrir(page);
    await page.locator('#search-input').fill('Dipirona sódica');
    await page.locator('#sidebar .med-item[data-id]').first().dispatchEvent('click');
    const cores = await page.evaluate(() => ['fp-via', 'fp-ap'].map((id) => { const cs = getComputedStyle(document.getElementById(id)); return [cs.color, cs.backgroundColor]; }));
    for (const [cor, fundo] of cores) expect(cor).not.toBe(fundo);
  });
});
