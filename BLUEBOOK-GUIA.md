# BLUEBOOK — Guia completo do projeto (documento único)

**Para:** Claude Code (o chat que está desenvolvendo o app) e o autor.
**Versão de referência do app:** v73 (`index.html`), novembro de 2026.
**Como usar:** coloque este arquivo na raiz do projeto com o nome `BLUEBOOK-GUIA.md` e peça ao Claude Code para lê-lo inteiro antes de qualquer tarefa (o comando está na Parte 9). Ele **substitui** os arquivos separados `CLAUDE.md` (parte de arquitetura), `DESIGN-bluebook.md` e `CONTEUDO-CLINICO-bluebook.md`. Se esses arquivos já existirem na pasta, este guia prevalece.

## Sumário
- Parte 1 — O que já foi feito (histórico do chat de criação)
- Parte 2 — Pesquisa rápida: como trabalhar sem lentidão (sem agentes)
- Parte 3 — Arquitetura do app e ferramentas
- Parte 4 — Regras de conteúdo clínico
- Parte 5 — Especificação de design e layout
- Parte 6 — Regras contra regressão (não perder funções)
- Parte 7 — Fontes já usadas e conferidas
- Parte 8 — Pendências priorizadas
- Parte 9 — Comandos prontos, em ordem

---

# Parte 1 — O que já foi feito (histórico do chat de criação)

O app foi construído num chat do Claude ao longo de outubro e novembro de 2026, em cerca de 73 versões publicadas. **Nada disso deve ser refeito**: o trabalho do Claude Code é partir da v73 e melhorar.

## 1.1 Números atuais (v73)
| Item | Quantidade |
|---|---|
| Doenças/condutas | 3.226 |
| Medicamentos | 1.851 (60 grupos terapêuticos + classes detalhadas) |
| CID-10 completo (DATASUS) | 22 capítulos, 275 grupos, 2.045 categorias, 12.451 subcategorias |
| Especialidades | 47 (todas com doenças vinculadas) |
| Escores | 40 |
| Calculadora pediátrica (PED_DB) | 77 medicamentos; 66 com fonte e data de conferência |
| Fichas ampliadas de medicamentos (MEDX) | 74 (mecanismo, ajuste renal e hepático, efeitos adversos, RENAME) |
| Protocolos do modo plantão | 12 |
| Fichas com "PENDENTE DE VERIFICAÇÃO" | 31 |

## 1.2 Linha do tempo resumida
1. **Base e auditoria:** app de arquivo único em HTML/JS puro, com medicamentos, doenças, escores, prescrição com verificador de interações, antibióticos por foco, vacinas, fluxogramas, ECG, calculadoras, laboratório, favoritos, histórico, anotações, modo escuro e aviso legal. A frase "inspirado no Whitebook" foi trocada por uma frase original: "Consulta clínica rápida: doenças, condutas, medicamentos, escores e CID-10 reunidos em um só lugar."
2. **CID-10 completo:** importado por script dos CSVs oficiais do DATASUS (`build_cid.py`), com teste de contagem (`test_cid.py`), navegação por capítulo, grupo, categoria e subcategoria, e busca com e sem ponto ("J18.9" e "J189"). Os 157 códigos inválidos das doenças, extensões americanas do ICD-10-CM, foram corrigidos para a CID-10 brasileira.
3. **Busca global:** ignora acentos, tolera erros de digitação, entende siglas (IAM, PAC, AAS, DPOC…), agrupa resultados por tipo, guarda histórico e funciona offline.
4. **Expansão de conteúdo:** de cerca de 2.700 para 3.226 doenças, cobrindo as 47 especialidades, e de cerca de 1.790 para 1.851 medicamentos. Apresentações e nomes comerciais foram enriquecidos pela lista PMC/CMED da Anvisa. O conteúdo chegou à saturação: os nomes novos já existiam em mais da metade dos casos, e por isso a prioridade passou a ser **qualidade, não quantidade**.
5. **Fontes oficiais:** 6 medicamentos novos com bula ou nota oficial (sotatercepte, epcoritamabe, talquetamabe, fruquintinibe, ublituximabe, glofitamabe) e 5 doenças atualizadas por PCDT da Conitec (brucelose, as duas fichas de PTI, paramiloidose, amiloidose cardíaca). Conferência com a RENAME 2024.
6. **Calculadora pediátrica:** 52 entradas revisadas com rótulos FDA e diretrizes AAP/IDSA/AHA, e depois com documentos da SBP (febre, anemia ferropriva, vitamina D, parasitoses). A dose de dipirona passou para 10-12 mg/kg (SBP 2021), com alerta de que "1 gota/kg" é superdose. Entraram tetos de dose, barra de "% do máximo diário" e alertas de idade (tramadol abaixo de 12 anos, prometazina abaixo de 2 anos, valproato abaixo de 2 anos e outros).
7. **Cinco etapas finais:** (1) selo de confiabilidade, modo plantão e relatório de cobertura por especialidade; (2) busca completa no CID-10, grupos terapêuticos e vínculo medicamento–especialidade; (3) doses SBP; (4) layout; (5) busca por relevância, siglas exatas, plural e erros de digitação nas doenças.
8. **Design moderno inspirado no iOS** (v71): fonte do sistema, listas agrupadas, cartões, barra de abas inferior no celular, folha "Mais", ícones coloridos e botão Aa de tamanho de texto (padrão 115%).
9. **Revisão do autor:** em 07/11/2026 o autor revisou o conteúdo item a item. As fichas exibem "✓ Revisado pelo autor", exceto as 31 que ainda têm texto pendente.
10. **Correção de regressões (v72-v73):** o botão do painel de calculadoras (com IG por DUM e por USG) tinha ficado escondido. A frase original, o aviso legal no celular e o filtro por classe detalhada também foram restaurados.

---

# Parte 2 — Pesquisa rápida: como trabalhar sem lentidão

O autor precisa de **muitas fontes, doenças e medicamentos**, mas a pesquisa ficou lenta porque o Claude Code está usando **agentes/subagentes** para pesquisar. Regras para o Claude Code:

## 2.1 Regras obrigatórias de velocidade
1. **Não usar agentes ou subagentes** (ferramenta Agent/Task, "deep research", pesquisa em paralelo por agentes) para buscar fontes, a menos que o autor peça explicitamente. Cada agente começa do zero, relê o contexto e demora muito.
2. **Pesquisar diretamente** com as ferramentas de busca e leitura da web (WebSearch e WebFetch), **várias de uma vez na mesma mensagem**. Exemplo: 5 a 10 buscas em paralelo, uma por medicamento ou doença, e depois as leituras das páginas escolhidas, também em paralelo.
3. **Ir direto às fontes conhecidas**, sem buscar o que já se sabe onde está (lista de endereços na Parte 7):
   - PCDT: `gov.br/conitec` (relatórios e protocolos em PDF).
   - SBP: `sbp.com.br/fileadmin/...` (documentos científicos em PDF).
   - Bulas: bula profissional do fabricante e bulário da Anvisa.
   - Rótulos FDA: `accessdata.fda.gov/drugsatfda_docs/label/...`.
   - Doses pediátricas e adultas por indicação: `drugs.com/dosage/<droga>.html` (resume FDA, AAP e IDSA).
4. **Ler só o necessário**: pedir à leitura da página apenas os dados da ficha (dose, máximo, intervalo, idade mínima, contraindicações, fonte e ano), não o documento inteiro.
5. **Trabalhar em lotes**: de 10 a 20 fichas por rodada, com um relatório curto no fim. Não parar a cada item.
6. **Guardar o que foi pesquisado** para nunca pesquisar duas vezes:
   - pasta `fontes/` com um arquivo por documento lido (`fontes/sbp-febre-2021.md`, com o link, a data de acesso e os trechos usados);
   - arquivo `fontes/INDICE.md` com a lista de tudo o que já foi consultado;
   - antes de buscar na web, procurar primeiro em `fontes/`.
7. **Usar os dados locais** que já estão no projeto, em vez da web: CSVs do DATASUS (CID-10), lista PMC/CMED da Anvisa (apresentações, nomes comerciais, preços) e RENAME 2024. Para dados tabulares, escrever scripts que processam esses arquivos.
8. **Usar scripts para trabalho repetitivo**, como validação de CID, contagens, relatórios de pendência, consistência de doses e inserção de fichas em lote. Não fazer essas tarefas "à mão" na conversa.
9. **Respostas curtas no fim de cada lote**: o que entrou, as fontes usadas, o que ficou pendente e as contagens. Sem repetir o conteúdo das fichas.

## 2.2 Fluxo recomendado para adicionar ou atualizar fichas
1. O autor manda uma lista (por exemplo, "10 doenças de pneumologia" ou "conferir 15 antibióticos na pediatria").
2. O Claude Code procura em `fontes/` o que já existe.
3. Faz as buscas que faltam **em paralelo**, lê as fontes oficiais e grava os trechos em `fontes/`.
4. Escreve as fichas num arquivo de lote (`lotes/AAAA-MM-DD-tema.json`).
5. Roda o script de inserção, o de validação de CID e o de sintaxe.
6. Registra as mudanças em `CHANGELOG-CONTEUDO.md` e informa as contagens.

---

# Parte 3 — Arquitetura do app e ferramentas

App de consulta clínica em português do Brasil (doenças, condutas, medicamentos, CID-10,
escores, calculadoras, modo plantão). Hoje é **um único arquivo** `index.html` (~7 MB),
sem build, sem dependências externas, funciona offline. Interface inspirada nas convenções do iOS.

### Estrutura atual (dentro de index.html)
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

### Regras de conteúdo (obrigatórias)
- Nunca inventar doses, códigos CID ou referências. Na dúvida: "PENDENTE DE VERIFICAÇÃO".
- CID somente códigos válidos na CID-10 brasileira (DATASUS) — rodar `ferramentas/validar_cid.py`.
- Doses pediátricas: preferir SBP, Ministério da Saúde/PCDT, bula Anvisa; citar fonte e ano.
- Não reintroduzir botões de editar/excluir/novo medicamento.
- Não usar marca, textos ou layout proprietário de outros apps (ex.: Whitebook).

### Verificações antes de entregar qualquer mudança
```bash
node ferramentas/checar_sintaxe.js            # todos os <script> válidos
python3 ferramentas/validar_cid.py            # deve imprimir []
python3 ferramentas/test_cid.py dados/cid10-datasus dados/cid_full.json index.html   # se regenerar o CID
```
Para gerar `dados/cid_full.json` a partir dos CSVs: `python3 ferramentas/build_cid.py dados/cid10-datasus dados/cid_full.json`.

### Pendências conhecidas (sugestões para finalizar)
1. Separar dados do código: extrair SEED_MEDS, DISEASES, CID_FULL, PED_DB etc. para `dados/*.json`
   e criar um script de build que gere o `index.html` final (manter a versão de arquivo único).
2. Transformar em PWA instalável (manifest + service worker, ícones) para uso offline no celular.
3. 31 fichas ainda contêm "PENDENTE DE VERIFICAÇÃO" (ex.: posologia do glofitamabe).
4. Testes automatizados (Playwright) para busca, CID, calculadora pediátrica e modo plantão.
5. Limpeza de CSS: o arquivo acumula camadas de estilo; consolidar no tema moderno do fim.
6. Publicação: hospedar (ex.: GitHub Pages/Netlify) e, se desejado, empacotar para lojas.


---

# Parte 4 — Regras de conteúdo clínico

Documento para o Claude Code criar, revisar e manter o conteúdo médico do app (doenças, medicamentos,
CID-10, calculadora pediátrica, modo plantão, escores). **Estas regras valem mais que qualquer pedido de
"aumentar a quantidade" de conteúdo.**

Versão de referência: v73 (novembro de 2026).

---

### 1. Regras de ouro

1. **Nunca inventar** doses, intervalos, doses máximas, códigos CID, nomes comerciais, referências, anos de diretriz nem números de portaria.
2. **Na dúvida, marcar** o trecho exato com `PENDENTE DE VERIFICAÇÃO` e não preencher. A ficha passa a exibir o selo "⚠ Pendente".
3. **Toda conduta e toda prescrição citam a fonte e o ano**: a linha "Base: …" é obrigatória no campo `prescricao` das doenças.
4. **Não apagar conteúdo clínico existente** sem autorização do autor. Para corrigir, substituir o trecho e registrar a fonte.
5. **Não copiar textos** de livros, apps ou sites (Whitebook, UpToDate, Medscape etc.). Escrever resumos originais a partir das fontes.
6. **Não alterar doses em massa por script** sem revisão humana item a item.
7. O app é **ferramenta de apoio**: o aviso legal deve estar sempre acessível no computador e no celular.

---

### 2. Hierarquia de fontes (da mais forte para a mais fraca)

| Nível | Fonte | Exemplos |
|---|---|---|
| 1 | Normas brasileiras oficiais | PCDT / Conitec, Ministério da Saúde (guias, notas técnicas, PNI), RENAME, bula registrada na Anvisa |
| 2 | Sociedades médicas brasileiras | SBP, SBC, SBEM, SBD, SBPT, FEBRASGO, SBR, SBN, SBI, ABN, AMIB, ASBAI, SBMFC |
| 3 | Diretrizes internacionais | AHA/ACC, ESC, GOLD, GINA, KDIGO, IDSA, Surviving Sepsis, ADA, ATS, ISPAD, OMS, CDC |
| 4 | Rótulos regulatórios estrangeiros | FDA (accessdata.fda.gov, DailyMed), EMA (RCM/EPAR) |
| 5 | Literatura e compêndios | revisões em periódicos indexados, tratados; Drugs.com só como porta de acesso a rótulos FDA e diretrizes AAP/IDSA |

- Quando as fontes divergirem, **prevalece a brasileira** (níveis 1 e 2). A divergência é registrada em `observacoes` ou `ob`, por exemplo: "FDA: máx. 400 mg/dose; bula nacional: …".
- Em **pediatria**, a ordem é: SBP > Ministério da Saúde/PCDT > bula Anvisa > rótulo FDA/AAP > BNFc/OMS.
- Nunca usar como fonte: blogs, fóruns, redes sociais, sites de venda, conteúdo gerado por IA sem fonte primária.

---

### 3. Formato das fichas

#### 3.1 Doença (array `DISEASES`, uma por linha, começando com `    {"area":`)
| Campo | Conteúdo |
|---|---|
| `area` | Grande área (Clínica Médica, Cirurgia Geral, Pediatria, Ginecologia e Obstetrícia, Urgência e Emergência…) |
| `nome` | Nome da doença em português; sigla entre parênteses quando usual, ex.: "Pneumonia adquirida na comunidade (PAC)" |
| `introducao` | Definição em 1-2 frases |
| `criterios` | Quadro clínico e critérios diagnósticos |
| `exames` | Exames complementares |
| `tratamento` | Tratamento por cenário (ambulatório, emergência, internação) |
| `conduta` | Seguimento, sinais de alarme, critérios de internação, populações especiais |
| `prescricao` | Prescrição-modelo numerada, terminando com **`Base: <fontes com ano>`** |
| `cid` | Códigos CID-10 **válidos no DATASUS**, separados por vírgula (ex.: `J18.9, J15.9`) |
| `esp` | Especialidades da lista oficial de 47 (`ESPECIALIDADES`), separadas por `; ` |

Futuro (esquema ampliado, ainda não implementado): epidemiologia, fisiopatologia, diagnóstico diferencial, classificação, populações especiais, critérios de alta, complicações, orientações ao paciente, data da última revisão.

#### 3.2 Medicamento (array `SEED_MEDS`, um por linha, começando com `    {"nome":`)
| Campo | Conteúdo |
|---|---|
| `nome` | Nome genérico (DCB) |
| `classe` | Classe farmacológica (o grupo terapêutico é calculado por `CLASS_GROUPS`) |
| `tarja`, `via`, `generico` | Conforme registro/bula |
| `referencias` | Nomes comerciais no Brasil |
| `apresentacoes` | Formas e concentrações registradas (CMED/Anvisa) |
| `indicacoes`, `posologia`, `contraindicacoes`, `interacoes`, `observacoes` | Texto clínico com fonte |
| `pediatria`, `gestacao`, `lactacao` | Uso nas populações especiais |
| `areas`, `esp` | Áreas e especialidades |

Dados complementares de 74 fármacos ficam em `MEDX`: mecanismo, ajuste renal por faixa de ClCr/TFG, ajuste hepático, efeitos adversos e RENAME.

#### 3.3 CID-10
- A tabela completa (`CID_FULL`) vem **somente** dos CSVs oficiais do DATASUS (`dados/cid10-datasus/`), importados por `ferramentas/build_cid.py` e conferidos por `ferramentas/test_cid.py`. A conferência deve dar: 22 capítulos, 275 grupos, 2.045 categorias e 12.451 subcategorias.
- **Proibido** usar extensões do ICD-10-CM americano (ex.: U07.1 no sentido americano, L89.x, G89.x, Z79.x, N18.5, I50.3 com sufixos inexistentes no Brasil).
- Rodar `python3 ferramentas/validar_cid.py` após qualquer mudança: deve imprimir `[]`.
- A CID-11 está prevista, mas não implementada. Não misturar códigos da CID-11 nos campos atuais.

---

### 4. Calculadora pediátrica (`PED_DB`)

Campos de cada via: `d` (faixa usual [mín, máx]), `dd` (dose padrão), `b` ("dose" ou "dia"), `f` (vezes ao dia),
`mx` (máximo por tomada), `mxd` (máximo diário), `mdk` (máximo mg/kg/dia), `un` (unidade), `fx` (doses fixas por faixa de peso),
`fixo` (texto para doses que não são por peso), `ob` (observações), `al` (alerta em vermelho), `rev` (fonte e data da conferência), `fonte`.

Regras:
- **Toda entrada calculável deve ter pelo menos um máximo** (`mx`, `mxd` ou `mdk`). Se não houver fonte para o máximo, escrever em `ob`: "dose máxima PENDENTE DE VERIFICAÇÃO".
- `rev` deve dizer a fonte e a data, ex.: `Conferida em 11/2026: SBP — DC Manejo da febre aguda (2021)`.
- Alertas obrigatórios (`al`), entre outros: dipirona ("1 gota/kg é superdose"), tramadol (< 12 anos), prometazina (< 2 anos), ácido valproico (< 2 anos), metoclopramida, ceftriaxona em neonatos, nitrofurantoína (< 1 mês), dimenidrinato (< 2 anos).
- Gotas: o app assume 20 gotas/mL. Quando o produto for diferente, avisar em `ob`.
- Nunca reduzir um alerta existente sem fonte.

Fontes pediátricas já conferidas (novembro de 2026):
- SBP — DC Manejo da febre aguda (2021): https://www.sbp.com.br/fileadmin/user_upload/23229c-DC_Manejo_da_febre_aguda.pdf
- SBP — Consenso sobre anemia ferropriva (atualização 2021): https://www.sbp.com.br/fileadmin/user_upload/23172c-Diretrizes-Consenso_sobre_Anemia_Ferropriva.pdf
- SBP — DC nº 181 Hipovitaminose D (11/2024): https://www.sbp.com.br/fileadmin/11/DC_HipovitD_diagn-tratam-prevenc_Atualiz.pdf
- SBP — GPA Parasitoses intestinais: https://www.sbp.com.br/fileadmin/user_upload/22207d-GPA_-_Parasitoses_intestinais_-_diagnostico_e_tratamento.pdf
- Rótulos FDA e diretrizes AAP/IDSA/PIDS/AHA, consultados via Drugs.com (11/2026), para os antibióticos, anticonvulsivantes, corticoides e outros.
- **Ainda sem conferência por fonte:** racecadotrila, cetoprofeno, dexclorfeniramina, espironolactona, captopril, hioscina, domperidona, bromoprida, pirvínio. Esses itens foram revisados pelo autor, mas falta fonte documental.

---

### 5. Modo plantão (`PLANTAO`)

Formato do item: `[nome, via, dose/kg, unidade, máximo, concentração (un/mL), observação, mínimo, faixas fixas, dose adulto]`.
- Cada protocolo traz `fonte` (ex.: "AHA PALS/ACLS 2020").
- A partir de 50 kg, usa-se a dose fixa de adulto quando ela existir (selo ADULTO). Nos demais casos, o máximo é aplicado (selo MÁX.).
- O volume em mL depende da concentração da ampola **mais comum no Brasil**. Informar a diluição na observação.
- As doses foram escritas a partir das diretrizes citadas, mas **sem conferência item a item contra o documento original**. Prioridade de revisão.

---

### 6. Selos de confiabilidade

| Selo | Regra no código (`trustLevel`) |
|---|---|
| ⚠ Pendente | o texto da ficha contém "PENDENTE DE VERIFICAÇÃO" |
| ✓ Fonte oficial | medicamento listado em `CONF_M` (bula/nota oficial lida) **ou** doença cuja prescrição cita "PCDT … Portaria" |
| ✓ Revisado pelo autor | demais fichas, revisadas pelo autor em 07/11/2026 (`AUTHOR_REVIEW`) |

- Ao conferir uma ficha com fonte oficial, citar a fonte no texto e, no caso de medicamento, incluí-lo em `CONF_M`.
- Ao editar uma ficha depois da revisão do autor, registrar a mudança num arquivo `CHANGELOG-CONTEUDO.md` (data, ficha, campo, de → para, fonte).

---

### 7. Fontes oficiais já usadas no app

- RENAME 2024 (Conitec/MS): https://www.gov.br/conitec/pt-br/midias/pdf/2026-2/relacao_nacional_medicamentos_2024.pdf/@@display-file/file
- PCDT Brucelose Humana (Portaria SECTICS/MS nº 22/2025)
- PCDT Trombocitopenia Imune Primária (Portaria Conjunta nº 41/2026)
- PCDT Amiloidoses associadas à Transtirretina (Portaria Conjunta SAES/SECTICS nº 12/2025)
- Bulas/notas oficiais: Winrevair (sotatercepte, MSD Brasil), Epkinly (epcoritamabe), Talvey (talquetamabe, Janssen Brasil), Fruzaqla (fruquintinibe, Anvisa 08/2026 + FDA), Briumvi (ublituximabe, Anvisa 04/2026 + FDA), Columvi (glofitamabe, Anvisa 07/2026; posologia pendente)
- CID-10: arquivos CSV do DATASUS
- Preços/apresentações: lista PMC/CMED (Anvisa), usada para apresentações e nomes comerciais

---

### 8. Pendências de conteúdo conhecidas

1. **31 fichas** com "PENDENTE DE VERIFICAÇÃO". Gerar `PENDENCIAS.md` listando cada uma (ficha, campo, trecho).
2. **Doses do modo plantão**: conferir item a item com PALS/ACLS 2020, AES 2016, GINA 2024, SSC 2020, ISPAD 2022.
3. **Calculadora pediátrica**: conferir os 9 itens sem fonte documental (lista no item 4).
4. **Consistência entre módulos**: a mesma droga não pode ter doses máximas diferentes na ficha do medicamento, na prescrição das doenças, na calculadora pediátrica e no plantão. Gerar um relatório antes de corrigir.
5. **Esquema ampliado** das doenças (item 3.1, "Futuro"), começando pelas 100 mais consultadas na atenção primária e na emergência.
6. **Ajuste renal pediátrico** (Schwartz) e ampliação do `MEDX` para os fármacos mais usados.

---

### 9. Checklist antes de entregar qualquer mudança de conteúdo

- [ ] `node ferramentas/checar_sintaxe.js` → OK
- [ ] `python3 ferramentas/validar_cid.py` → `[]`
- [ ] Nenhuma dose nova sem fonte e ano
- [ ] Linha "Base:" presente em toda prescrição de doença nova ou alterada
- [ ] `esp` só com especialidades da lista oficial
- [ ] Contagens informadas ao autor (doenças, medicamentos, CID, entradas da PED_DB)
- [ ] Mudanças registradas em `CHANGELOG-CONTEUDO.md`


---

# Parte 5 — Especificação de design e layout

Documento para o Claude Code manter e evoluir o visual do app sem perder a identidade atual.
**Versão de referência:** v71 (novembro de 2026). Em caso de dúvida, o `index.html` da v71 é a referência visual.

---

### 1. Princípios

1. **Inspiração no iOS, sem copiar marcas.** Seguir as convenções de interface do iPhone: títulos grandes, listas agrupadas com cantos arredondados, barra de abas inferior translúcida e folhas que sobem de baixo. Não usar logotipos, cores de marca, textos nem layouts proprietários de outros apps (Whitebook, iClinic etc.).
2. **Uso clínico rápido.** No máximo 2 toques até a informação; a busca universal sempre visível; o Plantão (emergência) sempre a um toque, em vermelho.
3. **Legibilidade em primeiro lugar.** Textos grandes (corpo de 16 px com zoom padrão de 115%), contraste alto e nada de cinza-claro sobre branco em texto clínico.
4. **Funcionar offline.** Sem fontes, ícones ou scripts externos: fonte do sistema e ícones SVG embutidos.
5. **Modo claro e escuro**, seguindo o sistema do aparelho.

---

### 2. Cores (tokens CSS em `:root`)

#### Modo claro
| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#F2F2F7` | Fundo geral (cinza agrupado do iOS) |
| `--surface` | `#FFFFFF` | Cartões, linhas de lista, campos |
| `--ink` | `#1C1C1E` | Texto principal |
| `--ink-soft` | `#5B5B60` | Texto secundário |
| `--ink-faint` | `#8A8A8E` | Legendas, rótulos de seção, ícones inativos |
| `--accent` | `#0A66D8` | Cor principal: links, seleção, item ativo |
| `--accent-deep` | `#0A4FA8` | Texto em fundo `--accent-soft` |
| `--accent-soft` | `#E6F0FD` | Fundo de etiquetas e foco |
| `--border` | `#E3E3E8` | Separadores de linha |
| `--danger` | `#A13A33` | Alertas clínicos (texto) |
| `--ok` / `--ok-soft` | `#22673F` / `#E4F2E9` | Selo "Revisado"/"Fonte oficial" |

#### Modo escuro
| Token | Valor |
|---|---|
| `--paper` | `#000000` |
| `--surface` | `#1C1C1E` |
| `--ink` | `#F2F2F7` |
| `--ink-soft` | `#AEAEB2` |
| `--ink-faint` | `#8E8E93` |
| `--accent` | `#3D9BFF` |
| `--accent-deep` | `#7DBAFF` |
| `--accent-soft` | `#0E2742` |
| `--border` | `#2E2E32` |
| `--ok` / `--ok-soft` | `#86CFA0` / `#173326` |
| sombras | nenhuma (`--shadow: none`) |

O modo escuro é aplicado por `@media (prefers-color-scheme: dark)` com `:root:not([data-theme="light"])` e também por `:root[data-theme="dark"]`.

#### Cores dos ícones (quadrados coloridos, estilo Ajustes do iPhone)
| Token | Valor | Seção |
|---|---|---|
| `--c-red` | `#E5484D` | Plantão, ECG |
| `--c-blue` | `#0A84FF` | Doenças, Vacinas |
| `--c-orange` | `#F59E0B` | Calculadoras |
| `--c-purple` | `#8B5CF6` | Escores |
| `--c-gray` | `#8E8E93` | CID-10, Tamanho do texto |
| `--c-green` | `#22A55A` | Antibióticos |
| `--c-teal` | `#14B8A6` | Fluxogramas |
| `--c-indigo` | `#5E5CE6` | Laboratório |
| `--c-pink` | `#EC4899` | Prescrição |

---

### 3. Tipografia

- **Família:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No iPhone e no Mac aparece a fonte do sistema da Apple, e nos outros aparelhos a equivalente. **Não carregar fontes da internet.**
- **Títulos:** a mesma família, peso 700, `letter-spacing` negativo (−0,02 a −0,03em).
- Corpo com `letter-spacing: -0.01em`.

| Elemento | Tamanho | Peso |
|---|---|---|
| Título da página inicial ("Bluebook") | 34 px | 700 |
| Título da ficha (nome da doença/medicamento) | 30 px (28 px no celular) | 700 |
| Marca no cabeçalho | 24 px (28 px no celular) | 700 |
| Título de seção da folha "Mais" e da cobertura | 20 px | 700 |
| Corpo / texto das seções | 15,5–16 px | 400 |
| Linha de lista (nome) | 16 px | 400 |
| Subtítulo da linha (classe/área) | 13 px | 400, `--ink-faint` |
| Rótulo de seção (INTRODUÇÃO, POSOLOGIA…) | 12,5 px, MAIÚSCULAS, espaçamento 0,04em | 600, `--ink-faint` |
| Rótulo de grupo da lista (A, B… / RESULTADOS) | 12,5 px | 600, `--ink-faint` |
| Etiquetas (badges) | 12,5 px | 600 |
| Barra de abas inferior (rótulo) | 10,5 px | 600 |

#### Tamanho do texto (zoom da interface)
- A interface inteira usa `zoom` no elemento raiz. Padrão: **115%**. Níveis: 100%, 115%, 130%, 145%.
- Botão **Aa** no cabeçalho (no celular: "Mais" → "Tamanho do texto") alterna os níveis.
- A escolha é salva em `localStorage` com a chave `bluebook:zoom` e aplicada por um `<script>` logo após `<body>`, antes de desenhar a tela, para não piscar.

---

### 4. Formas, espaçamento e sombras

- **Raio:** cartões e seções `14px` (`--radius`); listas, campos e botões `12px`; etiquetas `8px`; abas e chips em pílula `999px`; ícones coloridos `10px` (38 px) ou `8px` (30 px).
- **Sombra (modo claro):** `0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.05)`. No modo escuro não há sombra.
- **Separadores:** não usar bordas em volta dos cartões. Linhas de lista separadas por `box-shadow: inset 0 -1px 0 var(--border)`.
- **Espaçamento:** seções com `padding: 16px 18px` e 14 px entre elas; linhas de lista com `padding: 12px 16px`; página com margens laterais de 16 px (14 px no celular).

---

### 5. Componentes

#### 5.1 Cabeçalho
- Fundo translúcido com desfoque: `background: color-mix(in srgb, var(--paper) 82%, transparent)` com `backdrop-filter: saturate(180%) blur(20px)` e borda inferior de 1 px.
- **Computador:** uma linha com a marca "BB" (quadrado de 32 px com gradiente `#2F80ED → #0A4FA8` e raio de 9 px) + "Bluebook", seguida da busca (flexível, de 180 a 420 px), dos filtros (classe e especialidade, até 200 px cada), de Favoritos, do Aa e do menu ⋮. Sem slogan.
- **Celular:** a marca numa linha; abaixo, uma grade com a busca (4 colunas), a estrela e o ⋮ (44 px cada); na linha seguinte, o filtro de classe e o de especialidade lado a lado. O cabeçalho fica fixo no topo (`position: sticky`).

#### 5.2 Campo de busca
- Fundo `color-mix(in srgb, var(--ink) 7%, transparent)` (cinza translúcido), sem borda, raio 12 px, 16 px de texto e lupa à esquerda.
- No foco: fundo `--surface`, borda `--accent` e anel `0 0 0 4px var(--accent-soft)`.

#### 5.3 Abas de seção (computador)
- Botões em pílula, peso 600, cor `--ink-soft`, sem fundo.
- **Ativa:** fundo `--ink` com texto `--paper` (preto no claro, branco no escuro).
- **Plantão:** texto `--c-red`; quando ativo, fundo vermelho com texto branco.
- Rolagem horizontal sem barra visível. **No celular as abas do topo ficam ocultas** (a barra inferior substitui).

#### 5.4 Chips de área (Todas, Clínica Médica, Pediatria…)
- Pílulas brancas com borda `--border` e contagem em cinza. A ativa fica com fundo `--accent` e texto branco. Rolagem horizontal.

#### 5.5 Listas (barra lateral)
- **Estilo lista agrupada do iOS:** fundo da página `--paper`; linhas em `--surface`; o primeiro e o último item de cada grupo com cantos de 12 px.
- O rótulo do grupo fica acima do bloco (letra, área ou "RESULTADOS POR RELEVÂNCIA (n)").
- Cada linha mostra o nome (16 px), o subtítulo (13 px, cinza), a estrela de favorito à direita e, **no celular, a seta ›**.
- **Item selecionado:** fundo `--accent` e texto branco (subtítulo branco a 85%).
- Hover: leve tom de `--accent` sobre `--surface`.

#### 5.6 Ficha (doença/medicamento)
- **Título grande** (30 px/700), seguido das etiquetas: classe, grupo terapêutico, tarja, via, CID e selo de confiabilidade.
- Ações à direita: "Copiar resumo" (botão claro) e a estrela.
- **Cada seção é um cartão branco** com sombra leve, rótulo em MAIÚSCULAS cinza e texto de 15,5–16 px com entrelinha 1,6.
- A posologia aparece em tópicos. Nunca quebrar um tópico dentro de parênteses nem em abreviações (máx., mín., ex.).
- "Voltar" no celular: texto azul `--accent` de 17 px com a seta ‹.

#### 5.7 Selos de confiabilidade (concisos)
| Selo | Estilo | Quando |
|---|---|---|
| ✓ Fonte oficial | verde (`--ok` sobre `--ok-soft`, borda `--ok`) | ficha conferida com bula/PCDT/rótulo regulatório |
| ✓ Revisado pelo autor | verde | ficha revisada pelo autor (07/11/2026) |
| ⚠ Pendente | dourado | o texto contém "PENDENTE DE VERIFICAÇÃO" |

12 px, raio 8 px. A explicação completa fica no `title` (aparece ao passar o mouse).

#### 5.8 Página inicial
- Data em cinza e com inicial maiúscula ("Sábado, 7 De Novembro"), seguida do título "Bluebook" (34 px) e de uma linha de descrição.
- **Atalhos em cartões** (grade `minmax(190px,1fr)` no computador, 2 colunas no celular), cada um com um quadrado colorido de 38 px com ícone branco, o título (15 px/600) e a descrição (12,5 px cinza). Ordem: Plantão, Doenças, Calculadoras, Escores, CID-10, Antibióticos, Fluxogramas, Laboratório.
- **Cobertura do conteúdo**, abaixo: totais em pílulas brancas e a grade de especialidades (cartões clicáveis com "n doenças · n meds"). As especialidades com menos de 20 doenças têm uma faixa laranja à esquerda.
- No celular, a aba "Início" mostra essa página. A busca e as listas ficam nas outras abas.

#### 5.9 Barra de abas inferior (somente celular, até 780 px)
- Fixa embaixo, translúcida (`--surface` a 85% + desfoque de 20 px), com borda superior de 1 px e respeitando `env(safe-area-inset-bottom)`.
- Cinco botões: **Início, Plantão, Doenças, Remédios, Mais**. Ícone de 25 px com o rótulo de 10,5 px embaixo.
- Inativo em `--ink-faint`; ativo em `--accent`; o Plantão ativo em `--c-red`.
- Lembrar de deixar espaço inferior no conteúdo (`padding-bottom` de cerca de 90–100 px) para a barra não cobrir o texto.

#### 5.10 Folha "Mais" (bottom sheet)
- Fundo escurecido `rgba(0,0,0,.35)`. A folha `--paper` sobe de baixo com cantos de 18 px no topo, puxador cinza (40×5 px) e título "Mais seções" (20 px/700).
- A lista agrupada tem linhas com ícone colorido de 30 px, o rótulo de 16 px e a seta › à direita: Calculadoras, Escores, CID-10, Antibióticos por foco, Fluxogramas, ECG, Laboratório, Vacinas, Prescrição e interações, Tamanho do texto.
- Botão "Fechar" separado, branco, com texto azul em 600. Tocar fora também fecha.

#### 5.11 Modo plantão
- Um cartão de peso em tom vermelho claro (`--danger-soft`, borda `--danger-border`) com o rótulo "Peso do paciente" e o campo numérico grande (18 px/600).
- Tabela com as colunas Medicamento/via | Dose (n kg) | Observação. A dose fica em negrito, com o volume em mL embaixo.
- Selos dentro da dose: **MÁX.** e **MÍN.** (o limite foi atingido) e **ADULTO** (dose fixa de adulto a partir de 50 kg), vermelhos e pequenos.
- Etiqueta "Ref.: diretriz" no cabeçalho do protocolo.

#### 5.12 Calculadora pediátrica
- Mostra a faixa usual e os **Limites** (máximo por tomada, máximo diário, máximo em mg/kg/dia).
- No resultado aparece a linha "Dose máxima de referência" e uma **barra de progresso** com "% do máximo diário": azul até 79%, laranja (`#c27a00`) de 80% a 99% ("próximo do limite"), vermelha a partir de 100% ("LIMITE ATINGIDO").
- Alertas clínicos (por exemplo, tramadol abaixo de 12 anos) em caixa vermelha antes dos campos.
- Aviso quando a dose digitada está acima ou abaixo da faixa usual.

#### 5.13 Busca universal (dentro das listas)
- Um quadro recolhível no topo da lista: "▸ Também em outras seções — N resultados", com a contagem por seção embaixo.
- Fica fechado quando a aba atual tem resultados e abre sozinho quando não tem.

---

### 6. Ícones

SVG embutidos, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, pontas e junções arredondadas. São traços simples desenhados para o app, sem bibliotecas nem marcas de terceiros.

| Chave | Uso | Conteúdo do SVG |
|---|---|---|
| `home` | Início | `<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>` |
| `bolt` | Plantão | `<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>` |
| `steth` | Doenças | `<path d="M6 3v6a5 5 0 0 0 10 0V3"/><path d="M11 14v2a5 5 0 0 0 10 0v-2"/><circle cx="21" cy="12" r="2"/>` |
| `pill` | Remédios | `<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="M8.5 8.5l7 7"/>` |
| `grid` | Mais | `<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>` |
| `calc` | Calculadoras | `<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>` |
| `score` | Escores | `<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>` |
| `cid` | CID-10 | `<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>` |
| `atb` | Antibióticos | `<circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/>` |
| `flux` | Fluxogramas | `<rect x="3" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="15" width="8" height="6" rx="1.5"/><path d="M7 9v4h10v2"/>` |
| `lab` | Laboratório | `<path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2"/><path d="M8 2h8M7 14h10"/>` |
| `vac` | Vacinas | `<path d="M18 2l4 4M17 7l-9 9-3 1 1-3 9-9zM14 4l6 6M3 21l3-3"/>` |
| `ecg` | ECG | `<path d="M2 12h4l2-5 4 10 2-5h8"/>` |
| `rx` | Prescrição | `<path d="M6 4h6a4 4 0 0 1 0 8H6zM6 12v8M10 12l8 8M18 14l-4 6"/>` |
| `aa` | Tamanho do texto | `<path d="M3 19l5-14 5 14M5 14h6M15 19l3.5-9 3.5 9M16.5 16h4"/>` |

---

### 7. Layout e responsividade

- **Ponto de quebra:** 780 px (com o zoom aplicado, a largura útil é menor que a da tela).
- **Computador:** cabeçalho, abas em pílula e chips de área no topo; abaixo, duas colunas: a lista à esquerda (largura fixa) e a ficha à direita (largura máxima de cerca de 900 px de conteúdo).
- **Celular:** cabeçalho fixo, uma coluna de cada vez (lista **ou** ficha, com "Voltar") e a barra de abas inferior. O rodapé de aviso legal fica oculto no celular (o aviso deve aparecer em "Ajustes/Sobre").
- Respeitar a área segura do iPhone: `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`; meta viewport com `viewport-fit=cover`.

---

### 8. Acessibilidade

- Contraste mínimo AA (4,5:1) para texto. Não usar `--ink-faint` em texto clínico essencial.
- Áreas de toque de no mínimo 44×44 px no celular.
- Rótulos ARIA nos botões só com ícone (estrela, ⋮, Aa, abas inferiores).
- Foco visível (anel `--accent-soft`) e navegação por teclado no computador.
- O botão Aa (zoom) não deve quebrar o layout em nenhum nível de 100% a 145%.

---

### 9. O que NÃO fazer

- Não carregar fontes, ícones ou CSS de CDNs (o app precisa funcionar offline).
- Não usar logotipos, nomes ou layouts de outros apps médicos.
- Não colocar bordas grossas em volta de cartões. Separar com sombra leve e espaço.
- Não usar vermelho fora do Plantão e dos alertas clínicos.
- Não reintroduzir botões de editar, excluir ou "novo medicamento".
- Não reduzir o texto abaixo de 12 px (exceto o rótulo da barra inferior, de 10,5 px).

---

### 10. Critérios de aceitação visual

- [ ] Celular (390×844) no modo claro e no escuro: Início, Plantão (com peso de 20 kg), lista de Remédios, ficha de um medicamento, folha "Mais".
- [ ] Computador (1366×860): página inicial, busca "pneumonia" com a ficha aberta, calculadora pediátrica.
- [ ] Zoom em 100% e em 145% sem sobreposição no cabeçalho.
- [ ] Nenhum erro no console. Funcionamento offline confirmado.

---

# Parte 6 — Regras contra regressão (não perder funções)

Já aconteceu: numa mudança de layout, o botão do painel de calculadoras ficou escondido por CSS, e o autor perdeu o cálculo de IG por USG. Também ficaram ocultos a frase original, o aviso legal no celular e o filtro por classe detalhada.

**Regra permanente:** nenhuma mudança de layout, design ou CSS pode esconder, remover ou tornar inacessível uma função existente sem aviso explícito ao autor.

Antes de entregar qualquer mudança visual:
1. Listar todos os botões, abas, itens de menu, calculadoras e textos legais, e confirmar que continuam acessíveis no computador (1366 px) e no celular (390 px).
2. Rodar os testes de regressão:
   - IG por USG: exame de 10s3d em 01/08/2026 → **24s5d** em 09/11/2026, DPP **24/02/2027**.
   - IG por DUM: DUM 01/01/2026 → DPP **08/10/2026**.
   - Menu ⋮: Carregar biblioteca, Bulário Anvisa, Exportar anotações e Ajustes visíveis e clicáveis.
   - Todas as seções acessíveis: no computador pelas abas; no celular pela barra inferior ou pelo "Mais".
   - Frase original na página inicial; aviso legal no computador (rodapé) e no celular (página inicial).
   - Filtro de classe com os dois grupos de opções (grupos terapêuticos e classes detalhadas).
   - Busca: "pac" → Pneumonia adquirida na comunidade; "iam" → Infarto agudo do miocárdio; "omeprasol" → Omeprazol; "novalgina" → Dipirona; "J189" → doenças com J18.9.
   - Calculadora pediátrica: dipirona com 10 kg → 120 mg e alerta de superdose; tramadol com alerta abaixo de 12 anos; a barra de % do máximo fica vermelha ao atingir o limite.
   - Plantão: adrenalina na PCR com 20 kg → 0,2 mg (2 mL de 0,1 mg/mL); com 70 kg → 1 mg (ADULTO).
   - Nenhum erro de JavaScript no console.

**Mudanças intencionais que devem ser mantidas:**
- Sem botões de editar, excluir ou novo medicamento.
- Barra inferior no celular no lugar das abas do topo.
- Busca universal recolhida quando a aba atual tem resultados.
- Dipirona com padrão SBP.
- Zoom padrão de 115% com o botão Aa.

---

# Parte 7 — Fontes já usadas e conferidas

| Tema | Fonte | Endereço |
|---|---|---|
| CID-10 | DATASUS (CSV oficial) | `dados/cid10-datasus/` no projeto |
| Medicamentos essenciais | RENAME 2024 (Conitec/MS) | https://www.gov.br/conitec/pt-br/midias/pdf/2026-2/relacao_nacional_medicamentos_2024.pdf/@@display-file/file |
| Apresentações/marcas | Lista PMC/CMED (Anvisa, 10/2026) | planilha `lista_PMC_...xlsx` (anexar ao projeto) |
| Febre (paracetamol, dipirona, ibuprofeno) | SBP — DC Manejo da febre aguda (2021) | https://www.sbp.com.br/fileadmin/user_upload/23229c-DC_Manejo_da_febre_aguda.pdf |
| Ferro | SBP — Consenso anemia ferropriva (2021) | https://www.sbp.com.br/fileadmin/user_upload/23172c-Diretrizes-Consenso_sobre_Anemia_Ferropriva.pdf |
| Ferro (atualização) | Resumo da SBP 2026 (Portal Afya; conferir original) | https://portal.afya.com.br/pediatria/sbp-2026-recomendacoes-para-prevencao-e-tratamento-da-anemia-ferropriva |
| Vitamina D | SBP — DC nº 181 (11/2024) | https://www.sbp.com.br/fileadmin/11/DC_HipovitD_diagn-tratam-prevenc_Atualiz.pdf |
| Parasitoses | SBP — GPA Parasitoses intestinais | https://www.sbp.com.br/fileadmin/user_upload/22207d-GPA_-_Parasitoses_intestinais_-_diagnostico_e_tratamento.pdf |
| PAC na infância | Resumo SBP (Portal Afya; conferir original) | https://portal.afya.com.br/pediatria/pac-na-infancia-conheca-novas-recomendacoes-da-sbp |
| Brucelose | PCDT (Portaria SECTICS/MS nº 22/2025) | https://www.gov.br/conitec/pt-br/midias/relatorios/2025/protocolo-clinico-e-diretrizes-terapeuticas-brucelose-humana/@@display-file/file |
| PTI | PCDT (Portaria Conjunta nº 41/2026) | https://www.gov.br/conitec/pt-br/midias/relatorios/2026/relatorio-de-recomendacao-no-1049-pcdt-trombocitopenia-imune-primaria/@@display-file/file |
| Amiloidose TTR | PCDT (Portaria Conjunta nº 12/2025) | https://www.gov.br/conitec/pt-br/midias/relatorios/2025/relatorio-de-recomendacao-1007-amiloidoses-hereditarias/@@display-file/file |
| Sotatercepte | Bula profissional Winrevair (MSD Brasil) | https://www.msd.com.br/wp-content/uploads/sites/86/2026/07/winrevair_pro.pdf |
| Epcoritamabe | Bula Epkinly | https://www.4bio.com.br/wp-content/uploads/2024/08/EPKINLY.pdf |
| Talquetamabe | Bula Talvey (Janssen Brasil) | https://assets.jnjlabels.com/innovativemedicine/latam/brasil/talvey-vps.pdf |
| Fruquintinibe | Agência Gov (Anvisa, 08/2026) + rótulo FDA | https://agenciagov.ebc.com.br/noticias/202608/anvisa-aprova-novo-medicamento-para-cancer-colorretal-metastatico · https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217564s000lbl.pdf |
| Ublituximabe | ICTQ (Anvisa, 04/2026) + rótulo FDA | https://ictq.com.br/industria-farmaceutica/5124-anvisa-aprova-novos-medicamentos-para-esclerose-multipla-e-sindrome-de-dravet-e-fortalece-o-tratamento-no-brasil · https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/761238s000lbl.pdf |
| Glofitamabe | Agência Gov (Anvisa, 07/2026) — posologia pendente | https://agenciagov.ebc.com.br/noticias/202607/anvisa-aprova-novo-medicamento-para-linfoma-nao-hodgkin |
| Doses pediátricas por indicação (antibióticos, anticonvulsivantes, corticoides etc.) | Rótulos FDA e AAP/IDSA/PIDS/AHA via Drugs.com | `https://www.drugs.com/dosage/<droga>.html` |
| Estiripentol | RCM EMA (Diacomit) | https://www.ema.europa.eu/en/documents/product-information/diacomit-epar-product-information_pt.pdf |

Fontes que **não abriram** pelo acesso automático, e por isso são lentas: BNF for Children (nice.org.uk), formulário infantil da OMS, App Store. Evitar.

---

# Parte 8 — Pendências priorizadas

| Prioridade | Tarefa | Como |
|---|---|---|
| 1 | Organização: git, separar dados em `dados/*.json`, build para um `index.html` único | script Node sem dependências |
| 2 | Testes de regressão automáticos (Parte 6) | Playwright |
| 3 | 31 fichas com "PENDENTE DE VERIFICAÇÃO" | gerar `PENDENCIAS.md`; o autor completa ou o Claude pesquisa em lote |
| 4 | Conferir as doses do modo plantão item a item | PALS/ACLS 2020, AES 2016, GINA 2024, SSC 2020, ISPAD 2022 |
| 5 | 9 itens da calculadora pediátrica sem fonte documental | racecadotrila, cetoprofeno, dexclorfeniramina, espironolactona, captopril, hioscina, domperidona, bromoprida, pirvínio |
| 6 | Relatório de consistência de doses entre ficha, prescrição, calculadora e plantão | script; não corrigir automaticamente |
| 7 | PWA instalável no iPhone (manifest, service worker, ícones) | uso 100% offline |
| 8 | Esquema ampliado de doenças (diferencial, sinais de alarme, internação, populações especiais), começando pelas 100 mais usadas | em lotes de 10-20 |
| 9 | Ampliar o MEDX (ajuste renal e hepático) para os 200 fármacos mais usados | em lotes |
| 10 | Novas doenças e medicamentos somente com fonte | lotes temáticos pedidos pelo autor |

---

# Parte 9 — Comandos prontos, em ordem

## Comando 0 — Leitura inicial (mandar uma vez)
```
Coloquei o arquivo BLUEBOOK-GUIA.md na raiz do projeto. Leia-o INTEIRO. Ele é a referência principal: histórico do que já foi feito, arquitetura, regras de conteúdo clínico, design, regras contra regressão, fontes já conferidas, pendências e regras de velocidade de pesquisa.

A partir de agora:
1. NÃO use agentes ou subagentes (Agent/Task) para pesquisar, a menos que eu peça. Pesquise diretamente com WebSearch e WebFetch, várias buscas em paralelo na mesma mensagem, e vá direto às fontes listadas na Parte 7.
2. Crie a pasta fontes/ com o arquivo INDICE.md. Grave nela tudo o que pesquisar (link, data de acesso, trechos usados) e consulte essa pasta antes de qualquer busca nova.
3. Atualize o CLAUDE.md para apontar para o BLUEBOOK-GUIA.md e copie para ele as regras de velocidade (Parte 2), contra regressão (Parte 6) e de conteúdo (Parte 4, regras de ouro).
4. Não refaça nada que já existe: o app v73 é a base.
5. Ao terminar cada tarefa, responda de forma curta: o que foi feito, as fontes usadas, o que ficou pendente e as contagens (doenças, medicamentos, CID, PED_DB, plantão).

Confirme que leu e me mostre um resumo de 10 linhas do estado do projeto e das 3 próximas tarefas que você recomenda, segundo a Parte 8.
```

## Comando 1 — Organização e testes (Pendências 1 e 2)
```
Faça as pendências 1 e 2 da Parte 8 do BLUEBOOK-GUIA.md: git com commit "v73 base", separação dos dados em dados/*.json, build para dist/index.html (arquivo único, idêntico em funcionamento) e testes Playwright com TODOS os casos da Parte 6. Confirme por teste que as contagens não mudaram. Sem agentes; sem alterar conteúdo clínico.
```

## Comando 2 — Relatórios de qualidade (Pendências 3 e 6)
```
Gere PENDENCIAS.md (todas as fichas com "PENDENTE DE VERIFICAÇÃO": tipo, nome, campo, trecho) e RELATORIO-CONSISTENCIA.md (divergências de dose máxima entre SEED_MEDS/MEDX, PED_DB e PLANTAO). Crie CHANGELOG-CONTEUDO.md. Não altere nenhuma dose. Use scripts, não agentes.
```

## Comando 3 — Pesquisa em lote rápida (modelo para usar sempre)
```
Lote de pesquisa: [COLE AQUI A LISTA, ex.: "conferir as doses do modo plantão — protocolos PCR e anafilaxia" ou "adicionar 10 doenças de reumatologia com PCDT/SBR"].
Regras: sem agentes; primeiro consulte fontes/; depois faça as buscas que faltam em paralelo (até 10 por mensagem), indo direto às fontes da Parte 7; grave os trechos em fontes/; escreva as fichas num lote em lotes/; insira por script; valide o CID e a sintaxe; registre no CHANGELOG-CONTEUDO.md. Onde não houver fonte, use "PENDENTE DE VERIFICAÇÃO". No fim, mostre uma tabela curta: ficha | o que mudou | fonte e ano.
```

## Comando 4 — PWA para iPhone (Pendência 7)
```
Transforme o dist/ num PWA instalável no iPhone: manifest.json, ícones 192/512 e apple-touch-icon (desenho próprio, sem marcas de terceiros), service worker com cache total para uso offline, meta tags iOS e viewport-fit=cover. Siga a Parte 5 (design) e a Parte 6 (regressão). Teste offline.
```
