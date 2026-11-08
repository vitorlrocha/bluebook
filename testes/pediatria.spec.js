'use strict';
// Calculadora pediátrica: quadro "Dose pediátrica por peso" da ficha do medicamento (prefixo fp-),
// que usa pedCompute + PED_DB. Os valores esperados vêm dos parâmetros já cadastrados em
// dados/ped_db.json (não são doses novas): o teste confere a conta e a aplicação dos limites.
const { test, expect, abrir } = require('./apoio');

async function abrirFicha(page, nome) {
  await page.locator('#search-input').fill(nome);
  const ids = await page.locator('#sidebar .med-item[data-id]').evaluateAll((els, n) =>
    els.filter((e) => e.querySelector('.med-item-main').firstChild.textContent.trim() === n).map((e) => e.getAttribute('data-id')), nome);
  expect(ids.length, 'medicamento na lista: ' + nome).toBeGreaterThan(0);
  await page.locator(`#sidebar .med-item[data-id="${ids[0]}"]`).click();
  await expect(page.locator('#detail h2').first()).toHaveText(nome);
  await expect(page.locator('#fp-weight')).toBeVisible();
}

test.describe('Calculadora pediátrica (ficha do medicamento)', () => {
  test.beforeEach(async ({ page }) => { await abrir(page); });

  test('dose por peso: amoxicilina 20 kg (50 mg/kg/dia em 3 doses)', async ({ page }) => {
    await abrirFicha(page, 'Amoxicilina');
    await expect(page.locator('#fp-dose')).toHaveValue('50');
    await expect(page.locator('#fp-freq')).toHaveValue('3');
    await page.locator('#fp-weight').fill('20');
    const out = page.locator('#fp-out');
    await expect(out).toContainText('333 mg');          // 50 × 20 ÷ 3
    await expect(out).toContainText('6,67 mL');         // 333,3 mg ÷ 50 mg/mL
    await expect(out).toContainText('3x/dia (a cada 8 h)');
    await expect(out).not.toContainText('limitada ao máximo');
  });

  test('dose por peso: dipirona 10 kg, gotas 500 mg/mL', async ({ page }) => {
    await abrirFicha(page, 'Dipirona sódica (Metamizol)');
    await page.locator('#fp-weight').fill('10');
    const out = page.locator('#fp-out');
    await expect(out).toContainText('120 mg');          // 12 mg/kg/dose × 10 kg
    await expect(out).toContainText('0,24 mL');
    await expect(out).toContainText('≈ 5 gotas');
  });

  test('trava na dose máxima por tomada (dipirona 100 kg)', async ({ page }) => {
    await abrirFicha(page, 'Dipirona sódica (Metamizol)');
    await page.locator('#fp-weight').fill('100');
    const out = page.locator('#fp-out');
    await expect(out).toContainText('Dose por tomada (limitada ao máximo)');
    await expect(out).toContainText('indicaria 1200 mg');
    await expect(out).toContainText('travada em 1000 mg');
  });

  test('trava na dose máxima diária informada manualmente', async ({ page }) => {
    await abrirFicha(page, 'Amoxicilina');
    await page.locator('#fp-weight').fill('20');
    await page.locator('#fp-maxd').fill('600');
    const out = page.locator('#fp-out');
    await expect(out).toContainText('travada em 200 mg');   // 600 mg/dia ÷ 3
    await expect(out).toContainText('LIMITE ATINGIDO');
  });

  test('alerta: dipirona 1 gota/kg é superdose', async ({ page }) => {
    await abrirFicha(page, 'Dipirona sódica (Metamizol)');
    await expect(page.locator('#fp-hint .calc-warning')).toContainText('1 gota/kg de dipirona é superdose');
  });

  test('alerta: tramadol contraindicado abaixo de 12 anos', async ({ page }) => {
    await abrirFicha(page, 'Tramadol');
    await expect(page.locator('#fp-hint .calc-warning')).toContainText('CONTRAINDICADO em < 12 anos');
  });

  test('trocar a via recalcula com os parâmetros da via (dipirona IM/EV)', async ({ page }) => {
    await abrirFicha(page, 'Dipirona sódica (Metamizol)');
    await page.locator('#fp-via').selectOption({ label: 'IM/EV' });
    await expect(page.locator('#fp-dose')).toHaveValue('15');
    await page.locator('#fp-weight').fill('10');
    await expect(page.locator('#fp-out')).toContainText('150 mg');   // 15 mg/kg/dose × 10 kg
    await expect(page.locator('#fp-out')).toContainText('0,3 mL');   // ÷ 500 mg/mL
  });

  test('dose acima da faixa usual gera aviso', async ({ page }) => {
    await abrirFicha(page, 'Dipirona sódica (Metamizol)');
    await page.locator('#fp-weight').fill('10');
    await page.locator('#fp-dose').fill('25');
    await expect(page.locator('#fp-out')).toContainText('ACIMA da faixa usual');
  });

  test('sem peso pede o peso', async ({ page }) => {
    await abrirFicha(page, 'Amoxicilina');
    await expect(page.locator('#fp-out')).toContainText('Informe o peso');
  });
});
