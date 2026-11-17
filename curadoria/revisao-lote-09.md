# Revisão de fontes — lote 09

Revisor independente. Data: 13/11/2026.

**Fonte conferida:** Protocolos de Intervenção para o SAMU 192 – Suporte Avançado de Vida, MS, 2ª ed., 2016 (PDF do gov.br, texto extraído com `pdftotext -layout` e `-raw`). Os protocolos AC4, AC10, AT11, AT16, AT19, AP18/19, APed 6, 11, 15, 16, 17, 18, 21, 22, 27, 28 e ATox 2, 14, 16, 17 foram lidos inteiros e comparados número a número.

**Checagem automática:** `checar_lote.js` OK (só avisos de CID compartilhado). Depois da aplicação: 16 registros, 10 pulados.

| # | Registro | Veredito | Motivo |
|---|---|---|---|
| 1 | Pós-parada cardíaca, adulto (AC10) | APROVADO COM AJUSTES | Números conferem (SatO2 ≥ 94%, 10–12/min, PAS < 90, 1–2 L). Sobreposição parcial com a linha "Pós-RCE" da ficha PCR, mas esta traz a conduta pré-hospitalar própria. CID: tirar I46.9. |
| 2 | Pós-ressuscitação, criança (APed 11) | APROVADO | SatO2 94–99%, VT 6–8 mL/kg, Ti 0,5–1 s, Ppico 20–30, FR 20–30/16–20, PEEP 3–5, bolus 20 e 5–10 mL/kg: todos conferem. Não há ficha pós-RCE pediátrica no acervo. |
| 3 | Pneumotórax aberto (AT11) | APROVADO | Curativo em 3 lados, FR > 28/< 8, SatO2 ≥ 94%: conferem. Acervo não tem o aberto. |
| 4 | Trauma abdominal aberto (AT16) | APROVADO COM AJUSTES | PA 80–90 mmHg, evisceração, objeto encravado conferem. Ajustes abaixo. |
| 5 | Parada respiratória, adulto (AC4) | APROVADO COM AJUSTES | 10–12/min, 8–10/min, 10–15 L/min conferem. Ajuste em "exames". |
| 6 | Parada respiratória, criança (APed 6) | APROVADO | 12–20/min, 20/min com via avançada, FC ≤ 60: conferem. |
| 7 | Choque na criança (APed 17) | APROVADO | 20 mL/kg 5–20 min, 5–10 mL/kg, cetoacidose 20 mL/kg em 60 min, hidrocortisona 1–2 mg/kg (máx. 100 mg): conferem. Pediátrico, distinto das fichas de choque do adulto. |
| 8 | Insuficiência respiratória aguda, criança (APed 18) | APROVADO | FC > 140, SatO2 < 90%, FR < 10/> 60, Glasgow ≤ 8: conferem. Ficha existente de IRA é de adulto. |
| 9 | Crise convulsiva/EME na criança (APed 22) | REPROVADO | Doses conferem, mas é duplicata de "Estado de mal epiléptico pediátrico", "Crise convulsiva febril", "Convulsão febril complexa..." e "Convulsões neonatais" (mesma sequência de fármacos). |
| 10 | Rebaixamento da consciência, criança (APed 21) | REPROVADO | Duplicata das três fichas de coma; sem dose ou limiar novo (hipoglicemia ficou PENDENTE). |
| 11 | Vômitos na criança (APed 28) | APROVADO COM AJUSTES | Ondansetrona, dimenidrinato, omeprazol, 50 e 20 mL/kg conferem. **Ranitidina retirada** (ver abaixo). |
| 12 | Bradicardia, criança (APed 15) | APROVADO | Epinefrina 0,01 mg/kg, infusão 0,1–0,3 mcg/kg/min, atropina 0,02 mg/kg (0,1–0,5 mg): conferem. |
| 13 | Taquiarritmias com pulso, criança (APed 16) | APROVADO | Adenosina 0,1/0,2 mg/kg (6/12 mg), 0,5–1 e 2 J/kg, amiodarona 5 mg/kg, lidocaína, magnésio 25–50 mg/kg (máx. 2 g), limiares de FC e QRS: conferem. |
| 14 | Síndromes tóxicas (ATox 2) | APROVADO | Sem valor numérico na ficha. As colunas FC/PA/FR/T/pupila da Tabela 1 são setas gráficas e não foram usadas; sinais por síndrome e antídotos (Tabelas 2–10, 3 lida em `-raw`) conferem. Sem doses (PENDENTE, correto). |
| 15 | Trauma de membros (AT19) | APROVADO | Sem número; passos conferem. Distinto de "Fratura exposta" e "Amputação". |
| 16 | Hemorragia externa grave: compressão e torniquete (AP18/19) | APROVADO COM AJUSTES | Largura ≥ 10 cm, < 2 h, registro do horário conferem. Nenhuma ficha do acervo trata compressão/torniquete pré-hospitalar (só citações em ofidismo/politrauma). CID: tirar R58 (usado em "Hemorragia terminal"). |
| 17 | Descontaminação química (ATox 14, 16, 17) | APROVADO COM AJUSTES | Carvão 1 g/kg (máx. 50 g), 8 mL/g, 30 min, fenoterol 10 gotas/5 mL/6 L/min q20 min × 3, olhos ≥ 20 min, 0800 722 6001: conferem. Ajuste na lavagem gástrica. |
| 18 | Febre na criança (APed 27) | APROVADO | Limiares de temperatura, paracetamol, ibuprofeno, dipirona (VO, IM/IV) e contraindicações conferem. Distinta de "Febre sem sinais de localização", que é investigação de lactente. |

## Ajustes aplicados

- **#1** `cid`: "I46.0,I46.9" → "I46.0".
- **#4** `exames`: "busca de ferimentos de entrada e saída" → "busca de múltiplos ferimentos" (AT16 diz "são esperados múltiplos ferimentos"). `conduta`: "Imobilizar coluna e transportar sem atraso" → "Considerar a imobilização da coluna cervical, tronco e membros em prancha longa, sem atrasar o transporte" (AT16 passo 9).
- **#5** `exames`: removido "oximetria, capnografia e ritmo cardíaco" (não consta no AC4); entra "após via aérea avançada, checagem do ritmo a cada 2 min".
- **#11 Ranitidina:** retirada de `conduta` e `prescricao` (omeprazol fica como único protetor gástrico) e de `usadoPara`. Motivo registrado em `observacoes` e numa linha de "Obs." da prescrição: a Anvisa proibiu comercialização, distribuição, fabricação, importação, manipulação e propaganda do cloridrato de ranitidina (todas as apresentações e lotes) pela **Resolução-RE nº 3.259, de 26/08/2020 (DOU 27/08/2020)**, pela possibilidade de formação de NDMA. Texto da resolução e do motivo lidos na Nota Técnica CAF 15/2022 da SES-SP e no relatório Conitec 695/2021 (que citam o DOU: https://www.in.gov.br/en/web/dou/-/resolucao-re-n-3.259-de-26-de-agosto-de-2020-274384354). Não consegui abrir a página da Anvisa nem o DOU diretamente (bloqueio 403/conexão); a citação vem dessas duas fontes secundárias oficiais.
- **#16** `cid`: "T14.5,R58" → "T14.5".
- **#17** `tratamento`: lavagem gástrica passa a "como regra, não deve ser feita no pré-hospitalar (raramente, em transporte prolongado ou área remota, a critério do médico habilitado)" (ATox 14).
- **#9 e #10** movidos para `pulados` com o motivo.

Todas as fichas aprovadas já trazem a linha "Base: ... protocolo <código> (2016)", conferida; a 2ª edição é de 2016 (ficha catalográfica do PDF).
