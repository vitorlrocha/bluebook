# Bluebook — guia do projeto para o Claude Code

App de consulta clínica em português do Brasil (doenças, condutas, medicamentos, CID-10,
escores, calculadoras, modo plantão). Hoje é **um único arquivo** `index.html` (~7 MB),
sem build, sem dependências externas, funciona offline. Interface inspirada nas convenções do iOS.

## Estrutura atual (dentro de index.html)
- `<style>`: tokens de cor em `:root` (+ modo escuro em `@media (prefers-color-scheme: dark)`
  e `:root[data-theme="dark"]`). O tema moderno fica no FIM do `<style>` e sobrescreve o anterior.
- Um `<script>` curto logo após `<body>` aplica o zoom salvo (`localStorage "bluebook:zoom"`).
- `<script>` principal: um IIFE em JavaScript puro. Dados embutidos:
  - `SEED_MEDS`: 1 medicamento por linha, cada linha começa com `    {"nome":` (1.851 itens).
    Campos: nome, classe, tarja, via, generico, referencias, apresentacoes, indicacoes, posologia,
    contraindicacoes, interacoes, observacoes, pediatria, gestacao, lactacao, areas, esp.
  - `DISEASES`: 1 doença por linha, cada linha começa com `    {"area":` (3.226 itens).
    Campos: area, nome, introducao, criterios, exames, tratamento, conduta, prescricao
    (deve ter linha "Base: ..."), cid, esp.
  - `CID_FULL`: CID-10 completo do DATASUS {cap, grp, cat (2.045), sub (12.451)}.
  - `PED_DB`: base da calculadora pediátrica (77 medicamentos; campos d, dd, b, f, mx, mxd, mdk,
    un, fx, fixo, ob, al, rev, fonte).
  - `MEDX`: mecanismo/ajuste renal/hepático/efeitos adversos/RENAME de 74 medicamentos.
  - `PLANTAO`: 12 protocolos de emergência com doses por peso.
  - `SCORES`, `ATB`, `VAC`, `FLUX`, `ECG`, `CALC_ITEMS`, `LAB`, `ESPECIALIDADES` (47),
    `CLASS_GROUPS` (61 grupos terapêuticos por regex).
- Busca: `termSets`/`SYN`/`SYN2` (siglas), `tokMatch`, `matchTerm`, `relScore` (relevância),
  `gsBuild`/`gsAll`/`globalSearchHtml` (busca universal), fuzzy por `editDist`.
- Navegação: `switchViewMode(mode)`; abas extras via objeto `REFS` (`makeRef`).
  No celular há barra de abas inferior (`#tabbar`) e folha "Mais" (`#sheet`).
- Selo de confiabilidade: `trustLevel`/`trustBadge` ("Fonte oficial", "Revisado pelo autor",
  "Pendente" quando o texto contém "PENDENTE DE VERIFICAÇÃO").

## Regras de conteúdo (obrigatórias)
- Nunca inventar doses, códigos CID ou referências. Na dúvida: "PENDENTE DE VERIFICAÇÃO".
- CID somente códigos válidos na CID-10 brasileira (DATASUS) — rodar `ferramentas/validar_cid.py`.
- Doses pediátricas: preferir SBP, Ministério da Saúde/PCDT, bula Anvisa; citar fonte e ano.
- Não reintroduzir botões de editar/excluir/novo medicamento.
- Não usar marca, textos ou layout proprietário de outros apps (ex.: Whitebook).

## Verificações antes de entregar qualquer mudança
```bash
node ferramentas/checar_sintaxe.js            # todos os <script> válidos
python3 ferramentas/validar_cid.py            # deve imprimir []
python3 ferramentas/test_cid.py dados/cid10-datasus dados/cid_full.json index.html   # se regenerar o CID
```
Para gerar `dados/cid_full.json` a partir dos CSVs: `python3 ferramentas/build_cid.py dados/cid10-datasus dados/cid_full.json`.

## Pendências conhecidas (sugestões para finalizar)
1. Separar dados do código: extrair SEED_MEDS, DISEASES, CID_FULL, PED_DB etc. para `dados/*.json`
   e criar um script de build que gere o `index.html` final (manter a versão de arquivo único).
2. Transformar em PWA instalável (manifest + service worker, ícones) para uso offline no celular.
3. 31 fichas ainda contêm "PENDENTE DE VERIFICAÇÃO" (ex.: posologia do glofitamabe).
4. Testes automatizados (Playwright) para busca, CID, calculadora pediátrica e modo plantão.
5. Limpeza de CSS: o arquivo acumula camadas de estilo; consolidar no tema moderno do fim.
6. Publicação: hospedar (ex.: GitHub Pages/Netlify) e, se desejado, empacotar para lojas.
