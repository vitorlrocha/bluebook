// Relatório de inconsistências ENTRE MÓDULOS (só leitura; nada é alterado automaticamente).
// Compara: calculadora pediátrica (PED_DB) × ficha do medicamento × plantão × prescrição das doenças,
// mais checagens de estrutura. Gera INCONSISTENCIAS.md. Cada item é "a revisar" por um humano com fonte:
// diferença de texto não prova erro (indicações, vias e faixas etárias diferentes podem justificar).
// Uso: node ferramentas/inconsistencias.js [--checar]
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib_dados');

const SAIDA = path.join(L.RAIZ, 'INCONSISTENCIAS.md');
const get = (v) => L.lerDados(L.VARS.find((c) => c.v === v));
const sem = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* número pt-BR: "1,5" → 1.5; "1.000" → 1000 */
function num(s) { s = String(s).trim(); if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ''); return parseFloat(s.replace(',', '.')); }
const N = '(\\d+(?:[.,]\\d+)?)';
/* Faixas e valores em mg/kg no texto: [{lo, hi, base:'dose'|'dia'|null, txt}] */
function mgkg(texto) {
  const out = [], s = String(texto || '');
  const rx = new RegExp(N + '(?:\\s*(?:-|–|a|até)\\s*' + N + ')?\\s*mg\\s*/\\s*kg(?:\\s*(?:/\\s*|por\\s+)(dose|dia|d\\b|tomada))?', 'gi');
  let m;
  while ((m = rx.exec(s))) {
    const lo = num(m[1]), hi = m[2] ? num(m[2]) : lo;
    const b = m[3] ? (/^d(ia)?$/i.test(m[3]) ? 'dia' : 'dose') : null;
    if (isFinite(lo) && isFinite(hi)) out.push({ lo, hi, base: b, txt: m[0] });
  }
  return out;
}
/* "máx. 1 g/dia", "máximo de 4000 mg/dia" → mg/dia */
function maxDia(texto) {
  const out = [], rx = new RegExp('m[aá]x(?:imo|ima)?\\.?\\s*(?:de\\s*)?' + N + '\\s*(mg|g)\\s*/\\s*dia', 'gi');
  let m; while ((m = rx.exec(String(texto || '')))) out.push({ mg: num(m[1]) * (m[2].toLowerCase() === 'g' ? 1000 : 1), txt: m[0] });
  return out;
}
function maxDose(texto) {
  const out = [], rx = new RegExp('m[aá]x(?:imo|ima)?\\.?\\s*(?:de\\s*)?' + N + '\\s*(mg|g)\\s*(?:/\\s*(?:dose|tomada)|por\\s+(?:dose|tomada))', 'gi');
  let m; while ((m = rx.exec(String(texto || '')))) out.push({ mg: num(m[1]) * (m[2].toLowerCase() === 'g' ? 1000 : 1), txt: m[0] });
  return out;
}
const fx = (r) => (r.lo === r.hi ? fmt(r.lo) : fmt(r.lo) + '-' + fmt(r.hi)) + ' mg/kg' + (r.base ? '/' + r.base : '');
const fmt = (x) => String(Math.round(x * 1000) / 1000).replace('.', ',');
const sobrepoe = (a, b) => a.lo <= b.hi && b.lo <= a.hi;

/* mesma regra do app (pedFind em src/app.js): prefixo normalizado mais longo; associação só com entrada própria */
function pedPrefixo(PED, nome) { const s = sem(nome); let best = null; PED.forEach((e) => { if (s.indexOf(e.k) === 0 && (!best || e.k.length > best.k.length)) best = e; }); return best; }
function pedFind(PED, nome) { const b = pedPrefixo(PED, nome); return b && /\+/.test(nome) && !/\+/.test(b.n) ? null : b; }
/* Só rotas com faixa em mg/kg (penicilina cristalina, por exemplo, é em UI/kg e não é comparável). */
function rotasComDose(e) { return (e.v || []).filter((r) => Array.isArray(r.d) && r.d.length === 2 && (r.un || 'mg') === 'mg').map((r) => ({ via: r.via, lo: r.d[0], hi: r.d[1], base: r.b || 'dose', mx: r.mx, mxd: r.mxd, ob: r.ob || '' })); }
/* Vias comparáveis: EV/IV/IO juntos; IM; VO; retal; nebulização; uso local (infiltrativa/tópica). */
function vias(t) {
  const s = sem(t), out = new Set();
  if (/\b(ev|iv|io|endoven|intraven|intraoss)/.test(s)) out.add('ev');
  if (/\bim\b|intramusc/.test(s)) out.add('im');
  if (/\bvo\b|oral/.test(s)) out.add('vo');
  if (/retal/.test(s)) out.add('retal');
  if (/nebul|inal/.test(s)) out.add('inal');
  if (/infiltr|local|topic|bloqueio/.test(s)) out.add('local');
  return out;
}
const viaCompativel = (a, b) => { const x = vias(a), y = vias(b); if (!x.size || !y.size) return true; for (const v of x) if (y.has(v)) return true; return false; };
/* toda faixa da ficha cabe em alguma faixa da calculadora */
const contida = (a, rotas) => rotas.some((b) => a.lo >= b.lo - 1e-9 && a.hi <= b.hi + 1e-9);

function analisar() {
  const MEDS = get('SEED_MEDS'), DIS = get('DISEASES'), PED = get('PED_DB'), PL = get('PLANTAO'), MEDX = get('MEDX');
  const R = { pedInterno: [], fichaXped: [], assoc: [], plantaoXped: [], prescXped: [], semBase: [], medxSemFicha: [], pedSemFicha: [] };

  // 1. Coerência interna do PED_DB: texto "ob" × campos numéricos (mx, mxd)
  for (const e of PED) for (const r of e.v || []) {
    // O texto pode citar vários máximos (por idade ou gravidade); só marca se o do campo não é nenhum deles.
    const tdia = maxDia(r.ob), tdose = maxDose(r.ob);
    if (r.mxd && tdia.length && !tdia.some((x) => Math.abs(x.mg - r.mxd) <= 0.5)) R.pedInterno.push([e.n, r.via, 'máx. diário', 'texto: ' + tdia.map((x) => '"' + x.txt + '"').join(', '), `campo mxd: ${fmt(r.mxd)} mg`]);
    if (r.mx && tdose.length && !tdose.some((x) => Math.abs(x.mg - r.mx) <= 0.5)) R.pedInterno.push([e.n, r.via, 'máx. por dose', 'texto: ' + tdose.map((x) => '"' + x.txt + '"').join(', '), `campo mx: ${fmt(r.mx)} mg`]);
    if (Array.isArray(r.d) && r.dd != null && (r.dd < r.d[0] || r.dd > r.d[1])) R.pedInterno.push([e.n, r.via, 'dose padrão fora da faixa', `dd: ${fmt(r.dd)}`, `faixa d: ${fmt(r.d[0])}-${fmt(r.d[1])}`]);
  }

  // 2. Ficha do medicamento (campo Pediatria) × calculadora pediátrica
  const usados = new Set();
  for (const m of MEDS) {
    const e = pedFind(PED, m.nome);
    const p0 = pedPrefixo(PED, m.nome);
    if (!e && p0) { R.assoc.push([m.nome, p0.n]); continue; }   // associação: sem calculadora (por desenho, v72)
    if (!e) continue;
    usados.add(e.k);
    const rotas = rotasComDose(e);
    const fic = mgkg(m.pediatria).filter((x) => x.base);
    for (const base of ['dose', 'dia']) {
      const f = fic.filter((x) => x.base === base), p = rotas.filter((x) => x.base === base);
      if (!f.length || !p.length) continue;
      if (!f.some((a) => p.some((b) => sobrepoe(a, b)))) R.fichaXped.push([m.nome, 'faixas sem sobreposição', f.map(fx).join('; '), p.map((r) => r.via + ' ' + fx(r)).join('; '), 'alta']);
      else if (!f.every((a) => contida(a, p))) R.fichaXped.push([m.nome, 'faixa da ficha sai da faixa da calculadora', f.map(fx).join('; '), p.map((r) => r.via + ' ' + fx(r)).join('; '), 'média']);
    }
    const fmax = maxDia(m.pediatria), pmax = rotas.filter((r) => r.mxd).map((r) => r.mxd);
    if (fmax.length && pmax.length && !fmax.some((a) => pmax.some((b) => Math.abs(a.mg - b) <= 0.5)))
      R.fichaXped.push([m.nome, 'máx. diário diferente', fmax.map((x) => x.txt).join('; '), pmax.map((x) => fmt(x) + ' mg/dia').join('; '), 'média']);
  }
  for (const e of PED) if (!usados.has(e.k)) R.pedSemFicha.push([e.n, e.k]);

  // 3. Plantão × calculadora pediátrica (mesma substância, dose por dose em mg/kg)
  for (const p of PL) for (const it of p.itens || []) {
    const [nome, via, dkg, un, mx] = it;
    if (un !== 'mg' || typeof dkg !== 'number') continue;
    const e = pedFind(PED, nome); if (!e) continue;
    const rotas = rotasComDose(e).filter((r) => r.base === 'dose' && viaCompativel(via, r.via));
    if (!rotas.length) continue;
    if (!rotas.some((r) => dkg >= r.lo - 1e-9 && dkg <= r.hi + 1e-9)) R.plantaoXped.push([p.nome, nome + ' (' + via + ')', fmt(dkg) + ' mg/kg/dose' + (mx ? ' · máx. ' + fmt(mx) + ' mg' : ''), rotas.map((r) => r.via + ' ' + fx(r) + (r.mx ? ' · máx. ' + fmt(r.mx) + ' mg' : '')).join('; '), 'dose fora da faixa']);
    else if (mx && rotas.every((r) => r.mx) && !rotas.some((r) => Math.abs(r.mx - mx) <= 0.5)) R.plantaoXped.push([p.nome, nome + ' (' + via + ')', 'máx. ' + fmt(mx) + ' mg', rotas.map((r) => r.via + ' máx. ' + fmt(r.mx) + ' mg').join('; '), 'máximo diferente']);
  }

  // 4. Prescrição das doenças PEDIÁTRICAS × calculadora pediátrica (mg/kg citado logo após o nome do fármaco).
  //    Chave = e.k (a mesma do app), com limite de palavra; "alergia à penicilina" não conta como dose.
  //    A janela termina no próximo fármaco/alternativa (+, ou, vírgula, parêntese, ponto e vírgula).
  const chaves = PED.map((e) => ({ e, k: e.k })).filter((x) => x.k.length >= 5);
  for (const d of DIS) {
    const presc = String(d.prescricao || '');
    if (presc && !/(^|\n)\s*Base\s*:/i.test(presc)) R.semBase.push([d.nome, d.area]);
    if (d.area !== 'Pediatria') continue;
    for (const linha of presc.split('\n')) {
      const ln = sem(linha);
      for (const { e, k } of chaves) {
        const rk = new RegExp('(^|[^a-z])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z])', 'g');
        let mm;
        while ((mm = rk.exec(ln))) {
          const i = mm.index + mm[1].length;
          if (/(alerg|a\s*)$/.test(ln.slice(Math.max(0, i - 12), i)) && /alerg/.test(ln.slice(Math.max(0, i - 14), i))) continue;
          const janela = linha.slice(i, i + 90).split(/\s\+\s|\sou\s|[;,(\n]|\. /)[0];
          const doses = mgkg(janela).filter((x) => x.base);
          const rotas = rotasComDose(e);
          for (const x of doses) {
            const p = rotas.filter((r) => r.base === x.base);
            if (p.length && !p.some((r) => sobrepoe(x, r))) R.prescXped.push([d.nome, e.n, janela.trim().slice(0, 100), p.map((r) => r.via + ' ' + fx(r)).join('; ')]);
          }
        }
      }
    }
  }

  // 5. MEDX sem ficha correspondente
  const nomes = new Set(MEDS.map((m) => sem(m.nome)));
  for (const k of Object.keys(MEDX)) if (!nomes.has(sem(k))) R.medxSemFicha.push([k]);

  // dedup
  for (const k of Object.keys(R)) { const s = new Set(); R[k] = R[k].filter((r) => { const j = JSON.stringify(r); if (s.has(j)) return false; s.add(j); return true; }); }
  return R;
}

function markdown(R) {
  const esc = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const tab = (cab, linhas) => linhas.length ? '| ' + cab.join(' | ') + ' |\n|' + cab.map(() => '---').join('|') + '|\n' + linhas.map((l) => '| ' + l.map(esc).join(' | ') + ' |').join('\n') + '\n' : '_Nenhuma._\n';
  const sec = [
    ['1. Calculadora pediátrica: texto × números da mesma ficha', 'O texto de observação (`ob`) cita um máximo diferente do campo numérico usado no cálculo (`mx`/`mxd`), ou a dose padrão está fora da faixa.', ['Fármaco', 'Via', 'O quê', 'Texto', 'Campo'], R.pedInterno],
    ['2. Ficha do medicamento (Pediatria) × calculadora pediátrica', 'Faixa em mg/kg (mesma base: por dose ou por dia) ou máximo diário diferentes. "alta" = nenhuma faixa se sobrepõe.', ['Medicamento', 'Divergência', 'Ficha (campo Pediatria)', 'Calculadora (PED_DB)', 'Prioridade'], R.fichaXped.sort((a, b) => (a[4] === 'alta' ? 0 : 1) - (b[4] === 'alta' ? 0 : 1) || a[0].localeCompare(b[0], 'pt'))],
    ['3. Associações sem calculadora pediátrica (informativo)', 'Desde a v72 (Etapa 3) uma ficha de associação ("A + B") não usa mais os parâmetros do fármaco isolado A — antes, por exemplo, o colírio de dexametasona mostrava a dose sistêmica. Estas fichas ficam sem o quadro "Dose pediátrica por peso" até que alguém cadastre, com fonte, uma entrada própria da associação no PED_DB.', ['Ficha (associação)', 'Parâmetros que usava até a v71'], R.assoc],
    ['4. Plantão × calculadora pediátrica', 'Dose por kg do protocolo fora da faixa da calculadora, ou máximo por dose diferente, para a mesma substância.', ['Protocolo', 'Item', 'Plantão', 'Calculadora (PED_DB)', 'Divergência'], R.plantaoXped],
    ['5. Prescrição das doenças pediátricas × calculadora pediátrica', 'Doenças da área Pediatria: dose em mg/kg citada logo após o nome do fármaco, sem sobreposição com a faixa da calculadora (mesma base: por dose ou por dia). Pode ser indicação específica (profilaxia, meningite, neonato): conferir se a calculadora deveria cobrir essa faixa ou se o texto deve citar a indicação.', ['Doença', 'Fármaco', 'Trecho da prescrição', 'Calculadora (PED_DB)'], R.prescXped],
    ['6. Prescrições sem linha "Base:"', 'Regra do projeto (CLAUDE.md): toda prescrição deve ter a linha "Base: ..." com a referência.', ['Doença', 'Área'], R.semBase],
    ['7. Detalhes (MEDX) sem ficha de mesmo nome', 'Mecanismo/ajuste renal/efeitos de um nome que não existe exatamente na lista de medicamentos (não aparece na ficha).', ['Nome no MEDX'], R.medxSemFicha],
    ['8. Calculadora pediátrica sem ficha correspondente', 'Entrada do PED_DB que nenhuma ficha usa (aparece só em "Protocolos de referência fora da sua base").', ['Fármaco', 'Chave'], R.pedSemFicha],
  ];
  let md = '# Inconsistências entre módulos\n\n' +
    'Gerado por `node ferramentas/inconsistencias.js` a partir de `dados/*.json`. **Não edite à mão.**\n\n' +
    '**Nada foi alterado automaticamente.** Cada linha é um ponto *a revisar* com fonte (SBP, MS/PCDT, bula Anvisa). ' +
    'Diferença de texto não prova erro: indicação, via, faixa etária ou dose de ataque podem justificar. ' +
    'A comparação é mecânica (números em mg/kg, mg/dia e mg/dose lidos do texto) e pode deixar passar casos escritos de outro jeito.\n\n' +
    '| Verificação | Itens |\n|---|---:|\n' + sec.map((s) => `| ${s[0]} | ${s[3].length} |`).join('\n') + '\n';
  for (const [t, d, cab, linhas] of sec) md += `\n## ${t}\n\n${d}\n\n` + tab(cab, linhas);
  return md;
}

if (require.main === module) {
  const R = analisar(), md = markdown(R);
  if (process.argv.includes('--checar')) {
    const atual = fs.existsSync(SAIDA) ? fs.readFileSync(SAIDA, 'utf8') : '';
    if (atual !== md) { console.error('INCONSISTENCIAS.md desatualizado: rode node ferramentas/inconsistencias.js'); process.exit(1); }
    console.log('OK INCONSISTENCIAS.md em dia');
  } else {
    fs.writeFileSync(SAIDA, md, 'utf8');
    for (const [k, v] of Object.entries(R)) console.log(k.padEnd(14), v.length);
  }
}
module.exports = { analisar, mgkg, maxDia, maxDose };
