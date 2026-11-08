/* Service worker do Bluebook: guarda o app inteiro no aparelho para uso 100% offline.
   O marcador de VERSAO abaixo é trocado pelo build por um hash do conteúdo; qualquer mudança no app gera
   um cache novo, e o antigo é apagado na ativação. */
'use strict';
var VERSAO = '__VERSAO__';
var CACHE = 'bluebook-' + VERSAO;
var ARQUIVOS = [
  './index.html',
  './manifest.json',
  './icones/icone-192.png',
  './icones/icone-512.png',
  './icones/apple-touch-icon.png',
  './icones/favicon-32.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ARQUIVOS.map(function (u) { return new Request(u, { cache: 'reload' }); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('bluebook-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // links externos (ex.: Bulário Anvisa) seguem pela rede
  if (req.mode === 'navigate') {
    // Qualquer navegação dentro do escopo abre o app guardado (funciona sem internet).
    e.respondWith(caches.match('./index.html').then(function (r) { return r || fetch(req); }));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (r) { return r || fetch(req); }));
});
