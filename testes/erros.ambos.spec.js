'use strict';
// Percorre todas as seções e abre o primeiro item de cada uma, no computador e no celular.
// O fixture automático em apoio.js falha o teste se houver erro de JavaScript no console.
const { test, expect, abrir } = require('./apoio');

const MODOS = ['plantao', 'meds', 'diseases', 'scores', 'rx', 'atb', 'vac', 'flux', 'ecg', 'calc', 'lab', 'cid'];

test('nenhum erro de JavaScript ao percorrer todas as seções', async ({ page }) => {
  await abrir(page);
  for (const m of MODOS) {
    // Usa a função de navegação do próprio app (funciona igual no celular e no computador).
    await page.locator(`.view-tab[data-mode="${m}"]`).dispatchEvent('click');
    await expect(page.locator(`.view-tab[data-mode="${m}"]`)).toHaveClass(/active/);
    const item = page.locator('#sidebar .med-item').first();
    if (await item.count()) {
      await item.dispatchEvent('click');
      await expect(page.locator('#detail')).not.toBeEmpty();
    }
  }
  await page.locator('#search-input').fill('dor');
  await expect(page.locator('#sidebar .gs-box')).toBeAttached();   // no celular o detalhe aberto cobre a lista
});

// O modal "Calculadoras" só abre pelo #calc-btn, que o CSS esconde (já era assim na v71).
// O clique é disparado direto no botão para garantir que o código do modal continua sem erros.
test('modal de calculadoras: todas as abas abrem sem erro', async ({ page }) => {
  await abrir(page);
  await page.locator('#calc-btn').dispatchEvent('click');
  const abas = page.locator('.calc-tab');
  const n = await abas.count();
  expect(n).toBeGreaterThan(5);
  for (let i = 0; i < n; i++) {
    await abas.nth(i).dispatchEvent('click');
    await expect(abas.nth(i)).toHaveClass(/active/);
  }
});
