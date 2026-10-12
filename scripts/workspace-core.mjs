import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const appKinds=['pdf','writer','sheets','slides','data','publisher'];
export function assertKind(kind){if(!appKinds.includes(kind)&&kind!=='prisma')throw Error('Aplicación desconocida: '+kind);return kind;}
export function appPath(root,kind){assertKind(kind);if(kind==='prisma')throw Error('Prisma es la raíz del entorno.');return path.join(root,'.prisma','apps',kind);}
export function activeEntry(root,kind){assertKind(kind);return kind==='prisma'?path.join(root,'src','PrismaRouter.tsx'):path.join(appPath(root,kind),'src','entry.tsx');}
export function moduleAliases(root){return Object.fromEntries(['core',...appKinds].map(kind=>['@prisma/'+kind,kind==='core'?path.join(root,'src'):path.join(appPath(root,kind),'src')]));}
export function fingerprint(sources){const normalized=Object.fromEntries(Object.entries(sources).sort(([a],[b])=>a.localeCompare(b)));return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');}
export function publicationTargets(changed){changed.forEach(assertKind);return changed.includes('prisma')?['prisma',...appKinds]:['prisma',...appKinds.filter(kind=>changed.includes(kind))];}
export function validateOwnership(root,ownership){
 const seen=new Map();
 for(const owner of ['core',...appKinds]){
  const base=owner==='core'?path.join(root,'src'):path.join(appPath(root,owner),'src');
  const scan=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const full=path.join(dir,entry.name);if(entry.isDirectory()){scan(full);continue;}
   const relative=path.relative(base,full).replaceAll('\\','/');if(relative==='entry.tsx')continue;
   if(seen.has(relative))throw Error('Código duplicado entre repositorios: '+relative);
   seen.set(relative,owner);
  }};scan(base);
 }
 for(const [file,owner]of Object.entries(ownership.modules))if(seen.get(file)!==owner)throw Error('Propietario incorrecto o módulo ausente: '+file);
 return seen.size;
}
