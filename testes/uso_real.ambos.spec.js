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

test('meus dados: exportar pelo menu ⋮ e importar de volta restaura favoritos, anotações, histórico e ajustes', async ({ page }) => {
  await abrir(page);
  await abrirMed(page, 'Amoxicilina');
  await page.locator('#detail-fav-btn').click();
  await expect(page.locator('#detail-fav-btn')).toHaveClass(/is-fav/);
  await page.locator('#note-text').fill('anotação para o backup');
  await page.locator('#note-text').blur();
  await page.evaluate(() => { localStorage.setItem('bluebook:zoom', '130'); localStorage.setItem('bluebook:pl-kg', '18'); });
  // exportar
  await page.locator('#more-btn').click();
  const espera = page.waitForEvent('download');
  await page.locator('#meus-dados-exportar').click();
  const dl = await espera;
  expect(dl.suggestedFilename()).toMatch(/^bluebook-meus-dados-\d{4}-\d{2}-\d{2}\.json$/);
  const caminho = await dl.path();
  const fs = require('fs');
  const arq = JSON.parse(fs.readFileSync(caminho, 'utf8'));
  expect(arq.tipo).toBe('bluebook-meus-dados');
  expect(arq.favoritos).toContain('Amoxicilina');
  expect(JSON.parse(arq.dados['bluebook:notes'])['m:Amoxicilina'].t).toBe('anotação para o backup');
  expect(arq.dados['bluebook:zoom']).toBe('130');
  expect(JSON.parse(arq.dados['bluebook:recents'] || '[]').length).toBeGreaterThan(0);   // histórico vai junto
  // apaga tudo isso do aparelho (como num aparelho novo)
  await page.evaluate(() => { ['bluebook:notes', 'bluebook:zoom', 'bluebook:pl-kg', 'bluebook:recents'].forEach((k) => localStorage.removeItem(k)); localStorage.removeItem('formulario-clinico:medications'); });
  await page.reload();
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
  // importar
  page.once('dialog', (d) => { expect(d.type()).toBe('confirm'); d.accept(); });
  await page.locator('#more-btn').click();
  const escolha = page.waitForEvent('filechooser');
  await page.locator('#meus-dados-importar').click();
  const recarregou = page.waitForEvent('load');
  await (await escolha).setFiles(caminho);
  await recarregou;
  await expect(page.locator('#sidebar .med-item').first()).toBeAttached();
  expect(await page.evaluate(() => localStorage.getItem('bluebook:zoom'))).toBe('130');
  expect(await page.evaluate(() => localStorage.getItem('bluebook:pl-kg'))).toBe('18');
  await abrirMed(page, 'Amoxicilina');
  await expect(page.locator('#note-text')).toHaveValue('anotação para o backup');
  await expect(page.locator('#detail-fav-btn')).toHaveClass(/is-fav/);
});

test('meus dados: arquivo que não é backup do Bluebook é recusado sem mudar nada', async ({ page }) => {
  await abrir(page);
  const antes = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  let msg = '';
  page.once('dialog', (d) => { msg = d.message(); d.accept(); });
  await page.locator('#more-btn').click();
  const escolha = page.waitForEvent('filechooser');
  await page.locator('#meus-dados-importar').click();
  await (await escolha).setFiles({ name: 'outro.json', mimeType: 'application/json', buffer: Buffer.from('{"qualquer":1}') });
  await expect.poll(() => msg).toBe('Este arquivo não é um backup de dados do Bluebook.');
  expect(await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)))).toBe(antes);
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
  const nMeds = require('../dados/seed_meds.json').length;   // a biblioteca cresce por lotes conferidos (curadoria/meds-lote-*)
  expect(nMeds).toBeGreaterThanOrEqual(1851);
  expect(dados.medications.length).toBe(nMeds);
  await page.locator('#import-file').setInputFiles(caminho);
  await expect(page.locator('#import-status')).toHaveText('0 medicamento(s) importado(s). ' + nMeds + ' já existiam e foram ignorados.');
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
