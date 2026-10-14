import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {Readable,Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
const catalog=JSON.parse(fs.readFileSync('vendor/lore-neural/models.json'));
const output=path.resolve(process.env.ASTEORIA_BUNDLED_VOICES||'.prisma/voices');
const selection=process.argv.slice(2),defaults=['es_AR-daniela-high','es_ES-sharvard-medium'];
const models=catalog.filter((v,i,all)=>all.findIndex(x=>x.model===v.model)===i&&(selection.includes('--all')||(!selection.length?defaults:selection).includes(v.model)));
if(!models.length)throw Error('Selecciona IDs de modelos de vendor/lore-neural/models.json, o --all.');
fs.mkdirSync(output,{recursive:true});
for(const model of models){
 const file=path.join(output,model.model+'.onnx');
 if(fs.existsSync(file)){const b=fs.readFileSync(file);if(b.length===model.bytes&&createHash('sha256').update(b).digest('hex')===model.sha256){console.log('Verificada: '+model.model);continue;}throw Error('Ya existe un archivo distinto: '+file);}
 const r=await fetch(model.url);if(!r.ok||!r.body)throw Error('No se pudo descargar '+model.model);
 const hash=createHash('sha256');let bytes=0;const temporary=file+'.partial';
 try{await pipeline(Readable.fromWeb(r.body),new Transform({transform(chunk,_encoding,next){bytes+=chunk.length;if(bytes>model.bytes)return next(Error('Tamaño de voz no válido.'));hash.update(chunk);next(null,chunk);}}),fs.createWriteStream(temporary,{flags:'wx'}));
 if(bytes!==model.bytes||hash.digest('hex')!==model.sha256)throw Error('Voz incompleta o hash distinto: '+model.model);
 fs.renameSync(temporary,file);console.log('Descargada y verificada: '+model.model);
 }catch(e){if(fs.existsSync(temporary))fs.unlinkSync(temporary);throw e;}
}
