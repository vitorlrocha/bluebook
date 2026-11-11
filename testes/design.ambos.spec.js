'use strict';
// Conformidade com docs/DESIGN.md (especificação de design). Cada teste cita a seção do documento.
const { test, expect, abrir } = require('./apoio');

const tokens = (page, nomes) => page.evaluate((nomes) => {
  const cs = getComputedStyle(document.documentElement);
  return Object.fromEntries(nomes.map((n) => [n, cs.getPropertyValue(n).trim().toUpperCase()]));
}, nomes);

test.describe('DESIGN.md §2 — cores', () => {
  test('tokens do modo claro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await abrir(page);
    expect(await tokens(page, ['--paper', '--surface', '--ink', '--ink-soft', '--ink-faint', '--accent', '--accent-deep', '--accent-soft', '--border'])).toEqual({
      '--paper': '#F2F2F7', '--surface': '#FFFFFF', '--ink': '#1C1C1E', '--ink-soft': '#5B5B60', '--ink-faint': '#6E6E73',
      '--accent': '#0A66D8', '--accent-deep': '#0A4FA8', '--accent-soft': '#E6F0FD', '--border': '#E3E3E8',
    });
  });
  test('tokens do modo escuro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await abrir(page);
    expect(await tokens(page, ['--paper', '--surface', '--ink', '--ink-soft', '--accent', '--accent-deep', '--accent-soft', '--border'])).toEqual({
      '--paper': '#000000', '--surface': '#1C1C1E', '--ink': '#F2F2F7', '--ink-soft': '#AEAEB2',
      '--accent': '#3D9BFF', '--accent-deep': '#7DBAFF', '--accent-soft': '#0E2742', '--border': '#2E2E32',
    });
  });
});

test.describe('DESIGN.md §3 — tipografia', () => {
  test('fonte do sistema e zoom padrão de 115%', async ({ page }) => {
    await abrir(page);
    const r = await page.evaluate(() => ({ fonte: getComputedStyle(document.body).fontFamily, zoom: getComputedStyle(document.documentElement).zoom }));
    expect(r.fonte).toMatch(/^-apple-system/);
    expect(Number(r.zoom)).toBeCloseTo(1.15, 2);
    await expect(page.locator('#fs-lbl')).toHaveText('115%');
  });

  test('§9: nenhum texto visível abaixo de 12 px (exceto rótulo da barra inferior)', async ({ page }) => {
    await abrir(page);
    const telas = [async () => {}, async () => { await page.locator('#search-input').fill('Amoxicilina'); await page.locator('#sidebar .med-item[data-id]').first().dispatchEvent('click'); },
      async () => { await page.locator('.view-tab[data-mode="plantao"]').dispatchEvent('click'); await page.locator('#sidebar .med-item').first().dispatchEvent('click'); await page.locator('#pl-kg').fill('70'); },
      async () => { await page.locator('.view-tab[data-mode="diseases"]').dispatchEvent('click'); await page.locator('#search-input').fill('pneumonia'); await page.locator('#sidebar .med-item[data-idx]').first().dispatchEvent('click'); }];
    const pequenos = [];
    for (const t of telas) {
      await t();
      pequenos.push(...await page.evaluate(() => {
        const out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) {
          const n = w.currentNode; if (!n.textContent.trim()) continue;
          const el = n.parentElement; if (!el || el.closest('.tabbar, [hidden], script, style')) continue;
          const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
          const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue;
          const px = parseFloat(cs.fontSize);
          // 0 px = texto escondido de propósito (ex.: rótulo "Favoritos" só com ícone no celular)
          if (px > 0 && px < 12) out.push(`${el.tagName.toLowerCase()}.${el.className} ${px}px "${n.textContent.trim().slice(0, 30)}"`);
        }
        return out;
      }));
    }
    expect([...new Set(pequenos)]).toEqual([]);
  });
});

test.describe('DESIGN.md §5 — componentes', () => {
  test('§5.8 atalhos da página inicial na ordem do documento', async ({ page }, info) => {
    test.skip(info.project.name === 'computador', 'a página inicial com atalhos é a aba Início do celular');
    await abrir(page);
    const t = await page.locator('#detail .home-quick button').evaluateAll((bs) => bs.map((b) => (b.querySelector('strong, b, span:not(.ic)') || b).textContent.trim()));
    const esperado = ['Plantão', 'Doenças', 'Calculadoras', 'Idade gestacional', 'Escores', 'CID-10', 'Antibióticos', 'Fluxogramas', 'Laboratório'];
    expect(t.slice(0, esperado.length).map((s) => esperado.find((e) => s.startsWith(e)) || s)).toEqual(esperado);
  });

  test('§5.9 barra inferior: 5 botões, rótulos e área de toque ≥ 44 px', async ({ page }, info) => {
    test.skip(info.project.name === 'computador', 'só no celular');
    await abrir(page);
    const bs = page.locator('#tabbar > button');
    await expect(bs).toHaveCount(5);
    await expect(bs).toHaveText(['Início', 'Plantão', 'Doenças', 'Remédios', 'Mais']);
    const tam = await bs.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
    for (const [w, h] of tam) { expect(w).toBeGreaterThanOrEqual(44); expect(h).toBeGreaterThanOrEqual(44); }
  });

  test('§5.10 folha "Mais": itens na ordem do documento', async ({ page }, info) => {
    test.skip(info.project.name === 'computador', 'só no celular');
    await abrir(page);
    await page.locator('#tabbar [data-tb="more"]').click();
    const t = await page.locator('#sheet .sheet-list button').evaluateAll((bs) => bs.map((b) => b.textContent.replace('›', '').trim()));
    expect(t).toEqual(['Calculadoras (IG, pediátrica, renal…)', 'Idade gestacional (DUM/USG)', 'Fórmulas clínicas (lista)', 'Escores', 'CID-10', 'Antibióticos por foco', 'Fluxogramas', 'ECG', 'Laboratório', 'Vacinas', 'Prescrição e interações', 'Tamanho do texto']);
  });
});

test.describe('DESIGN.md §7/§10 — layout', () => {
  for (const zoom of ['1', '1.45']) {
    test(`cabeçalho sem sobreposição com zoom ${zoom}`, async ({ page }) => {
      await page.addInitScript((z) => { try { localStorage.setItem('bluebook:zoom', z); } catch (e) {} }, zoom);
      await abrir(page);
      const sobre = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('header .brand, .header-actions > *')).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
        const rs = els.map((e) => [e.id || e.className, e.getBoundingClientRect()]);
        const out = [];
        for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
          const a = rs[i][1], b = rs[j][1];
          if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.push(rs[i][0] + ' × ' + rs[j][0]);
        }
        const doc = document.documentElement;
        if (doc.scrollWidth > doc.clientWidth + 1) out.push('rolagem horizontal ' + doc.scrollWidth + ' > ' + doc.clientWidth);
        return out;
      });
      expect(sobre).toEqual([]);
    });
  }

  test('§1/§9 offline: nenhuma requisição para fora do próprio site', async ({ page }) => {
    const externos = [];
    page.on('request', (r) => { const u = new URL(r.url()); if (u.protocol.startsWith('http') && u.host !== new URL(page.url() || 'http://localhost:4173').host && !/^localhost|127\.0\.0\.1/.test(u.hostname)) externos.push(r.url()); });
    await abrir(page);
    await page.locator('#search-input').fill('pneumonia');
    expect(externos).toEqual([]);
  });
});
