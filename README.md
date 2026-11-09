# Bluebook

**Acesse:** <https://vitorlrocha.github.io/bluebook/> (funciona offline depois da primeira abertura e pode ser instalado no celular).

Consulta clínica rápida e **offline**, em português do Brasil: doenças, condutas, medicamentos, CID-10,
escores, calculadoras, dose pediátrica por peso e modo plantão, num único arquivo que funciona sem internet.

> **Aviso legal.** O Bluebook é uma **ferramenta de apoio** à decisão clínica. **Não substitui o julgamento
> clínico, a avaliação do paciente nem a bula** do medicamento. Doses, contraindicações e interações devem
> ser sempre confirmadas na bula vigente (Bulário Eletrônico da Anvisa), em diretrizes oficiais e nos
> protocolos da sua instituição. Registros marcados "PENDENTE DE VERIFICAÇÃO" ainda não foram conferidos
> (lista em [`PENDENCIAS.md`](PENDENCIAS.md)). O uso das informações é de responsabilidade de quem as aplica.

| Conteúdo | Quantidade |
|---|---:|
| Doenças (com conduta e prescrição) | 3.226 |
| Medicamentos | 1.851 |
| CID-10 (DATASUS) | 2.045 categorias · 12.451 subcategorias |
| Protocolos de plantão · escores · calculadoras | 12 · 40 · 16 (+ 10 ferramentas) |

---

## Como usar

### No navegador
Abra o endereço publicado (veja [Publicação](#publicação)) ou o arquivo `dist/index.html` direto do computador.

### Instalar no celular (funciona sem internet)
- **Android (Chrome):** abra o endereço → menu ⋮ → **Instalar app** (ou "Adicionar à tela inicial").
- **iPhone (Safari):** abra o endereço → botão **Compartilhar** → **Adicionar à Tela de Início**.

Depois da primeira abertura, o app fica guardado no aparelho e abre **sem internet**. Quando houver versão nova
publicada, ela é baixada em segundo plano numa abertura com internet e passa a valer **na abertura seguinte**.

### Primeiro acesso (login)
1. Na tela inicial, em **Criar acesso**, informe seu e-mail e uma senha (mínimo de 8 caracteres).
2. Seus favoritos, anotações, recentes, prescrições e peso do plantão **deste aparelho** ficam ligados a esse e-mail.
3. Marque "Manter conectado" para não precisar entrar a cada abertura (30 dias).

O acesso fica **só neste aparelho** (não há servidor): a senha não é guardada, só um resumo criptográfico
(hash PBKDF2). Se esquecer a senha, a opção "Esqueci a senha" apaga o acesso **e os dados pessoais** do
aparelho — por isso, de vez em quando, use **⋮ → Ajustes → Exportar perfil** para guardar um backup.

### Entrar com o Google e backup automático no Google Drive
- **Entrar com o Google** (precisa de internet): cria ou abre o acesso com o seu e-mail do Google. Para entrar
  também sem internet, defina uma senha em **Ajustes → Conta**.
- **Backup no Google Drive** (**Ajustes → Backup no Google Drive**): uma cópia do seu perfil fica numa pasta
  privada do Bluebook no seu Drive (o app não vê seus outros arquivos) e é atualizada sozinha a cada mudança
  quando há internet. Por segurança o Google libera o acesso por ~1 hora; depois disso aparece
  "Backup pendente · Sincronizar" e um toque envia. Num aparelho novo: entre com o mesmo e-mail e use
  **Restaurar do Drive**.
- O app está em **modo de teste** no Google Cloud: só e-mails cadastrados como usuários de teste conseguem entrar
  (na primeira vez o Google mostra "app não verificado" — toque em Continuar).
- **Não escreva nas anotações nome ou dados que identifiquem pacientes** (LGPD: dados de saúde são sensíveis).

### Levar seus dados para outro aparelho ou navegador
Cada navegador (e cada endereço) guarda os dados separadamente. No aparelho antigo: **Ajustes → Exportar perfil**.
No novo: crie o acesso **com o mesmo e-mail** e use **Ajustes → Importar perfil**.

### Atalhos úteis
- Busca universal no topo (aceita siglas como IAM, PAC, AAS e erros de digitação).
- **Plantão** (vermelho): informe o peso e veja as doses por kg com máximos e dose de adulto.
- **Ferramentas** (computador: botão no topo; celular: Mais → Ferramentas de cálculo): calculadora,
  idade gestacional, dose pediátrica, função renal, IMC, risco cardiovascular, fluidos, infusão e corticoides.
- **Aa**: tamanho do texto (100% a 145%).

---

## Estrutura do projeto

| Pasta / arquivo | O que é |
|---|---|
| `src/index.html`, `src/styles.css`, `src/app.js`, `src/auth.js` | Casca HTML, estilos, app e login local |
| `dados/*.json` | Conteúdo (medicamentos, doenças, CID, plantão, escores, calculadora pediátrica…) |
| `src/pwa/` | Manifest, ícones e service worker (uso offline/instalação) |
| `ferramentas/` | Build, verificações, relatórios e utilitários (Node puro, sem dependências) |
| `testes/` | Testes de ponta a ponta (Playwright) |
| `docs/DESIGN.md` | Especificação visual (cores, tipografia, componentes) |
| `ROADMAP.md` | O que foi feito e o que falta |
| `PENDENCIAS.md`, `INCONSISTENCIAS.md` | Relatórios gerados a partir de `dados/` |
| `referencia/` | Versão original v71 (usada nos testes de equivalência) |
| `dist/` | **Gerado pelo build** (não vai para o git) — é o que se publica |

## Build

Requer apenas **Node.js 18+** (nenhum `npm install` para gerar o app).

```bash
node ferramentas/build.js
```

Gera `dist/index.html` (arquivo único, ~7 MB) e, ao lado, `manifest.json`, `sw.js`, `icones/` e `.nojekyll`.
Para editar conteúdo, altere `dados/*.json` (ou `src/`) e rode o build de novo.

## Verificações e testes

Verificações rápidas (sem dependências; Python 3 para o CID):

```bash
node ferramentas/checar_sintaxe.js
python ferramentas/validar_cid.py
node ferramentas/testar_build.js
npm run relatorios:checar
```

- `checar_sintaxe.js`: todos os scripts de `dist/index.html` são válidos.
- `validar_cid.py`: deve imprimir `[]` (todo CID citado existe na CID-10 do DATASUS).
- `testar_build.js`: contagens e dados equivalentes aos da v71.
- `relatorios:checar`: `PENDENCIAS.md` e `INCONSISTENCIAS.md` em dia com `dados/` (para regenerar: `npm run relatorios`).

Testes de ponta a ponta (Playwright, só para desenvolvimento):

```bash
npm install
npx playwright install chromium
npx playwright test
```

Rodam no computador (1366×860) e num celular simulado (Pixel 7): busca, CID, plantão, dose pediátrica,
navegação, login, PWA/offline, publicação em subpasta, acessibilidade (axe, WCAG 2.1 AA), conformidade com
`docs/DESIGN.md`, capturas de tela e regressão das buscas contra a v71. Mudança visual intencional:
`npx playwright test visual --update-snapshots`.

## Publicação

O que se publica é a pasta `dist/` — um site estático. Duas opções gratuitas:

### GitHub Pages (recomendado; já configurado)
1. Crie um repositório no GitHub (ex.: `bluebook`). No plano gratuito, o Pages exige repositório **público**.
2. Envie este projeto para ele (GitHub Desktop: *Publish repository*; ou `git remote add origin … && git push -u origin main`).
3. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. A cada `push` na branch `main`, o workflow [`.github/workflows/publicar.yml`](.github/workflows/publicar.yml)
   gera o `dist/`, roda as verificações e publica em `https://SEU-USUARIO.github.io/bluebook/`.

### Netlify (alternativa)
- **Com repositório:** "Add new site → Import from Git"; o arquivo [`netlify.toml`](netlify.toml) já define
  o build (`node ferramentas/build.js`) e a pasta (`dist`).
- **Sem repositório:** rode o build e arraste a pasta `dist/` em <https://app.netlify.com/drop>.

> **Privacidade ao publicar:** num repositório público, o código, o conteúdo e o **histórico de commits
> (incluindo o e-mail do autor de cada commit)** ficam visíveis. Dados pessoais de uso (anotações, favoritos,
> senha) **não** vão para o repositório: ficam só no navegador de cada aparelho.

## Para desenvolvedores

As regras do projeto (fontes aceitas, "PENDENTE DE VERIFICAÇÃO", CID somente válido, não reintroduzir
edição/exclusão de medicamentos, não copiar outros apps) estão em [`CLAUDE.md`](CLAUDE.md). O visual segue
[`docs/DESIGN.md`](docs/DESIGN.md).
