// Revisão clínica de prioridade 2 (faixas divergentes) — decisões do autor em 27/11/2026.
// 1) Hidrocortisona injetável na anafilaxia da criança: ficha e calculadora pelo Protocolo SAMU 192 – Suporte Avançado de
//    Vida, 2ª ed. (MS, 2016), APed26 — 5 a 10 mg/kg/dose IV/IO, máx. 250 mg. A faixa do rótulo FDA/AAP (4-8 mg/kg) fica como
//    observação. O texto antigo da ficha (2-4 mg/kg) não tinha fonte.
// 2) Cefotaxima na meningite do RN ("Febre sem sinais de localização"): mantida, marcada como conferida (ver revisao_conferidas.json).
// Uso: node curadoria/revisao-p2-2711.js  (idempotente)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const salvar = (cfg, v) => fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, v), 'utf8');
const SAMU = 'Protocolo SAMU 192 – Suporte Avançado de Vida, 2ª ed., MS, 2016, APed26';

const cS = L.VARS.find((c) => c.v === 'SEED_MEDS'), S = L.lerDados(cS);
const h = S.find((x) => x.nome === 'Hidrocortisona (injetável)');
const antigo = 'Permitida (anafilaxia 2–4 mg/kg/dose; choque refratário 50–100 mg/m²); hiperglicemia.';
const novo = `Permitida. Anafilaxia: 5–10 mg/kg/dose IV/IO, máx. 250 mg (${SAMU}); o Formulário Terapêutico Nacional 2010 traz dose fixa por idade — 25 mg (1 mês a 1 ano), 50 mg (1 a 5 anos), 100 mg (6 a 12 anos) IM/IV a cada 8 h. Choque refratário 50–100 mg/m². Hiperglicemia.`;
if (h.pediatria === antigo) h.pediatria = novo;
else if (h.pediatria !== novo) throw new Error('texto da ficha mudou: ' + h.pediatria);
salvar(cS, S);

const cP = L.VARS.find((c) => c.v === 'PED_DB'), P = L.lerDados(cP);
const e = P.find((x) => x.k === 'hidrocortisona'), v = e.v[0];
if (v.d[0] !== 5) {
  Object.assign(v, {
    d: [5, 10], dd: 5, mx: 250,
    ob: `Anafilaxia: 5-10 mg/kg/dose IV/IO (máx. 250 mg) — ${SAMU}. Rótulo FDA/AAP (anafilaxia e asma grave): 4-8 mg/kg/dose, máx. 250 mg. Crise adrenal: 2-3 mg/kg EV/IO em bolus (máx. 100 mg), depois 50-100 mg/m²/dia em 4 doses. Reposição fisiológica: 8-10 mg/m²/dia VO em 3 doses; estresse: dobrar/triplicar a dose na febre.`,
    rev: v.rev + `. Faixa trocada em 27/11/2026 (revisão P2, decisão do autor) pela do ${SAMU}; conferida no PDF original.`,
  });
}
salvar(cP, P);
console.log('OK hidrocortisona: ficha e calculadora pelo SAMU APed26');
