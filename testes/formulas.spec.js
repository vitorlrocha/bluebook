'use strict';
// Aba "Fórmulas clínicas": calculadoras novas do lote 01 (curadoria/calcs-lote-01.js).
// Os valores esperados saem da própria fórmula publicada (conta feita à mão no comentário).
const { test, expect, abrir } = require('./apoio');

async function abrirCalc(page, id) {
  await page.locator('#tab-calc').click();
  await page.locator(`#sidebar .med-item[data-ref="${id}"]`).click();
  await expect(page.locator('#calc-out')).toHaveText('Preencha os campos.');
}
async function preencher(page, campos) {
  for (const [k, v] of Object.entries(campos)) {
    const el = page.locator(`#detail [data-cf="${k}"]`);
    if (await el.evaluate((e) => e.tagName === 'SELECT')) await el.selectOption(v); else await el.fill(v);
  }
}

test.describe('Fórmulas clínicas — lote 01', () => {
  test.beforeEach(async ({ page }) => { await abrir(page); });

  test('Schwartz, Holliday-Segar e Parkland', async ({ page }) => {
    await abrirCalc(page, 'k-schwartz');
    await preencher(page, { alt: '120', cr: '0,5' });
    await expect(page.locator('#calc-out')).toContainText('99,1 mL/min');       // 0,413 × 120 ÷ 0,5
    await abrirCalc(page, 'k-hs');
    await preencher(page, { peso: '25' });
    await expect(page.locator('#calc-out')).toContainText('1600 mL/dia');       // 1.500 + 20 × 5
    await expect(page.locator('#calc-out')).toContainText('65 mL/h');           // 40 + 20 + 5
    await abrirCalc(page, 'k-parkland');
    await preencher(page, { peso: '70', scq: '30', ml: '4' });
    await expect(page.locator('#calc-out')).toContainText('8400 mL em 24 h');   // 4 × 70 × 30
  });

  test('Adrogué-Madias, Winter e delta gap', async ({ page }) => {
    await abrirCalc(page, 'k-adrogue');
    await preencher(page, { peso: '70', na: '120', sexo: 'm', idoso: 'n', sol: '513|0' });
    await expect(page.locator('#calc-out')).toContainText('+9,1 mEq/L');        // (513 − 120) ÷ (42 + 1)
    await abrirCalc(page, 'k-winter');
    await preencher(page, { hco3: '12' });
    await expect(page.locator('#calc-out')).toContainText('24–28 mmHg');        // 1,5 × 12 + 8 ± 2
    await abrirCalc(page, 'k-deltagap');
    await preencher(page, { na: '140', cl: '100', hco3: '12' });
    await expect(page.locator('#calc-out')).toContainText('relação delta 1,33'); // (28 − 12) ÷ (24 − 12)
  });

  test('FIB-4, LDL e Ganzoni', async ({ page }) => {
    await abrirCalc(page, 'k-fib4');
    await preencher(page, { idade: '50', ast: '40', alt: '30', plq: '200' });
    await expect(page.locator('#calc-out')).toContainText('1,83');
    await abrirCalc(page, 'k-ldl');
    await preencher(page, { ct: '200', hdl: '50', tg: '450' });
    await expect(page.locator('#calc-out')).toContainText('Friedewald não se aplica');
    await abrirCalc(page, 'k-ganzoni');
    await preencher(page, { peso: '70', hb: '9' });
    await expect(page.locator('#calc-out')).toContainText('1508 mg');           // 70 × 6 × 2,4 + 500
  });
});
