# Revisão do lote 13 (revisor independente; PDFs da Conitec abertos e conferidos)

| Registro | Veredito | Motivo |
|---|---|---|
| Espasticidade (PCDT) | APROVADO COM AJUSTES | Texto, TBA 100/500 U, intervalo 3-4 meses, reavaliação 4-6 semanas e critérios batem; CID incompleto (faltavam I69.0, I69.1, I69.2, I69.8, T90.8 do item 2). |
| Transplante cardíaco | APROVADO COM AJUSTES | Ciclosporina e tacrolimo conferidos no quadro 6.5 e itens 7.1/7.2 (atribuição correta, sem depender de contexto). Falta faixa do tacrolimo 8-12 ng/mL (3º-6º mês); imunoglobulina/plasmaférese estavam fundidas. |
| Transplante hepático pediátrico | APROVADO COM AJUSTES | Tabela D lida (pdftotext -raw): 10-15 (1º-14º dia), 5-10 (15º-30º dia), 5-8 (1º-3º mês), 5-6 (após 3º mês); rejeição 10-15. Resto confere. |
| MPS I | APROVADO | Laronidase 0,58 mg/kg/semana, volumes, velocidades, critérios e interrupção conferem; 1,2 mg/kg quinzenal corretamente "não preconizado". |
| MPS II | APROVADO | Idursulfase 0,5 mg/kg, velocidades 8 mL/h, interrupção em 12 meses, classe C: conferem; Portaria 11, 09/07/2025 ok. |
| MPS VI | APROVADO | Galsulfase 1 mg/kg, 100/250 mL, 6 e 80 mL/h, TC6M 45 m, GAG 60%, CVF/VEF1 10%: conferem; Portaria 20, 05/12/2019 ok. |
| MPS VII | APROVADO | Alfavestronidase 4 mg/kg a cada 2 semanas, 2,5%/97,5%, anafilaxia 2/20, interrupção 3 e 6 meses: conferem; Portaria 8, 21/05/2021 ok. |
| HIV em crianças e adolescentes (Módulo 2) | APROVADO COM AJUSTES | Dolutegravir por peso (quadro 6) e 50 mg a partir de 6 anos/20 kg conferem; erro no quadro 7: TDF+3TC é alternativo (não preferencial) de 3 a 12 anos. |
| Dor crônica (PCDT 2024) | APROVADO COM AJUSTES | Todas as posologias conferem; a "dose pediátrica inconsistente do ibuprofeno" era a da codeína (colunas vizinhas): ibuprofeno pediátrico real é em gotas. |
| Imunodeficiência primária (IgG IV) | APROVADO | PCDT 495/2007 segue vigente; não há portaria substituta (jul/2026), só proposta de atualização em consulta pública (CP 71, relatório preliminar jul/2026). Doses conferem. |

Duplicatas: nenhuma. "Mucopolissacaridoses" (E76.0, genérica), "HIV na infância: transmissão vertical" (Módulo 1), "Dor crônica no idoso" e demais dor são temas distintos; não há ficha de espasticidade geral nem de imunoglobulina para IP em dados/diseases.json nem em outros lotes (lote 11 tem hepático adulto, outro registro).

## Ajustes aplicados em curadoria/lote-13.json
- Espasticidade, cid: acrescentados I69.0, I69.1, I69.2, I69.8, T90.8.
- Cardíaco, prescrição 2: tacrolimo "vale 10-15 ng/mL inicialmente; 8-12 ng/mL do 3º ao 6º mês; 5-10 ng/mL do 7º mês em diante" (item 7.2). Prescrição 7: "Imunoglobulina humana 2 g/kg no total, dividida em até 4 doses após cada plasmaférese; plasmaférese 1-2 trocas/dia, 4 sessões".
- Hepático pediátrico, prescrição 1: níveis de tacrolimo por período (tabela D) no lugar de PENDENTE.
- HIV, tratamento: "3 a 12 anos ABC+3TC + dolutegravir (alternativos AZT+3TC ou TDF+3TC); acima de 12 anos TDF+3TC + dolutegravir (alternativos ABC+3TC ou AZT+3TC)".
- Dor crônica: ibuprofeno pediátrico (a partir de 6 meses, 1-2 gotas/kg 3-4x/dia, máx. 40 gotas/dose e 160 gotas/dia); codeína pediátrica 0,5-1,0 mg/kg/dose a cada 4-6 h, máx. 60 mg/dia.
- Observações atualizadas (IP: status da atualização; demais: conferências).
- Nenhum reprovado; `pulados` inalterado.
