'use strict';
// Janela "Ferramentas" (openCalcModal): ficou inacessível na v71 (#calc-btn escondido pelo CSS).
// Desde a v72: botão no cabeçalho (computador) e item na folha "Mais" (celular).
const { test, expect, abrir } = require('./apoio');

async function abrirFerramentas(page, projeto) {
  if (projeto === 'celular') {
    await page.locator('#tabbar [data-tb="more"]').click();
    await page.locator('#sheet [data-tb="tools"]').click();
    await expect(page.locator('#sheet')).toBeHidden();
  } else {
    await expect(page.locator('#calc-btn')).toBeVisible();
    await page.locator('#calc-btn').click();
  }
  await expect(page.locator('#calc-overlay')).toBeVisible();
}

test('janela Ferramentas abre e todas as abas mostram seu painel', async ({ page }, info) => {
  await abrir(page);
  await abrirFerramentas(page, info.project.name);
  const abas = page.locator('#calc-overlay .calc-tab');
  const n = await abas.count();
  expect(n).toBe(10);
  for (let i = 0; i < n; i++) {
    const aba = abas.nth(i);
    const id = await aba.getAttribute('data-tab');
    await aba.click();
    await expect(page.locator('#panel-' + id)).toBeVisible();
  }
});

test('ferramentas calculam: calculadora básica e função renal', async ({ page }, info) => {
  await abrir(page);
  await abrirFerramentas(page, info.project.name);
  for (const k of ['7', '*', '6', '=']) await page.locator(`#bc-keys [data-k="${k}"]`).click();
  await expect(page.locator('#bc-res')).toHaveText('42');
  await page.locator('.calc-tab[data-tab="renal"]').click();
  await page.locator('#rn-age').fill('60');
  await page.locator('#rn-wt').fill('70');
  await page.locator('#rn-cr').fill('1');
  // Cockcroft-Gault, homem: (140-60)*70/(72*1) = 77,8 mL/min
  await expect(page.locator('#rn-out')).toContainText(/77[,.]8/);
});

test('dose pediátrica na janela: escolher medicamento preenche o quadro', async ({ page }, info) => {
  await abrir(page);
  await abrirFerramentas(page, info.project.name);
  await page.locator('.calc-tab[data-tab="ped"]').click();
  await page.locator('#ped-pick-btn').click();
  const item = page.locator('.modal-overlay').last().locator('button, .med-item, [data-ped], li').filter({ hasText: /Amoxicilina/i }).first();
  await item.click();
  await expect(page.locator('#ped-selected')).toContainText(/Amoxicilina/i);
});
