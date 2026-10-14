const fs=require('node:fs/promises'),path=require('node:path'),{fileURLToPath}=require('node:url');
const formats=require('../file-formats.json');
const extensions=kind=>Object.values(kind==='prisma'?formats:formats[kind]??{}).flatMap(value=>typeof value==='object'&&!Array.isArray(value)?Object.values(value).flat():value);
function launchPaths(args,cwd){return args.flatMap(arg=>{if(typeof arg!=='string'||arg.startsWith('--')||arg.startsWith('-')||/^https?:\/\//i.test(arg))return[];try{const target=arg.startsWith('file:')?fileURLToPath(arg):path.resolve(cwd,arg);return extensions('prisma').includes(path.extname(target).toLowerCase())?[target]:[];}catch{return[];}});}
function fileQueue(kind,notify){
 const queue=[];let consuming=false;
 return{
  add(args,cwd){for(const target of launchPaths(args,cwd)){if(queue.length>=20)break;queue.push(target);}if(queue.length)notify();},
  async take(){if(consuming||!queue.length)return null;consuming=true;const target=queue.shift();try{
   const ext=path.extname(target).toLowerCase();if(!extensions(kind).includes(ext))return{error:'Este archivo corresponde a otra aplicación de ASTEORIA. Ábrelo con la suite general o su editor.'};
   const handle=await fs.open(target,'r');try{const stat=await handle.stat();if(!stat.isFile()||stat.size>205*1024*1024)throw Error('Usa un documento local de hasta 205 MB.');return{name:path.basename(target),data:new Uint8Array(await handle.readFile()),lastModified:stat.mtimeMs};}finally{await handle.close();}
  }catch(error){return{error:error.code==='ENOENT'?'El archivo ya no está disponible.':error.message};}finally{consuming=false;}},
 };
}
module.exports={extensions,launchPaths,fileQueue};
