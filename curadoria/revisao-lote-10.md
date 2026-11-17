# Revisão de fontes — lote 10

Revisor independente. Data: 13/11/2026. Fonte única: CAB 28 v. II (MS, 2013), caps. 2.21 e 2.22, baixada e lida com `pdftotext` (Figuras 47, 48, 49, 50, 53 são imagem). `checar_lote.js`: OK (avisos só de CID compartilhado). Sem duplicatas no acervo nem nos lotes 01 a 12: "Síndrome de Costen" (K07.6) é outra ficha (sintomas otológicos, crônica); lote 01 traz pulpite/abscesso, não trauma dentário; nada sobre fotoceratite ou hemorragia subconjuntival no acervo.

| # | Registro | Veredito | Motivo |
|---|---|---|---|
| 1 | Traumatismo dentoalveolar | APROVADO COM AJUSTES | Tempos de contenção, <1 h no reimplante e condutas por dentição conferem (p. 196-198); retirado "queda, esporte ou agressão", "tempo fora define prognóstico", "CEO", definição de intrusão |
| 2 | Hemorragia bucal pós-exodontia | APROVADO COM AJUSTES | 90%, 12 h, 15-20 min, 24 h conferem (p. 198-199); retirados antiagregantes, hepatopatia, discrasia e exames de coagulação (fora do capítulo) |
| 3 | Alveolite pós-exodontia | APROVADO COM AJUSTES | Antibiótico sistêmico na seca está exatamente como o CAB 28 diz (implante aloplástico + antibiótico; p. 205); retirado "no mesmo dia" |
| 4 | Luxação de ATM / DTM aguda | APROVADO | Manobra de Nelaton, bandagem 24-48 h, dieta pastosa conferem (p. 200) |
| 5 | Lesões traumáticas da mucosa oral | APROVADO COM AJUSTES | Confere (p. 202); retirados "benignas", investigação de lesão que não cicatriza, "retorno se persistir", lidocaína |
| 6 | Hemorragia subconjuntival | APROVADO COM AJUSTES | O capítulo só diz: coleção de sangue, esforço/pico hipertensivo, absorção espontânea (p. 211); retirados PA, hipertensão, coagulopatia e "dor intensa" |
| 7 | Fotoceratite (UV) | APROVADO COM AJUSTES | Colírio anestésico 1 gota + pomada + oclusão, atropina 1%, 48-60 h conferem (p. 216); retirados advertência de uso domiciliar (sem fonte), "24 h de oclusão", biomicroscopia, "lâmpada solar", fotofobia |

Reprovados: nenhum (`pulados` inalterado).

## Ajustes aplicados em `lote-10.json`
- 1: introdução "por queda, esporte ou agressão... lábios, língua, face e crânio" -> "frequentemente associadas a lesões de outras estruturas da face"; extrusão "para fora do alvéolo" -> "deslocamento (vestibular, palatino ou lingual)"; intrusão -> "irrigar e limpar a área para localizar o dente"; radicular: acrescentado "terços médio e apical; diagnóstico radiográfico; sem radiografia, pressão digital e contenção rígida 3 meses"; conduta: "Excluir trauma craniano... antes" -> "Examinar sinais de trauma craniano"; avulsão sem justificativa de prognóstico; "CEO" -> "serviço de maior complexidade".
- 2: critérios e exames reduzidos ao que o capítulo cita (anticoagulantes, lesões periodontais, comprometimento sistêmico); "ajuste de anticoagulante" -> "associar medidas com a equipe médica".
- 3: "tratamento local no mesmo dia" -> "tratamento local".
- 5: retiradas as frases sem fonte citadas acima.
- 6: ficha reescrita só com o conteúdo do capítulo.
- 7: introdução, critérios, exames e conduta reescritos; advertência sobre anestésico domiciliar removida (não achei em fonte oficial aberta).

Observação clínica (não alterada): o antibiótico sistêmico na alveolite seca é a posição do CAB 28; diretrizes atuais tendem a manejo local, mas a ficha atribui explicitamente ao CAB 28 e não traz dose.
