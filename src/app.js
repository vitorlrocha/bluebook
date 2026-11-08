
(function () {
  "use strict";

  var medications = [];
  var selectedId = null;
  var searchTerm = "";
  var store = null;

  var sidebarEl = document.getElementById("sidebar");
  var detailEl = document.getElementById("detail");
  var searchInput = document.getElementById("search-input");
  var storageNote = document.getElementById("storage-note");

  function stripAccents(s) {
    return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /* Siglas e sinônimos usados na busca */
  var SYN = {
    iam: ["infarto agudo do miocardio", "infarto"], has: ["hipertensao arterial", "hipertensao"], aas: ["acido acetilsalicilico"], dm: ["diabetes mellitus", "diabetes"], dm2: ["diabetes mellitus tipo 2"], dm1: ["diabetes mellitus tipo 1"],
    avc: ["acidente vascular cerebral", "acidente vascular"], ave: ["acidente vascular"], itu: ["infeccao do trato urinario", "infeccao urinaria"], dpoc: ["doenca pulmonar obstrutiva cronica"], icc: ["insuficiencia cardiaca"], ic: ["insuficiencia cardiaca"],
    tep: ["tromboembolismo pulmonar", "embolia pulmonar"], tvp: ["trombose venosa profunda"], tev: ["tromboembolismo venoso"], lra: ["lesao renal aguda", "insuficiencia renal aguda"], drc: ["doenca renal cronica"], irc: ["insuficiencia renal cronica", "doenca renal cronica"],
    fa: ["fibrilacao atrial"], sca: ["sindrome coronariana aguda"], pcr: ["parada cardiorrespiratoria"], tce: ["traumatismo cranioencefalico"], hda: ["hemorragia digestiva alta"], hdb: ["hemorragia digestiva baixa"],
    drge: ["doenca do refluxo gastroesofagico", "refluxo"], les: ["lupus eritematoso sistemico", "lupus"], ar: ["artrite reumatoide"], ivas: ["infeccao de vias aereas superiores", "resfriado"], oma: ["otite media aguda"], tb: ["tuberculose"],
    hiv: ["imunodeficiencia humana", "aids"], ist: ["infeccao sexualmente transmissivel"], sii: ["sindrome do intestino irritavel"], dac: ["doenca arterial coronariana"], eap: ["edema agudo de pulmao"], srag: ["sindrome respiratoria aguda grave"],
    dip: ["doenca inflamatoria pelvica"], hpb: ["hiperplasia prostatica benigna"], sop: ["sindrome dos ovarios policisticos"], tdah: ["deficit de atencao", "hiperatividade"], tea: ["transtorno do espectro autista", "autismo"], toc: ["transtorno obsessivo compulsivo"],
    tag: ["transtorno de ansiedade generalizada"], dii: ["doenca inflamatoria intestinal", "crohn", "retocolite"], hsa: ["hemorragia subaracnoidea"], ait: ["ataque isquemico transitorio"], cad: ["cetoacidose diabetica", "doenca arterial coronariana"],
    ctx: ["corticoide", "corticosteroide"], atb: ["antibiotico"], ains: ["anti-inflamatorio"], aine: ["anti-inflamatorio nao esteroidal"], iecas: ["inibidor da eca"], ieca: ["inibidor da enzima conversora"], bra: ["bloqueador do receptor de angiotensina"],
    ibp: ["inibidor da bomba de protons"], dtg: ["dolutegravir"], rn: ["recem-nascido"], ig: ["idade gestacional"], dpp: ["descolamento prematuro de placenta", "data provavel do parto"], pe: ["pre-eclampsia"], dhegt: ["doenca hipertensiva especifica da gestacao"]
  };
  var SYN2 = { pac: ["pneumonia adquirida na comunidade"], gea: ["gastroenterite aguda"], ira: ["insuficiencia respiratoria aguda"], ivu: ["infeccao urinaria"], bcp: ["pneumonia"], hic: ["hipertensao intracraniana"], hds: ["hemorragia digestiva"], rge: ["refluxo gastroesofagico"], pti: ["purpura trombocitopenica imune"], lma: ["leucemia mieloide aguda"], lla: ["leucemia linfoblastica aguda"], llc: ["leucemia linfocitica cronica"], lmc: ["leucemia mieloide cronica"], sdra: ["desconforto respiratorio agudo"], hcv: ["hepatite c"], hbv: ["hepatite b"], hpp: ["hemorragia pos-parto"], dmg: ["diabetes gestacional"], eh: ["encefalopatia hepatica"], pbe: ["peritonite bacteriana espontanea"], cah: ["cetoacidose"], ehh: ["estado hiperglicemico hiperosmolar"], dpoc: ["doenca pulmonar obstrutiva cronica"], tdm: ["transtorno depressivo maior", "depressao"], tab: ["transtorno afetivo bipolar", "bipolar"], ela: ["esclerose lateral amiotrofica"], em: ["esclerose multipla"], fr: ["febre reumatica"], vsr: ["virus sincicial respiratorio"], dengue: ["dengue"], ivas: ["infeccao de vias aereas superiores"], amigdalite: ["faringoamigdalite"], ac: ["anticoagulante"], doac: ["anticoagulante oral direto"], noac: ["anticoagulante oral direto"], isrs: ["inibidor seletivo da recaptacao de serotonina", "isrs"], bcc: ["bloqueador de canal de calcio", "canal de calcio"], bb: ["betabloqueador"] };
  Object.keys(SYN2).forEach(function (k) { if (!SYN[k]) SYN[k] = SYN2[k]; });
  function stemW(w) { return w.length > 4 && /[^s]s$/.test(w) && !/(ose|ase|ite|us|is)$/.test(w.slice(0, -1) + "s") ? w.slice(0, -1) : w; }
  /* Desempenho: termSets é chamado para cada item a cada tecla; o resultado só depende do termo. */
  var _termSetsMemo = {}, _termSetsN = 0;
  function termSets(term) {
    var key = String(term || "");
    if (Object.prototype.hasOwnProperty.call(_termSetsMemo, key)) return _termSetsMemo[key];
    var words = stripAccents(key.trim().toLowerCase()).split(/\s+/).filter(Boolean).map(stemW), sets = [words];
    words.forEach(function (w, i) { (SYN[w] || []).forEach(function (e) { sets.push(words.slice(0, i).concat(e.split(" "), words.slice(i + 1))); }); });
    if (++_termSetsN > 500) { _termSetsMemo = {}; _termSetsN = 1; }
    return (_termSetsMemo[key] = sets);
  }
  /* Desempenho: um único Collator (mesmo resultado de localeCompare(x, "pt-BR"), bem mais rápido). */
  var COLL_PT = new Intl.Collator("pt-BR");
  function cmpPt(a, b) { return COLL_PT.compare(a, b); }
  /* Desempenho: texto normalizado (sem acento, minúsculo) de cada registro, calculado uma vez por objeto. */
  var _hayCache = typeof WeakMap === "function" ? new WeakMap() : null;
  function hayOf(obj, kind, build) {
    if (!_hayCache) return build();
    var e = _hayCache.get(obj); if (!e) { e = {}; _hayCache.set(obj, e); }
    return e[kind] !== undefined ? e[kind] : (e[kind] = build());
  }
  /* Desempenho: nomes normalizados (sem acento, minúsculos) memorizados; resultado idêntico a stripAccents(s.toLowerCase()). */
  var _normMemo = typeof Map === "function" ? new Map() : null;
  function normLower(s) {
    s = String(s || "");
    if (!_normMemo) return stripAccents(s.toLowerCase());
    var v = _normMemo.get(s);
    if (v === undefined) { if (_normMemo.size > 20000) _normMemo.clear(); v = stripAccents(s.toLowerCase()); _normMemo.set(s, v); }
    return v;
  }
  function relScore(name, alt, term) {
    var n = normLower(name), a = normLower(alt);
    var q = stripAccents(String(term || "").trim().toLowerCase()), ws = q.split(/\s+/).filter(Boolean).map(stemW);
    if (!q) return 0;
    if (n === q) return 1000;
    if (n.indexOf(q) === 0 && (q.length > 3 || !SYN[q] || !/[a-z0-9]/.test(n.charAt(q.length)))) return 900 - Math.min(n.length, 300) / 10;
    var wordStart = ws.every(function (t) { return new RegExp("(^|[^a-z0-9])" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(n); });
    if (wordStart) return 800 - Math.min(n.length, 300) / 10;
    if (ws.every(function (t) { return tokMatch(n, t); })) return 700 - Math.min(n.length, 300) / 10;
    if (termSets(q).some(function (set) { return set.every(function (t) { return tokMatch(n, t); }); })) return 650;
    if (a && ws.every(function (t) { return a.indexOf(t) !== -1; })) return 500;
    var some = ws.filter(function (t) { return n.indexOf(t) !== -1; }).length;
    return some ? 300 + some * 10 : 100;
  }
  var _tokRx = {};
  function tokMatch(hay, t) {
    var i = hay.indexOf(t);
    if (i === -1) return false;
    if (t.length > 3 || /\d/.test(t)) return true;
    var rx = _tokRx[t];
    if (!rx) { var e = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); rx = _tokRx[t] = SYN[t] ? new RegExp("(^|[^a-z0-9])" + e + "([^a-z0-9]|$)") : new RegExp("(^|[^a-z0-9])" + e); }
    return rx.test(hay);
  }
  function matchTerm(hay, term) { return termSets(term).some(function (set) { return set.every(function (t) { return tokMatch(hay, t); }); }); }
  /* Desempenho: pré-filtro exato por trigramas (filtro de Bloom de 4096 bits por registro).
     Se t está contido no texto, todos os trigramas de t estão no filtro; logo, um bit ausente prova que
     tokMatch daria falso. O filtro só descarta registros e nunca muda o resultado de matchTerm. */
  function _tri(s, i) { return (s.charCodeAt(i) * 961 + s.charCodeAt(i + 1) * 31 + s.charCodeAt(i + 2)) & 4095; }
  function bloomOf(hay) {
    var b = new Uint32Array(128);
    for (var i = 0, n = hay.length - 2; i < n; i++) { var h = _tri(hay, i); b[h >>> 5] |= 1 << (h & 31); }
    return b;
  }
  function bloomMay(b, t) {
    for (var i = 0, n = t.length - 2; i < n; i++) { var h = _tri(t, i); if (!(b[h >>> 5] & (1 << (h & 31)))) return false; }
    return true;
  }
  /* matchTerm com o pré-filtro; obj = registro (chave do cache), hay = texto normalizado do registro. */
  function matchRec(obj, hay, term) {
    var b = typeof Uint32Array === "function" ? hayOf(obj, "bloom", function () { return bloomOf(hay); }) : null;
    return termSets(term).some(function (set) { return set.every(function (t) { return (!b || bloomMay(b, t)) && tokMatch(hay, t); }); });
  }
  var HIST = [];
  try { HIST = JSON.parse(window.localStorage.getItem("bluebook:hist") || "[]"); } catch (e) { HIST = []; }
  function histAdd(t) {
    t = String(t || "").trim(); if (t.length < 2) return;
    HIST = HIST.filter(function (x) { return x !== t; }); HIST.unshift(t); HIST = HIST.slice(0, 8);
    try { window.localStorage.setItem("bluebook:hist", JSON.stringify(HIST)); } catch (e) {}
  }
  function hl(text, set) {
    var s = String(text || ""), plain = stripAccents(s.toLowerCase()), marks = [];
    (set || []).forEach(function (t) { if (t.length < 2) return; var i = plain.indexOf(t); if (i !== -1) marks.push([i, i + t.length]); });
    if (!marks.length) return escapeHtml(s);
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var out = "", pos = 0;
    marks.forEach(function (m) { if (m[0] < pos) return; out += escapeHtml(s.slice(pos, m[0])) + "<mark>" + escapeHtml(s.slice(m[0], m[1])) + "</mark>"; pos = m[1]; });
    return out + escapeHtml(s.slice(pos));
  }

  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- Storage layer ---------------- */

  function makeMemoryStore() {
    var items = [];
    var listeners = [];
    function notify() {
      var copy = items.slice();
      listeners.forEach(function (fn) { fn(copy); });
    }
    return {
      persistent: false,
      subscribe: function (fn) {
        listeners.push(fn);
        fn(items.slice());
        return function () { listeners = listeners.filter(function (l) { return l !== fn; }); };
      },
      add: function (data) {
        var id = "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
        items.push(Object.assign({ id: id }, data));
        notify();
        return Promise.resolve(id);
      },
      updateMany: function (map) {
        items = items.map(function (it) { return map[it.id] ? Object.assign({}, it, map[it.id]) : it; });
        notify();
        return Promise.resolve();
      },
      addMany: function (arr) {
        arr.forEach(function (data, i) {
          items.push(Object.assign({ id: "local-" + Date.now() + "-" + i + "-" + Math.random().toString(36).slice(2, 8) }, data));
        });
        notify();
        return Promise.resolve();
      },
      update: function (id, data) {
        items = items.map(function (it) { return it.id === id ? Object.assign({}, it, data) : it; });
        notify();
        return Promise.resolve();
      }
    };
  }

  function makeLocalStorageStore() {
    var KEY = "formulario-clinico:medications";
    var listeners = [];
    function readAll() {
      try {
        var raw = window.localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }
    function writeAll(items) {
      try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { console.error(e); }
    }
    function notify() {
      var items = readAll();
      listeners.forEach(function (fn) { fn(items); });
    }
    return {
      persistent: true,
      subscribe: function (fn) {
        listeners.push(fn);
        fn(readAll());
        return function () { listeners = listeners.filter(function (l) { return l !== fn; }); };
      },
      add: function (data) {
        var items = readAll();
        var id = "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
        items.push(Object.assign({ id: id }, data));
        writeAll(items);
        notify();
        return Promise.resolve(id);
      },
      updateMany: function (map) {
        var items = readAll().map(function (it) { return map[it.id] ? Object.assign({}, it, map[it.id]) : it; });
        writeAll(items);
        notify();
        return Promise.resolve();
      },
      addMany: function (arr) {
        var items = readAll();
        arr.forEach(function (data, i) {
          items.push(Object.assign({ id: "local-" + Date.now() + "-" + i + "-" + Math.random().toString(36).slice(2, 8) }, data));
        });
        writeAll(items);
        notify();
        return Promise.resolve();
      },
      update: function (id, data) {
        var items = readAll().map(function (it) { return it.id === id ? Object.assign({}, it, data) : it; });
        writeAll(items);
        notify();
        return Promise.resolve();
      },
      replaceAll: function (items) {
        writeAll(items);
        notify();
        return Promise.resolve();
      }
    };
  }

  function makeDbStore(col) {
    return {
      persistent: true,
      subscribe: function (fn) {
        return col.orderBy("nome").onSnapshot(
          function (snap) {
            var arr = snap.docs.map(function (d) {
              return Object.assign({ id: d.id }, d.data());
            });
            fn(arr);
          },
          function (err) {
            console.error("db onSnapshot error", err);
          }
        );
      },
      add: function (data) {
        return col.add(data).then(function (ref) { return ref.id; });
      },
      addMany: function (arr) {
        var chain = Promise.resolve();
        for (var i = 0; i < arr.length; i += 40) {
          (function (chunk) {
            chain = chain.then(function () {
              return Promise.all(chunk.map(function (d) { return col.add(d); }));
            });
          })(arr.slice(i, i + 40));
        }
        return chain;
      },
      update: function (id, data) {
        return col.doc(id).update(data);
      }
    };
  }

  /* ---------------- Seed data (starting reference set) ---------------- */
  /* Perfil geral de fármacos amplamente estabelecidos, para ponto de partida.
     Sempre confirme dose, contraindicação e interação na bula oficial vigente
     (link "Ver bula oficial atualizada" em cada ficha). */
  var SEED_MEDS = /*@dados:SEED_MEDS*/[];

  var DISEASES = /*@dados:DISEASES*/[];

  var seedAttempted = false;
  var seeding = false;

  function runSeed() {
    if (seeding) return Promise.resolve();
    seeding = true;
    var existingNames = medications.map(function (m) { return (m.nome || "").trim().toLowerCase(); });
    var toAdd = SEED_MEDS.filter(function (m) { return existingNames.indexOf(m.nome.toLowerCase()) === -1; });
    var now = Date.now();
    if (store.addMany) {
      return store.addMany(toAdd.map(function (med) {
        return Object.assign({}, med, { createdAt: now, updatedAt: now, seedRev: SEED_REV });
      })).finally(function () { seeding = false; });
    }
    return toAdd.reduce(function (chain, med) {
      return chain.then(function () {
        return store.add(Object.assign({}, med, { createdAt: now, updatedAt: now }));
      });
    }, Promise.resolve()).finally(function () { seeding = false; });
  }

  /* Sincroniza correções da biblioteca com registros já salvos que o usuário nunca editou
     (os editados à mão não são tocados). Incrementar SEED_REV a cada revisão da biblioteca. */
  var SEED_REV = 22;
  var syncingSeed = false;

  function syncSeedUpdates(items) {
    if (!store || syncingSeed) return;
    var seedByName = {};
    SEED_MEDS.forEach(function (s) { seedByName[s.nome.trim().toLowerCase()] = s; });
    var todo = items.filter(function (m) {
      var s = seedByName[(m.nome || "").trim().toLowerCase()];
      if (!s || m.seedRev === SEED_REV) return false;
      return !m.updatedAt || !m.createdAt || m.updatedAt === m.createdAt;
    });
    if (!todo.length) return;
    syncingSeed = true;
    if (store.updateMany) {
      var map = {};
      todo.forEach(function (m) {
        var s2 = seedByName[(m.nome || "").trim().toLowerCase()];
        var d2 = { seedRev: SEED_REV };
        Object.keys(s2).forEach(function (k) { if (k !== "nome") d2[k] = s2[k]; });
        map[m.id] = d2;
      });
      store.updateMany(map).catch(function (err) { console.error(err); }).then(function () { syncingSeed = false; });
      return;
    }
    todo.reduce(function (chain, m) {
      var s = seedByName[(m.nome || "").trim().toLowerCase()];
      var data = { seedRev: SEED_REV };
      Object.keys(s).forEach(function (k) { if (k !== "nome") data[k] = s[k]; });
      return chain.then(function () { return store.update(m.id, data); });
    }, Promise.resolve()).catch(function (err) { console.error(err); }).then(function () { syncingSeed = false; });
  }

  function localStorageAvailable() {
    try {
      var t = "__fc_test__";
      window.localStorage.setItem(t, "1");
      window.localStorage.removeItem(t);
      return true;
    } catch (e) { return false; }
  }

  function initStore() {
    var useDb = window.claude && typeof window.claude.use === "function"
      ? window.claude.use("db").catch(function () { return null; })
      : Promise.resolve(null);

    useDb.then(function (db) {
      if (db) {
        store = makeDbStore(db.collection("medications"));
        storageNote.style.display = "none";
      } else if (localStorageAvailable()) {
        store = makeLocalStorageStore();
        storageNote.style.display = "block";
        storageNote.className = "storage-note storage-note-ok";
        storageNote.textContent = "Armazenamento local ativo: os medicamentos ficam salvos neste navegador/computador, mesmo offline.";
      } else {
        store = makeMemoryStore();
        storageNote.style.display = "block";
        storageNote.className = "storage-note";
        storageNote.textContent = "Sem armazenamento persistente disponível: os medicamentos cadastrados serão perdidos ao recarregar a página.";
      }

      store.subscribe(function (items) {
        medications = items;
        if (seeding) {
          clearTimeout(window.__rt);
          window.__rt = setTimeout(render, 250);
        } else {
          render();
        }
        syncSeedUpdates(items);
        if (!seedAttempted && items.length < SEED_MEDS.length) {
          seedAttempted = true;
          runSeed();
        }
      });
    });
  }

  /* ---------------- Rendering ---------------- */

  var classFilter = "";
  var favOnly = false;

  var STAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

  function toggleFavorite(m) {
    store.update(m.id, { favorito: !m.favorito });
  }

  /* ---------------- Grupos terapêuticos (classes padronizadas) ---------------- */
  var CLASS_GROUPS = /*@dados:CLASS_GROUPS*/[];
  
  function medGroup(m) {
    if (m._g) return m._g;
    var c = stripAccents((m.classe || "").toLowerCase());
    for (var i = 0; i < CLASS_GROUPS.length; i++) if (CLASS_GROUPS[i][1].test(c)) return (m._g = CLASS_GROUPS[i][0]);
    return (m._g = "Outros");
  }
  /* Texto de busca de cada registro (sem acento, minúsculo), em cache por objeto. */
  function medHay(m) {
    return hayOf(m, "busca", function () { return stripAccents(((m.nome || "") + " " + (m.referencias || "") + " " + (m.classe || "") + " " + medGroup(m) + " " + (m.esp || "") + " " + (m.indicacoes || "") + " " + (m.apresentacoes || "") + " " + (m.posologia || "") + " " + (m.observacoes || "") + " " + (m.areas || "")).toLowerCase()); });
  }
  function disHay(d) {
    return hayOf(d, "busca", function () { return stripAccents(((d.nome || "") + " " + (d.cid || "") + " " + (d.area || "") + " " + (d.esp || "") + " " + (d.introducao || "") + " " + (d.criterios || "") + " " + (d.exames || "") + " " + (d.tratamento || "") + " " + (d.conduta || "") + " " + (d.prescricao || "")).toLowerCase()); });
  }
  var _medSorted = { src: null, list: [] };
  function filteredSorted() {
    var term = stripAccents(searchTerm.trim().toLowerCase());
    /* Desempenho: a ordem alfabética só muda quando a lista "medications" é trocada pelo store. */
    if (_medSorted.src !== medications) {
      _medSorted = { src: medications, list: medications.slice().sort(function (a, b) { return cmpPt(a.nome || "", b.nome || ""); }) };
    }
    var list = _medSorted.list.slice();
    if (classFilter) {
      list = list.filter(function (m) { return medGroup(m) === classFilter || (m.classe || "").trim() === classFilter; });
    }
    if (bigArea) {
      list = list.filter(function (m) { return medHasArea(m, bigArea); });
    }
    if (espFilter) list = list.filter(function (m) { return hasEsp(m, espFilter); });
    if (favOnly) {
      list = list.filter(function (m) { return !!m.favorito; });
    }
    if (!term) return list;
    var exact = list.filter(function (m) {
      return matchRec(m, medHay(m), term);
    });
    if (exact.length) {
      exact.forEach(function (m) { m._rs = relScore(m.nome, (m.referencias || "") + " " + (m.classe || "") + " " + medGroup(m), term); });
      return exact.sort(function (a, b) { return (b._rs - a._rs) || cmpPt(a.nome || "", b.nome || ""); });
    }
    if (term.length < 4) return exact;
    /* Busca tolerante a erros de grafia (ex.: "tansulosina" -> Tamsulosina) */
    return list.filter(function (m) {
      var words = hayOf(m, "palavras", function () { return stripAccents(((m.nome || "") + " " + (m.referencias || "")).toLowerCase()).split(/[^a-z0-9]+/); });
      return term.split(/\s+/).every(function (t) {
        var tol = t.length >= 9 ? 2 : 1;
        return words.some(function (w) {
          if (w.length < 3) return false;
          if (w.indexOf(t) !== -1) return true;
          var cut = w.length > t.length ? w.slice(0, t.length + tol) : w;
          return editDist(t, w) <= tol || editDist(t, cut) <= tol;
        });
      });
    });
  }

  function editDist(a, b) {
    if (Math.abs(a.length - b.length) > 3) return 9;
    var prev = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      var cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }

  function updateClassOptions() {
    var select = document.getElementById("class-filter");
    if (!select) return;
    var cnt = {};
    medications.forEach(function (m) { var g = medGroup(m); cnt[g] = (cnt[g] || 0) + 1; });
    var key = medications.length + ":" + Object.keys(cnt).length;
    if (select.getAttribute("data-k") === key) return;
    var groups = Object.keys(cnt).sort(function (a, b) { return a === "Outros" ? 1 : b === "Outros" ? -1 : a.localeCompare(b, "pt-BR"); });
    var current = classFilter;
    select.innerHTML = '<option value="">Todas as classes (' + groups.length + ")</option>" +
      groups.map(function (c) { return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + " (" + cnt[c] + ")</option>"; }).join("");
    select.setAttribute("data-k", key);
    select.value = groups.indexOf(current) !== -1 ? current : "";
  }

  function renderSidebar() {
    updateClassOptions();
    var list = filteredSorted();
    if (medications.length === 0) {
      sidebarEl.innerHTML =
        '<div class="empty-sidebar">Biblioteca vazia. Abra o menu ⋮ e use "Carregar biblioteca".</div>';
      return;
    }
    if (list.length === 0) {
      sidebarEl.innerHTML =
        '<div class="no-results">Nenhum resultado para “' + escapeHtml(searchTerm) + '”.</div>';
      return;
    }
    function itemHtml(m) {
      var subSource = m.classe ? m.classe : (m.apresentacoes || "");
      var sub = subSource ? escapeHtml(truncate(subSource, 46)) : "";
      return '<button class="med-item' + (m.id === selectedId ? " active" : "") + '" data-id="' + m.id + '">' +
        '<span class="med-item-main">' + escapeHtml(m.nome || "(sem nome)") +
        (sub ? '<span class="item-sub">' + sub + "</span>" : "") + "</span>" +
        '<span class="star-btn' + (m.favorito ? " is-fav" : "") + '" data-fav-id="' + m.id + '" title="Favoritar">' + STAR_SVG + "</span>" +
        "</button>";
    }
    var html = "";
    if (!favOnly) {
      var favs = list.filter(function (m) { return !!m.favorito; });
      if (favs.length) {
        html += '<div class="favorites-group-label">Favoritos</div>';
        favs.forEach(function (m) { html += itemHtml(m); });
      }
    }
    var lastLetter = null, searching = !!searchTerm.trim();
    if (searching) html += '<div class="letter-group-label">Resultados por relevância (' + list.length + ")</div>";
    list.forEach(function (m) {
      var letter = stripAccents((m.nome || "?").charAt(0).toUpperCase());
      if (!searching && letter !== lastLetter) {
        html += '<div class="letter-group-label">' + escapeHtml(letter) + "</div>";
        lastLetter = letter;
      }
      html += itemHtml(m);
    });
    sidebarEl.innerHTML = html;
    Array.prototype.forEach.call(sidebarEl.querySelectorAll(".star-btn"), function (star) {
      star.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = star.getAttribute("data-fav-id");
        var med = medications.find(function (x) { return x.id === id; });
        if (med) toggleFavorite(med);
      });
    });
    Array.prototype.forEach.call(sidebarEl.querySelectorAll(".med-item"), function (btn) {
      btn.addEventListener("click", function () {
        selectedId = btn.getAttribute("data-id");
        document.body.classList.add("showing-detail");
        render();
      });
    });
  }

  function truncate(s, n) {
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  function inferVia(apresentacoes) {
    var s = stripAccents((apresentacoes || "").toLowerCase());
    var vias = [];
    if (s.indexOf("comprimido") !== -1 || s.indexOf("capsula") !== -1 || s.indexOf("suspensao oral") !== -1 ||
        s.indexOf("xarope") !== -1 || s.indexOf("solucao oral") !== -1 || s.indexOf("gotas") !== -1) vias.push("Oral");
    if (s.indexOf("injetavel") !== -1) vias.push("Injetável (IM/EV)");
    if (s.indexOf("nebulizacao") !== -1 || s.indexOf("inalatorio") !== -1 || s.indexOf("aerossol") !== -1) vias.push("Inalatória");
    if (s.indexOf("colirio") !== -1) vias.push("Oftálmica");
    if (s.indexOf("creme") !== -1 || s.indexOf("pomada") !== -1 || s.indexOf("gel") !== -1 || s.indexOf("locao") !== -1 || s.indexOf("talco") !== -1) vias.push("Tópica");
    if (s.indexOf("ovulo") !== -1 || (s.indexOf("vaginal") !== -1)) vias.push("Vaginal");
    if (s.indexOf("nasal") !== -1) vias.push("Nasal");
    return vias.join("; ");
  }

  function parseConcentration(apresentacoes) {
    if (!apresentacoes) return null;
    var m = apresentacoes.match(/(\d+(?:[.,]\d+)?)\s*mg\s*\/\s*(\d+(?:[.,]\d+)?)?\s*m[lL]/);
    if (!m) return null;
    var num = parseFloat(m[1].replace(",", "."));
    var den = m[2] ? parseFloat(m[2].replace(",", ".")) : 1;
    if (!den) return null;
    return num / den;
  }

  /* Concentração por medicamento: lista cada concentração (mg/mL) encontrada nas apresentações.
     Associações (nome com "+") nunca usam um número único — mostram a apresentação completa. */
  function concentrationText(m) {
    var ap = m.apresentacoes || "";
    if (!ap.trim()) return "";
    if ((m.nome || "").indexOf("+") !== -1) return ap;
    var re = /(\d+(?:[.,]\d+)?)\s*(mg|mcg|g|UI)\s*\/\s*(\d+(?:[.,]\d+)?)?\s*m[lL]/g, out = [], x;
    while ((x = re.exec(ap)) !== null) {
      var num = parseFloat(x[1].replace(",", ".")), den = x[3] ? parseFloat(x[3].replace(",", ".")) : 1;
      if (!den) continue;
      var v = (Math.round(num / den * 1000) / 1000).toString().replace(".", ",") + " " + x[2] + "/mL";
      if (out.indexOf(v) === -1) out.push(v);
    }
    return out.join(" · ");
  }

  /* Posologia em tópicos: quebra por linha, ponto e vírgula ou fim de frase. */
  function posologiaHtml(txt) {
    if (!txt || !txt.trim()) return '<p class="empty">Não informado</p>';
    var parts = txt.split(/\n+/);
    if (parts.length === 1) {
      parts = []; var cur = "", depth = 0;
      for (var i = 0; i < txt.length; i++) {
        var ch = txt.charAt(i);
        if (ch === "(" || ch === "[") depth++;
        else if ((ch === ")" || ch === "]") && depth > 0) depth--;
        var nx = txt.charAt(i + 1), nn = txt.charAt(i + 2);
        if (depth === 0 && ch === ";" && /\s/.test(nx)) { parts.push(cur); cur = ""; continue; }
        if (depth === 0 && ch === "." && /\s/.test(nx) && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(nn) && !/(máx|mín|aprox|ex|p\. ex|vs|cf|dr|sr|obs)$/i.test(cur.trim())) { parts.push(cur); cur = ""; continue; }
        cur += ch;
      }
      parts.push(cur);
    }
    parts = parts.map(function (s) { return s.trim().replace(/^[-•\d]+[.)]\s+/, "").replace(/[.;]$/, ""); }).filter(Boolean);
    return '<ul class="poso-list">' + parts.map(function (s) { return "<li>" + escapeHtml(s) + "</li>"; }).join("") + "</ul>";
  }

  function tarjaClass(label) {
    var l = stripAccents((label || "").toLowerCase());
    if (l.indexOf("preta") !== -1) return "preta";
    if (l.indexOf("vermelha") !== -1) return "vermelha";
    return "livre";
  }

  /* ---------------- Interações por classe farmacológica ---------------- */
  /* Regras de interação de classe-a-classe, baseadas em farmacologia consolidada
     (não são pares de marcas específicas). Finalidade: alerta de triagem rápida
     dentro da própria base do usuário — não substitui checagem na bula/farmacêutico. */

  function medTags(m) {
    var s = stripAccents(((m.nome || "") + " " + (m.classe || "")).toLowerCase());
    var isTopico = s.indexOf("topico") !== -1 || s.indexOf("dermatologico") !== -1 || s.indexOf("creme") !== -1 || s.indexOf("pomada") !== -1 || s.indexOf("colirio") !== -1 || s.indexOf("oftalm") !== -1 || s.indexOf("inalatorio") !== -1 || s.indexOf("spray nasal") !== -1 || s.indexOf("(gel") !== -1;
    var tags = [];
    function has(arr) {
      for (var i = 0; i < arr.length; i++) { if (s.indexOf(arr[i]) !== -1) return true; }
      return false;
    }
    if (has(["varfarina", "rivaroxabana", "apixabana", "dabigatrana", "heparina", "enoxaparina", "fondaparinux", "edoxabana", "dalteparina", "nadroparina", "tinzaparina", "bemiparina", "acenocumarol"])) tags.push("anticoagulante");
    if (has(["acido acetilsalicilico", "antiagregante"])) tags.push("antiagregante");
    if (has(["clopidogrel"])) { tags.push("antiagregante"); tags.push("clopidogrel"); }
    if (has(["ticagrelor", "prasugrel", "cilostazol"])) tags.push("antiagregante");
    if (!isTopico && has(["aine", "ibuprofeno", "diclofenaco", "naproxeno", "nimesulida", "cetoprofeno", "piroxicam", "meloxicam", "etoricoxibe", "celecoxibe", "cetorolaco", "indometacina", "dexcetoprofeno", "flurbiprofeno", "aceclofenaco", "tenoxicam", "lornoxicam", "acido mefenamico", "parecoxibe"])) tags.push("aine");
    if (!isTopico && has(["corticoide sistemico", "prednisona", "prednisolona", "dexametasona", "hidrocortisona", "metilprednisolona", "betametasona", "deflazacorte"])) tags.push("corticoide");
    if (has(["ieca"]) || s.indexOf("(bra)") !== -1 || has(["ramipril", "valsartana", "enalapril", "captopril", "losartana", "lisinopril", "perindopril", "irbesartana", "candesartana", "olmesartana", "telmisartana", "benazepril", "fosinopril", "trandolapril", "quinapril", "azilsartana"])) tags.push("ieca_bra");
    if (has(["poupador de potassio", "eplerenona", "antagonista da aldosterona"])) tags.push("poupador_potassio");
    if (has(["diuretico de alca", "furosemida"])) tags.push("diuretico_alca");
    if (has(["isrs", "irsn", "sertralina", "fluoxetina", "escitalopram", "venlafaxina", "bupropiona", "paroxetina", "duloxetina", "fluvoxamina", "desvenlafaxina", "vortioxetina", "citalopram", "milnaciprano", "dapoxetina"])) tags.push("isrs_irsn");
    if (has(["triciclico", "amitriptilina", "nortriptilina", "clomipramina", "imipramina", "doxepina", "trimipramina", "desipramina", "dosulepina", "protriptilina"])) tags.push("triciclico");
    if (has(["opioide", "tramadol", "codeina", "morfina", "metadona", "oxicodona", "fentanil", "buprenorfina", "tapentadol", "hidromorfona", "meperidina", "petidina", "nalbufina", "sufentanil", "alfentanil", "remifentanil", "butorfanol", "pentazocina"]) && s.indexOf("antagonista") === -1) tags.push("opioide");
    if (has(["benzodiazepinico", "diazepam", "clonazepam", "alprazolam", "midazolam", "lorazepam", "bromazepam", "clobazam", "oxazepam", "cloxazolam", "clorazepato", "clordiazepoxido", "triazolam", "nitrazepam", "flunitrazepam", "lormetazepam"]) && s.indexOf("antagonista") === -1 && s.indexOf("nao benzodiazepinico") === -1) tags.push("benzodiazepinico");
    if (has(["macrolideo", "azitromicina", "claritromicina", "eritromicina", "roxitromicina", "josamicina"])) tags.push("macrolideo");
    if (has(["estatina", "sinvastatina", "atorvastatina", "rosuvastatina", "pravastatina", "pitavastatina", "fluvastatina", "lovastatina"])) tags.push("estatina");
    if (has(["digoxina"])) tags.push("digoxina");
    if (has(["amiodarona"])) tags.push("amiodarona");
    if (has(["litio"])) tags.push("litio");
    if (!isTopico && has(["quinolona", "ciprofloxacino", "norfloxacino", "levofloxacino", "moxifloxacino", "ofloxacino", "delafloxacino"])) tags.push("quinolona");
    if (has(["antidiabetico", "insulina"])) tags.push("hipoglicemiante");
    if (has(["betabloqueador", "propranolol", "metoprolol", "bisoprolol", "carvedilol", "timolol", "atenolol", "labetalol", "nebivolol", "esmolol", "sotalol", "nadolol", "pindolol", "betaxolol", "celiprolol"]) && s.indexOf("antiglaucomatoso") === -1) tags.push("betabloqueador");
    if (has(["bomba de protons", "omeprazol", "pantoprazol", "lansoprazol", "rabeprazol", "esomeprazol", "dexlansoprazol", "vonoprazana"])) tags.push("ibp");
    if (!isTopico && has(["fluconazol", "cetoconazol", "itraconazol", "voriconazol", "posaconazol", "isavuconazol"])) tags.push("antifungico_azol");
    if (has(["metotrexato"])) tags.push("metotrexato");
    if (has(["nitroglicerina", "isossorbida", "nitroprussiato"])) tags.push("nitrato");
    if (has(["sildenafila", "tadalafila"])) tags.push("pde5");
    if (has(["cloreto de potassio"])) tags.push("potassio_supl");
    if (has(["verapamil", "diltiazem"])) tags.push("bcc_nao_dihidro");
    if (has(["sacubitril"])) tags.push("sacubitril");
    if (has(["varfarina"])) tags.push("varfarina");
    if (has(["rivaroxabana", "apixabana", "dabigatrana", "anticoagulante oral direto"])) tags.push("doac");
    if (has(["metronidazol"]) && s.indexOf("vaginal") === -1 && !isTopico) tags.push("metronidazol");
    if (has(["sulfametoxazol"])) tags.push("smx_tmp");
    if (has(["linezolida"])) tags.push("linezolida");
    if (has(["tramadol"])) tags.push("tramadol");
    if (has(["tramadol", "codeina"])) tags.push("pro_opioide");
    if (has(["haloperidol", "clorpromazina", "levomepromazina", "olanzapina", "quetiapina", "risperidona", "aripiprazol", "clozapina", "antipsicotico", "ziprasidona", "paliperidona", "lurasidona", "asenapina", "brexpiprazol", "cariprazina", "flufenazina", "perfenazina", "pimozida", "sulpirida", "amisulprida"])) tags.push("antipsicotico");
    if (has(["haloperidol", "clorpromazina", "quetiapina", "azitromicina", "claritromicina", "ciprofloxacino", "levofloxacino", "ondansetrona", "domperidona", "amiodarona", "escitalopram", "fluconazol", "olanzapina", "metadona", "eritromicina", "sotalol", "propafenona", "citalopram", "voriconazol", "sulpirida", "levofloxacino", "moxifloxacino", "ziprasidona", "pimozida", "tioridazina", "paliperidona", "hidroxicloroquina", "cloroquina", "quinina", "dronedarona", "flecainida", "bedaquilina", "posaconazol"])) tags.push("qt");
    if (has(["rifampicina", "carbamazepina", "fenitoina", "fenobarbital", "primidona"])) tags.push("indutor_cyp");
    if (has(["carbamazepina"])) tags.push("carbamazepina");
    if (has(["carbamazepina", "fenitoina"])) tags.push("fenitoina_cbz");
    if (has(["isoniazida"])) tags.push("isoniazida");
    if (has(["contraceptivo hormonal", "etinilestradiol", "levonorgestrel", "dienogeste"])) tags.push("contraceptivo_hormonal");
    if (has(["acido valproico"])) tags.push("valproato");
    if (has(["lamotrigina"])) tags.push("lamotrigina");
    if (has(["carbapenem", "meropenem", "imipenem"])) tags.push("carbapenem");
    if (has(["levotiroxina"])) tags.push("levotiroxina");
    if (has(["carbonato de calcio", "hidroxido de aluminio", "sulfato ferroso", "sucralfato", "sulfato de zinco", "antiacido", "colestiramina"])) tags.push("quelante");
    if (has(["doxiciclina", "tetraciclina"])) tags.push("tetraciclina");
    if (has(["alendronato", "bisfosfonato"])) tags.push("bisfosfonato");
    if (has(["alopurinol"])) tags.push("alopurinol");
    if (has(["azatioprina"])) tags.push("azatioprina");
    if (has(["sulfonilureia", "glibenclamida", "glimepirida", "gliclazida"])) { tags.push("sulfonilureia"); tags.push("insulina_sulfonilureia"); }
    if (has(["insulina"])) tags.push("insulina_sulfonilureia");
    if (has(["sglt2", "dapagliflozina", "empagliflozina"])) tags.push("sglt2");
    if (has(["diuretico tiazidico", "hidroclorotiazida", "clortalidona", "indapamida"])) tags.push("tiazidico");
    if (has(["diuretico de alca", "furosemida", "diuretico tiazidico", "hidroclorotiazida", "clortalidona", "indapamida"])) tags.push("diuretico_espoliador");
    if (has(["diuretico de alca", "furosemida", "diuretico tiazidico", "hidroclorotiazida", "clortalidona", "indapamida", "poupador de potassio", "espironolactona"])) tags.push("diuretico");
    if (has(["tamsulosina", "doxazosina", "prazosina"])) tags.push("alfabloqueador");
    if (has(["colchicina"])) tags.push("colchicina");
    if (has(["claritromicina", "cetoconazol", "itraconazol", "voriconazol", "ritonavir", "posaconazol", "isavuconazol", "eritromicina", "cobicistato"])) tags.push("inibidor_cyp3a4");
    if (has(["fluoxetina", "paroxetina", "bupropiona"])) tags.push("inibidor_2d6");
    if (has(["tamoxifeno"])) tags.push("tamoxifeno");
    if (has(["selegilina", "rasagilina"])) tags.push("imao_b");
    if (has(["azul de metileno"])) tags.push("azul_metileno");
    if (has(["ciclosporina"])) tags.push("ciclosporina");
    if (has(["micofenolato"])) tags.push("micofenolato");
    if (has(["desmopressina"])) tags.push("desmopressina");
    if (has(["teofilina", "aminofilina"])) tags.push("xantina");
    if (has(["tizanidina"])) tags.push("tizanidina");
    if (has(["fluvoxamina"])) tags.push("fluvoxamina");
    if (has(["liraglutida", "dulaglutida", "semaglutida", "tirzepatida", "glp-1"])) tags.push("glp1");
    if (has(["sotalol"])) tags.push("sotalol");
    if (has(["bupropiona"])) tags.push("bupropiona");
    if (has(["clozapina"])) tags.push("clozapina");
    if (has(["metoclopramida", "bromoprida"])) tags.push("antagonista_d2");
    if (has(["levodopa"])) tags.push("levodopa");
    if (has(["zolpidem", "fenobarbital", "prometazina", "hidroxizina", "gabapentina", "pregabalina", "clorpromazina", "levomepromazina", "olanzapina", "quetiapina", "trazodona", "mirtazapina", "ciclobenzaprina", "baclofeno", "zopiclona", "eszopiclona", "dexmedetomidina", "primidona"])) tags.push("depressor_snc");
    if (has(["ciclobenzaprina"])) tags.push("ciclobenzaprina");
    if (has(["fibrato", "fenofibrato", "ciprofibrato", "bezafibrato"])) tags.push("fibrato");
    if (has(["dolutegravir"])) tags.push("dolutegravir");
    if (has(["tenofovir"])) tags.push("tenofovir");
    if (has(["metformina"])) tags.push("metformina");
    if (has(["ceftriaxona"])) tags.push("ceftriaxona");
    if (has(["gluconato de calcio", "reposicao de calcio"])) tags.push("calcio_ev");
    if (has(["gentamicina", "amicacina", "aminoglicosideo"]) && s.indexOf("oftalmic") === -1 && !isTopico) tags.push("aminoglicosideo");
    if (has(["vancomicina"])) tags.push("vancomicina");
    if (has(["clonidina"])) tags.push("clonidina");
    if (has(["propranolol", "carvedilol"]) && s.indexOf("antiglaucomatoso") === -1) tags.push("bb_nao_seletivo");
    if (has(["salbutamol", "beta-2 agonista", "formoterol", "salmeterol"])) tags.push("beta2");
    if (has(["paracetamol"])) tags.push("paracetamol");
    if (has(["adrenalina", "epinefrina"]) && s.indexOf("noradrenalina") === -1) tags.push("adrenalina");
    return tags;
  }

  var INTERACTION_RULES = [
    ["anticoagulante", "aine", "grave", "Risco aumentado de sangramento gastrointestinal."],
    ["anticoagulante", "antiagregante", "grave", "Risco aumentado de sangramento."],
    ["anticoagulante", "macrolideo", "moderada", "Macrolídeos podem potencializar o efeito anticoagulante (alteração do INR)."],
    ["anticoagulante", "quinolona", "moderada", "Quinolonas podem potencializar o efeito anticoagulante (alteração do INR)."],
    ["antiagregante", "aine", "moderada", "Risco aumentado de sangramento."],
    ["clopidogrel", "ibp", "moderada", "IBPs (especialmente omeprazol) podem reduzir a eficácia do clopidogrel."],
    ["ieca_bra", "poupador_potassio", "grave", "Risco de hipercalemia."],
    ["ieca_bra", "aine", "moderada", "Redução do efeito anti-hipertensivo e risco de nefrotoxicidade."],
    ["ieca_bra", "litio", "moderada", "Pode aumentar os níveis séricos de lítio."],
    ["isrs_irsn", "aine", "moderada", "Risco aumentado de sangramento."],
    ["isrs_irsn", "anticoagulante", "moderada", "Risco aumentado de sangramento."],
    ["isrs_irsn", "triciclico", "moderada", "Risco de síndrome serotoninérgica."],
    ["isrs_irsn", "opioide", "moderada", "Risco de síndrome serotoninérgica (especialmente com tramadol)."],
    ["opioide", "benzodiazepinico", "grave", "Depressão respiratória aditiva — risco de hipoventilação grave."],
    ["macrolideo", "estatina", "moderada", "Risco aumentado de miopatia/rabdomiólise."],
    ["antifungico_azol", "estatina", "moderada", "Risco aumentado de miopatia/rabdomiólise."],
    ["digoxina", "diuretico_alca", "grave", "Hipocalemia pode potencializar a toxicidade digitálica."],
    ["digoxina", "amiodarona", "grave", "Amiodarona aumenta os níveis de digoxina — risco de toxicidade."],
    ["litio", "aine", "moderada", "AINEs podem aumentar os níveis séricos de lítio."],
    ["quinolona", "corticoide", "moderada", "Risco aumentado de tendinopatia/ruptura de tendão."],
    ["betabloqueador", "hipoglicemiante", "moderada", "Pode mascarar sinais adrenérgicos de hipoglicemia."],
    ["hipoglicemiante", "corticoide", "moderada", "Corticoide pode reduzir o controle glicêmico."],
    ["metotrexato", "aine", "grave", "Risco aumentado de toxicidade do metotrexato."],
    ["nitrato", "pde5", "grave", "Hipotensão grave potencialmente fatal: uso concomitante contraindicado."],
    ["potassio_supl", "ieca_bra", "grave", "Risco de hipercalemia."],
    ["potassio_supl", "poupador_potassio", "grave", "Risco de hipercalemia."],
    ["bcc_nao_dihidro", "betabloqueador", "grave", "Risco de bradicardia importante, bloqueio AV e hipotensão."],
    ["sacubitril", "ieca_bra", "grave", "Sacubitril/valsartana é contraindicado com IECA (risco de angioedema); respeitar intervalo de 36 h."],
    ["varfarina", "metronidazol", "grave", "Metronidazol potencializa a varfarina (↑ INR e risco de sangramento)."],
    ["varfarina", "smx_tmp", "grave", "SMX-TMP potencializa fortemente a varfarina (↑ INR)."],
    ["varfarina", "antifungico_azol", "grave", "Azólicos (fluconazol, cetoconazol) aumentam o INR."],
    ["varfarina", "amiodarona", "grave", "Amiodarona aumenta o INR; reduzir a dose de varfarina em cerca de 30-50%."],
    ["varfarina", "indutor_cyp", "grave", "Indutores enzimáticos reduzem o efeito da varfarina (risco de trombose); acompanhar o INR."],
    ["varfarina", "paracetamol", "moderada", "Uso regular de paracetamol (> 2 g/dia por vários dias) pode elevar o INR."],
    ["doac", "indutor_cyp", "grave", "Indutores potentes reduzem os níveis do anticoagulante oral direto (falha terapêutica): evitar associação."],
    ["doac", "inibidor_cyp3a4", "grave", "Inibidores potentes de CYP3A4/P-gp aumentam o DOAC (sangramento): evitar com cetoconazol/itraconazol; cautela com claritromicina."],
    ["smx_tmp", "ieca_bra", "grave", "Risco importante de hipercalemia, sobretudo em idosos e na DRC."],
    ["smx_tmp", "metotrexato", "grave", "Risco de pancitopenia grave: associação contraindicada."],
    ["smx_tmp", "sulfonilureia", "moderada", "Pode causar hipoglicemia."],
    ["linezolida", "isrs_irsn", "grave", "Risco de síndrome serotoninérgica (linezolida é IMAO fraco)."],
    ["linezolida", "tramadol", "grave", "Risco de síndrome serotoninérgica."],
    ["linezolida", "triciclico", "moderada", "Risco de síndrome serotoninérgica."],
    ["tramadol", "triciclico", "moderada", "Risco de síndrome serotoninérgica e convulsões."],
    ["tramadol", "bupropiona", "moderada", "Redução do limiar convulsivo."],
    ["tramadol", "carbamazepina", "moderada", "Carbamazepina reduz o efeito do tramadol e aumenta o risco de convulsões."],
    ["imao_b", "isrs_irsn", "grave", "IMAO-B com ISRS/IRSN: risco de síndrome serotoninérgica; respeitar intervalo e evitar associação."],
    ["imao_b", "tramadol", "grave", "IMAO com tramadol/meperidina: risco de síndrome serotoninérgica e crise hipertensiva."],
    ["imao_b", "triciclico", "grave", "IMAO com tricíclicos: risco de síndrome serotoninérgica e crise hipertensiva."],
    ["azul_metileno", "isrs_irsn", "grave", "O azul de metileno inibe a MAO: síndrome serotoninérgica grave com ISRS/IRSN."],
    ["azul_metileno", "tramadol", "grave", "O azul de metileno inibe a MAO: risco de síndrome serotoninérgica com tramadol."],
    ["ciclosporina", "inibidor_cyp3a4", "grave", "Inibidores da CYP3A4 aumentam a ciclosporina (nefrotoxicidade): monitorar nível sérico."],
    ["ciclosporina", "indutor_cyp", "grave", "Indutores enzimáticos reduzem o nível da ciclosporina (risco de rejeição)."],
    ["ciclosporina", "estatina", "moderada", "Aumenta o risco de miopatia/rabdomiólise: limitar a dose da estatina."],
    ["ciclosporina", "aine", "moderada", "Nefrotoxicidade aditiva e piora da função renal."],
    ["micofenolato", "quelante", "moderada", "Antiácidos com Mg/Al e colestiramina reduzem a absorção do micofenolato: separar por 2 h."],
    ["desmopressina", "diuretico_espoliador", "moderada", "Risco aumentado de hiponatremia: monitorar sódio."],
    ["desmopressina", "isrs_irsn", "moderada", "ISRS/IRSN aumentam o risco de hiponatremia com desmopressina."],
    ["xantina", "quinolona", "grave", "Ciprofloxacino aumenta o nível de teofilina/aminofilina (convulsões, arritmias): reduzir a dose e monitorar."],
    ["xantina", "macrolideo", "moderada", "Eritromicina/claritromicina aumentam o nível de teofilina: monitorar."],
    ["xantina", "indutor_cyp", "moderada", "Rifampicina, carbamazepina e fenitoína reduzem o nível de teofilina."],
    ["tizanidina", "fluvoxamina", "grave", "Fluvoxamina (e ciprofloxacino) elevam muito a tizanidina: hipotensão e sedação — contraindicado."],
    ["tizanidina", "quinolona", "grave", "Ciprofloxacino aumenta marcadamente a tizanidina (hipotensão, bradicardia): evitar."],
    ["glp1", "insulina_sulfonilureia", "moderada", "Risco de hipoglicemia: considerar reduzir a dose de insulina/sulfonilureia ao iniciar."],
    ["sotalol", "diuretico_espoliador", "moderada", "Hipocalemia/hipomagnesemia aumentam o risco de torsades com sotalol: monitorar eletrólitos."],
    ["sotalol", "qt", "grave", "Prolongamento do QT aditivo com sotalol: evitar associações."],
    ["inibidor_2d6", "tamoxifeno", "grave", "Fluoxetina/paroxetina/bupropiona inibem a CYP2D6 e reduzem a ativação do tamoxifeno (menor eficácia): preferir sertralina ou venlafaxina."],
    ["varfarina", "tamoxifeno", "moderada", "Tamoxifeno potencializa a varfarina (aumento do INR e sangramento): monitorar INR."],
    ["qt", "qt", "grave", "Prolongamento do QT aditivo (risco de torsades de pointes): monitorar ECG, potássio e magnésio."],
    ["antipsicotico", "antagonista_d2", "moderada", "Risco aumentado de sintomas extrapiramidais."],
    ["antipsicotico", "levodopa", "moderada", "Antipsicóticos antagonizam a levodopa (se necessário, preferir quetiapina ou clozapina)."],
    ["antagonista_d2", "levodopa", "grave", "Metoclopramida/bromoprida antagonizam a levodopa e pioram o parkinsonismo: evitar."],
    ["clozapina", "carbamazepina", "grave", "Risco aditivo de agranulocitose: evitar."],
    ["clozapina", "benzodiazepinico", "moderada", "Risco de depressão respiratória e colapso circulatório."],
    ["indutor_cyp", "contraceptivo_hormonal", "grave", "Indutores enzimáticos reduzem a eficácia do contraceptivo hormonal: usar método alternativo (DIU, injetável trimestral)."],
    ["valproato", "carbapenem", "grave", "Carbapenêmicos reduzem drasticamente o nível sérico de valproato (risco de crise convulsiva): evitar."],
    ["valproato", "lamotrigina", "grave", "Valproato dobra os níveis de lamotrigina: reduzir a dose e titular devagar (risco de Stevens-Johnson)."],
    ["lamotrigina", "contraceptivo_hormonal", "moderada", "Estrogênio reduz os níveis de lamotrigina; pode exigir ajuste de dose."],
    ["carbamazepina", "inibidor_cyp3a4", "grave", "Inibidores de CYP3A4 (claritromicina, azólicos) elevam a carbamazepina: risco de toxicidade."],
    ["isoniazida", "fenitoina_cbz", "moderada", "Isoniazida eleva os níveis de fenitoína e carbamazepina (toxicidade)."],
    ["indutor_cyp", "dolutegravir", "grave", "Indutores reduzem o dolutegravir: com rifampicina usar 50 mg 12/12 h; evitar carbamazepina, fenitoína e fenobarbital."],
    ["dolutegravir", "quelante", "moderada", "Cálcio, ferro e antiácidos reduzem a absorção do dolutegravir: tomar 2 h antes ou 6 h depois (ou junto com alimento)."],
    ["dolutegravir", "metformina", "moderada", "Dolutegravir eleva a metformina: limitar a 1.000 mg/dia e monitorar."],
    ["tenofovir", "aine", "moderada", "AINEs aumentam o risco de nefrotoxicidade com tenofovir."],
    ["levotiroxina", "quelante", "moderada", "Reduzem a absorção da levotiroxina: separar por pelo menos 4 h."],
    ["levotiroxina", "ibp", "moderada", "IBP pode reduzir a absorção da levotiroxina e elevar o TSH."],
    ["quinolona", "quelante", "moderada", "Quelação reduz a absorção da quinolona: tomar 2 h antes ou 6 h depois."],
    ["quinolona", "aine", "moderada", "AINEs podem aumentar o risco de convulsões com quinolonas."],
    ["tetraciclina", "quelante", "moderada", "Reduzem a absorção da doxiciclina: separar por 2-3 h."],
    ["bisfosfonato", "quelante", "moderada", "Cálcio e antiácidos impedem a absorção do alendronato: tomar em jejum, separado por pelo menos 30 min."],
    ["bisfosfonato", "aine", "moderada", "Risco aditivo de lesão da mucosa gastrointestinal."],
    ["alopurinol", "azatioprina", "grave", "Alopurinol inibe o metabolismo da azatioprina: reduzir a dose de azatioprina em cerca de 75%."],
    ["metotrexato", "ibp", "moderada", "IBPs podem elevar os níveis de metotrexato (principalmente em altas doses)."],
    ["sulfonilureia", "antifungico_azol", "grave", "Fluconazol e cetoconazol aumentam o risco de hipoglicemia grave."],
    ["hipoglicemiante", "quinolona", "moderada", "Quinolonas podem causar disglicemia (hipo ou hiperglicemia)."],
    ["sglt2", "insulina_sulfonilureia", "moderada", "Maior risco de hipoglicemia: considerar reduzir a dose de insulina/sulfonilureia."],
    ["sglt2", "diuretico_espoliador", "moderada", "Risco de hipovolemia e hipotensão."],
    ["pde5", "alfabloqueador", "moderada", "Risco de hipotensão postural: iniciar com dose baixa e separar as doses."],
    ["litio", "tiazidico", "grave", "Tiazídicos reduzem a excreção de lítio (níveis ↑ 25-40%): risco de toxicidade."],
    ["litio", "metronidazol", "moderada", "Pode elevar os níveis de lítio."],
    ["digoxina", "bcc_nao_dihidro", "grave", "Verapamil/diltiazem aumentam a digoxina e somam bradicardia/bloqueio AV."],
    ["digoxina", "inibidor_cyp3a4", "moderada", "Claritromicina e azólicos aumentam os níveis de digoxina (inibição da P-gp)."],
    ["digoxina", "poupador_potassio", "moderada", "Espironolactona pode elevar a digoxina e interferir na dosagem sérica."],
    ["digoxina", "tiazidico", "moderada", "Hipocalemia/hipomagnesemia aumentam a toxicidade digitálica."],
    ["digoxina", "corticoide", "moderada", "Hipocalemia induzida pelo corticoide aumenta a toxicidade digitálica."],
    ["estatina", "amiodarona", "moderada", "Sinvastatina: limitar a 20 mg/dia com amiodarona (miopatia)."],
    ["estatina", "bcc_nao_dihidro", "moderada", "Verapamil/diltiazem elevam sinvastatina/atorvastatina (miopatia)."],
    ["estatina", "fibrato", "moderada", "Risco aditivo de miopatia/rabdomiólise (evitar genfibrozila)."],
    ["estatina", "colchicina", "moderada", "Risco aditivo de miopatia."],
    ["colchicina", "inibidor_cyp3a4", "grave", "Aumento importante da colchicina (toxicidade potencialmente fatal): reduzir a dose ou evitar, sobretudo em DRC/hepatopatia."],
    ["colchicina", "bcc_nao_dihidro", "moderada", "Aumenta os níveis de colchicina."],
    ["amiodarona", "betabloqueador", "moderada", "Risco de bradicardia e bloqueio AV."],
    ["amiodarona", "bcc_nao_dihidro", "moderada", "Risco de bradicardia e bloqueio AV."],
    ["aine", "diuretico", "moderada", "AINE reduz o efeito diurético e aumenta o risco de lesão renal aguda (com IECA/BRA: \"tripla ameaça\")."],
    ["corticoide", "diuretico_espoliador", "moderada", "Risco aditivo de hipocalemia."],
    ["inibidor_2d6", "betabloqueador", "moderada", "Fluoxetina/paroxetina/bupropiona inibem a CYP2D6 e elevam metoprolol/carvedilol/propranolol (bradicardia)."],
    ["inibidor_2d6", "pro_opioide", "moderada", "Inibidores da CYP2D6 reduzem a conversão de codeína/tramadol em metabólito ativo (menor analgesia)."],
    ["ciclobenzaprina", "isrs_irsn", "moderada", "Risco de síndrome serotoninérgica."],
    ["ciclobenzaprina", "triciclico", "moderada", "Estrutura semelhante a tricíclicos: efeitos anticolinérgicos e serotoninérgicos aditivos."],
    ["ciclobenzaprina", "tramadol", "moderada", "Risco de síndrome serotoninérgica e convulsões."],
    ["depressor_snc", "opioide", "moderada", "Sedação e depressão respiratória aditivas."],
    ["depressor_snc", "benzodiazepinico", "moderada", "Sedação e depressão respiratória aditivas."],
    ["ceftriaxona", "calcio_ev", "grave", "Precipitação: contraindicada em neonatos; nos demais, não infundir simultaneamente na mesma via."],
    ["aminoglicosideo", "vancomicina", "grave", "Nefrotoxicidade e ototoxicidade aditivas: monitorar função renal e níveis séricos."],
    ["aminoglicosideo", "diuretico_alca", "grave", "Ototoxicidade e nefrotoxicidade aditivas."],
    ["aminoglicosideo", "aine", "moderada", "AINEs aumentam o risco de nefrotoxicidade."],
    ["betabloqueador", "clonidina", "moderada", "Retirada da clonidina com betabloqueador pode causar hipertensão rebote: suspender primeiro o betabloqueador."],
    ["bb_nao_seletivo", "beta2", "moderada", "Betabloqueadores não seletivos antagonizam o broncodilatador e podem precipitar broncoespasmo."],
    ["bb_nao_seletivo", "adrenalina", "moderada", "Hipertensão com bradicardia reflexa e resposta reduzida à adrenalina na anafilaxia (considerar glucagon)."],
    ["corticoide", "aine", "moderada", "Risco aumentado de sangramento/úlcera gastrointestinal."]
  ];

  function findInteractions(m, allMeds) {
    var myTags = medTags(m);
    if (!myTags.length) return [];
    var hits = [];
    var seen = {};
    allMeds.forEach(function (other) {
      if (other.id === m.id) return;
      var otherTags = medTags(other);
      if (!otherTags.length) return;
      INTERACTION_RULES.forEach(function (rule) {
        var a = rule[0], b = rule[1], sev = rule[2], desc = rule[3];
        var match = (myTags.indexOf(a) !== -1 && otherTags.indexOf(b) !== -1) ||
          (myTags.indexOf(b) !== -1 && otherTags.indexOf(a) !== -1);
        if (match) {
          var key = other.nome + "|" + desc;
          if (!seen[key]) {
            seen[key] = true;
            hits.push({ nome: other.nome, sev: sev, desc: desc });
          }
        }
      });
    });
    hits.sort(function (a, b) {
      if (a.sev !== b.sev) return a.sev === "grave" ? -1 : 1;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
    return hits;
  }

  function popClass(label) {
    var l = (label || "").toLowerCase();
    if (/^contraindicad/.test(l)) return "pop-bad";
    if (/^evitar/.test(l)) return "pop-bad";
    if (/^cautela|^usar com cautela/.test(l)) return "pop-warn";
    if (/^compat|^permitid/.test(l)) return "pop-ok";
    return "pop-na";
  }
  function popCard(title, value) {
    if (!value) return "";
    var parts = String(value).split(" — ");
    var label = parts.length > 1 ? parts.shift() : "";
    var text = parts.join(" — ");
    return '<div class="pop-card"><h4>' + title + '</h4>' +
      (label ? '<span class="pop-badge ' + popClass(label) + '">' + escapeHtml(label) + '</span>' : '') +
      '<p>' + escapeHtml(text || value) + '</p></div>';
  }
  function popHtml(m) {
    if (!m.gestacao && !m.lactacao && !m.pediatria) return "";
    return '<div class="section"><h3>Gestação, lactação e pediatria</h3><div class="pop-grid">' +
      popCard("Gestação", m.gestacao) + popCard("Lactação", m.lactacao) + popCard("Pediatria", m.pediatria) +
      '</div><p class="pop-note">Resumo baseado em literatura e bulas (categorias FDA/ANVISA, LactMed, TERIS, Briggs). Não substitui a bula nem a avaliação individual; confirmar antes de prescrever.</p></div>';
  }

  var MEDX = /*@dados:MEDX*/{};
  function medxHtml(m) {
    var x = MEDX[m.nome];
    if (!x) return "";
    var rows = [["Mecanismo de ação", x.mec], ["Ajuste na insuficiência renal", x.renal], ["Ajuste na insuficiência hepática", x.hep], ["Efeitos adversos", x.ea], ["Disponibilidade no SUS", x.sus]];
    var out = '<div class="section"><h3>Mecanismo, ajustes e segurança</h3><div class="pop-grid">';
    rows.forEach(function (r) { if (r[1]) out += '<div class="pop-card"><h4>' + r[0] + '</h4><p>' + escapeHtml(r[1]) + '</p></div>'; });
    return out + '</div><p class="pop-note">Resumo de apoio escrito a partir de literatura de referência e bulas; sem revisão por comitê. Confirme doses e ajustes na bula vigente e em fontes oficiais antes de prescrever.</p></div>';
  }

  function section(title, value, opts) {
    opts = opts || {};
    var cls = "section" + (opts.danger ? " danger" : "") + (opts.dose ? " dose" : "");
    var body = value && value.trim()
      ? '<p class="body-text">' + escapeHtml(value) + "</p>"
      : '<p class="body-text empty">Não informado.</p>';
    return '<div class="' + cls + '"><h3>' + title + "</h3>" + body + "</div>";
  }

  function renderDetail() {
    if (!selectedId) {
      detailEl.innerHTML =
        '<div class="detail-empty">' +
        (medications.length === 0
          ? "<h2>Biblioteca vazia</h2><p>Abra o menu ⋮ e use \"Carregar biblioteca\" para carregar os medicamentos.</p>"
          : '<p class="home-eyebrow">' + new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) + '</p><h2 class="home-title">Bluebook</h2><p>Busca universal: medicamentos, doenças, CID-10, escores e protocolos.</p>' + homeQuickHtml()) +
        "</div>" + (medications.length ? coverageHtml() : "");
      attachCoverage();
      return;
    }
    var m = medications.find(function (x) { return x.id === selectedId; });
    if (!m) {
      detailEl.innerHTML = '<div class="detail-empty"><p>Este medicamento não foi encontrado.</p></div>';
      return;
    }
    var viaDisplay = m.via || inferVia(m.apresentacoes);
    var html = '<button class="back-btn" id="back-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Voltar</button>';
    html += '<div class="med-header"><div><h2>' + escapeHtml(m.nome || "(sem nome)") + '</h2>';
    if (m.classe || m.tarja || viaDisplay) {
      html += '<div class="badge-row">';
      if (m.classe) html += '<span class="badge">' + escapeHtml(m.classe) + '</span>';
      if (medGroup(m) !== "Outros" && medGroup(m) !== m.classe) html += '<span class="badge" title="Grupo terapêutico">' + escapeHtml(medGroup(m)) + '</span>';
      if (m.tarja) html += '<span class="badge badge-tarja-' + tarjaClass(m.tarja) + '">' + escapeHtml(m.tarja) + '</span>';
      if (viaDisplay) html += '<span class="badge">' + escapeHtml(viaDisplay) + '</span>';
      html += trustBadge("m", m);
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="med-actions">' +
      '<button class="btn-ghost btn" id="copy-btn">Copiar resumo</button>' +
      '<button class="star-btn' + (m.favorito ? " is-fav" : "") + '" id="detail-fav-btn" title="Favoritar" style="padding:7px;">' + STAR_SVG + '</button>' +
      '</div></div>';
    var bulaSub = (m.nome || "").replace(/\s*\([^)]*\)/g, "").split(" + ")[0].trim();
    var bulaBrand = ((m.referencias || "").split(",")[0] || "").replace(/\s*\([^)]*\)/g, "").trim();
    var bulaBase = "https://consultas.anvisa.gov.br/#/bulario/q/?nomeProduto=";
    html += '<p style="margin:-10px 0 20px 0;font-size:13px;font-weight:500;">' +
      '<a href="' + bulaBase + encodeURIComponent(bulaSub) + '" target="_blank" rel="noopener" style="color:var(--accent);">Bula oficial: ' + escapeHtml(bulaSub) + ' (Bulário Anvisa)</a>' +
      (bulaBrand && !/gen[ée]rico|similar|hospitalar|manipulad|apresenta/i.test(bulaBrand) && stripAccents(bulaBrand.toLowerCase()) !== stripAccents(bulaSub.toLowerCase())
        ? ' &nbsp;·&nbsp; <a href="' + bulaBase + encodeURIComponent(bulaBrand) + '" target="_blank" rel="noopener" style="color:var(--accent);">Bula da marca ' + escapeHtml(bulaBrand) + "</a>" : "") +
      "</p>";

    var concText = concentrationText(m);
    html += '<div class="quick-ref">' +
      '<div class="quick-ref-item"><h4>Via de administração</h4><p' + (viaDisplay ? '' : ' class="empty"') + '>' + escapeHtml(viaDisplay || "Não informado") + '</p></div>' +
      '<div class="quick-ref-item"><h4>Concentração</h4><p' + (concText ? '' : ' class="empty"') + '>' + escapeHtml(concText || "Ver apresentações") + '</p></div>' +
      '<div class="quick-ref-item"><h4>Apresentação</h4><p' + (m.apresentacoes ? '' : ' class="empty"') + '>' + escapeHtml(truncate(m.apresentacoes || "Não informado", 60)) + '</p></div>' +
      '<div class="quick-ref-item wide"><h4>Posologia</h4>' + posologiaHtml(m.posologia) + '</div>' +
      '</div>';

    var pedEntry = pedFind(m.nome);
    if (pedEntry) {
      html += '<div class="section" style="border:1px solid var(--border);border-radius:10px;padding:14px 16px;background:var(--surface);"><h3>Dose pediátrica por peso</h3>' + pedWidgetHtml("fp") +
        '<p class="calc-note">Faixas usuais de referência, não uma prescrição: confirme na bula ou no protocolo institucional (atenção a neonatos, prematuros e disfunção renal/hepática).</p></div>';
    }
    html += section("Apresentações (detalhado)", m.apresentacoes);
    if (m.generico || m.referencias) {
      var genLine = (m.generico ? "Genérico: " + m.generico : "") +
        (m.generico && m.referencias ? " — " : "") +
        (m.referencias ? "Referência (laboratório): " + m.referencias : "");
      html += section("Genérico e nomes de referência", genLine);
    }
    html += section("Indicações", m.indicacoes);
    html += section("Contraindicações", m.contraindicacoes, { danger: true });
    html += popHtml(m);
    html += medxHtml(m);
    html += section("Interações medicamentosas", m.interacoes, { danger: true });
    if (m.observacoes && m.observacoes.trim()) {
      html += section("Observações", m.observacoes);
    }

    var interactionHits = findInteractions(m, medications);
    if (interactionHits.length) {
      html += '<div class="section danger"><h3>Possíveis interações nesta sua base</h3>';
      interactionHits.forEach(function (h) {
        html += '<p class="body-text" style="margin:0 0 6px 0;"><strong>' + escapeHtml(h.nome) + '</strong> — ' +
          (h.sev === "grave"
            ? '<span style="color:var(--danger);font-weight:600;">[grave]</span> '
            : '<span style="color:var(--gold);font-weight:600;">[moderada]</span> ') +
          escapeHtml(h.desc) + '</p>';
      });
      html += '<p class="calc-note" style="margin-top:8px;">Gerado automaticamente por classe farmacológica, cruzando os medicamentos cadastrados na sua base — lista não exaustiva. Confirme sempre na bula ou com o farmacêutico antes de associar medicamentos.</p>';
      html += '</div>';
    }

    html += noteSectionHtml("m", m.nome);
    detailEl.innerHTML = html;
    pushRecent("m", m.nome); attachNote("m", m.nome);
    if (pedEntry) pedAttach("fp", pedEntry, m);

    var back = document.getElementById("back-btn");
    if (back) back.addEventListener("click", function () {
      document.body.classList.remove("showing-detail");
    });
    document.getElementById("detail-fav-btn").addEventListener("click", function () { toggleFavorite(m); });
    document.getElementById("copy-btn").addEventListener("click", function () { copyText(medSummary(m), this); });
  }

  /* ---------------- Grandes áreas ---------------- */
  var ESPECIALIDADES = /*@dados:ESPECIALIDADES*/[];
  var espFilter = "";
  function hasEsp(x, e) { return ("; " + (x.esp || "") + ";").indexOf("; " + e + ";") !== -1; }
  function renderEspOptions() {
    var sel = document.getElementById("esp-filter"); if (!sel) return;
    var on = viewMode === "meds" || viewMode === "diseases" || viewMode === "rx";
    sel.style.display = on ? "" : "none"; if (!on) return;
    var src = viewMode === "diseases" ? DISEASES : medications, cnt = {};
    src.forEach(function (x) { String(x.esp || "").split("; ").forEach(function (e) { if (e) cnt[e] = (cnt[e] || 0) + 1; }); });
    var html = '<option value="">Todas as especialidades (' + ESPECIALIDADES.length + ")</option>";
    ESPECIALIDADES.forEach(function (e) { html += '<option value="' + escapeHtml(e) + '">' + escapeHtml(e) + " (" + (cnt[e] || 0) + ")</option>"; });
    var key = viewMode + ":" + src.length; if (sel.getAttribute("data-m") !== key) { sel.innerHTML = html; sel.setAttribute("data-m", key); sel.value = espFilter; }
  }
  var BIG_AREAS = ["Clínica Médica", "Cirurgia Geral", "Pediatria", "Ginecologia e Obstetrícia", "Urgência e Emergência"];
  var DISEASE_BIG = {
    "Cirurgia Geral": "Cirurgia Geral", "Ortopedia e Traumatologia": "Cirurgia Geral",
    "Pediatria": "Pediatria", "Ginecologia e Obstetrícia": "Ginecologia e Obstetrícia", "Urgência e Emergência": "Urgência e Emergência"
  };
  var bigArea = "";
  function diseaseBig(d) { return DISEASE_BIG[d.area] || "Clínica Médica"; }
  function medHasArea(m, a) {
    var s = m.areas;
    if (!s) return a === "Clínica Médica";
    return ("; " + s + ";").indexOf("; " + a + ";") !== -1;
  }
  function renderAreaBar() {
    var bar = document.getElementById("area-bar");
    if (!bar) return;
    bar.style.display = (viewMode === "atb" || REFS[viewMode]) ? "none" : "";
    var counts = {}, total = 0;
    if (viewMode === "scores") {
      total = SCORES.length;
      SCORES.forEach(function (sc) { sc.areas.forEach(function (a) { counts[a] = (counts[a] || 0) + 1; }); });
    } else if (viewMode === "diseases") {
      total = DISEASES.length;
      DISEASES.forEach(function (d) { var k = diseaseBig(d); counts[k] = (counts[k] || 0) + 1; });
    } else {
      total = medications.length;
      medications.forEach(function (m) { BIG_AREAS.forEach(function (a) { if (medHasArea(m, a)) counts[a] = (counts[a] || 0) + 1; }); });
    }
    var html = '<button type="button" class="area-chip' + (bigArea ? "" : " active") + '" data-area="">Todas<span class="n">' + total + "</span></button>";
    BIG_AREAS.forEach(function (a) {
      html += '<button type="button" class="area-chip' + (bigArea === a ? " active" : "") + '" data-area="' + escapeHtml(a) + '">' + escapeHtml(a) + '<span class="n">' + (counts[a] || 0) + "</span></button>";
    });
    bar.innerHTML = html;
  }
  document.addEventListener("click", function (e) {
    var chip = e.target && e.target.closest ? e.target.closest(".area-chip") : null;
    if (!chip) return;
    bigArea = chip.getAttribute("data-area") || "";
    if (viewMode === "diseases") diseaseAreaFilter = "";
    render();
  });

  function render() {
    renderEspOptions();
    if (viewMode !== "calc") { detailEl.oninput = null; detailEl.onchange = null; }
    renderAreaBar();
    if (REFS[viewMode]) {
      REFS[viewMode].side();
      REFS[viewMode].det();
    } else if (viewMode === "atb") {
      renderAtbSidebar();
      renderAtbDetail();
    } else if (viewMode === "rx") {
      renderRxSidebar();
      renderRxDetail();
    } else if (viewMode === "scores") {
      renderScoreSidebar();
      renderScoreDetail();
    } else if (viewMode === "diseases") {
      renderDiseaseSidebar();
      renderDiseaseDetail();
    } else {
      renderSidebar();
      renderDetail();
    }
  }

  /* ---------------- Doenças (consulta rápida por área) ---------------- */

  var viewMode = "meds";
  var disFavs = [];
  try { disFavs = JSON.parse(window.localStorage.getItem("bluebook:disease-favs") || "[]"); } catch (e) { disFavs = []; }
  function saveDisFavs() { try { window.localStorage.setItem("bluebook:disease-favs", JSON.stringify(disFavs)); } catch (e) {} }
  function isDisFav(d) { return disFavs.indexOf(d.nome) !== -1; }
  function toggleDisFav(d) {
    var i = disFavs.indexOf(d.nome);
    if (i === -1) disFavs.push(d.nome); else disFavs.splice(i, 1);
    saveDisFavs();
    render();
  }
  function copyText(text, btn) {
    function done(ok) {
      if (!btn) return;
      var old = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", old);
      btn.textContent = ok ? "Copiado ✓" : "Não foi possível copiar";
      setTimeout(function () { btn.textContent = old; }, 1600);
    }
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else { fallback(); }
  }
  function diseaseSummary(d) {
    var parts = [d.nome + " (" + d.area + ")" + (d.cid ? " — CID-10: " + d.cid : "")];
    [["Introdução", d.introducao], ["Critérios diagnósticos", d.criterios], ["Exames", d.exames], ["Tratamento", d.tratamento], ["Prescrição sugerida", d.prescricao], ["Conduta", d.conduta]]
      .forEach(function (p) { if (p[1]) parts.push(p[0] + ":\n" + p[1]); });
    return parts.join("\n\n");
  }
  function medSummary(m) {
    var parts = [m.nome + (m.classe ? " — " + m.classe : "")];
    [["Via", m.via], ["Tarja", m.tarja], ["Genérico", m.generico], ["Nomes comerciais", m.referencias], ["Apresentações", m.apresentacoes], ["Indicações", m.indicacoes], ["Posologia", m.posologia], ["Contraindicações", m.contraindicacoes], ["Gestação", m.gestacao], ["Lactação", m.lactacao], ["Pediatria", m.pediatria], ["Interações", m.interacoes], ["Observações", m.observacoes], ["Mecanismo de ação", (MEDX[m.nome]||{}).mec], ["Ajuste renal", (MEDX[m.nome]||{}).renal], ["Ajuste hepático", (MEDX[m.nome]||{}).hep], ["Efeitos adversos", (MEDX[m.nome]||{}).ea], ["SUS", (MEDX[m.nome]||{}).sus]]
      .forEach(function (p) { if (p[1]) parts.push(p[0] + ": " + p[1]); });
    return parts.join("\n");
  }
  var diseaseSearchTerm = "";
  var diseaseAreaFilter = "";
  var selectedDiseaseIdx = null;

  var DISEASE_AREAS = ["Clínica Médica", "Cardiologia", "Pneumologia", "Gastroenterologia e Hepatologia", "Nefrologia e Urologia", "Endocrinologia e Metabologia", "Infectologia", "Reumatologia", "Hematologia e Oncologia", "Geriatria e Cuidados Paliativos", "Pediatria", "Cirurgia Geral", "Ginecologia e Obstetrícia", "Urgência e Emergência", "Psiquiatria", "Ortopedia e Traumatologia", "Dermatologia", "Neurologia", "Otorrino e Oftalmologia"];

  var _disOrder = null;
  function filteredDiseases() {
    var term = stripAccents(diseaseSearchTerm.trim().toLowerCase());
    /* Desempenho: DISEASES não muda; a ordem (área, nome) é calculada uma vez. */
    if (!_disOrder) {
      _disOrder = DISEASES.map(function (d, i) { return i; }).sort(function (x, y) {
        var a = DISEASES[x], b = DISEASES[y];
        var ia = DISEASE_AREAS.indexOf(a.area), ib = DISEASE_AREAS.indexOf(b.area);
        if (ia !== ib) return ia - ib;
        return cmpPt(a.nome || "", b.nome || "") || x - y;
      });
    }
    var list = _disOrder.map(function (i) { return Object.assign({ _idx: i }, DISEASES[i]); });
    if (bigArea) {
      list = list.filter(function (d) { return diseaseBig(d) === bigArea; });
    }
    if (espFilter) list = list.filter(function (d) { return hasEsp(d, espFilter); });
    if (diseaseAreaFilter) {
      list = list.filter(function (d) { return d.area === diseaseAreaFilter; });
    }
    if (favOnly) {
      list = list.filter(function (d) { return isDisFav(d); });
    }
    var rawT = diseaseSearchTerm.trim();
    if (/^cid:/i.test(rawT)) {
      var rg = rawT.slice(4).split("-");
      return list.filter(function (d) { return cidCats(d.cid).some(function (c) { return c >= rg[0].slice(0, 3) && c <= (rg[1] || rg[0]).slice(0, 3); }); });
    }
    if (!term) return list;
    var res = list.filter(function (d) {
      var src = DISEASES[d._idx];   // cache no objeto original (as cópias de "list" são refeitas a cada busca)
      return matchRec(src, disHay(src), term);
    });
    if (!res.length && term.length >= 4) {
      res = list.filter(function (d) {
        var words = hayOf(DISEASES[d._idx], "palavras", function () { return stripAccents((d.nome || "").toLowerCase()).split(/[^a-z0-9]+/); });
        return term.split(/\s+/).every(function (t) {
          var tol = t.length >= 9 ? 2 : 1;
          return words.some(function (w) { if (w.length < 3) return false; if (w.indexOf(t) !== -1) return true; var cut = w.length > t.length ? w.slice(0, t.length + tol) : w; return editDist(t, w) <= tol || editDist(t, cut) <= tol; });
        });
      });
    }
    res.forEach(function (d) { d._rs = relScore(d.nome, (d.cid || "") + " " + (d.area || ""), term); });
    return res.sort(function (a, b) { return (b._rs - a._rs) || cmpPt(a.nome || "", b.nome || ""); });
  }

  function updateDiseaseAreaOptions() {
    var select = document.getElementById("disease-area-filter");
    if (!select) return;
    var current = select.value;
    var opts = DISEASE_AREAS.filter(function (a) { return !bigArea || diseaseBig({ area: a }) === bigArea; });
    select.innerHTML = '<option value="">' + (bigArea ? "Todas as especialidades" : "Todas as áreas") + '</option>' +
      opts.map(function (a) { return '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + "</option>"; }).join("");
    select.value = opts.indexOf(current) !== -1 ? current : "";
  }

  function renderDiseaseSidebar() {
    updateDiseaseAreaOptions();
    var list = filteredDiseases();
    if (list.length === 0) {
      sidebarEl.innerHTML = '<div class="no-results">Nenhum resultado para “' + escapeHtml(diseaseSearchTerm) + '”.</div>';
      return;
    }
    var html = "";
    var lastArea = null, dSearching = !!diseaseSearchTerm.trim() && !/^cid:/i.test(diseaseSearchTerm.trim());
    if (dSearching) html += '<div class="letter-group-label">Resultados por relevância (' + list.length + ")</div>";
    list.forEach(function (d) {
      if (!dSearching && d.area !== lastArea) {
        html += '<div class="letter-group-label">' + escapeHtml(d.area) + "</div>";
        lastArea = d.area;
      }
      html += '<button class="med-item' + (d._idx === selectedDiseaseIdx ? " active" : "") + '" data-idx="' + d._idx + '">' +
        '<span class="med-item-main">' + escapeHtml(d.nome || "(sem nome)") + (d.cid ? '<span class="cid-tag">' + escapeHtml(d.cid.split(",")[0].split("–")[0]) + "</span>" : "") + (dSearching ? '<span class="item-sub">' + escapeHtml(d.area) + "</span>" : "") + "</span>" + (isDisFav(d) ? '<span class="star-btn is-fav" title="Favorita">' + STAR_SVG + "</span>" : "") + "</button>";
    });
    sidebarEl.innerHTML = html;
    Array.prototype.forEach.call(sidebarEl.querySelectorAll(".med-item"), function (btn) {
      btn.addEventListener("click", function () {
        selectedDiseaseIdx = parseInt(btn.getAttribute("data-idx"), 10);
        document.body.classList.add("showing-detail");
        render();
      });
    });
  }

  function renderDiseaseDetail() {
    if (selectedDiseaseIdx === null || !DISEASES[selectedDiseaseIdx]) {
      detailEl.innerHTML =
        '<div class="detail-empty"><h2>Selecione uma doença</h2><p>Escolha um item na lista à esquerda para ver introdução, critérios diagnósticos, exames, tratamento e conduta — de forma objetiva.</p></div>';
      return;
    }
    var d = DISEASES[selectedDiseaseIdx];
    var html = '<button class="back-btn" id="back-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Voltar</button>';
    html += '<div class="med-header"><div><h2>' + escapeHtml(d.nome || "(sem nome)") + '</h2>';
    html += '<div class="badge-row"><span class="badge">' + escapeHtml(d.area) + "</span>" + trustBadge("d", d) + (d.cid ? '<span class="badge badge-cid" title="Classificação Internacional de Doenças (CID-10)">CID-10: ' + String(d.cid).split(/([,;])/).map(function (x) { var m = x.trim().match(/^[A-Z]\d\d/); return m ? '<a href="#" class="cid-go" data-cidgo="' + m[0] + '" title="Abrir ' + m[0] + ' na aba CID-10">' + escapeHtml(x.trim()) + "</a>" : escapeHtml(x); }).join(" ") + "</span>" : "") + "</div></div>";
    html += '<div class="med-actions"><button class="btn-ghost btn" id="copy-btn">Copiar resumo</button><button class="star-btn' + (isDisFav(d) ? " is-fav" : "") + '" id="detail-fav-btn" title="Favoritar" style="padding:7px;">' + STAR_SVG + '</button></div></div>';
    html += section("Introdução", d.introducao);
    html += section("Critérios diagnósticos", d.criterios);
    html += section("Exames", d.exames);
    html += section("Tratamento", d.tratamento);
    if (d.prescricao) html += section("Prescrição sugerida", d.prescricao);
    html += section("Conduta", d.conduta, { danger: true });
    html += '<p class="calc-note" style="margin-top:10px;">A prescrição sugerida resume esquemas de diretrizes (MS/PCDT, sociedades médicas, AHA, IDSA, GINA e outras) e não substitui o julgamento clínico: confirme doses na bula e no protocolo institucional, e individualize por peso, função renal/hepática, alergias e gestação.</p>';
    html += noteSectionHtml("d", d.nome);
    detailEl.innerHTML = html;
    pushRecent("d", d.nome); attachNote("d", d.nome);

    var back = document.getElementById("back-btn");
    if (back) back.addEventListener("click", function () {
      document.body.classList.remove("showing-detail");
    });
    document.getElementById("detail-fav-btn").addEventListener("click", function () { toggleDisFav(d); });
    document.getElementById("copy-btn").addEventListener("click", function () { copyText(diseaseSummary(d), this); });
  }

  /* ---------------- Anotações, recentes e busca universal ---------------- */
  var APP_REV_DATE = "21/10/2026";
  function lsGet(key, def) { try { var v = window.localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function lsSet(key, val) { try { window.localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* sem armazenamento */ } }
  var NOTES = lsGet("bluebook:notes", {});
  var RECENTS = lsGet("bluebook:recents", []);
  function pushRecent(type, name) {
    if (!name) return;
    RECENTS = RECENTS.filter(function (r) { return !(r.t === type && r.n === name); });
    RECENTS.unshift({ t: type, n: name });
    RECENTS = RECENTS.slice(0, 8);
    lsSet("bluebook:recents", RECENTS);
  }
  function noteSectionHtml(type, name) {
    var k = type + ":" + name, n = NOTES[k] || {};
    return '<div class="section note-section"><h3>Minhas anotações</h3>' +
      '<textarea id="note-text" placeholder="Escreva aqui observações pessoais (ficam salvas neste navegador/aparelho).">' + escapeHtml(n.t || "") + '</textarea>' +
      '<div class="note-meta"><label><input type="checkbox" id="note-rev"' + (n.rev ? " checked" : "") + '> Marcar para revisão/correção</label>' +
      '<span>Conteúdo compilado pelo Bluebook · revisão geral em ' + APP_REV_DATE + ' · confirmar na bula, no Bulário Anvisa e nas diretrizes vigentes.</span></div></div>';
  }
  function attachNote(type, name) {
    var ta = document.getElementById("note-text"), cb = document.getElementById("note-rev");
    if (!ta || !cb) return;
    var k = type + ":" + name;
    function save() {
      if (!ta.value.trim() && !cb.checked) delete NOTES[k]; else NOTES[k] = { t: ta.value, rev: cb.checked, at: new Date().toISOString() };
      lsSet("bluebook:notes", NOTES);
    }
    ta.addEventListener("input", save); cb.addEventListener("change", save);
  }
  function exportNotes() {
    var out = Object.keys(NOTES).map(function (k) { var i = k.indexOf(":"); return { tipo: k.slice(0, i) === "m" ? "medicamento" : "doença", nome: k.slice(i + 1), anotacao: NOTES[k].t || "", revisar: !!NOTES[k].rev, data: NOTES[k].at }; });
    var blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "bluebook-anotacoes.json";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  /* ---------------- Busca global (todo o app) ---------------- */
  function cidCats(s) {
    var out = []; String(s || "").replace(/[A-Z]\d\d(?:\.\d+)?/g, function (m) { out.push(m.slice(0, 3)); return m; });
    return out;
  }
  function inRange(cat, rg) { var p = rg.split("-"); return cat >= p[0] && cat <= p[1]; }
  var GS = { built: false, m: [], d: [], s: [], a: [], r: { vac: [], flux: [], ecg: [] } };
  function gsNorm(x) { return stripAccents(String(x || "").toLowerCase()); }
  function gsBuild() {
    if (GS.built) return; GS.built = true;
    GS.m = medications.map(function (m) { return { h: gsNorm([m.nome, m.referencias, m.classe, medGroup(m), m.esp, m.indicacoes, m.apresentacoes, m.posologia, m.observacoes, m.areas].join(" ")), n: gsNorm(m.nome), o: m }; });
    GS.d = DISEASES.map(function (d, i) { return { h: gsNorm([d.nome, d.cid, d.area, d.esp, d.introducao, d.criterios, d.exames, d.tratamento, d.conduta, d.prescricao].join(" ")), n: gsNorm(d.nome), i: i, o: d }; });
    GS.s = SCORES.map(function (s) { return { h: gsNorm([s.nome, s.desc, (s.areas || []).join(" "), s.especialidade].join(" ")), n: gsNorm(s.nome), o: s }; });
    GS.a = ATB.map(function (a) { return { h: gsNorm([a.nome, a.grupo, a.s.map(function (x) { return x[0] + " " + x[1]; }).join(" ")].join(" ")), n: gsNorm(a.nome), o: a }; });
    [["vac", VAC], ["flux", FLUX], ["ecg", ECG], ["calc", CALC_ITEMS], ["lab", LAB], ["cid", CID_DATA]].forEach(function (p) {
      GS.r[p[0]] = p[1].map(function (a) { return { h: gsNorm([a.nome, a.grupo, a.x || "", a.s.map(function (x) { return x[0] + " " + x[1]; }).join(" ")].join(" ")), n: gsNorm(a.nome), o: a }; });
    });
  }
  function gsAll(list, terms) {
    var sets = termSets(terms.join(" "));
    var hits = list.filter(function (e) {
      var b = typeof Uint32Array === "function" ? hayOf(e, "bloom", function () { return bloomOf(e.h); }) : null;
      return sets.some(function (set) { return set.every(function (t) { return (!b || bloomMay(b, t)) && tokMatch(e.h, t); }); });
    });
    hits.sort(function (a, b) {
      var an = terms.every(function (t) { return a.n.indexOf(t) !== -1; }) ? 0 : 1, bn = terms.every(function (t) { return b.n.indexOf(t) !== -1; }) ? 0 : 1;
      return an - bn;
    });
    return hits;
  }
  function gsCid(termRaw, terms) {
    var q = termRaw.trim().toUpperCase(), out = [];
    var isCode = /^[A-Z]\d{1,2}(\.\d*)?$/.test(q);
    if (isCode && q.length >= 2) {
      var cat = q.slice(0, 3);
      CID_BLK.forEach(function (b) { if (q.length >= 3 ? inRange(cat, b[0]) : (b[0].charAt(0) === q.charAt(0) && b[0].slice(1, 2) === q.charAt(1))) out.push({ k: "b", code: b[0], nome: b[1] }); });
      var seen = {};
      DISEASES.forEach(function (d, i) {
        String(d.cid || "").split(/[,;]/).forEach(function (c) {
          c = c.trim(); if (c && c.indexOf(q) === 0 && !seen[c]) { seen[c] = 1; out.push({ k: "c", code: c, nome: "", i: i }); }
        });
      });
    } else {
      CID_CAP.forEach(function (c) { if (terms.every(function (t) { return gsNorm(c[2]).indexOf(t) !== -1; })) out.push({ k: "p", code: c[1], nome: "Capítulo " + c[0] + " — " + c[2] }); });
      CID_BLK.forEach(function (b) { if (terms.every(function (t) { return gsNorm(b[1]).indexOf(t) !== -1; })) out.push({ k: "b", code: b[0], nome: b[1] }); });
    }
    return out;
  }
  var GS_GROUPS = [["m", "Medicamentos"], ["d", "Doenças"], ["c", "CID-10"], ["s", "Escores"], ["a", "Antibióticos por foco"], ["vac", "Vacinas"], ["flux", "Fluxogramas"], ["ecg", "ECG"], ["calc", "Calculadoras"], ["lab", "Laboratório"], ["cid", "CID-10 (categorias e subcategorias)"]];
  function globalSearchHtml(termRaw, skip, open) {
    gsBuild();
    var term = gsNorm(termRaw.trim()), terms = term.split(/\s+/).filter(Boolean);
    if (term.length < 2) return "";
    var res = {
      m: gsAll(GS.m, terms), d: gsAll(GS.d, terms), c: gsCid(termRaw, terms), s: gsAll(GS.s, terms), a: gsAll(GS.a, terms),
      vac: gsAll(GS.r.vac, terms), flux: gsAll(GS.r.flux, terms), ecg: gsAll(GS.r.ecg, terms), calc: gsAll(GS.r.calc, terms), lab: gsAll(GS.r.lab, terms), cid: gsAll(GS.r.cid, terms)
    };
    (skip || []).forEach(function (k) { res[k] = []; });
    var total = 0; GS_GROUPS.forEach(function (g) { total += res[g[0]].length; });
    if (!total && skip && skip.length) return "";
    var chips = GS_GROUPS.filter(function (g) { return res[g[0]].length; }).map(function (g) { return g[1] + " " + res[g[0]].length; }).join(" · ");
    var html = '<details class="cross-box gs-box"' + (open ? " open" : "") + '><summary><strong>' + (skip && skip.length ? "Também em outras seções" : "Busca em todo o app") + " — " + total + " resultado" + (total === 1 ? "" : "s") + '</strong><span class="gs-chips">' + escapeHtml(chips) + "</span></summary>";
    if (!total) html += '<div class="calc-note">Nada encontrado em medicamentos, doenças, CID-10, escores, antibióticos, vacinas, fluxogramas ou ECG.</div>';
    GS_GROUPS.forEach(function (g) {
      var list = res[g[0]]; if (!list.length) return;
      html += '<div class="gs-head"><strong>' + g[1] + " (" + list.length + ')</strong>' + (g[0] !== "c" ? ' <button type="button" class="gs-more" data-gk="' + g[0] + '">ver todos</button>' : "") + "</div>";
      list.slice(0, 5).forEach(function (e) {
        var lab = "", sub = "", attr = "";
        if (g[0] === "m") { lab = e.o.nome; sub = e.o.classe; attr = 'data-gk="m" data-gv="' + escapeHtml(String(e.o.id)) + '"'; }
        else if (g[0] === "d") { lab = e.o.nome; sub = (e.o.cid || "") + " · " + e.o.area; attr = 'data-gk="d" data-gv="' + e.i + '"'; }
        else if (g[0] === "s") { lab = e.o.nome; sub = e.o.especialidade; attr = 'data-gk="s" data-gv="' + e.o.id + '"'; }
        else if (g[0] === "a") { lab = e.o.nome; sub = e.o.grupo; attr = 'data-gk="a" data-gv="' + e.o.id + '"'; }
        else if (g[0] === "c") {
          if (e.k === "c") { lab = e.code; sub = DISEASES[e.i].nome; attr = 'data-gk="cc" data-gv="' + escapeHtml(e.code) + '"'; }
          else { lab = e.code + " — " + e.nome; sub = "ver doenças do app neste grupo"; attr = 'data-gk="cb" data-gv="' + escapeHtml(e.code) + '"'; }
        }
        else { lab = e.o.nome; sub = e.o.grupo; attr = 'data-gk="' + g[0] + '" data-gv="' + e.o.id + '"'; }
        html += '<button type="button" class="cross-item gs-item" ' + attr + ">" + hl(lab, terms) + " <small>" + escapeHtml(sub || "") + "</small></button>";
      });
    });
    return html + "</details>";
  }
  function gsGo(kind, val, term) {
    bigArea = ""; espFilter = "";
    if (kind === "m") { classFilter = ""; searchTerm = term; selectedId = val; switchViewMode("meds"); }
    else if (kind === "d") { diseaseAreaFilter = ""; diseaseSearchTerm = term; selectedDiseaseIdx = parseInt(val, 10); switchViewMode("diseases"); }
    else if (kind === "cc") { diseaseAreaFilter = ""; diseaseSearchTerm = val; selectedDiseaseIdx = null; switchViewMode("diseases"); }
    else if (kind === "cb") { diseaseAreaFilter = ""; diseaseSearchTerm = "cid:" + val; selectedDiseaseIdx = null; switchViewMode("diseases"); }
    else if (kind === "s") { scoreSearchTerm = ""; selectedScoreId = val; switchViewMode("scores"); }
    else if (kind === "a") { atbSearchTerm = ""; selectedAtbId = val; switchViewMode("atb"); }
    else if (REFS[kind]) { REFS[kind].st.term = ""; REFS[kind].st.sel = val; switchViewMode(kind); }
    document.body.classList.add("showing-detail"); render();
  }
  function gsMore(kind, term) {
    bigArea = ""; espFilter = "";
    if (kind === "m") { classFilter = ""; searchTerm = term; switchViewMode("meds"); }
    else if (kind === "d") { diseaseAreaFilter = ""; diseaseSearchTerm = term; switchViewMode("diseases"); }
    else if (kind === "s") { scoreSearchTerm = term; switchViewMode("scores"); }
    else if (kind === "a") { atbSearchTerm = term; switchViewMode("atb"); }
    else if (REFS[kind]) { REFS[kind].st.term = term; switchViewMode(kind); }
    searchInput.value = term; render();
  }
  document.addEventListener("click", function (e) {
    var g = e.target && e.target.closest ? e.target.closest(".cid-go") : null; if (!g) return;
    e.preventDefault(); REFS.cid.st.term = ""; REFS.cid.st.sel = "c" + g.getAttribute("data-cidgo"); switchViewMode("cid"); document.body.classList.add("showing-detail"); render();
  });
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest(".gs-item, .gs-more") : null; if (!el) return;
    e.preventDefault(); e.stopPropagation();
    var term = searchInput.value; histAdd(term);
    if (el.classList.contains("gs-more")) gsMore(el.getAttribute("data-gk"), term);
    else gsGo(el.getAttribute("data-gk"), el.getAttribute("data-gv"), term);
  }, true);
  document.addEventListener("click", function (e) {
    var c = e.target && e.target.closest ? e.target.closest(".hist-chip, #hist-clear") : null; if (!c) return;
    if (c.id === "hist-clear") { HIST = []; try { window.localStorage.removeItem("bluebook:hist"); } catch (x) {} render(); return; }
    searchInput.value = c.getAttribute("data-hq"); searchInput.dispatchEvent(new Event("input", { bubbles: true })); searchInput.focus();
  });
  function decorateSidebar() {
    var term = searchInput.value.trim();
    var html = "";
    if (term.length < 2) {
      if (HIST.length) html += '<div class="recent-box"><h5>Buscas recentes <button type="button" class="hist-clear gs-clear" id="hist-clear">limpar</button></h5>' + HIST.map(function (x) { return '<button type="button" class="hist-chip" data-hq="' + escapeHtml(x) + '">' + escapeHtml(x) + "</button>"; }).join("") + "</div>";
      if (viewMode !== "meds" && viewMode !== "diseases") { if (html) sidebarEl.insertAdjacentHTML("afterbegin", html); return; }
      var type = viewMode === "meds" ? "m" : "d";
      var rec = RECENTS.filter(function (r) { return r.t === type; }).slice(0, 6);
      if (rec.length) {
        html += '<div class="recent-box"><h5>Recentes</h5>' + rec.map(function (r) { return '<button type="button" class="recent-chip" data-rt="' + r.t + '" data-rn="' + escapeHtml(r.n) + '">' + escapeHtml(r.n) + "</button>"; }).join("") + "</div>";
      }
    } else {
      var skip = viewMode === "meds" ? ["m"] : viewMode === "diseases" ? ["d"] : viewMode === "scores" ? ["s"] : viewMode === "atb" ? ["a"] : [];
      var localN = sidebarEl.querySelectorAll(".med-item").length;
      html = globalSearchHtml(term, skip, localN === 0);
    }
    if (html) sidebarEl.insertAdjacentHTML("afterbegin", html);
  }
  document.addEventListener("click", function (e) {
    var chip = e.target && e.target.closest ? e.target.closest(".recent-chip, .cross-item") : null;
    if (!chip) return;
    if (chip.classList.contains("recent-chip")) {
      var rt = chip.getAttribute("data-rt"), rn = chip.getAttribute("data-rn");
      if (rt === "m") { var mm = medications.filter(function (m) { return m.nome === rn; })[0]; if (mm) selectedId = mm.id; }
      else { DISEASES.forEach(function (d, i) { if (d.nome === rn) selectedDiseaseIdx = i; }); }
      document.body.classList.add("showing-detail"); render(); return;
    }
    var ct = chip.getAttribute("data-ct"), ci = chip.getAttribute("data-ci");
    var term = searchInput.value;
    bigArea = "";
    if (ct === "d") { diseaseAreaFilter = ""; diseaseSearchTerm = term; selectedDiseaseIdx = parseInt(ci, 10); switchViewMode("diseases"); }
    else { classFilter = ""; searchTerm = term; selectedId = ci; switchViewMode("meds"); }
    document.body.classList.add("showing-detail"); render();
  });
  var _ras = renderAtbSidebar; renderAtbSidebar = function () { _ras.apply(this, arguments); decorateSidebar(); };
  var _rss = renderScoreSidebar; renderScoreSidebar = function () { _rss.apply(this, arguments); decorateSidebar(); };
  var _rsb = renderSidebar; renderSidebar = function () { _rsb.apply(this, arguments); decorateSidebar(); };
  var _rdsb = renderDiseaseSidebar; renderDiseaseSidebar = function () { _rdsb.apply(this, arguments); decorateSidebar(); };

  /* ---------------- Prescrição: verificador de interações ---------------- */
  var RX = lsGet("bluebook:rx", []);
  var RXPT = lsGet("bluebook:rxpt", { gest: false, lact: false, ped: false });
  function rxMeds() {
    return RX.map(function (n) { return medications.filter(function (m) { return m.nome === n; })[0]; }).filter(Boolean);
  }
  function rxSave() { lsSet("bluebook:rx", RX); lsSet("bluebook:rxpt", RXPT); }
  function rxBox() {
    var html = '<div class="rx-box"><h5>Prescrição (' + RX.length + ')</h5>';
    if (!RX.length) html += '<span class="calc-note">Toque nos medicamentos abaixo para adicionar.</span>';
    RX.forEach(function (n) { html += '<button type="button" class="rx-chip" data-rxdel="' + escapeHtml(n) + '" title="Remover">' + escapeHtml(n) + " <b>×</b></button>"; });
    if (RX.length) html += '<div style="margin-top:6px;"><button type="button" class="btn" id="rx-open">Ver análise</button> <button type="button" class="btn-ghost btn" id="rx-clear">Limpar</button></div>';
    return html + "</div>";
  }
  function renderRxSidebar() {
    updateClassOptions();
    var list = filteredSorted().slice(0, 80);
    var html = rxBox();
    if (!list.length) html += '<div class="no-results">Nenhum medicamento encontrado.</div>';
    list.forEach(function (m) {
      var on = RX.indexOf(m.nome) !== -1;
      html += '<button class="med-item rx-add" data-rxadd="' + escapeHtml(m.nome) + '"><span class="med-item-main">' + escapeHtml(m.nome) + '</span><span class="plus">' + (on ? "✓" : "+") + "</span></button>";
    });
    sidebarEl.innerHTML = html;
  }
  document.addEventListener("click", function (e) {
    if (viewMode !== "rx") return;
    var t = e.target, del = t.closest ? t.closest("[data-rxdel]") : null, add = t.closest ? t.closest("[data-rxadd]") : null;
    if (del) { var n = del.getAttribute("data-rxdel"); RX = RX.filter(function (x) { return x !== n; }); rxSave(); render(); return; }
    if (add) {
      var nm = add.getAttribute("data-rxadd");
      if (RX.indexOf(nm) === -1) RX.push(nm); else RX = RX.filter(function (x) { return x !== nm; });
      rxSave(); render(); return;
    }
    if (t.closest && t.closest("#rx-open")) { document.body.classList.add("showing-detail"); return; }
    if (t.closest && t.closest("#rx-clear")) { RX = []; rxSave(); render(); }
  });
  function popLabel(v) { var p = String(v || "").split(" — "); return p.length > 1 ? p[0] : "—"; }
  function rxAnalysis() {
    var meds = rxMeds(), items = [], seen = {};
    for (var i = 0; i < meds.length; i++) {
      for (var j = i + 1; j < meds.length; j++) {
        var ta = medTags(meds[i]), tb = medTags(meds[j]);
        INTERACTION_RULES.forEach(function (r) {
          var m1 = ta.indexOf(r[0]) !== -1 && tb.indexOf(r[1]) !== -1, m2 = ta.indexOf(r[1]) !== -1 && tb.indexOf(r[0]) !== -1;
          if (m1 || m2) { var key = meds[i].nome + "|" + meds[j].nome + "|" + r[3]; if (!seen[key]) { seen[key] = 1; items.push({ a: meds[i].nome, b: meds[j].nome, sev: r[2], d: r[3] }); } }
        });
      }
    }
    items.sort(function (x, y) { return x.sev === y.sev ? 0 : x.sev === "grave" ? -1 : 1; });
    var alerts = [];
    var groups = [["qt", "Prolongadores do intervalo QT"], ["depressor_snc", "Depressores do SNC"], ["isrs_irsn", "Antidepressivos serotoninérgicos"], ["triciclico", "Antidepressivos tricíclicos"], ["aine", "AINEs"], ["ieca_bra", "IECA/BRA"], ["estatina", "Estatinas"], ["ibp", "Inibidores de bomba de prótons"], ["benzodiazepinico", "Benzodiazepínicos"], ["opioide", "Opioides"], ["antipsicotico", "Antipsicóticos"], ["betabloqueador", "Betabloqueadores"], ["anticoagulante", "Anticoagulantes"], ["antiagregante", "Antiagregantes plaquetários"], ["corticoide", "Corticoides sistêmicos"], ["quinolona", "Quinolonas"], ["macrolideo", "Macrolídeos"], ["diuretico_espoliador", "Diuréticos espoliadores de potássio"]];
    groups.forEach(function (g) {
      var names = meds.filter(function (m) { return medTags(m).indexOf(g[0]) !== -1; }).map(function (m) { return m.nome; });
      if (names.length >= 2) alerts.push({ t: g[0] === "qt" || g[0] === "depressor_snc" ? "moderada" : "info", d: (g[0] === "qt" ? "Associação de " + names.length + " fármacos que podem prolongar o QT: considerar ECG e eletrólitos (K+, Mg2+). " : g[0] === "depressor_snc" ? "Soma de efeitos sedativos/depressores do SNC: risco de sonolência, quedas e depressão respiratória. " : "Possível duplicidade terapêutica (" + g[1] + "): ") + names.join(", ") + "." });
    });
    var byClass = {};
    meds.forEach(function (m) { var c = (m.classe || "").trim(); if (c) (byClass[c] = byClass[c] || []).push(m.nome); });
    Object.keys(byClass).forEach(function (c) { if (byClass[c].length >= 2 && !alerts.some(function (a) { return byClass[c].every(function (n) { return a.d.indexOf(n) !== -1; }); })) alerts.push({ t: "info", d: "Mesma classe (" + c + "): " + byClass[c].join(", ") + " — verificar duplicidade." }); });
    return { meds: meds, items: items, alerts: alerts };
  }
  function renderRxDetail() {
    var A = rxAnalysis(), meds = A.meds;
    var html = '<button class="back-btn" id="back-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Voltar</button>';
    html += '<div class="med-header"><div><h2>Prescrição</h2><div class="badge-row"><span class="badge">Verificador de interações</span><span class="badge">' + meds.length + " medicamento" + (meds.length === 1 ? "" : "s") + '</span></div></div><div class="med-actions"><button class="btn-ghost btn" id="rx-copy">Copiar análise</button></div></div>';
    html += '<div class="rx-pt"><label><input type="checkbox" id="pt-gest"' + (RXPT.gest ? " checked" : "") + '> Gestante</label><label><input type="checkbox" id="pt-lact"' + (RXPT.lact ? " checked" : "") + '> Lactante</label><label><input type="checkbox" id="pt-ped"' + (RXPT.ped ? " checked" : "") + '> Criança / adolescente</label></div>';
    if (meds.length < 1) {
      html += '<div class="detail-empty"><h2>Monte a prescrição</h2><p>Adicione 2 ou mais medicamentos na lista ao lado. O Bluebook cruza todas as combinações e mostra interações, duplicidades, risco na gestação/lactação/pediatria e exigência de receita especial.</p></div>';
      detailEl.innerHTML = html; rxWire(A); return;
    }
    var g = A.items.filter(function (x) { return x.sev === "grave"; }).length;
    html += '<div class="section danger"><h3>Interações medicamentosas (' + A.items.length + (g ? " — " + g + " grave" + (g > 1 ? "s" : "") : "") + ")</h3>";
    if (meds.length < 2) html += '<p class="body-text empty">Adicione ao menos 2 medicamentos para cruzar interações.</p>';
    else if (!A.items.length) html += '<p class="body-text">Nenhuma interação encontrada pelas regras do Bluebook para esta combinação. A lista não é exaustiva: confirme na bula ou com o farmacêutico.</p>';
    A.items.forEach(function (x) { html += '<div class="rx-item ' + x.sev + '"><strong>' + escapeHtml(x.a) + " + " + escapeHtml(x.b) + '</strong><span class="tag">[' + x.sev + "]</span><br>" + escapeHtml(x.d) + "</div>"; });
    html += "</div>";
    if (A.alerts.length) {
      html += '<div class="section"><h3>Alertas da associação</h3>';
      A.alerts.forEach(function (a) { html += '<div class="rx-item ' + a.t + '">' + escapeHtml(a.d) + "</div>"; });
      html += "</div>";
    }
    html += '<div class="section"><h3>Por medicamento</h3><div style="overflow-x:auto;"><table class="rx-table"><thead><tr><th>Medicamento</th><th>Tarja / receita</th><th>Gestação</th><th>Lactação</th><th>Pediatria</th></tr></thead><tbody>';
    meds.forEach(function (m) {
      var gl = popLabel(m.gestacao), ll = popLabel(m.lactacao);
      html += "<tr><td><strong>" + escapeHtml(m.nome) + "</strong></td><td>" + escapeHtml(m.tarja || "—") + '</td><td><span class="pop-badge ' + popClass(gl) + '">' + escapeHtml(gl) + '</span></td><td><span class="pop-badge ' + popClass(ll) + '">' + escapeHtml(ll) + "</span></td><td>" + escapeHtml((m.pediatria || "—").slice(0, 110)) + (m.pediatria && m.pediatria.length > 110 ? "…" : "") + "</td></tr>";
    });
    html += "</tbody></table></div></div>";
    var warn = [];
    meds.forEach(function (m) {
      if (RXPT.gest && /^(contraindicad|evitar)/i.test(m.gestacao || "")) warn.push("Gestação — " + m.nome + ": " + m.gestacao);
      else if (RXPT.gest && /^cautela/i.test(m.gestacao || "")) warn.push("Gestação (cautela) — " + m.nome + ": " + m.gestacao);
      if (RXPT.lact && /^(contraindicad|evitar)/i.test(m.lactacao || "")) warn.push("Lactação — " + m.nome + ": " + m.lactacao);
      else if (RXPT.lact && /^cautela/i.test(m.lactacao || "")) warn.push("Lactação (cautela) — " + m.nome + ": " + m.lactacao);
      if (RXPT.ped && m.pediatria) warn.push("Pediatria — " + m.nome + ": " + m.pediatria);
    });
    if (warn.length) { html += '<div class="section danger"><h3>Alertas para o perfil do paciente</h3>'; warn.forEach(function (w) { html += '<div class="rx-item ' + (/cautela/i.test(w.split(":")[0]) || /^Pediatria/.test(w) ? "moderada" : "grave") + '">' + escapeHtml(w) + "</div>"; }); html += "</div>"; }
    else if (RXPT.gest || RXPT.lact || RXPT.ped) html += '<div class="section"><h3>Alertas para o perfil do paciente</h3><p class="body-text">Nenhum alerta de contraindicação/evitar para o perfil selecionado nos itens desta prescrição.</p></div>';
    var ctl = meds.filter(function (m) { return /preta|retenc|controle|especial|notifica/i.test(m.tarja || ""); });
    if (ctl.length) { html += '<div class="section"><h3>Receita especial / controle</h3>'; ctl.forEach(function (m) { html += '<div class="rx-item info"><strong>' + escapeHtml(m.nome) + "</strong>: " + escapeHtml(m.tarja) + "</div>"; }); html += "</div>"; }
    html += rxReceitaHtml(meds);
    html += '<p class="calc-note">Análise automática por classe farmacológica e regras internas do Bluebook; não cobre doses, função renal/hepática, alergias nem todas as interações. Confirme na bula, em base de interações validada e com o farmacêutico antes de prescrever.</p>';
    detailEl.innerHTML = html; rxWire(A); rxReceitaWire(meds);
  }
  function rxWire(A) {
    var back = document.getElementById("back-btn");
    if (back) back.addEventListener("click", function () { document.body.classList.remove("showing-detail"); });
    [["pt-gest", "gest"], ["pt-lact", "lact"], ["pt-ped", "ped"]].forEach(function (x) {
      var el = document.getElementById(x[0]);
      if (el) el.addEventListener("change", function () { RXPT[x[1]] = el.checked; rxSave(); renderRxDetail(); });
    });
    var cp = document.getElementById("rx-copy");
    if (cp) cp.addEventListener("click", function () {
      var t = "Prescrição: " + A.meds.map(function (m) { return m.nome; }).join("; ") + "\n\nInterações:\n" + (A.items.length ? A.items.map(function (x) { return "- " + x.a + " + " + x.b + " [" + x.sev + "]: " + x.d; }).join("\n") : "- nenhuma encontrada pelas regras do Bluebook") + (A.alerts.length ? "\n\nAlertas:\n" + A.alerts.map(function (a) { return "- " + a.d; }).join("\n") : "") + "\n\n(Análise automática; confirmar na bula.)";
      copyText(t, cp);
    });
  }

  /* ---------------- Guia de antimicrobianos por foco ---------------- */
  var ATB_CAB = "Doses para adulto com função renal normal, salvo indicação. Ajustar por função renal/hepática, alergia, gestação, epidemiologia e antibiograma locais (CCIH). Colher culturas antes do antibiótico quando possível, sem atrasar o tratamento do paciente grave; reavaliar em 48–72 h (descalonar/suspender).";
  var ATB = /*@dados:ATB*/[];
  var atbSearchTerm = "", selectedAtbId = "";
  function filteredAtb() {
    var term = stripAccents(atbSearchTerm.trim().toLowerCase());
    return ATB.filter(function (a) {
      if (!term) return true;
      var txt = a.nome + " " + a.grupo + " " + a.s.map(function (x) { return x[0] + " " + x[1]; }).join(" ");
      return stripAccents(txt.toLowerCase()).indexOf(term) !== -1;
    });
  }
  function renderAtbSidebar() {
    var list = filteredAtb();
    if (!list.length) { sidebarEl.innerHTML = '<div class="no-results">Nenhum foco encontrado.</div>'; return; }
    var html = "", last = null;
    list.slice().sort(function (a, b) { return (a.grupo + a.nome).localeCompare(b.grupo + b.nome, "pt-BR"); }).forEach(function (a) {
      if (a.grupo !== last) { html += '<div class="letter-group-label">' + escapeHtml(a.grupo) + "</div>"; last = a.grupo; }
      html += '<button class="med-item' + (a.id === selectedAtbId ? " active" : "") + '" data-atb="' + a.id + '"><span class="med-item-main">' + escapeHtml(a.nome) + "</span></button>";
    });
    sidebarEl.innerHTML = html;
    Array.prototype.forEach.call(sidebarEl.querySelectorAll("[data-atb]"), function (b) {
      b.addEventListener("click", function () { selectedAtbId = b.getAttribute("data-atb"); document.body.classList.add("showing-detail"); render(); });
    });
  }
  function renderAtbDetail() {
    var a = ATB.filter(function (x) { return x.id === selectedAtbId; })[0];
    if (!a) { detailEl.innerHTML = '<div class="detail-empty"><h2>Antimicrobianos por foco</h2><p>' + escapeHtml(ATB_CAB) + "</p></div>"; return; }
    var html = '<button class="back-btn" id="back-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Voltar</button>';
    html += '<div class="med-header"><div><h2>' + escapeHtml(a.nome) + '</h2><div class="badge-row"><span class="badge">' + escapeHtml(a.grupo) + '</span><span class="badge">Guia de antimicrobianos</span></div></div></div>';
    a.s.forEach(function (x) { html += '<div class="section"><h3>' + escapeHtml(x[0]) + '</h3><p class="body-text">' + escapeHtml(x[1]) + "</p></div>"; });
    html += '<p class="calc-note">' + escapeHtml(ATB_CAB) + " Resumo baseado em diretrizes amplamente usadas (SBPT, SBI, Ministério da Saúde, IDSA); não substitui o protocolo da CCIH nem a avaliação do caso.</p>";
    detailEl.innerHTML = html;
    var back = document.getElementById("back-btn");
    if (back) back.addEventListener("click", function () { document.body.classList.remove("showing-detail"); });
  }

  /* ---------------- Receita, vacinas e fluxogramas ---------------- */
  var VAC_CAB = "Resumo do Calendário Nacional de Vacinação (PNI/Ministério da Saúde) e orientações gerais. O calendário muda com frequência (faixas etárias, vacinas novas, esquemas): confirme sempre a versão vigente no Ministério da Saúde, na secretaria estadual de saúde e no calendário da SBIm. Não substitui a avaliação da caderneta.";
  var VAC = /*@dados:VAC*/[];
  var FLUX_CAB = "Fluxogramas de bolso para consulta rápida, baseados em diretrizes de AHA/ACLS, ATLS, Surviving Sepsis Campaign, ILAS e diretrizes brasileiras (SBC, Academia Brasileira de Neurologia). Seguem o protocolo do serviço e a avaliação de quem está à beira do leito; doses para adulto.";
  var FLUX = /*@dados:FLUX*/[];
  var ECG_CAB = "Guia de bolso de leitura de ECG. Não substitui a interpretação do traçado completo nem a avaliação clínica; valores de referência para adultos.";
  var ECG = /*@dados:ECG*/[];

  function makeRef(mode, tabId, data, cab, ph, kind) {
    var st = { term: "", sel: "" };
    function filt() {
      var t = stripAccents(st.term.trim().toLowerCase());
      return data.filter(function (a) {
        if (!t) return true;
        if (a._h === undefined) a._h = stripAccents((a.nome + " " + a.grupo + " " + (a.x || "") + " " + a.s.map(function (x) { return x[0] + " " + x[1]; }).join(" ")).toLowerCase());
        return matchTerm(a._h, t);
      });
    }
    function side() {
      var list = filt();
      if (!list.length) { sidebarEl.innerHTML = '<div class="no-results">Nada encontrado.</div>'; return; }
      var html = "", last = null;
      list.forEach(function (a) {
        if (a.grupo !== last) { html += '<div class="letter-group-label">' + escapeHtml(a.grupo) + "</div>"; last = a.grupo; }
        html += '<button class="med-item' + (a.id === st.sel ? " active" : "") + '" data-ref="' + a.id + '"><span class="med-item-main">' + escapeHtml(a.nome) + "</span></button>";
      });
      sidebarEl.innerHTML = html;
      Array.prototype.forEach.call(sidebarEl.querySelectorAll("[data-ref]"), function (b) {
        b.addEventListener("click", function () { st.sel = b.getAttribute("data-ref"); document.body.classList.add("showing-detail"); render(); });
      });
    }
    function det() {
      var a = data.filter(function (x) { return x.id === st.sel; })[0];
      if (!a) { detailEl.innerHTML = '<div class="detail-empty"><h2>' + escapeHtml(kind) + "</h2><p>" + escapeHtml(cab) + "</p></div>"; return; }
      var html = '<button class="back-btn" id="back-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Voltar</button>';
      html += '<div class="med-header"><div><h2>' + escapeHtml(a.nome) + '</h2><div class="badge-row"><span class="badge">' + escapeHtml(a.grupo) + '</span><span class="badge">' + escapeHtml(kind) + "</span></div></div></div>";
      a.s.forEach(function (x) { html += '<div class="section"><h3>' + escapeHtml(x[0]) + '</h3><p class="body-text">' + escapeHtml(x[1]) + "</p></div>"; });
      html += '<p class="calc-note">' + escapeHtml(cab) + "</p>";
      detailEl.innerHTML = html;
      var back = document.getElementById("back-btn");
      if (back) back.addEventListener("click", function () { document.body.classList.remove("showing-detail"); });
    }
    return { mode: mode, st: st, filt: filt, side: side, det: det, ph: ph, tab: tabId };
  }
  /* ---------------- Selo de confiabilidade ---------------- */
  var CONF_M = { "Sotatercepte": 1, "Epcoritamabe": 1, "Talquetamabe": 1, "Fruquintinibe": 1, "Ublituximabe": 1 };
  var AUTHOR_REVIEW = "07/11/2026";
  function trustLevel(kind, x) {
    var s = JSON.stringify(x);
    if (/PENDENTE DE VERIFICA/i.test(s)) return "pend";
    if (kind === "m" && CONF_M[x.nome]) return "ok";
    if (kind === "d" && /PCDT[^.\n]*Portaria/i.test(String(x.prescricao || ""))) return "ok";
    return AUTHOR_REVIEW ? "rev" : "lit";
  }
  function trustBadge(kind, x) {
    var l = trustLevel(kind, x);
    if (l === "ok") return '<span class="trust trust-ok" title="Conteúdo conferido com fonte oficial (bula, PCDT/Conitec ou rótulo regulatório) — fontes citadas no texto.">✓ Fonte oficial</span>';
    if (l === "rev") return '<span class="trust trust-ok" title="Conteúdo revisado item a item pelo autor do app em ' + AUTHOR_REVIEW + '. Confirme doses na bula vigente.">✓ Revisado pelo autor</span>';
    if (l === "pend") return '<span class="trust trust-pend" title="Há itens marcados como PENDENTE DE VERIFICAÇÃO nesta ficha.">⚠ Pendente</span>';
    return '<span class="trust trust-lit" title="Resumo baseado em literatura e diretrizes citadas, ainda não conferido item a item. Confirme na bula e no protocolo.">Literatura · não conferido</span>';
  }

  /* ---------------- Cobertura por especialidade (página inicial) ---------------- */
  function coverageHtml() {
    var dCnt = {}, mCnt = {}, classes = {};
    DISEASES.forEach(function (x) { String(x.esp || "").split("; ").forEach(function (e) { if (e) dCnt[e] = (dCnt[e] || 0) + 1; }); });
    medications.forEach(function (x) { classes[medGroup(x)] = 1; String(x.esp || "").split("; ").forEach(function (e) { if (e) mCnt[e] = (mCnt[e] || 0) + 1; }); });
    var tl = { ok: 0, lit: 0, pend: 0, rev: 0 };
    DISEASES.forEach(function (x) { tl[trustLevel("d", x)]++; });
    medications.forEach(function (x) { tl[trustLevel("m", x)]++; });
    var nf = function (n) { return Number(n).toLocaleString("pt-BR"); };
    var h = '<div class="cov"><h3>Cobertura do conteúdo</h3><p class="calc-note" style="margin:0;">Toque numa especialidade para ver as doenças dela.</p><div class="cov-tot">';
    h += "<span><b>" + nf(DISEASES.length) + "</b>doenças</span><span><b>" + nf(medications.length) + "</b>medicamentos</span><span><b>" + nf(Object.keys(classes).length) + "</b>grupos terapêuticos</span>";
    h += "<span><b>" + nf(CID_FULL.cat.length) + "</b>categorias CID-10</span><span><b>" + nf(CID_FULL.sub.length) + "</b>subcategorias CID-10</span><span><b>" + nf(SCORES.length) + "</b>escores</span>";
    h += '<span title="Fichas com selo ✓ Fonte oficial"><b>' + nf(tl.ok) + "</b>com fonte oficial</span><span title=\"Fichas revisadas pelo autor\"><b>" + nf(tl.rev) + "</b>revisadas pelo autor</span><span title=\"Fichas com itens pendentes\"><b>" + nf(tl.pend) + "</b>pendentes</span></div>";
    h += '<div class="cov-grid">';
    ESPECIALIDADES.forEach(function (e) {
      var nd = dCnt[e] || 0, nm = mCnt[e] || 0;
      h += '<button class="cov-row' + (nd < 20 ? " cov-low" : "") + '" data-cov="' + escapeHtml(e) + '"><span>' + escapeHtml(e) + "</span><small>" + nf(nd) + " doenças · " + nf(nm) + " meds</small></button>";
    });
    return h + '</div><p class="calc-note" style="margin-top:8px;">Borda dourada: menos de 20 doenças cadastradas na especialidade.</p></div>';
  }
  function homeQuickHtml() {
    var I = {"bolt": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/></svg>", "steth": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 3v6a5 5 0 0 0 10 0V3\"/><path d=\"M11 14v2a5 5 0 0 0 10 0v-2\"/><circle cx=\"21\" cy=\"12\" r=\"2\"/></svg>", "calc": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"3\"/><path d=\"M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2\"/></svg>", "score": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/></svg>", "cid": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 4h16v16H4z\"/><path d=\"M8 9h8M8 13h8M8 17h5\"/></svg>", "atb": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3\"/></svg>", "flux": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"3\" width=\"8\" height=\"6\" rx=\"1.5\"/><rect x=\"13\" y=\"15\" width=\"8\" height=\"6\" rx=\"1.5\"/><path d=\"M7 9v4h10v2\"/></svg>", "lab": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2\"/><path d=\"M8 2h8M7 14h10\"/></svg>"};
    var q = [["plantao", "Plantão", "Doses de emergência pelo peso", "red", "bolt"], ["diseases", "Doenças", DISEASES.length.toLocaleString("pt-BR") + " condutas", "blue", "steth"], ["calc", "Calculadoras", "Pediátrica, renal, IMC", "orange", "calc"], ["scores", "Escores", SCORES.length + " escores clínicos", "purple", "score"], ["cid", "CID-10", "Tabela completa", "gray", "cid"], ["atb", "Antibióticos", "Escolha por foco", "green", "atb"], ["flux", "Fluxogramas", "Protocolos de bolso", "teal", "flux"], ["lab", "Laboratório", "Valores de referência", "indigo", "lab"]];
    return '<div class="home-quick">' + q.map(function (x) { return '<button type="button" data-hq="' + x[0] + '"><span class="ic ic-' + x[3] + '">' + I[x[4]] + "</span><span class=\"hq-t\"><strong>" + x[1] + "</strong><small>" + escapeHtml(x[2]) + "</small></span></button>"; }).join("") + "</div>";
  }
  function attachCoverage() {
    Array.prototype.forEach.call(detailEl.querySelectorAll("[data-hq]"), function (b) { b.addEventListener("click", function () { switchViewMode(b.getAttribute("data-hq")); }); });
    Array.prototype.forEach.call(detailEl.querySelectorAll("[data-cov]"), function (b) {
      b.addEventListener("click", function () { espFilter = b.getAttribute("data-cov"); var sel = document.getElementById("esp-filter"); switchViewMode("diseases"); if (sel) sel.value = espFilter; });
    });
  }

  /* ---------------- Modo plantão: doses de emergência por peso ---------------- */
  var PL_KG = 0;
  try { PL_KG = parseFloat(window.localStorage.getItem("bluebook:pl-kg") || "0") || 0; } catch (e) { PL_KG = 0; }
  /* item: [nome, via, dose por kg, unidade, máximo, concentração (unidade/mL), observação, mínimo, faixas fixas [[até kg, dose]...]] */
  var PLANTAO = /*@dados:PLANTAO*/[];
  function plFmt(n) { var d = n >= 100 ? 0 : n >= 10 ? 1 : n >= 1 ? 2 : 3; return Number(n.toFixed(d)).toLocaleString("pt-BR"); }
  function plRow(it, kg) {
    var nome = it[0], via = it[1], dk = it[2], un = it[3], mx = it[4], conc = it[5], obs = it[6] || "", mn = it[7] || 0, fx = it[8];
    var dose = "", vol = "", cap = "", ad = it[9];
    if (ad && kg >= 50) { dose = ad; cap = '<span class="pl-max">ADULTO</span>'; }
    else if (fx && kg > 0) { for (var i = 0; i < fx.length; i++) if (kg <= fx[i][0]) { dose = fx[i][1]; break; } }
    else if (dk !== null && kg > 0) {
      var v = dk * kg;
      if (mn && v < mn) { v = mn; cap = '<span class="pl-max">MÍN.</span>'; }
      if (mx && v >= mx) { if (v > mx) cap = '<span class="pl-max">MÁX.</span>'; v = mx; }
      dose = v;
    }
    var unBase = un.replace("/h", "");
    if (dose !== "" && conc) vol = plFmt(dose / conc) + " mL";
    var doseTxt = dose === "" ? (dk !== null && !fx ? "—" : "") : plFmt(dose) + " " + un;
    var ref = fx ? "" : dk !== null ? plFmt(dk) + " " + unBase + "/kg" + (un.indexOf("/h") !== -1 ? "/h" : "") + (mx ? " · máx. " + plFmt(mx) + " " + un : "") : "";
    return "<tr><td><strong>" + escapeHtml(nome) + '</strong><br><span class="pl-obs">' + escapeHtml(via) + (ref ? " · " + escapeHtml(ref) : "") + '</span></td><td class="pl-dose">' + (doseTxt ? escapeHtml(doseTxt) + cap : "") + (vol ? '<br><span class="pl-obs">' + escapeHtml(vol) + "</span>" : "") + '</td><td class="pl-obs">' + escapeHtml(obs) + "</td></tr>";
  }
  var PLANTAO_REF = (function () {
    var st = { term: "", sel: "pcr" };
    function filt() {
      var t = stripAccents(st.term.trim().toLowerCase());
      return PLANTAO.filter(function (p) { return !t || stripAccents((p.nome + " " + p.grupo + " " + p.itens.map(function (i) { return i[0]; }).join(" ")).toLowerCase()).indexOf(t) !== -1; });
    }
    function side() {
      var list = filt(), html = "", last = null;
      if (!list.length) { sidebarEl.innerHTML = '<div class="no-results">Nada encontrado.</div>'; return; }
      list.forEach(function (p) {
        if (p.grupo !== last) { html += '<div class="letter-group-label">' + escapeHtml(p.grupo) + "</div>"; last = p.grupo; }
        html += '<button class="med-item' + (p.id === st.sel ? " active" : "") + '" data-pl="' + p.id + '"><span class="med-item-main">' + escapeHtml(p.nome) + "</span></button>";
      });
      sidebarEl.innerHTML = html;
      Array.prototype.forEach.call(sidebarEl.querySelectorAll("[data-pl]"), function (b) {
        b.addEventListener("click", function () { st.sel = b.getAttribute("data-pl"); document.body.classList.add("showing-detail"); side(); det(); });
      });
    }
    function table(p) {
      var rows = p.itens.map(function (it) { return plRow(it, PL_KG); }).join("");
      return '<table class="pl-table"><thead><tr><th>Medicamento / via</th><th>Dose (' + (PL_KG ? plFmt(PL_KG) + " kg" : "informe o peso") + ')</th><th>Observação</th></tr></thead><tbody>' + rows + "</tbody></table>";
    }
    function det() {
      var p = PLANTAO.filter(function (x) { return x.id === st.sel; })[0] || PLANTAO[0];
      var html = '<button class="back-btn" id="back-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Voltar</button>';
      html += '<div class="pl-kg"><label for="pl-kg">Peso do paciente</label><input id="pl-kg" type="number" inputmode="decimal" min="0.5" max="200" step="0.1" placeholder="kg" value="' + (PL_KG || "") + '"><span class="pl-obs">kg — vale para todos os protocolos do plantão. ≥ 50 kg: usa a dose de adulto quando ela é fixa (selo ADULTO); nos demais, o máximo é aplicado.</span></div>';
      html += '<div class="med-header" style="margin-bottom:12px;padding-bottom:10px;"><div><h2>' + escapeHtml(p.nome) + '</h2><div class="badge-row"><span class="badge">' + escapeHtml(p.grupo) + '</span><span class="trust trust-lit" title="Doses de referência das diretrizes citadas; confira com o protocolo da instituição.">Ref.: ' + escapeHtml(p.fonte) + "</span></div></div></div>";
      html += '<div id="pl-tab">' + table(p) + "</div>";
      html += '<p class="calc-note">Selo MÁX./MÍN.: o cálculo por peso atingiu o limite e a dose foi travada nele. Selo ADULTO: dose fixa de adulto (≥ 50 kg). Doses de referência para apoio rápido — não substituem o protocolo institucional nem o julgamento clínico. Confirme diluições na bula.</p>';
      detailEl.innerHTML = html;
      var inp = document.getElementById("pl-kg");
      inp.addEventListener("input", function () {
        var v = parseFloat(String(inp.value).replace(",", "."));
        PL_KG = v > 0 && v <= 250 ? v : 0;
        try { window.localStorage.setItem("bluebook:pl-kg", String(PL_KG || "")); } catch (e) {}
        document.getElementById("pl-tab").innerHTML = table(p);
      });
      var back = document.getElementById("back-btn");
      if (back) back.addEventListener("click", function () { document.body.classList.remove("showing-detail"); });
    }
    return { mode: "plantao", st: st, filt: filt, side: side, det: det, ph: "Buscar protocolo de emergência (PCR, anafilaxia…)", tab: "tab-plantao" };
  })();
  /* ---------------- CID-10: capítulos e grupos (blocos) ---------------- */
  var CID_CAP = [
    ["I","A00-B99","Algumas doenças infecciosas e parasitárias"],["II","C00-D48","Neoplasias [tumores]"],["III","D50-D89","Doenças do sangue e dos órgãos hematopoéticos e alguns transtornos imunitários"],
    ["IV","E00-E90","Doenças endócrinas, nutricionais e metabólicas"],["V","F00-F99","Transtornos mentais e comportamentais"],["VI","G00-G99","Doenças do sistema nervoso"],
    ["VII","H00-H59","Doenças do olho e anexos"],["VIII","H60-H95","Doenças do ouvido e da apófise mastoide"],["IX","I00-I99","Doenças do aparelho circulatório"],
    ["X","J00-J99","Doenças do aparelho respiratório"],["XI","K00-K93","Doenças do aparelho digestivo"],["XII","L00-L99","Doenças da pele e do tecido subcutâneo"],
    ["XIII","M00-M99","Doenças do sistema osteomuscular e do tecido conjuntivo"],["XIV","N00-N99","Doenças do aparelho geniturinário"],["XV","O00-O99","Gravidez, parto e puerpério"],
    ["XVI","P00-P96","Algumas afecções originadas no período perinatal"],["XVII","Q00-Q99","Malformações congênitas, deformidades e anomalias cromossômicas"],
    ["XVIII","R00-R99","Sintomas, sinais e achados anormais de exames clínicos e de laboratório, não classificados em outra parte"],["XIX","S00-T98","Lesões, envenenamento e algumas outras conseqüências de causas externas"],
    ["XX","V01-Y98","Causas externas de morbidade e de mortalidade"],["XXI","Z00-Z99","Fatores que influenciam o estado de saúde e o contato com os serviços de saúde"],["XXII","U00-U99","Códigos para propósitos especiais"]];
  var CID_BLK = [
["A00-A09","Doenças infecciosas intestinais"],["A15-A19","Tuberculose"],["A20-A28","Algumas doenças bacterianas zoonóticas"],["A30-A49","Outras doenças bacterianas"],["A50-A64","Infecções de transmissão predominantemente sexual"],["A65-A69","Outras doenças por espiroquetas"],["A70-A74","Outras doenças causadas por clamídias"],["A75-A79","Riquetsioses"],["A80-A89","Infecções virais do sistema nervoso central"],["A90-A99","Febres por arbovírus e febres hemorrágicas virais"],
["B00-B09","Infecções virais caracterizadas por lesões de pele e mucosas"],["B15-B19","Hepatite viral"],["B20-B24","Doença pelo vírus da imunodeficiência humana [HIV]"],["B25-B34","Outras doenças por vírus"],["B35-B49","Micoses"],["B50-B64","Doenças devidas a protozoários"],["B65-B83","Helmintíases"],["B85-B89","Pediculose, acaríase e outras infestações"],["B90-B94","Seqüelas de doenças infecciosas e parasitárias"],["B95-B98","Agentes de infecções bacterianas, virais e outros"],["B99-B99","Outras doenças infecciosas"],
["C00-C14","Neoplasias malignas do lábio, cavidade oral e faringe"],["C15-C26","Neoplasias malignas dos órgãos digestivos"],["C30-C39","Neoplasias malignas do aparelho respiratório e dos órgãos intratorácicos"],["C40-C41","Neoplasias malignas dos ossos e cartilagens articulares"],["C43-C44","Melanoma e outras neoplasias malignas da pele"],["C45-C49","Neoplasias malignas dos tecidos mesoteliais e tecidos moles"],["C50-C50","Neoplasia maligna da mama"],["C51-C58","Neoplasias malignas dos órgãos genitais femininos"],["C60-C63","Neoplasias malignas dos órgãos genitais masculinos"],["C64-C68","Neoplasias malignas do trato urinário"],["C69-C72","Neoplasias malignas do olho, encéfalo e outras partes do sistema nervoso central"],["C73-C75","Neoplasias malignas da tireoide e de outras glândulas endócrinas"],["C76-C80","Neoplasias malignas de localizações mal definidas, secundárias e não especificadas"],["C81-C96","Neoplasias malignas do tecido linfático, hematopoético e tecidos correlatos"],["C97-C97","Neoplasias malignas de localizações múltiplas independentes"],["D00-D09","Neoplasias in situ"],["D10-D36","Neoplasias benignas"],["D37-D48","Neoplasias de comportamento incerto ou desconhecido"],
["D50-D53","Anemias nutricionais"],["D55-D59","Anemias hemolíticas"],["D60-D64","Anemias aplásticas e outras anemias"],["D65-D69","Defeitos da coagulação, púrpura e outras afecções hemorrágicas"],["D70-D77","Outras doenças do sangue e dos órgãos hematopoéticos"],["D80-D89","Alguns transtornos que comprometem o mecanismo imunitário"],
["E00-E07","Transtornos da glândula tireóide"],["E10-E14","Diabetes mellitus"],["E15-E16","Outros transtornos da regulação da glicose e da secreção pancreática interna"],["E20-E35","Transtornos de outras glândulas endócrinas"],["E40-E46","Desnutrição"],["E50-E64","Outras deficiências nutricionais"],["E65-E68","Obesidade e outras formas de hiperalimentação"],["E70-E90","Distúrbios metabólicos"],
["F00-F09","Transtornos mentais orgânicos, inclusive os sintomáticos"],["F10-F19","Transtornos mentais e comportamentais devidos ao uso de substância psicoativa"],["F20-F29","Esquizofrenia, transtornos esquizotípicos e transtornos delirantes"],["F30-F39","Transtornos do humor [afetivos]"],["F40-F48","Transtornos neuróticos, relacionados com o estresse e somatoformes"],["F50-F59","Síndromes comportamentais associadas a disfunções fisiológicas e fatores físicos"],["F60-F69","Transtornos da personalidade e do comportamento do adulto"],["F70-F79","Retardo mental"],["F80-F89","Transtornos do desenvolvimento psicológico"],["F90-F98","Transtornos do comportamento e emocionais da infância e adolescência"],["F99-F99","Transtorno mental não especificado"],
["G00-G09","Doenças inflamatórias do sistema nervoso central"],["G10-G13","Atrofias sistêmicas que afetam principalmente o sistema nervoso central"],["G20-G26","Doenças extrapiramidais e transtornos do movimento"],["G30-G32","Outras doenças degenerativas do sistema nervoso"],["G35-G37","Doenças desmielinizantes do sistema nervoso central"],["G40-G47","Transtornos episódicos e paroxísticos"],["G50-G59","Transtornos dos nervos, das raízes e dos plexos nervosos"],["G60-G64","Polineuropatias e outros transtornos do sistema nervoso periférico"],["G70-G73","Doenças da junção mioneural e dos músculos"],["G80-G83","Paralisia cerebral e outras síndromes paralíticas"],["G90-G99","Outros transtornos do sistema nervoso"],
["H00-H06","Transtornos da pálpebra, do aparelho lacrimal e da órbita"],["H10-H13","Transtornos da conjuntiva"],["H15-H22","Transtornos da esclerótica, córnea, íris e corpo ciliar"],["H25-H28","Transtornos do cristalino"],["H30-H36","Transtornos da coróide e da retina"],["H40-H42","Glaucoma"],["H43-H45","Transtornos do humor vítreo e do globo ocular"],["H46-H48","Transtornos do nervo óptico e das vias ópticas"],["H49-H52","Transtornos dos músculos oculares, da motilidade binocular, da acomodação e da refração"],["H53-H54","Distúrbios visuais e cegueira"],["H55-H59","Outros transtornos do olho e anexos"],
["H60-H62","Doenças do ouvido externo"],["H65-H75","Doenças do ouvido médio e da mastóide"],["H80-H83","Doenças do ouvido interno"],["H90-H95","Outros transtornos do ouvido"],
["I00-I02","Febre reumática aguda"],["I05-I09","Doenças reumáticas crônicas do coração"],["I10-I15","Doenças hipertensivas"],["I20-I25","Doenças isquêmicas do coração"],["I26-I28","Doença cardíaca pulmonar e doenças da circulação pulmonar"],["I30-I52","Outras formas de doença do coração"],["I60-I69","Doenças cerebrovasculares"],["I70-I79","Doenças das artérias, arteríolas e capilares"],["I80-I89","Doenças das veias, vasos linfáticos e gânglios linfáticos"],["I95-I99","Outros transtornos do aparelho circulatório"],
["J00-J06","Infecções agudas das vias aéreas superiores"],["J09-J18","Influenza [gripe] e pneumonia"],["J20-J22","Outras infecções agudas das vias aéreas inferiores"],["J30-J39","Outras doenças das vias aéreas superiores"],["J40-J47","Doenças crônicas das vias aéreas inferiores"],["J60-J70","Doenças pulmonares devidas a agentes externos"],["J80-J84","Outras doenças respiratórias que afetam principalmente o interstício"],["J85-J86","Afecções necróticas e supurativas das vias aéreas inferiores"],["J90-J94","Outras doenças da pleura"],["J95-J99","Outras doenças do aparelho respiratório"],
["K00-K14","Doenças da cavidade oral, glândulas salivares e maxilares"],["K20-K31","Doenças do esôfago, estômago e duodeno"],["K35-K38","Doenças do apêndice"],["K40-K46","Hérnias"],["K50-K52","Enterites e colites não infecciosas"],["K55-K63","Outras doenças dos intestinos"],["K65-K67","Doenças do peritônio"],["K70-K77","Doenças do fígado"],["K80-K87","Transtornos da vesícula biliar, vias biliares e pâncreas"],["K90-K93","Outras doenças do aparelho digestivo"],
["L00-L08","Infecções da pele e do tecido subcutâneo"],["L10-L14","Afecções bolhosas"],["L20-L30","Dermatite e eczema"],["L40-L45","Afecções papuloescamosas"],["L50-L54","Urticária e eritema"],["L55-L59","Afecções da pele devidas à radiação"],["L60-L75","Afecções dos anexos da pele"],["L80-L99","Outras afecções da pele e do tecido subcutâneo"],
["M00-M25","Artropatias"],["M30-M36","Doenças sistêmicas do tecido conjuntivo"],["M40-M54","Dorsopatias"],["M60-M79","Transtornos dos tecidos moles"],["M80-M94","Osteopatias e condropatias"],["M95-M99","Outros transtornos do sistema osteomuscular e do tecido conjuntivo"],
["N00-N08","Doenças glomerulares"],["N10-N16","Doenças renais túbulo-intersticiais"],["N17-N19","Insuficiência renal"],["N20-N23","Urolitíase"],["N25-N29","Outros transtornos do rim e do ureter"],["N30-N39","Outras doenças do aparelho urinário"],["N40-N51","Doenças dos órgãos genitais masculinos"],["N60-N64","Doenças da mama"],["N70-N77","Doenças inflamatórias dos órgãos pélvicos femininos"],["N80-N98","Transtornos não inflamatórios do trato genital feminino"],["N99-N99","Outros transtornos do aparelho geniturinário"],
["O00-O08","Gravidez que termina em aborto"],["O10-O16","Edema, proteinúria e transtornos hipertensivos na gravidez, parto e puerpério"],["O20-O29","Outros transtornos maternos relacionados predominantemente com a gravidez"],["O30-O48","Assistência prestada à mãe por motivos ligados ao feto e à cavidade amniótica"],["O60-O75","Complicações do trabalho de parto e do parto"],["O80-O84","Parto"],["O85-O92","Complicações relacionadas predominantemente com o puerpério"],["O94-O99","Outras afecções obstétricas não classificadas em outra parte"],
["P00-P04","Feto e recém-nascido afetados por fatores maternos e complicações da gravidez e do parto"],["P05-P08","Transtornos relacionados com a duração da gestação e o crescimento fetal"],["P10-P15","Traumatismo de parto"],["P20-P29","Transtornos respiratórios e cardiovasculares específicos do período perinatal"],["P35-P39","Infecções específicas do período perinatal"],["P50-P61","Transtornos hemorrágicos e hematológicos do feto e do recém-nascido"],["P70-P74","Transtornos endócrinos e metabólicos transitórios do feto e do recém-nascido"],["P75-P78","Transtornos do aparelho digestivo do feto ou do recém-nascido"],["P80-P83","Afecções do tegumento e da regulação térmica do feto e do recém-nascido"],["P90-P96","Outros transtornos originados no período perinatal"],
["Q00-Q07","Malformações congênitas do sistema nervoso"],["Q10-Q18","Malformações congênitas do olho, ouvido, face e pescoço"],["Q20-Q28","Malformações congênitas do aparelho circulatório"],["Q30-Q34","Malformações congênitas do aparelho respiratório"],["Q35-Q37","Fenda labial e fenda palatina"],["Q38-Q45","Outras malformações congênitas do aparelho digestivo"],["Q50-Q56","Malformações congênitas dos órgãos genitais"],["Q60-Q64","Malformações congênitas do aparelho urinário"],["Q65-Q79","Malformações e deformidades congênitas do sistema osteomuscular"],["Q80-Q89","Outras malformações congênitas"],["Q90-Q99","Anomalias cromossômicas não classificadas em outra parte"],
["R00-R09","Sintomas e sinais relativos aos aparelhos circulatório e respiratório"],["R10-R19","Sintomas e sinais relativos ao aparelho digestivo e ao abdome"],["R20-R23","Sintomas e sinais relativos à pele e ao tecido subcutâneo"],["R25-R29","Sintomas e sinais relativos aos sistemas nervoso e osteomuscular"],["R30-R39","Sintomas e sinais relativos ao aparelho urinário"],["R40-R46","Sintomas e sinais relativos à cognição, percepção, estado emocional e comportamento"],["R47-R49","Sintomas e sinais relativos à fala e à voz"],["R50-R69","Sintomas e sinais gerais"],["R70-R79","Achados anormais de exames de sangue, sem diagnóstico"],["R80-R82","Achados anormais de exames de urina, sem diagnóstico"],["R83-R89","Achados anormais de outros líquidos, substâncias e tecidos do corpo"],["R90-R94","Achados anormais de exames de imagem e provas funcionais"],["R95-R99","Causas mal definidas e desconhecidas de mortalidade"],
["S00-S09","Traumatismos da cabeça"],["S10-S19","Traumatismos do pescoço"],["S20-S29","Traumatismos do tórax"],["S30-S39","Traumatismos do abdome, dorso, coluna lombar e pelve"],["S40-S49","Traumatismos do ombro e do braço"],["S50-S59","Traumatismos do cotovelo e do antebraço"],["S60-S69","Traumatismos do punho e da mão"],["S70-S79","Traumatismos do quadril e da coxa"],["S80-S89","Traumatismos do joelho e da perna"],["S90-S99","Traumatismos do tornozelo e do pé"],["T00-T07","Traumatismos envolvendo múltiplas regiões do corpo"],["T08-T14","Traumatismos de localização não especificada do tronco, membro ou região do corpo"],["T15-T19","Efeitos da penetração de corpo estranho através de orifício natural"],["T20-T32","Queimaduras e corrosões"],["T33-T35","Geladuras"],["T36-T50","Intoxicação por drogas, medicamentos e substâncias biológicas"],["T51-T65","Efeitos tóxicos de substâncias de origem principalmente não medicinal"],["T66-T78","Outros efeitos de causas externas e os não especificados"],["T79-T79","Algumas complicações precoces dos traumatismos"],["T80-T88","Complicações de cuidados médicos e cirúrgicos"],["T90-T98","Seqüelas de traumatismos, intoxicações e outras causas externas"],
["V01-X59","Acidentes"],["X60-X84","Lesões autoprovocadas intencionalmente"],["X85-Y09","Agressões"],["Y10-Y34","Eventos cuja intenção é indeterminada"],["Y35-Y36","Intervenções legais e operações de guerra"],["Y40-Y84","Complicações de assistência médica e cirúrgica"],["Y85-Y89","Seqüelas de causas externas de morbidade e mortalidade"],["Y90-Y98","Fatores suplementares relacionados com causas de morbidade e mortalidade"],
["Z00-Z13","Pessoas em contato com os serviços de saúde para exame e investigação"],["Z20-Z29","Riscos potenciais à saúde relacionados com doenças transmissíveis"],["Z30-Z39","Contato com os serviços de saúde em circunstâncias relacionadas com a reprodução"],["Z40-Z54","Contato com os serviços de saúde para procedimentos específicos e cuidados de saúde"],["Z55-Z65","Riscos potenciais relacionados com circunstâncias socioeconômicas e psicossociais"],["Z70-Z76","Contato com os serviços de saúde em outras circunstâncias"],["Z80-Z99","Riscos potenciais relacionados com antecedentes familiares e pessoais e condições que influenciam a saúde"],
["U00-U49","Classificação provisória de novas doenças de etiologia incerta"],["U80-U89","Resistência a agentes antimicrobianos"]];
  var CID_NOTE = "CID-10 completa (DATASUS/Ministério da Saúde, versão brasileira): 22 capítulos, 275 grupos, 2.045 categorias e 12.451 subcategorias, importadas do arquivo oficial por script. † = código de etiologia; * = código de manifestação. Busca por código com ou sem ponto (J18.9 ou J189) ou por descrição. A CID-O (morfologia de neoplasias) não está incluída. Não inclui extensões da CID-10-CM.";
  var CID_FULL = /*@dados:CID_FULL*/{};
  var CID_ROM = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII"];
  function cidDot(c) { return c.length > 3 ? c.slice(0, 3) + "." + c.slice(3) : c; }
  function cidData() {
    var F = CID_FULL, dmap = {};
    DISEASES.forEach(function (d) {
      String(d.cid || "").split(/[,;]/).forEach(function (c) {
        c = c.trim(); var m = c.match(/^[A-Z]\d\d/); if (!m) return;
        var a = (dmap[m[0]] = dmap[m[0]] || []); var s = c + " — " + d.nome; if (a.indexOf(s) === -1) a.push(s);
      });
    });
    var subs = {};
    F.sub.forEach(function (s) { if (s[0].length > 3) (subs[s[0].slice(0, 3)] = subs[s[0].slice(0, 3)] || []).push(s); });
    function capOf(code) { for (var i = 0; i < F.cap.length; i++) if (code >= F.cap[i][1] && code <= F.cap[i][2]) return F.cap[i]; return null; }
    function grpOf(code) { var best = null; F.grp.forEach(function (g) { if (code >= g[0] && code <= g[1]) { if (!best || (g[0] >= best[0] && g[1] <= best[1])) best = g; } }); return best; }
    return F.cat.map(function (c) {
      var code = c[0], cp = capOf(code), g = grpOf(code), sl = subs[code] || [];
      var sx = []; sl.forEach(function (s) {
        var line = cidDot(s[0]) + " — " + s[4] + (s[1] === "+" ? " †" : s[1] === "*" ? " *" : "");
        if (s[2] === "F") line += " [apenas sexo feminino]"; else if (s[2] === "M") line += " [apenas sexo masculino]";
        if (s[3] === "N") line += " [não usar como causa básica de óbito]";
        if (s[5]) line += "\n      Ver também: " + s[5];
        if (s[6]) line += "\n      Exclui: " + s[6];
        sx.push(line);
      });
      var sec = [["Hierarquia", (cp ? "Capítulo " + CID_ROM[cp[0]] + " (" + cp[1] + "-" + cp[2] + ") — " + cp[3] : "") + (g ? "\nGrupo " + g[0] + "-" + g[1] + " — " + g[2] : "") + "\nCategoria " + code + " — " + c[2] + (c[1] === "+" ? " (†: etiologia)" : c[1] === "*" ? " (*: manifestação)" : "")]];
      if (sx.length) sec.push(["Subcategorias (" + sx.length + ")", sx.join("\n")]); else sec.push(["Subcategorias", "Categoria sem subdivisão de 4 caracteres: usar " + code + "."]);
      if (c[3]) sec.push(["Códigos relacionados (dupla classificação)", c[3]]);
      if (c[4]) sec.push(["Exclui", c[4]]);
      var rel = dmap[code] || [];
      sec.push(["Doenças do app com este CID (" + rel.length + ")", rel.length ? rel.join("\n") : "Nenhuma doença cadastrada com este código."]);
      return { id: "c" + code, nome: code + " — " + c[2], grupo: (cp ? "Cap. " + CID_ROM[cp[0]] + " · " : "") + (g ? g[0] + "-" + g[1] + " " + g[2] : ""), s: sec, x: sl.map(function (s) { return s[0]; }).join(" ") };
    });
  }
  var CID_DATA = cidData();
  var REFS = {
    vac: makeRef("vac", "tab-vac", VAC, VAC_CAB, "Buscar vacina ou idade", "Calendário vacinal"),
    flux: makeRef("flux", "tab-flux", FLUX, FLUX_CAB, "Buscar fluxograma de emergência", "Fluxograma"),
    ecg: makeRef("ecg", "tab-ecg", ECG, ECG_CAB, "Buscar achado ou arritmia no ECG", "Guia de ECG"),
    cid: makeRef("cid", "tab-cid", CID_DATA, CID_NOTE, "Buscar capítulo, grupo ou código CID-10", "CID-10")
  };
  /* ---------------- Calculadoras clínicas ---------------- */
  function cnum(v) { var x = parseFloat(String(v).replace(",", ".")); return isNaN(x) ? null : x; }
  function fx(x, d) { return (Math.round(x * Math.pow(10, d == null ? 1 : d)) / Math.pow(10, d == null ? 1 : d)).toString().replace(".", ","); }
  var SEXO = [["m", "Masculino"], ["f", "Feminino"]];
  var CALCS = /*@dados:CALCS*/[];
  var CALC_ITEMS = CALCS.map(function (c) { return { id: c.id, nome: c.nome, grupo: c.grupo, s: [["", c.formula + " " + c.ref]] }; });

  /* ---------------- Valores de referência laboratoriais ---------------- */
  var LAB_CAB = "Valores de referência típicos para adultos. Variam conforme o laboratório, o método e a população: prevalece sempre a faixa impressa no laudo. Unidades convencionais.";
  var LAB = /*@dados:LAB*/[];

  REFS.plantao = PLANTAO_REF;
  REFS.calc = makeRef("calc", "tab-calc", CALC_ITEMS, "", "Buscar calculadora (IMC, TFG, sódio…)", "Calculadora");
  REFS.lab = makeRef("lab", "tab-lab", LAB, LAB_CAB, "Buscar exame ou valor de referência", "Valores de referência");
  (function () {
    var R = REFS.calc, st = R.st;
    R.det = function () {
      var c = CALCS.filter(function (x) { return x.id === st.sel; })[0];
      if (!c) { detailEl.innerHTML = '<div class="detail-empty"><h2>Calculadoras</h2><p>Escolha uma calculadora. Os resultados aparecem enquanto você digita; nada é enviado a servidor.</p></div>'; return; }
      var html = '<button class="back-btn" id="back-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Voltar</button>';
      html += '<div class="med-header"><div><h2>' + escapeHtml(c.nome) + '</h2><div class="badge-row"><span class="badge">' + escapeHtml(c.grupo) + '</span><span class="badge">Calculadora</span></div></div></div><div class="section"><div class="calc-grid">';
      c.campos.forEach(function (f) {
        html += '<label class="calc-field"><span>' + escapeHtml(f[1]) + "</span>";
        if (f[2] === "date") html += '<input type="date" data-cf="' + f[0] + '">';
        else if (f[2]) html += '<select data-cf="' + f[0] + '"><option value="">—</option>' + f[2].map(function (o) { return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join("") + "</select>";
        else html += '<input type="text" inputmode="decimal" data-cf="' + f[0] + '">';
        html += "</label>";
      });
      html += '</div><div class="calc-result" id="calc-out" aria-live="polite">Preencha os campos.</div></div>';
      html += '<div class="section"><h3>Fórmula</h3><p class="body-text">' + escapeHtml(c.formula) + '</p></div><div class="section"><h3>Interpretação e referência</h3><p class="body-text">' + escapeHtml(c.ref) + '</p></div>';
      html += '<p class="calc-note">Ferramenta de apoio. Confira os resultados e use o julgamento clínico.</p>';
      detailEl.innerHTML = html;
      var back = document.getElementById("back-btn");
      if (back) back.addEventListener("click", function () { document.body.classList.remove("showing-detail"); });
      function upd() {
        var v = {}; Array.prototype.forEach.call(detailEl.querySelectorAll("[data-cf]"), function (el) {
          var k = el.getAttribute("data-cf"), f = c.campos.filter(function (x) { return x[0] === k; })[0];
          v[k] = f[2] ? (el.value || null) : cnum(el.value);
        });
        var out = c.f(v); document.getElementById("calc-out").textContent = out || "Preencha os campos.";
      }
      detailEl.oninput = upd; detailEl.onchange = upd;
    };
  })();
  Object.keys(REFS).forEach(function (k) { var o = REFS[k].side; REFS[k].side = function () { o.apply(this, arguments); decorateSidebar(); }; });

  /* Gerador de receita (dentro da aba Prescrição) */
  var RXD = lsGet("bluebook:rxd", {}), RXH = lsGet("bluebook:rxh", { pac: "", pres: "", crm: "" });
  function rxdSave() { lsSet("bluebook:rxd", RXD); lsSet("bluebook:rxh", RXH); }
  function rxText(meds) {
    var d = new Date(), ds = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();
    var t = "RECEITUÁRIO\nPaciente: " + (RXH.pac || "______________________") + "\nData: " + ds + "\n\n";
    var ctl = [];
    meds.forEach(function (m, i) {
      var r = RXD[m.nome] || {};
      t += (i + 1) + ") " + m.nome + (r.ap ? " — " + r.ap : "") + "\n";
      if (r.qtd) t += "   Quantidade: " + r.qtd + "\n";
      t += "   Uso: " + (r.pos || "(preencher posologia)") + "\n\n";
      if (/preta|C1|B1|A1|A2|B2|controle especial|notifica/i.test(m.tarja || "")) ctl.push(m.nome);
    });
    if (ctl.length) t += "ATENÇÃO: " + ctl.join(", ") + " exige(m) Notificação de Receita ou receita de controle especial em formulário oficial.\n\n";
    t += "______________________________\n" + (RXH.pres || "Dr(a). ____________") + (RXH.crm ? " — " + RXH.crm : " — CRM ______") + "\n";
    return t;
  }
  function rxReceitaHtml(meds) {
    var html = '<div class="section"><h3>Gerar receita</h3><p class="calc-note" style="margin-top:0;">Preencha a apresentação, a posologia e a quantidade de cada item. O texto é gerado a partir do que você digitar; o Bluebook não define a dose.</p>';
    html += '<div class="field"><label for="rxh-pac">Paciente</label><input type="text" id="rxh-pac" value="' + escapeHtml(RXH.pac || "") + '"></div>';
    html += '<div class="field"><label for="rxh-pres">Prescritor</label><input type="text" id="rxh-pres" value="' + escapeHtml(RXH.pres || "") + '"></div>';
    html += '<div class="field"><label for="rxh-crm">CRM/UF</label><input type="text" id="rxh-crm" value="' + escapeHtml(RXH.crm || "") + '"></div>';
    meds.forEach(function (m, i) {
      var r = RXD[m.nome] || {}, aps = String(m.apresentacoes || "").split(/;|\n/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 14);
      html += '<div class="rx-item info" style="margin-top:10px;"><strong>' + (i + 1) + ") " + escapeHtml(m.nome) + "</strong>";
      if (aps.length) html += '<div class="field"><label>Apresentação disponível</label><select data-rxd="' + i + '" data-k="apsel"><option value="">Escolher…</option>' + aps.map(function (a) { return "<option>" + escapeHtml(a) + "</option>"; }).join("") + "</select></div>";
      html += '<div class="field"><label>Apresentação / concentração</label><input type="text" data-rxd="' + i + '" data-k="ap" value="' + escapeHtml(r.ap || "") + '"></div>';
      html += '<div class="field"><label>Posologia (como tomar)</label><textarea rows="2" data-rxd="' + i + '" data-k="pos">' + escapeHtml(r.pos || "") + '</textarea></div>';
      html += '<div class="field"><label>Quantidade</label><input type="text" data-rxd="' + i + '" data-k="qtd" value="' + escapeHtml(r.qtd || "") + '"></div></div>';
    });
    html += '<div style="margin-top:10px;"><button type="button" class="btn" id="rx-rcopy">Copiar receita</button> <button type="button" class="btn-ghost btn" id="rx-rprint">Imprimir</button></div></div>';
    return html;
  }
  function rxReceitaWire(meds) {
    [["rxh-pac", "pac"], ["rxh-pres", "pres"], ["rxh-crm", "crm"]].forEach(function (x) {
      var el = document.getElementById(x[0]);
      if (el) el.addEventListener("input", function () { RXH[x[1]] = el.value; rxdSave(); });
    });
    Array.prototype.forEach.call(detailEl.querySelectorAll("[data-rxd]"), function (el) {
      var m = meds[+el.getAttribute("data-rxd")], k = el.getAttribute("data-k");
      el.addEventListener(k === "apsel" ? "change" : "input", function () {
        RXD[m.nome] = RXD[m.nome] || {};
        if (k === "apsel") {
          RXD[m.nome].ap = el.value; rxdSave();
          var inp = detailEl.querySelector('[data-rxd="' + el.getAttribute("data-rxd") + '"][data-k="ap"]'); if (inp) inp.value = el.value;
        } else { RXD[m.nome][k] = el.value; rxdSave(); }
      });
    });
    var c = document.getElementById("rx-rcopy");
    if (c) c.addEventListener("click", function () { copyText(rxText(meds), c); });
    var pr = document.getElementById("rx-rprint");
    if (pr) pr.addEventListener("click", function () {
      var d = document.getElementById("rx-print");
      if (!d) { d = document.createElement("div"); d.id = "rx-print"; document.body.appendChild(d); }
      d.textContent = rxText(meds);
      window.print();
    });
  }

  /* ---------------- Escores clínicos (aba própria) ---------------- */
  var SCORES = /*@dados:SCORES*/[];
  var scoreSearchTerm = "", selectedScoreId = "curb65", scoreVals = {};
  function filteredScores() {
    var term = stripAccents(scoreSearchTerm.trim().toLowerCase());
    return SCORES.filter(function (s) {
      if (bigArea && s.areas.indexOf(bigArea) === -1) return false;
      if (!term) return true;
      var hs = stripAccents((s.nome + " " + s.desc + " " + s.especialidade + " " + s.areas.join(" ")).toLowerCase());
      return term.split(/\s+/).every(function (t) { return hs.indexOf(t) !== -1; });
    });
  }
  function renderScoreSidebar() {
    var list = filteredScores();
    if (!list.length) { sidebarEl.innerHTML = '<div class="no-results">Nenhum escore encontrado.</div>'; return; }
    var html = "", last = null;
    list.slice().sort(function (a, b) { return (a.especialidade + a.nome).localeCompare(b.especialidade + b.nome, "pt-BR"); }).forEach(function (s) {
      if (s.especialidade !== last) { html += '<div class="letter-group-label">' + escapeHtml(s.especialidade) + "</div>"; last = s.especialidade; }
      html += '<button class="med-item' + (s.id === selectedScoreId ? " active" : "") + '" data-score="' + s.id + '"><span class="med-item-main">' + escapeHtml(s.nome) + "</span></button>";
    });
    sidebarEl.innerHTML = html;
    Array.prototype.forEach.call(sidebarEl.querySelectorAll(".med-item"), function (b) {
      b.addEventListener("click", function () {
        selectedScoreId = b.getAttribute("data-score");
        document.body.classList.add("showing-detail");
        render();
      });
    });
  }
  function scoreCompute(sc, vals) {
    if (sc.run) return sc.run(vals);
    var total = 0, filled = 0;
    sc.fields.forEach(function (f) {
      if (f.opts) {
        var idx = vals[f.id];
        if (idx === undefined || idx === "") return;
        total += f.opts[parseInt(idx, 10)][1]; filled++;
      } else if (vals[f.id]) { total += f.pts; }
    });
    var needAll = sc.fields.filter(function (f) { return f.opts; }).length;
    if (needAll && filled < needAll) return { pend: true, parcial: total, falta: needAll - filled };
    var r = sc.interp(total, vals); r.valor = total; return r;
  }
  function renderScoreResult(sc) {
    var box = document.getElementById("score-result");
    if (!box) return;
    var r = scoreCompute(sc, scoreVals[sc.id] || {});
    if (!r) { box.innerHTML = '<div class="score-res none">Preencha os valores laboratoriais para calcular.</div>'; return; }
    if (r.pend) { box.innerHTML = '<div class="score-res none">Selecione uma opção em cada item (' + r.falta + ' pendente' + (r.falta > 1 ? "s" : "") + ").</div>"; return; }
    var cls = r.nivel === "bad" ? "sr-bad" : r.nivel === "warn" ? "sr-warn" : "sr-ok";
    var big = sc.run ? r.valor : (String(r.valor).replace(".", ",") + (sc.max ? " / " + String(sc.max).replace(".", ",") : ""));
    box.innerHTML = '<div class="score-res ' + cls + '"><div class="score-num">' + escapeHtml(String(big)) + '</div><div><strong>' + escapeHtml(r.t) + "</strong><p>" + escapeHtml(r.c) + "</p>" + (r.extra ? '<p class="calc-note">' + escapeHtml(r.extra) + "</p>" : "") + "</div></div>";
  }
  function renderScoreDetail() {
    var sc = SCORES.filter(function (s) { return s.id === selectedScoreId; })[0];
    if (!sc) { detailEl.innerHTML = '<div class="detail-empty"><h2>Selecione um escore</h2><p>Escolha um item na lista para calcular.</p></div>'; return; }
    var vals = scoreVals[sc.id] = scoreVals[sc.id] || {};
    var html = '<button class="back-btn" id="back-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Voltar</button>';
    html += '<div class="med-header"><div><h2>' + escapeHtml(sc.nome) + '</h2><div class="badge-row"><span class="badge">' + escapeHtml(sc.especialidade) + '</span><span class="badge">Escore clínico</span></div></div>' +
      '<div class="med-actions"><button class="btn-ghost btn" id="score-clear">Limpar</button></div></div>';
    html += '<p class="body-text" style="margin:0 0 12px 0;">' + escapeHtml(sc.desc) + "</p>";
    html += '<div class="score-form">';
    sc.fields.forEach(function (f) {
      var id = "sf-" + sc.id + "-" + f.id;
      if (f.opts) {
        html += '<div class="field"><label for="' + id + '">' + escapeHtml(f.label) + '</label><select id="' + id + '" data-f="' + f.id + '"><option value="">Selecione…</option>' +
          f.opts.map(function (o, i) { return '<option value="' + i + '"' + (String(vals[f.id]) === String(i) ? " selected" : "") + ">" + escapeHtml(o[0]) + " (" + o[1] + ")</option>"; }).join("") + "</select></div>";
      } else if (f.type === "num") {
        html += '<div class="field"><label for="' + id + '">' + escapeHtml(f.label) + '</label><input type="number" inputmode="decimal" step="' + (f.step || "any") + '" id="' + id + '" data-f="' + f.id + '" value="' + (vals[f.id] !== undefined ? escapeHtml(String(vals[f.id])) : "") + '"></div>';
      } else {
        html += '<label class="score-check"><input type="checkbox" id="' + id + '" data-f="' + f.id + '"' + (vals[f.id] ? " checked" : "") + "><span>" + escapeHtml(f.label) + (f.pts ? ' <em>(' + (f.pts > 0 ? "+" : "") + String(f.pts).replace(".", ",") + ")</em>" : "") + "</span></label>";
      }
    });
    html += '</div><div id="score-result"></div>';
    html += '<p class="calc-note" style="margin-top:12px;">Fonte: ' + escapeHtml(sc.ref) + " Os escores apoiam, e não substituem, o julgamento clínico.</p>";
    detailEl.innerHTML = html;
    renderScoreResult(sc);
    var back = document.getElementById("back-btn");
    if (back) back.addEventListener("click", function () { document.body.classList.remove("showing-detail"); });
    document.getElementById("score-clear").addEventListener("click", function () { scoreVals[sc.id] = {}; renderScoreDetail(); });
    Array.prototype.forEach.call(detailEl.querySelectorAll("[data-f]"), function (el) {
      el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input", function () {
        var k = el.getAttribute("data-f");
        scoreVals[sc.id][k] = el.type === "checkbox" ? el.checked : el.value;
        renderScoreResult(sc);
      });
    });
  }

  function switchViewMode(mode) {
    viewMode = mode;
    document.getElementById("tab-plantao").classList.toggle("active", mode === "plantao");
    document.getElementById("tab-meds").classList.toggle("active", mode === "meds");
    document.getElementById("tab-diseases").classList.toggle("active", mode === "diseases");
    document.getElementById("tab-scores").classList.toggle("active", mode === "scores");
    document.getElementById("tab-rx").classList.toggle("active", mode === "rx");
    document.getElementById("tab-atb").classList.toggle("active", mode === "atb");
    document.getElementById("tab-vac").classList.toggle("active", mode === "vac");
    document.getElementById("tab-flux").classList.toggle("active", mode === "flux");
    document.getElementById("tab-ecg").classList.toggle("active", mode === "ecg");
    document.getElementById("tab-cid").classList.toggle("active", mode === "cid");
    document.getElementById("tab-calc").classList.toggle("active", mode === "calc");
    document.getElementById("tab-lab").classList.toggle("active", mode === "lab");
    document.getElementById("class-filter").style.display = (mode === "meds" || mode === "rx") ? "" : "none";
    document.getElementById("fav-filter-btn").style.display = (mode === "scores" || mode === "rx") ? "none" : "";
    document.getElementById("disease-area-filter").style.display = "none";
    favOnly = false;
    document.getElementById("fav-filter-btn").setAttribute("aria-pressed", "false");
    searchInput.placeholder = mode === "meds" ? "Buscar medicamento" : mode === "diseases" ? "Buscar doença, CID ou sintoma" : mode === "rx" ? "Buscar medicamento para a prescrição" : mode === "atb" ? "Buscar foco, agente ou antibiótico" : REFS[mode] ? REFS[mode].ph : "Buscar escore";
    searchInput.value = REFS[mode] ? REFS[mode].st.term : mode === "atb" ? atbSearchTerm : mode === "scores" ? scoreSearchTerm : mode === "diseases" ? diseaseSearchTerm : searchTerm;
    document.body.classList.remove("showing-detail", "bb-home");
    render();
    if (window.__bbTabSync) window.__bbTabSync();
  }

  /* ---------------- Campos de medicamento (usados na importação de backup) ---------------- */

  var TARJA_OPTIONS = ["", "Sem tarja (venda livre)", "Tarja vermelha", "Tarja vermelha (retenção de receita)", "Tarja preta"];

  var FIELDS = [
    { key: "nome", label: "Nome do medicamento", required: true, type: "input", placeholder: "Ex.: Amoxicilina" },
    { key: "classe", label: "Classe terapêutica", type: "input", placeholder: "Ex.: Analgésico, AINE, Antibiótico" },
    { key: "tarja", label: "Tarja", type: "select", options: TARJA_OPTIONS },
    { key: "via", label: "Via de administração", type: "input", placeholder: "Ex.: Oral; Intramuscular (IM); Endovenosa (EV)" },
    { key: "generico", label: "Possui genérico?", type: "select", options: ["", "Sim", "Não", "A confirmar"] },
    { key: "referencias", label: "Nomes comerciais de referência (laboratório)", type: "input", placeholder: "Ex.: Novalgina, Anador, Magnopyrol" },
    { key: "apresentacoes", label: "Apresentações", type: "textarea", placeholder: "Ex.: Comprimido 500 mg; suspensão oral 250 mg/5 mL" },
    { key: "indicacoes", label: "Indicações", type: "textarea" },
    { key: "posologia", label: "Posologia (dose)", type: "textarea" },
    { key: "contraindicacoes", label: "Contraindicações", type: "textarea" },
    { key: "interacoes", label: "Interações medicamentosas", type: "textarea" },
    { key: "observacoes", label: "Observações", type: "textarea" }
  ];

  /* ---------------- Calculators ---------------- */

  function todayInputValue() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  function dateFromInput(id) {
    var el = document.getElementById(id);
    if (!el || !el.value) return null;
    var parts = el.value.split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
  }

  function diffDaysBetween(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  function formatWeeksDays(totalDays) {
    if (totalDays === null || isNaN(totalDays)) return "—";
    var sign = totalDays < 0 ? "-" : "";
    var abs = Math.abs(totalDays);
    var weeks = Math.floor(abs / 7);
    var days = abs % 7;
    return sign + weeks + "s" + days + "d";
  }

  function formatDatePtBr(d) {
    if (!d) return "—";
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    return dd + "/" + mm + "/" + d.getFullYear();
  }

  function addDays(d, n) {
    var r = new Date(d.getTime());
    r.setDate(r.getDate() + n);
    return r;
  }

  function calcDum() {
    var dum = dateFromInput("calc-dum");
    var ref = dateFromInput("calc-dum-ref");
    var out = document.getElementById("dum-result");
    if (!dum || !ref) { out.innerHTML = ""; return; }
    var days = diffDaysBetween(dum, ref);
    var dpp = addDays(dum, 280);
    if (days < 0 || days > 320) {
      out.innerHTML = '<p class="calc-warning">Confira as datas — o resultado ficou fora da faixa gestacional esperada.</p>';
      return;
    }
    out.innerHTML =
      '<div class="calc-result"><div><span class="calc-label">Idade gestacional</span><span class="calc-value">' + formatWeeksDays(days) + '</span></div>' +
      '<div><span class="calc-label">Data provável do parto (Naegele)</span><span class="calc-value">' + formatDatePtBr(dpp) + "</span></div></div>";
  }

  function calcUsg() {
    var w = parseInt(document.getElementById("usg-weeks").value, 10);
    var d = parseInt(document.getElementById("usg-days").value, 10);
    var usgDate = dateFromInput("usg-date");
    var ref = dateFromInput("usg-ref");
    var out = document.getElementById("usg-result");
    if (isNaN(w) || isNaN(d) || !usgDate || !ref) { out.innerHTML = ""; return; }
    var igUsgDays = w * 7 + d;
    var elapsed = diffDaysBetween(usgDate, ref);
    var igAtual = igUsgDays + elapsed;
    var dpp = addDays(usgDate, 280 - igUsgDays);
    if (igAtual < 0 || igAtual > 320) {
      out.innerHTML = '<p class="calc-warning">Confira as datas e a IG informada — o resultado ficou fora da faixa gestacional esperada.</p>';
      return;
    }
    out.innerHTML =
      '<div class="calc-result"><div><span class="calc-label">Idade gestacional na data de referência</span><span class="calc-value">' + formatWeeksDays(igAtual) + '</span></div>' +
      '<div><span class="calc-label">Data provável do parto</span><span class="calc-value">' + formatDatePtBr(dpp) + "</span></div></div>";
  }

    /* ---------------- Parâmetros pediátricos por medicamento e via ----------------
     Fonte "HILF": documento 'Sugestões de doses em pediatria' (Dra. Daniela Dal Forno Maestri) enviado pelo usuário
     (gotas: 20 gotas/mL, salvo indicação). Fonte "Ref": faixas usuais de referência pediátrica (bulas/literatura) —
     confirme sempre na bula vigente ou no protocolo institucional.
     Campos da via: via (rótulo), d [mín,máx] dose por kg (padrão = dd ou mín), b "dose"|"dia", f doses/dia,
       mx dose máx (mg), mxd máx/dia (mg), mdk máx/dia (mg/kg), mn dose mín (mg), un unidade ("mg" ou "UI"),
       fx [[pesoMáx,dose]] dose fixa por faixa de peso, fixo texto (dose que não depende do peso), ob observação, fonte,
       ap apresentações [{l rótulo, c mg/mL, mg mg por unidade, u nome da unidade, gt mostrar gotas, gm gotas/mL, mxMl máx mL/dose}]
       (cada apresentação pode sobrescrever d, dd, b, f, mx, mxd, mdk, ob). */
  var PED_DB = /*@dados:PED_DB*/[];

  function pedFind(nome) {
    var s = stripAccents((nome || "").toLowerCase()), best = null;
    PED_DB.forEach(function (e) {
      if (s.indexOf(e.k) === 0 && (!best || e.k.length > best.k.length)) best = e;
    });
    return best;
  }

  /* Combina parâmetros da via com os da apresentação (a apresentação sobrescreve). */
  function pedParams(route, ap) {
    var p = {}, keys = ["d", "dd", "b", "f", "mx", "mxd", "mdk", "mn", "un", "fx", "fixo", "ob", "al", "rev"];
    keys.forEach(function (k) { if (route[k] !== undefined) p[k] = route[k]; });
    if (ap) keys.forEach(function (k) { if (ap[k] !== undefined) p[k] = ap[k]; });
    p.un = p.un || "mg";
    p.b = p.b || "dose";
    p.f = p.f || 1;
    return p;
  }

  function pedFmt(n, dec) {
    if (!isFinite(n)) return "—";
    var r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
    return String(r).replace(".", ",");
  }

  function pedFmtBig(n, un) {
    return un === "UI" ? Math.round(n).toLocaleString("pt-BR") : pedFmt(n, n >= 100 ? 0 : n >= 10 ? 1 : 2);
  }

  /* Cálculo central (usado pela calculadora e pela ficha). Entrada: objeto com peso, p (parâmetros), doseKg, freq, ap, maxDaily. */
  function pedCompute(o) {
    var peso = o.peso, p = o.p || {}, un = p.un || "mg";
    if (!peso || peso <= 0) return { err: "Informe o peso da criança." };
    var freq = o.freq || p.f || 1;
    var perDoseCalc, base;
    if (p.fx) {
      var band = null;
      for (var i = 0; i < p.fx.length; i++) { if (peso <= p.fx[i][0]) { band = p.fx[i]; break; } }
      if (!band) band = p.fx[p.fx.length - 1];
      perDoseCalc = band[1]; base = "faixa de peso";
    } else {
      if (!o.doseKg || o.doseKg <= 0) return { err: "Informe a dose por kg." };
      var basis = o.basis || p.b || "dose";
      perDoseCalc = basis === "dia" ? (peso * o.doseKg) / freq : peso * o.doseKg;
      base = basis;
    }
    var ap = o.ap || {};
    var conc = o.conc || ap.c || 0;
    var mgUnit = ap.mg || 0;
    var limits = [];
    function lim(v, why) { if (v && v > 0 && isFinite(v)) limits.push({ v: v, why: why }); }
    lim(p.mx, "dose máxima por tomada (" + pedFmtBig(p.mx, un) + " " + un + ")");
    var maxDaily = o.maxDaily || p.mxd;
    lim(maxDaily ? maxDaily / freq : 0, "dose máxima diária (" + pedFmtBig(maxDaily || 0, un) + " " + un + "/dia)");
    lim(p.mdk ? (p.mdk * peso) / freq : 0, "máximo de " + pedFmt(p.mdk || 0, 2) + " " + un + "/kg/dia");
    lim(ap.mxMl && conc ? ap.mxMl * conc : 0, "máximo de " + pedFmt(ap.mxMl || 0, 1) + " mL por dose (protocolo)");
    var perDose = perDoseCalc, capWhy = "";
    limits.forEach(function (l) { if (l.v < perDose) { perDose = l.v; capWhy = l.why; } });
    var raised = false;
    if (p.mn && perDose < p.mn) { perDose = p.mn; raised = true; }
    var dailyMax = 0;
    if (maxDaily) dailyMax = maxDaily;
    if (p.mdk) { var dm2 = p.mdk * peso; dailyMax = dailyMax ? Math.min(dailyMax, dm2) : dm2; }
    var rangeFlag = "";
    if (!p.fx && p.d && o.doseKg > 0) {
      var basisIn = o.basis || p.b || "dose", rb = p.b || "dose", ent = o.doseKg;
      if (basisIn !== rb) ent = rb === "dia" ? o.doseKg * freq : o.doseKg / freq;
      if (ent > p.d[1] * 1.0001) rangeFlag = "above"; else if (ent < p.d[0] * 0.9999) rangeFlag = "below"; else rangeFlag = "in";
    }
    var r = { err: null, dailyMax: dailyMax, rangeFlag: rangeFlag, perDoseCalc: perDoseCalc, perDose: perDose, perDay: perDose * freq, freq: freq, capped: !!capWhy, capWhy: capWhy, raised: raised, un: un, base: base,
      perKgDose: perDose / peso, perKgDay: (perDose * freq) / peso };
    if (conc > 0) {
      r.ml = perDose / conc;
      if (ap.gt) r.drops = r.ml * (ap.gm || 20);
    } else if (mgUnit > 0) {
      r.units = perDose / mgUnit; r.unitName = ap.u || "unidade";
    }
    return r;
  }

  function pedResultHtml(r, p, info) {
    if (r.err) return '<p class="calc-warning">' + escapeHtml(r.err) + "</p>";
    var un = r.un;
    info = info || {};
    var h = '<div class="calc-result">';
    h += '<div><span class="calc-label">Medicação</span><span class="calc-value" style="font-family:var(--serif);">' + escapeHtml(info.nome || "—") + "</span></div>";
    h += '<div><span class="calc-label">Apresentação</span><span class="calc-value" style="font-size:12.5px;text-align:right;">' + escapeHtml(info.ap || "—") + "</span></div>";
    h += '<div><span class="calc-label">Concentração</span><span class="calc-value">' + (info.conc ? pedFmt(info.conc, 2) + " mg/mL" : "—") + "</span></div>";
    h += '<div style="border-top:1px dashed var(--border);margin-top:4px;padding-top:7px;"><span class="calc-label">Dose em mL</span><span class="calc-value" style="font-size:19px;">' + (r.ml !== undefined ? pedFmt(r.ml, 2) + " mL" : (r.units !== undefined ? pedFmt(r.units, 2) + " " + escapeHtml(r.unitName || "unid.") : "informe a concentração")) + "</span></div>";
    h += '<div><span class="calc-label">Dose por tomada' + (r.capped ? " (limitada ao máximo)" : "") + '</span><span class="calc-value">' + pedFmtBig(r.perDose, un) + " " + un + "</span></div>";
    h += '<div><span class="calc-label">Frequência</span><span class="calc-value">' + r.freq + "x/dia" + (r.freq > 1 ? " (a cada " + pedFmt(24 / r.freq, 1) + " h)" : "") + "</span></div>";
    h += '<div><span class="calc-label">Equivale a</span><span class="calc-value">' + pedFmtBig(r.perKgDose, un) + " " + un + "/kg/dose · " + pedFmtBig(r.perKgDay, un) + " " + un + "/kg/dia</span></div>";
    if (r.ml !== undefined && r.drops !== undefined) h += '<div><span class="calc-label">Em gotas</span><span class="calc-value">≈ ' + Math.round(r.drops) + " gotas</span></div>";
    var mxParts = [];
    if (p.mx) mxParts.push("por tomada " + pedFmtBig(p.mx, un) + " " + un);
    if (r.dailyMax) mxParts.push("por dia " + pedFmtBig(r.dailyMax, un) + " " + un);
    if (mxParts.length) {
      var pct = r.dailyMax ? Math.min(999, Math.round((r.perDay / r.dailyMax) * 100)) : 0;
      h += '<div><span class="calc-label">Dose máxima de referência</span><span class="calc-value" style="font-size:13px;text-align:right;">' + mxParts.join(" · ") + "</span></div>";
      if (r.dailyMax) {
        var col = pct >= 100 ? "var(--danger)" : pct >= 80 ? "#c27a00" : "var(--accent-deep)";
        h += '<div style="margin-top:4px;"><div style="height:8px;border-radius:4px;background:var(--border);overflow:hidden;"><div style="height:100%;width:' + Math.min(100, pct) + '%;background:' + col + ';"></div></div><span class="calc-note" style="margin:3px 0 0 0;color:' + col + ';">Dose diária = ' + pct + '% do máximo' + (pct >= 100 ? " (LIMITE ATINGIDO)" : pct >= 80 ? " (próximo do limite)" : "") + "</span></div>";
      }
    } else {
      h += '<div><span class="calc-label">Dose máxima de referência</span><span class="calc-value" style="font-size:12.5px;text-align:right;">não definida para este medicamento — consulte a bula</span></div>';
    }
    h += "</div>";
    if (r.rangeFlag === "above" && p.d) h += '<p class="calc-warning">A dose informada está ACIMA da faixa usual (' + pedFmtBig(p.d[0], un) + (p.d[1] !== p.d[0] ? "-" + pedFmtBig(p.d[1], un) : "") + " " + un + "/kg por " + (p.b === "dia" ? "dia" : "dose") + "). Confirme a indicação e a bula antes de prosseguir.</p>";
    if (r.rangeFlag === "below" && p.d) h += '<p class="calc-note">A dose informada está abaixo da faixa usual (' + pedFmtBig(p.d[0], un) + (p.d[1] !== p.d[0] ? "-" + pedFmtBig(p.d[1], un) : "") + " " + un + "/kg por " + (p.b === "dia" ? "dia" : "dose") + "); possível subdose.</p>";
    if (r.capped) h += '<p class="calc-warning">O cálculo por peso indicaria ' + pedFmtBig(r.perDoseCalc, un) + " " + un + " por tomada, acima do limite. A dose foi travada em " + pedFmtBig(r.perDose, un) + " " + un + ", respeitando " + escapeHtml(r.capWhy) + ". Reavalie o peso, a dose/kg ou o medicamento antes de prosseguir.</p>";
    if (r.raised) h += '<p class="calc-note" style="color:var(--danger);">A dose calculada ficou abaixo do mínimo usual (' + pedFmtBig(p.mn, un) + " " + un + "); foi ajustada ao mínimo.</p>";
    if (r.units !== undefined && Math.abs(r.units * 4 - Math.round(r.units * 4)) > 0.01) h += '<p class="calc-note">Fração de unidade não exata — considere formulação líquida ou manipulada para dose precisa.</p>';
    return h;
  }

  /* ---------------- Widget pediátrico (calculadora e ficha) ---------------- */

  function pedWidgetHtml(pf) {
    return '' +
      '<div class="field" id="' + pf + '-via-wrap"><label for="' + pf + '-via">Via de administração</label><select id="' + pf + '-via"></select></div>' +
      '<div class="field" id="' + pf + '-ap-wrap"><label for="' + pf + '-ap">Apresentação / concentração</label><select id="' + pf + '-ap"></select></div>' +
      '<div id="' + pf + '-hint"></div>' +
      '<div class="field"><label for="' + pf + '-weight">Peso da criança (kg)</label><input type="number" id="' + pf + '-weight" min="0" step="0.1" inputmode="decimal"></div>' +
      '<div class="calc-row" id="' + pf + '-dose-wrap">' +
      '<div class="field"><label for="' + pf + '-basis">Base da dose</label><select id="' + pf + '-basis"><option value="dose">por tomada</option><option value="dia">por dia</option></select></div>' +
      '<div class="field"><label for="' + pf + '-dose" id="' + pf + '-dose-label">Dose por kg (mg/kg)</label><input type="number" id="' + pf + '-dose" min="0" step="any" inputmode="decimal"></div>' +
      '</div>' +
      '<div id="' + pf + '-rest">' +
      '<div class="calc-row">' +
      '<div class="field"><label for="' + pf + '-freq">Doses por dia</label><input type="number" id="' + pf + '-freq" min="1" step="1" value="1"></div>' +
      '<div class="field"><label for="' + pf + '-conc">Concentração (mg/mL) — opcional</label><input type="number" id="' + pf + '-conc" min="0" step="any" inputmode="decimal"></div>' +
      '</div>' +
      '<div class="field"><label for="' + pf + '-maxd">Dose máxima diária — opcional</label><input type="number" id="' + pf + '-maxd" min="0" step="any" inputmode="decimal"></div>' +
      '</div>' +
      '<div id="' + pf + '-out"></div>';
  }

  /* Liga a lógica ao widget de prefixo pf. entry = parâmetros do PED_DB (ou null), med = medicamento da base (ou null). */
  function pedAttach(pf, entry, med) {
    function $(s) { return document.getElementById(pf + "-" + s); }
    var st = { route: null, ap: null, p: {} };
    var viaSel = $("via"), apSel = $("ap");
    var routes = entry ? entry.v : null;

    if (routes) {
      viaSel.innerHTML = routes.map(function (r, i) { return '<option value="' + i + '">' + escapeHtml(r.via) + "</option>"; }).join("");
    } else {
      var vs = ((med && (med.via || inferVia(med.apresentacoes))) || "").split(/;\s*/).filter(Boolean);
      viaSel.innerHTML = (vs.length ? vs : ["Não informada"]).map(function (v) { return "<option>" + escapeHtml(v) + "</option>"; }).join("");
    }
    $("via-wrap").style.display = (entry || med) ? "" : "none";

    function compute() {
      var out = $("out");
      if (!out) return;
      var p = st.p || {};
      if (p.fixo) { out.innerHTML = '<div class="calc-result"><div><span class="calc-label">Dose fixa (não depende do peso)</span></div><p class="body-text" style="margin:4px 0 0 0;">' + escapeHtml(p.fixo) + "</p>" + (p.rev ? '<p class="calc-note" style="margin:6px 0 0 0;">' + escapeHtml(p.rev) + " — confirme na bula.</p>" : "") + "</div>"; return; }
      var peso = parseFloat($("weight").value);
      if (!peso) { out.innerHTML = '<p class="calc-note">Informe o peso para calcular.</p>'; return; }
      var res = pedCompute({
        peso: peso, p: p, ap: st.ap, basis: $("basis").value,
        doseKg: parseFloat($("dose").value), freq: parseFloat($("freq").value) || 1,
        conc: parseFloat($("conc").value) || 0, maxDaily: parseFloat($("maxd").value) || 0
      });
      out.innerHTML = pedResultHtml(res, p, { nome: entry ? entry.n : (med ? med.nome : ""), ap: st.ap ? st.ap.l : "", conc: parseFloat($("conc").value) || 0 });
    }

    function applyAp() {
      var route = st.route;
      var idx = apSel.value;
      st.ap = (route && route.ap && idx !== "" && idx !== "x" && route.ap[+idx]) ? route.ap[+idx] : null;
      st.p = route ? pedParams(route, st.ap) : {};
      var p = st.p, un = p.un || "mg";
      var hasDose = !p.fixo && !p.fx;
      $("dose-wrap").style.display = hasDose ? "" : "none";
      $("rest").style.display = p.fixo ? "none" : "";
      $("dose-label").textContent = "Dose por kg (" + un + "/kg)";
      if (route) {
        $("basis").value = p.b === "dia" ? "dia" : "dose";
        $("dose").value = p.dd !== undefined ? p.dd : (p.d ? p.d[0] : "");
        $("freq").value = p.f || 1;
        $("maxd").value = p.mxd || "";
      }
      $("conc").value = (st.ap && st.ap.c) ? st.ap.c : (route ? "" : $("conc").value);
      var hint = "";
      if (route) {
        if (p.d && hasDose) hint += "Faixa usual: " + pedFmtBig(p.d[0], un) + (p.d[1] !== p.d[0] ? "-" + pedFmtBig(p.d[1], un) : "") + " " + un + "/kg por " + (p.b === "dia" ? "dia" : "dose") + ". ";
        if (p.ob) hint += p.ob;
        if (st.ap && st.ap.mxMl) hint += " Máx. " + pedFmt(st.ap.mxMl, 1) + " mL/dose.";
        var lm = [];
        if (p.mx) lm.push("máx. por tomada " + pedFmtBig(p.mx, un) + " " + un);
        if (p.mxd) lm.push("máx. diária " + pedFmtBig(p.mxd, un) + " " + un);
        if (p.mdk) lm.push("máx. " + pedFmt(p.mdk, 2) + " " + un + "/kg/dia");
        if (st.ap && st.ap.mxMl) lm.push("máx. " + pedFmt(st.ap.mxMl, 1) + " mL/dose");
        if (lm.length) hint += ' <strong>Limites: ' + lm.join(" · ") + ".</strong>";
        else if (!p.fixo && !p.fx) hint += " <strong>Sem dose máxima definida nesta base — consulte a bula.</strong>";
        hint += ' <em>Fonte: ' + (route.fonte === "HILF" ? "HILF (documento enviado)" : route.fonte === "HILF + Ref" ? "HILF + referência geral" : "referência geral") + (p.rev ? "; " + p.rev : "") + "; revisada pelo autor em 07/11/2026" + " — confirme na bula.</em>";
      } else if (entry === null && med) {
        hint = "Sem parâmetros pediátricos cadastrados para este medicamento — informe dose/kg, frequência e concentração manualmente, com base na bula ou no protocolo institucional.";
      }
      $("hint").innerHTML = (p.al ? '<p class="calc-warning" style="margin:0 0 10px 0;">⚠ ' + escapeHtml(p.al) + "</p>" : "") + (hint ? '<p class="calc-note" style="margin:0 0 12px 0;color:var(--accent-deep);">' + hint + "</p>" : "");
      compute();
    }

    function applyRoute() {
      st.route = routes ? routes[+viaSel.value] : null;
      var aps = st.route && st.route.ap ? st.route.ap : [];
      if (aps.length) {
        apSel.innerHTML = aps.map(function (a, i) { return '<option value="' + i + '">' + escapeHtml(a.l) + "</option>"; }).join("") + '<option value="x">Outra concentração (informar)</option>';
        $("ap-wrap").style.display = "";
      } else {
        apSel.innerHTML = '<option value="x"></option>';
        $("ap-wrap").style.display = "none";
      }
      applyAp();
    }

    viaSel.addEventListener("change", applyRoute);
    apSel.addEventListener("change", applyAp);
    ["weight", "basis", "dose", "freq", "conc", "maxd"].forEach(function (id) {
      $(id).addEventListener("input", compute);
      $(id).addEventListener("change", compute);
    });

    if (routes) applyRoute();
    else {
      var c = med ? parseConcentration(med.apresentacoes) : null;
      if (c) $("conc").value = c.toFixed(2);
      applyAp();
    }
  }

  function openProtoPicker(cb) {
    var ov = document.createElement("div");
    ov.className = "modal-overlay"; ov.style.zIndex = "60";
    ov.innerHTML = '<div class="modal" style="max-width:520px;"><h2>Selecionar medicamento</h2><div class="field"><input type="text" id="pp-s" placeholder="Buscar medicamento" autocomplete="off"></div><div id="pp-l" style="max-height:380px;overflow-y:auto;border-top:1px solid var(--border);"></div><p class="calc-note">Parâmetros: HILF (documento enviado) e referências pediátricas gerais — confirme na bula.</p><div class="modal-actions"><button type="button" class="btn-ghost btn" id="pp-c">Fechar</button></div></div>';
    document.body.appendChild(ov);
    var itemStyle = "display:block;width:100%;text-align:left;padding:9px 4px;border:none;border-bottom:1px solid var(--border);background:none;cursor:pointer;";
    function item(kind, key, title, sub) {
      return '<button type="button" class="pp-i" data-kind="' + kind + '" data-key="' + escapeHtml(key) + '" style="' + itemStyle + '"><b>' + escapeHtml(title) + '</b><span style="display:block;font-size:12px;color:var(--ink-soft);">' + escapeHtml(sub) + "</span></button>";
    }
    function label(t) { return '<div class="letter-group-label" style="position:static;">' + escapeHtml(t) + "</div>"; }
    function draw(term) {
      var t = stripAccents((term || "").toLowerCase());
      var sorted = medications.slice().sort(function (a, b) { return (a.nome || "").localeCompare(b.nome || "", "pt-BR"); });
      var withP = [], manual = [], matched = {};
      medications.forEach(function (m) { var e = pedFind(m.nome); if (e) matched[e.k] = 1; });
      sorted.forEach(function (m) {
        if (t && stripAccents((m.nome || "").toLowerCase()).indexOf(t) === -1) return;
        var e = pedFind(m.nome);
        if (e) withP.push({ m: m, e: e }); else manual.push(m);
      });
      var extra = PED_DB.filter(function (e) { return !matched[e.k] && (!t || stripAccents(e.n.toLowerCase()).indexOf(t) !== -1); });
      var h = "";
      if (withP.length) {
        h += label("Com parâmetros pediátricos (" + withP.length + ")");
        withP.forEach(function (x) { h += item("med", x.m.id, x.m.nome, x.e.v.map(function (r) { return r.via; }).join(" · ")); });
      }
      if (extra.length) {
        h += label("Protocolos de referência fora da sua base");
        extra.forEach(function (e) { h += item("ped", e.k, e.n, e.v.map(function (r) { return r.via; }).join(" · ")); });
      }
      if (manual.length) {
        h += label("Sem parâmetros pediátricos — informar dose manualmente");
        manual.forEach(function (m) { h += item("med", m.id, m.nome || "", [m.classe, m.via || inferVia(m.apresentacoes)].filter(Boolean).join(" · ")); });
      }
      var l = document.getElementById("pp-l");
      l.innerHTML = h || '<p style="padding:14px 4px;color:var(--ink-faint);">Nenhum resultado.</p>';
      Array.prototype.forEach.call(l.querySelectorAll(".pp-i"), function (b) {
        b.addEventListener("click", function () {
          var kind = b.getAttribute("data-kind"), key = b.getAttribute("data-key");
          ov.remove();
          if (kind === "ped") {
            var e = PED_DB.find(function (x) { return x.k === key; });
            cb({ nome: e.n, entry: e, med: null });
          } else {
            var med = medications.find(function (x) { return x.id === key; });
            if (med) cb({ nome: med.nome, entry: pedFind(med.nome), med: med });
          }
        });
      });
    }
    draw("");
    document.getElementById("pp-s").addEventListener("input", function (e) { draw(e.target.value); });
    ov.addEventListener("mousedown", function (e) { if (e.target === ov) ov.remove(); });
    document.getElementById("pp-c").addEventListener("click", function () { ov.remove(); });
  }


  function downloadJsonFallback(filename, blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function downloadJson(filename, dataObj) {
    var blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: "application/json" });
    var statusEl = document.getElementById("export-status");
    var useDownloads = window.claude && typeof window.claude.use === "function"
      ? window.claude.use("downloads").catch(function () { return null; })
      : Promise.resolve(null);

    useDownloads.then(function (downloads) {
      if (downloads) {
        downloads.save({ filename: filename, data: blob }).then(function () {
          if (statusEl) { statusEl.style.color = "var(--accent-deep)"; statusEl.textContent = "Backup salvo."; }
        }).catch(function (err) {
          if (err && err.code === "declined") return;
          console.error(err);
          downloadJsonFallback(filename, blob);
        });
      } else {
        downloadJsonFallback(filename, blob);
      }
    });
  }

  function openSettingsModal() {
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    var storageLabel = store && store.persistent
      ? (window.claude && typeof window.claude.use === "function" && document.getElementById("storage-note").style.display === "none"
          ? "Salvando na nuvem (conta Claude)"
          : "Salvando neste navegador/computador (localStorage) — funciona offline")
      : "Sem armazenamento persistente — dados são perdidos ao fechar a página";

    overlay.innerHTML =
      '<div class="modal" style="max-width:480px;">' +
      "<h2>Ajustes</h2>" +
      '<div class="field"><label>Armazenamento</label>' +
      '<p class="body-text" style="margin:0;font-size:13.5px;">' + escapeHtml(storageLabel) + "</p>" +
      '<p class="body-text" style="margin:4px 0 0 0;font-size:13px;color:var(--ink-faint);">' + medications.length + " medicamento(s) na base atual.</p>" +
      "</div>" +
      '<div class="field"><label>Backup</label>' +
      '<p class="body-text" style="margin:0 0 10px 0;font-size:13px;color:var(--ink-soft);">Exporte sua base para um arquivo .json (para guardar ou levar para outro computador) e importe quando precisar.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button type="button" class="btn" id="export-btn">Exportar backup (.json)</button>' +
      '<button type="button" class="btn-ghost btn" id="import-btn">Importar backup (.json)</button>' +
      '<input type="file" id="import-file" accept="application/json" style="display:none;">' +
      "</div>" +
      '<p id="export-status" class="calc-note" style="margin-top:8px;"></p>' +
      '<p id="import-status" class="calc-note" style="margin-top:2px;"></p>' +
      "</div>" +
      '<div class="modal-actions"><button type="button" class="btn-ghost btn" id="settings-close">Fechar</button></div>' +
      "</div>";

    document.body.appendChild(overlay);
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) overlay.remove(); });
    document.getElementById("settings-close").addEventListener("click", function () { overlay.remove(); });

    document.getElementById("export-btn").addEventListener("click", function () {
      var stamp = todayInputValue();
      downloadJson("formulario-clinico-backup-" + stamp + ".json", { exportedAt: new Date().toISOString(), medications: medications });
    });

    var fileInput = document.getElementById("import-file");
    document.getElementById("import-btn").addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function () {
      var file = fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var statusEl = document.getElementById("import-status");
        try {
          var parsed = JSON.parse(reader.result);
          var incoming = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.medications) ? parsed.medications : null);
          if (!incoming) throw new Error("Formato não reconhecido.");
          var existingNames = medications.map(function (m) { return (m.nome || "").trim().toLowerCase(); });
          var toAdd = incoming.filter(function (m) { return m && m.nome && existingNames.indexOf(m.nome.trim().toLowerCase()) === -1; });
          var now = Date.now();
          toAdd.reduce(function (chain, med) {
            var clean = {};
            FIELDS.forEach(function (f) { clean[f.key] = med[f.key] || ""; });
            return chain.then(function () { return store.add(Object.assign(clean, { createdAt: now, updatedAt: now })); });
          }, Promise.resolve()).then(function () {
            statusEl.style.color = "var(--accent-deep)";
            statusEl.textContent = toAdd.length + " medicamento(s) importado(s). " + (incoming.length - toAdd.length) + " já existiam e foram ignorados.";
          });
        } catch (err) {
          console.error(err);
          statusEl.style.color = "var(--danger)";
          statusEl.textContent = "Não foi possível ler este arquivo. Confirme que é um backup exportado por este app.";
        }
      };
      reader.readAsText(file);
      fileInput.value = "";
    });
  }

  /* Risco cardiovascular: Escore de Risco Global (Framingham, D'Agostino 2008) e Pooled Cohort Equations (ACC/AHA). */
  function cvErg(o) {
    var c = o.fem
      ? { a: 2.32888, tc: 1.20904, hdl: -0.70833, su: 2.76157, st: 2.82263, sm: 0.52873, dm: 0.69154, mean: 26.1931, s0: 0.95012 }
      : { a: 3.06117, tc: 1.1237, hdl: -0.93263, su: 1.93303, st: 1.99881, sm: 0.65451, dm: 0.57367, mean: 23.9802, s0: 0.88936 };
    var sum = c.a * Math.log(o.age) + c.tc * Math.log(o.tc) + c.hdl * Math.log(o.hdl) + (o.treated ? c.st : c.su) * Math.log(o.sbp) + (o.smoker ? c.sm : 0) + (o.dm ? c.dm : 0);
    return 1 - Math.pow(c.s0, Math.exp(sum - c.mean));
  }
  function cvPce(o) {
    var la = Math.log(o.age), lt = Math.log(o.tc), lh = Math.log(o.hdl), ls = Math.log(o.sbp), sm = o.smoker ? 1 : 0, dm = o.dm ? 1 : 0, tr = o.treated, sum, mean, s0;
    if (o.fem && !o.black) { sum = -29.799 * la + 4.884 * la * la + 13.54 * lt - 3.114 * la * lt - 13.578 * lh + 3.149 * la * lh + (tr ? 2.019 : 1.957) * ls + 7.574 * sm - 1.665 * la * sm + 0.661 * dm; mean = -29.18; s0 = 0.9665; }
    else if (o.fem) { sum = 17.114 * la + 0.94 * lt - 18.92 * lh + 4.475 * la * lh + (tr ? 29.291 * ls - 6.432 * la * ls : 27.82 * ls - 6.087 * la * ls) + 0.691 * sm + 0.874 * dm; mean = 86.61; s0 = 0.9533; }
    else if (!o.black) { sum = 12.344 * la + 11.853 * lt - 2.664 * la * lt - 7.99 * lh + 1.769 * la * lh + (tr ? 1.797 : 1.764) * ls + 7.837 * sm - 1.795 * la * sm + 0.658 * dm; mean = 61.18; s0 = 0.9144; }
    else { sum = 2.469 * la + 0.302 * lt - 0.307 * lh + (tr ? 1.916 : 1.809) * ls + 0.549 * sm + 0.645 * dm; mean = 19.54; s0 = 0.8954; }
    return 1 - Math.pow(s0, Math.exp(sum - mean));
  }
  /* OMS: IMC para a idade (L;M;S por mês de vida, 0-228 meses). 0-60 m: padrão 2006; 61-228 m: referência 2007. */
  var WHO_BMI = {"M":"-0.3053,13.4069,0.0956;0.2738,14.914,0.09035;0.1113,16.3231,0.08676;0.0077,16.895,0.08496;-0.0732,17.1594,0.08378;-0.1366,17.2914,0.08297;-0.1919,17.3424,0.08233;-0.2384,17.3289,0.08183;-0.2808,17.2633,0.08139;-0.3177,17.1659,0.08102;-0.3512,17.0503,0.08068;-0.383,16.9231,0.08037;-0.4113,16.7992,0.08009;-0.4384,16.6731,0.07982;-0.4629,16.5553,0.07958;-0.4867,16.4393,0.07934;-0.5082,16.3335,0.07913;-0.5286,16.2343,0.07893;-0.5485,16.1388,0.07873;-0.5667,16.0536,0.07854;-0.5847,15.9737,0.07836;-0.6013,15.9043,0.07818;-0.6176,15.8405,0.07802;-0.6328,15.7853,0.07786;-0.6473,15.7356,0.07771;-0.584,15.9799,0.07792;-0.5501,15.9418,0.07799;-0.5164,15.9034,0.07809;-0.4853,15.867,0.07818;-0.4549,15.8303,0.07829;-0.4275,15.7954,0.07841;-0.4013,15.7601,0.07854;-0.3782,15.7267,0.07867;-0.3575,15.6939,0.07882;-0.3388,15.6609,0.07897;-0.3233,15.6297,0.07913;-0.31,15.5986,0.07931;-0.3,15.5695,0.07949;-0.2927,15.5406,0.07969;-0.2884,15.5141,0.0799;-0.2869,15.4881,0.08013;-0.2881,15.4645,0.08036;-0.2918,15.4423,0.08061;-0.2982,15.4209,0.08087;-0.3066,15.4015,0.08114;-0.3175,15.3825,0.08144;-0.3302,15.3652,0.08174;-0.3455,15.3483,0.08206;-0.3622,15.3326,0.08238;-0.3808,15.3176,0.08272;-0.402,15.3029,0.08307;-0.4243,15.2892,0.08343;-0.449,15.2758,0.08381;-0.4745,15.2634,0.08418;-0.5022,15.2513,0.08457;-0.5302,15.24,0.08496;-0.5594,15.2293,0.08535;-0.5906,15.2188,0.08577;-0.6219,15.2092,0.08617;-0.6554,15.2,0.08659;-0.6889,15.1917,0.08699;-0.7387,15.2641,0.08390;-0.7621,15.2616,0.08414;-0.7856,15.2604,0.08439;-0.8089,15.2605,0.08464;-0.8322,15.2619,0.08490;-0.8554,15.2645,0.08516;-0.8785,15.2684,0.08543;-0.9015,15.2737,0.08570;-0.9243,15.2801,0.08597;-0.9471,15.2877,0.08625;-0.9697,15.2965,0.08653;-0.9921,15.3062,0.08682;-1.0144,15.3169,0.08711;-1.0365,15.3285,0.08741;-1.0584,15.3408,0.08771;-1.0801,15.3540,0.08802;-1.1017,15.3679,0.08833;-1.1230,15.3825,0.08865;-1.1441,15.3978,0.08898;-1.1649,15.4137,0.08931;-1.1856,15.4302,0.08964;-1.2060,15.4473,0.08998;-1.2261,15.4650,0.09033;-1.2460,15.4832,0.09068;-1.2656,15.5019,0.09103;-1.2849,15.5210,0.09139;-1.3040,15.5407,0.09176;-1.3228,15.5608,0.09213;-1.3414,15.5814,0.09251;-1.3596,15.6023,0.09289;-1.3776,15.6237,0.09327;-1.3953,15.6455,0.09366;-1.4126,15.6677,0.09406;-1.4297,15.6903,0.09445;-1.4464,15.7133,0.09486;-1.4629,15.7368,0.09526;-1.4790,15.7606,0.09567;-1.4947,15.7848,0.09609;-1.5101,15.8094,0.09651;-1.5252,15.8344,0.09693;-1.5399,15.8597,0.09735;-1.5542,15.8855,0.09778;-1.5681,15.9116,0.09821;-1.5817,15.9381,0.09864;-1.5948,15.9651,0.09907;-1.6076,15.9925,0.09951;-1.6199,16.0205,0.09994;-1.6318,16.0490,0.10038;-1.6433,16.0781,0.10082;-1.6544,16.1078,0.10126;-1.6651,16.1381,0.10170;-1.6753,16.1692,0.10214;-1.6851,16.2009,0.10259;-1.6944,16.2333,0.10303;-1.7032,16.2665,0.10347;-1.7116,16.3004,0.10391;-1.7196,16.3351,0.10435;-1.7271,16.3704,0.10478;-1.7341,16.4065,0.10522;-1.7407,16.4433,0.10566;-1.7468,16.4807,0.10609;-1.7525,16.5189,0.10652;-1.7578,16.5578,0.10695;-1.7626,16.5974,0.10738;-1.7670,16.6376,0.10780;-1.7710,16.6786,0.10823;-1.7745,16.7203,0.10865;-1.7777,16.7628,0.10906;-1.7804,16.8059,0.10948;-1.7828,16.8497,0.10989;-1.7847,16.8941,0.11030;-1.7862,16.9392,0.11070;-1.7873,16.9850,0.11110;-1.7881,17.0314,0.11150;-1.7884,17.0784,0.11189;-1.7884,17.1262,0.11228;-1.7880,17.1746,0.11266;-1.7873,17.2236,0.11304;-1.7861,17.2734,0.11342;-1.7846,17.3240,0.11379;-1.7828,17.3752,0.11415;-1.7806,17.4272,0.11451;-1.7780,17.4799,0.11487;-1.7751,17.5334,0.11522;-1.7719,17.5877,0.11556;-1.7684,17.6427,0.11590;-1.7645,17.6985,0.11623;-1.7604,17.7551,0.11656;-1.7559,17.8124,0.11688;-1.7511,17.8704,0.11720;-1.7461,17.9292,0.11751;-1.7408,17.9887,0.11781;-1.7352,18.0488,0.11811;-1.7293,18.1096,0.11841;-1.7232,18.1710,0.11869;-1.7168,18.2330,0.11898;-1.7102,18.2955,0.11925;-1.7033,18.3586,0.11952;-1.6962,18.4221,0.11979;-1.6888,18.4860,0.12005;-1.6811,18.5502,0.12030;-1.6732,18.6148,0.12055;-1.6651,18.6795,0.12079;-1.6568,18.7445,0.12102;-1.6482,18.8095,0.12125;-1.6394,18.8746,0.12148;-1.6304,18.9398,0.12170;-1.6211,19.0050,0.12191;-1.6116,19.0701,0.12212;-1.6020,19.1351,0.12233;-1.5921,19.2000,0.12253;-1.5821,19.2648,0.12272;-1.5719,19.3294,0.12291;-1.5615,19.3937,0.12310;-1.5510,19.4578,0.12328;-1.5403,19.5217,0.12346;-1.5294,19.5853,0.12363;-1.5185,19.6486,0.12380;-1.5074,19.7117,0.12396;-1.4961,19.7744,0.12412;-1.4848,19.8367,0.12428;-1.4733,19.8987,0.12443;-1.4617,19.9603,0.12458;-1.4500,20.0215,0.12473;-1.4382,20.0823,0.12487;-1.4263,20.1427,0.12501;-1.4143,20.2026,0.12514;-1.4022,20.2621,0.12528;-1.3900,20.3211,0.12541;-1.3777,20.3796,0.12554;-1.3653,20.4376,0.12567;-1.3529,20.4951,0.12579;-1.3403,20.5521,0.12591;-1.3277,20.6085,0.12603;-1.3149,20.6644,0.12615;-1.3021,20.7197,0.12627;-1.2892,20.7745,0.12638;-1.2762,20.8287,0.12650;-1.2631,20.8824,0.12661;-1.2499,20.9355,0.12672;-1.2366,20.9881,0.12683;-1.2233,21.0400,0.12694;-1.2098,21.0914,0.12704;-1.1962,21.1423,0.12715;-1.1826,21.1925,0.12726;-1.1688,21.2423,0.12736;-1.1550,21.2914,0.12746;-1.1410,21.3400,0.12756;-1.1270,21.3880,0.12767;-1.1129,21.4354,0.12777;-1.0986,21.4822,0.12787;-1.0843,21.5285,0.12797;-1.0699,21.5742,0.12807;-1.0553,21.6193,0.12816;-1.0407,21.6638,0.12826;-1.0260,21.7077,0.12836;-1.0112,21.7510,0.12845;-0.9962,21.7937,0.12855;-0.9812,21.8358,0.12864;-0.9661,21.8773,0.12874;-0.9509,21.9182,0.12883;-0.9356,21.9585,0.12893;-0.9202,21.9982,0.12902;-0.9048,22.0374,0.12911;-0.8892,22.0760,0.12920;-0.8735,22.1140,0.12930;-0.8578,22.1514,0.12939;-0.8419,22.1883,0.12948","F":"-0.0631,13.3363,0.09272;0.3481,14.5422,0.09559;0.1743,15.7713,0.09371;0.0652,16.3531,0.09255;-0.0197,16.6722,0.09166;-0.086,16.8379,0.09096;-0.1436,16.9086,0.09035;-0.1915,16.9021,0.08984;-0.2351,16.839,0.08938;-0.2726,16.7404,0.08898;-0.3064,16.62,0.08862;-0.3382,16.4867,0.08827;-0.3665,16.3578,0.08797;-0.3934,16.2298,0.08768;-0.4176,16.1132,0.08741;-0.441,16.0013,0.08716;-0.4623,15.9017,0.08693;-0.4823,15.8108,0.08671;-0.5018,15.726,0.0865;-0.5197,15.6524,0.08631;-0.5374,15.585,0.08611;-0.5536,15.5281,0.08594;-0.5697,15.4782,0.08576;-0.5846,15.4381,0.0856;-0.5989,15.4052,0.08545;-0.5684,15.6589,0.08452;-0.5684,15.6311,0.08449;-0.5684,15.6036,0.08446;-0.5684,15.5779,0.08444;-0.5684,15.5521,0.08443;-0.5684,15.5277,0.08444;-0.5684,15.503,0.08448;-0.5684,15.4798,0.08455;-0.5684,15.4575,0.08467;-0.5684,15.4355,0.08484;-0.5684,15.4157,0.08506;-0.5684,15.3966,0.08535;-0.5684,15.3797,0.08569;-0.5684,15.3636,0.08609;-0.5684,15.3493,0.08654;-0.5684,15.3356,0.08704;-0.5684,15.3233,0.08757;-0.5684,15.3117,0.08813;-0.5684,15.3006,0.08872;-0.5684,15.2906,0.08931;-0.5684,15.2813,0.08992;-0.5684,15.2732,0.0905;-0.5684,15.266,0.0911;-0.5684,15.2602,0.09168;-0.5684,15.2557,0.09227;-0.5684,15.2523,0.09287;-0.5684,15.2503,0.09345;-0.5684,15.2496,0.09404;-0.5684,15.2502,0.0946;-0.5684,15.2519,0.09516;-0.5684,15.2543,0.09567;-0.5684,15.2575,0.09617;-0.5684,15.2612,0.09665;-0.5684,15.2653,0.09708;-0.5684,15.2698,0.0975;-0.5684,15.2747,0.09789;-0.8886,15.2441,0.09692;-0.9068,15.2434,0.09738;-0.9248,15.2433,0.09783;-0.9427,15.2438,0.09829;-0.9605,15.2448,0.09875;-0.9780,15.2464,0.09920;-0.9954,15.2487,0.09966;-1.0126,15.2516,0.10012;-1.0296,15.2551,0.10058;-1.0464,15.2592,0.10104;-1.0630,15.2641,0.10149;-1.0794,15.2697,0.10195;-1.0956,15.2760,0.10241;-1.1115,15.2831,0.10287;-1.1272,15.2911,0.10333;-1.1427,15.2998,0.10379;-1.1579,15.3095,0.10425;-1.1728,15.3200,0.10471;-1.1875,15.3314,0.10517;-1.2019,15.3439,0.10562;-1.2160,15.3572,0.10608;-1.2298,15.3717,0.10654;-1.2433,15.3871,0.10700;-1.2565,15.4036,0.10746;-1.2693,15.4211,0.10792;-1.2819,15.4397,0.10837;-1.2941,15.4593,0.10883;-1.3060,15.4798,0.10929;-1.3175,15.5014,0.10974;-1.3287,15.5240,0.11020;-1.3395,15.5476,0.11065;-1.3499,15.5723,0.11110;-1.3600,15.5979,0.11156;-1.3697,15.6246,0.11201;-1.3790,15.6523,0.11246;-1.3880,15.6810,0.11291;-1.3966,15.7107,0.11335;-1.4047,15.7415,0.11380;-1.4125,15.7732,0.11424;-1.4199,15.8058,0.11469;-1.4270,15.8394,0.11513;-1.4336,15.8738,0.11557;-1.4398,15.9090,0.11601;-1.4456,15.9451,0.11644;-1.4511,15.9818,0.11688;-1.4561,16.0194,0.11731;-1.4607,16.0575,0.11774;-1.4650,16.0964,0.11816;-1.4688,16.1358,0.11859;-1.4723,16.1759,0.11901;-1.4753,16.2166,0.11943;-1.4780,16.2580,0.11985;-1.4803,16.2999,0.12026;-1.4823,16.3425,0.12067;-1.4838,16.3858,0.12108;-1.4850,16.4298,0.12148;-1.4859,16.4746,0.12188;-1.4864,16.5200,0.12228;-1.4866,16.5663,0.12268;-1.4864,16.6133,0.12307;-1.4859,16.6612,0.12346;-1.4851,16.7100,0.12384;-1.4839,16.7595,0.12422;-1.4825,16.8100,0.12460;-1.4807,16.8614,0.12497;-1.4787,16.9136,0.12534;-1.4763,16.9667,0.12571;-1.4737,17.0208,0.12607;-1.4708,17.0757,0.12643;-1.4677,17.1316,0.12678;-1.4642,17.1883,0.12713;-1.4606,17.2459,0.12748;-1.4567,17.3044,0.12782;-1.4526,17.3637,0.12816;-1.4482,17.4238,0.12849;-1.4436,17.4847,0.12882;-1.4389,17.5464,0.12914;-1.4339,17.6088,0.12946;-1.4288,17.6719,0.12978;-1.4235,17.7357,0.13009;-1.4180,17.8001,0.13040;-1.4123,17.8651,0.13070;-1.4065,17.9306,0.13099;-1.4006,17.9966,0.13129;-1.3945,18.0630,0.13158;-1.3883,18.1297,0.13186;-1.3819,18.1967,0.13214;-1.3755,18.2639,0.13241;-1.3689,18.3312,0.13268;-1.3621,18.3986,0.13295;-1.3553,18.4660,0.13321;-1.3483,18.5333,0.13347;-1.3413,18.6006,0.13372;-1.3341,18.6677,0.13397;-1.3269,18.7346,0.13421;-1.3195,18.8012,0.13445;-1.3121,18.8675,0.13469;-1.3046,18.9335,0.13492;-1.2970,18.9991,0.13514;-1.2894,19.0642,0.13537;-1.2816,19.1289,0.13559;-1.2739,19.1931,0.13580;-1.2661,19.2567,0.13601;-1.2583,19.3197,0.13622;-1.2504,19.3820,0.13642;-1.2425,19.4437,0.13662;-1.2345,19.5045,0.13681;-1.2266,19.5647,0.13700;-1.2186,19.6240,0.13719;-1.2107,19.6824,0.13738;-1.2027,19.7400,0.13756;-1.1947,19.7966,0.13774;-1.1867,19.8523,0.13791;-1.1788,19.9070,0.13808;-1.1708,19.9607,0.13825;-1.1629,20.0133,0.13841;-1.1549,20.0648,0.13858;-1.1470,20.1152,0.13873;-1.1390,20.1644,0.13889;-1.1311,20.2125,0.13904;-1.1232,20.2595,0.13920;-1.1153,20.3053,0.13934;-1.1074,20.3499,0.13949;-1.0996,20.3934,0.13963;-1.0917,20.4357,0.13977;-1.0838,20.4769,0.13991;-1.0760,20.5170,0.14005;-1.0681,20.5560,0.14018;-1.0603,20.5938,0.14031;-1.0525,20.6306,0.14044;-1.0447,20.6663,0.14057;-1.0368,20.7008,0.14070;-1.0290,20.7344,0.14082;-1.0212,20.7668,0.14094;-1.0134,20.7982,0.14106;-1.0055,20.8286,0.14118;-0.9977,20.8580,0.14130;-0.9898,20.8863,0.14142;-0.9819,20.9137,0.14153;-0.9740,20.9401,0.14164;-0.9661,20.9656,0.14176;-0.9582,20.9901,0.14187;-0.9503,21.0138,0.14198;-0.9423,21.0367,0.14208;-0.9344,21.0587,0.14219;-0.9264,21.0801,0.14230;-0.9184,21.1007,0.14240;-0.9104,21.1206,0.14250;-0.9024,21.1399,0.14261;-0.8944,21.1586,0.14271;-0.8863,21.1768,0.14281;-0.8783,21.1944,0.14291;-0.8703,21.2116,0.14301;-0.8623,21.2282,0.14311;-0.8542,21.2444,0.14320;-0.8462,21.2603,0.14330;-0.8382,21.2757,0.14340;-0.8301,21.2908,0.14349;-0.8221,21.3055,0.14359;-0.8140,21.3200,0.14368;-0.8060,21.3341,0.14377;-0.7980,21.3480,0.14386;-0.7899,21.3617,0.14396;-0.7819,21.3752,0.14405;-0.7738,21.3884,0.14414;-0.7658,21.4014,0.14423;-0.7577,21.4143,0.14432;-0.7496,21.4269,0.14441"};

  function openCalcModal() {
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "calc-overlay";
    overlay.innerHTML =
      '<div class="modal calc-modal">' +
      '<h2>Calculadoras</h2>' +
      '<div class="calc-tabs">' +
      '<button type="button" class="calc-tab active" data-tab="basic">Calculadora</button>' +
      '<button type="button" class="calc-tab" data-tab="ga">Idade gestacional</button>' +
      '<button type="button" class="calc-tab" data-tab="ped">Dose pediátrica</button>' +
      '<button type="button" class="calc-tab" data-tab="renal">Função renal</button>' +
      '<button type="button" class="calc-tab" data-tab="imc">IMC adulto</button>' +
      '<button type="button" class="calc-tab" data-tab="imcp">IMC infantil</button>' +
      '<button type="button" class="calc-tab" data-tab="cv">Risco CV</button>' +
      '<button type="button" class="calc-tab" data-tab="fluid">Fluidos</button>' +
      '<button type="button" class="calc-tab" data-tab="inf">Infusão</button>' +
      '<button type="button" class="calc-tab" data-tab="cort">Corticoides</button>' +
      "</div>" +

      '<div class="calc-panel" id="panel-basic">' +
      '<div class="basic-calc"><div class="bc-display"><div class="bc-expr" id="bc-expr"></div><div class="bc-res" id="bc-res">0</div></div>' +
      '<div class="bc-keys" id="bc-keys">' +
      '<button type="button" data-k="C" class="op">C</button><button type="button" data-k="(" class="op">(</button><button type="button" data-k=")" class="op">)</button><button type="button" data-k="/" class="op">÷</button>' +
      '<button type="button" data-k="7">7</button><button type="button" data-k="8">8</button><button type="button" data-k="9">9</button><button type="button" data-k="*" class="op">×</button>' +
      '<button type="button" data-k="4">4</button><button type="button" data-k="5">5</button><button type="button" data-k="6">6</button><button type="button" data-k="-" class="op">−</button>' +
      '<button type="button" data-k="1">1</button><button type="button" data-k="2">2</button><button type="button" data-k="3">3</button><button type="button" data-k="+" class="op">+</button>' +
      '<button type="button" data-k="0">0</button><button type="button" data-k=".">,</button><button type="button" data-k="%" class="op">%</button><button type="button" data-k="=" class="eq">=</button>' +
      '<button type="button" data-k="BS" class="op">⌫</button><button type="button" data-k="^2" class="op">x²</button><button type="button" data-k="r" class="op">√</button><button type="button" data-k="NEG" class="op">±</button>' +
      '</div><div class="bc-hist" id="bc-hist"></div></div>' +
      "</div>" +

      '<div class="calc-panel" id="panel-inf" style="display:none;">' +
      '<div class="inf-presets" id="inf-presets"></div>' +
      '<div class="calc-row"><div class="field"><label for="inf-peso">Peso (kg)</label><input type="number" id="inf-peso" min="0" step="0.1" inputmode="decimal"></div>' +
      '<div class="field"><label for="inf-dose">Dose desejada</label><input type="number" id="inf-dose" min="0" step="any" inputmode="decimal"></div></div>' +
      '<div class="field"><label for="inf-dunit">Unidade da dose</label><select id="inf-dunit">' +
      '<option value="ug/kg/min">µg/kg/min</option><option value="ug/kg/h">µg/kg/h</option><option value="mg/kg/h">mg/kg/h</option><option value="mg/kg/min">mg/kg/min</option>' +
      '<option value="ug/min">µg/min</option><option value="mg/min">mg/min</option><option value="mg/h">mg/h</option><option value="ug/h">µg/h</option>' +
      '<option value="U/kg/h">U/kg/h</option><option value="U/h">U/h</option><option value="U/min">U/min</option></select></div>' +
      '<div class="calc-row"><div class="field"><label for="inf-amt">Quantidade do fármaco na solução</label><input type="number" id="inf-amt" min="0" step="any" inputmode="decimal"></div>' +
      '<div class="field"><label for="inf-aunit">Unidade</label><select id="inf-aunit"><option value="mg">mg</option><option value="ug">µg</option><option value="U">U (unidades)</option></select></div></div>' +
      '<div class="field"><label for="inf-vol">Volume final da solução (mL)</label><input type="number" id="inf-vol" min="0" step="any" inputmode="decimal"></div>' +
      '<div id="inf-result"></div>' +
      '<div class="field" style="margin-top:14px;"><label for="inf-rate">Cálculo inverso: velocidade da bomba (mL/h)</label><input type="number" id="inf-rate" min="0" step="any" inputmode="decimal"></div>' +
      '<div id="inf-inv"></div>' +
      '<p class="calc-note" id="inf-note">Selecione um preparo-padrão ou informe os dados. Concentrações e faixas são referências usuais: confirme sempre no protocolo institucional e na bula; use bomba de infusão.</p>' +
      "</div>" +

      '<div class="calc-panel" id="panel-ga" style="display:none;">' +
      '<div class="calc-subtabs">' +
      '<button type="button" class="calc-subtab active" data-sub="dum">Pela DUM</button>' +
      '<button type="button" class="calc-subtab" data-sub="usg">Pelo USG</button>' +
      "</div>" +

      '<div class="calc-sub" id="sub-dum">' +
      '<div class="field"><label for="calc-dum">Data da última menstruação (DUM)</label><input type="date" id="calc-dum"></div>' +
      '<div class="field"><label for="calc-dum-ref">Data de referência</label><input type="date" id="calc-dum-ref"></div>' +
      '<div id="dum-result"></div>' +
      "</div>" +

      '<div class="calc-sub" id="sub-usg" style="display:none;">' +
      '<div class="calc-row"><div class="field"><label for="usg-weeks">IG no exame — semanas</label><input type="number" id="usg-weeks" min="0" max="42" step="1"></div>' +
      '<div class="field"><label for="usg-days">+ dias</label><input type="number" id="usg-days" min="0" max="6" step="1" value="0"></div></div>' +
      '<div class="field"><label for="usg-date">Data do exame (USG)</label><input type="date" id="usg-date"></div>' +
      '<div class="field"><label for="usg-ref">Data de referência</label><input type="date" id="usg-ref"></div>' +
      '<div id="usg-result"></div>' +
      "</div>" +
      '<p class="calc-note">Cálculo por datas informadas (Naegele para DUM). Confirme sempre com a avaliação clínica.</p>' +
      "</div>" +

      '<div class="calc-panel" id="panel-ped" style="display:none;">' +
      '<button type="button" class="btn-ghost btn" id="ped-pick-btn" style="width:100%;margin-bottom:14px;">Selecionar medicamento</button>' +
      '<div id="ped-selected"></div>' +
      '<div id="ped-widget">' + pedWidgetHtml('ped') + '</div>' +
      '<p class="calc-note">Ao escolher o medicamento, selecione a VIA (VO, IM, EV...) e a APRESENTAÇÃO: dose/kg, frequência, concentração e limites máximos são preenchidos automaticamente e continuam editáveis. São faixas usuais de referência, não uma prescrição: confirme sempre com a bula ou o protocolo institucional antes de administrar, especialmente em neonatos, prematuros ou comorbidades renais/hepáticas.</p>' +
      "</div>" +


      '<div class="calc-panel" id="panel-renal" style="display:none;">' +
      '<div class="calc-row"><div class="field"><label for="rn-sex">Sexo</label><select id="rn-sex"><option value="M">Masculino</option><option value="F">Feminino</option></select></div>' +
      '<div class="field"><label for="rn-age">Idade (anos)</label><input type="number" id="rn-age" min="0" step="1" inputmode="decimal"></div></div>' +
      '<div class="calc-row"><div class="field"><label for="rn-wt">Peso (kg)</label><input type="number" id="rn-wt" min="0" step="0.1" inputmode="decimal"></div>' +
      '<div class="field"><label for="rn-cr">Creatinina (mg/dL)</label><input type="number" id="rn-cr" min="0" step="0.01" inputmode="decimal"></div></div>' +
      '<div id="rn-out"></div>' +
      '<p class="calc-note">Cockcroft-Gault (usa peso real; em obesos considerar peso ajustado) e CKD-EPI 2021. Para ajuste de doses de fármacos, Cockcroft-Gault é a referência mais usada nas bulas.</p>' +
      "</div>" +

      '<div class="calc-panel" id="panel-imc" style="display:none;">' +
      '<div class="calc-row"><div class="field"><label for="im-sex">Sexo</label><select id="im-sex"><option value="M">Homem</option><option value="F">Mulher</option></select></div><div class="field"><label for="im-age">Idade (anos)</label><input type="number" id="im-age" min="0" step="1" inputmode="decimal"></div></div>' +
      '<div class="calc-row"><div class="field"><label for="im-wt">Peso (kg)</label><input type="number" id="im-wt" min="0" step="0.1" inputmode="decimal"></div><div class="field"><label for="im-ht">Altura (cm)</label><input type="number" id="im-ht" min="0" step="0.1" inputmode="decimal"></div></div>' +
      '<div class="field"><label for="im-wc">Circunferência abdominal (cm) — opcional</label><input type="number" id="im-wc" min="0" step="0.1" inputmode="decimal"></div>' +
      '<div id="im-out"></div>' +
      '<p class="calc-note">IMC pela classificação da OMS (adultos &lt; 60 anos) e de Lipschitz (idosos ≥ 60 anos). Peso ideal de Devine; peso ajustado = ideal + 0,4 × (real − ideal), usado para dose de fármacos em obesos. Superfície corporal de Mosteller. Para menores de 20 anos use a aba IMC infantil.</p>' +
      '</div>' +
      '<div class="calc-panel" id="panel-imcp" style="display:none;">' +
      '<div class="calc-row"><div class="field"><label for="ip-sex">Sexo</label><select id="ip-sex"><option value="M">Menino</option><option value="F">Menina</option></select></div><div class="field"><label for="ip-y">Idade — anos</label><input type="number" id="ip-y" min="0" step="1" inputmode="decimal" max="19"></div><div class="field"><label for="ip-m">e meses</label><input type="number" id="ip-m" min="0" step="1" inputmode="decimal" max="11"></div></div>' +
      '<div class="calc-row"><div class="field"><label for="ip-wt">Peso (kg)</label><input type="number" id="ip-wt" min="0" step="0.01" inputmode="decimal"></div><div class="field"><label for="ip-ht">Estatura (cm)</label><input type="number" id="ip-ht" min="0" step="0.1" inputmode="decimal"></div></div>' +
      '<div id="ip-out"></div>' +
      '<p class="calc-note">IMC para a idade pelas curvas da OMS (2006 para 0-5 anos; 2007 para 5-19 anos), com escore z, percentil e classificação do Ministério da Saúde (SISVAN). Até 2 anos a medida é o comprimento (deitado); depois, a altura (em pé). Interpretar junto com estatura/idade e o estadiamento puberal.</p>' +
      '</div>' +
      '<div class="calc-panel" id="panel-cv" style="display:none;">' +
      '<div class="calc-row"><div class="field"><label for="cv-sex">Sexo</label><select id="cv-sex"><option value="M">Homem</option><option value="F">Mulher</option></select></div><div class="field"><label for="cv-age">Idade (anos)</label><input type="number" id="cv-age" min="0" step="1" inputmode="decimal"></div></div>' +
      '<div class="calc-row"><div class="field"><label for="cv-tc">Colesterol total (mg/dL)</label><input type="number" id="cv-tc" min="0" step="1" inputmode="decimal"></div><div class="field"><label for="cv-hdl">HDL-c (mg/dL)</label><input type="number" id="cv-hdl" min="0" step="1" inputmode="decimal"></div></div>' +
      '<div class="calc-row"><div class="field"><label for="cv-sbp">PA sistólica (mmHg)</label><input type="number" id="cv-sbp" min="0" step="1" inputmode="decimal"></div><div class="field"><label for="cv-trt">Usa anti-hipertensivo?</label><select id="cv-trt"><option value="0">Não</option><option value="1">Sim</option></select></div></div>' +
      '<div class="calc-row"><div class="field"><label for="cv-smk">Fumante atual?</label><select id="cv-smk"><option value="0">Não</option><option value="1">Sim</option></select></div><div class="field"><label for="cv-dm">Diabetes?</label><select id="cv-dm"><option value="0">Não</option><option value="1">Sim</option></select></div></div>' +
      '<div class="field"><label for="cv-race">Raça/cor (só para o ASCVD americano)</label><select id="cv-race"><option value="0">Branca / outras</option><option value="1">Negra</option></select></div>' +
      '<div id="cv-out"></div>' +
      '<p class="calc-note">Escore de Risco Global (Framingham, D\'Agostino 2008), adotado pela SBC: risco de evento cardiovascular em 10 anos, válido de 30 a 74 anos. Categorias SBC: baixo &lt; 5 %; intermediário 5-20 % (homens) ou 5-10 % (mulheres); alto &gt; 20 % (homens) ou &gt; 10 % (mulheres). ASCVD (Pooled Cohort Equations, ACC/AHA 2013/2019): válido de 40 a 79 anos. Não use em quem já tem doença aterosclerótica, aneurisma de aorta, DRC (TFG &lt; 60), LDL-c ≥ 190 mg/dL ou diabetes com lesão de órgão-alvo: já são de alto risco (SBC 2019). Metas de LDL-c (SBC): baixo risco &lt; 130; intermediário &lt; 100; alto &lt; 70; muito alto &lt; 50 mg/dL. Os escores estimam risco populacional e não substituem o julgamento clínico (considerar fatores agravantes: história familiar precoce, síndrome metabólica, Lp(a), escore de cálcio).</p>' +
      '</div>' +

      '<div class="calc-panel" id="panel-fluid" style="display:none;">' +
      '<div class="calc-subtabs"><button type="button" class="calc-subtab active" data-fsub="hs">Manutenção</button><button type="button" class="calc-subtab" data-fsub="pk">Queimadura</button><button type="button" class="calc-subtab" data-fsub="gt">Gotejamento</button></div>' +
      '<div id="fl-hs"><div class="field"><label for="fl-wt">Peso (kg)</label><input type="number" id="fl-wt" min="0" step="0.1" inputmode="decimal"></div><div id="fl-hs-out"></div>' +
      '<p class="calc-note">Holliday-Segar: 100 mL/kg nos primeiros 10 kg, 50 mL/kg nos 10 kg seguintes e 20 mL/kg acima disso, por dia (regra 4-2-1 em mL/h). Em adultos costuma-se limitar a ~2,5 L/dia.</p></div>' +
      '<div id="fl-pk" style="display:none;"><div class="calc-row"><div class="field"><label for="pk-wt">Peso (kg)</label><input type="number" id="pk-wt" min="0" step="0.1" inputmode="decimal"></div><div class="field"><label for="pk-sc">Superfície queimada (%)</label><input type="number" id="pk-sc" min="0" max="100" step="1" inputmode="decimal"></div></div><div id="fl-pk-out"></div>' +
      '<p class="calc-note">Parkland: 4 mL × peso × %SCQ de Ringer lactato em 24 h (metade nas primeiras 8 h desde o momento da queimadura). Ajustar pela diurese; considerar queimaduras de 2º e 3º graus.</p></div>' +
      '<div id="fl-gt" style="display:none;"><div class="calc-row"><div class="field"><label for="gt-vol">Volume (mL)</label><input type="number" id="gt-vol" min="0" step="any" inputmode="decimal"></div><div class="field"><label for="gt-h">Tempo (horas)</label><input type="number" id="gt-h" min="0" step="any" inputmode="decimal"></div></div><div id="fl-gt-out"></div>' +
      '<p class="calc-note">Macrogotas: volume ÷ (tempo em h × 3). Microgotas: volume ÷ tempo em h. Equipos de macrogotas = 20 gotas/mL.</p></div>' +
      "</div>" +

      '<div class="calc-panel" id="panel-cort" style="display:none;">' +
      '<div class="calc-row"><div class="field"><label for="co-drug">Corticoide</label><select id="co-drug"><option value="5">Prednisona</option><option value="5">Prednisolona</option><option value="4">Metilprednisolona</option><option value="20">Hidrocortisona</option><option value="0.75">Dexametasona</option><option value="0.6">Betametasona</option></select></div>' +
      '<div class="field"><label for="co-dose">Dose (mg)</label><input type="number" id="co-dose" min="0" step="any" inputmode="decimal"></div></div>' +
      '<div id="co-out"></div>' +
      '<p class="calc-note">Equivalência anti-inflamatória aproximada (5 mg de prednisona = 4 mg de metilprednisolona = 20 mg de hidrocortisona = 0,75 mg de dexametasona = 0,6 mg de betametasona). Não considera diferenças de efeito mineralocorticoide.</p>' +
      "</div>" +
      '<div class="modal-actions"><button type="button" class="btn" id="calc-close">Fechar</button></div>' +
      "</div>";

    document.body.appendChild(overlay);

    document.getElementById("calc-dum-ref").value = todayInputValue();
    document.getElementById("usg-ref").value = todayInputValue();

    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) overlay.remove(); });
    document.getElementById("calc-close").addEventListener("click", function () { overlay.remove(); });

    pedAttach("ped", null, null);

    document.getElementById("ped-pick-btn").addEventListener("click", function () {
      openProtoPicker(function (sel) {
        var prev = document.getElementById("ped-weight");
        var peso = prev ? prev.value : "";
        var vias = sel.entry ? sel.entry.v.map(function (r) { return r.via; }).join(" · ") : (sel.med ? (sel.med.via || inferVia(sel.med.apresentacoes)) : "");
        document.getElementById("ped-selected").innerHTML =
          '<div class="calc-result" style="margin-top:0;">' +
          '<div><span class="calc-label">Selecionado</span><span class="calc-value" style="font-family:var(--serif);">' + escapeHtml(sel.nome || "") + "</span></div>" +
          (vias ? '<div><span class="calc-label">Vias</span><span class="calc-value">' + escapeHtml(vias) + "</span></div>" : "") +
          "</div>";
        document.getElementById("ped-widget").innerHTML = pedWidgetHtml("ped");
        pedAttach("ped", sel.entry, sel.med);
        if (peso) { document.getElementById("ped-weight").value = peso; document.getElementById("ped-weight").dispatchEvent(new Event("input")); }
      });
    });

    Array.prototype.forEach.call(overlay.querySelectorAll(".calc-tab"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(overlay.querySelectorAll(".calc-tab"), function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var tabId = btn.getAttribute("data-tab");
        Array.prototype.forEach.call(overlay.querySelectorAll(".calc-panel"), function (p) {
          p.style.display = p.id === "panel-" + tabId ? "block" : "none";
        });
      });
    });

    Array.prototype.forEach.call(overlay.querySelectorAll("[data-sub]"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(overlay.querySelectorAll("[data-sub]"), function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        document.getElementById("sub-dum").style.display = btn.getAttribute("data-sub") === "dum" ? "block" : "none";
        document.getElementById("sub-usg").style.display = btn.getAttribute("data-sub") === "usg" ? "block" : "none";
      });
    });

    /* ---- Calculadora comum ---- */
    (function () {
      var expr = "", justEq = false, hist = [];
      var exprEl = document.getElementById("bc-expr"), resEl = document.getElementById("bc-res"), histEl = document.getElementById("bc-hist");
      function fmt(v) {
        if (!isFinite(v)) return "Erro";
        var r = Math.round(v * 1e10) / 1e10;
        return String(r).replace(".", ",");
      }
      function evalExpr(src) {
        var pos = 0, s = src.replace(/\s+/g, "");
        function peek() { return s.charAt(pos); }
        function num() {
          var m = /^\d*\.?\d*/.exec(s.slice(pos));
          if (!m || !m[0] || m[0] === ".") throw new Error("n");
          pos += m[0].length; return parseFloat(m[0]);
        }
        function factor() {
          var c = peek(), v;
          if (c === "-") { pos++; return -factor(); }
          if (c === "+") { pos++; return factor(); }
          if (c === "r") { pos++; v = factor(); if (v < 0) throw new Error("r"); return Math.sqrt(v); }
          if (c === "(") { pos++; v = expr_(); if (peek() !== ")") throw new Error(")"); pos++; }
          else v = num();
          while (peek() === "%" || peek() === "^") {
            if (peek() === "%") { pos++; v = v / 100; }
            else { pos++; var e = factor(); v = Math.pow(v, e); }
          }
          return v;
        }
        function term() {
          var v = factor();
          while (peek() === "*" || peek() === "/") {
            var op = s.charAt(pos++), r = factor();
            if (op === "*") v *= r; else { if (r === 0) throw new Error("0"); v /= r; }
          }
          return v;
        }
        function expr_() {
          var v = term();
          while (peek() === "+" || peek() === "-") { var op = s.charAt(pos++), r = term(); v = op === "+" ? v + r : v - r; }
          return v;
        }
        var out = expr_();
        if (pos < s.length) throw new Error("x");
        return out;
      }
      function pretty(e) { return e.replace(/\*/g, "×").replace(/\//g, "÷").replace(/-/g, "−").replace(/\./g, ",").replace(/r/g, "√"); }
      function live() {
        exprEl.textContent = pretty(expr);
        if (!expr) { resEl.textContent = "0"; return; }
        try { resEl.textContent = fmt(evalExpr(expr)); } catch (e) { if (e.message === "0") resEl.textContent = "Divisão por zero"; }
      }
      function press(k) {
        if (k === "C") { expr = ""; justEq = false; live(); return; }
        if (k === "BS") { expr = expr.slice(0, -1); justEq = false; live(); return; }
        if (k === "NEG") { expr = expr ? (expr.charAt(0) === "-" ? expr.slice(1) : "-" + expr) : "-"; live(); return; }
        if (k === "=") {
          if (!expr) return;
          try {
            var v = evalExpr(expr), t = fmt(v);
            if (!isFinite(v)) throw new Error("x");
            hist.unshift(pretty(expr) + " = " + t); hist = hist.slice(0, 6);
            histEl.innerHTML = hist.map(function (h) { return "<div>" + escapeHtml(h) + "</div>"; }).join("");
            exprEl.textContent = pretty(expr) + " ="; resEl.textContent = t;
            expr = String(Math.round(v * 1e10) / 1e10); justEq = true;
          } catch (e) { resEl.textContent = e.message === "0" ? "Divisão por zero" : "Erro"; }
          return;
        }
        var isOp = /^[+\-*\/^%]/.test(k);
        if (justEq && !isOp && k !== "r" && k !== "(") expr = "";
        justEq = false;
        if (k === "r") { expr = expr ? "r(" + expr + ")" : "r("; live(); return; }
        if (k === "^2") { if (expr) expr += "^2"; live(); return; }
        if (/^[+*\/]$/.test(k) && (!expr || /[+\-*\/]$/.test(expr))) { if (expr && !/^[-+]?$/.test(expr)) expr = expr.slice(0, -1) + k; live(); return; }
        if (k === "." ) { var last = expr.split(/[^0-9.]/).pop(); if (last.indexOf(".") !== -1) return; if (!last) expr += "0"; }
        expr += k; live();
      }
      var keys = document.getElementById("bc-keys");
      if (keys) keys.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) press(b.getAttribute("data-k")); });
      overlay.addEventListener("keydown", function (e) {
        var panel = document.getElementById("panel-basic");
        if (!panel || panel.style.display === "none") return;
        var t = e.target; if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
        var k = e.key;
        if (t && t.tagName === "BUTTON" && (k === "Enter" || k === " ")) return;
        if (/^[0-9()+\-*\/%]$/.test(k)) { press(k); e.preventDefault(); }
        else if (k === "," || k === ".") { press("."); e.preventDefault(); }
        else if (k === "Enter" || k === "=") { press("="); e.preventDefault(); }
        else if (k === "Backspace") { press("BS"); e.preventDefault(); }
        else if (k === "Escape" && expr) { /* deixa fechar o modal */ }
        else if (k === "c" || k === "C") { press("C"); }
      });
    })();

    /* ---- Infusão contínua ---- */
    (function () {
      var PRE = [
        ["Noradrenalina", "ug/kg/min", 4, "mg", 250, "0,01–3 µg/kg/min (usual 0,05–1)"],
        ["Adrenalina", "ug/kg/min", 4, "mg", 250, "0,01–1 µg/kg/min"],
        ["Dopamina", "ug/kg/min", 250, "mg", 250, "2–20 µg/kg/min"],
        ["Dobutamina", "ug/kg/min", 250, "mg", 250, "2,5–20 µg/kg/min"],
        ["Nitroprussiato", "ug/kg/min", 50, "mg", 250, "0,3–10 µg/kg/min (proteger da luz; uso curto)"],
        ["Nitroglicerina", "ug/min", 50, "mg", 250, "5–200 µg/min"],
        ["Vasopressina", "U/min", 20, "U", 100, "0,01–0,04 U/min"],
        ["Midazolam", "mg/kg/h", 50, "mg", 100, "0,02–0,2 mg/kg/h"],
        ["Fentanil", "ug/kg/h", 500, "ug", 100, "0,7–10 µg/kg/h"],
        ["Propofol 1%", "ug/kg/min", 1000, "mg", 100, "5–50 µg/kg/min (sem diluir: 10 mg/mL)"],
        ["Dexmedetomidina", "ug/kg/h", 200, "ug", 50, "0,2–1,4 µg/kg/h"],
        ["Insulina regular", "U/kg/h", 100, "U", 100, "0,05–0,1 U/kg/h (1 U/mL)"],
        ["Heparina", "U/kg/h", 25000, "U", 250, "12–18 U/kg/h (100 U/mL) — conforme nomograma"]
      ];
      var $ = function (id) { return document.getElementById(id); };
      var box = $("inf-presets");
      if (!box) return;
      box.innerHTML = PRE.map(function (x, i) { return '<button type="button" data-p="' + i + '">' + x[0] + "</button>"; }).join("");
      function num(id) { var v = parseFloat($(id).value); return isFinite(v) ? v : NaN; }
      function fmt(x) { return (Math.abs(x) < 1 ? Math.round(x * 10000) / 10000 : Math.round(x * 100) / 100).toString().replace(".", ","); }
      function parseUnit(u) {
        var a = u.split("/"); return { mass: a[0], kg: a.indexOf("kg") !== -1, time: a[a.length - 1] };
      }
      function perHour(dose, u, peso) {
        var x = dose * (u.kg ? peso : 1);
        return u.time === "min" ? x * 60 : x;
      }
      function toAmt(valMass, from, to) {
        if (from === to) return valMass;
        if (from === "mg" && to === "ug") return valMass * 1000;
        if (from === "ug" && to === "mg") return valMass / 1000;
        return NaN;
      }
      function calc() {
        var peso = num("inf-peso"), dose = num("inf-dose"), amt = num("inf-amt"), vol = num("inf-vol"), rate = num("inf-rate");
        var u = parseUnit($("inf-dunit").value), au = $("inf-aunit").value, out = $("inf-result"), inv = $("inf-inv");
        if (!(amt > 0 && vol > 0)) { out.innerHTML = ""; inv.innerHTML = ""; return; }
        var conc = amt / vol; // unidade do preparo por mL
        var okMass = (u.mass === "U") === (au === "U");
        if (!okMass) { out.innerHTML = '<div class="calc-note">A unidade da dose (' + u.mass.replace("ug", "µg") + ") e a unidade do preparo (" + au.replace("ug", "µg") + ") são incompatíveis.</div>"; inv.innerHTML = ""; return; }
        if (u.kg && !(peso > 0)) { out.innerHTML = '<div class="calc-note">Informe o peso para doses por kg.</div>'; inv.innerHTML = ""; return; }
        var concDoseMass = toAmt(conc, au, u.mass); // massa na unidade da dose por mL
        var html = "", rows = [];
        rows.push(["Concentração", fmt(conc) + " " + au.replace("ug", "µg") + "/mL"]);
        if (dose > 0) {
          var perH = perHour(dose, u, peso);          // massa (unidade da dose) por hora
          var mlh = perH / concDoseMass;
          rows.push(["Velocidade", "<strong>" + fmt(mlh) + " mL/h</strong>"]);
          rows.push(["Macrogotas (20 gt/mL)", fmt(mlh * 20 / 60) + " gt/min"]);
          rows.push(["Microgotas (60 gt/mL)", fmt(mlh) + " mgt/min"]);
          rows.push(["Duração do frasco", fmt(vol / mlh) + " h"]);
        }
        out.innerHTML = '<div class="calc-result">' + rows.map(function (r) { return '<div><span class="calc-label">' + r[0] + '</span><span class="calc-value">' + r[1] + "</span></div>"; }).join("") + "</div>";
        if (rate > 0) {
          var dpH = rate * concDoseMass; // massa/hora na unidade da dose
          var back = u.time === "min" ? dpH / 60 : dpH;
          if (u.kg && peso > 0) back = back / peso;
          inv.innerHTML = '<div class="calc-result"><div><span class="calc-label">Dose correspondente</span><span class="calc-value"><strong>' + fmt(back) + " " + $("inf-dunit").selectedOptions[0].text + "</strong></span></div></div>";
        } else inv.innerHTML = "";
      }
      Array.prototype.forEach.call(overlay.querySelectorAll("#panel-inf input, #panel-inf select"), function (el) { el.addEventListener("input", calc); el.addEventListener("change", calc); });
      box.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        var x = PRE[parseInt(b.getAttribute("data-p"), 10)];
        Array.prototype.forEach.call(box.querySelectorAll("button"), function (y) { y.classList.toggle("active", y === b); });
        $("inf-dunit").value = x[1]; $("inf-amt").value = x[2]; $("inf-aunit").value = x[3]; $("inf-vol").value = x[4];
        $("inf-note").textContent = x[0] + " — faixa usual: " + x[5] + ". Preparo-padrão sugerido (" + x[2] + " " + x[3].replace("ug", "µg") + " em " + x[4] + " mL); confirme no protocolo da sua instituição e use bomba de infusão.";
        calc();
      });
    })();

    function numv(id) { var el = document.getElementById(id); var v = el ? parseFloat(el.value) : NaN; return isFinite(v) ? v : 0; }
    function box(rows, warn) {
      return '<div class="calc-result">' + rows.map(function (r) { return '<div><span class="calc-label">' + r[0] + '</span><span class="calc-value">' + r[1] + "</span></div>"; }).join("") + "</div>" + (warn ? '<p class="calc-note">' + warn + "</p>" : "");
    }
    function f1(x) { return (Math.round(x * 10) / 10).toString().replace(".", ","); }
    function f0(x) { return Math.round(x).toString(); }
    function calcRenal() {
      var out = document.getElementById("rn-out");
      var age = numv("rn-age"), wt = numv("rn-wt"), cr = numv("rn-cr"), fem = document.getElementById("rn-sex").value === "F";
      if (!age || !cr) { out.innerHTML = '<p class="calc-note">Informe idade e creatinina.</p>'; return; }
      var k = fem ? 0.7 : 0.9, a = fem ? -0.241 : -0.302;
      var egfr = 142 * Math.pow(Math.min(cr / k, 1), a) * Math.pow(Math.max(cr / k, 1), -1.2) * Math.pow(0.9938, age) * (fem ? 1.012 : 1);
      var rows = [["CKD-EPI 2021", f1(egfr) + " mL/min/1,73 m²"]];
      if (wt) { var cg = (140 - age) * wt / (72 * cr) * (fem ? 0.85 : 1); rows.unshift(["Cockcroft-Gault", f1(cg) + " mL/min"]); }
      var g = egfr >= 90 ? "G1" : egfr >= 60 ? "G2" : egfr >= 45 ? "G3a" : egfr >= 30 ? "G3b" : egfr >= 15 ? "G4" : "G5";
      rows.push(["Estágio (KDIGO)", g]);
      out.innerHTML = box(rows, "Não use em injúria renal aguda (creatinina instável) nem em gestantes.");
    }
    function calcImc() {
      var out = document.getElementById("im-out");
      var wt = numv("im-wt"), htcm = numv("im-ht"), age = numv("im-age"), wc = numv("im-wc"), fem = document.getElementById("im-sex").value === "F";
      if (!wt || !htcm) { out.innerHTML = '<p class="calc-note">Informe peso e altura.</p>'; return; }
      var ht = htcm / 100, imc = wt / (ht * ht), sc = Math.sqrt(htcm * wt / 3600), idoso = age >= 60;
      var c = idoso
        ? (imc < 22 ? "Baixo peso (Lipschitz)" : imc <= 27 ? "Eutrofia (Lipschitz)" : "Sobrepeso (Lipschitz)")
        : (imc < 16 ? "Magreza grau III" : imc < 17 ? "Magreza grau II" : imc < 18.5 ? "Magreza grau I" : imc < 25 ? "Eutrofia" : imc < 30 ? "Sobrepeso (pré-obesidade)" : imc < 35 ? "Obesidade grau I" : imc < 40 ? "Obesidade grau II" : "Obesidade grau III");
      var lo = idoso ? 22 : 18.5, hi = idoso ? 27 : 24.9;
      var pol = htcm / 2.54, rows = [["IMC", f1(imc) + " kg/m²"], ["Classificação", c], ["Faixa de peso saudável", f1(lo * ht * ht) + " a " + f1(hi * ht * ht) + " kg"]];
      if (pol >= 60) {
        var ideal = (fem ? 45.5 : 50) + 2.3 * (pol - 60);
        rows.push(["Peso ideal (Devine)", f1(ideal) + " kg"]);
        if (imc >= 30) rows.push(["Peso ajustado (obesidade)", f1(ideal + 0.4 * (wt - ideal)) + " kg"]);
      }
      rows.push(["Superfície corporal (Mosteller)", (Math.round(sc * 100) / 100).toString().replace(".", ",") + " m²"]);
      if (wc) {
        var t1 = fem ? 80 : 94, t2 = fem ? 88 : 102;
        rows.push(["Circunferência abdominal", wc < t1 ? "Normal (< " + t1 + " cm)" : wc < t2 ? "Risco aumentado (≥ " + t1 + " cm)" : "Risco muito aumentado (≥ " + t2 + " cm)"]);
      }
      var warn = age && age < 20 ? "Menor de 20 anos: o IMC adulto não se aplica. Use a aba IMC infantil." : "";
      out.innerHTML = box(rows) + (warn ? '<p class="calc-warning">' + warn + "</p>" : "");
    }
    var whoParsed = null;
    function whoLms(sexKey, months) {
      if (!whoParsed) {
        whoParsed = {};
        ["M", "F"].forEach(function (k) { whoParsed[k] = WHO_BMI[k].split(";").map(function (r) { return r.split(",").map(parseFloat); }); });
      }
      return whoParsed[sexKey][months];
    }
    function normCdf(z) {
      var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2);
      var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      return z > 0 ? 1 - p : p;
    }
    function calcImcPed() {
      var out = document.getElementById("ip-out");
      var wt = numv("ip-wt"), htcm = numv("ip-ht"), mo = Math.round(numv("ip-y") * 12 + numv("ip-m")), key = document.getElementById("ip-sex").value;
      var ageSet = document.getElementById("ip-y").value !== "" || document.getElementById("ip-m").value !== "";
      if (!wt || !htcm || !ageSet) { out.innerHTML = '<p class="calc-note">Informe sexo, idade, peso e estatura.</p>'; return; }
      if (mo > 228) { out.innerHTML = '<p class="calc-warning">Acima de 19 anos use a aba IMC adulto.</p>'; return; }
      var ht = htcm / 100, imc = wt / (ht * ht), p = whoLms(key, mo), L = p[0], M = p[1], S = p[2];
      var z = (Math.pow(imc / M, L) - 1) / (L * S), pct = normCdf(z) * 100;
      var cls;
      if (mo < 60) cls = z < -3 ? "Magreza acentuada" : z < -2 ? "Magreza" : z <= 1 ? "Eutrofia" : z <= 2 ? "Risco de sobrepeso" : z <= 3 ? "Sobrepeso" : "Obesidade";
      else cls = z < -3 ? "Magreza acentuada" : z < -2 ? "Magreza" : z <= 1 ? "Eutrofia" : z <= 2 ? "Sobrepeso" : z <= 3 ? "Obesidade" : "Obesidade grave";
      function atZ(zz) { return M * Math.pow(1 + L * S * zz, 1 / L); }
      var bLo = atZ(-2), bHi = atZ(1);
      var pctTxt = pct < 0.1 ? "< 0,1" : pct > 99.9 ? "> 99,9" : f1(pct);
      var rows = [["IMC", f1(imc) + " kg/m²"], ["Escore z (IMC/idade)", (Math.round(z * 100) / 100).toString().replace(".", ",")], ["Percentil", pctTxt], ["Classificação", cls],
        ["IMC adequado para a idade", f1(bLo) + " a " + f1(bHi) + " kg/m² (−2 a +1 DP)"],
        ["Peso adequado nesta estatura", f1(bLo * ht * ht) + " a " + f1(bHi * ht * ht) + " kg"]];
      var warn = Math.abs(z) > 5 ? "Escore z fora de ±5: confira peso, estatura e idade." : "";
      out.innerHTML = box(rows) + (warn ? '<p class="calc-warning">' + warn + "</p>" : "");
    }
    function calcCv() {
      var out = document.getElementById("cv-out");
      var age = numv("cv-age"), tc = numv("cv-tc"), hdl = numv("cv-hdl"), sbp = numv("cv-sbp");
      if (!age || !tc || !hdl || !sbp) { out.innerHTML = '<p class="calc-note">Informe idade, colesterol total, HDL-c e pressão sistólica.</p>'; return; }
      var o = { fem: document.getElementById("cv-sex").value === "F", age: age, tc: tc, hdl: hdl, sbp: sbp,
        treated: document.getElementById("cv-trt").value === "1", smoker: document.getElementById("cv-smk").value === "1",
        dm: document.getElementById("cv-dm").value === "1", black: document.getElementById("cv-race").value === "1" };
      var pctf = function (r) { return f1(r * 100) + " %"; };
      var rows = [];
      if (age >= 30 && age <= 74) {
        var r1 = cvErg(o), p1 = r1 * 100;
        var cat = p1 < 5 ? "Baixo" : (o.fem ? (p1 <= 10 ? "Intermediário" : "Alto") : (p1 <= 20 ? "Intermediário" : "Alto"));
        rows.push(["Risco global em 10 anos (SBC)", pctf(r1)], ["Categoria de risco (SBC)", cat]);
      } else rows.push(["Risco global (SBC)", "Fora da faixa de validade (30-74 anos)"]);
      if (age >= 40 && age <= 79) {
        var r2 = cvPce(o), p2 = r2 * 100;
        var cat2 = p2 < 5 ? "Baixo (< 5 %)" : p2 < 7.5 ? "Limítrofe (5 a 7,4 %)" : p2 < 20 ? "Intermediário (7,5 a 19,9 %)" : "Alto (≥ 20 %)";
        rows.push(["ASCVD em 10 anos (ACC/AHA)", pctf(r2)], ["Categoria ASCVD", cat2]);
      } else rows.push(["ASCVD (ACC/AHA)", "Fora da faixa de validade (40-79 anos)"]);
      var warn = (tc < 130 || tc > 320 || hdl < 20 || hdl > 100 || sbp < 90 || sbp > 200) ? "Algum valor está fora da faixa validada dos modelos (CT 130-320, HDL 20-100, PAS 90-200): interprete com cautela." : "";
      out.innerHTML = box(rows) + (warn ? '<p class="calc-warning">' + warn + "</p>" : "");
    }
    function calcFluid() {
      var wt = numv("fl-wt"), o = document.getElementById("fl-hs-out");
      if (!wt) o.innerHTML = '<p class="calc-note">Informe o peso.</p>';
      else {
        var day = wt <= 10 ? wt * 100 : wt <= 20 ? 1000 + (wt - 10) * 50 : 1500 + (wt - 20) * 20;
        o.innerHTML = box([["Volume/dia", f0(day) + " mL"], ["Vazão", f1(day / 24) + " mL/h"]]);
      }
      var pw = numv("pk-wt"), ps = numv("pk-sc"), po = document.getElementById("fl-pk-out");
      if (!pw || !ps) po.innerHTML = '<p class="calc-note">Informe peso e % de superfície queimada.</p>';
      else { var t = 4 * pw * ps; po.innerHTML = box([["Total em 24 h", f0(t) + " mL"], ["Primeiras 8 h", f0(t / 2) + " mL (" + f1(t / 2 / 8) + " mL/h)"], ["16 h seguintes", f0(t / 2) + " mL (" + f1(t / 2 / 16) + " mL/h)"]]); }
      var gv = numv("gt-vol"), gh = numv("gt-h"), go = document.getElementById("fl-gt-out");
      if (!gv || !gh) go.innerHTML = '<p class="calc-note">Informe volume e tempo.</p>';
      else go.innerHTML = box([["Macrogotas", f0(gv / (gh * 3)) + " gotas/min"], ["Microgotas", f0(gv / gh) + " microgotas/min"], ["Vazão", f1(gv / gh) + " mL/h"]]);
    }
    function calcCort() {
      var out = document.getElementById("co-out"), dose = numv("co-dose"), sel = document.getElementById("co-drug");
      if (!dose) { out.innerHTML = '<p class="calc-note">Informe a dose.</p>'; return; }
      var pred = dose / parseFloat(sel.value) * 5;
      var names = [["Prednisona/Prednisolona", 5], ["Metilprednisolona", 4], ["Hidrocortisona", 20], ["Dexametasona", 0.75], ["Betametasona", 0.6]];
      out.innerHTML = box(names.map(function (n) { return [n[0], (Math.round(pred / 5 * n[1] * 100) / 100).toString().replace(".", ",") + " mg"]; }));
    }
    Array.prototype.forEach.call(overlay.querySelectorAll("[data-fsub]"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(overlay.querySelectorAll("[data-fsub]"), function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var s = btn.getAttribute("data-fsub");
        ["hs", "pk", "gt"].forEach(function (k) { document.getElementById("fl-" + k).style.display = k === s ? "block" : "none"; });
      });
    });
    calcRenal(); calcImc(); calcImcPed(); calcCv(); calcFluid(); calcCort();
    overlay.addEventListener("input", function (e) {
      if (e.target.closest("#panel-renal")) calcRenal();
      if (e.target.closest("#panel-imc")) calcImc();
      if (e.target.closest("#panel-imcp")) calcImcPed();
      if (e.target.closest("#panel-cv")) calcCv();
      if (e.target.closest("#panel-fluid")) calcFluid();
      if (e.target.closest("#panel-cort")) calcCort();
    });
    overlay.addEventListener("change", function (e) {
      if (e.target.closest("#panel-renal")) calcRenal();
      if (e.target.closest("#panel-imc")) calcImc();
      if (e.target.closest("#panel-imcp")) calcImcPed();
      if (e.target.closest("#panel-cv")) calcCv();
      if (e.target.closest("#panel-cort")) calcCort();
    });
    overlay.addEventListener("input", function (e) {
      if (e.target.closest("#panel-ga")) { calcDum(); calcUsg(); }
    });
    overlay.addEventListener("change", function (e) {
      if (e.target.closest("#panel-ga")) { calcDum(); calcUsg(); }
    });
  }

  /* ---------------- Wiring ---------------- */

  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target && e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
    var si = document.getElementById("search-input");
    if (si) { e.preventDefault(); si.focus(); si.select(); }
  });

  var calcBtn = document.getElementById("calc-btn");
  if (calcBtn) calcBtn.addEventListener("click", openCalcModal);


  /* ---------------- Barra de abas inferior (estilo iOS) ---------------- */
  (function () {
    var bar = document.getElementById("tabbar"), sheet = document.getElementById("sheet");
    function sync() {
      if (!bar) return;
      var home = viewMode === "meds" && !selectedId && !searchInput.value.trim();
      Array.prototype.forEach.call(bar.querySelectorAll("[data-tb]"), function (b) {
        var k = b.getAttribute("data-tb");
        var on = k === "home" ? home : k === "meds" ? (viewMode === "meds" && !home) : k === "more" ? ["meds", "plantao", "diseases"].indexOf(viewMode) === -1 : viewMode === k;
        b.classList.toggle("on", on);
      });
    }
    window.__bbTabSync = sync;
    function go(k) {
      if (k === "close") { sheet.hidden = true; return; }
      if (k === "more") { sheet.hidden = false; return; }
      sheet.hidden = true;
      if (k === "fs") { var f = document.getElementById("fs-btn"); if (f) f.click(); return; }
      if (k === "home") { selectedId = null; searchTerm = ""; searchInput.value = ""; classFilter = ""; espFilter = ""; bigArea = ""; switchViewMode("meds"); document.body.classList.add("showing-detail", "bb-home"); detailEl.scrollTop = 0; sync(); return; }
      document.body.classList.remove("bb-home");
      switchViewMode(k); sync();
    }
    document.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest(".med-item, .gs-item, .cov-row, .back-btn")) { document.body.classList.remove("bb-home"); setTimeout(sync, 0); }
      var b = e.target && e.target.closest ? e.target.closest("[data-tb]") : null;
      if (b) { e.preventDefault(); go(b.getAttribute("data-tb")); return; }
      if (e.target === sheet) sheet.hidden = true;
    });
    searchInput.addEventListener("input", function () { if (document.body.classList.contains("bb-home")) document.body.classList.remove("showing-detail", "bb-home"); sync(); });
    setTimeout(function () { if (viewMode === "meds" && !selectedId) document.body.classList.add("showing-detail", "bb-home"); sync(); }, 0);
  })();
  /* ---------------- Tamanho do texto (zoom da interface) ---------------- */
  (function () {
    var LEVELS = [1, 1.15, 1.3, 1.45], btn = document.getElementById("fs-btn"), lbl = document.getElementById("fs-lbl");
    function cur() { return parseFloat(document.documentElement.style.zoom) || 1.15; }
    function show() {
      var pct = Math.round(cur() * 100) + "%";
      if (lbl) lbl.textContent = pct;
      // nome acessível inclui o texto visível ("Aa 115%") e informa o tamanho atual
      if (btn) btn.setAttribute("aria-label", "Tamanho do texto: Aa " + pct + " (toque para alternar)");
    }
    show();
    if (btn) btn.addEventListener("click", function () {
      var c = cur(), i = 0; for (var k = 0; k < LEVELS.length; k++) if (Math.abs(LEVELS[k] - c) < 0.01) i = k;
      var n = LEVELS[(i + 1) % LEVELS.length];
      document.documentElement.style.zoom = String(n);
      try { window.localStorage.setItem("bluebook:zoom", String(n)); } catch (e) {}
      show();
    });
  })();
  var settingsBtn = document.getElementById("settings-btn");
  if (settingsBtn) settingsBtn.addEventListener("click", openSettingsModal);
  var seedBtn = document.getElementById("seed-btn");
  if (seedBtn) {
    seedBtn.textContent = "Carregar biblioteca (" + SEED_MEDS.length + ")";
    seedBtn.addEventListener("click", function () {
      seedBtn.disabled = true;
      var original = seedBtn.textContent;
      seedBtn.textContent = "Carregando...";
      runSeed().then(function () {
        seedBtn.textContent = "Feito";
        setTimeout(function () { seedBtn.textContent = original; seedBtn.disabled = false; }, 1500);
      }).catch(function (err) {
        console.error(err);
        seedBtn.textContent = original;
        seedBtn.disabled = false;
        alert("Não foi possível carregar agora. Tente novamente.");
      });
    });
  }
  searchInput.addEventListener("input", function () {
    if (REFS[viewMode]) {
      REFS[viewMode].st.term = searchInput.value;
      REFS[viewMode].side();
    } else if (viewMode === "atb") {
      atbSearchTerm = searchInput.value;
      renderAtbSidebar();
    } else if (viewMode === "rx") {
      searchTerm = searchInput.value;
      renderRxSidebar();
    } else if (viewMode === "scores") {
      scoreSearchTerm = searchInput.value;
      renderScoreSidebar();
    } else if (viewMode === "diseases") {
      diseaseSearchTerm = searchInput.value;
      renderDiseaseSidebar();
    } else {
      searchTerm = searchInput.value;
      renderSidebar();
    }
  });
  /* Enter na busca: mantém o filtro e abre o primeiro resultado. */
  searchInput.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    e.preventDefault(); histAdd(searchInput.value);
    if (REFS[viewMode]) {
      var R = REFS[viewMode];
      R.st.term = searchInput.value;
      var rf = R.filt();
      if (rf.length) { R.st.sel = rf[0].id; document.body.classList.add("showing-detail"); }
    } else if (viewMode === "atb") {
      atbSearchTerm = searchInput.value;
      var al = filteredAtb();
      if (al.length) { selectedAtbId = al[0].id; document.body.classList.add("showing-detail"); }
    } else if (viewMode === "rx") {
      searchTerm = searchInput.value;
      var rl = filteredSorted();
      if (rl.length && RX.indexOf(rl[0].nome) === -1) { RX.push(rl[0].nome); rxSave(); }
    } else if (viewMode === "scores") {
      scoreSearchTerm = searchInput.value;
      var sl = filteredScores();
      if (sl.length) { selectedScoreId = sl[0].id; document.body.classList.add("showing-detail"); }
    } else if (viewMode === "diseases") {
      diseaseSearchTerm = searchInput.value;
      var dl = filteredDiseases();
      if (dl.length) { selectedDiseaseIdx = dl[0]._idx; document.body.classList.add("showing-detail"); }
    } else {
      searchTerm = searchInput.value;
      var ml = filteredSorted();
      if (ml.length) { selectedId = ml[0].id; document.body.classList.add("showing-detail"); }
    }
    render();
    searchInput.blur();
  });
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "class-filter") {
      classFilter = e.target.value;
      renderSidebar();
    }
    if (e.target && e.target.id === "esp-filter") { espFilter = e.target.value; render(); }
    if (e.target && e.target.id === "disease-area-filter") {
      diseaseAreaFilter = e.target.value;
      renderDiseaseSidebar();
    }
  });

  var tabMeds = document.getElementById("tab-meds");
  var tabDiseases = document.getElementById("tab-diseases");
  if (tabMeds) tabMeds.addEventListener("click", function () { switchViewMode("meds"); });
  if (tabDiseases) tabDiseases.addEventListener("click", function () { switchViewMode("diseases"); });
  var expBtn = document.getElementById("export-notes-btn");
  if (expBtn) expBtn.addEventListener("click", exportNotes);
  ["plantao", "vac", "flux", "ecg", "cid", "calc", "lab"].forEach(function (m) {
    var t = document.getElementById("tab-" + m);
    if (t) t.addEventListener("click", function () { switchViewMode(m); });
  });
  var tabAtb = document.getElementById("tab-atb");
  if (tabAtb) tabAtb.addEventListener("click", function () { switchViewMode("atb"); });
  var tabRx = document.getElementById("tab-rx");
  if (tabRx) tabRx.addEventListener("click", function () { switchViewMode("rx"); });
  var tabScores = document.getElementById("tab-scores");
  if (tabScores) tabScores.addEventListener("click", function () { switchViewMode("scores"); });

  var favFilterBtn = document.getElementById("fav-filter-btn");
  if (favFilterBtn) {
    favFilterBtn.addEventListener("click", function () {
      favOnly = !favOnly;
      favFilterBtn.setAttribute("aria-pressed", favOnly ? "true" : "false");
      render();
    });
  }

  /* Acessibilidade: Esc fecha (do mais recente para o mais antigo) janela modal, folha "Mais" ou menu ⋮
     e devolve o foco a um ponto lógico. */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var ovs = document.querySelectorAll(".modal-overlay");
    if (ovs.length) { ovs[ovs.length - 1].remove(); e.preventDefault(); return; }
    var sh = document.getElementById("sheet");
    if (sh && !sh.hidden) {
      sh.hidden = true; e.preventDefault();
      var mb = document.querySelector('#tabbar [data-tb="more"]'); if (mb) mb.focus();
      return;
    }
    var mm = document.getElementById("more-menu"), mbtn = document.getElementById("more-btn");
    if (mm && !mm.hidden) { mm.hidden = true; if (mbtn) { mbtn.setAttribute("aria-expanded", "false"); mbtn.focus(); } e.preventDefault(); }
  });
  /* Acessibilidade: ao abrir a folha "Mais" pelo teclado, o foco vai para o primeiro item. */
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest('#tabbar [data-tb="more"]') : null;
    if (!b) return;
    setTimeout(function () { var sh = document.getElementById("sheet"); if (sh && !sh.hidden && e.detail === 0) { var f = sh.querySelector("button"); if (f) f.focus(); } }, 0);
  });

  var moreBtn = document.getElementById("more-btn");
  var moreMenu = document.getElementById("more-menu");
  if (moreBtn && moreMenu) {
    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !moreMenu.hidden;
      moreMenu.hidden = open;
      moreBtn.setAttribute("aria-expanded", open ? "false" : "true");
    });
    moreMenu.addEventListener("click", function (e) {
      if (e.target.closest(".menu-item")) {
        moreMenu.hidden = true;
        moreBtn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", function (e) {
      if (!moreMenu.hidden && !e.target.closest(".menu-wrap")) {
        moreMenu.hidden = true;
        moreBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  render();
  initStore();

  /* Desempenho: prepara os índices de busca (texto normalizado + trigramas) em pedaços, no tempo ocioso
     após a abertura, para que a primeira tecla não pague esse custo. Não altera nada visível. */
  (function () {
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(function () { fn({ timeRemaining: function () { return 8; } }); }, 50); };
    var fila = null, pos = 0;
    function montarFila() {
      gsBuild();
      fila = [];
      medications.forEach(function (m) { fila.push(function () { matchRec(m, medHay(m), "zz"); }); });
      DISEASES.forEach(function (d) { fila.push(function () { matchRec(d, disHay(d), "zz"); }); });
      [GS.m, GS.d, GS.s, GS.a].concat(Object.keys(GS.r).map(function (k) { return GS.r[k]; })).forEach(function (lst) {
        lst.forEach(function (e) { fila.push(function () { hayOf(e, "bloom", function () { return bloomOf(e.h); }); }); });
      });
    }
    function passo(dl) {
      if (!medications.length) { setTimeout(function () { idle(passo); }, 500); return; }   // espera a biblioteca carregar
      if (!fila) montarFila();
      while (pos < fila.length && dl.timeRemaining() > 2) fila[pos++]();
      if (pos < fila.length) idle(passo);
    }
    setTimeout(function () { idle(passo); }, 800);
  })();
})();
