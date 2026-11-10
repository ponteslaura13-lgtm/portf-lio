import http from 'node:http';
import {stat,realpath,createReadStream,existsSync,realpathSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const rootCandidate=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../site');
const portText=process.argv[2]||'4180';
if(process.argv.length>3||!/^\d+$/.test(portText)||Number(portText)<1024||Number(portText)>65535){
 console.error('Uso: node ferramentas/servidor-local.mjs [porta entre 1024 e 65535]');process.exit(1);
}
if(!existsSync(path.join(rootCandidate,'index.html'))){console.error('A pasta ../site com index.html não foi encontrada ao lado de ferramentas.');process.exit(1)}
const root=realpathSync(rootCandidate),port=Number(portText);
let basePath='/';
try{const canonical=readFileSync(path.join(root,'index.html'),'utf8').match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];if(canonical)basePath=decodeURIComponent(new URL(canonical).pathname)}catch{}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.ico':'image/x-icon','.m4a':'audio/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.mp4':'video/mp4','.webm':'video/webm','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
const within=value=>value===root||value.startsWith(root+path.sep);
function plain(res,status,text,extra={}){res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store',...extra});res.end(text)}
function sendFile(req,res,file,status=200){
 realpath(file,(realError,realFile)=>{
  if(realError||!within(realFile)){if(status===200)return sendFile(req,res,path.join(root,'404.html'),404);return plain(res,404,'Página não encontrada.');}
  stat(realFile,(error,info)=>{
   if(error||!info.isFile())return plain(res,404,'Página não encontrada.');
   const headers={'Content-Type':types[path.extname(realFile).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
   let start=0,end=info.size-1;
   if(status===200&&req.headers.range){
    const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if(!match||(!match[1]&&!match[2])||info.size===0)return plain(res,416,'Intervalo inválido.',{'Content-Range':`bytes */${info.size}`});
    if(match[1]){start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),info.size-1):info.size-1;}
    else{const suffix=Number(match[2]);if(!Number.isSafeInteger(suffix)||suffix<=0)return plain(res,416,'Intervalo inválido.',{'Content-Range':`bytes */${info.size}`});start=Math.max(0,info.size-suffix);}
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=info.size)return plain(res,416,'Intervalo inválido.',{'Content-Range':`bytes */${info.size}`});
    status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
   }
   headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
   if(req.method==='HEAD'||info.size===0)return res.end();
   const stream=createReadStream(realFile,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);res.on('close',()=>stream.destroy());
  });
 });
}
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method))return plain(res,405,'Método não permitido.',{Allow:'GET, HEAD'});
 let pathname;
 try{pathname=decodeURIComponent((req.url||'/').split(/[?#]/,1)[0])}catch{return plain(res,400,'Endereço inválido.')}
 if(!pathname.startsWith('/')||/[\\\u0000]/.test(pathname)||pathname.split('/').some(segment=>segment.startsWith('.')))return plain(res,403,'Caminho não permitido.');
 if(basePath!=='/'&&pathname===basePath.slice(0,-1)){res.writeHead(308,{Location:basePath,'Cache-Control':'no-store'});return res.end()}
 if(basePath!=='/'&&pathname.startsWith(basePath))pathname='/'+pathname.slice(basePath.length);
 const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
 if(!within(file))return plain(res,403,'Caminho não permitido.');
 sendFile(req,res,file);
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`A porta ${port} já está em uso. Tente outra, por exemplo: node ferramentas/servidor-local.mjs 4181`:error.message);process.exitCode=1});
server.listen(port,'127.0.0.1',()=>console.log(`Prévia local: http://127.0.0.1:${port}${basePath}\nPasta: ${root}\nUse Ctrl+C para encerrar. Não abra o index.html por duplo clique.`));
