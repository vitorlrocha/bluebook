// Revisão clínica de prioridade 2 (faixas divergentes) — decisões do autor em 26/11/2026.
// 1) Fichas com texto de outro remédio (oxcarbazepina, nifurtimox, benznidazol) → dose do rótulo FDA.
// 2) Fichas com dose diferente da bula usada na calculadora (domperidona, cetoprofeno, clorpromazina, lincomicina) → dose
//    da bula. Os alertas que não são de dose (QT, dengue, distonia, colite) continuam no texto.
// 3) Ampicilina: via própria de meningite (300-400 mg/kg/dia, máx. 12 g/dia), tirada do texto da própria entrada.
// Uso: node curadoria/revisao-p2-2611.js  (idempotente)
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, '..', 'ferramentas', 'lib_dados'));
const salvar = (cfg, v) => fs.writeFileSync(path.join(L.RAIZ, 'dados', cfg.arq), L.formatarArquivo(cfg, v), 'utf8');

const cS = L.VARS.find((c) => c.v === 'SEED_MEDS'), S = L.lerDados(cS);
const PED = {
  'Oxcarbazepina': 'Rótulo FDA (oxcarbazepina suspensão, conferido em 11/2026): terapia adjuvante de 2 a 16 anos — início 8 a 10 mg/kg/dia em 2 tomadas (em geral até 600 mg/dia); manutenção pelo peso: 20-29 kg 900 mg/dia, 29,1-39 kg 1.200 mg/dia, > 39 kg 1.800 mg/dia. De 2 a < 4 anos pode precisar de até 60 mg/kg/dia. HLA-B*1502 em populações asiáticas; hiponatremia.',
  'Nifurtimox': 'Doença de Chagas, do nascimento (a termo, ≥ 2,5 kg) aos 18 anos. Rótulo FDA (Lampit, DailyMed setid 90d09714, conferido em 11/2026): < 41 kg 10 a 20 mg/kg/dia; ≥ 41 kg 8 a 10 mg/kg/dia; em 3 tomadas com alimento, por 60 dias.',
  'Benznidazol': 'Doença de Chagas de 2 a 12 anos. Rótulo FDA (DailyMed setid 8983d6a0, conferido em 11/2026): 5 a 8 mg/kg/dia em 2 tomadas por 60 dias, com tabela por faixa de peso (comprimidos de 12,5 e 100 mg). O texto anterior citava 5-10 mg/kg/dia, sem fonte.',
  'Domperidona': 'Bula Peridal (Mantecorp, profissional, conferida em 11/2026): adolescentes ≥ 12 anos com < 35 kg — 0,25 mg/kg 3x/dia antes das refeições (e, se preciso, ao deitar), máx. 1 mg/kg/dia e 35 mg/dia; eficácia não estabelecida em menores de 12 anos com < 35 kg; comprimidos só a partir de 35 kg. Risco de prolongamento do QT.',
  'Cetoprofeno': 'Bula Profenid gotas (Sanofi, conferida em 11/2026): acima de 1 ano, 1 gota/kg (1 gota = 1 mg) a cada 6 ou 8 h; 7 a 11 anos, 25 gotas a cada 6 ou 8 h; máx. 300 mg/dia. A forma IM/EV é contraindicada na faixa etária pediátrica (bula Profenid IM). Evitar na desidratação e na dengue.',
  'Clorpromazina': 'Rótulo FDA (clorpromazina, DailyMed setid d43718e5, conferido em 11/2026): de 6 meses a 12 anos, 1/4 mg por libra (≈ 0,55 mg/kg) a cada 4-6 h se necessário; abaixo de 6 meses só em situação que ameace a vida. Risco de distonia e hipotensão.',
  'Lincomicina': 'Rótulo FDA (Lincocin, DailyMed setid c01906fa, conferido em 11/2026): acima de 1 mês — IM 10 mg/kg a cada 24 h (graves) ou a cada 12 h (mais graves); EV 10 a 20 mg/kg/dia em doses divididas. Risco de colite pseudomembranosa.',
};
for (const [nome, txt] of Object.entries(PED)) {
  const m = S.find((x) => x.nome === nome);
  if (!m) throw new Error('ficha não encontrada: ' + nome);
  if (m.pediatria !== txt) console.log(nome + ':\n  antes: ' + m.pediatria + '\n  agora: ' + txt);
  m.pediatria = txt;
}
salvar(cS, S);

const cP = L.VARS.find((c) => c.v === 'PED_DB'), P = L.lerDados(cP);
const amp = P.find((e) => e.k === 'ampicilina');
if (!amp.v.some((v) => /meningite/.test(v.via))) {
  const b = amp.v[0];
  amp.v.push(Object.assign({}, b, {
    via: 'EV (meningite)', d: [300, 400], dd: 300, f: 4, mxd: 12000,
    ob: 'Meningite: 300-400 mg/kg/dia em 4 a 6 doses (máx. 12 g/dia). No recém-nascido a dose depende da idade gestacional e dos dias de vida: ver a via EV.',
    rev: b.rev + '. Via própria criada em 26/11/2026 (revisão P2, decisão do autor) a partir do texto desta entrada.',
  }));
}
salvar(cP, P);
console.log('OK');
