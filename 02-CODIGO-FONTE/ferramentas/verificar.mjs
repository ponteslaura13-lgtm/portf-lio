import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../site');
const root=process.argv[2]?path.resolve(process.argv[2]):defaultRoot;
const report={ok:false,pasta:root,arquivos:0,bytes:0,javascriptVerificado:0,referenciasLocaisVerificadas:0,referenciasDinamicasIgnoradas:[],avisos:[],erros:[]};
const seen=new Set(),skipped=new Set();
const relative=filename=>path.relative(root,filename).split(path.sep).join('/');
function list(folder){return readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?list(path.join(folder,entry.name)):entry.isFile()?[path.join(folder,entry.name)]:[])}
function exactCase(filename){
 const parts=path.relative(root,filename).split(path.sep);let folder=root;
 for(const part of parts){if(!readdirSync(folder).includes(part))return false;folder=path.join(folder,part)}return true;
}
function checkSyntax(code,label){
 try{execFileSync(process.execPath,['--input-type=module','--check'],{input:code,encoding:'utf8',stdio:['pipe','pipe','pipe'],maxBuffer:2*1024*1024});report.javascriptVerificado++}
 catch(error){report.erros.push({arquivo:label,tipo:'sintaxe',detalhe:String(error.stderr||error.message).slice(0,1000)})}
}
let basePath='/';
function reference(value,filename,kind='document'){
 value=value.trim().replace(/&amp;/g,'&');
 if(!value||value.startsWith('#')||/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value))return;
 if(value.includes('${')||value.includes('{{')){skipped.add(`${relative(filename)}: ${value}`);return}
 let urlPath;try{urlPath=decodeURIComponent(value.split(/[?#]/,1)[0])}catch{report.erros.push({arquivo:relative(filename),tipo:'url-invalida',referencia:value});return}
 if(!urlPath)return;
 let base=kind==='module'||kind==='css'?path.dirname(filename):root;
 if(urlPath.startsWith('/')){
  if(basePath!=='/'&&urlPath.startsWith(basePath))urlPath=urlPath.slice(basePath.length);
  else urlPath=urlPath.slice(1);
  base=root;
 }
 let target=path.resolve(base,urlPath);
 if(target!==root&&!target.startsWith(root+path.sep)){report.erros.push({arquivo:relative(filename),tipo:'fora-da-pasta',referencia:value});return}
 if(target===root||(existsSync(target)&&statSync(target).isDirectory()))target=path.join(target,'index.html');
 const key=`${relative(filename)}|${target}`;if(seen.has(key))return;seen.add(key);report.referenciasLocaisVerificadas++;
 if(!existsSync(target))report.erros.push({arquivo:relative(filename),tipo:'arquivo-ausente',referencia:value});
 else if(!exactCase(target))report.erros.push({arquivo:relative(filename),tipo:'maiusculas-minusculas',referencia:value});
}
try{
 if(process.argv.length>3)throw Error('Uso: node ferramentas/verificar.mjs [pasta-do-site]');
 if(!existsSync(path.join(root,'index.html')))throw Error('index.html não encontrado na raiz do site.');
 const index=readFileSync(path.join(root,'index.html'),'utf8');
 const canonical=index.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
 if(canonical){try{basePath=new URL(canonical).pathname}catch{report.erros.push({arquivo:'index.html',tipo:'canonical-invalido'})}}
 else report.avisos.push('Domínio ainda não configurado. Execute CONFIGURAR-DOMINIO.mjs antes da publicação definitiva para completar canonical, metadados sociais e sitemap.');
 const files=list(root);report.arquivos=files.length;report.bytes=files.reduce((sum,file)=>sum+statSync(file).size,0);
 for(const file of files){
  const ext=path.extname(file).toLowerCase();if(!['.html','.css','.js','.mjs','.json','.xml','.txt'].includes(ext))continue;
  const text=readFileSync(file,'utf8'),label=relative(file);
  if(/\b(?:localhost|127\.0\.0\.1)(?=[:/\s"']|$)|\b[A-Z]:[\\/]/i.test(text))report.erros.push({arquivo:label,tipo:'caminho-local-na-publicacao'});
  if(/https?:\/\/[^\s<>"']*\.chatgpt\.site(?:[\/\s<>"']|$)/i.test(text))report.erros.push({arquivo:label,tipo:'dominio-sites-antigo'});
  if(['.js','.mjs'].includes(ext))checkSyntax(text,label);
  if(['.html','.js','.mjs'].includes(ext)){
   for(const match of text.matchAll(/\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi))reference(match[2],file);
   for(const match of text.matchAll(/\b(?:fetch|new\s+URL)\s*\(\s*(["'])(.*?)\1/g))reference(match[2],file);
   for(const match of text.matchAll(/(["'])(\.?\/?assets\/[^"'\r\n]+)\1/g))reference(match[2],file);
  }
  if(['.js','.mjs'].includes(ext)){
   for(const match of text.matchAll(/^\s*(?:import\s+(?:[^;\n]*?\s+from\s*)?|export\s+[^;\n]*?\s+from\s*)(["'])([^"']+)\1/gm))reference(match[2],file,'module');
   for(const match of text.matchAll(/\bimport\s*\(\s*(["'])([^"']+)\1/g))reference(match[2],file,'module');
  }
  if(ext==='.css'){
   for(const match of text.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi))reference(match[2],file,'css');
   for(const match of text.matchAll(/@import\s*(["'])([^"']+)\1/gi))reference(match[2],file,'css');
  }
  if(ext==='.html')for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
   if(!/\bsrc\s*=|application\/ld\+json|application\/json/i.test(match[1])&&match[2].trim())checkSyntax(match[2],label+' (script interno)');
  }
 }
 report.referenciasDinamicasIgnoradas=[...skipped];
 if(skipped.size)report.avisos.push('Referências com variáveis são verificadas no navegador; elas não são tratadas como arquivos literais ausentes.');
 report.ok=report.erros.length===0;
}catch(error){report.erros.push({tipo:'verificacao',detalhe:error.message})}
console.log(JSON.stringify(report,null,2));process.exitCode=report.ok?0:1;
