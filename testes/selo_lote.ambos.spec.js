'use strict';
// Doenças que entram pelos lotes revisados (ferramentas/integrar_lote.js) trazem orig: "lote-NN" e devem aparecer
// com o selo "Literatura · não conferido", nunca "Revisado pelo autor". O campo orig não aparece na tela nem na busca.
// A doença abaixo é FICTÍCIA e só existe neste teste: ela é injetada na resposta do app, sem tocar em dados/.
const { test, expect, abrir } = require('./apoio');

test.use({ serviceWorkers: 'block' });   // no WebKit, page.route não intercepta páginas controladas pelo SW

const FICTICIA = {
  area: 'Clínica Médica', nome: 'Doença fictícia de teste do lote', cid: '',
  introducao: 'Texto fictício usado apenas no teste automatizado do selo.', criterios: '', exames: '', tratamento: '',
  conduta: '', prescricao: '', esp: 'Clínica Médica', orig: 'lote-99',
};

async function injetar(page) {
  await page.route((u) => u.pathname === '/' || u.pathname === '/index.html', async (route) => {
    const r = await route.fetch();
    const html = await r.text();
    const marca = 'var DISEASES = [\n';
    expect(html.split(marca).length, 'formato do DISEASES no build').toBe(2);
    await route.fulfill({ response: r, body: html.replace(marca, marca + '    ' + JSON.stringify(FICTICIA) + ',\n') });
  });
}
async function irDoencas(page, info) {
  if (info.project.name === 'computador') await page.locator('.view-tab[data-mode="diseases"]').click();
  else await page.locator('#tabbar [data-tb="diseases"]').click();
  await expect(page.locator('.view-tab[data-mode="diseases"]')).toHaveClass(/active/);
}

test('doença vinda de lote mostra "Literatura · não conferido" e o campo orig não aparece nem é buscável', async ({ page }, info) => {
  await injetar(page);
  await abrir(page);
  await irDoencas(page, info);
  await page.locator('#search-input').fill('fictícia de teste do lote');
  await page.locator('#sidebar .med-item[data-idx]').first().click();
  await expect(page.locator('#detail h2').first()).toHaveText(FICTICIA.nome);
  const selo = page.locator('#detail .trust').first();
  await expect(selo).toHaveText('Literatura · não conferido');
  await expect(page.locator('#detail')).not.toContainText('Revisado pelo autor');
  await expect(page.locator('#detail')).not.toContainText('lote-99');
  // a busca não acha nada pelo valor de orig (nem na aba, nem no quadro de todo o app)
  await page.locator('#search-input').fill('lote-99');
  await expect(page.locator('#sidebar .no-results')).toBeVisible();
  await expect(page.locator('#sidebar')).not.toContainText(FICTICIA.nome);
  // controle: uma doença original continua "Revisado pelo autor"
  await page.locator('#search-input').fill('Infarto agudo do miocárdio (IAM)');
  await page.locator('#sidebar .med-item[data-idx]').first().click();
  await expect(page.locator('#detail .trust').first()).toHaveText('✓ Revisado pelo autor');
});
