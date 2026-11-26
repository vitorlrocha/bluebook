# Inconsistências entre módulos

Gerado por `node ferramentas/inconsistencias.js` a partir de `dados/*.json`. **Não edite à mão.**

**Nada foi alterado automaticamente.** Cada linha é um ponto *a revisar* com fonte (SBP, MS/PCDT, bula Anvisa). Diferença de texto não prova erro: indicação, via, faixa etária ou dose de ataque podem justificar. A comparação é mecânica (números em mg/kg, mg/dia e mg/dose lidos do texto) e pode deixar passar casos escritos de outro jeito.

| Verificação | Itens |
|---|---:|
| 1. Calculadora pediátrica: texto × números da mesma ficha | 0 |
| 2. Ficha do medicamento (Pediatria) × calculadora pediátrica | 11 |
| 3. Associações sem calculadora pediátrica (informativo) | 34 |
| 4. Plantão × calculadora pediátrica | 5 |
| 5. Prescrição das doenças pediátricas × calculadora pediátrica | 5 |
| 6. Prescrições sem linha "Base:" | 16 |
| 7. Detalhes (MEDX) sem ficha de mesmo nome | 0 |
| 8. Calculadora pediátrica sem ficha correspondente | 2 |

## 1. Calculadora pediátrica: texto × números da mesma ficha

O texto de observação (`ob`) cita um máximo diferente do campo numérico usado no cálculo (`mx`/`mxd`), ou a dose padrão está fora da faixa.

_Nenhuma._

## 2. Ficha do medicamento (Pediatria) × calculadora pediátrica

Faixa em mg/kg (mesma base: por dose ou por dia) ou máximo diário diferentes. "alta" = nenhuma faixa se sobrepõe.

| Medicamento | Divergência | Ficha (campo Pediatria) | Calculadora (PED_DB) | Prioridade |
|---|---|---|---|---|
| Captopril | faixas sem sobreposição | 0,01-0,05 mg/kg/dose | VO 0,3-0,5 mg/kg/dose | alta |
| Metilprednisolona (succinato) | faixas sem sobreposição | 15-30 mg/kg/dia | EV/IM (asma grave, NHLBI) 1-2 mg/kg/dia | alta |
| Benznidazol | faixa da ficha sai da faixa da calculadora | 5-8 mg/kg/dia; 5-10 mg/kg/dia | VO (Chagas, 2 a 12 anos) 5-8 mg/kg/dia | média |
| Cefuroxima | faixa da ficha sai da faixa da calculadora | 30 mg/kg/dia; 75-150 mg/kg/dia | VO 20-30 mg/kg/dia; EV/IM (> 3 meses) 50-100 mg/kg/dia | média |
| Dipirona sódica (Metamizol) | faixa da ficha sai da faixa da calculadora | 10-25 mg/kg/dose | VO 10-12 mg/kg/dose; IM/EV 15-25 mg/kg/dose | média |
| Gentamicina | faixa da ficha sai da faixa da calculadora | 4-5 mg/kg/dia; 5-7,5 mg/kg/dia | EV/IM 5-7,5 mg/kg/dia | média |
| Hidrocortisona (injetável) | faixa da ficha sai da faixa da calculadora | 2-4 mg/kg/dose | EV/IM 4-8 mg/kg/dose | média |
| Levofloxacino | faixa da ficha sai da faixa da calculadora | 5-10 mg/kg/dose | VO/EV (antraz inalatório pós-exposição ou peste, ≥ 6 meses) 8 mg/kg/dose | média |
| Metimazol (Tiamazol) | faixa da ficha sai da faixa da calculadora | 0,2-0,5 mg/kg/dia | VO (hipertireoidismo, criança — início) 0,4 mg/kg/dia | média |
| Naproxeno | faixa da ficha sai da faixa da calculadora | 10-15 mg/kg/dia | VO (artrite idiopática juvenil, > 2 anos) 10 mg/kg/dia | média |
| Oxcarbazepina | faixa da ficha sai da faixa da calculadora | 8-10 mg/kg/dia; 60 mg/kg/dia | VO (adjuvante, 2 a 16 anos) 8-10 mg/kg/dia | média |

## 3. Associações sem calculadora pediátrica (informativo)

Desde a v72 (Etapa 3) uma ficha de associação ("A + B") não usa mais os parâmetros do fármaco isolado A — antes, por exemplo, o colírio de dexametasona mostrava a dose sistêmica. Estas fichas ficam sem o quadro "Dose pediátrica por peso" até que alguém cadastre, com fonte, uma entrada própria da associação no PED_DB.

| Ficha (associação) | Parâmetros que usava até a v71 |
|---|---|
| Ampicilina + Sulbactam | Ampicilina |
| Sinvastatina + Ezetimiba | Sinvastatina |
| Lidocaína + Prilocaína | Lidocaína (uso local) |
| Abacavir + lamivudina | Abacavir |
| Sofosbuvir + velpatasvir | Sofosbuvir |
| Anlodipino + Valsartana | Anlodipino besilato |
| Anlodipino + Losartana | Anlodipino besilato |
| Anlodipino + Atenolol | Anlodipino besilato |
| Losartana + Hidroclorotiazida | Losartana potássica |
| Valsartana + Hidroclorotiazida | Valsartana |
| Enalapril + Hidroclorotiazida | Enalapril maleato |
| Captopril + Hidroclorotiazida | Captopril |
| Hidroclorotiazida + Espironolactona | Hidroclorotiazida |
| Rosuvastatina + Ezetimiba | Rosuvastatina |
| Atorvastatina + Ezetimiba | Atorvastatina |
| Atorvastatina + Anlodipino | Atorvastatina |
| Ceftazidima + Avibactam | Ceftazidima |
| Meropenem + Vaborbactam | Meropenem |
| Abacavir + Lamivudina + Dolutegravir | Abacavir |
| Zidovudina + Lamivudina | Zidovudina (AZT) |
| Efavirenz + Tenofovir + Lamivudina | Efavirenz |
| Tramadol + Paracetamol | Tramadol |
| Tramadol + Dexcetoprofeno | Tramadol |
| Nistatina + Óxido de zinco | Nistatina (suspensão oral) |
| Gentamicina + Betametasona | Gentamicina |
| Hidrocortisona + Neomicina + Bacitracina | Hidrocortisona (injetável) |
| Aztreonam + Avibactam | Aztreonam |
| Sofosbuvir + Velpatasvir + Voxilaprevir | Sofosbuvir |
| Dipirona + Cafeína + Isometepteno | Dipirona sódica (Metamizol) |
| Paracetamol + Cafeína + Carisoprodol | Paracetamol |
| Paracetamol + Clorfeniramina + Fenilefrina | Paracetamol |
| Dexclorfeniramina + Betametasona | Dexclorfeniramina |
| Loratadina + Pseudoefedrina | Loratadina |
| Cetirizina + Pseudoefedrina | Cetirizina |

## 4. Plantão × calculadora pediátrica

Dose por kg do protocolo fora da faixa da calculadora, ou máximo por dose diferente, para a mesma substância.

| Protocolo | Item | Plantão | Calculadora (PED_DB) | Divergência |
|---|---|---|---|---|
| Bradicardia e taquiarritmias | Adenosina — 2ª dose (EV rápido + flush SF) | 0,2 mg/kg/dose · máx. 12 mg | EV (TSV, < 50 kg) 0,05-0,1 mg/kg/dose | dose fora da faixa |
| Crise convulsiva / estado de mal epiléptico | Midazolam (sem acesso venoso) (IM) | 0,2 mg/kg/dose · máx. 10 mg | IM (sedação, 1 a 15 anos) 0,05-0,15 mg/kg/dose · máx. 10 mg | dose fora da faixa |
| Sepse e choque séptico | Hidrocortisona (choque refratário a catecolaminas) (EV) | 2 mg/kg/dose · máx. 100 mg | EV/IM 4-8 mg/kg/dose · máx. 250 mg | dose fora da faixa |
| Intubação em sequência rápida | Rocurônio (EV) | 1 mg/kg/dose · máx. 100 mg | EV (intubação) 0,45-0,6 mg/kg/dose | dose fora da faixa |
| Intubação em sequência rápida | Succinilcolina (EV) | 1,5 mg/kg/dose · máx. 150 mg | EV (lactente e criança pequena) 2 mg/kg/dose; EV (criança maior e adolescente) 1 mg/kg/dose | dose fora da faixa |

## 5. Prescrição das doenças pediátricas × calculadora pediátrica

Doenças da área Pediatria: dose em mg/kg citada logo após o nome do fármaco, sem sobreposição com a faixa da calculadora (mesma base: por dose ou por dia). Pode ser indicação específica (profilaxia, meningite, neonato): conferir se a calculadora deveria cobrir essa faixa ou se o texto deve citar a indicação.

| Doença | Fármaco | Trecho da prescrição | Calculadora (PED_DB) |
|---|---|---|---|
| Infecção do trato urinário na infância | Cefalexina | cefalexina 10 mg/kg/dia. | VO 25-100 mg/kg/dia |
| Infecção do trato urinário na infância | Nitrofurantoína | nitrofurantoína 1-2 mg/kg/dia | VO 5-7 mg/kg/dia |
| Febre sem sinais de localização (lactente) | Cefotaxima | cefotaxima 200-300 mg/kg/dia 6/6 h | EV/IM (1 mês a 12 anos, < 50 kg) 50-180 mg/kg/dia |
| Refluxo vesicoureteral | Cefalexina | Cefalexina 10 mg/kg/dia à noite | VO 25-100 mg/kg/dia |
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
