# Propostas de correção — Prioridade 1 da revisão clínica

Pesquisa feita em 11/11/2026 para os 9 itens de Prioridade 1 do `REVISAO_CLINICA.md`.
**Nada foi alterado em `dados/`.** Cada proposta abaixo só será aplicada se você aprovar.

Como ler:
- **Hoje no app**: o que cada tela mostra.
- **Fontes**: o que eu realmente li (com link e ano). Quando só consegui um resumo de terceiros, está escrito.
- **Proposta**: a mudança exata, ou "manter", ou **PENDENTE DE VERIFICAÇÃO** quando a fonte oficial não foi lida ou as fontes divergem (nesses casos não proponho valor).
- **Confiança**: alta = li o documento oficial; média = oficial lido em parte ou via resumo; baixa = só fontes secundárias.

Resumo:

| # | Item | Proposta | Confiança |
|---|---|---|---|
| 1 | Captopril | Dose inicial: **PENDENTE**. Só acrescentar aviso de que a calculadora não vale para recém-nascido | média |
| 2 | Secnidazol | **Corrigir** o campo Pediatria da ficha (hoje fala de metronidazol) | alta |
| 3 | Diazepam retal | Teto 10 mg × 20 mg: **PENDENTE** (fontes divergem); as duas fontes citadas pelo app apontam 20 mg | média |
| 4 | Prednisolona na asma | **Manter** o Plantão (40 mg; bate com a GINA) e explicitar na calculadora que na asma o teto é 40 mg | média |
| 5 | Hidrocortisona no choque | **Manter as duas doses** (indicações diferentes); a dose do Plantão fica **PENDENTE** de fonte brasileira | média |
| 6 | Dexametasona IM/EV | Teto 10 mg × 16 mg: **PENDENTE** (a SBP não cita teto) | baixa |
| 7 | Carbamazepina | Não é erro (teto por idade). Proposta: **baixar o teto da calculadora para 1.000 mg/dia** e avisar que acima de 15 anos é 1.200 | alta |
| 8 | Hidroclorotiazida | Proposta: **teto de 37,5 mg/dia** na calculadora (SBP, hipertensão), explicando o teto de 100 mg do rótulo | alta |
| 9 | Hidroxizina | Não é erro (teto por idade). Proposta: **aviso "< 6 anos: máx. 50 mg/dia"** | alta |

---

## 1. Captopril

**Hoje no app**
- Ficha, Posologia: crianças 0,3-0,5 mg/kg/dose 2-3x/dia, titular (máx. 6 mg/kg/dia).
- Ficha, Pediatria: lactentes 0,3–2,5 mg/kg/dia em 3 doses; recém-nascido 0,01–0,05 mg/kg/dose.
- Calculadora: VO 0,3–0,5 mg/kg/dose a cada 8 h; máximo 6 mg/kg/dia. Não tem faixa para recém-nascido.

**Fontes**
- SBP, Manual de Orientação "Hipertensão arterial na infância e adolescência" (2019), Quadro 8, pág. 17-18 (li o PDF):
  captopril — neonatos: dose inicial impressa como "0.05mg/kg/dia", máxima 6 mg/kg/dia, de 1x/dia até 6/6 h;
  ≥ 1 mês: inicial impressa como "0,05mg/kg/dia", máxima 6 mg/kg/dia, 8/8 h.
  <https://www.sbp.com.br/fileadmin/user_upload/21635c-MO_-_Hipertensao_Arterial_Infanc_e_Adolesc.pdf>
- Rótulo FDA do captopril (DailyMed, rev. 2021/2023, li): **não traz dose pediátrica**; diz que segurança e eficácia em crianças não foram estabelecidas.
  <https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5b44ab6e-6cd9-4e12-b9be-d2e4d954acb5>
- Bula da Anvisa: **não consegui abrir** (o Bulário recusa acesso automático).

**Análise**
- O **máximo de 6 mg/kg/dia** do app bate com a SBP.
- A **dose inicial** não bate: a SBP imprime 0,05 mg/kg/dia (para as duas idades), o app usa 0,3–0,5 mg/kg/dose. O manual da SBP declara ser baseado na diretriz americana de 2017, que eu não li; a unidade impressa ("/dia") pode ser erro de digitação do manual — não tenho como afirmar.
- A diferença apontada pelo relatório (recém-nascido × calculadora) é de **população**: a calculadora simplesmente não cobre recém-nascido.

**Proposta**
- Dose inicial (ficha e calculadora): **PENDENTE DE VERIFICAÇÃO** — precisa da tabela original da diretriz AAP 2017 ou da bula. Não proponho valor.
- Mudança segura, sem mexer em dose: acrescentar na calculadora (`dados/ped_db.json`, Captopril, campo `al`):
  "Não usar esta calculadora para recém-nascidos: a dose inicial é muito menor (ver ficha). Titular com PA, potássio e creatinina."

**Confiança:** média (máximo confirmado na SBP; dose inicial não confirmada).

---

## 2. Secnidazol — campo Pediatria com texto de outro remédio

**Hoje no app**
- Ficha, Pediatria: "**Metronidazol** permitido em todas as idades (7,5 mg/kg/dose 8/8 h); neuropatia com uso prolongado. Evitar álcool." — fala de metronidazol, não de secnidazol.
- Ficha, Posologia: crianças 30 mg/kg em dose única (máx. 2 g).
- Calculadora: 30 mg/kg dose única, máx. 2 g; texto "amebíase: ≥ 3 anos".

**Fontes**
- SBP, Guia Prático de Atualização "Parasitoses intestinais: diagnóstico e tratamento" (nov/2020), Tabela 5, pág. 9 (li o PDF):
  giardíase — secnidazol 30 mg/kg, dose única; amebíase intestinal sintomática ou extraintestinal — secnidazol 2 g ou 30 mg/kg, dose única.
  <https://www.sbp.com.br/fileadmin/user_upload/22207d-GPA_-_Parasitoses_intestinais_-_diagnostico_e_tratamento.pdf>
- Bulas de secnidazol reproduzidas por terceiros (EMS, Secnizol): 30 mg/kg em dose única, máximo 2 g. Não li a bula no site da Anvisa.

**Achado extra:** na tabela da SBP, a idade "≥ 3 anos" aparece na linha do **tinidazol**, não na do secnidazol. O texto da calculadora ("amebíase: ≥ 3 anos") pode ter herdado a idade do remédio vizinho.

**Proposta**
- `dados/seed_meds.json`, Secnidazol, campo `pediatria` — trocar por:
  "Crianças: 30 mg/kg em dose única (máx. 2 g) na giardíase e na amebíase intestinal (SBP, Guia Prático de Atualização — Parasitoses intestinais, 2020). Evitar álcool durante o tratamento."
- Idade mínima do secnidazol (ficha e calculadora): **PENDENTE DE VERIFICAÇÃO** na bula da Anvisa. Não proponho valor; sugiro só conferir o "≥ 3 anos" da calculadora.

**Confiança:** alta para a dose (SBP lida); idade mínima pendente.

---

## 3. Diazepam retal — teto de 10 mg ou 20 mg

**Hoje no app**
- Plantão (crise convulsiva; fonte citada: AES 2016, ESETT 2019, SBP): retal 0,5 mg/kg, **máx. 20 mg**.
- Calculadora (fonte citada: rótulo FDA): retal 0,3–0,5 mg/kg, **máx. 10 mg**; 0,5 mg/kg (2-5 anos), 0,3 (6-11), 0,2 (≥ 12).

**Fontes**
- Diretriz da American Epilepsy Society (Glauser et al., Epilepsy Currents 2016;16(1):48-61) — li o texto: cita estudo pré-hospitalar com diazepam retal 0,3 a 0,5 mg/kg, dose máxima 20 mg. O algoritmo (Figura 1) é uma imagem que não consegui ler; resumos de terceiros o reproduzem como 0,2–0,5 mg/kg, máx. 20 mg, dose única.
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC4749120/>
- Rótulo FDA do gel retal de diazepam (Diastat, 2024) — li: 0,5 mg/kg (2 a 5 anos), 0,3 mg/kg (6 a 11), 0,2 mg/kg (12 ou mais); fornecido em doses unitárias de 2,5 até 20 mg. Não encontrei frase de "dose máxima".
  <https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/020648s024lbl.pdf>
- Guia da MSF (não é fonte preferencial do projeto; visto só no resumo da busca): via retal 0,5 mg/kg, **máx. 10 mg**, para 1 mês a 11 anos.
- SBP: não encontrei documento com a dose retal.

**Análise:** as duas fontes que o próprio app cita (AES e rótulo FDA) trabalham com até 20 mg; o teto de 10 mg existe em outra fonte (MSF). As doses por idade da calculadora batem com o rótulo.

**Proposta:** **PENDENTE DE VERIFICAÇÃO** — as fontes divergem no teto, então a escolha é sua:
- Opção A: calculadora passa a 20 mg (igual ao Plantão, à AES e às seringas do rótulo).
- Opção B: Plantão passa a 10 mg (mais conservador, igual à MSF).

**Confiança:** média.

---

## 4. Prednisolona/prednisona na asma grave — 40 mg ou 60 mg

**Hoje no app**
- Plantão (fonte citada: GINA 2024, SBP, SBPT): 1 mg/kg, **máx. 40 mg**; texto "1-2 mg/kg/dia por 3-5 dias (máx. 40 mg; < 2 anos máx. 20 mg)".
- Calculadora: prednisona e prednisolona 1–2 mg/kg, **máx. 60 mg**; texto "máx. 40-60 mg/dia".

**Fontes**
- GINA, Summary Guide 2024 (trecho lido pela busca no site ginasthma.org; o PDF é protegido e não extraí o texto): crianças — prednisolona 1–2 mg/kg/dia, até 40 mg, por 3–5 dias.
  <https://ginasthma.org/wp-content/uploads/2024/12/GINA-Summary-Guide-2024-WEB-WMS.pdf>
- Relatório completo da GINA 2024, citado por resumo de terceiros (não li o original): máx. 20 mg/dia (< 2 anos), 30 mg/dia (2–5 anos), 40 mg/dia (6–11 anos).

**Análise:** o Plantão está de acordo com a GINA. O teto de 60 mg da calculadora vem de fontes americanas e vale para outras indicações; não é erro, mas na asma o teto é menor.

**Proposta**
- Plantão: **manter**.
- Calculadora (`dados/ped_db.json`, Prednisona e Prednisolona, campo `ob`): acrescentar "Na crise de asma (GINA 2024): máx. 40 mg/dia." Manter o teto numérico de 60 mg.
- Os tetos de 20 mg (< 2 anos) e 30 mg (2–5 anos): **PENDENTE DE VERIFICAÇÃO** no relatório completo da GINA antes de escrever na calculadora.

**Confiança:** média.

---

## 5. Hidrocortisona no choque séptico refratário

**Hoje no app**
- Plantão (fonte citada: Surviving Sepsis Campaign pediátrica 2020): EV **2 mg/kg, máx. 100 mg**.
- Calculadora: anafilaxia/asma grave **4–8 mg/kg/dose (máx. 250 mg)**; o próprio texto já diz "crise adrenal: 2-3 mg/kg em bolus (máx. 100 mg)".

**Fontes**
- Surviving Sepsis Campaign pediátrica — página oficial da atualização 2026 (li): sugere **não** usar hidrocortisona se o choque estabiliza com volume e vasopressor; se continua instável, diz que não há evidência suficiente para recomendar; dose de estresse se houver insuficiência adrenal suspeita ou confirmada. **Não cita dose.** O texto de 2020 não consegui abrir (pago).
  <https://survivingsepsis.org/guidelines-and-resources/surviving-sepsis-campaign-pediatric-guidelines>
- Protocolos de terceiros (não oficiais brasileiros, vistos na busca): 2 mg/kg (máx. 100 mg) em protocolo hospitalar americano e num ensaio clínico; resumos do protocolo ILAS citam esquemas diferentes. **Divergem.**

**Análise:** as duas doses do app são de **indicações diferentes** (choque/estresse × anafilaxia/asma) — não é erro de uma contra a outra. Mas a diretriz citada no Plantão **não define dose**, então os 2 mg/kg não vêm dela.

**Proposta**
- **Manter as duas doses**, cada uma com sua indicação.
- Dose do Plantão: **PENDENTE DE VERIFICAÇÃO** em documento brasileiro (SBP "Sepse grave e choque séptico pediátrico", ILAS). Não proponho valor.
- Opcional, sem mexer em dose: no Plantão, trocar a observação por "Dose de estresse. Considerar só se o choque for refratário a volume e vasopressores ou houver suspeita de insuficiência adrenal (a diretriz não define dose)."

**Confiança:** média.

---

## 6. Dexametasona IM/EV — teto de 10 mg ou 16 mg

**Hoje no app**
- Calculadora, via IM/EV: texto "ataque 0,6 mg/kg e manutenção 0,15 mg/kg (**máx. 10 mg/dose**)", mas o número usado no cálculo é **16 mg**.
- Calculadora, crupe: "máx. 16 mg; muitos serviços usam 0,15 mg/kg e máx. 10 mg".

**Fontes**
- SBP, "Crupe viral e bacteriano" (2017) — li o PDF: dexametasona em dose única, de 0,15 mg/kg (crupe leve) a 0,6 mg/kg (grave), oral ou parenteral. **Não cita dose máxima.**
  <https://www.sbp.com.br/fileadmin/user_upload/2017/01/Emergncia-Crupe-Viral-e-Bacteriano.pdf>
- Fontes secundárias (busca): uma usa teto de 10 mg, outra de 16 mg. **Divergem.**

**Proposta:** **PENDENTE DE VERIFICAÇÃO.** Não proponho valor. O que precisa ser resolvido é a contradição interna: o texto diz 10 mg e o cálculo usa 16 mg. Se o protocolo que você segue ("HILF") é 10 mg, o campo `mx` da via IM/EV deveria ser 10; se é 16, o texto é que deveria mudar.

**Confiança:** baixa (sem fonte oficial para o teto).

---

## 7. Carbamazepina — teto de 1.000 ou 1.200 mg/dia

**Hoje no app**
- Calculadora: 10–20 mg/kg/dia; máx. 35 mg/kg/dia; texto com tetos por idade (1.000 mg até 15 anos; 1.200 mg acima de 15); número usado no cálculo: **1.200 mg/dia**.

**Fontes**
- Rótulo FDA do Tegretol (DailyMed, atualizado em 2026) — li: < 6 anos 10–20 mg/kg/dia, máx. 35 mg/kg/dia; 6–12 anos manutenção 400–800 mg/dia, em geral não passar de 1.000 mg/dia; 12–15 anos 1.000 mg/dia; acima de 15 anos 1.200 mg/dia.
  <https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8d409411-aa9f-4f3a-a52c-fbcb0c3ec053>
- Bula da Anvisa: não consegui abrir.

**Análise:** o texto do app está **igual ao rótulo**. Não é erro: o relatório apontou porque o teto muda com a idade e a calculadora não pergunta a idade, então usa o maior (1.200).

**Proposta** (`dados/ped_db.json`, Carbamazepina)
- Campo `mxd`: de 1200 para **1000** (a calculadora é pediátrica; 1.000 mg vale até 15 anos).
- Campo `al`: acrescentar "Acima de 15 anos o máximo é 1.200 mg/dia."

**Confiança:** alta para os números (rótulo lido); a troca do teto é decisão sua.

---

## 8. Hidroclorotiazida — teto de 37,5 ou 100 mg/dia

**Hoje no app**
- Calculadora: 1–2 mg/kg/dia; texto "máx. 37,5 mg/dia < 2 anos e 100 mg/dia 2-12 anos"; número usado: **100 mg/dia**.

**Fontes**
- SBP, Manual de Orientação "Hipertensão arterial na infância e adolescência" (2019), Quadro 8 (li): hidroclorotiazida ≥ 1 mês — inicial 1 mg/kg/dia; máxima impressa "2mg/dia (máx. 37,5mg/dia)", 1–2x ao dia. Ou seja, na **hipertensão o teto é 37,5 mg/dia** em qualquer idade pediátrica.
  <https://www.sbp.com.br/fileadmin/user_upload/21635c-MO_-_Hipertensao_Arterial_Infanc_e_Adolesc.pdf>
- Rótulo FDA (DailyMed, rev. 2023) — li: 1–2 mg/kg/dia em 1–2 doses; não passar de 37,5 mg/dia até 2 anos nem de 100 mg/dia de 2 a 12 anos; < 6 meses pode precisar de até 3 mg/kg/dia.
  <https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=afdf1170-25a0-496d-b293-36ee0db2cd1e>

**Análise:** o texto do app repete o rótulo (correto). Mas a fonte preferencial do projeto (SBP) limita a 37,5 mg/dia na hipertensão; o teto de 100 mg é do rótulo geral (inclui edema).

**Proposta** (`dados/ped_db.json`, Hidroclorotiazida)
- Campo `mxd`: de 100 para **37,5**.
- Campo `ob`: "1-2 mg/kg/dia em 1-2 doses. Hipertensão (SBP 2019): máx. 37,5 mg/dia. Rótulo (edema): máx. 37,5 mg/dia < 2 anos e 100 mg/dia de 2 a 12 anos; < 6 meses: até 3 mg/kg/dia em 2 doses."

**Confiança:** alta (as duas fontes lidas).

---

## 9. Hidroxizina — teto de 50 ou 100 mg/dia

**Hoje no app**
- Calculadora: ≈ 0,67 mg/kg/dose a cada 8 h (2 mg/kg/dia); texto "< 6 anos máx. 50 mg/dia; ≥ 6 anos 50-100 mg/dia"; número usado: **100 mg/dia**.

**Fontes**
- Rótulo FDA do cloridrato de hidroxizina, comprimidos (DailyMed, rev. 2023) — li: ansiedade e prurido — menores de 6 anos 50 mg/dia em doses divididas; maiores de 6 anos 50 a 100 mg/dia; sedação 0,6 mg/kg.
  <https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6533bb4f-efbc-4fca-b625-daa1b3978740>
- Bula da Anvisa (Hixizine): não consegui abrir.

**Análise:** o texto do app está **igual ao rótulo**. Não é erro; como no item 7, a calculadora usa o teto da faixa mais velha porque não pergunta a idade.

**Proposta** (`dados/ped_db.json`, Hidroxizina)
- Manter `mxd` em 100.
- Campo `al`: acrescentar "Menores de 6 anos: máximo de 50 mg/dia."

**Confiança:** alta para os números (rótulo lido).

---

## O que não consegui ler

- **Bulário Eletrônico da Anvisa**: recusa acesso automático. As bulas de captopril, secnidazol, hidroxizina e carbamazepina precisam ser abertas por você no navegador.
- **Algoritmo da diretriz AES 2016** (é uma figura) e o **relatório completo da GINA 2024** (arquivo grande demais).
- **Surviving Sepsis Campaign pediátrica 2020** (texto pago); li a página oficial da atualização 2026.

## Depois da sua aprovação

Aplico só o que você aprovar em `dados/*.json`, rodo as verificações do `CLAUDE.md` e `npm run relatorios` (os itens resolvidos somem do `REVISAO_CLINICA.md`). Atenção: o `testar_build.js` compara os dados com a v71 e vai acusar diferença, porque o conteúdo terá mudado de propósito — eu informo isso em vez de esconder.
