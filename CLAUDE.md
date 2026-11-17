# Blue Book — guia curto do projeto

App médico de consulta (doenças, CID-10, condutas, prescrições, medicamentos), em português do Brasil.
Detalhe técnico (estrutura, build, testes, módulos): `docs/GUIA_TECNICO.md`. Visual: `docs/DESIGN.md`.

## Objetivo
Funcionar online e offline, instalável no computador e no celular, com atualização automática, código no
GitHub e publicação gratuita. O conteúdo está pronto e **não muda** sem pedido explícito do autor.

**Pronto quando:** (1) abrir sem internet, buscar um medicamento e ver a ficha completa; (2) uma alteração de
conteúdo aparecer no app instalado após reconectar; (3) app publicado e endereço informado.

## Como o app deve se comportar (decidido pelo autor em 11/11/2026)
- Acesso: login no aparelho (cada pessoa cria o próprio acesso). Uso: público em geral.
- Dados pessoais (favoritos, anotações etc.): sincronizam sozinhos entre os aparelhos da mesma conta.
- Atualização: aviso "Nova versão disponível · Atualizar"; nunca recarrega no meio do uso.

## Decisões técnicas (uma linha cada; o gerente decide e registra aqui)
- Hospedagem: GitHub Pages, publicado pelo GitHub Actions a cada push na `main` → https://vitorlrocha.github.io/bluebook/
- Repositório: `vitorlrocha/bluebook` (público); commits com o e-mail privado do GitHub.
- App: PWA de arquivo único (`dist/index.html`), sem framework e sem dependência externa para o uso clínico.
- Offline e atualização: service worker + `src/atualiza.js`; versão em `package.json`, publicada em `versao.json`.
- Banco na nuvem: Firebase (plano gratuito Spark) — Authentication (e-mail/senha e Google) + Cloud Firestore em São Paulo; escolhido porque não pausa por inatividade e o autor já tem conta Google.
- Nuvem sem SDK: o app fala com o Firebase por chamadas REST (sem biblioteca externa), para continuar em arquivo único.
- Modelo de dados na nuvem: um documento por usuário (`usuarios/<uid>`), com um campo por registro; menos leituras e gravações (cabe no plano gratuito com uso público).
- Conflito de sincronização: vale a alteração mais recente de cada registro; anotação editada em dois aparelhos sem internet guarda as duas versões; exclusão é marcada, não apagada.
- Configuração da nuvem: variáveis de ambiente (`.env` local, fora do git; "Repository variables" no GitHub); só identificadores públicos; regras de acesso em `firestore.rules`.
- Login: conta do Firebase; o aparelho guarda só o hash da senha para abrir sem internet.
- Backup no Google Drive: mantido como opcional (pede a permissão do Drive só quando a pessoa liga o backup).
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

## Estado atual (17/11/2026)
- No ar: versão 0.74.0 — offline, instalável, atualização automática com aviso, login local, Google e backup no Drive,
  busca única em todo o app, acervo ampliado e doses pediátricas conferidas com bulas.
- Em andamento: banco na nuvem (Firebase) com sincronização automática; ainda não publicado.
  - Firebase configurado no projeto `nimble-lead-514122-e4`: login por e-mail/senha e Google ativados, domínio
    `vitorlrocha.github.io` autorizado, Firestore criado em `southamerica-east1` (São Paulo), modo de produção
    (tudo negado até publicar `firestore.rules`), app Web "Bluebook" registrado.
  - `src/nuvem.js` pronto e testado. Falta: publicar as regras definitivas no console;
    cadastrar `BB_FIREBASE_API_KEY` e `BB_FIREBASE_PROJECT_ID` como "Repository variables" no GitHub e passar
    essas variáveis ao passo de build do workflow (a chave é colada pelo autor: a ferramenta do navegador não a lê).
- Pendente do autor: revisão clínica (`REVISAO_CLINICA.md`, propostas em `docs/PROPOSTAS_P1.md`), teste num iPhone real.
- Acervo ampliado (13/11/2026): +149 doenças dos lotes 01–17 revisados (campo `orig`), integradas por `ferramentas/integrar_lote.js`.
- Calculadora pediátrica (17/11/2026): 96 de 97 vias com conferência registrada (`rev`); 11 corrigidas com bula
  (cefaclor, bromoprida gotas/injetável, hioscina, cetoprofeno injetável sem dose pediátrica, dexclorfeniramina por idade,
  domperidona, pirvínio, racecadotrila, espironolactona). Falta captopril (fonte primária não aberta).
- Contagens: 3.375 doenças (3.226 originais + 149 novas) · 1.851 medicamentos · CID-10 com 2.045 categorias e 12.451 subcategorias.
