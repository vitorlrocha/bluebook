# Fontes usadas na revisão de PENDENTES e divergências (26 e 27/11/2026)

Todas foram lidas no documento original (PDF ou rótulo); os scripts em `curadoria/` citam a fonte em cada trecho trocado.

## Diretrizes e manuais brasileiros (Ministério da Saúde e Conitec)

| Fonte | Usada em | Endereço |
|---|---|---|
| Protocolos de Intervenção para o SAMU 192 – Suporte Avançado de Vida, 2ª ed. (2016) | lote 02 (dor, sedação, anafilaxia, choque, lidocaína, antídotos); hidrocortisona na anafilaxia (APed26) | https://www.gov.br/saude/pt-br/composicao/saes/samu-192/publicacoes/protocolo-de-suporte-avancado-de-vida-1.pdf |
| PCDT da Hanseníase (Portaria SCTIE/MS 67/2022) | lote 02 (prednisona na neurite) | https://www.gov.br/conitec/pt-br/midias/protocolos/20220818_pcdt_hanseniase.pdf |
| Manual de Vigilância da Leishmaniose Tegumentar (2017) | lote 02 (forma mucosa) | https://saude.sp.gov.br/resources/cve-centro-de-vigilancia-epidemiologica/areas-de-vigilancia/doencas-de-transmissao-por-vetores-e-zoonoses/doc/leish/manual17_lta_ms.pdf |
| Manual de Recomendações para o Controle da Tuberculose no Brasil, 2ª ed. (2019) | lote 02 (profilaxia do RN) | https://bvsms.saude.gov.br/bvs/publicacoes/manual_recomendacoes_controle_tuberculose_brasil_2_ed.pdf |
| Protocolo de vigilância da infecção latente pelo M. tuberculosis, 2ª ed. (2022) | consulta (sem dose por kg) | https://www.gov.br/aids/pt-br/central-de-conteudo/publicacoes/2022/af_protocolo_vigilancia_iltb_2ed_9jun22_ok_web.pdf |
| Atenção à Saúde do Recém-Nascido, v. 2 e v. 3 (2ª ed., 2014) | lote 02 (antibiótico neonatal, surfactante) | https://bvsms.saude.gov.br/bvs/publicacoes/atencao_saude_recem_nascido_v2.pdf · https://bvsms.saude.gov.br/bvs/publicacoes/atencao_saude_recem_nascido_v3.pdf |
| Cadernos de Atenção Básica nº 28, v. II – Acolhimento à demanda espontânea (2013), Quadro 61 | lote 03 (odontologia) | https://bvsms.saude.gov.br/bvs/publicacoes/acolhimento_demanda_espontanea_queixas_comuns_cab28v2.pdf |
| PCDT da Doença de Chagas (Portaria Conjunta 57/2018) | lote 03 (benznidazol na gestação) | https://www.gov.br/conitec/pt-br/midias/protocolos/pcdt_doenca_de_chagas.pdf |
| Formulário Terapêutico Nacional 2010 (Rename) | lote 04 (32 trechos); consulta na hidrocortisona e na cefotaxima | https://bvsms.saude.gov.br/bvs/publicacoes/formulario_terapeutico_nacional_2010.pdf |
| PCDT da Miastenia Gravis (Portaria Conjunta 11/2022) | lote 05 (prednisona) | https://www.gov.br/conitec/pt-br/midias/protocolos/copy_of_20220530_PORTAL_PCDT_Miastenia_Gravis.pdf |
| PCDT para Atenção Integral às Pessoas com IST (2022) | lote 05 (ácido tricloroacético) | https://www.saude.sp.gov.br/resources/crt/assistencia/pcdt/pcdtists2022.pdf |
| Manual de Normas e Procedimentos para Vacinação (2024) | lote 05 (BCG, hepatite B) | https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/guias-e-manuais/2024/manual-de-normas-e-procedimentos-para-vacinacao.pdf |

## Rótulos FDA (DailyMed, NLM/NIH) — lote 01

| Medicamento | Usado em | setid (DailyMed) |
|---|---|---|
| Doxiciclina injetável (Doxy 100) | tifo epidêmico | 9454f948 |
| Acetato de medroxiprogesterona 150 mg/mL | anticoncepção injetável | 0476eac5 |
| Simeticona | flatulência na gestação | 60b16b10 |
| Piridostigmina (Mestinon) | miastenia na gestação | a851795e |
| Varfarina | prótese valvar | 4f276251 |
| Mupirocina pomada | impetigo do RN | b8e115ce |

Endereço de cada rótulo: `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=<setid completo>` (o setid completo está no script de cada lote).

## Remissões às fichas do app

Onde nenhuma fonte trazia a dose da indicação, o texto diz "ver a ficha X deste app". A dose fica na ficha do medicamento, e nada foi copiado. Os scripts `pendentes-presc-04.js` e `-05.js` conferem que cada ficha citada existe.
