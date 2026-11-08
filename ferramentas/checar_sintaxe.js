// Uso: node ferramentas/checar_sintaxe.js [dist/index.html]
// Confere se todos os blocos <script> do app são JavaScript válido.
const fs=require('fs'),path=require('path');
const f=process.argv[2]||path.join(__dirname,'..','dist','index.html');
const s=fs.readFileSync(f,'utf8');const re=/<script[^>]*>([\s\S]*?)<\/script>/g;let m,n=0,err=0;
while((m=re.exec(s))){try{new Function(m[1]);n++}catch(e){err++;console.log('ERRO:',e.message)}}
console.log(err?'FALHOU':'OK',n,'scripts');process.exit(err?1:0);
