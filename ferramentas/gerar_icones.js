// Gera os ícones PNG do PWA a partir de src/pwa/icone.svg (rodar só quando o SVG mudar).
// Usa o Chromium do Playwright (dependência de desenvolvimento). Os PNG ficam no git.
// Uso: node ferramentas/gerar_icones.js
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const RAIZ = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(RAIZ, 'src', 'pwa', 'icone.svg'), 'utf8');
const SAIDA = path.join(RAIZ, 'src', 'pwa', 'icones');
const TAMANHOS = { 'icone-512.png': 512, 'icone-192.png': 192, 'apple-touch-icon.png': 180, 'favicon-32.png': 32 };

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const nav = await chromium.launch();
  for (const [arq, px] of Object.entries(TAMANHOS)) {
    const pag = await nav.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 });
    await pag.setContent(`<html><body style="margin:0">${svg.replace('width="512" height="512"', `width="${px}" height="${px}"`)}</body></html>`);
    await pag.screenshot({ path: path.join(SAIDA, arq), clip: { x: 0, y: 0, width: px, height: px }, omitBackground: false });
    await pag.close();
    console.log('OK', arq, px + 'x' + px);
  }
  await nav.close();
})();
