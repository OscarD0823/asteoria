import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {appKinds,appPath,assertKind,publicationTargets,validateOwnership,fingerprint} from './workspace-core.mjs';
import {pushSourceRevision} from './publish-source.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const command=process.argv[2]??'status',args=process.argv.slice(3);
const run=(exe,args,cwd=root,env={})=>{const r=spawnSync(exe,args,{cwd,env:{...process.env,...env},stdio:'inherit'});if(r.status!==0)throw Error('Falló '+exe+' '+args.join(' '));};
const git=(cwd,...args)=>{const r=spawnSync('git',args,{cwd,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();};
const lockFile=path.join(root,'workspace.lock.json');
const lock=JSON.parse(fs.readFileSync(lockFile,'utf8'));
const localFile=path.join(root,'.prisma-local.json');
const local=fs.existsSync(localFile)?JSON.parse(fs.readFileSync(localFile,'utf8')):{};
function sync(){
 const refs={};
 for(let i=0;i<args.length;i++)if(['--use','--ref'].includes(args[i])){
  const flag=args[i],value=args[++i],at=value?.indexOf('=')??-1;
  if(at<1)throw Error('Usa '+flag+' aplicación=valor.');
  const kind=assertKind(value.slice(0,at));if(kind==='prisma')throw Error('Selecciona un editor.');
  if(flag==='--use')local[kind]=path.resolve(value.slice(at+1));else refs[kind]=value.slice(at+1);
 }
 const latest=args.includes('--latest');
 fs.mkdirSync(path.join(root,'.prisma','apps'),{recursive:true});
 for(const kind of appKinds){
  const destination=appPath(root,kind),item=lock.apps[kind];
  if(local[kind]){
   const source=fs.realpathSync(local[kind]);
   if(!fs.existsSync(path.join(source,'src','entry.tsx')))throw Error('Repositorio sin editor: '+source);
   if(source===root||source.startsWith(path.join(root,'.prisma')))throw Error('Enlace circular del entorno.');
   if(fs.existsSync(destination)&&fs.realpathSync(destination)!==source)throw Error('Ya existe otro repositorio en '+destination);
   if(!fs.existsSync(destination))fs.symlinkSync(source,destination,process.platform==='win32'?'junction':'dir');
  }else if(!fs.existsSync(destination)){
   run('git',['clone','--filter=blob:none','--no-checkout','https://github.com/'+item.repository+'.git',destination]);
   run('git',['checkout','--detach',refs[kind]??(latest?'origin/main':item.commit)],destination);
  }else if(!fs.existsSync(path.join(destination,'.git'))){
   const archiveFile=path.join(root,'workspace-source.json');
   const archive=fs.existsSync(archiveFile)?JSON.parse(fs.readFileSync(archiveFile,'utf8')):undefined;
   if(!archive?.sources?.[kind]||!fs.existsSync(path.join(destination,'src','entry.tsx')))throw Error('Módulo sin Git ni procedencia de fuente: '+kind);
   if(refs[kind]&&refs[kind]!==archive.sources[kind])throw Error('La revisión solicitada no coincide con el archivo de fuentes.');
  }else if(refs[kind]||latest||git(destination,'rev-parse','HEAD')!==item.commit){
   if(git(destination,'status','--porcelain'))throw Error('Hay cambios sin guardar en '+kind+'; no se actualizará.');
   run('git',['fetch','origin','main'],destination);
   run('git',['checkout','--detach',refs[kind]??(latest?'origin/main':item.commit)],destination);
  }
  // External local checkouts need access to the same dependency installation.
  const modules=path.join(destination,'node_modules');
  if(local[kind]&&!fs.existsSync(modules)&&fs.existsSync(path.join(root,'node_modules')))fs.symlinkSync(path.join(root,'node_modules'),modules,process.platform==='win32'?'junction':'dir');
  fs.mkdirSync(path.join(destination,'.prisma'),{recursive:true});
  fs.writeFileSync(path.join(destination,'.prisma','tsconfig.json'),JSON.stringify({extends:path.join(root,'tsconfig.json')},null,2)+'\n');
 }
 if(Object.keys(local).length)fs.writeFileSync(localFile,JSON.stringify(local,null,2)+'\n');
 console.log('Un entorno; ocho módulos de aplicación enlazados.');
}
function sources(){return {prisma:git(root,'rev-parse','HEAD'),...Object.fromEntries(appKinds.map(kind=>[kind,git(appPath(root,kind),'rev-parse','HEAD')]))};}
if(command==='sync')sync();
else if(command==='status'){
 for(const kind of ['prisma',...appKinds]){const dir=kind==='prisma'?root:appPath(root,kind);console.log(kind+': '+(fs.existsSync(dir)?git(dir,'status','--short')||'limpio':'sin clonar'));}
}else if(command==='validate')console.log(validateOwnership(root,JSON.parse(fs.readFileSync('workspace-ownership.json')))+' módulos, sin copias duplicadas.');
else if(command==='stamp'){
 const commits=sources(),hash=fingerprint(commits),kind=assertKind(args[0]??'prisma');
 const output={schemaVersion:1,kind,fingerprint:hash,sources:commits};
 fs.mkdirSync('.prisma',{recursive:true});fs.writeFileSync('.prisma/build.json',JSON.stringify(output,null,2)+'\n');
 console.log(hash);
}else if(command==='dev'){
 const kind=assertKind(args[0]??'prisma');
 run(process.execPath,['scripts/prepare-assets.mjs'],root,{VITE_PRODUCT:kind});
 run(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',process.env.PRISMA_PORT??'4188'],root,{VITE_PRODUCT:kind});
}else if(command==='publish'){
 const selected=args.filter(arg=>!arg.startsWith('--'));selected.forEach(assertKind);
 const changed=[];
 for(const kind of appKinds){
  const dir=appPath(root,kind);
  if(git(dir,'status','--porcelain'))throw Error('Primero confirma los cambios de '+kind+' con git commit.');
  const commit=git(dir,'rev-parse','HEAD');
  if((!selected.length||selected.includes(kind))&&commit!==lock.apps[kind].commit){console.log(pushSourceRevision(dir));lock.apps[kind].commit=commit;changed.push(kind);}
 }
 if(changed.length){fs.writeFileSync(lockFile,JSON.stringify(lock,null,2)+'\n');run('git',['add','workspace.lock.json']);run('git',['commit','-m','Actualizar aplicaciones: '+changed.join(', ')]);}
 if(git(root,'status','--porcelain'))throw Error('Primero confirma los cambios del núcleo con git commit.');
 console.log(pushSourceRevision(root));
 const targets=publicationTargets(selected.includes('prisma')||!selected.length?['prisma']:selected);
 run(process.execPath,['scripts/publish-pages.mjs',...targets]);
 console.log('La versión general y las independientes usarán los mismos módulos.');
}else throw Error('Comando desconocido: '+command);
