'use strict';
// Regressão visual: capturas de tela das principais telas, em tema claro e escuro, no computador e no
// celular. As referências ficam em testes/visual.ambos.spec.js-snapshots/ e foram geradas ANTES da
// limpeza de CSS da Etapa 4; qualquer mudança de pixel faz o teste falhar.
// Atualizar de propósito (mudança visual intencional): npx playwright test visual --update-snapshots
const { test, expect, abrir } = require('./apoio');

const ir = async (page, modo) => {
  await page.locator(`.view-tab[data-mode="${modo}"]`).dispatchEvent('click');
  await expect(page.locator(`.view-tab[data-mode="${modo}"]`)).toHaveClass(/active/);
};
const abrirItem = async (page, sel) => { await page.locator(sel).first().dispatchEvent('click'); };

const TELAS = {
  inicio: async () => {},
  'medicamentos-lista': async (page) => { await ir(page, 'meds'); },
  'medicamento-ficha': async (page) => {
    await page.locator('#search-input').fill('Dipirona sódica');
    await abrirItem(page, '#sidebar .med-item[data-id]');
    await page.locator('#fp-weight').fill('10');
  },
  'busca-universal': async (page) => { await page.locator('#search-input').fill('pneumonia'); },
  'doenca-ficha': async (page) => {
    await ir(page, 'diseases');
    await page.locator('#search-input').fill('Infarto agudo do miocárdio (IAM)');
    await abrirItem(page, '#sidebar .med-item[data-idx]');
  },
  'plantao-20kg': async (page) => { await ir(page, 'plantao'); await abrirItem(page, '#sidebar [data-pl="pcr"]'); await page.locator('#pl-kg').fill('20'); },
  'escore-curb65': async (page) => { await ir(page, 'scores'); await abrirItem(page, '#sidebar [data-score="curb65"]'); },
  'cid-j18': async (page) => { await ir(page, 'cid'); await page.locator('#search-input').fill('J189'); await abrirItem(page, '#sidebar .med-item'); },
  antibioticos: async (page) => { await ir(page, 'atb'); await abrirItem(page, '#sidebar .med-item'); },
  prescricao: async (page) => { await ir(page, 'rx'); },
  vacinas: async (page) => { await ir(page, 'vac'); await abrirItem(page, '#sidebar .med-item'); },
  fluxogramas: async (page) => { await ir(page, 'flux'); await abrirItem(page, '#sidebar .med-item'); },
  ecg: async (page) => { await ir(page, 'ecg'); await abrirItem(page, '#sidebar .med-item'); },
  laboratorio: async (page) => { await ir(page, 'lab'); await abrirItem(page, '#sidebar .med-item'); },
  calculadora: async (page) => { await ir(page, 'calc'); await abrirItem(page, '#sidebar .med-item'); },
  'modal-calculadoras': async (page) => { await page.locator('#calc-btn').dispatchEvent('click'); await page.locator('.calc-tab[data-tab="ped"]').dispatchEvent('click'); },
  'texto-130': async (page) => { await page.locator('#fs-btn').dispatchEvent('click'); },
  'folha-mais': async (page) => { await page.locator('#tabbar [data-tb="more"]').dispatchEvent('click'); },
};

for (const tema of ['light', 'dark']) {
  test.describe(`visual (${tema})`, () => {
    test.use({ colorScheme: tema });
    for (const [nome, preparar] of Object.entries(TELAS)) {
      test(nome, async ({ page }, info) => {
        if (nome === 'folha-mais' && info.project.name === 'computador') test.skip(true, 'só no celular');
        await page.clock.setFixedTime(new Date('2026-11-07T10:00:00-03:00'));
        await abrir(page);
        await preparar(page);
        // tira o foco (o anel de foco/spinner de campo numérico renderiza com ruído de 1-8 pixels)
        await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
        // a linha de versão muda a cada publicação (número e data): texto fixo para a captura não variar
        await page.evaluate(() => { const v = document.querySelector('.home-versao'); if (v) v.textContent = 'Versão de teste · atualizado em 07/11/2026'; });
        await page.waitForTimeout(150);
        // threshold 0: qualquer variação de cor conta. Até 40 pixels de tolerância porque o Chromium tem
        // ruído de rasterização de 1-18 pixels entre execuções (desfoque translúcido do cabeçalho);
        // mudar uma cor em 1 unidade altera ~16 mil pixels nesta tela e é detectado.
        await expect(page).toHaveScreenshot(`${nome}-${tema}.png`, { animations: 'disabled', caret: 'hide', maxDiffPixels: 40, threshold: 0 });
      });
    }
  });
}
