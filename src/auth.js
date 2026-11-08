/* Bluebook — acesso local com e-mail e senha (v72, Etapa 2 do ROADMAP.md).
   - Tudo fica neste aparelho (localStorage): não há servidor. A senha nunca é guardada;
     guarda-se só o hash PBKDF2-SHA-256 (210.000 iterações, sal aleatório de 16 bytes) via WebCrypto.
   - É uma trava de acesso pessoal, não criptografia dos dados: o conteúdo clínico é público e os dados
     pessoais continuam legíveis por quem tiver acesso ao navegador do aparelho.
   - Uma conta por aparelho. Os dados pessoais já salvos (anotações, favoritos, recentes, prescrições,
     peso do plantão) passam a pertencer ao e-mail cadastrado; o backup de perfil leva esse e-mail.
   - O <script> curto no início do <body> (src/index.html) põe a classe bb-locked no <html> antes de
     desenhar a tela quando não há sessão válida, para o conteúdo não piscar. */
(function () {
  "use strict";
  var K_CONTA = "bluebook:conta", K_SESSAO = "bluebook:sessao", K_TENT = "bluebook:tentativas";
  var DIAS_MANTER = 30, HORAS_SEM_MANTER = 12, ITER = 210000, MAX_TENT = 5, ESPERA_MS = 30000;
  /* Chaves com dados pessoais (o tamanho do texto, bluebook:zoom, é preferência do aparelho e fica). */
  var PESSOAIS = ["bluebook:notes", "bluebook:recents", "bluebook:hist", "bluebook:disease-favs",
    "bluebook:rx", "bluebook:rxpt", "bluebook:rxd", "bluebook:rxh", "bluebook:pl-kg"];
  var MEDS_KEY = "formulario-clinico:medications";

  var html = document.documentElement;
  function ler(st, k) { try { return JSON.parse(st.getItem(k) || "null"); } catch (e) { return null; } }
  function gravar(st, k, v) { try { st.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function apagar(k) { try { localStorage.removeItem(k); } catch (e) {} try { sessionStorage.removeItem(k); } catch (e) {} }
  function armazenamentoOk() { try { localStorage.setItem("__bb_t", "1"); localStorage.removeItem("__bb_t"); return true; } catch (e) { return false; } }
  function normEmail(e) { return String(e || "").trim().toLowerCase(); }
  function emailValido(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }
  function b64(buf) { var s = "", a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function deB64(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function cripto() { var c = window.crypto; return c && c.subtle && c.getRandomValues ? c : null; }
  function derivar(senha, sal, it) {
    var c = cripto();
    return c.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"])
      .then(function (k) { return c.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: it }, k, 256); })
      .then(b64);
  }
  /* comparação em tempo constante */
  function iguais(a, b) { if (a.length !== b.length) return false; var d = 0; for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }

  function conta() { var c = ler(localStorage, K_CONTA); return c && c.email ? c : null; }
  function sessao() { return ler(sessionStorage, K_SESSAO) || ler(localStorage, K_SESSAO); }
  function logado() { var c = conta(), s = sessao(); return !!(c && s && s.email === c.email && s.ate > Date.now()); }
  function abrirSessao(email, manter) {
    apagar(K_SESSAO);
    if (manter) gravar(localStorage, K_SESSAO, { email: email, ate: Date.now() + DIAS_MANTER * 864e5 });
    else gravar(sessionStorage, K_SESSAO, { email: email, ate: Date.now() + HORAS_SEM_MANTER * 36e5 });
  }
  function novoHash(senha) {
    var sal = cripto().getRandomValues(new Uint8Array(16));
    return derivar(senha, sal, ITER).then(function (h) { return { sal: b64(sal), hash: h, it: ITER }; });
  }
  function criarConta(email, senha) {
    return novoHash(senha).then(function (h) {
      var c = { v: 1, email: email, sal: h.sal, hash: h.hash, it: h.it, criada: new Date().toISOString() };
      if (!gravar(localStorage, K_CONTA, c)) throw new Error("armazenamento");
      return c;
    });
  }
  function conferir(senha) {
    var c = conta();
    if (!c || !c.sal || !c.hash) return Promise.resolve(false);
    return derivar(senha, deB64(c.sal), c.it || ITER).then(function (h) { return iguais(h, c.hash); });
  }
  function esperaRestante() { var t = ler(localStorage, K_TENT); return t && t.ate > Date.now() ? Math.ceil((t.ate - Date.now()) / 1000) : 0; }
  function registrarFalha() {
    var t = ler(localStorage, K_TENT) || { n: 0 };
    t.n = (t.n || 0) + 1;
    if (t.n >= MAX_TENT) { t = { n: 0, ate: Date.now() + ESPERA_MS }; }
    gravar(localStorage, K_TENT, t);
    return t;
  }

  /* ---------------- Tela ---------------- */
  var raiz = null;
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function msg(t, ok) { var m = el("auth-msg"); if (!m) return; m.textContent = t || ""; m.className = "auth-msg" + (ok ? " auth-msg-ok" : ""); }
  function ocupado(sim) { var b = el("auth-ok"); if (b) { b.disabled = sim; b.setAttribute("aria-busy", sim ? "true" : "false"); } }

  function campo(id, rotulo, tipo, auto, extra) {
    return '<label class="auth-label" for="' + id + '">' + rotulo + '</label>' +
      '<input class="auth-input" id="' + id + '" type="' + tipo + '" autocomplete="' + auto + '"' + (extra || "") + '>';
  }
  var NOTA = '<p class="auth-nota">O acesso fica guardado só neste aparelho e funciona sem internet. ' +
    'O Bluebook é uma ferramenta de apoio: não substitui o julgamento clínico nem a bula.</p>';
  /* Etapa 5: "Entrar com o Google" (src/google.js). Fica desativado se o Client ID não estiver configurado. */
  function googleOk() { return !!(window.BBGoogle && window.BBGoogle.configurado()); }
  function GOOGLE() {
    var ok = googleOk();
    return '<div class="auth-sep" aria-hidden="true"><span>ou</span></div>' +
      '<button type="button" class="auth-btn auth-btn-alt" id="auth-google"' + (ok ? "" : " disabled") + ' aria-describedby="auth-google-nota">Entrar com o Google</button>' +
      '<p class="auth-nota" id="auth-google-nota">' + (ok
        ? "Precisa de internet. Usa só o seu e-mail do Google; a senha do Google nunca passa pelo Bluebook."
        : "Disponível depois que o app for publicado na internet.") + "</p>";
  }
  /* Entrada pelo Google: o e-mail vem verificado pelo Google (src/google.js). */
  function entrarGoogle(email, manter) {
    email = normEmail(email);
    var c = conta();
    if (c && c.email !== email) throw new Error("Este aparelho já tem o acesso de " + c.email + ". Entre com essa conta Google ou com a senha.");
    if (!c) {
      c = { v: 1, email: email, google: true, criada: new Date().toISOString() };
      if (!gravar(localStorage, K_CONTA, c)) throw new Error("Não foi possível salvar o acesso neste navegador.");
    } else if (!c.google) { c.google = true; gravar(localStorage, K_CONTA, c); }
    apagar(K_TENT);
    abrirSessao(email, manter);
    if (window.BBGoogle && window.BBGoogle.vincular) window.BBGoogle.vincular(email);
    entrarNoApp();
  }
  function ligarGoogle() {
    var b = el("auth-google");
    if (!b || b.disabled) return;
    b.addEventListener("click", function () {
      msg("");
      var manter = el("auth-manter") ? el("auth-manter").checked : true;
      b.disabled = true;
      window.BBGoogle.entrar().then(function (email) { entrarGoogle(email, manter); })
        .catch(function (err) { msg(err && err.message ? err.message : "Não foi possível entrar com o Google."); })
        .then(function () { if (el("auth-google")) el("auth-google").disabled = false; });
    });
  }

  function tela(modo) {
    var c = conta();
    var h = '<div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-titulo">' +
      '<div class="auth-topo"><span class="brand-mark auth-mark" aria-hidden="true">BB</span><h1 id="auth-titulo">Bluebook</h1></div>';
    if (modo === "criar") {
      h += '<h2 class="auth-h2">Criar acesso</h2>' +
        '<p class="auth-sub">Cadastre seu e-mail e uma senha. Seus favoritos, anotações, recentes, prescrições e ajustes já salvos neste aparelho passam a ficar ligados a este e-mail.</p>' +
        '<form id="auth-form" novalidate>' +
        campo("auth-email", "E-mail", "email", "username", ' inputmode="email" autocapitalize="off" spellcheck="false" required') +
        campo("auth-senha", "Senha (mínimo de 8 caracteres)", "password", "new-password", ' minlength="8" required') +
        campo("auth-senha2", "Confirme a senha", "password", "new-password", ' minlength="8" required') +
        '<label class="auth-check"><input type="checkbox" id="auth-manter" checked> Manter conectado neste aparelho por 30 dias</label>' +
        '<p id="auth-msg" class="auth-msg" role="alert" aria-live="assertive"></p>' +
        '<button type="submit" class="auth-btn" id="auth-ok">Criar acesso</button></form>' + GOOGLE() + NOTA;
    } else if (modo === "esqueci") {
      h += '<h2 class="auth-h2">Esqueci a senha</h2>' +
        '<p class="auth-sub">O Bluebook não tem servidor, então não há como enviar um e-mail de recuperação. ' +
        'Para voltar a usar o app neste aparelho é preciso <strong>apagar o acesso e os dados pessoais</strong> ' +
        '(anotações, favoritos, recentes, prescrições e peso do plantão) e criar um acesso novo. ' +
        'O conteúdo clínico não é afetado. Se você tem um backup de perfil (Ajustes), poderá importá-lo depois.</p>' +
        '<form id="auth-form" novalidate>' +
        campo("auth-confirma", 'Digite APAGAR para confirmar', "text", "off", ' autocapitalize="characters" spellcheck="false"') +
        '<p id="auth-msg" class="auth-msg" role="alert" aria-live="assertive"></p>' +
        '<button type="submit" class="auth-btn auth-btn-alt" id="auth-ok">Apagar acesso e dados pessoais</button></form>' +
        '<button type="button" class="auth-link" id="auth-voltar">Voltar para o login</button>';
    } else {
      h += '<h2 class="auth-h2">Entrar</h2>' +
        '<form id="auth-form" novalidate>' +
        campo("auth-email", "E-mail", "email", "username", ' inputmode="email" autocapitalize="off" spellcheck="false" required value="' + esc(c ? c.email : "") + '"') +
        campo("auth-senha", "Senha", "password", "current-password", " required") +
        '<label class="auth-check"><input type="checkbox" id="auth-manter" checked> Manter conectado neste aparelho por 30 dias</label>' +
        '<p id="auth-msg" class="auth-msg" role="alert" aria-live="assertive"></p>' +
        '<button type="submit" class="auth-btn" id="auth-ok">Entrar</button></form>' +
        '<button type="button" class="auth-link" id="auth-esqueci">Esqueci a senha</button>' + GOOGLE() + NOTA;
    }
    raiz.innerHTML = h + "</div>";
    el("auth-form").addEventListener("submit", function (e) { e.preventDefault(); enviar(modo); });
    ligarGoogle();
    if (el("auth-esqueci")) el("auth-esqueci").addEventListener("click", function () { tela("esqueci"); });
    if (el("auth-voltar")) el("auth-voltar").addEventListener("click", function () { tela(conta() ? "entrar" : "criar"); });
    var aviso = null; try { aviso = sessionStorage.getItem("bluebook:aviso"); sessionStorage.removeItem("bluebook:aviso"); } catch (e) {}
    if (aviso) msg(aviso, true);
    var foco = modo === "entrar" && c ? el("auth-senha") : el(modo === "esqueci" ? "auth-confirma" : "auth-email");
    if (foco) setTimeout(function () { try { foco.focus(); } catch (e) {} }, 0);
  }

  function enviar(modo) {
    msg("");
    if (modo === "esqueci") {
      if (String(el("auth-confirma").value).trim().toUpperCase() !== "APAGAR") { msg("Digite APAGAR para confirmar."); return; }
      apagarAcessoEDados();
      /* recarrega para o app não manter na memória os dados apagados */
      try { sessionStorage.setItem("bluebook:aviso", "Acesso e dados pessoais apagados. Crie um acesso novo."); } catch (e) {}
      location.reload();
      return;
    }
    var email = normEmail(el("auth-email").value), senha = el("auth-senha").value, manter = el("auth-manter").checked;
    if (!emailValido(email)) { msg("Informe um e-mail válido."); el("auth-email").focus(); return; }
    if (modo === "criar") {
      if (senha.length < 8) { msg("A senha precisa ter pelo menos 8 caracteres."); el("auth-senha").focus(); return; }
      if (senha !== el("auth-senha2").value) { msg("As senhas não conferem."); el("auth-senha2").focus(); return; }
      ocupado(true);
      criarConta(email, senha).then(function () { abrirSessao(email, manter); entrarNoApp(); })
        .catch(function () { msg("Não foi possível salvar o acesso neste navegador."); })
        .then(function () { ocupado(false); });
      return;
    }
    var w = esperaRestante();
    if (w) { msg("Muitas tentativas. Aguarde " + w + " s e tente de novo."); return; }
    var c = conta();
    if (!c) { tela("criar"); return; }
    if (!senha) { msg("Digite a senha."); el("auth-senha").focus(); return; }
    if (!c.hash) { msg("Este acesso foi criado com o Google. Use \"Entrar com o Google\" (ou defina uma senha em Ajustes para entrar sem internet)."); return; }
    ocupado(true);
    conferir(senha).then(function (ok) {
      if (ok && email === c.email) { apagar(K_TENT); abrirSessao(email, manter); entrarNoApp(); return; }
      var t = registrarFalha();
      msg(t.ate ? "E-mail ou senha incorretos. Muitas tentativas: aguarde " + Math.ceil(ESPERA_MS / 1000) + " s." : "E-mail ou senha incorretos.");
      el("auth-senha").value = ""; el("auth-senha").focus();
    }).catch(function () { msg("Não foi possível conferir a senha neste navegador."); })
      .then(function () { ocupado(false); });
  }

  function apagarAcessoEDados() {
    [K_CONTA, K_SESSAO, K_TENT, MEDS_KEY, "bluebook:drive"].concat(PESSOAIS).forEach(apagar);
  }

  function bloquear(modo) {
    html.classList.add("bb-locked");
    raiz.hidden = false;
    tela(modo || (conta() ? "entrar" : "criar"));
  }
  function entrarNoApp() {
    html.classList.remove("bb-locked");
    raiz.hidden = true;
    raiz.innerHTML = "";
    try { document.dispatchEvent(new CustomEvent("bb:login", { detail: { email: (conta() || {}).email } })); } catch (e) {}
  }

  /* API usada por app.js (Ajustes e menu ⋮). */
  window.BBAuth = {
    email: function () { var c = conta(); return c ? c.email : null; },
    criada: function () { var c = conta(); return c ? c.criada : null; },
    temSenha: function () { var c = conta(); return !!(c && c.hash); },
    PESSOAIS: PESSOAIS.slice(),
    MEDS_KEY: MEDS_KEY,
    sair: function () { apagar(K_SESSAO); bloquear("entrar"); },
    alterarSenha: function (atual, nova) {
      if (String(nova).length < 8) return Promise.reject(new Error("A nova senha precisa ter pelo menos 8 caracteres."));
      var semSenha = !(conta() || {}).hash;   // acesso criado pelo Google: define a primeira senha
      return (semSenha ? Promise.resolve(true) : conferir(atual)).then(function (ok) {
        if (!ok) throw new Error("A senha atual está incorreta.");
        return novoHash(nova).then(function (h) {
          var c = conta(); c.sal = h.sal; c.hash = h.hash; c.it = h.it; c.alterada = new Date().toISOString();
          if (!gravar(localStorage, K_CONTA, c)) throw new Error("Não foi possível salvar.");
        });
      });
    }
  };

  function iniciar() {
    raiz = el("auth");
    if (!raiz) return;
    /* Sem armazenamento ou sem WebCrypto não há como guardar/conferir a senha: o app abre sem login
       (a nota de armazenamento do app já avisa quando os dados não ficam salvos). */
    if (!armazenamentoOk() || !cripto()) { html.classList.remove("bb-locked"); raiz.hidden = true; return; }
    if (logado()) { html.classList.remove("bb-locked"); raiz.hidden = true; return; }
    bloquear();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
