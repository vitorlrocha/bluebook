'use strict';
const { test, expect, abrir, aba, buscar } = require('./apoio');

test.describe('Busca', () => {
  test.beforeEach(async ({ page }) => { await abrir(page); });

  test('sigla IAM encontra infarto agudo do miocárdio (doenças)', async ({ page }) => {
    await aba(page, 'diseases');
    const nomes = await buscar(page, 'IAM');
    expect(nomes.slice(0, 3)).toContain('Infarto agudo do miocárdio (IAM)');
  });

  test('sigla PAC encontra pneumonia adquirida na comunidade (doenças)', async ({ page }) => {
    await aba(page, 'diseases');
    const nomes = await buscar(page, 'PAC');
    expect(nomes.slice(0, 3)).toContain('Pneumonia adquirida na comunidade (PAC)');
  });

  test('sigla AAS encontra ácido acetilsalicílico (medicamentos)', async ({ page }) => {
    const nomes = await buscar(page, 'AAS');
    expect(nomes.slice(0, 3)).toContain('Ácido acetilsalicílico (AAS)');
  });

  // Corrigido na v72: na v71 "Clopidogrel + AAS" aparecia antes de "Ácido acetilsalicílico (AAS)".
  test('AAS: o próprio medicamento vem em 1º lugar', async ({ page }) => {
    const nomes = await buscar(page, 'AAS');
    expect(nomes[0]).toBe('Ácido acetilsalicílico (AAS)');
  });

  test('erro de digitação "omeprasol" encontra Omeprazol', async ({ page }) => {
    const nomes = await buscar(page, 'omeprasol');
    expect(nomes[0]).toBe('Omeprazol');
  });

  test('erro de digitação "apendisite" encontra apendicite (doenças)', async ({ page }) => {
    await aba(page, 'diseases');
    const nomes = await buscar(page, 'apendisite');
    expect(nomes.length).toBeGreaterThan(0);
    for (const n of nomes) expect(n).toMatch(/apendicite/i);
    expect(nomes).toContain('Apendicite aguda');
  });

  test('nome de marca "Novalgina" encontra dipirona', async ({ page }) => {
    const nomes = await buscar(page, 'Novalgina');
    expect(nomes[0]).toBe('Dipirona sódica (Metamizol)');
  });

  test('busca universal mostra resultados de outras seções', async ({ page }) => {
    await buscar(page, 'pneumonia');
    const caixa = page.locator('#sidebar .gs-box');
    await expect(caixa).toContainText('Também em outras seções');
    await expect(caixa).toContainText('Doenças');
  });

  test('busca sem resultado mostra mensagem', async ({ page }) => {
    await page.locator('#search-input').fill('xyzxyzxyz');
    await expect(page.locator('#sidebar .no-results')).toContainText('Nenhum resultado');
  });
});
