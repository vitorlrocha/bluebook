# Lacunas do acervo: mapeamento de 12/11/2026

Feito pelo mapeador (somente leitura). Acervo lido com `ferramentas/lib_dados` (3.226 doenças). CID conferido em
`dados/cid_full.json`. Para cada condição procurei no acervo pelo nome sem acento, pelos sinônimos e pelos códigos
CID (categoria de 3 caracteres e subcategoria). Nos casos duvidosos, também procurei no texto dos registros
(introdução, critérios, conduta).

## Resumo

- **Lista estruturada conferida:** 302 condições, tiradas de 6 listas-fonte (abaixo).
  - **Já existem:** 287. Entre elas estão várias que existem com outro nome. Exemplos: "Bronquiolite viral aguda"
    (Pediatria, J21.9), "Tétano acidental e neonatal" (Infectologia), "Doença mineral e óssea da DRC",
    "Hepatite B na gestação e profilaxia do RN" e "Vasculite associada a ANCA".
  - **Faltam:** 12.
  - **A conferir:** 3.
- **Conferência extra:** mais cerca de 230 termos avulsos de APS, urgência, pediatria e obstetrícia (por exemplo
  gota, entorse, fissura anal, estenose de piloro, aderência de pequenos lábios, distócia de ombro e embolia
  amniótica). Quase tudo já existe. Essa etapa achou mais **9 faltas** e **3 casos a conferir**.
- **Total:** 21 condições faltando e 6 a conferir.
- **Conclusão:** o acervo já cobre quase toda a lista de PCDT, as doenças de notificação compulsória e os
  capítulos dos manuais do MS. As lacunas que sobram são principalmente queixas agudas muito comuns na APS
  (resfriado, bronquite aguda, dor de dente), algumas situações obstétricas específicas e doenças raras de
  notificação ou de PCDT.

## Listas-fonte usadas

| Código | Lista | URL |
|---|---|---|
| PCDT | Conitec: lista de PCDT vigentes | https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/protocolos-clinicos-e-diretrizes-terapeuticas/pcdt |
| DDT | Conitec: Diretrizes Diagnósticas e Terapêuticas (oncologia) | https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/protocolos-clinicos-e-diretrizes-terapeuticas/ddt |
| DNC | Lista nacional de notificação compulsória, Portaria GM/MS nº 3.148/2024, conforme a Resolução SS-SP nº 88/2024. Esta resolução reproduz a lista nacional e marca com (***) os itens só estaduais. | https://portal.saude.sp.gov.br/resources/cve-centro-de-vigilancia-epidemiologica/publicacoes/dncabril2024_estadual.pdf |
| DNC+ | Inclusões posteriores: esporotricose (Portaria GM/MS 6.734/2025), caxumba e Oropouche (Portaria GM/MS 11.211/2026; a data ainda precisa ser conferida no DOU) | https://app.wiki.saude.es.gov.br/vigilancia/sistemas/portaria_gm_ms_n%C2%BA_6.734_de_18_de_mar%C3%A7o_de_2025_-_esporotricose_humana_na_lista_nacional.pdf |
| GAR | Ministério da Saúde: Manual de Gestação de Alto Risco, 2022 (sumário com 75 capítulos) | https://projetomellyssa.mpmg.mp.br/wp-content/uploads/2022/08/MS-MANUAL-DE-GESTACAO-DE-ALTO-RISCO-2022-1.pdf |
| RN | Ministério da Saúde: Atenção à Saúde do Recém-Nascido, volumes 1 a 4 (capítulos 1 a 40) | https://bvsms.saude.gov.br/bvs/publicacoes/atencao_saude_recem_nascido_v3.pdf (os outros volumes têm o mesmo endereço, terminando em v1, v2 e v4) |
| CAB28 | Ministério da Saúde: Cadernos de Atenção Básica nº 28, volume II, Queixas comuns na demanda espontânea | https://bvsms.saude.gov.br/bvs/publicacoes/acolhimento_demanda_espontanea_queixas_comuns_cab28v2.pdf |
| FOR | Santos e Ribeiro, RBMFC 2015: motivos de consulta mais comuns numa equipe de Saúde da Família de Fortaleza (CIAP-2) | https://rbmfc.org.br/rbmfc/article/view/831 |
| USP | Hospital Universitário da USP: capítulo "Pronação dolorosa" (Urgências e emergências em pediatria geral, 2015). Não é fonte oficial; usada só para apontar a lacuna. | https://repositorio.usp.br/item/002694687 |

**Limites da pesquisa:**
- Não consegui baixar uma lista completa dos documentos científicos da SBP: o site mostra só os mais recentes.
- Também não consegui a lista completa dos Protocolos FEBRASGO: a página de protocolos dá 404.
- Para pediatria e obstetrícia, usei os manuais do MS (RN e GAR) como lista de temas. Antes de escrever, os
  redatores devem procurar o documento da SBP ou da FEBRASGO sobre cada tema.

## Condições que faltam (ordenadas por prioridade)

Prioridades:
- **P1:** muito frequente ou grave em APS, urgência, pediatria ou obstetrícia.
- **P2:** relevante, mas menos frequente.
- **P3:** rara ou de nicho (PCDT de doença rara).

A coluna "CID-10" só traz códigos que existem em `dados/cid_full.json`. Quando aparece "a confirmar", é porque
não há um código único e seguro.

| Prioridade | Condição | Área sugerida | CID-10 | Fonte | Observação |
|---|---|---|---|---|---|
| P1 | Hipertensão gestacional (sem proteinúria) | Ginecologia e Obstetrícia | O13 | GAR cap. 11 | Já existem "Pré-eclâmpsia", "Hipertensão crônica na gestação" e "HELLP", mas falta o registro da hipertensão gestacional. |
| P1 | Sepse na gestação (sepse materna) | Ginecologia e Obstetrícia | a confirmar (A41.9 com código O) | GAR cap. 38 | Já existem "Infecção puerperal", "Corioamnionite" e a sepse geral (Urgência), mas não a sepse durante a gestação. |
| P1 | Esteatose hepática aguda da gravidez | Ginecologia e Obstetrícia | O26.6 | GAR cap. 15 | Só a colestase usa O26.6 hoje. |
| P1 | Covid-19 e influenza na gestação | Infectologia | O98.5 | GAR cap. 27 e 28; DNC | O acervo tem covid e influenza gerais e "Vacinação na gestação", mas não o manejo na gestante. |
| P1 | Resfriado comum (nasofaringite aguda) | Clínica Médica | J00 | CAB28 2.18; FOR (R80 gripe, R05 tosse) | Não há registro com esse nome nem com J00. Hoje "Síndrome gripal e COVID-19 leve" faz esse papel em parte. |
| P1 | Bronquite aguda (tosse aguda no adulto) | Pneumologia | J20.9 | CAB28 2.6; FOR (R05 tosse); DNC-SP (infecções agudas das vias aéreas inferiores) | Nenhum registro com J20. |
| P1 | Urgências odontológicas na APS: pulpite, abscesso periapical, periodontite aguda | Urgência e Emergência | K04.0, K04.7, K05.2 | CAB28 2.21 | Não há nada do capítulo K02 a K08 no acervo. O acervo não tem área de odontologia, por isso sugiro Urgência e Emergência. |
| P1 | Pronação dolorosa (subluxação da cabeça do rádio) | Ortopedia e Traumatologia | S53.0 | USP (fonte não oficial; procurar documento da SBP ou da SBOT) | Muito comum no pronto-socorro infantil. Não foi achada nem por nome nem no texto dos registros. |
| P1 | Lesões benignas da pele do recém-nascido (eritema tóxico, miliária, milium) | Pediatria | P83.1, L74.0 | RN cap. 31 | Nenhum registro cita eritema tóxico ou miliária. |
| P2 | Criança exposta à hepatite C (transmissão vertical) | Pediatria | P35.3 | RN cap. 19 | Só aparece citada no texto de "Hepatites virais". |
| P2 | Tuberculose na gestação | Infectologia | O98.0 | GAR cap. 30 | |
| P2 | Febres hemorrágicas virais (Ebola, Marburg, Lassa, arenavírus) | Infectologia | A98.4, A98.3, A96.2 | DNC (notificação imediata) | |
| P2 | Febre purpúrica brasileira | Infectologia | A48.4 | DNC (notificação imediata) | Grave em criança, mas rara. |
| P3 | Hanseníase na gestação | Dermatologia | O98.8 | GAR cap. 31 | |
| P3 | Miastenia gravis na gestação | Neurologia | O99.3 | GAR cap. 60 | |
| P3 | Gestação após cirurgia bariátrica | Ginecologia e Obstetrícia | a confirmar (Z98.0 com código O) | GAR cap. 55 | Existem "Obesidade na gestação" e "Complicações da cirurgia bariátrica". |
| P3 | Varíola (suspeita, disseminação intencional) | Infectologia | B03 | DNC | |
| P3 | Imunossupressão no transplante hepático e cardíaco | Gastroenterologia e Hepatologia / Cardiologia | Z94.4, Z94.1 | PCDT | O transplante renal tem 3 registros; o hepático só tem complicações. |
| P3 | Ictioses hereditárias (lamelar, ligada ao X etc.) | Dermatologia | Q80.1, Q80.2 | PCDT | Hoje só existe "Ictiose vulgar e xerose" (Q80.0). |
| P3 | Espasticidade (tratamento, incluindo toxina botulínica) | Neurologia | a confirmar | PCDT | Só existem formas específicas, como "Hemiparesia espástica pós-AVC" e a paraparesia espástica. |
| P3 | Lipofuscinose ceroide neuronal tipo 2 (CLN2) | Neurologia | E75.4 | PCDT | |

## A conferir (não tenho certeza de que falta)

- **Doença invasiva por *Haemophilus influenzae*** (DNC; A41.3, G00.0). Existem "Epiglotite aguda" e "Meningite
  bacteriana", que tratam do tema por síndrome. Falta decidir se vale um registro próprio.
- **ESAVI no adulto** (DNC; T88.1). Existe "Vacinação: calendário e eventos adversos pós-vacinais" (Pediatria),
  mas nenhum registro para adultos. Pode ser suficiente ampliar o registro atual.
- **Acidente de trabalho grave** (DNC). É uma categoria de notificação, não uma doença. Já existem os registros
  de perfurocortante, de exposição ocupacional e "Câncer ocupacional".
- **Idade materna avançada** (GAR cap. 53). É um fator de risco, não uma doença. Falta decidir se entra.
- **Ftiríase (pediculose pubiana)** (B85.3). Não aparece em nenhum registro. Não confirmei que está numa lista
  oficial (o PCDT de IST pode citá-la).
- **Sopro cardíaco inocente na criança** (R01.0). Não existe no acervo, mas não está em nenhuma das listas
  usadas.

## Proposta de lote piloto (10 condições P1, de 7 áreas)

1. Hipertensão gestacional (Ginecologia e Obstetrícia, O13)
2. Sepse na gestação (Ginecologia e Obstetrícia, CID a confirmar)
3. Esteatose hepática aguda da gravidez (Ginecologia e Obstetrícia, O26.6)
4. Covid-19 e influenza na gestação (Infectologia, O98.5)
5. Resfriado comum (Clínica Médica, J00)
6. Bronquite aguda (Pneumologia, J20.9)
7. Urgências odontológicas na APS: pulpite, abscesso periapical, periodontite aguda (Urgência e Emergência,
   K04.0, K04.7, K05.2)
8. Pronação dolorosa (Ortopedia e Traumatologia, S53.0)
9. Lesões benignas da pele do recém-nascido (Pediatria, P83.1, L74.0)
10. Criança exposta à hepatite C (Pediatria, P35.3). É P2, mas entra no lugar de uma 11ª P1, que não existe:
    só foram achadas 9 condições P1.

Fontes sugeridas para os redatores:
- Itens 1 a 4: Manual de Gestação de Alto Risco (MS, 2022) e Protocolos FEBRASGO.
- Itens 5 a 7: CAB nº 28, volume II.
- Item 8: SBP ou SBOT.
- Itens 9 e 10: Atenção à Saúde do Recém-Nascido (MS) e o PCDT de transmissão vertical (HIV, sífilis e hepatites
  virais).
