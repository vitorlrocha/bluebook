# Revisão clínica — lista de trabalho

Gerado por `node ferramentas/revisao.js` a partir de `PENDENCIAS.md` e `INCONSISTENCIAS.md`. **Não edite à mão**: corrija o dado em `dados/*.json` **com fonte e ano** e rode `npm run relatorios` — o item some da lista sozinho.

**Regra:** nada aqui foi decidido nem alterado. A ferramenta só aponta onde olhar; quem decide o valor certo é a revisão humana com a fonte em mãos. Diferença entre textos pode ser legítima (indicação, via, idade): nesse caso, deixe as duas doses e escreva a indicação de cada uma.

| Prioridade | Itens |
|---|---:|
| Prioridade 1 — pode mostrar dose errada (revisar primeiro) | 9 |
| Prioridade 2 — faixas divergentes e doses a confirmar | 40 |
| Prioridade 3 — completar informação (sem risco de dose) | 32 |
| **Total** | **81** |

Informativo: 16 fichas de associação ficaram sem calculadora pediátrica por decisão de projeto (ver INCONSISTENCIAS.md §3).

## Prioridade 1 — pode mostrar dose errada (revisar primeiro)

### Ficha × calculadora pediátrica (sem sobreposição) (2)

Conferir em: bula no Bulário Eletrônico da Anvisa (seção Posologia, uso pediátrico) e SBP quando houver.
Arquivo: `dados/seed_meds.json (campo pediatria) e dados/ped_db.json`

| Feito | Onde | O que conferir |
|:---:|---|---|
| ☐ | Captopril | Ficha (Pediatria): 0,01-0,05 mg/kg/dose · Calculadora: VO 0,3-0,5 mg/kg/dose |
| ☐ | Secnidazol | Ficha (Pediatria): 7,5 mg/kg/dose · Calculadora: VO 30 mg/kg/dose |

### Plantão × calculadora pediátrica (3)

Conferir em: diretriz citada no protocolo (campo "fonte" do protocolo) e bula Anvisa do fármaco.
Arquivo: `dados/plantao.json e dados/ped_db.json`

| Feito | Onde | O que conferir |
|:---:|---|---|
| ☐ | Crise convulsiva / estado de mal epiléptico — Diazepam (Retal) | Plantão: máx. 20 mg · Calculadora: Retal máx. 10 mg (máximo diferente) |
| ☐ | Crise de asma grave — Prednisolona/prednisona (VO) | Plantão: máx. 40 mg · Calculadora: VO máx. 60 mg (máximo diferente) |
| ☐ | Sepse e choque séptico — Hidrocortisona (choque refratário a catecolaminas) (EV) | Plantão: 2 mg/kg/dose · máx. 100 mg · Calculadora: EV/IM 4-8 mg/kg/dose · máx. 250 mg (dose fora da faixa) |

### Calculadora pediátrica: texto × número usado no cálculo (4)

Conferir em: SBP (documento científico/guia prático do tema) ou bula Anvisa; conferir também o texto "ob" e "rev" da própria entrada.
Arquivo: `dados/ped_db.json`

| Feito | Onde | O que conferir |
|:---:|---|---|
| ☐ | Dexametasona (IM/EV) | máx. por dose — texto: "máx. 10 mg/dose" · campo mx: 16 mg |
| ☐ | Carbamazepina (VO) | máx. diário — texto: "máx. 1.000 mg/dia" · campo mxd: 1200 mg |
| ☐ | Hidroclorotiazida (VO) | máx. diário — texto: "máx. 37,5 mg/dia" · campo mxd: 100 mg |
| ☐ | Hidroxizina (VO) | máx. diário — texto: "máx. 50 mg/dia" · campo mxd: 100 mg |

## Prioridade 2 — faixas divergentes e doses a confirmar

### Ficha × calculadora pediátrica (faixas diferentes) (7)

Conferir em: bula no Bulário Eletrônico da Anvisa (seção Posologia, uso pediátrico) e SBP quando houver.
Arquivo: `dados/seed_meds.json (campo pediatria) e dados/ped_db.json`

| Feito | Onde | O que conferir |
|:---:|---|---|
| ☐ | Dipirona sódica (Metamizol) | faixa da ficha sai da faixa da calculadora — Ficha: 10-25 mg/kg/dose · Calculadora: VO 10-12 mg/kg/dose; IM/EV 15-25 mg/kg/dose |
| ☐ | Domperidona | faixa da ficha sai da faixa da calculadora — Ficha: 0,25-0,5 mg/kg/dose · Calculadora: VO 0,25 mg/kg/dose |
| ☐ | Hidrocortisona (injetável) | faixa da ficha sai da faixa da calculadora — Ficha: 2-4 mg/kg/dose · Calculadora: EV/IM 4-8 mg/kg/dose |
| ☐ | Cetoprofeno | faixa da ficha sai da faixa da calculadora — Ficha: 1-2 mg/kg/dose · Calculadora: VO 1 mg/kg/dose; IM/EV 1 mg/kg/dose |
| ☐ | Cefuroxima | faixa da ficha sai da faixa da calculadora — Ficha: 30 mg/kg/dia; 75-150 mg/kg/dia · Calculadora: VO 20-30 mg/kg/dia |
| ☐ | Ampicilina | faixa da ficha sai da faixa da calculadora — Ficha: 100-200 mg/kg/dia; 300-400 mg/kg/dia · Calculadora: EV 50-200 mg/kg/dia |
| ☐ | Gentamicina | faixa da ficha sai da faixa da calculadora — Ficha: 4-5 mg/kg/dia; 5-7,5 mg/kg/dia · Calculadora: EV/IM 5-7,5 mg/kg/dia |

### Prescrição de doença pediátrica × calculadora (8)

Conferir em: diretriz citada na linha "Base:" da própria doença; SBP/Ministério da Saúde (PCDT) para a dose pediátrica.
Arquivo: `dados/diseases.json (campo prescricao) e dados/ped_db.json`

| Feito | Onde | O que conferir |
|:---:|---|---|
| ☐ | Meningite bacteriana na infância — Ampicilina | Prescrição: "ampicilina 300 mg/kg/dia EV" · Calculadora: EV 50-200 mg/kg/dia |
| ☐ | Infecção do trato urinário na infância — Cefalexina | Prescrição: "cefalexina 10 mg/kg/dia." · Calculadora: VO 25-100 mg/kg/dia |
| ☐ | Infecção do trato urinário na infância — Nitrofurantoína | Prescrição: "nitrofurantoína 1-2 mg/kg/dia" · Calculadora: VO 5-7 mg/kg/dia |
| ☐ | Febre sem sinais de localização (lactente) — Ampicilina | Prescrição: "ampicilina 300 mg/kg/dia 6/6 h" · Calculadora: EV 50-200 mg/kg/dia |
| ☐ | Meningite neonatal — Ampicilina | Prescrição: "Ampicilina 300 mg/kg/dia" · Calculadora: EV 50-200 mg/kg/dia |
| ☐ | Refluxo vesicoureteral — Cefalexina | Prescrição: "Cefalexina 10 mg/kg/dia à noite" · Calculadora: VO 25-100 mg/kg/dia |
| ☐ | Endocardite em cardiopatia congênita — Ampicilina | Prescrição: "Ampicilina 300 mg/kg/dia" · Calculadora: EV 50-200 mg/kg/dia |
| ☐ | Hidronefrose antenatal — Amoxicilina | Prescrição: "Amoxicilina 10 mg/kg/dia profilática em casos selecionados." · Calculadora: VO 25-90 mg/kg/dia |

### PENDENTE DE VERIFICAÇÃO em dose/conduta (25)

Conferir em: bula Anvisa (Bulário Eletrônico) e lista CMED vigente; PCDT/Conitec se for medicamento de alto custo.
Arquivo: `dados/seed_meds.json`

| Feito | Onde | O que conferir |
|:---:|---|---|
| ☐ | Pacritinibe — Posologia | 200 mg VO 2x/dia (conforme bula). PENDENTE DE VERIFICAÇÃO do esquema vigente no Brasil. |
| ☐ | Momelotinibe — Posologia | 200 mg VO 1x/dia (conforme bula). PENDENTE DE VERIFICAÇÃO do esquema vigente no Brasil. |
| ☐ | Inluntestrante — Posologia | 400 mg VO 1x/dia (conforme bula). PENDENTE DE VERIFICAÇÃO do esquema vigente no Brasil. |
| ☐ | Tiotepa — Posologia | Dose conforme protocolo de condicionamento ou de tratamento (ex.: 5 mg/kg/dia EV em alguns esquemas de TCTH). PENDENTE DE VERIFICAÇÃO — individualizar pelo protocolo institucional. |
| ☐ | Remimazolam — Posologia | …dose inicial EV titulada (ex.: 5 mg em 1 min em adultos, doses suplementares de 2,5 mg conforme resposta). Reduzir em idosos e ASA III-IV. PENDENTE DE VERIFICAÇÃO — seguir a bula vigente. |
| ☐ | Odevixibate — Posologia | 40 mcg/kg VO 1x/dia pela manhã (conforme bula). PENDENTE DE VERIFICAÇÃO do esquema vigente. |
| ☐ | Maralixibate — Posologia | Dose por peso (microgramas/kg), com titulação — PENDENTE DE VERIFICAÇÃO conforme bula vigente. |
| ☐ | Inotersena — Posologia | 284 mg SC 1x/semana (após dose de ataque conforme bula). PENDENTE DE VERIFICAÇÃO do esquema vigente. |
| ☐ | Danicopana — Posologia | Dose fixa VO 3x/dia (conforme bula). PENDENTE DE VERIFICAÇÃO do esquema vigente. |
| ☐ | Fitusirana — Posologia | Esquema SC periódico fixo (ex.: a cada 2 meses) conforme bula. PENDENTE DE VERIFICAÇÃO do esquema vigente. |
| ☐ | Benzoilmetronidazol — Posologia | …uivalente ao metronidazol: crianças 30-40 mg/kg/dia (como benzoilmetronidazol) VO divididos em 2-3 tomas por 5-7 dias; ver bula do produto. PENDENTE DE VERIFICAÇÃO do equivalente por mL. |
| ☐ | Deslanosídeo (lanatosídeo C) — Posologia | Digitalização rápida: 0,8-1,2 mg EV em doses fracionadas; manutenção 0,2-0,4 mg/dia. PENDENTE DE VERIFICAÇÃO — individualizar por função renal e uso prévio de digital. |
| ☐ | Glofitamabe — Posologia | PENDENTE DE VERIFICAÇÃO — esquema de pré-tratamento (obinutuzumabe), escalonamento de dose e pré-medicação conforme bula na… |
| ☐ | Síndrome de Wilkie (compressão duodenal pela artéria mesentérica superior) — Prescrição | …dial em decúbito lateral esquerdo. 2) Nutrição enteral por sonda pós-pilórica. Base: revisões em cirurgia digestiva; CBC; consenso clínico (PENDENTE DE VERIFICAÇÃO de diretriz formal). |
| ☐ | Síndrome de Peutz-Jeghers — Prescrição | 1) Polipectomia endoscópica periódica. 2) Rastreio de neoplasias associadas. Base: NCCN; ESGE/ACG; consenso brasileiro (PENDENTE DE VERIFICAÇÃO do ano). |
| ☐ | Síndrome de Cronkhite-Canada — Prescrição | 1) Prednisona 0,5-1 mg/kg/dia com desmame lento. 2) Suporte nutricional e correção eletrolítica. Base: relatos e séries de casos (PENDENTE DE VERIFICAÇÃO). |
| ☐ | Síndrome de Crigler-Najjar — Prescrição | 1) Fototerapia 10-12 h/dia (tipo I). 2) Fenobarbital 3-5 mg/kg/dia (tipo II). Base: EASL; sociedades de pediatria (PENDENTE DE VERIFICAÇÃO). |
| ☐ | Síndrome de Cogan — Prescrição | 1) Prednisona 1 mg/kg/dia, com desmame. Base: ACR; revisões (PENDENTE DE VERIFICAÇÃO). |
| ☐ | Síndrome de Liddle — Prescrição | 1) Amilorida 5-10 mg/dia. Base: Endocrine Society; SBN (PENDENTE DE VERIFICAÇÃO). |
| ☐ | Síndrome de Usher — Prescrição | Sem medicação específica. Base: revisões; SBO (PENDENTE DE VERIFICAÇÃO). |
| ☐ | Síndrome de Eagle (estiloide alongado) — Prescrição | 1) Paracetamol ou AINE. 2) Estiloidectomia (intra-oral ou externa). Base: revisões em otorrinolaringologia (PENDENTE DE VERIFICAÇÃO). |
| ☐ | Síndrome de Costen (disfunção temporomandibular com sintomas otológicos) — Prescrição | 1) AINE por curto período. 2) Placa oclusal noturna. Base: revisões; consenso odontológico (PENDENTE DE VERIFICAÇÃO). |
| ☐ | Doença de Hailey-Hailey (pênfigo benigno familiar) — Prescrição | 1) Betametasona creme 0,05% 2x/dia por curto período. 2) Doxiciclina 100 mg 12/12h por ciclos. Base: revisões em dermatologia; SBD (PENDENTE DE VERIFICAÇÃO do consenso). |
| ☐ | Doença de Darier (disceratose folicular) — Prescrição | 1) Emoliente e filtro solar. 2) Acitretina 0,25-0,5 mg/kg/dia. Base: revisões em dermatologia; SBD (PENDENTE DE VERIFICAÇÃO). |
| ☐ | Melioidose — Prescrição | …V 8/8h. 2) Sulfametoxazol-trimetoprima 160/800 mg 12/12h por 3-6 meses. Base: Guidelines internacionais de melioidose; Ministério da Saúde (PENDENTE DE VERIFICAÇÃO). |

## Prioridade 3 — completar informação (sem risco de dose)

### PENDENTE DE VERIFICAÇÃO em apresentação/nome comercial/outros (14)

Conferir em: bula Anvisa (Bulário Eletrônico) e lista CMED vigente; PCDT/Conitec se for medicamento de alto custo.
Arquivo: `dados/seed_meds.json`

| Feito | Onde | O que conferir |
|:---:|---|---|
| ☐ | Tiotepa — Apresentações | PENDENTE DE VERIFICAÇÃO (consulte a bula) |
| ☐ | Trabectedina — Apresentações | PENDENTE DE VERIFICAÇÃO (consulte a bula) |
| ☐ | Fezolinetante — Nomes comerciais | PENDENTE DE VERIFICAÇÃO (sem registro na lista CMED 10/2026) |
| ☐ | Fezolinetante — Apresentações | PENDENTE DE VERIFICAÇÃO (consulte a bula) |
| ☐ | Estavudina — Apresentações | PENDENTE DE VERIFICAÇÃO (consulte a bula) |
| ☐ | Benzoilmetronidazol — Apresentações | PENDENTE DE VERIFICAÇÃO (consulte a bula) |
| ☐ | Metildigoxina — Nomes comerciais | PENDENTE DE VERIFICAÇÃO (sem registro na lista CMED 10/2026) |
| ☐ | Metildigoxina — Apresentações | PENDENTE DE VERIFICAÇÃO (consulte a bula) |
| ☐ | Somatostatina — Apresentações | PENDENTE DE VERIFICAÇÃO (consulte a bula) |
| ☐ | Fruquintinibe — Nomes comerciais | PENDENTE DE VERIFICAÇÃO (sem registro na lista CMED 10/2026) |
| ☐ | Fruquintinibe — Apresentações | PENDENTE DE VERIFICAÇÃO (consulte a bula) |
| ☐ | Glofitamabe — Contraindicações | PENDENTE DE VERIFICAÇÃO — consultar a bula. |
| ☐ | Glofitamabe — Gestação | PENDENTE DE VERIFICAÇÃO — risco embriofetal esperado; contracepção durante o tratamento (ver bula). |
| ☐ | Glofitamabe — Lactação | PENDENTE DE VERIFICAÇÃO — consultar a bula. |

### Prescrição sem a linha "Base:" (referência) (16)

Conferir em: a diretriz que embasou a prescrição (sociedade/ano).
Arquivo: `dados/diseases.json (campo prescricao)`

| Feito | Onde | O que conferir |
|:---:|---|---|
| ☐ | Desnutrição grave (SAM) (Pediatria) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Apendicite aguda (Cirurgia Geral) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Colecistite aguda (Cirurgia Geral) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Obstrução intestinal (Cirurgia Geral) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Hérnia inguinal encarcerada (Cirurgia Geral) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Abdome agudo perfurativo (Cirurgia Geral) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Pancreatite aguda (Cirurgia Geral) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Diverticulite aguda (Cirurgia Geral) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Pré-eclâmpsia/eclâmpsia (Ginecologia e Obstetrícia) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Gravidez ectópica (Ginecologia e Obstetrícia) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Hemorragia pós-parto (Ginecologia e Obstetrícia) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Descolamento prematuro de placenta (Ginecologia e Obstetrícia) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Mola hidatiforme (Ginecologia e Obstetrícia) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Politrauma (avaliação inicial) (Urgência e Emergência) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Conjuntivite aguda (Pediatria) | Acrescentar a linha "Base: ..." com a diretriz usada |
| ☐ | Impetigo (Pediatria) | Acrescentar a linha "Base: ..." com a diretriz usada |

### Calculadora pediátrica sem ficha de medicamento (2)

Conferir em: decidir: criar a ficha (com fonte) ou manter só como protocolo de referência.
Arquivo: `dados/ped_db.json e dados/seed_meds.json`

| Feito | Onde | O que conferir |
|:---:|---|---|
| ☐ | Dimenidrato | Existe na calculadora, mas não há ficha com esse nome |
| ☐ | Pirvínio | Existe na calculadora, mas não há ficha com esse nome |
