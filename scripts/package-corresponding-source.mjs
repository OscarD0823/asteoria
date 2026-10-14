import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import{createRequire}from'node:module';
const directory=path.resolve(process.argv[2]??''),output=path.resolve(process.argv[3]??'dist/ASTEORIA-2.0.0-Corresponding-Source.tar.gz');
const components=[['mupdf-1.28.1','https://github.com/ArtifexSoftware/mupdf','20061bd45183f5a2bff8f43675e4da91e5ac2901'],['hyperformula-3.5.0','https://github.com/handsontable/hyperformula','99a45ea1d7ee88755607d8ae0153fb6d13efc36c'],['hunspell-1.6.2','https://github.com/hunspell/hunspell','2730ad3d32d839f439ba7f286e3600cd9294a978'],['hunspell-asm-4.0.2','https://github.com/kwonoj/hunspell-asm','b8e719f61e8f5fde76b31e48f42d241383d9790e'],['docker-hunspell-wasm-fc6a952-200131','https://github.com/kwonoj/docker-hunspell-wasm','fc6a952fd11ae95f4bce4118c1b41f5bee3d91d1'],['citeproc-js-2.4.63','https://github.com/Juris-M/citeproc-js','73bc1b44bc7d54d0bfec4e070fd27f5efe024ff9']];
const git=(cwd,args)=>{const r=spawnSync('git',args,{cwd,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();};
for(const [folder,,commit] of components)if(git(path.join(directory,folder),['rev-parse','HEAD'])!==commit)throw Error('Revisión inesperada: '+folder);
const dossier=path.join(directory,'asteoria-build-notes');fs.mkdirSync(dossier,{recursive:true});
fs.cpSync('patches',path.join(dossier,'patches'),{recursive:true});
for(const name of ['mupdf','hyperformula','hunspell-asm','citeproc','emscripten-wasm-loader']){
 const source=fs.realpathSync(name==='emscripten-wasm-loader'?path.dirname(createRequire(fs.realpathSync('node_modules/hunspell-asm/package.json')).resolve(name+'/package.json')):path.join('node_modules',name));
 fs.cpSync(source,path.join(dossier,'npm-installed',name),{recursive:true,dereference:true,filter:p=>!path.relative(source,p).split(path.sep).includes('node_modules')});
}
const submodules=git(path.join(directory,'mupdf-1.28.1'),['submodule','status','--recursive']);
if(submodules.split('\n').some(line=>/^[+-]/.test(line)))throw Error('MuPDF tiene submódulos incompletos o modificados.');
fs.writeFileSync(path.join(dossier,'MuPDF-submodules.txt'),submodules+'\n');
fs.copyFileSync('public/third-party/odict-schema-LICENSE.txt',path.join(dossier,'GPL-3.0.txt'));
fs.writeFileSync(path.join(dossier,'README.md'),`# Fuentes acompañantes de ASTEORIA 2.0.0 BETA

Se conservan las licencias y avisos originales de cada componente. El código de ASTEORIA, sus ocho módulos, las adaptaciones de fórmulas, parches y datos de diccionarios/fuentes se entrega por separado en el archivo Source de cada aplicación. Este complemento contiene los árboles upstream completos fijados y las copias npm usadas. No incluye claves de firma ni documentos de usuarios.

- MuPDF 1.28.1: árbol C y submódulos, wrapper TS/C en platform/wasm, Makefiles y tools/build.sh. Ese script fija Emscripten 4.0.8 y las opciones reales. Desde platform/wasm: npm install; npm run prepack, con EMSDK configurado y herramientas make/bash/compilador disponibles.
- HyperFormula 3.5.0: fuentes TypeScript, configuraciones y scripts; npm ci; npm run bundle-all. ASTEORIA elige GPLv3 mediante licenseKey gpl-v3. Integración propia en los módulos de Orbit; no se modifica este árbol upstream.
- Hunspell v1.6.2: motor C++; el constructor docker-hunspell-wasm fc6a952-200131 fija este origen y la imagen Emscripten en Dockerfile y .circleci/config.yml. Las recetas originales están incluidas. Wrapper hunspell-asm v4.0.2: bootstrap.ts y npm run build / build:lib. Los dos parches nanoid de ASTEORIA están en patches y en el archivo Source propio.
- citeproc 2.4.63: commit npm gitHead, fuentes JS y herramientas originales; versión del motor 1.4.63. Se elige la alternativa AGPL-3.0-or-later ofrecida por su LICENSE; package.json declara una etiqueta distinta que se conserva como dato original.

Los motores precompilados fueron copiados de los paquetes fijados en el lock de ASTEORIA. Este archivo facilita su modificación y las recetas disponibles; no se ha demostrado reconstrucción bit a bit del WASM con estas herramientas. Los paquetes npm de referencia se guardan en npm-installed. Los diccionarios aff/dic y sus licencias, las fuentes tipográficas y sus datos de derivación están en el Source propio.

MuPDF usa AGPL; HyperFormula GPLv3; Hunspell conserva sus alternativas GPL/LGPL/MPL; wrapper Hunspell MIT; citeproc permite CPAL o AGPL3+. Cada árbol conserva sus propios avisos. Las identidades de marca no reemplazan los créditos de terceros.
`);
const roots=[...components.map(c=>c[0]),'asteoria-build-notes'],files=[];
const scan=(dir)=>{for(const item of fs.readdirSync(dir,{withFileTypes:true})){if(item.name==='.git'||item.name==='node_modules')continue;const full=path.join(dir,item.name);if(item.isDirectory())scan(full);else if(item.isFile()){const b=fs.readFileSync(full);files.push({file:path.relative(directory,full).replaceAll('\\','/'),bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});}}};for(const root of roots)scan(path.join(directory,root));
const manifest={schemaVersion:1,product:'ASTEORIA',version:'2.0.0',channel:'beta',components:components.map(([folder,repository,commit])=>({folder,repository,commit})),files};
fs.writeFileSync(path.join(directory,'SOURCE-MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');fs.mkdirSync(path.dirname(output),{recursive:true});
const r=spawnSync(process.platform==='win32'?'tar.exe':'tar',['-czf',output,'--exclude=.git','--exclude=*/.git','--exclude=*/node_modules','-C',directory,'SOURCE-MANIFEST.json',...roots],{stdio:'inherit'});if(r.status!==0)throw Error('No se pudo crear el archivo de fuentes correspondientes.');
console.log(JSON.stringify({output,files:files.length,bytes:fs.statSync(output).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex')}));
