'use strict';
// Aba "Escores": escores novos do lote 01 (curadoria/escores-lote-01.js). Confere a soma e a interpretação no app.
const { test, expect, abrir } = require('./apoio');

async function abrirEscore(page, id) {
  await page.locator('#tab-scores').click();
  await page.locator(`#sidebar .med-item[data-score="${id}"]`).click();
  await expect(page.locator('#score-result')).toBeVisible();
}
const campo = (page, esc, f) => page.locator(`#sf-${esc}-${f}`);

test.describe('Escores novos — lote 01', () => {
  test.beforeEach(async ({ page }) => { await abrir(page); });

  test('RCRI soma pontos e muda de classe', async ({ page }) => {
    await abrirEscore(page, 'rcri');
    await expect(page.locator('#score-result')).toContainText('Classe I');
    await campo(page, 'rcri', 'a').check();
    await campo(page, 'rcri', 'e').check();
    await expect(page.locator('#score-result')).toContainText('Classe III (2 pontos)');
  });

  test('Capurro calcula a idade gestacional', async ({ page }) => {
    await abrirEscore(page, 'capurro');
    await expect(page.locator('#score-result')).toContainText('pendente');
    // pele 15 + orelha 16 + mama 10 + pregas 15 + mamilo 10 = 66 → 204 + 66 = 270 dias = 38 semanas e 4 dias
    await campo(page, 'capurro', 'p').selectOption('3');
    await campo(page, 'capurro', 'o').selectOption('2');
    await campo(page, 'capurro', 'g').selectOption('2');
    await campo(page, 'capurro', 's').selectOption('3');
    await campo(page, 'capurro', 'm').selectOption('2');
    await expect(page.locator('#score-result')).toContainText('38 semanas e 4 dias');
    await expect(page.locator('#score-result')).toContainText('A termo');
  });

  test('RASS aceita valores negativos', async ({ page }) => {
    await abrirEscore(page, 'rass');
    await campo(page, 'rass', 'r').selectOption('5');            // −1 Sonolento (6ª opção)
    await expect(page.locator('#score-result')).toContainText('Alerta a sedação leve (-1)');
    await campo(page, 'rass', 'r').selectOption('9');            // −5
    await expect(page.locator('#score-result')).toContainText('Sedação moderada a profunda (-5)');
  });
});
