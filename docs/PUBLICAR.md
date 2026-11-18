# Como publicar o Bluebook (grátis, como site estático)

O Bluebook é um **site estático**: a pasta `dist/` (gerada por `node ferramentas/build.js`) tem tudo o que o app
precisa — `index.html` (app inteiro, com os dados clínicos embutidos), `sw.js` (uso offline), `manifest.json`,
`icones/`, `privacidade.html` e `versao.json`. Não há servidor, banco de dados nem login na nuvem. Favoritos,
anotações, histórico e ajustes ficam no aparelho de cada pessoa (backup: menu ⋮ → Exportar / Importar meus dados).

Escolha **uma** das opções abaixo. A opção A já está funcionando.

---

## Opção A — GitHub Pages (já está no ar)

Endereço: **https://vitorlrocha.github.io/bluebook/**

Como funciona: a cada envio (push) para a branch `main`, o GitHub Actions (`.github/workflows/publicar.yml`) gera o
`dist/`, confere sintaxe, CID-10 e dados, e publica sozinho em cerca de 1 minuto.

Se um dia precisar configurar de novo:
1. Abra https://github.com/vitorlrocha/bluebook e clique em **Settings** (engrenagem, no alto).
2. No menu da esquerda, clique em **Pages**.
3. Em **Build and deployment → Source**, escolha **GitHub Actions**.
4. Clique na aba **Actions** do repositório e confira se o último "Publicar no GitHub Pages" está com ✓ verde.
5. Abra o endereço acima. Pronto.

Para publicar uma mudança: faça o commit e o envio (push) pelo GitHub Desktop (botão **Push origin**). Em 1 a 2
minutos o app instalado nos aparelhos mostra "Nova versão disponível · Atualizar".

Custo: zero (GitHub Pages é gratuito para repositório público).

---

## Opção B — Cloudflare Pages (alternativa gratuita)

Útil se você quiser um endereço `*.pages.dev` ou um domínio próprio com a Cloudflare. Também é gratuito.

1. Crie uma conta em https://dash.cloudflare.com/sign-up (plano **Free**; não cadastre cartão).
2. No painel, clique em **Workers & Pages** → **Create** → aba **Pages** → **Connect to Git**.
3. Autorize a Cloudflare a ver o GitHub e escolha o repositório **vitorlrocha/bluebook**.
4. Em **Set up builds and deployments** preencha:
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** `node ferramentas/build.js`
   - **Build output directory:** `dist`
   - Em **Environment variables**, adicione `NODE_VERSION` = `22`.
5. Clique em **Save and Deploy**. Ao terminar, a Cloudflare mostra o endereço (algo como `bluebook-xxx.pages.dev`).
6. A partir daí, cada push na `main` publica sozinho também na Cloudflare.

Observação: as conferências automáticas (CID-10, dados) continuam rodando no GitHub Actions. A Cloudflare só monta e
publica. Se usar só a Cloudflare, você pode desligar o GitHub Pages em Settings → Pages.

---

## Instalar no iPhone (uso 100% offline)

1. No iPhone, abra o endereço do app no **Safari** (precisa ser o Safari).
2. Espere a página carregar por completo (na primeira vez, o app inteiro é guardado no aparelho).
3. Toque no botão **Compartilhar** (quadrado com seta para cima) → **Adicionar à Tela de Início** → **Adicionar**.
4. Abra pelo ícone "Bluebook" da tela de início. Para conferir o offline: ative o **Modo Avião** e abra o app.

No Android (Chrome) ou no computador (Chrome/Edge): menu do navegador → **Instalar app** (ou o ícone de instalar na
barra de endereço).

Dica: faça de vez em quando um backup em menu ⋮ → **Exportar meus dados**. Se o iPhone apagar os dados do site
(por exemplo, ao limpar o histórico do Safari), use **Importar meus dados** para restaurar.
