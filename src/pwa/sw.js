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

/* Atualização (v73): a versão nova é baixada inteira em segundo plano e fica ESPERANDO. Ela só assume quando
   a pessoa toca em "Atualizar" (mensagem ATUALIZAR, enviada por src/atualiza.js) ou quando todas as janelas do
   app são fechadas — nunca troca o app por baixo de uma consulta aberta. Na 1ª instalação (sem versão anterior
   ativa) assume na hora, para o app já funcionar offline. */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ARQUIVOS.map(function (u) { return new Request(u, { cache: 'reload' }); })); })
      .then(function () { if (!self.registration.active) return self.skipWaiting(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data && e.data.tipo === 'ATUALIZAR') self.skipWaiting();
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
