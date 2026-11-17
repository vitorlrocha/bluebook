# Revisão do lote 14 (obstetrícia, Manual de Gestação de Alto Risco, MS 2022) — revisor independente, 13/11/2026
Fonte lida: PDF do manual (pdftotext -layout e -raw; caps. 6, 22, 23.3, 30, 33, 36, 40.4, 41, 49, 50.8, 53, 55, 58, 59, 60, 61, 70, 71, 72, 73) e Resolução CFM 2.320/2022 (PDF do CFM). `checar_lote.js`: OK, 19 registros, nenhum reprovado.

| Registro | Veredito | Motivo |
|---|---|---|
| Tuberculose na gestação | APROVADO | Tabela 1 (doses por peso), piridoxina 50 mg/d e rotina conferem (cap. 30); dose da isoniazida do RN segue PENDENTE (não consta) |
| Doença de Chagas na gestação | APROVADO | Cap. 36 confere; sem doses (PENDENTE) |
| Hepatite C na gestação | APROVADO | Cap. 23.3 confere (percentuais, 600.000 UI/mL, 4x HIV) |
| Citomegalovirose na gestação | APROVADO | Cap. 22 confere (avidez 60%/40%, valaciclovir 2 g 6/6 h até 21 sem, 86%) |
| Doença falciforme e talassemia | APROVADO | Cap. 40.4 confere (ácido fólico 4-5 mg, critérios de transfusão, Quadro 2) |
| Prótese valvar mecânica | APROVADO COM AJUSTES | HBPM 2 mg/kg/dia em 2 doses e RNI 2,5-3,5 conferem (41.6.3); TTPA 1,7-2 confere (41.7.4). Meta de anti-Xa não existe no cap. 41 (PENDENTE); introdução tinha afirmação sem fonte |
| Miastenia gravis | APROVADO | Cap. 60 confere (piridostigmina IV = 1/3 da oral, Mg contraindicado) |
| Tumores de ovário | APROVADO | Cap. 49.2 confere |
| Câncer do colo do útero | APROVADO | Cap. 49.3 confere (conização 14-20 sem, 34 sem, 30-40 dias) |
| Idade materna avançada | APROVADO COM AJUSTES | Tabela de aneuploidias conferida (35/40/45 anos, T21/T18/T13: todos os 9 valores certos). Ficha útil (aconselhamento, rastreio, sem indicação de invasivo só pela idade); CID e conduta ajustados |
| Gestação após cirurgia bariátrica | APROVADO | Cap. 55 e Quadro 1 conferem; sacarato 400 mg/sem x 4 sem confere |
| Gestação após reprodução assistida | APROVADO COM AJUSTES | Percentuais conferem; limite de embriões do manual (CFM 1.957/2010) está revogado: trocado pela Resolução CFM 2.320/2022 |
| Leiomioma uterino na gestação | APROVADO | Cap. 61 confere; complementa as fichas gerais |
| Colo uterino curto | APROVADO COM AJUSTES | Progesterona 200 mg vaginal à noite, 25 mm, 16 sem conferem (cap. 6.2); CID O34.3 retirado |
| Malformações fetais incompatíveis com a vida | APROVADO COM AJUSTES | Cap. 70 confere; concentração do KCl não consta (PENDENTE); sobrepõe-se em parte à ficha "Anencefalia e encefalocele" (lote-06) |
| Arritmias fetais | APROVADO COM AJUSTES | Todas as doses maternas do Quadro 1 conferem; digoxina fetal IM acrescentada; indicações do sotalol completadas |
| Derrame pleural fetal | APROVADO | Cap. 73.6 confere |
| Álcool na gestação (ex-SAF) | APROVADO COM AJUSTES | Cap. 58 confere; renomeada e Q86.0 retirado por duplicar a ficha SAF/TEAF do lote-17 |
| Lesões intraepiteliais cervicais na gestação | APROVADO COM AJUSTES | Erro: LIEBG estava sob colposcopia; o Quadro 1 manda repetir a citologia |

## Ajustes aplicados (texto antigo -> novo)
- Prótese valvar: introdução "dilema varfarina vs heparinas (menos seguras contra trombose da prótese)" (sem fonte) -> recomendação do manual (varfarina 13ª-36ª sem para reduzir trombose; heparina no 1º trimestre). Exames: acrescentado que meta de anti-Xa para prótese não consta (a faixa 0,7-1 U/mL do cap. 50 é da SAF com trombose e não se extrapola). Prescrição: "2 mg/kg/dia divididos em duas doses" + "1 mg/kg a cada 12 h (= dose plena do Quadro 2, cap. 50.8)".
- Arritmias: o -layout deslocava "Dose fetal: 88 mcg/kg a cada 12 h, repetir duas vezes" para a linha do sotalol; no texto bruto pertence à digoxina (IM fetal). "Doses fetais PENDENTE" -> digoxina IM fetal 88 mcg/kg 12/12 h x (repetir duas vezes), risco de lesão do ciático/pele; demais vias fetais PENDENTE. Sotalol: indicações completas (reentrada, atrial ectópica, juncional, flutter). Amiodarona: nota de descontinuação/transição do quadro. Conferência visual final do quadro (p. 658-659) recomendada.
- Reprodução assistida: Resolução CFM 1.957/2010 (2/3/4 embriões por faixa de idade) -> Resolução CFM 2.320/2022 (DOU 20/09/2022, revoga a 2.294/2021): até 37 anos, até 2 embriões; acima de 37, até 3; euploides, até 2 em qualquer idade; doação de oócitos, idade da doadora. Redução embrionária vedada: item 8 da 2.320. Fonte do CFM acrescentada. Não achei resolução posterior; confirmar no portal do CFM.
- Idade materna: tabela correta; CID "Z35.5" (primigesta idosa) -> "Z35.5,Z35.8" (multigesta idosa não tem código no CID-10 BR, sem O09); "Pré-natal de alto risco conforme a estratificação" -> idade acima de 40 anos é critério de maior risco (cap. 1, Quadro 1), entre 35 e 40 depende dos demais fatores; "Cesárea a pedido deve ser discutida" (sem fonte) -> causas controversas da maior cesárea (cap. 53); exames: cita o cap. 71 (idade >35 isolada não indica procedimento invasivo).
- Colo curto: CID "O26.8,O34.3" -> "O26.8" (O34.3 é incompetência cervical, ficha própria).
- Malformações: KCl "2 a 3 mL intracardíaco" -> acrescentado guiado por US, só especialista e "concentração PENDENTE"; critérios remetem às fichas de Edwards, Patau e anencefalia.
- Álcool: nome "Síndrome alcoólica fetal e uso de álcool na gestação" -> "Uso de álcool na gestação: rastreamento e conduta pré-natal"; CID "Q86.0,O35.4" -> "O35.4,O99.3".
- Lesões intraepiteliais: "ASC-H, AGC, LIEBG (conforme quadro), LIEAG...: colposcopia" -> LIEBG <25 anos repetir em 3 anos, >=25 repetir em 6 meses; colposcopia só para ASC-H, AGC, LIEAG e suspeita de invasão. Aviso de que o quadro é das Diretrizes INCA 2016 (conferir a vigente).

## CID (Z35.5 e Z35.8)
Z35 é "Supervisão de gravidez de alto risco" no CID-10 BR; Z35.5 = primigesta idosa (só primigesta) e Z35.8 = outras gravidezes de alto risco. Adequados como código de supervisão; Z35.8 em gravidez após reprodução assistida é aceitável (sem O09 no CID-10 BR).

## Duplicatas
Sem duplicata do acervo ou de outros lotes para os 17 temas gestacionais (as fichas gerais de TB, Chagas, hepatite C, CMV, falciforme, miastenia, mioma e câncer de colo/NIC não cobrem a gestação; "Lesões intraepiteliais cervicais (NIC)" do acervo indica excisão, o que não se aplica na gestação). Sobreposições tratadas: SAF (lote-17) e Anencefalia/encefalocele (lote-06).
