import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pushSourceRevision} from '../scripts/publish-source.mjs';
import {activeEntry,appKinds,appPath,fingerprint,moduleAliases,publicationTargets,validateOwnership} from '../scripts/workspace-core.mjs';
test('las versiones sueltas y Prisma resuelven exactamente el mismo módulo de cada aplicación',()=>{
 const root=process.cwd();for(const kind of appKinds){const entry=activeEntry(root,kind);assert.equal(path.dirname(entry),moduleAliases(root)['@prisma/'+kind]);assert.ok(fs.existsSync(entry));}
 assert.equal(activeEntry(root,'prisma'),path.join(root,'src','PrismaRouter.tsx'));
 const app=fs.readFileSync('src/App.tsx','utf8');assert.ok(app.includes("import('@prisma/active-app')"));assert.ok(!app.includes("import('@prisma/data/Data')"));
});
test('los propietarios del código son únicos y todos los módulos migrados existen',()=>{
 const count=validateOwnership(process.cwd(),JSON.parse(fs.readFileSync('workspace-ownership.json')));assert.ok(count>140);
});
test('un programa publica también Prisma; cambios compartidos publican las siete aplicaciones',()=>{
 assert.deepEqual(publicationTargets(['sheets']),['prisma','sheets']);assert.equal(publicationTargets(['prisma']).length,7);assert.throws(()=>publicationTargets(['../../x']));assert.throws(()=>appPath('/tmp','../pdf'));
});
test('la huella cambia con el código, no con el orden de los repositorios',()=>{
 assert.equal(fingerprint({prisma:'1',sheets:'2'}),fingerprint({sheets:'2',prisma:'1'}));assert.notEqual(fingerprint({prisma:'1',sheets:'2'}),fingerprint({prisma:'1',sheets:'3'}));
});
test('la validación detecta código copiado entre dos aplicaciones',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'prisma-ownership-'));try{fs.mkdirSync(path.join(root,'src'));for(const kind of appKinds)fs.mkdirSync(path.join(appPath(root,kind),'src'),{recursive:true});fs.writeFileSync(path.join(appPath(root,'pdf'),'src','copy.ts'),'');fs.writeFileSync(path.join(appPath(root,'writer'),'src','copy.ts'),'');assert.throws(()=>validateOwnership(root,{modules:{}}),/duplicado/);}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('publicar desde una versión fijada actualiza main y rechaza conflictos sin forzar',()=>{
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'prisma-publish-')),remote=path.join(base,'remote.git'),local=path.join(base,'local');
 const git=(cwd,args)=>{const r=spawnSync('git',args,{cwd,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();};
 try{
  git(base,['init','--bare',remote]);git(base,['clone',remote,local]);git(local,['checkout','-b','main']);
  const commit=text=>{fs.writeFileSync(path.join(local,'code.txt'),text);git(local,['add','code.txt']);git(local,['-c','user.name=Prueba','-c','user.email=prisma@example.invalid','commit','-m',text]);return git(local,['rev-parse','HEAD']);};
  const original=commit('base');pushSourceRevision(local);git(local,['checkout','--detach',original]);const latest=commit('función nueva');pushSourceRevision(local);
  assert.equal(git(remote,['rev-parse','refs/heads/main']),latest);
  git(local,['checkout','--detach',original]);const conflict=commit('cambio divergente');assert.throws(()=>pushSourceRevision(local));
  assert.equal(git(remote,['rev-parse','refs/heads/main']),latest);assert.equal(git(local,['rev-parse','HEAD']),conflict);
 }finally{if(!path.resolve(base).startsWith(path.resolve(os.tmpdir())+path.sep))throw Error('Ruta temporal no válida.');fs.rmSync(base,{recursive:true,force:true});}
});
