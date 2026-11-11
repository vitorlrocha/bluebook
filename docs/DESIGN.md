# Bluebook — Especificação de design e layout

Documento para o Claude Code manter e evoluir o visual do app sem perder a identidade atual.
**Versão de referência:** v71 (novembro de 2026), atualizado para a **v72**. Em caso de dúvida, a referência visual
são as capturas de `testes/visual.ambos.spec.js-snapshots/` (v72). A v71 original fica em `referencia/`.

> **Mudanças da v72 em relação à v71** (já refletidas abaixo):
> - **Contraste AA:**
>   - `--ink-faint` no claro passou de `#8A8A8E` para `#6E6E73`.
>   - Novos tokens: `--muted`, `--accent-fill`, `--c-red-ink`, `--c-red-fill`, `--warn-ink` e `--bad-ink` (camada 3 de `src/styles.css`).
>   - O subtítulo do item selecionado passou de 85% para 95% de branco.
> - **Foco visível:** contorno de 2 px em `--accent` em todos os controles, quando navegados pelo teclado.
> - **Painel de calculadoras** (`openCalcModal`): botão "Calculadoras" (`#calc-btn`) no cabeçalho do computador;
>   atalhos "Calculadoras" e "Idade gestacional" (`openCalcTab("ga")`) na página inicial; na folha "Mais":
>   "Calculadoras (IG, pediátrica, renal…)", "Idade gestacional (DUM/USG)" e "Fórmulas clínicas (lista)" (= REFS.calc).
> - **Página inicial:** frase original do app (`.home-tag`) abaixo do título; no celular, aviso legal no fim (`.home-legal`).
> - **Filtro de classe:** optgroups "Grupos terapêuticos" e "Classes detalhadas".
> - **`<select>`:** herda a cor do texto, porque no escuro ficava preto sobre preto.

---

## 1. Princípios

1. **Inspiração no iOS, sem copiar marcas.** Seguir as convenções de interface do iPhone: títulos grandes, listas agrupadas com cantos arredondados, barra de abas inferior translúcida e folhas que sobem de baixo. Não usar logotipos, cores de marca, textos nem layouts proprietários de outros apps (Whitebook, iClinic etc.).
2. **Uso clínico rápido.** No máximo 2 toques até a informação; a busca universal sempre visível; o Plantão (emergência) sempre a um toque, em vermelho.
3. **Legibilidade em primeiro lugar.** Textos grandes (corpo de 16 px com zoom padrão de 115%), contraste alto e nada de cinza-claro sobre branco em texto clínico.
4. **Funcionar offline.** Sem fontes, ícones ou scripts externos: fonte do sistema e ícones SVG embutidos.
5. **Modo claro e escuro**, seguindo o sistema do aparelho.

---

## 2. Cores (tokens CSS em `:root`)

### Modo claro
| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#F2F2F7` | Fundo geral (cinza agrupado do iOS) |
| `--surface` | `#FFFFFF` | Cartões, linhas de lista, campos |
| `--ink` | `#1C1C1E` | Texto principal |
| `--ink-soft` | `#5B5B60` | Texto secundário |
| `--ink-faint` | `#6E6E73` (v72; era `#8A8A8E`, contraste 3,4:1) | Legendas, rótulos de seção, ícones inativos |
| `--accent` | `#0A66D8` | Cor principal: links, seleção, item ativo |
| `--accent-deep` | `#0A4FA8` | Texto em fundo `--accent-soft` |
| `--accent-soft` | `#E6F0FD` | Fundo de etiquetas e foco |
| `--border` | `#E3E3E8` | Separadores de linha |
| `--danger` | `#A13A33` | Alertas clínicos (texto) |
| `--ok` / `--ok-soft` | `#22673F` / `#E4F2E9` | Selo "Revisado"/"Fonte oficial" |

### Modo escuro
| Token | Valor |
|---|---|
| `--paper` | `#000000` |
| `--surface` | `#1C1C1E` |
| `--ink` | `#F2F2F7` |
| `--ink-soft` | `#AEAEB2` |
| `--ink-faint` | `#8E8E93` |
| `--accent` | `#3D9BFF` |
| `--accent-deep` | `#7DBAFF` |
| `--accent-soft` | `#0E2742` |
| `--border` | `#2E2E32` |
| `--ok` / `--ok-soft` | `#86CFA0` / `#173326` |
| sombras | nenhuma (`--shadow: none`) |

### Tokens de contraste (v72, camada 3 de `src/styles.css`)
| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--muted` | `#6E6E73` | `#98989D` | Textos secundários das regras originais |
| `--accent-fill` | = `--accent` | `#0A6EE0` | Fundos azuis com texto branco (botões, item ativo, chip ativo) |
| `--c-red-ink` | `#D70015` | `#E5484D` | Texto vermelho do Plantão (aba e barra inferior) |
| `--c-red-fill` | `#D70015` | `#D70015` | Fundo vermelho com texto branco (aba Plantão ativa) |
| `--warn-ink` | `#985F00` | `#E5A23A` | Texto de alerta moderado (escores, interações) |
| `--bad-ink` | `#B3261E` | `#FF7A70` | Texto de alerta grave |

O modo escuro é aplicado por `@media (prefers-color-scheme: dark)` com `:root:not([data-theme="light"])` e também por `:root[data-theme="dark"]`.

### Cores dos ícones (quadrados coloridos, estilo Ajustes do iPhone)
| Token | Valor | Seção |
|---|---|---|
| `--c-red` | `#E5484D` | Plantão, ECG |
| `--c-blue` | `#0A84FF` | Doenças, Vacinas |
| `--c-orange` | `#F59E0B` | Calculadoras |
| `--c-purple` | `#8B5CF6` | Escores |
| `--c-gray` | `#8E8E93` | CID-10, Tamanho do texto |
| `--c-green` | `#22A55A` | Antibióticos |
| `--c-teal` | `#14B8A6` | Fluxogramas |
| `--c-indigo` | `#5E5CE6` | Laboratório |
| `--c-pink` | `#EC4899` | Prescrição |

---

## 3. Tipografia

- **Família:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No iPhone e no Mac aparece a fonte do sistema da Apple, e nos outros aparelhos a equivalente. **Não carregar fontes da internet.**
- **Títulos:** a mesma família, peso 700, `letter-spacing` negativo (−0,02 a −0,03em).
- Corpo com `letter-spacing: -0.01em`.

| Elemento | Tamanho | Peso |
|---|---|---|
| Título da página inicial ("Bluebook") | 34 px | 700 |
| Título da ficha (nome da doença/medicamento) | 30 px (28 px no celular) | 700 |
| Marca no cabeçalho | 24 px (28 px no celular) | 700 |
| Título de seção da folha "Mais" e da cobertura | 20 px | 700 |
| Corpo / texto das seções | 15,5–16 px | 400 |
| Linha de lista (nome) | 16 px | 400 |
| Subtítulo da linha (classe/área) | 13 px | 400, `--ink-faint` |
| Rótulo de seção (INTRODUÇÃO, POSOLOGIA…) | 12,5 px, MAIÚSCULAS, espaçamento 0,04em | 600, `--ink-faint` |
| Rótulo de grupo da lista (A, B… / RESULTADOS) | 12,5 px | 600, `--ink-faint` |
| Etiquetas (badges) | 12,5 px | 600 |
| Barra de abas inferior (rótulo) | 10,5 px | 600 |

### Tamanho do texto (zoom da interface)
- A interface inteira usa `zoom` no elemento raiz. Padrão: **115%**. Níveis: 100%, 115%, 130%, 145%.
- Botão **Aa** no cabeçalho (no celular: "Mais" → "Tamanho do texto") alterna os níveis.
- A escolha é salva em `localStorage` com a chave `bluebook:zoom` e aplicada por um `<script>` logo após `<body>`, antes de desenhar a tela, para não piscar.

---

## 4. Formas, espaçamento e sombras

- **Raio:** cartões e seções `14px` (`--radius`); listas, campos e botões `12px`; etiquetas `8px`; abas e chips em pílula `999px`; ícones coloridos `10px` (38 px) ou `8px` (30 px).
- **Sombra (modo claro):** `0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.05)`. No modo escuro não há sombra.
- **Separadores:** não usar bordas em volta dos cartões. Linhas de lista separadas por `box-shadow: inset 0 -1px 0 var(--border)`.
- **Espaçamento:** seções com `padding: 16px 18px` e 14 px entre elas; linhas de lista com `padding: 12px 16px`; página com margens laterais de 16 px (14 px no celular).

---

## 5. Componentes

### 5.1 Cabeçalho
- Fundo translúcido com desfoque: `background: color-mix(in srgb, var(--paper) 82%, transparent)` com `backdrop-filter: saturate(180%) blur(20px)` e borda inferior de 1 px.
- **Computador:** uma linha com a marca "BB" (quadrado de 32 px com gradiente `#2F80ED → #0A4FA8` e raio de 9 px) + "Bluebook", seguida da busca (flexível, de 180 a 420 px), dos filtros (classe e especialidade, até 200 px cada), de Favoritos, de **Calculadoras** (`#calc-btn`: abre o painel com calculadora, IG por DUM/USG, dose pediátrica, renal, IMC adulto e infantil, risco CV, fluidos, infusão e corticoides), do Aa e do menu ⋮. Sem slogan.
- **Celular:** a marca numa linha; abaixo, uma grade com a busca (4 colunas), a estrela e o ⋮ (44 px cada); na linha seguinte, o filtro de classe e o de especialidade lado a lado. O cabeçalho fica fixo no topo (`position: sticky`).

### 5.2 Campo de busca
- Fundo `color-mix(in srgb, var(--ink) 7%, transparent)` (cinza translúcido), sem borda, raio 12 px, 16 px de texto e lupa à esquerda.
- No foco: fundo `--surface`, borda `--accent` e anel `0 0 0 4px var(--accent-soft)`.

### 5.3 Abas de seção (computador)
- Botões em pílula, peso 600, cor `--ink-soft`, sem fundo.
- **Ativa:** fundo `--ink` com texto `--paper` (preto no claro, branco no escuro).
- **Plantão:** texto `--c-red-ink`; quando ativo, fundo `--c-red-fill` com texto branco.
- Rolagem horizontal sem barra visível. **No celular as abas do topo ficam ocultas** (a barra inferior substitui).

### 5.4 Chips de área (Todas, Clínica Médica, Pediatria…)
- Pílulas brancas com borda `--border` e contagem em cinza. A ativa fica com fundo `--accent` e texto branco. Rolagem horizontal.

### 5.5 Listas (barra lateral)
- **Estilo lista agrupada do iOS:** fundo da página `--paper`; linhas em `--surface`; o primeiro e o último item de cada grupo com cantos de 12 px.
- O rótulo do grupo fica acima do bloco (letra, área ou "RESULTADOS POR RELEVÂNCIA (n)").
- Cada linha mostra o nome (16 px), o subtítulo (13 px, cinza), a estrela de favorito à direita e, **no celular, a seta ›**.
- **Item selecionado:** fundo `--accent-fill` e texto branco (subtítulo branco a 95%).
- Hover: leve tom de `--accent` sobre `--surface`.

### 5.6 Ficha (doença/medicamento)
- **Título grande** (30 px/700), seguido das etiquetas: classe, grupo terapêutico, tarja, via, CID e selo de confiabilidade.
- Ações à direita: "Copiar resumo" (botão claro) e a estrela.
- **Cada seção é um cartão branco** com sombra leve, rótulo em MAIÚSCULAS cinza e texto de 15,5–16 px com entrelinha 1,6.
- A posologia aparece em tópicos. Nunca quebrar um tópico dentro de parênteses nem em abreviações (máx., mín., ex.).
- "Voltar" no celular: texto azul `--accent` de 17 px com a seta ‹.

### 5.7 Selos de confiabilidade (concisos)
| Selo | Estilo | Quando |
|---|---|---|
| ✓ Fonte oficial | verde (`--ok` sobre `--ok-soft`, borda `--ok`) | ficha conferida com bula/PCDT/rótulo regulatório |
| ✓ Revisado pelo autor | verde | ficha revisada pelo autor (07/11/2026) |
| ⚠ Pendente | dourado | o texto contém "PENDENTE DE VERIFICAÇÃO" |

12 px, raio 8 px. A explicação completa fica no `title` (aparece ao passar o mouse).

### 5.8 Página inicial
- Data em cinza e com inicial maiúscula ("Sábado, 7 De Novembro"), seguida do título "Bluebook" (34 px) e de uma linha de descrição.
- **Atalhos em cartões** (grade `minmax(190px,1fr)` no computador, 2 colunas no celular), cada um com um quadrado colorido de 38 px com ícone branco, o título (15 px/600) e a descrição (12,5 px cinza). Ordem: Plantão, Doenças, Calculadoras (abre o painel), Idade gestacional (abre a aba "ga" do painel), Escores, CID-10, Antibióticos, Fluxogramas, Laboratório. Abaixo do título "Bluebook" fica a frase original do app (`.home-tag`, 16 px, `--ink-soft`); no celular, o aviso legal fecha a página (`.home-legal`).
- **Cobertura do conteúdo**, abaixo: totais em pílulas brancas e a grade de especialidades (cartões clicáveis com "n doenças · n meds"). As especialidades com menos de 20 doenças têm uma faixa laranja à esquerda.
- No celular, a aba "Início" mostra essa página. A busca e as listas ficam nas outras abas.

### 5.9 Barra de abas inferior (somente celular, até 780 px)
- Fixa embaixo, translúcida (`--surface` a 85% + desfoque de 20 px), com borda superior de 1 px e respeitando `env(safe-area-inset-bottom)`.
- Cinco botões: **Início, Plantão, Doenças, Remédios, Mais**. Ícone de 25 px com o rótulo de 10,5 px embaixo.
- Inativo em `--ink-faint`; ativo em `--accent`; o Plantão ativo em `--c-red-ink`.
- "Início" só fica destacado na página inicial. Na lista de Remédios, o destaque é "Remédios" (corrigido na v72).
- Lembrar de deixar espaço inferior no conteúdo (`padding-bottom` de cerca de 90–100 px) para a barra não cobrir o texto.

### 5.10 Folha "Mais" (bottom sheet)
- Fundo escurecido `rgba(0,0,0,.35)`. A folha `--paper` sobe de baixo com cantos de 18 px no topo, puxador cinza (40×5 px) e título "Mais seções" (20 px/700).
- A lista agrupada tem linhas com ícone colorido de 30 px, o rótulo de 16 px e a seta › à direita: Calculadoras (IG, pediátrica, renal…) (painel), Idade gestacional (DUM/USG), Fórmulas clínicas (lista), Escores, CID-10, Antibióticos por foco, Fluxogramas, ECG, Laboratório, Vacinas, Prescrição e interações, Tamanho do texto.
- Botão "Fechar" separado, branco, com texto azul em 600. Tocar fora também fecha.

### 5.11 Modo plantão
- Um cartão de peso em tom vermelho claro (`--danger-soft`, borda `--danger-border`) com o rótulo "Peso do paciente" e o campo numérico grande (18 px/600).
- Tabela com as colunas Medicamento/via | Dose (n kg) | Observação. A dose fica em negrito, com o volume em mL embaixo.
- Selos dentro da dose: **MÁX.** e **MÍN.** (o limite foi atingido) e **ADULTO** (dose fixa de adulto a partir de 50 kg), vermelhos e pequenos.
- Etiqueta "Ref.: diretriz" no cabeçalho do protocolo.

### 5.12 Calculadora pediátrica
- Mostra a faixa usual e os **Limites** (máximo por tomada, máximo diário, máximo em mg/kg/dia).
- No resultado aparece a linha "Dose máxima de referência" e uma **barra de progresso** com "% do máximo diário": azul até 79%, laranja (`#c27a00`) de 80% a 99% ("próximo do limite"), vermelha a partir de 100% ("LIMITE ATINGIDO").
- Alertas clínicos (por exemplo, tramadol abaixo de 12 anos) em caixa vermelha antes dos campos.
- Aviso quando a dose digitada está acima ou abaixo da faixa usual.

### 5.13 Busca universal (dentro das listas)
- Um quadro recolhível no topo da lista: "▸ Também em outras seções — N resultados", com a contagem por seção embaixo.
- Fica fechado quando a aba atual tem resultados e abre sozinho quando não tem.

### 5.14 Tela de acesso (login local, v72)
- **Página:** fundo `--paper`, com um cartão `--surface` de raio 14 px e sombra leve, centralizado, com largura máxima de 400 px e margens de 16 px no celular.
- **Marca:** "BB" em 38 px (raio 10 px) com o título "Bluebook" (34 px/700). Abaixo, o subtítulo da tela ("Criar acesso", "Entrar" ou "Esqueci a senha") em 20 px/700.
- **Campos:** iguais à busca (§5.2): fundo cinza translúcido, raio 12 px, 16 px de texto, altura mínima de 44 px e anel `--accent-soft` no foco.
- **Botões:**
  - Principal: largura total, 48 px de altura, fundo `--accent-fill` e texto branco 600.
  - Secundário ("Entrar com o Google" e "Apagar acesso…"): fundo cinza translúcido.
  - Links ("Esqueci a senha"): texto `--accent` 600.
- **Mensagens:** erros em `--bad-ink` e confirmações em `--ok`, com `role="alert"`.
- **"Entrar com o Google":** fica desativado, com a nota "Disponível depois que o app for publicado na internet", até a Etapa 5.
- **Nota final** (12,5 px, `--ink-faint`, centralizada): o acesso fica só no aparelho, e o app é apoio e não substitui o julgamento clínico nem a bula.
- **Sem sessão:** o `<html>` recebe a classe `bb-locked` antes de desenhar a tela, e `.app` fica oculto, para o conteúdo não piscar.
- **Ajustes:** a seção "Conta" (e-mail, Sair, Alterar senha) e a seção "Backup do perfil" aparecem antes de "Sobre". O menu ⋮ tem "Sair (e-mail)".

---

## 6. Ícones

SVG embutidos, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, pontas e junções arredondadas. São traços simples desenhados para o app, sem bibliotecas nem marcas de terceiros.

| Chave | Uso | Conteúdo do SVG |
|---|---|---|
| `home` | Início | `<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>` |
| `bolt` | Plantão | `<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>` |
| `steth` | Doenças | `<path d="M6 3v6a5 5 0 0 0 10 0V3"/><path d="M11 14v2a5 5 0 0 0 10 0v-2"/><circle cx="21" cy="12" r="2"/>` |
| `pill` | Remédios | `<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="M8.5 8.5l7 7"/>` |
| `grid` | Mais | `<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>` |
| `calc` | Calculadoras | `<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>` |
| `score` | Escores | `<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>` |
| `cid` | CID-10 | `<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>` |
| `atb` | Antibióticos | `<circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/>` |
| `flux` | Fluxogramas | `<rect x="3" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="15" width="8" height="6" rx="1.5"/><path d="M7 9v4h10v2"/>` |
| `lab` | Laboratório | `<path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2"/><path d="M8 2h8M7 14h10"/>` |
| `vac` | Vacinas | `<path d="M18 2l4 4M17 7l-9 9-3 1 1-3 9-9zM14 4l6 6M3 21l3-3"/>` |
| `ecg` | ECG | `<path d="M2 12h4l2-5 4 10 2-5h8"/>` |
| `rx` | Prescrição | `<path d="M6 4h6a4 4 0 0 1 0 8H6zM6 12v8M10 12l8 8M18 14l-4 6"/>` |
| `aa` | Tamanho do texto | `<path d="M3 19l5-14 5 14M5 14h6M15 19l3.5-9 3.5 9M16.5 16h4"/>` |

---

## 7. Layout e responsividade

- **Ponto de quebra:** 780 px (com o zoom aplicado, a largura útil é menor que a da tela).
- **Computador:** cabeçalho, abas em pílula e chips de área no topo; abaixo, duas colunas: a lista à esquerda (largura fixa) e a ficha à direita (largura máxima de cerca de 900 px de conteúdo).
- **Celular:** cabeçalho fixo, uma coluna de cada vez (lista **ou** ficha, com "Voltar") e a barra de abas inferior. O rodapé de aviso legal fica oculto no celular (o aviso deve aparecer em "Ajustes/Sobre").
- Respeitar a área segura do iPhone: `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`; meta viewport com `viewport-fit=cover`.

---

## 8. Acessibilidade

- Contraste mínimo AA (4,5:1) para texto. Não usar `--ink-faint` em texto clínico essencial.
- Áreas de toque de no mínimo 44×44 px no celular.
- Rótulos ARIA nos botões só com ícone (estrela, ⋮, Aa, abas inferiores).
- Foco visível (contorno de 2 px em `--accent`, só na navegação por teclado) e navegação por teclado no computador.
- A tecla Esc fecha, nesta ordem, a janela aberta, a folha "Mais" e o menu ⋮, e devolve o foco a um ponto lógico.
- Conferido automaticamente com axe-core (WCAG 2.1 AA) em `testes/acessibilidade.ambos.spec.js`.
- O botão Aa (zoom) não deve quebrar o layout em nenhum nível de 100% a 145%.

---

## 9. O que NÃO fazer

- Não carregar fontes, ícones ou CSS de CDNs (o app precisa funcionar offline).
- Não usar logotipos, nomes ou layouts de outros apps médicos.
- Não colocar bordas grossas em volta de cartões. Separar com sombra leve e espaço.
- Não usar vermelho fora do Plantão e dos alertas clínicos.
- Não reintroduzir botões de editar, excluir ou "novo medicamento".
- Não reduzir o texto abaixo de 12 px (exceto o rótulo da barra inferior, de 10,5 px).

---

## 10. Critérios de aceitação visual

- [ ] Celular (390×844) no modo claro e no escuro: Início, Plantão (com peso de 20 kg), lista de Remédios, ficha de um medicamento, folha "Mais".
- [ ] Computador (1366×860): página inicial, busca "pneumonia" com a ficha aberta, calculadora pediátrica.
- [ ] Zoom em 100% e em 145% sem sobreposição no cabeçalho.
- [ ] Nenhum erro no console. Funcionamento offline confirmado.
