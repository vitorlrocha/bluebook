# Bluebook — Roadmap

Atualizado em 08/11/2026 (v72). Cada etapa termina com as verificações do `CLAUDE.md` e espera o "PRÓXIMO".

## Onde estamos

| Área | Estado |
|---|---|
| Conteúdo | 3.226 doenças, 1.851 medicamentos, CID-10 completo (2.045 categorias, 12.451 subcategorias), 12 protocolos de plantão, 40 escores, 16 calculadoras e mais 10 ferramentas na janela "Ferramentas" |
| Código | Dados em `dados/*.json`, código em `src/`, build sem dependências que gera `dist/index.html` |
| Offline / PWA | Instalável (manifest, ícones, service worker). Testado no Chromium; **iPhone/Safari ainda não testado** |
| Testes | ~200 testes Playwright (computador e celular): busca, CID, plantão, dose pediátrica, navegação, PWA, acessibilidade (axe, WCAG 2.1 AA), regressão contra a v71, capturas de tela, design (`docs/DESIGN.md`) e uso real |
| Design | Especificação em [`docs/DESIGN.md`](docs/DESIGN.md), conferida por `testes/design.ambos.spec.js` |

### Já feito na v72
1. Separação de dados e código, build e testes de equivalência com a v71.
2. Testes de ponta a ponta (Playwright).
3. PWA instalável e offline.
4. CSS consolidado, código morto removido, busca até 8× mais rápida e acessibilidade (axe com 0 violações).
5. **Etapa R1 (este roadmap):**
   - Varredura de todos os 7.355 itens nas 12 seções, no computador e no celular.
   - Varredura com entradas: 12 protocolos × 10 pesos, 1.790 combinações da dose pediátrica, 40 escores, 16 calculadoras e 10 ferramentas.
   - Correções feitas:
     - ranking de "AAS";
     - destaque de "Remédios" na barra do celular;
     - função renal com idade impossível dava clearance negativo;
     - textos menores que 12 px (DESIGN §9);
     - aviso legal ausente no celular, agora em Ajustes (DESIGN §7);
     - janela "Ferramentas" inacessível desde a v71.

## Próximas etapas (na ordem combinada)

| Etapa | O quê | Observações |
|---|---|---|
| **2. Login local** | Tela inicial com e-mail e senha. Você cadastra a própria senha. Os favoritos, anotações, recentes, peso do plantão e ajustes atuais passam a pertencer a seu e-mail | Só no aparelho, offline. A senha é guardada como hash (PBKDF2, WebCrypto), nunca em texto. É uma trava de acesso, não criptografia forte: quem tiver o arquivo lê o conteúdo clínico, que é público de qualquer forma |
| **3. Pendências e inconsistências** | `PENDENCIAS.md` com os 31 registros "PENDENTE DE VERIFICAÇÃO" (campo e trecho). Relatório de divergências entre a ficha, a prescrição da doença e a calculadora pediátrica | Nada é preenchido sem fonte. Nenhuma dose é alterada automaticamente |
| **4. Publicação e README** | GitHub Pages (ou Netlify) a partir de `dist/`. README em português com uso, build, testes, publicação e aviso legal | Você cria a conta ou repositório e eu preparo tudo para publicar |
| **5. Entrar com o Google** | Botão "Entrar com o Google" que confirma que o e-mail é seu e-mail | Exige o app publicado em https e uma credencial OAuth gratuita criada por você no Google Cloud. Funciona só com internet; o login por senha continua offline |

## O que falta (backlog, sem etapa definida)

**Importante para o uso clínico**
- 31 fichas com "PENDENTE DE VERIFICAÇÃO" (Etapa 3).
- Teste de instalação e uso offline num iPhone real (Safari: "Adicionar à Tela de Início"). Não dá para simular aqui.
- O backup (Ajustes → Exportar) leva só os medicamentos. Anotações, favoritos e recentes ficam de fora; resolver junto com o login (Etapa 2).

**Desempenho**
- No celular simulado 4× mais lento, a 1ª e a 2ª letra da busca levam até cerca de 370 ms, porque desenham cerca de 1.800 itens. Solução: lista virtualizada ou carregar mais ao rolar. Muda a interface, por isso precisa da sua aprovação.

**Interface**
- Existem duas coisas chamadas "calculadora": a aba "Calculadoras" (16 itens) e a janela "Ferramentas" (10 itens). Algumas se sobrepõem (IMC e função renal). Vale unificar no futuro.
- Áreas de toque de 44 px: conferidas na barra inferior. As estrelas e chips do celular ainda não foram medidas.

**Opcional**
- Empacotar para as lojas (Play Store via TWA; App Store exige conta de desenvolvedor paga).
- Sincronizar entre aparelhos. Você escolheu "só no aparelho", então só se mudar de ideia.

## Limites conhecidos (por desenho)
- O app não tem servidor. Tudo fica no navegador do aparelho (localStorage), e limpar os dados do navegador apaga favoritos e anotações. O backup é a proteção.
- O conteúdo é de apoio. Não substitui o julgamento clínico nem a bula (aviso no rodapé e em Ajustes).
