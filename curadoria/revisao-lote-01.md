# Revisão de fontes — lote 01

Revisor independente, somente leitura. Data: 12/11/2026.

**Como conferi.** Baixei e li as fontes citadas no lote: Manual de Gestação de Alto Risco (MS, 2022), Guia de Manejo e Tratamento de Influenza (MS, 2023), CAB 28 v. II (MS, 2013), Atenção à Saúde do RN v. 1, 2 e 3 (MS, 2014), PCDT de Transmissão Vertical (Portaria SCTIE/MS 55/2020, arquivo do portal gov.br), guia Anvisa/CAMO-Net (PDF de 800 p.), SBPT 2006 (SciELO), NICE NG120 e a página da Fiocruz/IFF. Extraí o texto com `pdftotext`. Onde a tabela vinha embaralhada, li a ordem bruta (`-raw`). A Figura 3 do cap. 38 do manual de alto risco é imagem; extraí essa figura e a li. As Figuras 1 e 2 do cap. 38 (qSOFA e fluxograma) e os fluxogramas 44 a 46 do CAB 28 estão em JPEG2000 ou só como imagem e não puderam ser lidos; isso fica dito onde importa.

**Checagens automáticas.** `node curadoria/checar_lote.js` → "OK: JSON válido, campos, áreas, especialidades, Base e CID conferidos". Os avisos são só de CID compartilhado com registros existentes. Todos os 31 códigos do lote existem em `dados/cid_full.json`; U07.1 não existe, como o redator já disse. Todas as especialidades existem em `dados/especialidades.json`. Busca por nome e sinônimo em `dados/diseases.json`: nenhuma duplicata. Os mais próximos são "Hipertensão crônica na gestação", "Pré-eclâmpsia/eclâmpsia", "Sepse/choque séptico", "Infecção puerperal", "Aborto infectado", "Síndrome gripal e COVID-19 leve", "Influenza e SRAG", "Exposição ocupacional ao vírus da hepatite C" e "Fratura do cotovelo e da cabeça do rádio", e nenhum trata da mesma condição. Não há dados de pacientes. Usei "PENDENTE DE VERIFICAÇÃO" quando faltava fonte.

**Legenda.** ✅ confere. ⚠️ confere em parte ou precisa de ajuste. ❌ não está na fonte ou contradiz a fonte (reprova o registro).

## Resumo

| # | Registro | Veredito | Motivo (uma linha) |
|---|---|---|---|
| 1 | Hipertensão gestacional | **APROVADO COM AJUSTES** | Todas as doses e critérios conferem com o cap. 11 (quadros 2 e 3); falta só deixar claro que os exames vêm da seção de pré-eclâmpsia |
| 2 | Sepse na gestação | **REPROVADO** | Ignora o volume do MS (Figura 3: cristaloide 20 mL/kg até 3 h) e usa 30 mL/kg de fontes secundárias; pede "vitalidade fetal" sem fonte; define choque séptico com "ou" em vez de "e" |
| 3 | Esteatose hepática aguda da gravidez | **REPROVADO** (correção simples) | Diz que a biópsia é "raramente necessária", o que não está na fonte; a etiologia atribui ao feto o que o manual descreve de outro modo; o resto confere |
| 4 | Covid-19 e influenza na gestação | **APROVADO COM AJUSTES** | Doses (oseltamivir, ceftriaxona/azitromicina, heparinas, corticoide) conferem; ajustar a duração da ceftriaxona e a janela do oseltamivir |
| 5 | Resfriado comum | **APROVADO COM AJUSTES** | Confere com o CAB 28; a dexclorfeniramina contraria o MS e foi tirada de contexto (a SBPT a associa à pseudoefedrina) — sugiro retirar |
| 6 | Bronquite aguda | **REPROVADO** (correção simples) | Pede "hemograma e PCR" sem fonte; os sinais de gravidade da Anvisa foram transcritos de forma errada (critérios fundidos e omitidos) |
| 7 | Urgências odontológicas na APS | **REPROVADO** (correção simples) | Pede "exames de imagem e laboratório" sem fonte; deixa de fora, sem fonte que justifique, o antimicrobiano que o CAB 28 prevê na pulpite irreversível |
| 8 | Pronação dolorosa | **REPROVADO** | Sem fonte e sem conteúdo; não deve entrar no app |
| 9 | Lesões benignas da pele do RN | **APROVADO COM AJUSTES** | Confere com o MS 2014 (v. 1 cap. 3 e v. 3 cap. 31); ajustes de redação nos sinais de reavaliação |
| 10 | Criança exposta à hepatite C | **APROVADO COM AJUSTES** | Fluxograma, exames e idades de tratamento conferem com o PCDT; a frase "nenhuma intervenção na gestação reduz a transmissão" contraria o PCDT 2020 |

"Correção simples" quer dizer que basta remover ou reescrever a frase indicada, sem nova pesquisa. Depois disso o registro pode ser reapresentado como "aprovado com ajustes".

---

## 1. Hipertensão gestacional — APROVADO COM AJUSTES

Fonte conferida: MS, Manual de Gestação de Alto Risco 2022, cap. 11, p. 142-151 (PDF p. 142-150).

- ✅ Definição, evolução para pré-eclâmpsia em 10-50%, normalização até 12 semanas e reclassificação como hipertensão crônica (11.3).
- ✅ PAS ≥ 140 e/ou PAD ≥ 90, 5º ruído, sentada, mais de uma medida com intervalo de 4-6 h, tabela de correção quando o braço tem > 30 cm (11.2, Quadro 1).
- ✅ Proteinúria ≥ 300 mg/24 h, relação proteína/creatinina ≥ 0,3, fita 1+ ≈ 30 mg/dL (11.3).
- ✅ Meta 110-140 x 85 mmHg; parto até 39+6 se a PA está controlada, sem comprometimento fetal e sem pré-eclâmpsia (11.3).
- ✅ IECA, BRA e inibidores diretos da renina contraindicados (p. 150).
- ✅ Manutenção (Quadro 3, Peraçoli 2020): metildopa 750-2.000 mg/dia em 2-4x; clonidina 0,2-0,6 mg/dia em 2-3x; nifedipino retard 20-120 mg/dia em 1-3x; anlodipino 5-20 mg/dia em 1-2x; hidralazina 50-150 mg/dia em 2-3x; metoprolol 100-200 mg/dia em 1-2x. Tudo confere.
- ✅ Crise (Quadro 2): nifedipino 10 mg VO, repetir 10 mg a cada 20-30 min, máximo 30 mg; hidralazina 1 ampola de 20 mg/mL em 19 mL de água destilada = 1 mg/mL, 5 mg IV, repetir 5 mg a cada 20 min, máximo 30 mg; redução de 15-25% na 1ª hora (11.4.4).
- ✅ PA ≥ 160/110 confirmada em 15 min = sinal de gravidade e indica profilaxia com sulfato de magnésio (11.5 e 11.4.4). Sinais de alarme (cefaleia, alteração visual, dispneia, dor epigástrica ou no hipocôndrio direito, redução dos movimentos fetais) conferem (11.4).
- ⚠️ Exames: o manual não lista exames para a hipertensão gestacional. Os exames citados (hemograma com plaquetas, DHL, bilirrubinas, creatinina, AST) são os "exames mínimos" da pré-eclâmpsia com sinais de gravidade (11.4.3). "Pesquisa seriada" não está escrito; o texto diz apenas "monitorar o desenvolvimento de pré-eclâmpsia".
  - Antigo: "Pesquisa seriada de proteinúria (urina 24 h, ...); exames para afastar disfunção de órgão-alvo (hemograma com plaquetas, transaminases, creatinina, DHL, bilirrubinas);"
  - Novo: "Monitorar o surgimento de pré-eclâmpsia: proteinúria (urina 24 h, relação proteína/creatinina ou fita: 1+ ≈ 30 mg/dL) e, se houver suspeita, os exames mínimos da pré-eclâmpsia (hemograma com plaquetas, DHL, bilirrubinas, creatinina, AST);"
- ⚠️ Critérios: "manguito adequado" pode ser mais preciso. Sugestão: "manguito de 13 cm no braço direito, na altura do coração" (11.2).
- ✅ Base: corresponde à fonte. Texto próprio: amostrei 3 frases (introdução, tratamento, conduta) e todas estão parafraseadas.
- ✅ CID O13 é exato ("Hipertensão gestacional sem proteinúria significativa"). Área e especialidade conferem.

**Pontos do redator.** (2) Concordo: o cap. 11 não trata de AAS nem de cálcio na hipertensão já instalada. (3) Concordo: o labetalol não está nos quadros. (4) Não há conflito real: 110-140 x 85 é a meta de manutenção e 140-150/90-100 é a meta da crise. Mas o registro existente "Pré-eclâmpsia/eclâmpsia" (Base: ACOG/FIGO/FEBRASGO) diz hidralazina "máx. 20 mg" e repetição "a cada 20-30 min", enquanto a fonte brasileira oficial (MS 2022 / Peraçoli 2020) diz máximo de 30 mg a cada 20 min. Sugiro que o autor harmonize aquele registro com o MS em uma revisão à parte, fora deste lote.

## 2. Sepse na gestação (sepse materna) — REPROVADO

Fontes conferidas: MS 2022, cap. 38 (PDF p. 380-385), cap. 28 (p. 306-307), cap. 27 (p. 296); Fiocruz/IFF 2019; Anvisa/CAMO-Net (seção "Identificação de sepse", p. 12-13).

- ✅ Definição; 3ª causa de morbimortalidade; focos genital, urinário e pulmonar; cesárea como fator de risco; agentes (38.1).
- ✅ Sinais de alerta (Quadro 1 do cap. 38): febre e calafrios, diarreia e vômitos, exantema, dor abdominal ou pélvica, leucorreia ou loquiação alterada, tosse, sintomas urinários, alterações nas mamas e na ferida, involução uterina lenta, letargia.
- ✅ qSOFA ≥ 2 = alto risco, ampliar a avaliação; SOFA ≥ 2 confirma a disfunção (38.2).
- ⚠️ Limiares do qSOFA: o registro usa "FR > 22, PAS < 100", como a Fiocruz. O cap. 38 cita Singer et al. 2016 (Sepsis-3), cujos limiares são FR ≥ 22 e PAS ≤ 100. A figura do manual não pôde ser lida. Novo: "FR ≥ 22 irpm, PAS ≤ 100 mmHg, alteração do nível de consciência (Glasgow < 15)".
- ⚠️ Choque séptico: o registro diz "necessidade de vasopressor para PAM ≥ 65 mmHg **ou** lactato > 2 mmol/L". A Fiocruz escreve assim, mas a definição Sepsis-3, referência do cap. 38, exige os dois critérios juntos. Novo: "necessidade de vasopressor para manter PAM ≥ 65 mmHg **e** lactato > 2 mmol/L apesar de reposição volêmica adequada (Sepsis-3, referência do cap. 38)".
- ✅ "Aumento de 2 ou mais pontos no SOFA" equivale ao "somatório ≥ 2" do manual quando o SOFA basal é 0. Aceitável.
- ✅ Quadro 2 do cap. 38 (esquemas por foco): conferi a ordem bruta do PDF (p. 384-385). Corioamnionite: ampicilina + gentamicina (alternativa amoxicilina-clavulanato). Endometrite: clindamicina + gentamicina (alternativas ampicilina + gentamicina + metronidazol ou amoxicilina-clavulanato). Pielonefrite: ceftriaxona (alternativas amoxicilina-clavulanato ou gentamicina, principalmente no puerpério). Pneumonia: amoxicilina-clavulanato + azitromicina (alternativas ceftriaxona + azitromicina ou cefazolina + azitromicina). Influenza: oseltamivir. Pele e partes moles: clindamicina + cefazolina (alternativa oxacilina). A leitura do redator está correta.
- ✅ Antibiótico na 1ª hora, cada hora de atraso aumenta a mortalidade, UTI após a abordagem inicial, controle do foco decidido de forma multidisciplinar (38.3).
- ✅ Pacote da 1ª hora contado da triagem; lactato repetido se > 2; culturas sem atrasar o antibiótico; Ringer lactato; noradrenalina se PAM < 65, com acesso central e periférico se não houver (Fiocruz).
- ✅ Ceftriaxona 2 g IV 1x/dia + azitromicina 500 mg IV/VO 1x/dia por 5 dias; oseltamivir 75 mg 12/12 h por 5 dias (cap. 28, p. 306-307).
- ⚠️ A duração de 5 dias no texto do MS vale para a azitromicina; a duração da ceftriaxona não é informada. Novo: "ceftriaxona 2 g IV 1 vez ao dia (duração não informada na fonte: PENDENTE DE VERIFICAÇÃO) + azitromicina 500 mg IV ou VO 1 vez ao dia por 5 dias."
- ⚠️ **Volume de cristaloide (ponto principal).** A Figura 3 do cap. 38 (p. 384, "Passos fundamentais para controle clínico da sepse") é imagem, e eu a extraí. Ela diz: 1ª hora = hemoculturas, antibioticoterapia e oxigênio; até 3 h = hidratação com **cristaloide 20 mL/kg** e PAM > 65 mmHg; até 6 h = normalização do lactato. Ou seja, a fonte mais oficial e específica para gestantes traz um volume, e o registro o deixa como "PENDENTE" e usa 30 mL/kg de uma fonte geral para adultos (Anvisa) e de um portal (Fiocruz).
  - Antigo (prescrição, item 4): "Cristaloide (Ringer lactato) 30 mL/kg o mais rápido possível, idealmente em 30 a 60 min, se hipotensão ou lactato elevado; reavaliar volemia e risco de congestão pulmonar (volume específico para gestante: PENDENTE DE VERIFICAÇÃO)."
  - Novo: "Cristaloide (Ringer lactato) 20 mL/kg nas primeiras 3 horas, com meta de PAM > 65 mmHg (MS 2022, cap. 38, fig. 3); reavaliar volemia e risco de congestão pulmonar a cada etapa. Fontes não específicas da gestação (Fiocruz 2019; Anvisa) citam 30 mL/kg em 30 a 60 min."
  - Conduta: acrescentar "oxigênio" ao pacote da 1ª hora (fig. 3).
- ❌ Exames: "avaliação da vitalidade fetal" não está no cap. 38, na Fiocruz nem na Anvisa. Remover ou citar uma fonte. "Exames de imagem conforme o foco" também não está escrito, mas é coerente com o controle do foco (38.3) ⚠️. "Coagulação" ✅ (INR na Anvisa, p. 12).
- ✅ Base: corresponde às fontes (acrescentar "fig. 3" se a correção acima for aceita).
- ⚠️ Texto próprio: "Cada hora de atraso aumenta a mortalidade" é cópia literal do manual (38.3). Reescrever, por exemplo: "o atraso do antibiótico aumenta a mortalidade a cada hora". As outras 2 frases amostradas estão parafraseadas.
- ✅ CID: A41.9, O98.8, O75.3, O85 e O08.0 existem. Opinião: a combinação é defensável (a CID-10 não tem código para sepse antes do parto). Pode-se acrescentar, se o autor quiser, O41.1 (infecção da cavidade amniótica e das membranas = corioamnionite) e O86.0 (infecção da ferida operatória obstétrica). Não é obrigatório.

**Pontos do redator.** (1) Manter os CID. (2) Concordo: não há doses de antibiótico nas fontes. (3) O manual do MS traz um volume específico (20 mL/kg em até 3 h, fig. 3), e a fonte oficial prevalece. (4) Os limiares devem seguir a Sepsis-3 (≥ 22 e ≤ 100). (5) Nada a acrescentar.

## 3. Esteatose hepática aguda da gravidez — REPROVADO (correção simples)

Fonte conferida: MS 2022, cap. 15, p. 188-194.

- ✅ Incidência de 1:20.000; da 2ª metade da gestação ao puerpério, 74% no 3º trimestre; falência de múltiplos órgãos (15.1).
- ⚠️ Etiologia: o registro diz "defeito fetal da oxidação de ácidos graxos (principalmente deficiência de LCHAD)". O manual descreve um defeito na unidade feto-placentária em mãe heterozigota e escreve "deficiência materna da LCHAD" (15.2). Novo: "Associa-se a defeito da oxidação de ácidos graxos na unidade feto-placentária (sobretudo deficiência de LCHAD), em geral com mãe heterozigota."
- ✅ Sinais e sintomas (sensório, pulso > 100, queixas gastrointestinais, comprometimento fetal) e critérios de Swansea: 6 ou mais critérios, sem outra explicação. Todos os valores conferem com o Quadro 1: bilirrubina > 0,8, AST/ALT > 42, amônia > 47, ácido úrico > 5,7, creatinina > 1,7, glicemia < 72, leucócitos > 11.000, TP > 14 s ou TTPa > 34 s, US com fígado brilhante ou ascite, esteatose microvesicular.
- ✅ Diferencial com HELLP: hipofibrinogenemia, lesão renal, hiperbilirrubinemia, hipoglicemia e hipocolesterolemia mais frequentes na EHAG; 70% hipertensas (15.3).
- ❌ Exames: "Biópsia hepática raramente necessária" não está no manual. A fonte só diz que a histologia é patognomônica e que a biópsia faz parte dos critérios de Swansea. Antigo: "Biópsia hepática raramente necessária." Novo: remover a frase ou trocar por "A histologia (esteatose microvesicular) é patognomônica e faz parte dos critérios de Swansea."
- ⚠️ "glicemia (repetida)": "repetida" não está na fonte; retirar a palavra ou mantê-la só se houver fonte.
- ✅ Exames seriados a cada 6-12 h no pós-parto; escore ISTH de CIVD modificado para a gestação (Tabela 1).
- ✅ Conduta: diagnóstico precoce, equipe multidisciplinar, parto o mais rápido possível, UTI no pós-parto, falência progressiva enquanto o feto está no útero, proteção de via aérea, banco de sangue e protocolo de HPP, anti-hipertensivo e sulfato de magnésio se houver suspeita de pré-eclâmpsia grave ou HELLP (15.4).
- ⚠️ "corrigir hipoglicemia": a fonte não diz isso explicitamente (fala em "suporte de vida materna"). Aceitável, e a dose já está como PENDENTE.
- ✅ Via de parto: EHAG não indica cesárea por si; via vaginal com feto reativo; incisão vertical e drenos.
- ⚠️ A fonte indica a incisão vertical "na presença de coagulopatia". Novo: "se cesárea, preparo para hemorragia, incisão vertical se houver coagulopatia e drenos."
- ✅ Tempos de recuperação (transaminases 1-2 dias, colesterol e bilirrubinas 3-4, CIVD 4-6, creatinina 7-10); plasmaférese sem reduzir mortalidade; ECMO; transplante; rastreio da mulher (15.4-15.5).
- ⚠️ Texto próprio: "a falência hepática progride enquanto o feto estiver no útero" é quase literal ("enquanto o feto permanecer no útero"). Novo: "a disfunção hepática só regride após o parto". As outras 2 frases amostradas estão parafraseadas.
- ✅ Base: corresponde à fonte. CID O26.6 é apropriado e pode ser compartilhado com a colestase. Área e especialidades conferem.

**Pontos do redator.** (1) Concordo: "50 g/dL" é erro evidente de unidade no manual; manter PENDENTE e não reproduzir o número. (2) Concordo. (3) Concordo. (4) Nada a acrescentar.

## 4. Covid-19 e influenza na gestação e no puerpério — APROVADO COM AJUSTES

Fontes conferidas: MS 2022, cap. 27 (p. 294-297) e cap. 28 (p. 298-311); Guia de Influenza 2023 (p. 17-22, 34); CAB 28 Quadro 61.

- ✅ Puérperas até 2 semanas, incluindo aborto e perda fetal (Guia 2023, p. 17); mais UTI, intubação e óbito (28.1); prematuridade (27.3).
- ✅ Classificação leve, moderada e grave (Quadro 1 do cap. 28); na gestante, observar hipotensão e oligúria; MEOWS com 2 amarelos ou 1 vermelho (Quadro 2).
- ✅ Sinais de alarme FR > 20 e FC > 100; valorizar a dispneia; SpO2 < 94% → oxigênio, monitorização e internação; não adiar a radiografia; febre sempre tratada, com paracetamol como melhor opção; oseltamivir para toda gestante ou puérpera com síndrome gripal, mesmo vacinada e sem sinais de gravidade (Guia 2023, p. 20-21).
- ✅ RT-PCR melhor entre o 3º e o 7º dia; antígeno; exames por estágio; proteção abdominal na imagem (Quadro 4 e 28.3).
- ✅ Leve: isolamento, suporte, monitoramento 2-3x por semana e diário do 7º ao 14º dia; alto risco obstétrico sem como acompanhar → internar. Moderada: internação, O2, antibiótico se houver infecção bacteriana, heparina, corticoide. Grave: UTI.
- ✅ Critérios de UTI (28.5); prona com PaO2/FiO2 < 150 (28.4); vitalidade fetal diária nos casos moderados e graves (28.6); aleitamento com máscara e higiene das mãos (28.6.2); vacina contra covid em qualquer trimestre, evitada durante quadro gripal (28.6.4); vacina contra influenza em qualquer trimestre, anual (27.5); notificar SRAG (Guia 2023, p. 43).
- ✅ Doses: oseltamivir 75 mg 12/12 h por 5 dias; ajuste renal (Tabela 5 do Guia: 75 mg 12/12 h se clearance > 60; 30 mg 12/12 h se 30-60); paracetamol 3-4 g/dia em 3-4 doses, máximo 4 g (Quadro 61); HNF 5.000 UI 12/12 h até 60 kg, 5.000 UI 8/8 h de 60-90 kg, 7.500 UI 8/8 h acima de 90 kg; enoxaparina 40 mg/dia até 80 kg, 60 mg/dia de 80-120 kg, 40 mg 12/12 h acima de 120 kg; não usar com plaquetas < 50.000 ou sangramento; 12 h entre a enoxaparina e o procedimento; manter após a alta; dexametasona 6 mg/dia por 7-10 dias; metilprednisolona 0,7-1,0 mg/kg IV 12/12 h (cap. 28).
- ⚠️ Item 3 da prescrição: "por 5 dias" no MS vale só para a azitromicina. Novo: "ceftriaxona 2 g IV 1 vez ao dia (duração: PENDENTE DE VERIFICAÇÃO) + azitromicina 500 mg IV ou VO 1 vez ao dia por 5 dias."
- ⚠️ Janela do oseltamivir. Antigo: "idealmente até 48 h (há benefício até 72 h ou mais nas graves)". Pelo Guia 2023 (p. 22), na gestante o maior benefício é com início até 72 h, ainda há benefício com 3-4 dias, e o tratamento é indicado de qualquer forma. Novo: "iniciar o quanto antes, sem esperar exame; na gestante o maior benefício é até 72 h, mas ainda há benefício quando iniciado entre o 3º e o 4º dia (Guia de Influenza 2023)". Registrar também que o manual de 2022 limitava a indicação a < 48 h; prevalece o Guia de 2023, mais recente e específico.
- ⚠️ "teste rápido ou RT-PCR para influenza quando disponível": o manual restringe a pesquisa viral aos casos de dúvida, sintomas prolongados ou fora da sazonalidade (27.2). Novo: "pesquisa de influenza (RT-PCR ou teste rápido) em caso de dúvida diagnóstica, sintomas prolongados ou fora da sazonalidade; não atrasar o oseltamivir por causa do exame."
- ✅ Base: corresponde às fontes. Texto próprio: 3 frases amostradas e parafraseadas.
- ✅ CID: O98.5 + B34.2 para covid e O99.5 + J10.1/J11.1 para influenza estão corretos pela regra do capítulo XV. A área "Infectologia" é aceitável; "Ginecologia e Obstetrícia" também seria.

**Pontos do redator.** (1) Concordo. (2) Prevalece o Guia de Influenza 2023 (SVS/MS, mais recente e específico), que não recomenda quimioprofilaxia de rotina fora dos imunodeprimidos graves e das instituições de longa permanência. Sugiro acrescentar uma linha à conduta: "Quimioprofilaxia de gestante exposta: não recomendada de rotina pelo Guia de Influenza 2023 (o manual de 2022 a indicava para não vacinadas expostas há até 48 h)." (3) Concordo com PENDENTE. (4) Concordo: o "0,75 mg/kg" do manual é inconsistente com 6 mg/dia; usar só 6 mg/dia.

## 5. Resfriado comum (nasofaringite aguda) — APROVADO COM AJUSTES

Fontes conferidas: CAB 28 v. II, cap. 2.18 (p. 167-171) e Quadro 61 (p. 206); SBPT 2006, seções Tosse aguda e Tosse pós-infecciosa.

- ✅ Principal causa de rinossinusite aguda; rinovírus, coronavírus, VSR e metapneumovírus (CAB). Mais de 200 vírus, parainfluenza, adenovírus e enterovírus; principal causa de tosse aguda (SBPT).
- ⚠️ "Adultos têm 2 a 5 episódios por ano e crianças 6 a 8": o CAB fala de episódios de infecção das vias aéreas superiores em geral, não só de resfriado. Novo: "Adultos têm 2 a 5 infecções de vias aéreas superiores por ano e crianças 6 a 8."
- ✅ Quadro clínico, evolução (pico nos 3 primeiros dias, regressão entre o 7º e o 10º dia), secreção esverdeada sem significado bacteriano, suspeita de bactéria com 10-14 dias ou piora após o 5º dia (CAB); ausculta normal e gotejamento pós-nasal (SBPT).
- ✅ Imagem desnecessária na 1ª semana (SBPT); imagem só se houver suspeita de complicação, com os sinais de alerta (edema periorbitário, cefaleia intensa, alteração visual, toxemia, irritação meníngea) (CAB, p. 169).
- ✅ Suporte, soro fisiológico 0,9%, paracetamol ou dipirona; AINE e corticoide não recomendados; descongestionante tópico ocasional, no máximo 3 dias, evitado em lactentes; mucolítico e vitamina C sem benefício; anti-histamínico sem eficácia em não atópicos; aspiração nasal no lactente poucas vezes ao dia; risco de queimadura com vapor (CAB).
- ⚠️ "Antibiótico não deve ser usado": a SBPT escreve "não devem ser usados **de rotina**". Novo: "Antibiótico não deve ser usado de rotina."
- ⚠️ "Soro fisiológico 0,9% nasal, várias vezes ao dia": a frequência não está na fonte. Novo: "Soro fisiológico 0,9% nasal para desobstrução (frequência não definida na fonte)."
- ✅ Paracetamol para adulto e criança (Quadro 61). ✅ Dipirona e descongestionante como PENDENTE.
- ⚠️ Item 4 (dexclorfeniramina 2 mg até 4x/dia): a SBPT cita essa dose na seção de tosse aguda pós-infecciosa, **associada à pseudoefedrina**, para "prostração e incômodo". O registro a apresenta isolada. Além disso, o MS (fonte de maior prioridade e mais recente) afirma que anti-histamínicos não aliviam o resfriado em não atópicos. Recomendo retirar o item 4 da prescrição e deixar só esta nota na conduta: "a SBPT (2006) admite anti-histamínico de 1ª geração com descongestionante; o MS (2013) não recomenda anti-histamínico em não atópicos." Se o autor quiser manter, o texto deve dizer "dexclorfeniramina 2 mg até 4x/dia associada à pseudoefedrina (SBPT 2006)", com a ressalva do MS.
- ⚠️ Retorno por "febre alta persistente" e "dispneia": não aparece na seção de resfriado, mas aparece no mesmo capítulo (gravidade da rinossinusite, Quadro 55, febre ≥ 39 °C; SRAG na síndrome gripal). Aceitável.
- ✅ Base: corresponde às fontes. Texto próprio: 3 frases amostradas e parafraseadas.
- ✅ CID J00 é exato ("Nasofaringite aguda [resfriado comum]"). Área e especialidades conferem.

**Pontos do redator.** (1) Prevalece o MS: tirar a dexclorfeniramina da prescrição (ver acima) e manter o naproxeno de fora (o MS não recomenda AINE). (2) Concordo. (3) Concordo: não é duplicata.

## 6. Bronquite aguda (traqueobronquite aguda) — REPROVADO (correção simples)

Fontes conferidas: SBPT 2006 (Traqueobronquite aguda); Anvisa/CAMO-Net (fluxograma de tosse aguda, p. 14); NICE NG120 (1.1-1.3, Tabela 1); CAB 28 Quadro 61.

- ✅ Definição (tosse < 3 semanas, com ou sem expectoração purulenta, sem outra causa), etiologia (viral; bactérias < 10%: Mycoplasma, Chlamydophila, B. pertussis), hiper-responsividade transitória em até 40% por < 6 semanas, antitussígeno com pouco efeito, mucolítico não indicado, macrolídeo em surto de atípicos ou suspeita de coqueluche com < 2 semanas (SBPT).
- ✅ Tosse que dura 3-4 semanas; antibiótico encurta a tosse em cerca de meio dia; critérios de alto risco (comorbidades; > 65 anos com 2 ou mais critérios; > 80 anos com 1 ou mais); antibiótico imediato se sistemicamente muito doente; imediato ou de reserva no alto risco; reavaliação; mel acima de 1 ano (NICE 1.1-1.2).
- ✅ Doses NICE Tabela 1: doxiciclina 200 mg no 1º dia e depois 100 mg/dia por mais 4 dias; amoxicilina 500 mg 3x/dia por 5 dias; claritromicina 250-500 mg 2x/dia por 5 dias.
- ⚠️ Gestação: o NICE diz que a doxiciclina **não deve ser usada**. Antigo: "Na gestação, evitar doxiciclina; amoxicilina é preferida." Novo: "Na gestação, não usar doxiciclina; amoxicilina é a preferida (se precisar de macrolídeo, eritromicina)."
- ⚠️ Broncodilatador: SBPT ("se houver indício de obstrução") e NICE ("só com doença de vias aéreas de base, como asma") divergem. O registro junta os dois critérios. Aceitável se a frase citar as duas fontes.
- ⚠️ **Sinais de gravidade (Anvisa, p. 14), transcrição incorreta.** O fluxograma tem dois níveis: (a) confusão mental, FR ≥ 30, PAS < 90 ou PAD ≤ 60, SpO2 ≤ 94% → encaminhar ao hospital; (b) ≥ 65 anos, **ou** alteração de ausculta, **ou** comorbidades (DM, ICC, imunossupressão, neoplasia, insuficiência renal, cirrose), **ou** queda do estado geral, FR > 25, FC > 125, temperatura < 35 ou > 40 °C → radiografia de tórax se possível e antimicrobiano conforme a tabela de PAC. O registro funde "≥ 65 anos com alteração de ausculta" (são critérios separados) e omite FR > 25 e as comorbidades.
  - Antigo (critérios): "Sinais que afastam o quadro simples e pedem avaliação de pneumonia ou outra causa grave: confusão mental, FR ≥ 30 irpm, PAS < 90 ou PAD ≤ 60 mmHg, SpO2 ≤ 94%, idade ≥ 65 anos com alteração de ausculta, FC > 125, temperatura < 35 ou > 40 °C, queda do estado geral."
  - Novo: "Sinais de gravidade (Anvisa/CAMO-Net): confusão mental, FR ≥ 30 irpm, PAS < 90 ou PAD ≤ 60 mmHg ou SpO2 ≤ 94% → encaminhar ao hospital. Idade ≥ 65 anos, alteração de ausculta, comorbidade (diabetes, insuficiência cardíaca, imunossupressão, neoplasia, insuficiência renal, cirrose), queda do estado geral, FR > 25, FC > 125 ou temperatura < 35 ou > 40 °C → radiografia de tórax e conduzir como possível pneumonia."
- ❌ Exames: "Hemograma e PCR se houver dúvida com pneumonia ou sinusite bacteriana" não está em nenhuma das fontes citadas. Remover a frase (ou marcar PENDENTE DE VERIFICAÇÃO).
- ✅ Radiografia se houver suspeita de pneumonia; teste de SARS-CoV-2 e influenza na síndrome gripal (Anvisa); idoso com quadro atípico (SBPT, tosse pós-infecciosa).
- ✅ Paracetamol (Quadro 61); doses de macrolídeo para coqueluche e de broncodilatador como PENDENTE.
- ✅ Base: corresponde às fontes. O uso do NICE como complemento está declarado e segue a regra (não há dose em fonte brasileira).
- ⚠️ Texto próprio: a frase sobre a hiper-responsividade ("pode causar obstrução e hiper-responsividade brônquica transitórias (até 40%), com duração de até 6 semanas") segue de perto a estrutura da SBPT. Sugiro reescrever, por exemplo: "Até 40% têm broncoespasmo e hiper-responsividade passageiros, que somem em menos de 6 semanas." As outras 2 frases amostradas estão parafraseadas.
- ✅ CID J20.9 é exato. Área e especialidades conferem.

**Pontos do redator.** (1) Concordo. Observo que a própria SBPT, na seção de tosse pós-infecciosa, indica antibiótico "na presença de secreção purulenta", o que diverge da seção de tosse aguda e do NICE. O registro segue corretamente a seção de tosse aguda e o NICE. (2) Não há conflito: o fluxograma da Anvisa é para tosse produtiva < 14 dias, e a definição de bronquite (< 3 semanas) é da SBPT. (3) Concordo. (4) Concordo em incluir só o mel.

## 7. Urgências odontológicas na APS — REPROVADO (correção simples)

Fonte conferida: CAB 28 v. II, cap. 2.21 (p. 190-206) e Quadro 61, lido na ordem bruta do PDF (p. 207).

- ✅ Introdução: maioria de origem endodôntica ou periodontal; risco de vida nas infecções disseminadas (via aérea, septicemia) e nas hemorragias; tratamento = remover a causa ou paliar (p. 190-191).
- ✅ Pulpite reversível, pulpite irreversível, pericementite apical aguda, abscesso periapical e abscesso periodontal: as descrições conferem (p. 191-195).
- ⚠️ "abscesso periodontal ... vitalidade pulpar preservada": a fonte diz "testes positivos quando não houver lesão endopério". Novo: "vitalidade pulpar em geral preservada (exceto na lesão endopério)."
- ⚠️ Lista de gravidade (edema facial extenso, trismo, disfagia, febre, toxemia, dificuldade respiratória): no texto da fonte aparecem só o risco de obstrução de via aérea e de septicemia, e trismo, disfagia e febre na pericoronarite. Os gatilhos para acionar o SAMU estão no fluxograma da Figura 45, que é imagem e não pôde ser lido. Manter, mas o autor deve conferir a Figura 45.
- ❌ Exames: "Infecção disseminada: ... exames de imagem e laboratório em serviço de urgência" não está na fonte (que só diz "acionar serviço móvel de urgência"). Novo: "Infecção disseminada: avaliar via aérea e sinais de sepse e acionar o serviço de urgência (SAMU)."
- ⚠️ "radiografia periapical quando disponível": o CAB só cita radiografia nas urgências traumáticas. Remover ou marcar como sem fonte.
- ✅ Antibiótico no abscesso com edema e antes de incisão (≥ 1 h antes); antimicrobiano no abscesso periodontal com envolvimento sistêmico; analgésico obrigatório; AINE contraindicado na pericementite apical simples e só aceito sem foco infeccioso; bochecho com água morna e sal; reavaliação em 48 h; agendamento na UBS ou no CEO; SAMU na infecção disseminada.
- ⚠️ Clorexidina 0,12%: a fonte a indica na doença periodontal necrosante (GUN/PUN) e na pericoronarite, não em "doença periodontal" em geral. Novo: "clorexidina 0,12% na doença periodontal necrosante e na pericoronarite."
- ⚠️ **Pulpite irreversível sem antimicrobiano.** O CAB 28 (p. 192 e Figura 44) prevê pulpotomia ou pulpectomia "com o uso de antimicrobianos". O registro não reproduz isso e não cita fonte para a divergência. A omissão é clinicamente prudente, mas a regra pede fonte. Novo, na conduta: "O CAB 28 (2013) associa antimicrobiano à pulpotomia na pulpite irreversível; a indicação de antibiótico sem sinais de infecção disseminada está PENDENTE DE VERIFICAÇÃO em fonte mais recente." Assim o leitor vê a posição oficial e a pendência.
- ✅ Doses do Quadro 61: paracetamol 3-4 g/dia em 3-4 doses, máximo 4 g; criança 10-15 mg/kg a cada 4-6 h; codeína + paracetamol 1-2 comprimidos a cada 4-6 h, máximo 8/dia; ibuprofeno 200-400 mg a cada 4-6 h, máximo 3.200 mg; amoxicilina 250-500 mg 8/8 h, criança 20-50 mg/kg, máximo 2,4 g/dia; estolato de eritromicina "1-2 g, intervalo 6/12 h", criança 20-30 mg/kg em 6/12 h.
- ⚠️ A leitura "1-2 g/dia divididos" para a eritromicina é plausível, mas o quadro é ambíguo. Sugiro "1 a 2 g/dia, em tomadas a cada 6 ou 12 h (Quadro 61; conferir em bula Anvisa)". A omissão do ibuprofeno pediátrico está correta, porque o quadro é ambíguo.
- ✅ Base: corresponde à fonte. Texto próprio: 3 frases amostradas e parafraseadas.
- ✅ CID: K04.0, K04.4, K04.7 e K05.2 existem. Observação: na CID-10 da OMS, K05.2 (periodontite aguda) inclui o abscesso periodontal, então o código é apropriado e não apenas "o mais próximo". Pode-se acrescentar K04.6 (abscesso periapical com fístula). Área e especialidades conferem; não existe "Odontologia" em `especialidades.json`.

**Pontos do redator.** (1) Ver acima: a fonte oficial sustenta o antimicrobiano; o registro deve mostrar isso e marcar a pendência, não apenas omitir. (2) Concordo. (3) Interpretação plausível; conferir em bula. (4) K04.4 é apropriado. (5) K05.2 é exato (inclui o abscesso periodontal). (6) Concordo.

## 8. Pronação dolorosa — REPROVADO

- O registro não tem conteúdo clínico nem fonte. O CID S53.0 existe e é apropriado. Pela regra, não deve entrar no app enquanto estiver vazio.
- Fiz uma busca adicional (12/11/2026) e também não encontrei documento da SBP, da SBOT nem do MS. Existe uma revisão Cochrane sobre métodos de redução (CD007759; https://cochrane.org/es/CD007759/MUSKINJ_diferentes-metodos-de-manipulacion-para-la-reduccion-de-la-pronacion-dolorosa-del-codo-en-ninos), que é fonte internacional de alta qualidade e poderia servir de complemento se o autor aceitar fonte estrangeira para esse tema. O Manual MSD não é diretriz.
- Recomendação ao autor: retirar do lote, ou autorizar uma fonte internacional (Cochrane ou sociedade estrangeira) e pedir ao redator que escreva o registro de novo.

## 9. Lesões benignas da pele do recém-nascido — APROVADO COM AJUSTES

Fontes conferidas: Atenção à Saúde do RN v. 3, cap. 31 (p. 184-190); v. 1, cap. 3 (p. 61-63).

- ✅ Eritema tóxico: benigno, idiopático, RN a termo, início em 3-4 dias, poupa palmas e plantas, migra em horas; eosinófilos na biópsia; eosinofilia periférica; diferenciais; sem tratamento (v. 3, 31.4.3). Desencadeado por atrito e confundível com impetigo (v. 1).
- ⚠️ "RN em bom estado geral" não está escrito na fonte. É uma ressalva de segurança aceitável; sugiro deixá-la na conduta ("se o RN não estiver bem, pensar em infecção"), não no critério.
- ✅ Miliária: obstrução dos ductos écrinos; prematuridade, excesso de roupa, produtos oclusivos e oleosos; cristalina com vesículas de 1-2 mm sem inflamação; rubra mais frequente, pruriginosa, não folicular, pode virar pustulosa; profunda rara no RN; prevenção; corticoide tópico de baixa potência por curto período (31.4.1).
- ⚠️ Introdução da miliária: acrescentar "prematuridade" aos fatores predisponentes (31.4.1).
- ✅ Milium em 40% dos RN, pontos < 1 mm na base do nariz, queixo e fronte, por estrógeno materno, some em semanas (v. 1).
- ✅ Melanose pustular: mais frequente em negros, deixa máculas hiperpigmentadas, neutrófilos no esfregaço (31.4.4).
- ✅ Impetigo: vesículas, pústulas ou bolhas sobre base eritematosa que viram crostas em áreas úmidas e dobras; mupirocina 2% sem sinais sistêmicos, evitando os olhos; parenteral com sinais sistêmicos; hemocultura antes do antibiótico (31.4.5).
- ⚠️ Conduta: "Reavaliar se o RN tiver febre, recusa alimentar, letargia ou lesões que progridem com crostas melicéricas". A fonte fala em "manifestações sistêmicas de infecção" e "crostas amarelo-acastanhadas". Novo: "Reavaliar se houver sinais sistêmicos de infecção ou lesões que se espalham e formam crostas amarelo-acastanhadas (impetigo)."
- ✅ Prescrição: corticoide tópico e frequência da mupirocina como PENDENTE.
- ✅ Base: corresponde às fontes. Texto próprio: 3 frases amostradas e parafraseadas.
- ✅ CID: P83.1 (eritema tóxico neonatal), L74.0, L74.1 e P83.8 existem e são apropriados. Concordo com P83.8 para o milium do RN.

**Pontos do redator.** (1) Concordo. (2) Concordo. (3) Concordo.

## 10. Criança exposta à hepatite C — APROVADO COM AJUSTES

Fontes conferidas: PCDT-TV (Portaria SCTIE/MS 55/2020, PDF do portal gov.br, seção 5.7 e Figura 18); Atenção à Saúde do RN v. 2, cap. 19 (p. 145-149).

- ✅ Transmissão vertical de 5,8%, maior com viremia e coinfecção pelo HIV; testagem universal na 1ª consulta do pré-natal; desfechos de 20-40% com eliminação do vírus, 50% com infecção crônica assintomática e 30% com infecção crônica ativa (PCDT 5.7). A maioria das infecções ocorre no parto (RN v. 2, 19.1).
- ⚠️ **Contradição com a fonte mais recente.** "Não há vacina, imunoglobulina nem intervenção na gestação ou no RN que reduza a transmissão" vem do manual do RN de 2014 (19.6). O PCDT 2020 orienta evitar procedimentos invasivos, parto laborioso e ruptura de membranas por mais de 6 h para reduzir a chance de transmissão, e diz que não há via de parto preferencial.
  - Antigo: "Não há vacina, imunoglobulina nem intervenção na gestação ou no RN que reduza a transmissão."
  - Novo: "Não há vacina nem imunoglobulina, e não há via de parto preferencial; para reduzir o risco, evitar procedimentos invasivos, parto laborioso e ruptura de membranas por mais de 6 h (PCDT 2020)."
- ✅ IgG materna até 18 meses; diagnóstico molecular antes dos 18 meses; interpretação aos 18 meses; HCV-RNA aos 3-6 meses; anti-HCV aos 18 meses; notificação se o HCV-RNA for detectável; seguimento anual (AST, ALT, GGT, FA e carga viral) sem imagem de rotina; tratamento se enzimas > 1,5 x LSN, após 3 anos (genótipo 1) ou 4 anos (genótipo 3) (PCDT, Figura 18).
- ✅ Banho em água corrente na sala de parto (ou compressas e banho logo depois); aspiração gástrica; aleitamento mantido, com interrupção temporária na mama lesionada, ordenha e descarte (PCDT). Cuidado com as mucosas na aspiração (RN v. 2, 19.2).
- ⚠️ "Encaminhar a mãe para tratamento da hepatite C após a gestação e o aleitamento": o PCDT diz que o tratamento é contraindicado na gestação e que a mulher deve ser referenciada ao especialista após o parto. Não fala do aleitamento. Novo: "Encaminhar a mãe ao especialista após o parto para tratamento da hepatite C (antivirais contraindicados na gestação)."
- ⚠️ "registrar na caderneta" não está na fonte. Retirar ou citar uma fonte.
- ✅ Esquema antiviral pediátrico como PENDENTE.
- ✅ Base: corresponde à fonte. Confirmei que o PDF baixado do portal é a Portaria 55/2020. Texto próprio: 3 frases amostradas e parafraseadas.
- ✅ CID: Z20.5 e P00.2 são apropriados para a criança exposta. Concordo em não usar P35.3, que vale só para a infecção confirmada.

**Pontos do redator.** (1) Concordo; P35.3 pode aparecer no texto ("se confirmada: P35.3"), mas não no campo `cid` de exposição. (2) Prevalece o PCDT (mais recente e oficial). (3) O arquivo servido hoje pelo portal é o da Portaria 55/2020 (o mesmo que conferi); não verifiquei se há edição posterior. (4) Concordo.

---

## Segunda conferência (12/11/2026)

**Como conferi.** Comparei, frase por frase, `curadoria/lote-01.json` com a versão anterior (`lote-01.antes.json`, no scratchpad) usando um script de diff. Conferi de novo, contra a fonte, cada trecho que mudou. `node curadoria/checar_lote.js curadoria/lote-01.json` → "Lote 01: 9 registros … OK: JSON válido, campos, áreas, especialidades, Base e CID conferidos". Os avisos são só de CID compartilhado, como antes. A pronação dolorosa foi retirada. Fora as mudanças listadas abaixo, nenhum campo mudou.

**Trechos que mudaram, conferidos de novo:**
- **Sepse.**
  - Cristaloide 20 mL/kg nas primeiras 3 h com meta de PAM > 65 mmHg e oxigênio no pacote da 1ª hora: ✅ confere com a Figura 3 do cap. 38 (MS 2022, p. 384), que é a figura que extraí e li. O 30 mL/kg ficou só como menção às fontes não específicas: ✅.
  - qSOFA com FR ≥ 22, PAS ≤ 100 e Glasgow < 15: ✅ (Sepsis-3; o Glasgow < 15 também está na Fiocruz).
  - Choque séptico com vasopressor **e** lactato > 2 apesar de volume adequado: ✅ (Sepsis-3, referência do cap. 38).
  - "Vitalidade fetal" retirada: ✅. Frase literal reescrita: ✅. Duração da ceftriaxona como PENDENTE: ✅. Base cita a fig. 3: ✅.
- **Bronquite.**
  - Sinais de gravidade em dois níveis, com FR > 25 e comorbidades: ✅ confere com o fluxograma da Anvisa/CAMO-Net (p. 14). "Conduzir como possível pneumonia" é paráfrase aceitável de "radiografia de tórax se possível e antimicrobiano conforme a tabela de PAC".
  - "Hemograma e PCR" retirado: ✅.
  - Na gestação, não usar doxiciclina e preferir eritromicina se precisar de macrolídeo: ✅ (NICE NG120, Tabela 1).
  - Broncodilatador com as duas fontes nomeadas: ✅.
- **Urgências odontológicas.**
  - Conduta mostra o antimicrobiano junto à pulpotomia previsto pelo CAB 28 (p. 192 e Figura 44) e marca PENDENTE para a indicação sem disseminação: ✅.
  - Eritromicina "1 a 2 g/dia, em tomadas a cada 6 ou 12 h (Quadro 61; conferir em bula)": ✅ fiel ao Quadro 61.
  - "Exames de imagem e laboratório" trocado por SAMU: ✅. Radiografia periapical retirada: ✅. Clorexidina restrita à doença necrosante e à pericoronarite: ✅. Endopério: ✅.
- **Demais ajustes** (hipertensão: manguito e exames; EHAG: etiologia, biópsia, incisão vertical, frase reescrita; covid/influenza: janela do oseltamivir, pesquisa viral, quimioprofilaxia, ceftriaxona; resfriado: dexclorfeniramina retirada, "de rotina", frequência do soro, introdução; RN: prematuridade, "bom estado geral" movido para a conduta, sinais de reavaliação; hepatite C: intervenções do PCDT 2020, encaminhamento da mãe, "caderneta" retirada). Todos correspondem exatamente ao texto pedido na primeira revisão. Nenhuma afirmação nova sem fonte foi acrescentada. A frase "Se o RN não estiver bem, pensar em infecção" é a ressalva de segurança que eu mesmo sugeri; está coerente com o 31.4.5 e não traz dose nem critério novo.
- **Ressalvas que continuam** (não impedem a aprovação):
  - Sepse: "exames de imagem conforme o foco" é coerente com o controle do foco do 38.3.
  - EHAG: "corrigir hipoglicemia" fica sem detalhe na fonte; a dose está como PENDENTE.
  - Odontologia: os gatilhos para acionar o SAMU estão na Figura 45 (imagem), que o autor deve conferir.
  - Hipertensão: falta uma vírgula em "na altura do coração e mais de uma medida"; é só redação.

### Tabela final

| # | Registro | Veredito | Motivo |
|---|---|---|---|
| 1 | Hipertensão gestacional | APROVADO | Doses, metas e critérios conferem com o MS 2022, cap. 11; exames atribuídos à seção certa |
| 2 | Sepse na gestação (sepse materna) | APROVADO | Volume (20 mL/kg em 3 h), oxigênio, qSOFA e choque séptico conferem com a fig. 3 do cap. 38 e a Sepsis-3; nada sem fonte |
| 3 | Esteatose hepática aguda da gravidez | APROVADO | Frase da biópsia sem fonte trocada pelo que o manual diz; etiologia corrigida |
| 4 | Covid-19 e influenza na gestação e no puerpério | APROVADO | Doses conferem; janela do oseltamivir e quimioprofilaxia seguem o Guia de Influenza 2023 |
| 5 | Resfriado comum (nasofaringite aguda) | APROVADO | Dexclorfeniramina retirada (vale o MS); restante confere com o CAB 28 e a SBPT |
| 6 | Bronquite aguda (traqueobronquite aguda) | APROVADO | Sinais de gravidade fiéis à Anvisa; "hemograma e PCR" retirado; doses do NICE conferem |
| 7 | Urgências odontológicas na APS | APROVADO | Posição do CAB 28 sobre a pulpite irreversível exposta com PENDENTE; eritromicina fiel ao Quadro 61; exames sem fonte retirados |
| 8 | Lesões benignas da pele do RN | APROVADO | Confere com o MS 2014 (v. 1 cap. 3; v. 3 cap. 31) |
| 9 | Criança exposta à hepatite C | APROVADO | Confere com o PCDT 2020, incluindo as medidas para reduzir a transmissão |
| — | Pronação dolorosa | RETIRADO do lote | Sem fonte; fica fora até o autor decidir sobre fonte estrangeira |
