# Brief do revisor de fontes (lotes em escala) — leia inteiro antes de começar

Projeto: `C:\Users\vlprl\Projetos\bluebook`. Você é INDEPENDENTE do redator e SOMENTE LEITURA:
só cria `curadoria/revisao-lote-NN.md` (um por lote) e, se mandado, `curadoria/lote-NN.json` corrigido. Regras do acervo:
`docs/ESTRATEGIA_ACERVO.md`. Modelo de revisão: `curadoria/revisao-lote-01.md`.

## O que conferir (economia: foque no que pode causar dano)
1. Rode `node curadoria/checar_lote.js curadoria/lote-NN.json`. Critérios de fonte e de dose: `docs/CRITERIOS_FONTES.md`.
2. Para CADA registro: abra a fonte citada (URL em `fontes`) e confira TODO número clínico — dose, via, frequência,
   duração, limiares, idades gestacionais, valores de exame — e as condutas principais. Prosa geral: amostre.
   Se a fonte não puder ser aberta, o registro não é aprovado.
3. ❌ (REPROVA o registro): número ou conduta que não está na fonte ou a contradiz; fonte não aberta pelo redator ou
   inexistente; texto copiado literalmente; duplicata de registro do acervo ou de outro lote; tema sem sentido clínico.
4. ⚠️ ajuste: fale o texto antigo → novo, com a seção/página da fonte.
5. Duplicatas entre lotes: compare nomes e CID com `dados/diseases.json` e com os outros `curadoria/lote-*.json`.

## Saída
`curadoria/revisao-lote-NN.md`: tabela (registro | APROVADO / APROVADO COM AJUSTES / REPROVADO | motivo) e, abaixo,
os ajustes exatos. Se mandado aplicar: aplique SÓ os ajustes que você escreveu, retire os reprovados para `pulados`
(com o motivo) e rode o checar_lote.js. Entrega: resposta CURTA com a tabela.
