// Servidor estático local (sem dependências) para testar o dist/.
// Uso: node ferramentas/servir.js [pasta=dist] [porta=8080]
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist'));
const porta = Number(process.argv[3] || process.env.PORT || 8080);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const arq = path.join(raiz, rel);
  if (!arq.startsWith(raiz)) { res.writeHead(403); return res.end(); }
  fs.readFile(arq, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}).listen(porta, '127.0.0.1', () => console.log('Servindo ' + raiz + ' em http://localhost:' + porta));
