# Brief do redator (lotes em escala) — leia inteiro antes de começar

Projeto: `C:\Users\vlprl\Projetos\bluebook` (Windows, Node 24). Você escreve doenças novas para o
app médico Blue Book (português do Brasil, público: médicos). Regras completas: `docs/ESTRATEGIA_ACERVO.md`.
Modelo de qualidade: `curadoria/lote-01.json` (aprovado pelo revisor) — copie o estilo, o tamanho e o formato.

## Economia (obrigatório)
- Economia é POUCAS buscas, nunca ZERO: cada registro precisa de pelo menos UMA fonte oficial aberta e lida NESTA
  tarefa. Escrever "de memória" ou citar URL que você não abriu é proibido — o lote é devolvido. Sem fonte em até
  3 buscas: mova o tema para `pulados`.
- Seja econômico: no máximo ~3 buscas na web por doença; prefira UMA fonte oficial principal por doença.
- Reaproveite fontes amplas: um mesmo manual do Ministério da Saúde (ex.: Guia de Vigilância em Saúde, Cadernos de
  Atenção Básica, Gestação de Alto Risco 2022, Atenção à Saúde do Recém-Nascido, Protocolos de Urgência) cobre várias
  doenças — leia só o capítulo necessário. Não baixe PDFs inteiros sem necessidade.
- Não reescreva o lote inteiro várias vezes: escreva cada registro uma vez, valide no fim.

## Qualidade (obrigatório)
- Antes de escrever, confira se a doença JÁ EXISTE (nome, sinônimo ou CID) em `dados/diseases.json`
  (`const L=require('./ferramentas/lib_dados'); const D=L.lerDados(L.VARS.find(c=>c.v==='DISEASES'))`).
  Se existir, PULE e anote "já existe: <nome>". Se o tema não fizer sentido como ficha clínica, pule e explique.
- Toda dose (droga, dose, via, frequência, duração) tem de estar na fonte que você leu. Sem fonte: "PENDENTE DE
  VERIFICAÇÃO". Na dúvida, descreva a conduta sem dose.
- Fontes e dose: siga `docs/CRITERIOS_FONTES.md` (hierarquia A–E e regra da dose-base). Em resumo: Ministério da Saúde/PCDT/Conitec, sociedades brasileiras, bula Anvisa; OMS/CDC/NICE só como
  complemento ou quando não houver brasileira (diga isso na linha Base).
- Escreva com suas palavras; nunca copie frases das fontes nem de outros apps.
- `prescricao` termina com `Base: <instituição, documento, ano>`. CID só se existir em `dados/cid_full.json`
  (`cat` e `sub` são listas `[código, ...]`; subcategoria sem ponto, ex. "J189" = J18.9). Área: uma das áreas já usadas
  no acervo. `esp`: de `dados/especialidades.json`.

## Lotes "por fonte" (08 em diante)
Você recebe UM documento oficial grande. Fluxo: (1) abra o sumário/índice do documento; (2) liste TODAS as condições
clínicas que ele trata; (3) para cada uma, confira se já existe no acervo (nome, sinônimo, CID) — se existir, pule;
(4) escreva as que faltam usando o capítulo do próprio documento como fonte principal (leia o capítulo). Isso rende
muitas fichas por documento lido. Limite: até 25 fichas por lote. Evite temas que já estejam em outros
`curadoria/lote-*.json` (confira os nomes antes).

## Saída
Arquivo `curadoria/lote-NN.json` no mesmo formato do lote 01:
`{"lote","criadoEm","doencas":[{"registro":{area,nome,introducao,criterios,exames,tratamento,conduta,prescricao,cid,esp},
"fontes":[{titulo,instituicao,ano,url,usadoPara}],"observacoes"}],"pulados":[{"tema","motivo"}]}`.
Rode `node curadoria/checar_lote.js curadoria/lote-NN.json` até dar OK. Só crie arquivos em `curadoria/`;
não altere `dados/`, `src/`, testes nem outros lotes.
Entrega: resposta CURTA — quantas escritas, quantas puladas (e por quê), o que ficou PENDENTE.
