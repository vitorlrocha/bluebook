'use strict';
// Simulação de uso real: o que um médico faz no dia a dia e que precisa sobreviver a recarregar o app.
const { test, expect, abrir } = require('./apoio');

async function abrirMed(page, nome) {
  await page.locator('#search-input').fill(nome);
  await page.locator('#sidebar .med-item[data-id]').first().click();
  await expect(page.locator('#detail h2').first()).toContainText(nome);
}

test('consulta: favoritar um medicamento e encontrá-lo em Favoritos depois de reabrir o app', async ({ page }) => {
  await abrir(page);
  await abrirMed(page, 'Amoxicilina');
  await page.locator('#detail-fav-btn').click();
  await expect(page.locator('#detail-fav-btn')).toHaveClass(/is-fav/);
  await page.reload();
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
  await page.locator('#fav-filter-btn').click();
  const nomes = await page.locator('#sidebar .med-item[data-id] .med-item-main').evaluateAll((els) => els.map((e) => e.firstChild.textContent.trim()));
  expect(nomes).toContain('Amoxicilina');
});

test('consulta: anotação pessoal fica salva e aparece ao reabrir a ficha', async ({ page }) => {
  await abrir(page);
  await abrirMed(page, 'Dipirona sódica');
  await page.locator('#note-text').fill('Conferir alergia antes de prescrever');
  await page.locator('#note-rev').check();
  await page.reload();
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
  await abrirMed(page, 'Dipirona sódica');
  await expect(page.locator('#note-text')).toHaveValue('Conferir alergia antes de prescrever');
  await expect(page.locator('#note-rev')).toBeChecked();
});

test('consulta: exportar anotações gera um arquivo JSON com a anotação', async ({ page }) => {
  await abrir(page);
  await abrirMed(page, 'Dipirona sódica');
  await page.locator('#note-text').fill('teste de exportação');
  const espera = page.waitForEvent('download');
  await page.evaluate(() => document.getElementById('export-notes-btn').click());
  const dl = await espera;
  expect(dl.suggestedFilename()).toBe('bluebook-anotacoes.json');
  const fs = require('fs');
  const dados = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  expect(dados.some((d) => d.anotacao === 'teste de exportação' && d.tipo === 'medicamento')).toBe(true);
});

test('plantão: peso inválido (0, negativo, texto) não mostra dose calculada', async ({ page }, info) => {
  await abrir(page);
  if (info.project.name !== 'computador') {
    await page.locator('#tabbar [data-tb="plantao"]').click();
    await page.locator('#sidebar .med-item').first().click();
  } else await page.locator('.view-tab[data-mode="plantao"]').click();
  for (const v of ['0', '-5']) {
    await page.locator('#pl-kg').fill(v);
    await expect(page.locator('#pl-tab th').nth(1)).toHaveText('Dose (informe o peso)');
  }
});

test('busca universal: termo sem resultado na aba atual mostra resultados de outras seções', async ({ page }, info) => {
  test.skip(info.project.name !== 'computador', 'abas do topo');
  await abrir(page);
  await page.locator('.view-tab[data-mode="scores"]').click();
  await page.locator('#search-input').fill('amoxicilina');
  const quadro = page.locator('#sidebar details, #sidebar .gs-box').first();
  await expect(quadro).toBeVisible();
  await expect(quadro).toContainText(/Medicamentos/);
});

test('aviso legal acessível em Ajustes (no celular o rodapé fica oculto)', async ({ page }) => {
  await abrir(page);
  await page.locator('#more-btn').click();
  await page.locator('#settings-btn').click();
  await expect(page.locator('#settings-about')).toContainText('não substitui o julgamento clínico nem a bula');
  await expect(page.locator('#settings-about')).toContainText('Bulário Eletrônico da Anvisa');
});

test('backup: exportar e importar de volta não duplica; medicamento novo é importado', async ({ page }) => {
  await abrir(page);
  await page.locator('#more-btn').click();
  await page.locator('#settings-btn').click();
  const espera = page.waitForEvent('download');
  await page.locator('#export-btn').click();
  const dl = await espera;
  const caminho = await dl.path();
  const fs = require('fs');
  const dados = JSON.parse(fs.readFileSync(caminho, 'utf8'));
  expect(dados.medications.length).toBe(1851);
  await page.locator('#import-file').setInputFiles(caminho);
  await expect(page.locator('#import-status')).toHaveText('0 medicamento(s) importado(s). 1851 já existiam e foram ignorados.');
  const novo = { name: 'novo.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify([{ nome: 'Medicamento de teste importado', classe: 'Teste' }])) };
  await page.locator('#import-file').setInputFiles(novo);
  await expect(page.locator('#import-status')).toHaveText('1 medicamento(s) importado(s). 0 já existiam e foram ignorados.');
});

test('armazenamento: a biblioteca não é copiada para o localStorage (limite de ~5 MB do Safari/iPhone)', async ({ page }) => {
  await abrir(page);
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
  const tam = await page.evaluate(() => (localStorage.getItem('formulario-clinico:medications') || '').length);
  expect(tam).toBeLessThan(20000);
  expect(await page.locator('#sidebar .med-item[data-id]').count()).toBeGreaterThan(1000);
});

test('migração do formato antigo (array completo) mantém favoritos e medicamentos importados', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('formulario-clinico:medications', JSON.stringify([
      { id: 'local-1-0-abc', nome: 'Amoxicilina', classe: 'x', favorito: true },
      { id: 'local-1-1-def', nome: 'Dipirona sódica (Metamizol)', classe: 'x' },
      { id: 'local-1-2-ghi', nome: 'Medicamento antigo importado', classe: 'Importado', favorito: true },
    ]));
  });
  await page.reload();
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
  const novo = await page.evaluate(() => JSON.parse(localStorage.getItem('formulario-clinico:medications')));
  expect(novo.v).toBe(2);
  expect(novo.fav).toEqual({ amoxicilina: true });
  expect(novo.extras.map((m) => m.nome)).toEqual(['Medicamento antigo importado']);
  await page.locator('#fav-filter-btn').click();
  const favs = await page.locator('#sidebar .med-item[data-id] .med-item-main').evaluateAll((els) => els.map((e) => e.firstChild.textContent.trim()));
  expect(favs).toEqual(expect.arrayContaining(['Amoxicilina', 'Medicamento antigo importado']));
  expect(favs).not.toContain('Dipirona sódica (Metamizol)');
});

test('recarregar o app mantém o tamanho do texto escolhido', async ({ page }, info) => {
  test.skip(info.project.name !== 'computador', 'botão Aa no cabeçalho');
  await abrir(page);
  await page.locator('#fs-btn').click();
  await expect(page.locator('#fs-lbl')).toHaveText('130%');
  await page.reload();
  await expect(page.locator('#fs-lbl')).toHaveText('130%');
});
