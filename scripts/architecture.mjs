import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {appPath} from './workspace-core.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),command=process.argv[2]??'dev';
function run(args,env={}){const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit',env:{...process.env,...env,VITE_PRODUCT:'architecture'}});if(result.status!==0)process.exit(result.status??1);}
if(command==='dev')run(['scripts/workspace.mjs','dev','architecture']);
else if(command==='build'||command==='desktop') {
 run(['scripts/build-product.mjs','architecture'],{PRISMA_OUTDIR:process.env.PRISMA_OUTDIR??path.join(root,'dist-arquitectura')});
 if(command==='desktop')run(['node_modules/electron-builder/cli.js','--config','electron-builder-architecture.yml','--win','--x64']);
}else if(command==='test')run(['node_modules/tsx/dist/cli.mjs','--tsconfig','tsconfig.json','--test',...['architecture.test.ts','architecture-expanded.test.ts','construction.test.ts'].map(name=>path.join(appPath(root,'architecture'),'tests',name))]);
else if(command==='source'){const output=process.env.PRISMA_OUTDIR??path.join(root,'.prisma','architecture-source');mkdirSync(output,{recursive:true});run(['scripts/package-source.mjs'],{PRISMA_OUTDIR:output});console.log(path.join(output,'prisma-pdf-source.tar.gz'));}
else throw Error('Usa dev, build, desktop, source o test.');
