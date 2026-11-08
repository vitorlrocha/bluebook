/* Bluebook — "Entrar com o Google" e backup automático no Google Drive (v72, Etapa 5 do ROADMAP.md).
   - Usa o Google Identity Services (modelo de token, só no navegador; não há servidor do Bluebook).
     O script do Google (accounts.google.com/gsi/client) só é carregado quando a pessoa usa um recurso
     do Google e há internet: o app continua 100% offline sem ele.
   - Escopos: e-mail/perfil (para saber o e-mail verificado) e drive.appdata — uma pasta OCULTA e privada do
     app dentro do Drive da pessoa. O Bluebook não enxerga nenhum outro arquivo do Drive.
   - O backup é o mesmo "perfil" de Ajustes (anotações, favoritos, recentes, prescrições, peso do plantão),
     num único arquivo bluebook-perfil.json. Sem senha, sem hash.
   - O token do Google vale ~1 hora e só pode ser renovado com um toque da pessoa (o navegador bloqueia a
     janela do Google sem gesto). Enquanto vale, cada mudança é enviada sozinha; depois disso o app marca
     "backup pendente" e mostra o botão "Sincronizar". Sem internet, a mudança espera e vai quando voltar.
   - CLIENT_ID não é segredo (identifica o app no Google); ele só funciona nos endereços autorizados no
     Google Cloud (https://vitorlrocha.github.io). */
(function () {
  "use strict";
  var CLIENT_ID = "";   // Google Cloud → APIs e serviços → Credenciais → ID do cliente OAuth (aplicativo da Web)
  var SCOPES = "openid email profile https://www.googleapis.com/auth/drive.appdata";
  var GSI = "https://accounts.google.com/gsi/client";
  var DRIVE = "https://www.googleapis.com/drive/v3/files";
  var UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
  var ARQ = "bluebook-perfil.json";
  var K = "bluebook:drive";          // { email, conectado, fileId, ultimo, hash }
  var INTERVALO = 20000;

  var token = null, expira = 0, gsi = null, enviando = false;

  function clientId() { return window.__BB_GOOGLE_CLIENT_ID || CLIENT_ID; }   // testes injetam um ID fictício
  function ler() { try { return JSON.parse(localStorage.getItem(K) || "null") || {}; } catch (e) { return {}; } }
  function gravar(v) { try { localStorage.setItem(K, JSON.stringify(v)); } catch (e) {} avisar(); }
  function avisar() { try { document.dispatchEvent(new CustomEvent("bb:drive", { detail: estado() })); } catch (e) {} }
  function online() { return navigator.onLine !== false; }
  function tokenValido() { return !!token && Date.now() < expira; }
  function hashDe(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h >>> 0); }

  function carregarGsi() {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
    if (gsi) return gsi;
    if (!online()) return Promise.reject(new Error("Sem internet. Conecte-se para usar o Google."));
    gsi = new Promise(function (ok, falha) {
      var s = document.createElement("script");
      s.src = GSI; s.async = true;
      s.onload = function () { ok(); };
      s.onerror = function () { gsi = null; falha(new Error("Não foi possível falar com o Google. Verifique a internet.")); };
      document.head.appendChild(s);
    });
    return gsi;
  }
  /* Abre a janela do Google (precisa ser chamada a partir de um toque/clique). */
  function pedirToken(prompt) {
    return carregarGsi().then(function () {
      return new Promise(function (ok, falha) {
        var tc = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId(), scope: SCOPES, prompt: prompt || "",
          callback: function (r) {
            if (!r || r.error || !r.access_token) { falha(new Error(r && r.error === "access_denied" ? "Acesso ao Google não autorizado." : "O Google não autorizou o acesso.")); return; }
            if (window.google.accounts.oauth2.hasGrantedAllScopes && !window.google.accounts.oauth2.hasGrantedAllScopes(r, "https://www.googleapis.com/auth/drive.appdata")) {
              falha(new Error("Para o backup, autorize o acesso à pasta do app no Google Drive.")); return;
            }
            token = r.access_token; expira = Date.now() + Math.max(60, (Number(r.expires_in) || 3600) - 120) * 1000;
            ok(token);
          },
          error_callback: function (e) { falha(new Error(e && e.type === "popup_closed" ? "Janela do Google fechada." : "A janela do Google foi bloqueada ou fechada.")); }
        });
        tc.requestAccessToken();
      });
    });
  }
  function api(url, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ Authorization: "Bearer " + token }, opts.headers || {});
    return fetch(url, opts).then(function (r) {
      if (r.status === 401) { token = null; expira = 0; throw new Error("Sessão do Google expirou. Toque em Sincronizar."); }
      if (!r.ok) throw new Error("Google Drive respondeu " + r.status + ".");
      return r.status === 204 ? null : r.json();
    });
  }
  function emailGoogle() {
    return api("https://www.googleapis.com/oauth2/v3/userinfo").then(function (u) {
      if (!u || !u.email || u.email_verified === false) throw new Error("A conta Google não tem e-mail verificado.");
      return String(u.email).trim().toLowerCase();
    });
  }
  function perfilAtual() {
    var P = window.BBPerfil, A = window.BBAuth;
    if (!P || !A || !A.email()) return null;
    var p = P.dados();
    return { tipo: "bluebook-perfil", versao: 1, email: A.email(), dados: p.dados, favoritos: p.favoritos };
  }
  function acharArquivo() {
    var d = ler();
    if (d.fileId) return Promise.resolve(d.fileId);
    return api(DRIVE + "?spaces=appDataFolder&fields=files(id,modifiedTime)&q=" + encodeURIComponent("name='" + ARQ + "'")).then(function (r) {
      var f = r && r.files && r.files[0];
      if (f) { d.fileId = f.id; gravar(d); }
      return f ? f.id : null;
    });
  }
  function enviar(p) {
    var corpo = JSON.stringify(Object.assign({ salvoEm: new Date().toISOString() }, p));
    return acharArquivo().then(function (id) {
      if (id) return api(UPLOAD + "/" + id + "?uploadType=media&fields=id", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: corpo });
      var b = "bb" + Date.now();
      var meta = JSON.stringify({ name: ARQ, parents: ["appDataFolder"], mimeType: "application/json" });
      var multi = "--" + b + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" + meta + "\r\n--" + b + "\r\nContent-Type: application/json\r\n\r\n" + corpo + "\r\n--" + b + "--";
      return api(UPLOAD + "?uploadType=multipart&fields=id", { method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + b }, body: multi })
        .then(function (r) { var d = ler(); d.fileId = r.id; gravar(d); return r; });
    });
  }

  /* ---------- API pública ---------- */
  function estado() {
    var d = ler(), p = perfilAtual();
    var h = p ? hashDe(JSON.stringify([p.dados, p.favoritos])) : null;
    return { configurado: !!clientId(), conectado: !!d.conectado, email: d.email || null, ultimo: d.ultimo || null,
      pendente: !!(d.conectado && p && h !== d.hash), tokenValido: tokenValido(), online: online() };
  }
  /* Entrar com o Google: devolve o e-mail verificado. Também deixa o Drive pronto (mesmo token). */
  function entrar() { return pedirToken("select_account").then(emailGoogle); }
  /* Chamado pelo login (src/auth.js) depois que o e-mail foi aceito: liga o backup no Drive. */
  function vincular(email) { var d = ler(); d.email = email; d.conectado = true; gravar(d); }
  /* Ajustes → Conectar: o e-mail do Google precisa ser o mesmo da conta do Bluebook. */
  function conectar() {
    var A = window.BBAuth;
    return pedirToken("").then(emailGoogle).then(function (email) {
      if (!A || email !== A.email()) { token = null; throw new Error("A conta Google (" + email + ") é diferente da conta do Bluebook (" + (A && A.email()) + ")."); }
      var d = ler(); d.email = email; d.conectado = true; gravar(d);
      return backup();
    });
  }
  function backup() {
    var p = perfilAtual();
    if (!p) return Promise.reject(new Error("Entre no Bluebook primeiro."));
    var d = ler();
    if (!d.conectado) return Promise.reject(new Error("Conecte o Google Drive primeiro."));
    if (d.email && d.email !== p.email) return Promise.reject(new Error("O Drive conectado é de outra conta (" + d.email + ")."));
    var h = hashDe(JSON.stringify([p.dados, p.favoritos]));
    var vai = tokenValido() ? Promise.resolve() : pedirToken("");
    enviando = true;
    return vai.then(function () { return enviar(p); }).then(function () {
      var d2 = ler(); d2.hash = h; d2.ultimo = new Date().toISOString(); gravar(d2);
      return d2.ultimo;
    }).then(function (x) { enviando = false; return x; }, function (e) { enviando = false; avisar(); throw e; });
  }
  function restaurar() {
    var A = window.BBAuth;
    var vai = tokenValido() ? Promise.resolve() : pedirToken("");
    return vai.then(acharArquivo).then(function (id) {
      if (!id) throw new Error("Ainda não há backup do Bluebook neste Google Drive.");
      return api(DRIVE + "/" + id + "?alt=media");
    }).then(function (p) {
      if (!p || p.tipo !== "bluebook-perfil") throw new Error("O arquivo no Drive não é um backup do Bluebook.");
      if (String(p.email || "").toLowerCase() !== String(A && A.email()).toLowerCase()) throw new Error("O backup do Drive é de " + p.email + ".");
      return window.BBPerfil.importar(p).then(function () { return p.salvoEm || null; });
    });
  }
  function desconectar() {
    try { if (token && window.google && window.google.accounts) window.google.accounts.oauth2.revoke(token, function () {}); } catch (e) {}
    token = null; expira = 0;
    try { localStorage.removeItem(K); } catch (e) {}
    avisar();
  }
  /* Salvamento automático: verifica mudanças a cada 20 s, ao sair do app e quando a internet volta. */
  function automatico() {
    var e = estado();
    if (!e.conectado || !e.pendente || enviando) { avisar(); return; }
    if (!e.online || !e.tokenValido) { avisar(); return; }   // espera internet ou um toque em "Sincronizar"
    backup().catch(function () { avisar(); });
  }

  window.BBGoogle = { configurado: function () { return !!clientId(); }, entrar: entrar, vincular: vincular, conectar: conectar, backup: backup,
    restaurar: restaurar, desconectar: desconectar, estado: estado, ARQUIVO: ARQ };

  setInterval(automatico, INTERVALO);
  window.addEventListener("online", automatico);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") automatico(); });
  document.addEventListener("bb:login", function () { setTimeout(automatico, 1500); });
})();
