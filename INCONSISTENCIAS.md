# Inconsistências entre módulos

Gerado por `node ferramentas/inconsistencias.js` a partir de `dados/*.json`. **Não edite à mão.**

**Nada foi alterado automaticamente.** Cada linha é um ponto *a revisar* com fonte (SBP, MS/PCDT, bula Anvisa). Diferença de texto não prova erro: indicação, via, faixa etária ou dose de ataque podem justificar. A comparação é mecânica (números em mg/kg, mg/dia e mg/dose lidos do texto) e pode deixar passar casos escritos de outro jeito.

| Verificação | Itens |
|---|---:|
| 1. Calculadora pediátrica: texto × números da mesma ficha | 4 |
| 2. Ficha do medicamento (Pediatria) × calculadora pediátrica | 9 |
| 3. Associações sem calculadora pediátrica (informativo) | 16 |
| 4. Plantão × calculadora pediátrica | 3 |
| 5. Prescrição das doenças pediátricas × calculadora pediátrica | 8 |
| 6. Prescrições sem linha "Base:" | 16 |
| 7. Detalhes (MEDX) sem ficha de mesmo nome | 0 |
| 8. Calculadora pediátrica sem ficha correspondente | 2 |

## 1. Calculadora pediátrica: texto × números da mesma ficha

O texto de observação (`ob`) cita um máximo diferente do campo numérico usado no cálculo (`mx`/`mxd`), ou a dose padrão está fora da faixa.

| Fármaco | Via | O quê | Texto | Campo |
|---|---|---|---|---|
| Dexametasona | IM/EV | máx. por dose | texto: "máx. 10 mg/dose" | campo mx: 16 mg |
| Carbamazepina | VO | máx. diário | texto: "máx. 1.000 mg/dia" | campo mxd: 1200 mg |
| Hidroclorotiazida | VO | máx. diário | texto: "máx. 37,5 mg/dia" | campo mxd: 100 mg |
| Hidroxizina | VO | máx. diário | texto: "máx. 50 mg/dia" | campo mxd: 100 mg |

## 2. Ficha do medicamento (Pediatria) × calculadora pediátrica

Faixa em mg/kg (mesma base: por dose ou por dia) ou máximo diário diferentes. "alta" = nenhuma faixa se sobrepõe.

| Medicamento | Divergência | Ficha (campo Pediatria) | Calculadora (PED_DB) | Prioridade |
|---|---|---|---|---|
| Captopril | faixas sem sobreposição | 0,01-0,05 mg/kg/dose | VO 0,3-0,5 mg/kg/dose | alta |
| Secnidazol | faixas sem sobreposição | 7,5 mg/kg/dose | VO 30 mg/kg/dose | alta |
| Ampicilina | faixa da ficha sai da faixa da calculadora | 100-200 mg/kg/dia; 300-400 mg/kg/dia | EV 50-200 mg/kg/dia | média |
| Cefuroxima | faixa da ficha sai da faixa da calculadora | 30 mg/kg/dia; 75-150 mg/kg/dia | VO 20-30 mg/kg/dia | média |
| Cetoprofeno | faixa da ficha sai da faixa da calculadora | 1-2 mg/kg/dose | VO 1 mg/kg/dose; IM/EV 1 mg/kg/dose | média |
| Dipirona sódica (Metamizol) | faixa da ficha sai da faixa da calculadora | 10-25 mg/kg/dose | VO 10-12 mg/kg/dose; IM/EV 15-25 mg/kg/dose | média |
| Domperidona | faixa da ficha sai da faixa da calculadora | 0,25-0,5 mg/kg/dose | VO 0,25 mg/kg/dose | média |
| Gentamicina | faixa da ficha sai da faixa da calculadora | 4-5 mg/kg/dia; 5-7,5 mg/kg/dia | EV/IM 5-7,5 mg/kg/dia | média |
| Hidrocortisona (injetável) | faixa da ficha sai da faixa da calculadora | 2-4 mg/kg/dose | EV/IM 4-8 mg/kg/dose | média |

## 3. Associações sem calculadora pediátrica (informativo)

Desde a v72 (Etapa 3) uma ficha de associação ("A + B") não usa mais os parâmetros do fármaco isolado A — antes, por exemplo, o colírio de dexametasona mostrava a dose sistêmica. Estas fichas ficam sem o quadro "Dose pediátrica por peso" até que alguém cadastre, com fonte, uma entrada própria da associação no PED_DB.

| Ficha (associação) | Parâmetros que usava até a v71 |
|---|---|
| Ampicilina + Sulbactam | Ampicilina |
| Lidocaína + Prilocaína | Lidocaína (uso local) |
| Captopril + Hidroclorotiazida | Captopril |
| Hidroclorotiazida + Espironolactona | Hidroclorotiazida |
| Meropenem + Vaborbactam | Meropenem |
| Tramadol + Paracetamol | Tramadol |
| Tramadol + Dexcetoprofeno | Tramadol |
| Dexametasona + Neomicina + Polimixina B (colírio) | Dexametasona |
| Nistatina + Óxido de zinco | Nistatina (suspensão oral) |
| Gentamicina + Betametasona | Gentamicina |
| Hidrocortisona + Neomicina + Bacitracina | Hidrocortisona (injetável) |
| Dipirona + Cafeína + Isometepteno | Dipirona sódica (Metamizol) |
| Paracetamol + Cafeína + Carisoprodol | Paracetamol |
| Paracetamol + Clorfeniramina + Fenilefrina | Paracetamol |
| Dexclorfeniramina + Betametasona | Dexclorfeniramina |
| Loratadina + Pseudoefedrina | Loratadina |

## 4. Plantão × calculadora pediátrica

Dose por kg do protocolo fora da faixa da calculadora, ou máximo por dose diferente, para a mesma substância.

| Protocolo | Item | Plantão | Calculadora (PED_DB) | Divergência |
|---|---|---|---|---|
| Crise convulsiva / estado de mal epiléptico | Diazepam (Retal) | máx. 20 mg | Retal máx. 10 mg | máximo diferente |
| Crise de asma grave | Prednisolona/prednisona (VO) | máx. 40 mg | VO máx. 60 mg | máximo diferente |
| Sepse e choque séptico | Hidrocortisona (choque refratário a catecolaminas) (EV) | 2 mg/kg/dose · máx. 100 mg | EV/IM 4-8 mg/kg/dose · máx. 250 mg | dose fora da faixa |

## 5. Prescrição das doenças pediátricas × calculadora pediátrica

Doenças da área Pediatria: dose em mg/kg citada logo após o nome do fármaco, sem sobreposição com a faixa da calculadora (mesma base: por dose ou por dia). Pode ser indicação específica (profilaxia, meningite, neonato): conferir se a calculadora deveria cobrir essa faixa ou se o texto deve citar a indicação.

| Doença | Fármaco | Trecho da prescrição | Calculadora (PED_DB) |
|---|---|---|---|
| Meningite bacteriana na infância | Ampicilina | ampicilina 300 mg/kg/dia EV | EV 50-200 mg/kg/dia |
| Infecção do trato urinário na infância | Cefalexina | cefalexina 10 mg/kg/dia. | VO 25-100 mg/kg/dia |
| Infecção do trato urinário na infância | Nitrofurantoína | nitrofurantoína 1-2 mg/kg/dia | VO 5-7 mg/kg/dia |
| Febre sem sinais de localização (lactente) | Ampicilina | ampicilina 300 mg/kg/dia 6/6 h | EV 50-200 mg/kg/dia |
| Meningite neonatal | Ampicilina | Ampicilina 300 mg/kg/dia | EV 50-200 mg/kg/dia |
| Refluxo vesicoureteral | Cefalexina | Cefalexina 10 mg/kg/dia à noite | VO 25-100 mg/kg/dia |
| Endocardite em cardiopatia congênita | Ampicilina | Ampicilina 300 mg/kg/dia | EV 50-200 mg/kg/dia |
| Hidronefrose antenatal | Amoxicilina | Amoxicilina 10 mg/kg/dia profilática em casos selecionados. | VO 25-90 mg/kg/dia |

## 6. Prescrições sem linha "Base:"

Regra do projeto (CLAUDE.md): toda prescrição deve ter a linha "Base: ..." com a referência.

| Doença | Área |
|---|---|
| Desnutrição grave (SAM) | Pediatria |
| Apendicite aguda | Cirurgia Geral |
| Colecistite aguda | Cirurgia Geral |
| Obstrução intestinal | Cirurgia Geral |
| Hérnia inguinal encarcerada | Cirurgia Geral |
| Abdome agudo perfurativo | Cirurgia Geral |
| Pancreatite aguda | Cirurgia Geral |
| Diverticulite aguda | Cirurgia Geral |
| Pré-eclâmpsia/eclâmpsia | Ginecologia e Obstetrícia |
| Gravidez ectópica | Ginecologia e Obstetrícia |
| Hemorragia pós-parto | Ginecologia e Obstetrícia |
| Descolamento prematuro de placenta | Ginecologia e Obstetrícia |
| Mola hidatiforme | Ginecologia e Obstetrícia |
| Politrauma (avaliação inicial) | Urgência e Emergência |
| Conjuntivite aguda | Pediatria |
| Impetigo | Pediatria |

## 7. Detalhes (MEDX) sem ficha de mesmo nome

Mecanismo/ajuste renal/efeitos de um nome que não existe exatamente na lista de medicamentos (não aparece na ficha).

_Nenhuma._

## 8. Calculadora pediátrica sem ficha correspondente

Entrada do PED_DB que nenhuma ficha usa (aparece só em "Protocolos de referência fora da sua base").

| Fármaco | Chave |
|---|---|
| Dimenidrato | dimenidrato |
| Pirvínio | pirvinio |
