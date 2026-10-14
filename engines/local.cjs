function localUrl(value){const url=new URL(value);if(!['http:','https:'].includes(url.protocol)||!['127.0.0.1','[::1]','localhost'].includes(url.hostname)||url.username||url.password)throw new Error('El motor debe estar en localhost, 127.0.0.1 o ::1.');if(url.hostname==='localhost')url.hostname='127.0.0.1';url.hash='';url.search='';return url;}
function documentBytes(value){if(typeof value!=='string'||value.length>112*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(value))throw new Error('Documento local no válido.');const bytes=Buffer.from(value,'base64');if(!bytes.length||bytes.length>80*1024*1024)throw new Error('Usa documentos de hasta 80 MB.');return bytes;}
async function capabilities(){return {local:true,engines:[{id:'prisma',name:'Prisma',available:true,formats:['docx','docm','xlsx','xlsm','pptx','pptm'],features:['inspect','preserve','text','csv']},{id:'stirling',name:'Stirling PDF',available:false,service:true},{id:'openproject',name:'OpenProject',available:false,service:true}]};}
async function serviceStatus(payload){const base=localUrl(payload.url),route=payload.engine==='stirling'?'/api/v1/info/status':payload.engine==='openproject'?'/api/v3':'/healthcheck';const response=await fetch(new URL(route,base),{headers:headers(payload),redirect:'error',signal:AbortSignal.timeout(7000)});return {available:response.ok,status:response.status};}
function headers(payload){if(!payload.apiKey)return {};if(typeof payload.apiKey!=='string'||payload.apiKey.length>4096)throw new Error('La clave del motor no es válida.');return payload.engine==='openproject'?{Authorization:'Basic '+Buffer.from('apikey:'+payload.apiKey).toString('base64')}:{'X-API-KEY':payload.apiKey};}
async function run(payload){
 if(!['prisma','stirling','openproject'].includes(payload.engine))throw new Error('Este motor no forma parte de Prisma.');
 if(payload.action==='status')return payload.engine==='prisma'?{available:true}:serviceStatus(payload);
 if(payload.engine==='openproject'){const base=localUrl(payload.url),response=await fetch(new URL('/api/v3/projects?pageSize=100',base),{headers:headers(payload),redirect:'error',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('OpenProject respondió '+response.status);const body=await response.json();return {projects:(body._embedded?.elements??[]).map(project=>({id:project.id,name:project.name,description:project.description?.raw??''}))};}
 const bytes=documentBytes(payload.bytes);
 if(payload.engine==='prisma'){
  const engine=require('./dist/formats.cjs'),result=await engine.processDocument(bytes,payload.extension,payload.action==='convert'?payload.format:'original');
  return {...result,bytes:Buffer.from(result.bytes).toString('base64')};
 }
 if(payload.engine==='stirling'){
  const base=localUrl(payload.url),form=new FormData();form.set('fileInput',new Blob([bytes],{type:'application/pdf'}),'documento.pdf');form.set('optimizeLevel',String(Math.min(5,Math.max(1,Number(payload.level)||2))));
  const response=await fetch(new URL('/api/v1/misc/compress-pdf',base),{method:'POST',body:form,headers:headers(payload),redirect:'error',signal:AbortSignal.timeout(120000)});if(!response.ok)throw new Error('Stirling respondió '+response.status);const result=Buffer.from(await response.arrayBuffer());if(result.length>80*1024*1024||result.subarray(0,5).toString()!=='%PDF-')throw new Error('El motor no devolvió un PDF válido.');return {bytes:result.toString('base64'),extension:'pdf'};
 }
 throw new Error('Operación no disponible.');
}
module.exports={localUrl,documentBytes,capabilities,run};
