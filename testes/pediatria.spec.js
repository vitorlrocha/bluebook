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

  // Lote 01 da prioridade 3 (curadoria/ped-lote-01.js): medicamentos acrescentados com bula/resumo oficial lido.
  test('lote 01: levetiracetam 10 kg → 100 mg (1 mL) 2x/dia; trava em 30 mg/kg/dose', async ({ page }) => {
    await abrirFicha(page, 'Levetiracetam');
    await page.locator('#fp-weight').fill('10');
    const out = page.locator('#fp-out');
    await expect(out).toContainText('100 mg');
    await expect(out).toContainText('1 mL');
    await expect(out).toContainText('2x/dia (a cada 12 h)');
    await page.locator('#fp-dose').fill('40');               // acima do máximo de 30 mg/kg/dose (60 mg/kg/dia)
    await expect(out).toContainText('travada em 300 mg');
  });

  test('lote 01: midazolam IV 10 kg → 0,5 mg; penicilina V em UI; cetirizina por idade', async ({ page }) => {
    await abrirFicha(page, 'Midazolam');
    await expect(page.locator('#fp-hint .calc-warning')).toContainText('depressão respiratória');
    await page.locator('#fp-weight').fill('10');
    await expect(page.locator('#fp-out')).toContainText('0,5 mg');      // 0,05 mg/kg × 10 kg
    await expect(page.locator('#fp-out')).toContainText('0,1 mL');      // ÷ 5 mg/mL
    await abrirFicha(page, 'Penicilina V (Fenoximetilpenicilina potássica)');
    await page.locator('#fp-weight').fill('20');
    await expect(page.locator('#fp-out')).toContainText('400.000 UI');  // 40.000 UI/kg/dia × 20 kg ÷ 2
    await expect(page.locator('#fp-out')).toContainText('5 mL');        // ÷ 80.000 UI/mL
    await page.locator('#search-input').fill('Cetirizina');
    const id = await page.locator('#sidebar .med-item[data-id]').evaluateAll((els) =>
      els.filter((e) => e.querySelector('.med-item-main').firstChild.textContent.trim() === 'Cetirizina').map((e) => e.getAttribute('data-id'))[0]);
    await page.locator(`#sidebar .med-item[data-id="${id}"]`).click();
    await expect(page.locator('#detail h2').first()).toHaveText('Cetirizina');
    await expect(page.locator('#detail')).toContainText('2 a 6 anos 2,5 mL (2,5 mg) 2x/dia');
  });

  test('lote 02: naloxona, cefadroxila e fentanil em mcg; adesivo e escetamina não herdam a dose', async ({ page }) => {
    await abrirFicha(page, 'Naloxona');
    await page.locator('#fp-weight').fill('10');
    await expect(page.locator('#fp-out')).toContainText('0,1 mg');      // 0,01 mg/kg × 10 kg
    await expect(page.locator('#fp-out')).toContainText('0,25 mL');     // ÷ 0,4 mg/mL
    await abrirFicha(page, 'Cefadroxila');
    await page.locator('#fp-weight').fill('20');
    await expect(page.locator('#fp-out')).toContainText('300 mg');      // 30 mg/kg/dia × 20 kg ÷ 2
    await expect(page.locator('#fp-out')).toContainText('6 mL');        // ÷ 50 mg/mL
    await abrirFicha(page, 'Fentanil');
    await expect(page.locator('#fp-hint .calc-warning')).toContainText('depressão respiratória');
    await page.locator('#fp-weight').fill('20');
    await expect(page.locator('#fp-out')).toContainText('40 mcg');      // 2 mcg/kg × 20 kg
    await expect(page.locator('#fp-out')).toContainText('0,8 mL');      // ÷ 50 mcg/mL
    for (const nome of ['Fentanil transdérmico', 'Cetamina (S-)']) {
      await page.locator('#search-input').fill(nome);
      const id = await page.locator('#sidebar .med-item[data-id]').evaluateAll((els, n) =>
        els.filter((e) => e.querySelector('.med-item-main').firstChild.textContent.trim() === n).map((e) => e.getAttribute('data-id'))[0], nome);
      await page.locator(`#sidebar .med-item[data-id="${id}"]`).click();
      await expect(page.locator('#detail h2').first()).toHaveText(nome);
      await expect(page.locator('#detail')).not.toContainText('anestesia, 2 a 12 anos');
      await expect(page.locator('#detail')).not.toContainText('indução anestésica');
    }
  });

  test('lote 03: amicacina, ceftazidima, flumazenil e eritromicina', async ({ page }) => {
    await abrirFicha(page, 'Amicacina');
    await page.locator('#fp-weight').fill('20');
    await expect(page.locator('#fp-out')).toContainText('150 mg');      // 15 mg/kg/dia × 20 kg ÷ 2
    await abrirFicha(page, 'Ceftazidima');
    await page.locator('#fp-weight').fill('10');
    await expect(page.locator('#fp-out')).toContainText('300 mg');      // 30 mg/kg × 10 kg
    await abrirFicha(page, 'Flumazenil');
    await page.locator('#fp-weight').fill('40');
    await expect(page.locator('#fp-out')).toContainText('travada em 0,2 mg');   // 0,4 mg calculado → teto 0,2 mg
    await abrirFicha(page, 'Eritromicina');
    await page.locator('#fp-weight').fill('10');
    await expect(page.locator('#fp-out')).toContainText('100 mg');      // 40 mg/kg/dia × 10 kg ÷ 4
  });

  test('lote 04: cefotaxima (95 mg/mL), valaciclovir com teto, cefuroxima EV e montelucaste por idade', async ({ page }) => {
    await abrirFicha(page, 'Cefotaxima');
    await page.locator('#fp-weight').fill('10');
    await expect(page.locator('#fp-out')).toContainText('250 mg');      // 100 mg/kg/dia × 10 kg ÷ 4
    await expect(page.locator('#fp-out')).toContainText('2,63 mL');     // ÷ 95 mg/mL
    await abrirFicha(page, 'Valaciclovir');
    await page.locator('#fp-weight').fill('60');
    await expect(page.locator('#fp-out')).toContainText('travada em 1000 mg');   // 20 mg/kg × 60 = 1.200 → teto 1 g
    await abrirFicha(page, 'Cefuroxima');
    await page.locator('#fp-via').selectOption({ label: 'EV/IM (> 3 meses)' });
    await page.locator('#fp-weight').fill('12');
    await expect(page.locator('#fp-out')).toContainText('300 mg');      // 75 mg/kg/dia × 12 kg ÷ 3
    await expect(page.locator('#fp-out')).toContainText('3,33 mL');     // ÷ 90 mg/mL
    await page.locator('#search-input').fill('Montelucaste sódico');
    const id = await page.locator('#sidebar .med-item[data-id]').evaluateAll((els) =>
      els.filter((e) => e.querySelector('.med-item-main').firstChild.textContent.trim() === 'Montelucaste sódico').map((e) => e.getAttribute('data-id'))[0]);
    await page.locator(`#sidebar .med-item[data-id="${id}"]`).click();
    await expect(page.locator('#detail')).toContainText('2 a 5 anos 4 mg');
  });

  test('dose acima da faixa usual gera aviso', async ({ page }) => {
    await abrirFicha(page, 'Dipirona sódica (Metamizol)');
    await page.locator('#fp-weight').fill('10');
    await page.locator('#fp-dose').fill('25');
    await expect(page.locator('#fp-out')).toContainText('ACIMA da faixa usual');
  });

  test('associação não herda a calculadora do fármaco isolado (v72); associação com entrada própria mantém', async ({ page }) => {
    for (const nome of ['Dexametasona + Neomicina + Polimixina B (colírio)', 'Lidocaína + Prilocaína', 'Hidrocortisona + Neomicina + Bacitracina']) {
      await page.locator('#search-input').fill(nome);
      const ids = await page.locator('#sidebar .med-item[data-id]').evaluateAll((els, n) =>
        els.filter((e) => e.querySelector('.med-item-main').firstChild.textContent.trim() === n).map((e) => e.getAttribute('data-id')), nome);
      expect(ids.length, nome).toBeGreaterThan(0);
      await page.locator(`#sidebar .med-item[data-id="${ids[0]}"]`).click();
      await expect(page.locator('#detail h2').first()).toHaveText(nome);
      await expect(page.locator('#fp-weight'), nome).toHaveCount(0);
    }
    await abrirFicha(page, 'Amoxicilina + Clavulanato de potássio');   // tem entrada própria no PED_DB
  });

  test('sem peso pede o peso', async ({ page }) => {
    await abrirFicha(page, 'Amoxicilina');
    await expect(page.locator('#fp-out')).toContainText('Informe o peso');
  });
});
