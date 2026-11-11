'use strict';
// Regressão de FUNÇÕES (regra permanente do CLAUDE.md): nenhuma mudança visual pode esconder uma função.
// Itens a–g pedidos pelo autor junto com as correções da v73. Roda no computador (1366 px), no celular
// Android (Pixel 7) e no iPhone (WebKit). O fixture de apoio.js já falha qualquer teste com erro de JS (item g).
const { test, expect, abrir } = require('./apoio');

const pc = (info) => info.project.name === 'computador';

/* Abre o painel de calculadoras pelo caminho principal de cada aparelho. */
async function abrirPainel(page, info) {
  if (pc(info)) {
    await expect(page.locator('#calc-btn')).toBeVisible();
    await expect(page.locator('#calc-btn')).toHaveText('Calculadoras');
    await page.locator('#calc-btn').click();
  } else {
    await page.locator('#tabbar [data-tb="more"]').click();
    await expect(page.locator('#sheet [data-tb="tools"]')).toContainText('Calculadoras (IG, pediátrica, renal…)');
    await page.locator('#sheet [data-tb="tools"]').click();
  }
  await expect(page.locator('#calc-overlay')).toBeVisible();
}

test.describe('Regressão de funções (correções da v73)', () => {
  test.beforeEach(async ({ page }) => { await abrir(page); });

  test('a) IG por USG: 10s3d em 01/08/2026 → 24s5d em 09/11/2026, DPP 24/02/2027', async ({ page }, info) => {
    await abrirPainel(page, info);
    await page.locator('#calc-overlay .calc-tab[data-tab="ga"]').click();
    await page.locator('#calc-overlay .calc-subtab[data-sub="usg"]').click();
    await page.locator('#usg-weeks').fill('10');
    await page.locator('#usg-days').fill('3');
    await page.locator('#usg-date').fill('2026-08-01');
    await page.locator('#usg-ref').fill('2026-11-09');
    await expect(page.locator('#usg-result')).toContainText('24s5d');
    await expect(page.locator('#usg-result')).toContainText('24/02/2027');
  });

  test('b) IG por DUM: DUM 01/01/2026 → DPP 08/10/2026 (Naegele, +280 dias), pelo atalho "Idade gestacional"', async ({ page }, info) => {
    // atalho da página inicial abre direto a aba "ga" (openCalcTab)
    const atalho = page.locator('#detail .home-quick [data-hq="@ga"]');
    await expect(atalho).toBeVisible();
    await atalho.click();
    await expect(page.locator('#calc-overlay .calc-tab[data-tab="ga"]')).toHaveClass(/active/);
    await expect(page.locator('#panel-ga')).toBeVisible();
    await page.locator('#calc-dum').fill('2026-01-01');
    await page.locator('#calc-dum-ref').fill('2026-03-01');
    await expect(page.locator('#dum-result')).toContainText('08/10/2026');
    await expect(page.locator('#dum-result')).toContainText('8s3d');   // 59 dias
  });

  test('atalho "Calculadoras" da página inicial abre o painel; no celular "Idade gestacional (DUM/USG)" está no Mais', async ({ page }, info) => {
    await page.locator('#detail .home-quick [data-hq="@calc"]').click();
    await expect(page.locator('#calc-overlay')).toBeVisible();
    await expect(page.locator('#calc-overlay .calc-tab')).toHaveText(['Calculadora', 'Idade gestacional', 'Dose pediátrica', 'Função renal', 'IMC adulto', 'IMC infantil', 'Risco CV', 'Fluidos', 'Infusão', 'Corticoides']);
    if (pc(info)) return;
    await page.keyboard.press('Escape');
    await page.locator('#tabbar [data-tb="more"]').click();
    await expect(page.locator('#sheet [data-tb="ga"]')).toContainText('Idade gestacional (DUM/USG)');
    await page.locator('#sheet [data-tb="ga"]').click();
    await expect(page.locator('#panel-ga')).toBeVisible();
  });

  test('c) menu ⋮: Carregar biblioteca, Bulário Anvisa, Exportar anotações e Ajustes visíveis e clicáveis', async ({ page }) => {
    await page.locator('#more-btn').click();
    const itens = page.locator('#more-menu .menu-item:not([hidden])');
    await expect(itens.filter({ hasText: /^Sair/ })).toHaveCount(1);   // conta (Etapa 2)
    for (const [sel, txt] of [['#seed-btn', 'Carregar biblioteca'], ['#more-menu a.menu-item', 'Bulário Anvisa'], ['#export-notes-btn', 'Exportar anotações'], ['#settings-btn', 'Ajustes']]) {
      const el = page.locator(sel);
      await expect(el, txt).toBeVisible();
      await expect(el).toHaveText(new RegExp('^' + txt));   // "Carregar biblioteca (1851)" traz a contagem
      await el.click({ trial: true });   // checa que dá para clicar (visível, habilitado, sem nada por cima)
    }
    await expect(page.locator('#more-menu a.menu-item')).toHaveAttribute('href', 'https://consultas.anvisa.gov.br/#/bulario/');
    const dl = page.waitForEvent('download');
    await page.locator('#export-notes-btn').click();
    expect((await dl).suggestedFilename()).toBe('bluebook-anotacoes.json');
    await page.locator('#more-btn').click();
    await page.locator('#settings-btn').click();
    await expect(page.locator('.modal h2', { hasText: 'Ajustes' })).toBeVisible();
  });

  test('d) todas as seções acessíveis (abas no computador; barra inferior ou "Mais" no celular)', async ({ page }, info) => {
    const SECOES = { plantao: 'Plantão', meds: 'Medicamentos', diseases: 'Doenças', scores: 'Escores', rx: 'Prescrição', atb: 'Antibióticos', vac: 'Vacinas', flux: 'Fluxogramas', ecg: 'ECG', calc: 'Calculadoras', lab: 'Laboratório', cid: 'CID-10' };
    for (const [modo, nome] of Object.entries(SECOES)) {
      if (pc(info)) {
        const aba = page.locator(`.view-tab[data-mode="${modo}"]`);
        await expect(aba, nome).toBeVisible();
        await aba.click();
      } else if (['plantao', 'diseases', 'meds'].includes(modo)) {
        await page.locator(`#tabbar [data-tb="${modo}"]`).click();
      } else {
        await page.locator('#tabbar [data-tb="more"]').click();
        const item = page.locator(`#sheet [data-tb="${modo}"]`);
        await expect(item, nome).toBeVisible();
        await item.click();
      }
      await expect(page.locator(`.view-tab[data-mode="${modo}"]`), nome).toHaveClass(/active/);
      await expect(page.locator('#sidebar .med-item').first(), nome).toBeAttached();
    }
  });

  test('e) frase original na página inicial; aviso legal no rodapé (computador) e na página inicial (celular)', async ({ page }, info) => {
    const frase = 'Consulta clínica rápida: doenças, condutas, medicamentos, escores e CID-10 reunidos em um só lugar.';
    await expect(page.locator('#detail .home-tag')).toHaveText(frase);
    await expect(page.locator('#detail .home-tag')).toBeVisible();
    const aviso = /não substitui a bula[\s\S]*Bulário Eletrônico da Anvisa/;
    if (pc(info)) {
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('footer')).toContainText(aviso);
    } else {
      await expect(page.locator('footer')).toBeHidden();
      const legal = page.locator('#detail .home-legal');
      await legal.scrollIntoViewIfNeeded();
      await expect(legal).toBeVisible();
      await expect(legal).toContainText(aviso);
    }
  });

  test('f) filtro de classe com "Grupos terapêuticos" (60) e "Classes detalhadas"; os dois filtram a lista', async ({ page }, info) => {
    if (!pc(info)) await page.locator('#tabbar [data-tb="meds"]').click();
    const sel = page.locator('#class-filter');
    await expect(sel.locator('optgroup')).toHaveCount(2);
    await expect(sel.locator('optgroup').nth(0)).toHaveAttribute('label', 'Grupos terapêuticos');
    await expect(sel.locator('optgroup').nth(1)).toHaveAttribute('label', 'Classes detalhadas');
    await expect(sel.locator('optgroup').nth(0).locator('option')).toHaveCount(60);
    expect(await sel.locator('optgroup').nth(1).locator('option').count()).toBeGreaterThan(60);
    const total = await page.locator('#sidebar .med-item[data-id]').count();
    for (const i of [0, 1]) {
      const opt = sel.locator('optgroup').nth(i).locator('option').first();
      const valor = await opt.getAttribute('value');
      await sel.selectOption(valor);
      await expect.poll(() => page.locator('#sidebar .med-item[data-id]').count()).toBeLessThan(total);
      expect(await page.locator('#sidebar .med-item[data-id]').count()).toBeGreaterThan(0);
      if (i === 1) {   // classe detalhada: toda ficha da lista tem exatamente essa classe
        const classe = valor.slice(2);
        const subs = await page.locator('#sidebar .med-item[data-id] .med-item-main small, #sidebar .med-item[data-id] .med-item-sub').allTextContents();
        if (subs.length) expect(subs.every((s) => s.includes(classe))).toBe(true);
      }
    }
    await sel.selectOption('');
    await expect.poll(() => page.locator('#sidebar .med-item[data-id]').count()).toBe(total);
  });

  test('g) percorrer painel, menu e seções não gera erro de JavaScript', async ({ page }, info) => {
    await abrirPainel(page, info);
    for (const t of ['basic', 'ga', 'ped', 'renal', 'imc', 'imcp', 'cv', 'fluid', 'inf', 'cort']) await page.locator(`#calc-overlay .calc-tab[data-tab="${t}"]`).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#calc-overlay')).toHaveCount(0);
    // o fixture errosJs (apoio.js) falha este teste se aparecer qualquer erro no console
  });
});
