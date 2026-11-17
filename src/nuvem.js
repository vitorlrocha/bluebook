/* Bluebook — conta na nuvem e sincronização automática dos dados pessoais (Firebase por REST, sem SDK).
   - Só funciona quando o build grava window.BB_NUVEM = { apiKey, projectId } (ferramentas/build.js). Sem isso,
     NADA aqui roda e nenhuma chamada sai do aparelho: o app continua só local, como antes.
   - Conta: Firebase Authentication pela API REST "Identity Toolkit" (criar, entrar, redefinir senha, trocar
     senha, entrar com o Google). O aparelho guarda só { uid, email, refreshToken } em "bluebook:nuvem"; o
     token de acesso (1 hora) fica na memória. A senha nunca é guardada.
   - Dados: UM documento por pessoa no Cloud Firestore (usuarios/<uid>), com o mapa "reg". Cada registro:
       chave "<tipo>|<id>"  →  { v: texto ou null (apagado), mod: milissegundos da última alteração, ap: aparelho }
       nota|m:Nome, nota|d:Nome  uma anotação            favm|nome  favorito de medicamento
       favd|Nome                 favorito de doença       um|recents, um|hist, um|rx, um|rxpt, um|rxd, um|rxh, um|pl-kg
     (um|rxh leva só prescritor e CRM: o campo "Paciente" da receita fica só no aparelho.)
   - O app continua gravando no localStorage como sempre. A cada ciclo este módulo tira um "retrato" dos dados
     pessoais e compara com o último estado conhecido ("bluebook:sinc"): o que mudou ganha mod = agora e fica
     marcado para envio; o que sumiu vira registro apagado (v = null). Assim nada no app precisou mudar.
   - Regra de conflito, por registro: vale o mod maior. Anotação alterada nos DOIS lados desde a última
     sincronização, com textos diferentes: fica o texto mais recente e o outro é anexado no fim
     ("— versão do outro aparelho (data):"), sem repetir texto que já esteja lá. Exclusão é só uma marca.
   - Gravação com concorrência otimista: lê o documento, mescla e grava com a pré-condição "updateTime igual
     ao que eu li"; se outro aparelho gravou no meio, lê de novo e repete (até 3 vezes).
   - Quando: ao entrar, quando a internet volta, ao ocultar/fechar o app e a cada 20 s com o app visível
     (só grava se houver mudança local; busca o que veio de outros aparelhos a cada 5 min).
   - Depois de aplicar o que veio da nuvem, chama window.BBPerfil.recarregarMemoria() (src/app.js): a tela é
     redesenhada sem recarregar o app. */
(function () {
  "use strict";
  var K_NUVEM = "bluebook:nuvem", K_SINC = "bluebook:sinc";
  var IDT = "https://identitytoolkit.googleapis.com/v1/accounts:";
  var STS = "https://securetoken.googleapis.com/v1/token";
  var FS = "https://firestore.googleapis.com/v1/";
  var T_ENVIO = 20000, T_BUSCA = 300000, MAX_TENT = 3;
  var MAX_REG = 3000, MAX_BYTES = 900000;     // o Firestore aceita até 1 MiB por documento
  var NOTAS = "bluebook:notes", DFAV = "bluebook:disease-favs", MEDS = "formulario-clinico:medications";
  var UNICOS = ["recents", "hist", "rx", "rxpt", "rxd", "rxh", "pl-kg"];
  var MARCA = /\n\n— versão do outro aparelho \([^)\n]*\):\n/;

  var idToken = null, idExpira = 0, idUid = null;
  var emCurso = null, proximo = null, proximaBusca = false, falha = null, ultimaBusca = 0, adiado = false;

  function cfg() { var c = window.__BB_NUVEM_TESTE || window.BB_NUVEM; return c && c.apiKey && c.projectId ? c : null; }
  function online() { return navigator.onLine !== false; }
  function ler(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function tem(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function norm(e) { return String(e || "").trim().toLowerCase(); }
  function erro(cod) { var e = new Error(cod); e.cod = cod; return e; }
  function avisar() { try { document.dispatchEvent(new CustomEvent("bb:nuvem")); } catch (e) {} }
  function appLogado() { var A = window.BBAuth; return !!(A && A.logado && A.logado()); }

  /* ---------------- Chamadas REST ---------------- */
  function chamar(url, opts, firestore) {
    if (!online()) return Promise.reject(erro("REDE"));
    return fetch(url, opts).catch(function () { throw erro("REDE"); }).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (r.ok) return j || {};
        var m = (j && j.error) || {};
        var cod = firestore ? (m.status || "HTTP_" + r.status) : (String(m.message || "").split(/[\s:]/)[0] || m.status || "HTTP_" + r.status);
        throw erro(cod);
      });
    });
  }
  function idt(acao, corpo) {
    return chamar(IDT + acao + "?key=" + encodeURIComponent(cfg().apiKey),
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  }

  /* ---------------- Conta ---------------- */
  function bruta() { return ler(K_NUVEM) || {}; }
  function sessao() { var s = bruta(); return s.uid && s.refreshToken ? s : null; }
  function guardarSessao(r) {
    if (!r || !r.idToken || !r.refreshToken || !r.localId) throw erro("RESPOSTA");
    idToken = r.idToken; idUid = r.localId; idExpira = Date.now() + (Number(r.expiresIn) || 3600) * 1000 - 120000;
    if (!gravar(K_NUVEM, { uid: r.localId, email: norm(r.email), refreshToken: r.refreshToken })) throw erro("ARMAZENAMENTO");
    falha = null;
    avisar();
    return norm(r.email);
  }
  /* A nuvem não aceita mais este aparelho (senha trocada em outro lugar, conta removida…): é preciso entrar de novo. */
  function perderSessao(motivo) {
    var s = bruta();
    idToken = null; idUid = null;
    gravar(K_NUVEM, { uid: s.uid || "", email: s.email || "", refreshToken: "", reentrar: true, motivo: motivo || "" });
    avisar();
  }
  function token() {
    var s = sessao();
    if (!s) return Promise.reject(erro("SEM_SESSAO"));
    if (idToken && idUid === s.uid && Date.now() < idExpira) return Promise.resolve(idToken);
    return chamar(STS + "?key=" + encodeURIComponent(cfg().apiKey), {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(s.refreshToken)
    }).then(function (r) {
      if (!r.id_token) throw erro("RESPOSTA");
      idToken = r.id_token; idUid = s.uid; idExpira = Date.now() + (Number(r.expires_in) || 3600) * 1000 - 120000;
      if (r.refresh_token && r.refresh_token !== s.refreshToken) { s.refreshToken = r.refresh_token; gravar(K_NUVEM, s); }
      return idToken;
    }, function (e) {
      if (/^(TOKEN_EXPIRED|USER_DISABLED|USER_NOT_FOUND|INVALID_REFRESH_TOKEN|INVALID_GRANT_TYPE|MISSING_REFRESH_TOKEN)$/.test(e.cod)) { perderSessao(""); throw erro("SEM_SESSAO"); }
      throw e;
    });
  }
  function criarConta(email, senha) { return idt("signUp", { email: email, password: senha, returnSecureToken: true }).then(guardarSessao); }
  function entrar(email, senha) { return idt("signInWithPassword", { email: email, password: senha, returnSecureToken: true }).then(guardarSessao); }
  /* Depois do login LOCAL (que funciona sem internet): liga este aparelho à nuvem em segundo plano, com a senha
     que a pessoa acabou de digitar. Conta antiga, que só existia no aparelho, é criada na nuvem com a mesma senha. */
  function ligar(email, senha) {
    if (!cfg()) return Promise.resolve(false);
    var s = sessao();
    if (s && s.email === email) { sincronizar({ busca: true }); return Promise.resolve(true); }
    if (!online()) { avisar(); return Promise.resolve(false); }
    return entrar(email, senha).catch(function (e) {
      if (e.cod === "EMAIL_NOT_FOUND" || e.cod === "INVALID_LOGIN_CREDENTIALS") return criarConta(email, senha);
      throw e;
    }).then(function () { sincronizar({ busca: true }); return true; }, function (e) {
      /* O e-mail já existe na nuvem com OUTRA senha (trocada em outro aparelho ou redefinida por e-mail). */
      if (e.cod === "EMAIL_EXISTS" || e.cod === "INVALID_PASSWORD" || e.cod === "INVALID_LOGIN_CREDENTIALS") perderSessao("senha");
      else { falha = mensagem(e); avisar(); }
      return false;
    });
  }
  /* Entrar com o Google: troca o token do Google Identity Services por uma conta do Firebase. */
  function entrarGoogle(tokenGoogle) {
    if (!tokenGoogle) return Promise.reject(erro("RESPOSTA"));
    return idt("signInWithIdp", {
      postBody: "access_token=" + encodeURIComponent(tokenGoogle) + "&providerId=google.com",
      requestUri: /^https?:/.test(location.origin) ? location.origin : "http://localhost",
      returnSecureToken: true, returnIdpCredential: true
    }).then(guardarSessao);
  }
  /* "Esqueci a senha": o Firebase envia o e-mail com o link. Não revela se o e-mail existe. */
  function redefinir(email) {
    return idt("sendOobCode", { requestType: "PASSWORD_RESET", email: email })
      .then(function () { return true; }, function (e) { if (e.cod === "EMAIL_NOT_FOUND") return true; throw e; });
  }
  /* Troca a senha na nuvem. "atual" nulo = acesso criado pelo Google, que ainda não tinha senha. */
  function trocarSenha(email, atual, nova) {
    if (!online()) return Promise.reject(erro("REDE"));
    var p;
    if (atual) {
      p = entrar(email, atual).then(function () { return idToken; }, function (e) {
        if (e.cod === "EMAIL_NOT_FOUND" || e.cod === "INVALID_LOGIN_CREDENTIALS") {
          /* conta que ainda só existia neste aparelho: nasce na nuvem já com a senha nova */
          return criarConta(email, nova).then(function () { return null; }, function (e2) { throw e2.cod === "EMAIL_EXISTS" ? erro("SENHA_DIFERENTE") : e2; });
        }
        throw e.cod === "INVALID_PASSWORD" ? erro("SENHA_DIFERENTE") : e;
      });
    } else p = token();
    return p.then(function (t) {
      if (!t) return true;
      return idt("update", { idToken: t, password: nova, returnSecureToken: true }).then(function (r) {
        if (r && r.idToken && r.refreshToken) { guardarSessao(r); return true; }
        return entrar(email, nova).then(function () { return true; });
      });
    });
  }
  /* Texto legível para cada erro. onde: "criar", "entrar", "senha", "google" ou nada (sincronização). */
  function mensagem(e, onde) {
    var c = e && e.cod;
    if (c === "REDE") return onde === "senha" ? "Sem internet: a senha não foi alterada. Ela vale para todos os seus aparelhos, então a troca precisa de conexão."
      : onde ? "Sem internet (ou a nuvem não respondeu). Conecte-se e tente de novo."
      : "Não foi possível falar com a nuvem agora. Nova tentativa automática em instantes.";
    if (c === "EMAIL_EXISTS") return "Este e-mail já tem acesso. Toque em “Já tenho acesso” e entre com a sua senha (ou use “Esqueci a senha”).";
    if (c === "WEAK_PASSWORD") return "Senha fraca: escolha uma senha mais longa, com letras e números.";
    if (c === "INVALID_EMAIL" || c === "MISSING_EMAIL") return "Informe um e-mail válido.";
    if (c === "EMAIL_NOT_FOUND" || c === "INVALID_PASSWORD" || c === "INVALID_LOGIN_CREDENTIALS") return "E-mail ou senha incorretos. Se ainda não tem acesso, toque em “Criar acesso”.";
    if (c === "USER_DISABLED") return "Este acesso foi desativado.";
    if (c === "TOO_MANY_ATTEMPTS_TRY_LATER") return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
    if (c === "OPERATION_NOT_ALLOWED" || c === "CONFIGURATION_NOT_FOUND") return "Este tipo de acesso ainda não está ativado na nuvem do app.";
    if (c === "SENHA_DIFERENTE") return "A senha desta conta na nuvem é diferente da senha deste aparelho. Saia e entre de novo, com internet, usando a senha atual da conta.";
    if (c === "CREDENTIAL_TOO_OLD_LOGIN_AGAIN" || c === "TOKEN_EXPIRED" || c === "INVALID_ID_TOKEN" || c === "SEM_SESSAO") return "Por segurança, saia, entre de novo com internet e repita a operação.";
    if (c === "ARMAZENAMENTO") return "Não foi possível salvar neste navegador (sem espaço ou armazenamento bloqueado).";
    if (c === "SEM_NUVEM") return "A sincronização não está disponível nesta versão do app.";
    if (c === "PERMISSION_DENIED") return "A nuvem recusou o acesso aos seus dados. Saia, entre de novo e, se continuar, avise o responsável pelo app.";
    if (c === "RESOURCE_EXHAUSTED") return "A nuvem atingiu o limite de uso de hoje. A sincronização volta sozinha; seus dados continuam salvos neste aparelho.";
    if (c === "GRANDE") return "Seus dados pessoais passaram do limite da nuvem. Apague anotações antigas para voltar a sincronizar.";
    if (c === "LEITURA") return "Não foi possível ler os dados pessoais deste aparelho; nada foi enviado.";
    if (c === "CONFLITO") return "Outro aparelho estava gravando ao mesmo tempo. Nova tentativa automática em instantes.";
    return (onde ? "Não foi possível concluir agora" : "Não foi possível sincronizar agora") + (c ? " (" + c + ")" : "") + ". Tente de novo em instantes.";
  }

  /* ---------------- Retrato dos dados pessoais (localStorage → registros) ---------------- */
  /* Devolve { chave: texto } ou null se algo não pôde ser lido com segurança (nesse caso o ciclo é cancelado,
     para um dado ilegível nunca ser confundido com "a pessoa apagou tudo"). */
  function retrato() {
    var r = {};
    try {
      var n = localStorage.getItem(NOTAS);
      if (n) {
        var o = JSON.parse(n);
        if (!o || typeof o !== "object" || Array.isArray(o)) return null;
        Object.keys(o).forEach(function (k) { if (o[k] && typeof o[k] === "object") r["nota|" + k] = JSON.stringify(o[k]); });
      }
      var d = localStorage.getItem(DFAV);
      if (d) {
        var a = JSON.parse(d);
        if (!Array.isArray(a)) return null;
        a.forEach(function (nome) { if (typeof nome === "string" && nome) r["favd|" + nome] = "1"; });
      }
      var m = localStorage.getItem(MEDS);
      if (m) {
        var e = JSON.parse(m);
        if (!e || e.v !== 2) return null;     // formato antigo: o app migra ao abrir; espera o próximo ciclo
        Object.keys(e.fav || {}).forEach(function (k) { if (e.fav[k]) r["favm|" + k] = "1"; });
      }
      UNICOS.forEach(function (u) {
        var v = localStorage.getItem("bluebook:" + u);
        if (v === null) return;
        if (u === "rxh") {      // cabeçalho da receita: o nome do PACIENTE nunca sai do aparelho
          var h = null; try { h = JSON.parse(v); } catch (x) { h = null; }
          if (!h || typeof h !== "object") return;
          v = JSON.stringify({ pres: String(h.pres || ""), crm: String(h.crm || "") });
        }
        r["um|" + u] = v;
      });
    } catch (x) { return null; }
    return r;
  }
  /* Grava no localStorage os registros vindos da nuvem. Devolve as chaves aplicadas. */
  function aplicarLocal(aplicar, antes) {
    var chaves = Object.keys(aplicar), feitas = [];
    if (!chaves.length) return feitas;
    var agora = retrato();
    if (!agora) throw erro("LEITURA");
    /* Se a pessoa mexeu no registro enquanto a rede respondia, não passa por cima: fica para o próximo ciclo. */
    chaves = chaves.filter(function (k) { return (tem(agora, k) ? agora[k] : null) === (tem(antes, k) ? antes[k] : null); });
    var notas = null, favd = null, meds = null;
    try {
      chaves.forEach(function (k) {
        var i = k.indexOf("|"), tipo = k.slice(0, i), id = k.slice(i + 1), v = aplicar[k];
        if (tipo === "nota") {
          notas = notas || ler(NOTAS) || {};
          if (v === null) delete notas[id]; else notas[id] = JSON.parse(v);
        } else if (tipo === "favd") {
          favd = favd || ler(DFAV) || [];
          var p = favd.indexOf(id);
          if (v === null) { if (p !== -1) favd.splice(p, 1); } else if (p === -1) favd.push(id);
        } else if (tipo === "favm") {
          if (!meds) { meds = ler(MEDS); if (!meds || meds.v !== 2) meds = { v: 2, fav: {}, extras: [] }; meds.fav = meds.fav || {}; }
          if (v === null) delete meds.fav[id]; else meds.fav[id] = true;
        } else if (tipo === "um" && id === "rxh") {      // mantém o "Paciente" deste aparelho
          var h = ler("bluebook:rxh") || {}, nv = v === null ? {} : (JSON.parse(v) || {});
          localStorage.setItem("bluebook:rxh", JSON.stringify({ pac: String(h.pac || ""), pres: String(nv.pres || ""), crm: String(nv.crm || "") }));
        } else if (tipo === "um" && UNICOS.indexOf(id) !== -1) {
          if (v === null) localStorage.removeItem("bluebook:" + id); else localStorage.setItem("bluebook:" + id, v);
        } else return;      // tipo desconhecido (versão mais nova do app em outro aparelho): guarda só no estado
        feitas.push(k);
      });
      if (notas) localStorage.setItem(NOTAS, JSON.stringify(notas));
      if (favd) localStorage.setItem(DFAV, JSON.stringify(favd));
      if (meds) localStorage.setItem(MEDS, JSON.stringify(meds));
    } catch (x) { throw erro("ARMAZENAMENTO"); }
    return feitas;
  }

  /* ---------------- Estado da sincronização neste aparelho ("bluebook:sinc") ----------------
     { uid, ap, ultimo, reg: { chave: { v, mod, suj: 1 se falta enviar, bm: mod que a nuvem tinha na última vez } } } */
  function carregarSinc(uid) {
    var s = ler(K_SINC) || {};
    if (!s.ap) s.ap = Math.random().toString(36).slice(2, 10);
    if (s.uid !== uid || !s.reg || typeof s.reg !== "object") { s.uid = uid; s.reg = {}; s.ultimo = 0; }
    return s;
  }
  /* Compara o retrato com o estado guardado e marca o que mudou. Devolve o retrato (ou null). */
  function detectar(s, agora) {
    var loc = retrato();
    if (!loc) return null;
    var reg = s.reg, mudou = false;
    Object.keys(loc).forEach(function (k) {
      var e = reg[k];
      if (!e) { reg[k] = { v: loc[k], mod: agora, suj: 1 }; mudou = true; }
      else if (e.v !== loc[k]) { reg[k] = { v: loc[k], mod: Math.max(agora, e.mod + 1), suj: 1, bm: e.bm }; mudou = true; }
    });
    Object.keys(reg).forEach(function (k) {
      var e = reg[k];
      if (e.v !== null && !tem(loc, k) && conhecido(k)) { reg[k] = { v: null, mod: Math.max(agora, e.mod + 1), suj: 1, bm: e.bm }; mudou = true; }
    });
    if (mudou) gravar(K_SINC, s);
    return loc;
  }
  function conhecido(k) { var t = k.slice(0, k.indexOf("|")); return t === "nota" || t === "favd" || t === "favm" || (t === "um" && UNICOS.indexOf(k.slice(3)) !== -1); }
  function sujos(reg) { var n = 0; Object.keys(reg).forEach(function (k) { if (reg[k].suj) n++; }); return n; }

  /* ---------------- Mescla (função pura: não altera reg nem R) ---------------- */
  function dataHora(ms) {
    var d = new Date(ms); function z(n) { return (n < 10 ? "0" : "") + n; }
    return z(d.getDate()) + "/" + z(d.getMonth() + 1) + "/" + d.getFullYear() + " " + z(d.getHours()) + ":" + z(d.getMinutes());
  }
  /* Duas versões da mesma anotação: fica a mais recente e a outra vai anexada (sem repetir). null = sem conflito de texto. */
  function fundirNotas(e, r) {
    var a, b;
    try { a = JSON.parse(e.v); b = JSON.parse(r.v); } catch (x) { return null; }
    if (!a || !b || typeof a !== "object" || typeof b !== "object") return null;
    if (String(a.t || "") === String(b.t || "")) return null;
    var localNova = e.mod > r.mod, nova = localNova ? a : b, outra = localNova ? b : a, quando = localNova ? r.mod : e.mod;
    var texto = String(nova.t || "");
    String(outra.t || "").split(MARCA).forEach(function (parte) {
      var p = parte.trim();
      if (p && texto.indexOf(p) === -1) texto += "\n\n— versão do outro aparelho (" + dataHora(quando) + "):\n" + p;
    });
    return JSON.stringify({ t: texto, rev: !!(nova.rev || outra.rev), at: nova.at || outra.at || new Date().toISOString() });
  }
  function mesclar(reg, R, ap, editando) {
    var novo = {}, saida = {}, aplicar = {}, grava = false, adiou = false, todas = {};
    Object.keys(reg).forEach(function (k) { todas[k] = 1; });
    Object.keys(R).forEach(function (k) { todas[k] = 1; });
    function enviar(k, v, mod) { saida[k] = { v: v, mod: mod, ap: ap }; novo[k] = { v: v, mod: mod, bm: mod }; grava = true; }
    function receber(k, e, r) { if (!e || e.v !== r.v) aplicar[k] = r.v; novo[k] = { v: r.v, mod: r.mod, bm: r.mod }; saida[k] = r; }
    Object.keys(todas).forEach(function (k) {
      var e = tem(reg, k) ? reg[k] : null, r = tem(R, k) ? R[k] : null;
      if (!r) {                                   // a nuvem ainda não conhece este registro
        if (e.v === null && e.bm === undefined) return;      // criado e apagado antes de chegar à nuvem
        enviar(k, e.v, e.mod); return;
      }
      if (!e) { receber(k, null, r); return; }
      var rMudou = r.mod !== e.bm;
      if (rMudou && editando === k) { novo[k] = e; saida[k] = r; adiou = true; return; }   // anotação em edição: decide depois
      if (!rMudou) { if (e.suj) enviar(k, e.v, e.mod); else { novo[k] = { v: e.v, mod: e.mod, bm: e.bm }; saida[k] = r; } return; }
      if (!e.suj) { receber(k, e, r); return; }
      /* mudou nos dois lados desde a última sincronização em comum */
      if (e.v === r.v) { novo[k] = { v: r.v, mod: r.mod, bm: r.mod }; saida[k] = r; return; }
      if (k.slice(0, 5) === "nota|") {
        if (e.v !== null && r.v !== null) {
          var f = fundirNotas(e, r);
          if (f !== null) { if (f !== e.v) aplicar[k] = f; enviar(k, f, Math.max(e.mod, r.mod) + 1); return; }
        } else if (e.v !== null) { enviar(k, e.v, Math.max(e.mod, r.mod + 1)); return; }   // apagada lá, editada aqui: fica o texto
        else { receber(k, e, r); return; }                                                // apagada aqui, editada lá: fica o texto
      }
      if (e.mod > r.mod) enviar(k, e.v, e.mod); else receber(k, e, r);
    });
    return { novo: novo, saida: saida, aplicar: aplicar, grava: grava, adiou: adiou };
  }

  /* ---------------- Firestore (REST) ---------------- */
  function urlDoc(uid) { return FS + "projects/" + encodeURIComponent(cfg().projectId) + "/databases/(default)/documents/usuarios/" + encodeURIComponent(uid); }
  function deDoc(d) {
    var R = {}, f = (d && d.fields && d.fields.reg && d.fields.reg.mapValue && d.fields.reg.mapValue.fields) || {};
    Object.keys(f).forEach(function (k) {
      var c = f[k] && f[k].mapValue && f[k].mapValue.fields;
      if (!c || !c.mod) return;
      R[k] = { v: c.v && typeof c.v.stringValue === "string" ? c.v.stringValue : null, mod: Number(c.mod.integerValue) || 0, ap: (c.ap && c.ap.stringValue) || "" };
    });
    return R;
  }
  function paraDoc(R) {
    var f = {};
    Object.keys(R).forEach(function (k) {
      var x = R[k];
      f[k] = { mapValue: { fields: { v: x.v === null ? { nullValue: null } : { stringValue: x.v }, mod: { integerValue: String(x.mod) }, ap: { stringValue: x.ap || "" } } } };
    });
    return { fields: { v: { integerValue: "1" }, reg: { mapValue: { fields: f } } } };
  }
  function lerDoc(t, uid) {
    return chamar(urlDoc(uid), { headers: { Authorization: "Bearer " + t } }, true)
      .then(function (d) { return { R: deDoc(d), ut: d.updateTime || null }; },
        function (e) { if (e.cod === "NOT_FOUND") return { R: {}, ut: null }; throw e; });
  }
  function gravarDoc(t, uid, R, ut) {
    if (Object.keys(R).length > MAX_REG) return Promise.reject(erro("GRANDE"));
    var corpo = JSON.stringify(paraDoc(R));
    if (corpo.length > MAX_BYTES) return Promise.reject(erro("GRANDE"));
    var opts = { method: "PATCH", headers: { Authorization: "Bearer " + t, "Content-Type": "application/json" }, body: corpo };
    /* App sendo ocultado/fechado: pede ao navegador para terminar o envio mesmo assim (limite de ~64 KB). */
    if (document.visibilityState === "hidden" && corpo.length < 60000) opts.keepalive = true;
    return chamar(urlDoc(uid) + "?currentDocument." + (ut ? "updateTime=" + encodeURIComponent(ut) : "exists=false"), opts, true)
      .catch(function (e) { throw /^(FAILED_PRECONDITION|ALREADY_EXISTS|ABORTED|NOT_FOUND)$/.test(e.cod) ? erro("CONFLITO") : e; });
  }

  /* ---------------- Ciclo ---------------- */
  function editando() { var P = window.BBPerfil, k = P && P.editando ? P.editando() : null; return k ? "nota|" + k : null; }
  function ciclo(buscar) {
    var s0 = sessao();
    if (!s0 || !appLogado()) return Promise.resolve();
    var uid = s0.uid, s = carregarSinc(uid);
    var loc = detectar(s, Date.now());
    if (!loc) return Promise.reject(erro("LEITURA"));
    if (!sujos(s.reg) && !buscar) return Promise.resolve();
    if (!online()) return Promise.resolve();
    var renovou = false;
    function tentar(n) {
      return token().then(function (t) {
        return lerDoc(t, uid).then(function (d) {
          ultimaBusca = Date.now();
          var m = mesclar(s.reg, d.R, s.ap, editando());
          adiado = m.adiou;
          return (m.grava ? gravarDoc(t, uid, m.saida, d.ut) : Promise.resolve()).then(function () { concluir(s, m, loc); });
        });
      }).catch(function (e) {
        if (e.cod === "CONFLITO" && n < MAX_TENT) return tentar(n + 1);
        if (e.cod === "UNAUTHENTICATED" && !renovou) { renovou = true; idToken = null; return tentar(n); }
        throw e;
      });
    }
    return tentar(1);
  }
  function concluir(s, m, loc) {
    var antigo = s.reg, feitas = aplicarLocal(m.aplicar, loc);
    /* o que não pôde ser aplicado agora (a pessoa mexeu no meio) volta ao estado anterior e é reavaliado depois */
    Object.keys(m.aplicar).forEach(function (k) {
      if (feitas.indexOf(k) !== -1 || !conhecido(k)) return;
      if (tem(antigo, k)) m.novo[k] = antigo[k]; else delete m.novo[k];
    });
    s.reg = m.novo; s.ultimo = Date.now();
    gravar(K_SINC, s);
    if (feitas.length && window.BBPerfil && window.BBPerfil.recarregarMemoria) {
      try { window.BBPerfil.recarregarMemoria(feitas); } catch (e) { /* a tela se acerta na próxima navegação */ }
    }
  }
  /* Sincroniza agora. opc.busca = também lê o que veio de outros aparelhos. Nunca rejeita: devolve o estado. */
  function sincronizar(opc) {
    if (!cfg()) return Promise.resolve(estado());
    /* Já há um ciclo em andamento: ele tirou o retrato ANTES deste pedido, então uma mudança feita agora não iria
       nele. Agenda um ciclo novo logo depois (um só, para quantos pedidos chegarem no meio). */
    if (emCurso) {
      if (opc && opc.busca) proximaBusca = true;
      if (!proximo) proximo = emCurso.then(function () { var b = proximaBusca; proximo = null; proximaBusca = false; return sincronizar({ busca: b }); });
      return proximo;
    }
    var p;
    try { p = ciclo(!!(opc && opc.busca)); } catch (e) { p = Promise.reject(e); }
    emCurso = p.then(function () { falha = null; }, function (e) {
      if (e && e.cod === "SEM_SESSAO") falha = null;      // o estado já diz que é preciso entrar de novo
      else falha = mensagem(e && e.cod ? e : erro(""));
    }).then(function () { emCurso = null; avisar(); return estado(); });
    avisar();
    return emCurso;
  }
  function automatico() {
    if (!cfg() || !sessao() || !appLogado()) return;
    sincronizar({ busca: adiado || Date.now() - ultimaBusca >= T_BUSCA });
  }

  /* ---------------- Estado para a tela (Ajustes → Sincronização) ---------------- */
  function hora(ms) {
    var d = new Date(ms), h = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return d.toDateString() === new Date().toDateString() ? "às " + h : "em " + d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " às " + h;
  }
  function estado() {
    var c = cfg(), b = bruta(), s = sessao(), pend = false, ultimo = 0;
    if (c && s) {
      var st = carregarSinc(s.uid);
      if (appLogado() && !emCurso) detectar(st, Date.now());
      pend = sujos(st.reg) > 0; ultimo = st.ultimo || 0;
    }
    var e = { configurado: !!c, conectado: !!s, email: (s && s.email) || b.email || null, reentrar: !!b.reentrar, ultimo: ultimo,
      pendente: pend, online: online(), sincronizando: !!emCurso, erro: falha };
    var fica = " Seus dados continuam salvos neste aparelho.";
    e.texto = !e.configurado ? "A sincronização não está disponível nesta versão do app."
      : !e.conectado ? (b.motivo === "senha" ? mensagem(erro("SENHA_DIFERENTE")) + fica
        : e.reentrar ? "O acesso deste aparelho à nuvem expirou. Saia e entre de novo, com internet, para voltar a sincronizar." + fica
        : "Este aparelho ainda não está ligado à nuvem. Saia e entre de novo, com internet, para ligar a sincronização." + fica)
      : e.sincronizando ? "Sincronizando…"
      : !e.online ? (e.pendente ? "Sem internet — será enviado quando voltar" : "Sem internet — nada a enviar" + (ultimo ? " (sincronizado " + hora(ultimo) + ")" : ""))
      : e.erro ? e.erro
      : e.pendente ? "Há mudanças a enviar"
      : ultimo ? "Sincronizado " + hora(ultimo)
      : "Ainda não sincronizado";
    return e;
  }

  /* ---------------- Exclusão da conta (LGPD: direito de eliminação) ---------------- */
  /* Apaga o documento da pessoa no Firestore e a conta no Firebase Authentication. Os dados deste aparelho ficam
     (a pessoa decide à parte). Contas com senha: entra de novo para ter um token recente (o Firebase exige login
     recente para excluir). Contas só do Google: usa o token atual; se for antigo, pede para sair e entrar de novo. */
  function excluirConta(senha) {
    var s = sessao();
    if (!cfg()) return Promise.reject(erro("SEM_NUVEM"));
    if (!s) return Promise.reject(erro("SEM_SESSAO"));
    if (!online()) return Promise.reject(erro("REDE"));
    var p = senha ? entrar(s.email, senha).then(function () { return idToken; }) : token();
    return p.then(function (t) {
      return chamar(urlDoc(s.uid), { method: "DELETE", headers: { Authorization: "Bearer " + t } }, true)
        .catch(function (e) { if (e.cod !== "NOT_FOUND") throw e; })
        .then(function () { return idt("delete", { idToken: t }); });
    }).then(function () {
      idToken = null; idUid = null;
      try { localStorage.removeItem(K_NUVEM); localStorage.removeItem(K_SINC); } catch (e) { /* nada a fazer */ }
      avisar();
      return true;
    });
  }

  window.BBNuvem = {
    configurado: function () { return !!cfg(); },
    estado: estado, sincronizar: sincronizar,
    criarConta: criarConta, entrar: entrar, ligar: ligar, entrarGoogle: entrarGoogle,
    redefinir: redefinir, trocarSenha: trocarSenha, mensagem: mensagem, excluirConta: excluirConta
  };

  /* Gatilhos. Sem nuvem configurada, cada um deles sai na primeira linha. */
  setInterval(function () { if (document.visibilityState !== "hidden") automatico(); }, T_ENVIO);
  window.addEventListener("online", function () { if (cfg() && sessao() && appLogado()) sincronizar({ busca: true }); });
  window.addEventListener("offline", function () { if (cfg()) avisar(); });
  document.addEventListener("visibilitychange", function () {
    if (!cfg() || !sessao() || !appLogado()) return;
    if (document.visibilityState === "hidden") sincronizar();     // envia o que estiver pendente
    else automatico();
  });
  window.addEventListener("pagehide", function () { if (cfg() && sessao() && appLogado()) sincronizar(); });
  document.addEventListener("bb:login", function () { if (cfg()) setTimeout(function () { if (sessao() && appLogado()) sincronizar({ busca: true }); }, 600); });
  window.addEventListener("load", function () { if (cfg()) setTimeout(function () { if (sessao() && appLogado()) sincronizar({ busca: true }); }, 1500); });
})();
