import fs from 'node:fs';import path from 'node:path';import {spawnSync}from'node:child_process';
import {appKinds,appPath} from './workspace-core.mjs';
const root=process.cwd();
const run=args=>{const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);};
run(['scripts/bundle-prisma-engines.mjs']);
const files=[];
for(const base of [path.join(root,'tests'),...appKinds.map(kind=>path.join(appPath(root,kind),'tests'))]){
 if(!fs.existsSync(base))continue;
 for(const file of fs.readdirSync(base))if(file.endsWith('.test.ts'))files.push(path.join(base,file));
}
if(files.length<35)throw Error('Faltan repositorios o pruebas en el entorno.');
run(['node_modules/tsx/dist/cli.mjs','--tsconfig','tsconfig.json','--test',...files.sort()]);
run(['--test',...fs.readdirSync('tests').filter(f=>f.endsWith('.test.mjs')).map(f=>'tests/'+f)]);
