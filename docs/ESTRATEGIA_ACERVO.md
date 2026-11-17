# Estratégia de ampliação do acervo de doenças e condutas

Pedido do autor (12/11/2026): aumentar a lista de doenças e condutas com base nas diretrizes principais, usando os agentes.

## Princípios (não negociáveis)
- **Nada inventado.** Toda dose, critério e conduta vem de uma fonte lida pelo redator, citada na linha `Base:` com
  instituição e ano. Sem fonte: "PENDENTE DE VERIFICAÇÃO".
- **Fontes, nesta ordem:** Ministério da Saúde (PCDT, protocolos, Cadernos/Linhas de Cuidado da APS), sociedades
  brasileiras (SBP, SBC, SBPT, SBD, FEBRASGO, SBI, ABN, SBR etc.), bula Anvisa; diretrizes internacionais (OMS, AHA,
  GINA, GOLD, KDIGO, IDSA, NICE) só quando não houver brasileira ou como complemento.
- **Texto próprio.** Resumir com as próprias palavras; nunca copiar trechos de diretrizes, livros ou de outros apps
  (Whitebook, UpToDate etc.).
- **CID somente válido** na CID-10 do DATASUS (`dados/cid_full.json`, conferido por `ferramentas/validar_cid.py`).
- **Sem duplicatas:** antes de criar, procurar a doença por nome, sinônimos e CID no acervo atual.
- **O autor aprova cada lote** antes de ele entrar no app. Registros novos ficam marcados como não revisados pelo autor.

## Formato de cada doença (o mesmo do acervo atual)
`area`, `nome`, `introducao`, `criterios`, `exames`, `tratamento`, `conduta`, `prescricao` (terminando com
`Base: <fonte, ano>`), `cid` (códigos válidos separados por vírgula), `esp` (especialidades de `dados/especialidades.json`).

## Fluxo (pipeline com agentes)
1. **Mapeador** (pesquisa, somente leitura): lista as lacunas por prioridade — condições frequentes na atenção
   primária, urgência, pediatria e obstetrícia que não existem no acervo. Saída: `curadoria/lacunas.md`.
2. **Redator** (um por especialidade/lote de ~10 doenças): pesquisa as diretrizes, lê as fontes e escreve os
   registros em `curadoria/lote-NN.json`, com a lista de URLs consultadas por doença.
3. **Revisor de fontes** (independente, somente leitura): confere cada dose e conduta contra a fonte citada, valida
   CID e formato, procura duplicatas e marca problemas. Lote só segue com aprovação dele.
4. **Autor** aprova o lote (resumo curto: doenças, fontes, pontos de atenção).
5. **Integração** (`ferramentas/integrar_lote.js`): acrescenta o lote a `dados/diseases.json`, roda build,
   `validar_cid.py`, relatórios e testes; o **verificador** aprova antes de publicar.

## Lotes
- Piloto (lote 01): 10 condições de maior prioridade do mapeamento, para calibrar qualidade e formato.
- Depois: lotes de 10–20 por especialidade, na ordem de prioridade, um de cada vez.

## Estado
- Acervo atual: 3.375 doenças (3.226 originais + 149 dos lotes 01–17) (Pediatria 340, Ginecologia e Obstetrícia 292, Clínica Médica 229…).
- CID: o arquivo `CID10CSV.zip` enviado pelo autor tem a mesma tabela do DATASUS que o app já usa
  (2.045 categorias, 12.451 subcategorias) mais a CID-O (oncologia), que o app não usa.
