# Bluebook — guia do projeto para o Claude Code

App de consulta clínica em português do Brasil (doenças, condutas, medicamentos, CID-10,
escores, calculadoras, modo plantão). O app final é **um único arquivo** `dist/index.html` (~7 MB),
sem dependências externas em tempo de execução, funciona offline. Interface inspirada nas convenções do iOS.

## Organização do repositório (desde a v72)
- `src/index.html`: casca HTML com os marcadores `/*@css*/` e `/*@app*/`.
- `src/styles.css`: conteúdo do `<style>`. `src/app.js`: conteúdo do `<script>` principal (IIFE).
- `dados/*.json`: dados extraídos. Em `src/app.js` cada variável aparece como
  `var NOME = /*@dados:NOME*/[]` e o build insere o literal no lugar.
  - Arquivos: seed_meds, diseases, cid_full, ped_db, medx, plantao, scores, atb, vac, flux, ecg,
    lab, calcs, especialidades, class_groups (`.json`). A tabela de variáveis/arquivos fica em `ferramentas/lib_dados.js`.
  - Convenções JSON para o que não é dado puro: `{"$fn": [linhas]}` = função (SCORES.interp/run, CALCS.f);
    `{"$re": "fonte", "flags": ""}` = regex (CLASS_GROUPS); `{"$ref": "SEXO"}` = variável de `app.js`.
  - `CALC_ITEMS` não é dado: é derivado de `CALCS` em tempo de execução (`CALCS.map`), por isso o arquivo é `calcs.json`.
- `ferramentas/build.js` gera `dist/index.html` (Node puro, sem dependências). `dist/` não vai para o git.
- `ferramentas/testar_build.js` prova a equivalência com `referencia/index-v71-original.html`
  (contagens, valor de cada variável e todo o resto do arquivo idêntico).
- `ferramentas/extrair.js` foi usado uma vez para separar a v71; não é preciso rodar de novo.
- `ferramentas/servir.js`: servidor estático local (`node ferramentas/servir.js dist 8080`).
- Para editar conteúdo: altere `dados/*.json` (ou `src/`), rode o build e as verificações.
- Testes de ponta a ponta (Playwright, só dependência de desenvolvimento): `testes/*.spec.js`,
  config em `playwright.config.js`. Rodar: `npx playwright test` (faz o build e sobe o servidor na porta 4173).
  Projetos: `computador` (1366×860) e `celular` (Pixel 7); arquivos `*.celular.spec.js` só no celular,
  `*.ambos.spec.js` nos dois. `testes/apoio.js` falha qualquer teste com erro de JavaScript no console.
  Testes com `test.fail` documentam problemas conhecidos (passam enquanto o problema existir).
- A calculadora pediátrica acessível ao usuário é o quadro "Dose pediátrica por peso" na ficha do
  medicamento (prefixo `fp-`). O modal "Calculadoras" (`openCalcModal`) só abre por `#calc-btn`,
  que o CSS esconde — ficou inacessível desde a v71.

## Estrutura do app (dentro de dist/index.html)
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
  - `SCORES` (40), `ATB` (31), `VAC` (8), `FLUX` (17), `ECG` (7), `CALCS`/`CALC_ITEMS` (16), `LAB` (12),
    `ESPECIALIDADES` (47), `CLASS_GROUPS` (59 grupos terapêuticos por regex).
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
node ferramentas/build.js                     # gera dist/index.html
node ferramentas/checar_sintaxe.js            # todos os <script> de dist/index.html válidos
python3 ferramentas/validar_cid.py            # deve imprimir [] (lê dist/index.html)
node ferramentas/testar_build.js              # só enquanto o conteúdo for igual ao da v71
python3 ferramentas/test_cid.py dados/cid10-datasus dados/cid_full.json dist/index.html   # se regenerar o CID
```
No Windows, use `py` no lugar de `python3`. O git está em
`%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe` (não está no PATH).
Para gerar `dados/cid_full.json` a partir dos CSVs: `python3 ferramentas/build_cid.py dados/cid10-datasus dados/cid_full.json`.

## Pendências conhecidas (sugestões para finalizar)
1. ~~Separar dados do código~~ (feito na v72).
2. Transformar em PWA instalável (manifest + service worker, ícones) para uso offline no celular.
3. 31 fichas ainda contêm "PENDENTE DE VERIFICAÇÃO" (ex.: posologia do glofitamabe).
4. ~~Testes automatizados (Playwright)~~ (feito na v72). Problemas conhecidos marcados com `test.fail`:
   ranking de "AAS" e destaque de "Remédios" na barra inferior.
5. Limpeza de CSS: o arquivo acumula camadas de estilo; consolidar no tema moderno do fim.
6. Publicação: hospedar (ex.: GitHub Pages/Netlify) e, se desejado, empacotar para lojas.
