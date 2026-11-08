'use strict';
// Modo plantão. Valores esperados = parâmetros de dados/plantao.json (protocolo PCR, AHA PALS/ACLS 2020).
const { test, expect, abrir, aba } = require('./apoio');

function linha(page, nome) {
  return page.locator('#pl-tab tbody tr').filter({ has: page.locator('strong', { hasText: new RegExp('^' + nome) }) });
}

test.describe('Modo plantão', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await aba(page, 'plantao');
    await expect(page.locator('#detail h2')).toHaveText('Parada cardiorrespiratória');
  });

  test('sem peso pede o peso', async ({ page }) => {
    await expect(page.locator('#pl-tab th').nth(1)).toHaveText('Dose (informe o peso)');
  });

  test('criança de 20 kg: doses por kg', async ({ page }) => {
    await page.locator('#pl-kg').fill('20');
    await expect(page.locator('#pl-tab th').nth(1)).toHaveText('Dose (20 kg)');
    const adr = linha(page, 'Adrenalina').locator('.pl-dose');
    await expect(adr).toContainText('0,2 mg');      // 0,01 mg/kg
    await expect(adr).toContainText('2 mL');        // solução 0,1 mg/mL
    await expect(adr).not.toContainText('ADULTO');
    const ami = linha(page, 'Amiodarona').locator('.pl-dose');
    await expect(ami).toContainText('100 mg');      // 5 mg/kg
    await expect(ami).toContainText('2 mL');        // 50 mg/mL
    await expect(linha(page, 'Lidocaína').locator('.pl-dose')).toContainText('20 mg');
  });

  test('adulto de 70 kg: usa dose de adulto', async ({ page }) => {
    await page.locator('#pl-kg').fill('70');
    const adr = linha(page, 'Adrenalina').locator('.pl-dose');
    await expect(adr).toContainText('1 mg');
    await expect(adr.locator('.pl-max')).toHaveText('ADULTO');
    const ami = linha(page, 'Amiodarona').locator('.pl-dose');
    await expect(ami).toContainText('300 mg');
    await expect(ami.locator('.pl-max')).toHaveText('ADULTO');
    // sem dose de adulto cadastrada: 1 mg/kg × 70 = 70 mg (abaixo do máximo de 100 mg)
    await expect(linha(page, 'Lidocaína').locator('.pl-dose')).toContainText('70 mg');
  });

  test('peso fica salvo e vale para outros protocolos', async ({ page }) => {
    await page.locator('#pl-kg').fill('20');
    await page.locator('#sidebar .med-item').nth(1).click();
    await expect(page.locator('#pl-kg')).toHaveValue('20');
    await page.reload();
    await aba(page, 'plantao');
    await expect(page.locator('#pl-kg')).toHaveValue('20');
  });
});
