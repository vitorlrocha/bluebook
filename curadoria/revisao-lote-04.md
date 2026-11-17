# Revisão de fontes — lote 04

Revisor independente. Li a Nota de Alerta nº 41 da SBP (01/02/2023), as páginas do MSF (pelagra e ácido ascórbico oral) e o PDF AIDPI/Fiocruz. `checar_lote.js`: OK. Kwashiorkor/marasmo (E40/E41) não duplicam "Desnutrição grave (SAM)" (E43): CID próprio, e as fichas novas remetem às doses da existente.

| # | Registro | Veredito | Motivo |
|---|---|---|---|
| 1 | Kwashiorkor (E40) | APROVADO | Edema +/++/+++, cabelo, dermatose, critérios de internação, limiares (54 mg/dL; 35,5/35,0 °C; 39/38,5 °C), 10 passos e critérios de alta conferem com a Nota 41 (Quadros 1 e 2) |
| 2 | Marasmo (E41) | APROVADO COM AJUSTES | z < -3 e CB < 11,5 cm conferem; os critérios de menores de 6 meses são de internação, não de diagnóstico |
| 3 | Pelagra (E52) | APROVADO COM AJUSTES | Nicotinamida 100 mg 3x/dia, dieta proteica, 15 mg/dia e quadro clínico conferem com o MSF; remover item sem fonte |
| 4 | Escorbuto (E54) | APROVADO COM AJUSTES | Os dois esquemas, duração, prevenção 50 mg/dia e cuidados conferem com o MSF; critérios clínicos não estavam na fonte |
| 5 | Deficiência de zinco (E60) | REPROVADO | Fonte é material regional sobre diarreia, não sobre deficiência de zinco; dose interna contraditória; movido para `pulados` |

## Fonte internacional (pelagra e escorbuto)
Aceito. Busquei protocolo do Ministério da Saúde, SBP ou Anvisa para as duas e não achei (só MSD Manual, artigos e relatos, com doses divergentes). A linha "Base" de ambas já diz que a fonte é internacional (MSF) e manda confirmar com a bula brasileira. Condições cumpridas.

## Zinco: reprovado
O PDF (AIDPI Yanomami e Ye'kwana, slides 5 e 34-35) só trata zinco na diarreia (10-14 dias; 10 mg até 6 meses, 20 mg acima). Não traz critérios, exames, adultos nem outras causas, então a ficha "Deficiência de zinco" entregaria um protocolo de diarreia sob outro nome. O slide 34 ainda contradiz o slide 5: "dois comprimidos mastigáveis 2x ao dia" (de 20 mg) contra 20 mg/dia. Reapresentar só com fonte sobre a deficiência.

## Ajustes aplicados
1. Marasmo, critérios — antes: "Em menores de 6 meses, observar também edema bilateral, perda recente ou ganho inadequado de peso e dificuldade de amamentação." Depois: "Em menores de 6 meses, ver os critérios de internação na conduta." (Nota 41, Quadro 1, p. 3: são critérios de hospitalização.)
2. Pelagra, introdução — antes: "alimentação monótona e pobre nesse nutriente, como em campos de refugiados". Depois: deficiência de niacina e/ou triptofano; sorgo como base alimentar, má absorção, fome (MSF).
3. Pelagra, exames — removido "Investigar outras carências nutricionais e a causa da dieta inadequada" (sem fonte); mantido que a fonte não descreve exame.
4. Pelagra, conduta — removido "avisar a vigilância local" (sem fonte).
5. Escorbuto, critérios — removido "sangramentos, alterações gengivais e de cicatrização" e "a resposta ao tratamento sustenta o diagnóstico" (não estão na monografia do MSF); critérios clínicos e laboratoriais ficam PENDENTES.
6. Escorbuto, prescrição — acrescentado "Esquemas alternativos (a fonte oferece dois; escolher um)" antes do item 1.
7. Zinco — retirado de `doencas` e incluído em `pulados` com o motivo.
