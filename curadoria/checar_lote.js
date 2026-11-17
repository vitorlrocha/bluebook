// Checagem de um lote de curadoria (somente leitura de dados/).
// Uso: node curadoria/checar_lote.js curadoria/lote-01.json
'use strict';
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const L = require(path.join(raiz, 'ferramentas', 'lib_dados'));

const arq = process.argv[2] || path.join(__dirname, 'lote-01.json');
const erros = [], avisos = [];
let lote;
try { lote = JSON.parse(fs.readFileSync(arq, 'utf8')); }
catch (e) { console.error('JSON inválido:', e.message); process.exit(1); }

const C = JSON.parse(fs.readFileSync(path.join(raiz, 'dados', 'cid_full.json'), 'utf8'));
const validos = new Set([...C.cat.map(c => c[0]), ...C.sub.map(s => s[0])]);
const ESP = new Set(JSON.parse(fs.readFileSync(path.join(raiz, 'dados', 'especialidades.json'), 'utf8')));
const D = L.lerDados(L.VARS.find(c => c.v === 'DISEASES'));
const AREAS = new Set(D.map(d => d.area));
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const nomesAcervo = new Map(D.map(d => [norm(d.nome), d.nome]));
const CAMPOS = ['area', 'nome', 'introducao', 'criterios', 'exames', 'tratamento', 'conduta', 'prescricao', 'cid', 'esp'];

if (!lote.lote || !lote.criadoEm || !Array.isArray(lote.doencas)) erros.push('cabeçalho do lote incompleto');
(lote.doencas || []).forEach((item, i) => {
  const r = item.registro || {}, id = `#${i + 1} ${r.nome || '?'}`;
  const chaves = Object.keys(r);
  if (chaves.join() !== CAMPOS.join()) erros.push(`${id}: campos/ordem diferentes do acervo (${chaves.join(',')})`);
  CAMPOS.forEach(c => { if (typeof r[c] !== 'string' || !r[c].trim()) erros.push(`${id}: campo vazio ${c}`); });
  if (!AREAS.has(r.area)) erros.push(`${id}: área inexistente no acervo: ${r.area}`);
  String(r.esp || '').split(';').map(s => s.trim()).filter(Boolean)
    .forEach(e => { if (!ESP.has(e)) erros.push(`${id}: especialidade inválida: ${e}`); });
  const ult = String(r.prescricao || '').trim().split('\n').pop();
  if (!/^Base: .+/.test(ult)) erros.push(`${id}: prescrição não termina com linha "Base: ..."`);
  String(r.cid || '').split(',').map(s => s.trim()).forEach(c => {
    if (!/^[A-Z]\d\d(\.\d)?$/.test(c)) erros.push(`${id}: CID com formato inválido: ${c}`);
    else if (!validos.has(c.replace('.', ''))) erros.push(`${id}: CID inexistente em cid_full.json: ${c}`);
  });
  if (nomesAcervo.has(norm(r.nome))) erros.push(`${id}: nome já existe no acervo`);
  const cids = String(r.cid).split(',').map(s => s.trim());
  D.forEach(d => {
    const outros = String(d.cid).split(/[,;]/).map(s => s.trim());
    const em = cids.filter(c => outros.includes(c));
    if (em.length) avisos.push(`${id}: CID ${em.join(', ')} também usado por "${d.nome}"`);
  });
  if (!Array.isArray(item.fontes)) erros.push(`${id}: fontes ausente`);
  else item.fontes.forEach((f, j) => ['titulo', 'instituicao', 'ano', 'url', 'usadoPara']
    .forEach(k => { if (!f[k]) erros.push(`${id}: fonte ${j + 1} sem ${k}`); }));
  if (typeof item.observacoes !== 'string') erros.push(`${id}: observacoes ausente`);
});

console.log(`Lote ${lote.lote}: ${(lote.doencas || []).length} registros`);
avisos.forEach(a => console.log('AVISO', a));
erros.forEach(e => console.log('ERRO ', e));
console.log(erros.length ? `${erros.length} erro(s)` : 'OK: JSON válido, campos, áreas, especialidades, Base e CID conferidos');
process.exit(erros.length ? 1 : 0);
