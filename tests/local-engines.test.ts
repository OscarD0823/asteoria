import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {createServer} from 'node:http';
const require=createRequire(import.meta.url),local=require('../engines/local.cjs'),{startLocalEngine}=require('../engines/server.cjs');
test("Auralis local adapters preserve XLSM bytes and export recalculated CSV without launching a suite",async()=>{
 const {default:ExcelJS}=await import('exceljs'),{unzipSync,zipSync}=await import('fflate');
 const book=new ExcelJS.Workbook(),sheet=book.addWorksheet('Prueba');sheet.addRow(['Nombre','Valor']);sheet.addRow(['ñ, €',12]);sheet.addRow(['Total',{formula:'SUM(B2:B2)',result:0}]);book.addWorksheet('Segunda').getCell('A1').value='Se conserva';
 const original=new Uint8Array(await book.xlsx.writeBuffer()),parts=unzipSync(original);parts['xl/vbaProject.bin']=new Uint8Array([1,2,3,4]);const bytes=Buffer.from(zipSync(parts));
 const payload={engine:'prisma',extension:'xlsm',bytes:bytes.toString('base64')};
 const retained=await local.run(payload);assert.equal(retained.sheets,2);assert.equal(retained.extension,'xlsm');assert.deepEqual(Buffer.from(retained.bytes,'base64'),bytes);
 const csv=await local.run({...payload,action:'convert',format:'csv'});assert.equal(csv.extension,'csv');assert.match(Buffer.from(csv.bytes,'base64').toString('utf8'),/"ñ, €",12/);assert.match(Buffer.from(csv.bytes,'base64').toString('utf8'),/Total,12/);
 await assert.rejects(local.run({...payload,action:'convert',format:'pdf'}),/no está disponible/);
});
test('Removed document suites cannot be selected or invoked through the PC API',async()=>{
 const capabilities=await local.capabilities();assert(capabilities.engines.some((e:{id:string})=>e.id==='prisma'));
 for(const engine of ['document-builder','onlyoffice','euro-office']){
  assert(!capabilities.engines.some((e:{id:string})=>e.id===engine));
  await assert.rejects(local.run({engine,action:'status',url:'http://127.0.0.1:1'}),/no forma parte/);
 }
});
test('PC bridge restricts endpoints and origins, authenticates and preserves local PPTX',async()=>{
 for(const url of ['https://example.com','file:///x','http://127.0.0.1.evil.test','http://user:pass@localhost'])assert.throws(()=>local.localUrl(url));
 const {server,port,token}=await startLocalEngine();try{
 const base='http://127.0.0.1:'+port,headers={Origin:'http://127.0.0.1:4305',Authorization:'Bearer '+token,'Content-Type':'application/json'};
 assert.equal((await fetch(base+'/capabilities',{headers:{...headers,Origin:'https://example.com'}})).status,403);assert.equal((await fetch(base+'/capabilities',{headers:{Origin:headers.Origin}})).status,401);
 const engine=require('../engines/dist/pptx.cjs'),bytes=await engine.createBlankPptx(),response=await fetch(base+'/run',{method:'POST',headers,body:JSON.stringify({engine:'prisma',extension:'pptx',bytes:Buffer.from(bytes).toString('base64')})}),result=await response.json();assert.equal(response.status,200);assert.equal(result.slides,1);assert.deepEqual(Buffer.from(result.bytes,'base64'),Buffer.from(bytes));
 }finally{await new Promise<void>(r=>server.close(()=>r()));}
});
test('PC bridge keeps an operation locked when capabilities are read concurrently',async()=>{
 let release:()=>void=()=>{},entered:()=>void=()=>{};const ready=new Promise<void>(r=>entered=r),hold=new Promise<void>(r=>release=r);
 const service=createServer(async(_q,res)=>{entered();await hold;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({_embedded:{elements:[{id:1,name:'Proyecto local'}]}}));});await new Promise<void>(r=>service.listen(0,'127.0.0.1',r));
 const {server,port,token}=await startLocalEngine(),headers={Origin:'http://127.0.0.1:4305',Authorization:'Bearer '+token,'Content-Type':'application/json'},body=JSON.stringify({engine:'openproject',url:'http://127.0.0.1:'+(service.address() as any).port});try{
 const pending=fetch('http://127.0.0.1:'+port+'/run',{method:'POST',headers,body});await ready;assert.equal((await fetch('http://127.0.0.1:'+port+'/capabilities',{headers})).status,200);assert.equal((await fetch('http://127.0.0.1:'+port+'/run',{method:'POST',headers,body})).status,409);release();assert.equal((await (await pending).json()).projects[0].name,'Proyecto local');
 }finally{release();await Promise.all([new Promise<void>(r=>server.close(()=>r())),new Promise<void>(r=>service.close(()=>r()))]);}
});
