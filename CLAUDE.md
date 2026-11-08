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
  Também copia o PWA de `src/pwa/` para `dist/`: `manifest.json`, `icones/`, `sw.js` (com a versão =
  hash do conteúdo, que renova o cache a cada mudança) e `.nojekyll`.
- PWA: ícones gerados de `src/pwa/icone.svg` por `node ferramentas/gerar_icones.js` (usa o Chromium do
  Playwright; os PNG ficam no git). O registro do service worker fica no fim de `src/index.html` e é
  ignorado quando o arquivo é aberto direto do disco (file://), que continua funcionando offline sozinho.
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
- Testes de regressão: `testes/regressao.spec.js` exige que ~90 buscas deem a MESMA lista que a v71
  (`referencia/`); `testes/visual.ambos.spec.js` compara capturas de tela (claro/escuro, computador/celular)
  — mudança visual intencional: `npx playwright test visual --update-snapshots`; `testes/acessibilidade.ambos.spec.js`
  roda axe-core (WCAG 2.1 AA) e testa teclado (Esc, foco), botão Aa e legibilidade.
- Ferramentas de diagnóstico (dev): `ferramentas/medir_desempenho.js [--cpu=4]` (tempo de carga e de busca),
  `ferramentas/estilos_computados.js` (impressão digital dos estilos para provar que CSS não mudou),
  `ferramentas/css_limpar.js` (remove só declarações sobrescritas e seletores de classes inexistentes).
- CSS em 3 camadas (ordem importa): 1. base, 2. tema moderno (padrão), 3. acessibilidade (contraste AA).
  Fundos azuis com texto branco usam `--accent-fill` (no escuro é mais fechado que `--accent`).
- Busca: o texto normalizado de cada registro fica em cache (`hayOf`, `medHay`, `disHay`) e um filtro de
  Bloom de trigramas (`matchRec`) descarta registros sem o termo — o resultado é idêntico ao de `matchTerm`.
  Se mudar os campos pesquisados, mude só `medHay`/`disHay`.
- A calculadora pediátrica acessível ao usuário é o quadro "Dose pediátrica por peso" na ficha do
  medicamento (prefixo `fp-`). A janela "Ferramentas" (`openCalcModal`: calculadora, IG, dose pediátrica,
  renal, IMC, risco CV, fluidos, infusão, corticoides) abre por `#calc-btn` (cabeçalho, computador) e pelo
  item `data-tb="tools"` da folha "Mais" (celular). Na v71 estava inacessível.

- **Design:** siga `docs/DESIGN.md` (tokens, tipografia, componentes, o que não fazer). Conferido por
  `testes/design.ambos.spec.js`. Ao mudar o visual de propósito, atualize o DESIGN.md e as capturas.
- **Roadmap e etapas:** `ROADMAP.md`. Testes de uso real (favoritos, anotações, backup, Ajustes) em
  `testes/uso_real.ambos.spec.js`.

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
node ferramentas/testar_build.js              # contagens e dados iguais aos da v71 (enquanto não houver mudança de conteúdo)
npx playwright test                           # testes de ponta a ponta (inclui PWA/offline)
python3 ferramentas/test_cid.py dados/cid10-datasus dados/cid_full.json dist/index.html   # se regenerar o CID
```
No Windows, use `py` no lugar de `python3`. O git está em
`%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe` (não está no PATH).
Para gerar `dados/cid_full.json` a partir dos CSVs: `python3 ferramentas/build_cid.py dados/cid10-datasus dados/cid_full.json`.

## Pendências conhecidas (sugestões para finalizar)
1. ~~Separar dados do código~~ (feito na v72).
2. ~~PWA instalável~~ (feito na v72; testado no Chromium — instalação no iPhone/Safari não testada).
3. 31 fichas ainda contêm "PENDENTE DE VERIFICAÇÃO" (ex.: posologia do glofitamabe).
4. ~~Testes automatizados (Playwright)~~ (feito na v72). Os problemas conhecidos da v71 (ranking de "AAS",
   destaque de "Remédios") foram corrigidos na etapa R1; `testes/regressao.spec.js` lista as buscas que mudaram de propósito.
5. ~~Limpeza de CSS, desempenho e acessibilidade~~ (feito na v72). Resta: listas com 1-2 letras digitadas
   desenham ~1.800 itens (≈60 ms no computador, ≈370 ms em celular simulado 4× mais lento) — custo de DOM,
   não do índice; resolver exigiria lista virtualizada ou limite de itens (mudança de interface).
6. Publicação: hospedar (ex.: GitHub Pages/Netlify) e, se desejado, empacotar para lojas.
