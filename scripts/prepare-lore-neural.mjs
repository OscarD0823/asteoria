import fs from 'node:fs';
import path from 'node:path';
const output=path.resolve('public/lore-audio/neural');
if(!output.startsWith(path.resolve('public')+path.sep))throw Error('Ruta de recursos no válida.');
fs.rmSync(output,{recursive:true,force:true});
if(!['stories','prisma'].includes(process.env.VITE_PRODUCT??'pdf'))process.exitCode=0;
else{
 fs.mkdirSync(output,{recursive:true});
 const source='vendor/lore-neural';
 for(const name of ['piper_phonemize.wasm','piper_phonemize.data'])fs.copyFileSync(path.join(source,name),path.join(output,name));
 fs.writeFileSync(path.join(output,'piper-module.js'),fs.readFileSync(path.join(source,'piper_phonemize.js'),'utf8')+'\nexport default createPiperPhonemize;\n');
 fs.cpSync(path.join(source,'model-cards'),path.join(output,'model-cards'),{recursive:true});
 fs.cpSync(path.join(source,'licenses'),path.join(output,'licenses'),{recursive:true});
 fs.mkdirSync(path.join(output,'runtime'),{recursive:true});
 for(const name of ['ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'])fs.copyFileSync(path.join('node_modules/onnxruntime-web/dist',name),path.join(output,'runtime',name.replace('.mjs','.js')));
 const models=JSON.parse(fs.readFileSync(path.join(source,'models.json'))),bundled=[];
 // Optional native distributions include verified models without bloating the website.
 if(process.env.ASTEORIA_BUNDLED_VOICES){
  const {createHash}=await import('node:crypto');
  for(const id of ['es_AR-daniela-high','es_ES-sharvard-medium']){
   const model=models.find(v=>v.model===id),file=path.join(process.env.ASTEORIA_BUNDLED_VOICES,id+'.onnx');
   const bytes=fs.readFileSync(file);if(bytes.length!==model.bytes||createHash('sha256').update(bytes).digest('hex')!==model.sha256)throw Error('Modelo integrado no válido: '+id);
   fs.mkdirSync(path.join(output,'models'),{recursive:true});fs.copyFileSync(file,path.join(output,'models',id+'.onnx'));bundled.push(id);
  }
 }
 fs.writeFileSync(path.join(output,'bundled.json'),JSON.stringify(bundled)+'\n');
 console.log(`Lore neuronal: ${models.length} voces · ${bundled.length} modelos integrados.`);
}
