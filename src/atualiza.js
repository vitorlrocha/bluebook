/* Bluebook — atualização automática, versão e instalação (v73).
   - O app inteiro (com o conteúdo) fica guardado no aparelho pelo service worker (src/pwa/sw.js) e abre sem internet.
   - Com internet, o app procura versão nova: ao abrir, quando a conexão volta, a cada hora e ao voltar para a
     janela. A versão nova é baixada em segundo plano e fica esperando; aparece "Nova versão disponível · Atualizar".
     Um toque troca e recarrega. Sem o toque, ela entra na próxima vez que o app for aberto.
     O app NUNCA recarrega sozinho no meio do uso.
   - window.BB_VERSAO = { versao, build, data } é gravado pelo build (ferramentas/build.js), que também publica
     versao.json com os mesmos dados.
   - Aberto direto do arquivo (file://) não há service worker: funciona offline, mas não se atualiza sozinho. */
(function () {
  "use strict";
  var V = window.BB_VERSAO || { versao: "?", build: "", data: null };
  var K_VERIF = "bluebook:ultima-verificacao";
  var HORA = 3600000;
  var temSW = "serviceWorker" in navigator && /^https?:$/.test(location.protocol);
  var reg = null, pedi = false, tinhaControle = temSW && !!navigator.serviceWorker.controller;
  var promptInstalar = null, novaPronta = false, ocupado = null;

  /* Área dos avisos flutuantes (atualização, sem internet, backup pendente do Drive). */
  var avisos = document.createElement("div");
  avisos.id = "avisos"; avisos.className = "avisos";
  avisos.innerHTML =
    '<div id="offline-aviso" class="aviso-pilula" role="status" hidden>Sem internet · usando a versão salva</div>' +
    '<div id="atualiza-aviso" class="drive-aviso" role="status" hidden><span id="atualiza-txt"></span><button type="button" id="atualiza-btn"></button></div>';
  document.body.appendChild(avisos);
  function el(id) { return document.getElementById(id); }
  function avisar() { try { document.dispatchEvent(new CustomEvent("bb:atualiza")); } catch (e) {} }
  function online() { return navigator.onLine !== false; }

  function mostrar(tipo) {
    novaPronta = true;
    el("atualiza-txt").textContent = tipo === "outra" ? "App atualizado em outra janela" : "Nova versão disponível";
    el("atualiza-btn").textContent = tipo === "outra" ? "Recarregar" : "Atualizar";
    el("atualiza-aviso").hidden = false;
    avisar();
  }
  /* Troca para a versão nova e recarrega (chamado pelo botão do aviso e por Ajustes). */
  function aplicar() {
    if (reg && reg.waiting) { pedi = true; reg.waiting.postMessage({ tipo: "ATUALIZAR" }); setTimeout(function () { if (pedi) location.reload(); }, 4000); }
    else location.reload();
  }
  el("atualiza-btn").addEventListener("click", function () { this.disabled = true; aplicar(); });

  function observar(r) {
    reg = r;
    if (r.waiting && navigator.serviceWorker.controller) mostrar("nova");
    r.addEventListener("updatefound", function () {
      var n = r.installing;
      if (!n) return;
      /* Só é atualização se já havia uma versão no controle quando o download começou. Na 1ª instalação não
         há — e no Safari/iPhone o controle chega ANTES do evento "installed", o que parecia uma atualização. */
      var havia = !!navigator.serviceWorker.controller;
      n.addEventListener("statechange", function () {
        if (n.state === "installed" && havia) mostrar("nova");
      });
    });
  }

  function ultimaVerificacao() { try { return Number(localStorage.getItem(K_VERIF)) || 0; } catch (e) { return 0; } }
  /* Procura versão nova. Resolve com: "arquivo" (file://), "offline", "nova" (baixada ou baixando),
     "atualizado" ou "erro". */
  function verificar() {
    if (!temSW) return Promise.resolve("arquivo");
    if (!online()) return Promise.resolve("offline");
    if (ocupado) return ocupado;
    ocupado = (reg ? Promise.resolve(reg) : navigator.serviceWorker.ready).then(function (r) {
      reg = reg || r;
      return r.update();
    }).then(function () {
      return fetch("versao.json?t=" + Date.now(), { cache: "no-store" }).then(function (x) { return x.ok ? x.json() : null; }).catch(function () { return null; });
    }).then(function (remota) {
      try { localStorage.setItem(K_VERIF, String(Date.now())); } catch (e) {}
      var nova = !!(reg && (reg.waiting || reg.installing)) || !!(remota && remota.build && V.build && remota.build !== V.build) || novaPronta;
      return nova ? "nova" : "atualizado";
    }).catch(function () { return "erro"; }).then(function (res) { ocupado = null; avisar(); return res; });
    return ocupado;
  }
  function verificarSeVelho() { if (Date.now() - ultimaVerificacao() > HORA) verificar(); }

  function offlineUi() { el("offline-aviso").hidden = online(); avisar(); }
  window.addEventListener("online", function () { offlineUi(); verificar(); });
  window.addEventListener("offline", offlineUi);
  offlineUi();

  if (temSW) {
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!tinhaControle) { tinhaControle = true; return; }   // 1ª instalação: nada a recarregar
      if (pedi) { pedi = false; location.reload(); } else mostrar("outra");
    });
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (r) { observar(r); setTimeout(verificar, 3000); }).catch(function () {});
    });
    setInterval(verificar, HORA);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") verificarSeVelho(); });
  }

  /* Instalação no computador/celular (Chrome, Edge): o navegador avisa quando o app pode ser instalado. */
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); promptInstalar = e; avisar(); });
  window.addEventListener("appinstalled", function () { promptInstalar = null; avisar(); });
  function instalado() { return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }

  window.BBAtualiza = {
    info: V, temSW: temSW,
    ultimaVerificacao: ultimaVerificacao, verificar: verificar, aplicar: aplicar,
    novaPronta: function () { return novaPronta; },
    instalado: instalado,
    podeInstalar: function () { return !!promptInstalar; },
    instalar: function () {
      if (!promptInstalar) return Promise.resolve(false);
      var p = promptInstalar; promptInstalar = null;
      p.prompt();
      return (p.userChoice || Promise.resolve({})).then(function (c) { avisar(); return !!c && c.outcome === "accepted"; });
    }
  };
})();
