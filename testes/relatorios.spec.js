'use strict';
// Etapa 3: PENDENCIAS.md e INCONSISTENCIAS.md precisam refletir os dados atuais (são gerados, não editados).
// Se falhar: rode "npm run relatorios" e revise o que mudou.
const { execFileSync } = require('child_process');
const path = require('path');
const { test, expect } = require('@playwright/test');
const raiz = path.join(__dirname, '..');

test.describe('Relatórios gerados a partir de dados/', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'computador', 'não depende do navegador'); });
  for (const f of ['pendencias', 'inconsistencias']) {
    test(`${f}: arquivo em dia com dados/*.json`, () => {
      expect(() => execFileSync(process.execPath, [path.join(raiz, 'ferramentas', f + '.js'), '--checar'], { stdio: 'pipe' })).not.toThrow();
    });
  }
  test('PENDENCIAS.md encontra toda marca "PENDENTE DE VERIFICAÇÃO" dos dados', () => {
    const { coletar } = require(path.join(raiz, 'ferramentas', 'pendencias.js'));
    const L = require(path.join(raiz, 'ferramentas', 'lib_dados.js'));
    const fs = require('fs');
    let total = 0;
    for (const cfg of L.VARS) total += (fs.readFileSync(path.join(raiz, 'dados', cfg.arq), 'utf8').match(/PENDENTE DE VERIFICA[ÇC][ÃA]O/gi) || []).length;
    expect(coletar().length).toBe(total);
  });
  test('leitura de doses do texto (mg/kg, máximos) usada no relatório', () => {
    const { mgkg, maxDia, maxDose } = require(path.join(raiz, 'ferramentas', 'inconsistencias.js'));
    expect(mgkg('10-12 mg/kg/dose VO')).toEqual([{ lo: 10, hi: 12, base: 'dose', txt: '10-12 mg/kg/dose' }]);
    expect(mgkg('0,3–2,5 mg/kg/dia em 3 doses')[0]).toMatchObject({ lo: 0.3, hi: 2.5, base: 'dia' });
    expect(mgkg('30 mg/kg em dose única')[0]).toMatchObject({ lo: 30, hi: 30, base: null });
    expect(maxDia('máx. 1 g/dia')[0].mg).toBe(1000);
    expect(maxDia('máximo de 1.000 mg/dia')[0].mg).toBe(1000);
    expect(maxDose('máx. 500 mg/dose')[0].mg).toBe(500);
  });
});
