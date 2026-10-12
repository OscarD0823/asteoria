import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {appKinds,appPath,fingerprint} from './workspace-core.mjs';
const root=process.cwd();
export function buildProvenance(){
 const commit=dir=>{const r=spawnSync('git',['rev-parse','HEAD'],{cwd:dir,encoding:'utf8'});if(r.status!==0)return undefined;return r.stdout.trim();};
 const archive=fs.existsSync('workspace-source.json')?JSON.parse(fs.readFileSync('workspace-source.json')):undefined;
 return {schemaVersion:1,sources:{prisma:commit(root)??archive?.sources.prisma,...Object.fromEntries(appKinds.map(kind=>[kind,commit(appPath(root,kind))??archive?.sources[kind]]))}};
}
export function provenancePlugin(kind){
 return {name:'prisma-source-provenance',generateBundle(){
  const sourceKinds=new Set(['prisma',...(kind==='prisma'?appKinds:[kind])]);
  const roots=appKinds.map(app=>[app,fs.realpathSync(appPath(root,app))+path.sep]);
  for(const id of this.getModuleIds())for(const[app,base]of roots)if(id.startsWith(base)||id.startsWith(base.replaceAll('\\','/')))sourceKinds.add(app);
  const provenance=buildProvenance(),dependencies=[...sourceKinds].sort(),sources=provenance.sources;
  const result={...provenance,kind,dependencies,fingerprint:fingerprint(Object.fromEntries(dependencies.map(k=>[k,sources[k]])))};
  this.emitFile({type:'asset',fileName:'workspace-build.json',source:JSON.stringify(result,null,2)+'\n'});
 }};
}
