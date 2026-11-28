# Blue Book — guia curto do projeto

App médico de consulta (doenças, CID-10, condutas, prescrições, medicamentos), em português do Brasil.
Guia principal do autor: `BLUEBOOK-GUIA.md` (prevalece; regras contra regressão na Parte 6).
Detalhe técnico (estrutura, build, testes, módulos): `docs/GUIA_TECNICO.md`. Visual: `docs/DESIGN.md`. Publicar: `docs/PUBLICAR.md`.

## Objetivo
Funcionar online e offline, instalável no computador e no celular, com atualização automática, código no
GitHub e publicação gratuita. O conteúdo está pronto e **não muda** sem pedido explícito do autor.

**Pronto quando:** (1) abrir sem internet, buscar um medicamento e ver a ficha completa; (2) uma alteração de
conteúdo aparecer no app instalado após reconectar; (3) app publicado e endereço informado.

## Como o app deve se comportar (decidido pelo autor em 11/11/2026)
- Acesso: login no aparelho (cada pessoa cria o próprio acesso). Uso: público em geral.
- App estático e offline (decidido pelo autor em 18/11/2026): dados clínicos embutidos no app; favoritos, anotações,
  histórico e ajustes só no aparelho (localStorage). Backup por arquivo: menu ⋮ → Exportar / Importar meus dados.
- Sem Firebase, sem banco de dados externo, sem serviço pago e sem login novo sem perguntar antes ao autor.
- Atualização: aviso "Nova versão disponível · Atualizar"; nunca recarrega no meio do uso.

## Decisões técnicas (uma linha cada; o gerente decide e registra aqui)
- Hospedagem: GitHub Pages, publicado pelo GitHub Actions a cada push na `main` → https://vitorlrocha.github.io/bluebook/
- Repositório: `vitorlrocha/bluebook` (público); commits com o e-mail privado do GitHub.
- App: PWA de arquivo único (`dist/index.html`), sem framework e sem dependência externa para o uso clínico.
- Offline e atualização: service worker + `src/atualiza.js`; versão em `package.json`, publicada em `versao.json`.
- Firebase removido a pedido do autor (18/11/2026): saíram `src/nuvem.js`, `firestore.rules`, `.env.exemplo`, a seção
  Sincronização/Excluir conta de Ajustes e as variáveis do build; login e Google voltaram ao comportamento local da v73.
- Login: só no aparelho; o aparelho guarda só o hash da senha (abre sem internet).
- Privacidade (LGPD): página própria `privacidade.html` (política + termos, também offline), link em Ajustes → Sobre e na tela de entrada.
- Prioridade 1 da revisão clínica (17/11/2026): diazepam retal com teto de 20 mg na calculadora (AES 2016 e rótulo FDA, igual ao Plantão); dexametasona IM/EV com teto de 10 mg/dose (documento de origem); captopril e hidrocortisona do Plantão ficam PENDENTE de fonte brasileira.
- Backup no Google Drive: mantido como opcional (pede a permissão do Drive só quando a pessoa liga o backup).
- Medicamentos novos: lote `curadoria/meds-lote-NN.json` escrito a partir da bula ou documento oficial aberto (URL em `fontes`, "Fonte:" nas observações), integrado por `ferramentas/integrar_meds.js` no fim de `seed_meds.json` com `orig` (selo "Literatura · não conferido"); os 1.851 originais não mudam.
- Selo das doenças novas: "Literatura · não conferido"; se a ficha tiver PENDENTE DE VERIFICAÇÃO, prevalece "⚠ Pendente" (mais cauteloso).
- Ampliação do acervo: pipeline mapeador → redator → revisor de fontes → aprovação do autor por lote → integração (`docs/ESTRATEGIA_ACERVO.md`; rascunhos em `curadoria/`).
- Equipe: agentes excluídos a pedido do autor (17/11/2026); o trabalho é feito direto na sessão, com as mesmas verificações antes de publicar.

## Regras que não podem ser quebradas
- Nunca inventar doses, códigos CID ou referências; na dúvida, "PENDENTE DE VERIFICAÇÃO". Não alterar `dados/` sem pedido do autor.
- Nenhuma mudança visual pode esconder ou remover uma função existente sem aviso explícito ao autor
  (conferido por `testes/regressao_funcoes.ambos.spec.js`, no computador a 1366 px e no celular a 390 px).
- Não recriar botões de editar, excluir ou novo medicamento. Não usar marca, texto ou layout de outros apps.
- Nunca enviar senhas ou chaves secretas ao GitHub. Ficar sempre em planos gratuitos. Não apagar conteúdo nem dados.
- Não afirmar que algo passou sem executar o teste.

## Verificações antes de publicar
`node ferramentas/build.js` · `node ferramentas/checar_sintaxe.js` · `py ferramentas/validar_cid.py` (imprime `[]`) ·
`node ferramentas/testar_build.js` · `npm run relatorios:checar` · `npx playwright test` (computador, celular, iPhone).
O git fica em `%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`.

## Testes sem travar o computador (decidido pelo autor em 17/11/2026)
- Pasta do projeto: `C:\Users\vlprl\Projetos\bluebook` (fora do OneDrive: a sincronização de `node_modules` e das
  gravações dos testes, somada a muitos navegadores, deixava o processador em 100%).
- No máximo 2 navegadores em paralelo no computador (`workers: 2` no `playwright.config.js`; no GitHub fica o padrão).
- Rodar só os testes ligados ao que mudou; a bateria completa só antes de publicar. Projeto `iphone` (WebKit) só quando necessário.
- Gravações (trace) só das falhas (`retain-on-failure`); sem vídeo.
- Ao terminar qualquer tarefa, encerrar tudo o que foi aberto: testes, `servir.js` e navegadores.
- Não usar agentes (subagentes) sem pedido do autor.

## Estado atual (18/11/2026)
- No ar: versão 0.93.0 — offline, instalável, atualização automática com aviso, login local, Google e backup no Drive,
  busca única em todo o app, acervo ampliado, doses pediátricas conferidas com bulas, política de privacidade.
- Pendente do autor: revisão clínica (`REVISAO_CLINICA.md`, propostas em `docs/PROPOSTAS_P1.md`), teste num iPhone real.
- Acervo ampliado (13/11/2026): +149 doenças dos lotes 01–17 revisados (campo `orig`), integradas por `ferramentas/integrar_lote.js`.
- Calculadora pediátrica (17/11/2026): 96 de 97 vias com conferência registrada (`rev`); 11 corrigidas com bula
  (cefaclor, bromoprida gotas/injetável, hioscina, cetoprofeno injetável sem dose pediátrica, dexclorfeniramina por idade,
  domperidona, pirvínio, racecadotrila, espironolactona). Falta captopril (fonte primária não aberta).
- Prioridade 3 (calculadora pediátrica dos mais usados), lote 01 (18/11/2026): +4 medicamentos (midazolam, levetiracetam,
  cetirizina, penicilina V) em `curadoria/ped-lote-01.js`, cada um com bula/resumo oficial. Lote 02: +4 (cefadroxila,
  fentanil, cetamina, naloxona) por rótulo FDA/DailyMed em `curadoria/ped-lote-02.js`; campo `nao` exclui formas com o mesmo
  começo de nome (adesivo de fentanil, escetamina). Lote 03: +5 (ceftazidima, amicacina, piperacilina-tazobactam,
  eritromicina, flumazenil) por rótulo FDA. Lote 04: +6 (cefepima, cefotaxima, montelucaste, oxcarbazepina, topiramato,
  valaciclovir) e via EV da cefuroxima. Concentrações após reconstituir só quando o rótulo traz. Lote 05: +3 (linezolida, esomeprazol por
  peso/idade, budesonida nebulização). Lote 06 (lote grande, 18 inclusões): enalapril, acetazolamida,
  griseofulvina, clobazam, pantoprazol EV, ciprofloxacino, difenidramina, levocetirizina, levotiroxina, loperamida, sertralina,
  anlodipino, fitomenadiona, metilfenidato, fluticasona nasal, digoxina, imipenem-cilastatina e fenitoína oral. Lotes 07 (61) e 08 (20), rótulos FDA do DailyMed com setid no campo rev: antirretrovirais, anticonvulsivantes, psiquiatria, bloqueadores neuromusculares, surfactantes, anti-hipertensivos, antiparasitários e outros; teto ausente no rótulo = PENDENTE. Lote 09 (65): biológicos, antifúngicos, anticonvulsivantes raros, estatinas, bloqueadores neuromusculares e outros; intervalo semanal ou maior fica como texto fixo. PED_DB com 262.
- Prioridade 4 (calculadoras clínicas), lote 01 (25/11/2026, curadoria/calcs-lote-01.js): +23 fórmulas com referência (Schwartz, Holliday-Segar, Parkland/ATLS, Ganzoni, Adrogué-Madias, PAM, FENa/FEUr, gradiente A-a, Winter, Friedewald, FIB-4, HOMA-IR, VIG, idade corrigida, peso ajustado, ClCr 24 h, IPR, Light, Mentzer, glicemia média pela HbA1c, saturação da transferrina, delta gap, fenitoína corrigida). CALCS com 39. testar_build aceita calculadoras novas só no fim e com fórmula e referência; testes/regressao.spec.js ignora as novas ao comparar com a v71. Teste: testes/formulas.spec.js.
- Prioridade 4, escores lote 01 (25/11/2026, curadoria/escores-lote-01.js): +20 escores com referência (RCRI, STOP-Bang, Rockall, AIMS65, Ranson, sPESI, Khorana, ICH, RASS, Rankin modificada, Killip, mMRC, SIRS, NEXUS, PRAM, FLACC, NIPS, Capurro somático, PAS de Samuel, CIWA-Ar). SCORES com 60. testar_build e a regressão contra a v71 tratam escores novos como as calculadoras novas. Teste: testes/escores_novos.spec.js.
- Revisão clínica P1 (26/11/2026, curadoria/revisao-p1-2611.js, decisões do autor): campo Pediatria de Etossuximida, Rufinamida, Estiripentol, Felbamato e Sulfadiazina (oral) era texto de outro remédio → trocado pelo rótulo FDA (CORRECOES em testar_build); hidroxizina com teto por idade (< 6 anos 50 mg/dia); prednisolona/prednisona na asma com teto GINA 40 mg (< 2 anos 20 mg); 11 formas tópicas (colírio, creme, gel, pomada, loção) deixaram de herdar a dose sistêmica (campo nao). 7 diferenças esperadas ficam em ferramentas/revisao_conferidas.json (saem da prioridade; voltam se o dado mudar). Prioridade 1 = 0.
- Revisão P2 de faixas (26/11/2026, curadoria/revisao-p2-2611.js): campo Pediatria de Oxcarbazepina, Nifurtimox, Benznidazol, Domperidona, Cetoprofeno, Clorpromazina e Lincomicina trocado pela bula/rótulo (alertas não relacionados a dose mantidos); ampicilina ganhou via "EV (meningite)" 300-400 mg/kg/dia (máx. 12 g). Mais 12 diferenças esperadas em revisao_conferidas.json (19 no total). Faltam fonte: hidrocortisona na anafilaxia (ficha 2-4 × calculadora 4-8 mg/kg) e cefotaxima 200-300 mg/kg/dia na febre sem sinais.
- PENDENTES de dose nas prescrições (26/11/2026, curadoria/pendentes-presc-01.js): 6 resolvidos com rótulo FDA da mesma indicação (doxiciclina EV no tifo, via IM da medroxiprogesterona, via oral da dimeticona, piridostigmina na miastenia, varfarina inicial, mupirocina no impetigo do RN). A maioria dos restantes é "a fonte da doença não traz a dose" e precisa de diretriz brasileira específica. Sem fonte pediátrica ainda: morfina, sulfato de magnésio.
- PENDENTES nas prescrições, lote 02 (26/11/2026, curadoria/pendentes-presc-02.js): 16 trechos resolvidos com diretriz brasileira lida no PDF — SAMU 192 SAV 2ª ed. 2016 (AC7, AC10, AC37, AT4, APed26, APed30, APed31, ATox 3, 4, 7, 8, 11), PCDT Hanseníase 2022 (10.1.2), Manual LT 2017 (6.2.5), Manual TB 2019 (8.2, 8.6) e Atenção à Saúde do RN 2014 (v. 2 cap. 14.2.1; v. 3 cap. 23.5). Novas diferenças esperadas no relatório: ampicilina e amicacina neonatais (dose do RN, não da criança), ainda não marcadas como conferidas.
- PENDENTES nas prescrições, lote 03 (27/11/2026, curadoria/pendentes-presc-03.js): analgésico e anti-inflamatório de 5 fichas odontológicas pelo Quadro 61 do CAB 28 v. II (2013), sem escolher antibiótico, miorrelaxante ou gel onde a fonte não especifica; benznidazol na gestação pelo PCDT de Chagas 2018. Ampicilina e amicacina neonatais marcadas como conferidas (21 em revisao_conferidas.json).
- PENDENTES nas prescrições, lote 04 (27/11/2026, curadoria/pendentes-presc-04.js; decisão do autor "1 + 2"): 32 trechos. Dose do Formulário Terapêutico Nacional 2010 (MS/Rename) quando a monografia traz a mesma indicação ou a classe já citada (ampicilina/gentamicina na listeriose, glicose 50%, misoprostol, nistatina, ibuprofeno, sulfato ferroso, salbutamol, dexclorfeniramina/loratadina, clorexidina 0,12%, omeprazol); senão, remissão à ficha do app ("ver a ficha X deste app"), sem copiar dose. O script confere que cada ficha citada existe.
- PENDENTES nas prescrições, lote 05 (27/11/2026, curadoria/pendentes-presc-05.js): 9 trechos — prednisona na miastenia (PCDT MG 2022), ácido tricloroacético 80-90% no condiloma na gestação (PCDT IST 2022), BCG 0,1 mL ID e hepatite B 0-1-6 meses (Manual de Vacinação 2024), remissões às fichas na sepse materna e na hipermagnesemia do RN e ao registro Desnutrição grave (SAM). P2 = 117; o restante é quase todo exame sem periodicidade, notificação, conduta de especialista ou escolha de fármaco que a fonte não faz.
- Revisão P2 de faixas (27/11/2026, curadoria/revisao-p2-2711.js, decisão do autor): hidrocortisona injetável na anafilaxia pediátrica — ficha e calculadora pelo SAMU SAV 2016 APed26 (5-10 mg/kg/dose, máx. 250 mg; faixa FDA/AAP 4-8 vira observação); 'Hidrocortisona (injetável)' entrou em CORRECOES.SEED_MEDS. Cefotaxima 200-300 mg/kg/dia na meningite do RN marcada como conferida (22 em revisao_conferidas.json). Lista de todas as fontes da revisão: docs/FONTES_REVISAO_2611.md.
- Contagens: 3.375 doenças (3.226 originais + 149 novas) · 1.856 medicamentos (1.851 originais + 5 novos) · CID-10 com 2.045 categorias e 12.451 subcategorias.
