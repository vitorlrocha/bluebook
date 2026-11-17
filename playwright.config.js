// Testes de ponta a ponta do Bluebook (Playwright). Rodam contra dist/index.html servido localmente.
// Uso: npx playwright test        (o build é feito automaticamente antes)
'use strict';
const { defineConfig, devices } = require('@playwright/test');

const PORTA = 4173;

module.exports = defineConfig({
  testDir: 'testes',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  // No computador de casa, no máximo 2 navegadores ao mesmo tempo, para não travar a máquina.
  workers: process.env.CI ? undefined : 2,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'testes/relatorio' }]],
  outputDir: 'testes/resultados',
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node ferramentas/build.js && node ferramentas/servir.js dist ${PORTA}`,
    url: `http://localhost:${PORTA}/`,
    reuseExistingServer: !process.env.CI,
    // Os testes NUNCA falam com o Firebase de verdade: o build de teste sai sem nuvem, mesmo que exista um .env.
    // (testes/nuvem.ambos.spec.js liga uma nuvem simulada por window.__BB_NUVEM_TESTE.)
    env: { BB_SEM_NUVEM: '1' },
    timeout: 60000,
  },
  projects: [
    {
      name: 'computador',
      testIgnore: /\.celular\.spec\.js$/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } },
    },
    {
      name: 'celular',
      testMatch: /\.(celular|ambos)\.spec\.js$/,
      use: { ...devices['Pixel 7'] },
    },
    {
      // Motor do Safari (WebKit), como em todo navegador do iPhone. Requer: npx playwright install webkit
      name: 'iphone',
      testMatch: /\.(celular|ambos)\.spec\.js$/,
      use: { ...devices['iPhone 14'] },
    },
  ],
});
