'use strict';
// Pedido do autor (v74): "ao pesquisar na barra de pesquisa única, deve buscar em todo o app, seja doença, seja CID,
// seja medicação". O quadro de resultados de todo o app (.gs-box) fica sempre aberto, em qualquer aba, e tocar num
// resultado abre a ficha certa na seção certa. Roda no computador, no celular e no iPhone.
const { test, expect, abrir } = require('./apoio');

/* Vai para uma seção: abas do topo no computador, barra inferior no celular. */
async function irPara(page, info, modo) {
  if (info.project.name === 'computador') await page.locator(`.view-tab[data-mode="${modo}"]`).click();
  else await page.locator(`#tabbar [data-tb="${modo}"]`).click();
  await expect(page.locator(`.view-tab[data-mode="${modo}"]`)).toHaveClass(/active/);
}
async function buscar(page, termo) {
  await page.locator('#search-input').fill(termo);
  const quadro = page.locator('#sidebar details.gs-box');
  await expect(quadro).toBeVisible();
  await expect(quadro).toHaveAttribute('open', '');       // sempre aberto, mesmo com resultados na aba atual
  return quadro;
}
/* Toca no 1º resultado do tipo e devolve o rótulo tocado. */
async function tocar(quadro, gk) {
  const item = quadro.locator(`.gs-item[data-gk="${gk}"]`).first();
  await expect(item).toBeVisible();
  // rótulo sem o subtítulo (<small>); o termo vem destacado em <mark>, por isso não basta o 1º nó
  const rotulo = (await item.evaluate((e) => { const c = e.cloneNode(true); c.querySelectorAll('small').forEach((s) => s.remove()); return c.textContent; })).trim();
  await item.click();
  return rotulo;
}

test.describe('Busca em todo o app pela barra única', () => {
  test('na aba Medicamentos, "pneumonia" mostra doenças e o toque abre a ficha da doença', async ({ page }, info) => {
    await abrir(page);
    await irPara(page, info, 'meds');
    const quadro = await buscar(page, 'pneumonia');
    await expect(quadro).toContainText('Doenças');
    await expect(page.locator('#sidebar .med-item[data-id]').first()).toBeAttached();   // a lista da aba continua lá
    const nome = await tocar(quadro, 'd');
    await expect(page.locator('.view-tab[data-mode="diseases"]')).toHaveClass(/active/);
    await expect(page.locator('#detail')).toBeVisible();
    await expect(page.locator('#detail h2').first()).toHaveText(nome);
  });

  test('na aba Medicamentos, "J18" mostra CID-10; o toque abre a ficha do CID e a da doença com o código', async ({ page }, info) => {
    await abrir(page);
    await irPara(page, info, 'meds');
    let quadro = await buscar(page, 'J18');
    await expect(quadro).toContainText('CID-10');
    // categoria/subcategoria do CID-10 → aba CID-10 com a ficha aberta
    await tocar(quadro, 'cid');
    await expect(page.locator('.view-tab[data-mode="cid"]')).toHaveClass(/active/);
    await expect(page.locator('#detail')).toBeVisible();
    await expect(page.locator('#detail h2').first()).toContainText('J18');
    // código CID de uma doença do app → ficha da doença
    await irPara(page, info, 'meds');
    quadro = await buscar(page, 'J18');
    const codigo = await tocar(quadro, 'cc');
    expect(codigo).toMatch(/^J18/);
    await expect(page.locator('.view-tab[data-mode="diseases"]')).toHaveClass(/active/);
    await expect(page.locator('#detail')).toBeVisible();
    await expect(page.locator('#detail')).toContainText(codigo);
    await expect(page.locator('#detail-fav-btn')).toBeAttached();                       // é a ficha da doença
  });

  test('na aba Doenças, "dipirona" mostra o medicamento e o toque abre a ficha', async ({ page }, info) => {
    await abrir(page);
    await irPara(page, info, 'diseases');
    const quadro = await buscar(page, 'dipirona');
    await expect(quadro).toContainText('Medicamentos');
    const nome = await tocar(quadro, 'm');
    expect(nome).toMatch(/Dipirona/);
    await expect(page.locator('.view-tab[data-mode="meds"]')).toHaveClass(/active/);
    await expect(page.locator('#detail')).toBeVisible();
    await expect(page.locator('#detail h2').first()).toContainText(nome);
  });

  test('o quadro aparece aberto também em Escores e Prescrição, e o título ainda o recolhe', async ({ page }, info) => {
    await abrir(page);
    for (const modo of ['scores', 'rx']) {
      if (info.project.name === 'computador') await irPara(page, info, modo);
      else {
        await page.locator('#tabbar [data-tb="more"]').click();
        await page.locator(`#sheet [data-tb="${modo}"]`).click();
      }
      const quadro = await buscar(page, 'pneumonia');
      await expect(quadro).toContainText('Doenças');
      await quadro.locator('summary').click();
      await expect(quadro).not.toHaveAttribute('open', '');
      await page.locator('#search-input').fill('');
    }
  });

  test('no celular, digitar com uma ficha aberta volta para a lista com os resultados', async ({ page }, info) => {
    test.skip(info.project.name === 'computador', 'no computador a lista e a ficha aparecem lado a lado');
    await abrir(page);
    await irPara(page, info, 'meds');
    await page.locator('#search-input').fill('Amoxicilina');
    await page.locator('#sidebar .med-item[data-id]').first().click();
    await expect(page.locator('#detail h2').first()).toContainText('Amoxicilina');
    const quadro = await buscar(page, 'pneumonia');
    await expect(quadro).toContainText('Doenças');
  });
});
