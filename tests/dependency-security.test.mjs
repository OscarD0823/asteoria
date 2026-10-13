import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {createRequire} from 'node:module';import {spawnSync,execFileSync} from 'node:child_process';import os from 'node:os';
const require=createRequire(import.meta.url);
const hunspell=createRequire(require.resolve('hunspell-asm'));
const loader=createRequire(hunspell.resolve('emscripten-wasm-loader'));
const pptx=createRequire(require.resolve('pptxgenjs'));
const builder=createRequire(require.resolve('electron-builder'));
const appBuilder=createRequire(builder.resolve('app-builder-lib'));
const download=createRequire(appBuilder.resolve('@electron/get'));
function packageInfo(entry,name){let dir=path.dirname(entry);while(dir!==path.dirname(dir)){const file=path.join(dir,'package.json');if(fs.existsSync(file)){const data=JSON.parse(fs.readFileSync(file));if(data.name===name)return data;}dir=path.dirname(dir);}throw Error('Package not found: '+name);}
function child(code,timeout=4000,env={}){const result=spawnSync(process.execPath,['-e',code],{encoding:'utf8',timeout,maxBuffer:1024*1024,env:{...process.env,...env}});assert.ifError(result.error);assert.equal(result.status,0,result.stderr);return result.stdout;}
test('both Hunspell consumers use the patched Nano ID API and unsafe size triggers terminate',()=>{
 for(const from of [hunspell,loader]){
  const entry=from.resolve('nanoid');assert.equal(packageInfo(entry,'nanoid').version,'3.3.20');
  child(`const assert=require('node:assert/strict'),n=require(${JSON.stringify(entry)}),non=require(${JSON.stringify(from.resolve('nanoid/non-secure'))});
   assert.equal(n.customAlphabet('ab',0)(),'');assert.equal(n.customAlphabet('ab',20)(0),'');assert.equal(non.nanoid(-1),'');
   assert.equal(n.nanoid(1.5).length,1);assert.throws(()=>n.nanoid(2**31),RangeError);
   const id=n.nanoid(45);assert.equal(id.length,45);assert.match(id,/^[A-Za-z0-9_-]+$/);`);
 }
 const workspace=fs.readFileSync('pnpm-workspace.yaml','utf8');assert.match(workspace,/hunspell-asm@4\.0\.2: patches\//);assert.match(workspace,/emscripten-wasm-loader@3\.0\.3: patches\//);
 assert.match(fs.readFileSync('scripts/package-source.mjs','utf8'),/"patches"/);
});
test('patched image parsers reject zero-length ICNS and JXL boxes and preserve legitimate PNG dimensions',()=>{
 const entry=pptx.resolve('image-size');assert.equal(packageInfo(entry,'image-size').version,'2.0.3');
 const jxl=pptx.resolve('image-size/types/jxl');
 child(`const assert=require('node:assert/strict'),{imageSize}=require(${JSON.stringify(entry)}),{JXL}=require(${JSON.stringify(jxl)});
  const icon=Buffer.alloc(16);icon.write('icns');icon.writeUInt32BE(16,4);icon.write('ic07',8);assert.throws(()=>imageSize(icon));
  const partial=Buffer.alloc(16);partial.write('jxlp',4);assert.throws(()=>JXL.calculate(partial));
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6C4sAAAAASUVORK5CYII=','base64');
  assert.deepEqual(imageSize(png),{width:1,height:1,type:'png'});`);
});
test('Electron download proxy uses the maintained implementation with sprintf and Roarr removed from the graph',()=>{
 assert.equal(packageInfo(download.resolve('global-agent'),'global-agent').version,'4.1.3');
 assert.equal(typeof appBuilder('@electron/get').initializeProxy,'function');
 const lock=fs.readFileSync('pnpm-lock.yaml','utf8');assert.doesNotMatch(lock,/^\s{2}(sprintf-js|roarr|nanoid@2|image-size@1)[@\w.:-]*:/m);
});
test('NO_PROXY preserves explicit default ports and absolute request paths',()=>{
 const entry=download.resolve('global-agent');
 child(`(async()=>{
  const assert=require('node:assert/strict'),http=require('node:http'),path=require('node:path');
  const matches=require(path.join(path.dirname(${JSON.stringify(entry)}),'utilities/isUrlMatchingNoProxy.js')).default;
  for(const [url,rule,expected] of [['http://example.test:80/a','example.test:80',true],['https://example.test:443/a','example.test:443',true],['http://example.test/a','example.test:80',true],['http://example.test:81/a','example.test:80',false],['https://example.test/a','example.test:80',false]])assert.equal(matches(url,rule),expected);
  let direct=0,proxied=0;const sockets=new Set();
  const target=http.createServer((req,res)=>{direct++;res.end('direct');}),proxy=http.createServer((req,res)=>{proxied++;res.end('proxy');});
  const listen=server=>new Promise(resolve=>{server.listen(0,'127.0.0.1',resolve);server.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});});
  await Promise.all([listen(target),listen(proxy)]);
  try{
   process.env.GLOBAL_AGENT_HTTP_PROXY='http://127.0.0.1:'+proxy.address().port;process.env.GLOBAL_AGENT_NO_PROXY='example.test:80';process.env.ELECTRON_GET_USE_PROXY='1';
   require(${JSON.stringify(appBuilder.resolve('@electron/get'))}).initializeProxy();
   const get=absolute=>new Promise((resolve,reject)=>{const request=http.get({hostname:'127.0.0.1',port:target.address().port,path:absolute,timeout:1500},res=>{let value='';res.on('data',part=>value+=part);res.on('end',()=>resolve(value));});request.on('error',reject);request.on('timeout',()=>request.destroy(Error('timeout')));});
   assert.equal(await get('http://example.test:80/a'),'direct');assert.equal(direct,1);assert.equal(proxied,0);
   assert.equal(await get('http://example.test:81/a'),'proxy');assert.equal(proxied,1);
  }finally{for(const socket of sockets)socket.destroy();await Promise.all([target,proxy].map(server=>new Promise(resolve=>server.close(resolve))));}
 })().catch(error=>{console.error(error);process.exit(1)});`);
});
test('the Electron download proxy preserves HTTP, verified HTTPS and NO_PROXY behavior',()=>{
 const folder=fs.mkdtempSync(path.join(process.env.PRISMA_SECURITY_TEMP??os.tmpdir(),'prisma-proxy-test-'));
 const key=path.join(folder,'localhost-key.pem'),cert=path.join(folder,'localhost-cert.pem');
 const openssl=process.platform==='win32'&&fs.existsSync('C:/Program Files/Git/usr/bin/openssl.exe')?'C:/Program Files/Git/usr/bin/openssl.exe':'openssl';
 execFileSync(openssl,['req','-x509','-newkey','rsa:2048','-nodes','-sha256','-days','1','-keyout',key,'-out',cert,'-subj','/CN=Prisma-local-test','-addext','subjectAltName=IP:127.0.0.1'],{stdio:'ignore',env:{...process.env,MSYS_NO_PATHCONV:'1',MSYS2_ARG_CONV_EXCL:'*'}});
 const result=child(`(async()=>{
  const assert=require('node:assert/strict'),http=require('node:http'),https=require('node:https'),net=require('node:net'),fs=require('node:fs');
  const directRequest=http.request,directAgent=new http.Agent(),sockets=new Set();
  const target=http.createServer((req,res)=>res.end('http-ok'));
  const secure=https.createServer({key:fs.readFileSync(${JSON.stringify(key)}),cert:fs.readFileSync(${JSON.stringify(cert)})},(req,res)=>res.end('https-ok'));
  let requests=0,tunnels=0;
  const proxy=http.createServer((req,res)=>{
   requests++;const url=new URL(req.url);assert.equal(url.hostname,'127.0.0.1');
   const forwarded=directRequest({hostname:'127.0.0.1',port:target.address().port,path:url.pathname,method:req.method,agent:directAgent},reply=>{res.writeHead(reply.statusCode,reply.headers);reply.pipe(res);});forwarded.on('error',()=>res.destroy());req.pipe(forwarded);
  });
  proxy.on('connect',(req,client,head)=>{tunnels++;assert(['127.0.0.1:'+secure.address().port,'localhost:'+secure.address().port].includes(req.url));const remote=net.connect(secure.address().port,'127.0.0.1',()=>{client.write('HTTP/1.1 200 Connection Established\\r\\n\\r\\n');if(head.length)remote.write(head);client.pipe(remote);remote.pipe(client);});sockets.add(remote);sockets.add(client);remote.on('error',()=>client.destroy());client.on('error',()=>remote.destroy());});
  const listen=server=>new Promise(resolve=>{server.listen(0,'127.0.0.1',resolve);server.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});});
  await Promise.all([listen(target),listen(secure),listen(proxy)]);
  try{
   process.env.GLOBAL_AGENT_HTTP_PROXY='http://127.0.0.1:'+proxy.address().port;process.env.GLOBAL_AGENT_HTTPS_PROXY=process.env.GLOBAL_AGENT_HTTP_PROXY;process.env.GLOBAL_AGENT_NO_PROXY='';process.env.ELECTRON_GET_USE_PROXY='1';process.env.NODE_TLS_REJECT_UNAUTHORIZED='1';
   require(${JSON.stringify(appBuilder.resolve('@electron/get'))}).initializeProxy();
   const get=(api,url,options={})=>new Promise((resolve,reject)=>{const request=api.get(url,{...options,timeout:1500},res=>{if(api===https)assert.equal(res.socket.authorized,true);let text='';res.on('data',part=>text+=part);res.on('end',()=>resolve(text));res.on('error',reject);});request.on('timeout',()=>request.destroy(Error('timeout')));request.on('error',reject);});
   assert.equal(await get(http,'http://127.0.0.1:'+target.address().port+'/a'),'http-ok');assert.equal(requests,1);
   assert.equal(await get(https,'https://127.0.0.1:'+secure.address().port+'/b',{ca:fs.readFileSync(${JSON.stringify(cert)}),rejectUnauthorized:true}),'https-ok');assert.equal(tunnels,1);
   await assert.rejects(get(https,'https://localhost:'+secure.address().port+'/bad-name',{ca:fs.readFileSync(${JSON.stringify(cert)}),rejectUnauthorized:true}),error=>error.code==='ERR_TLS_CERT_ALTNAME_INVALID');
   global.GLOBAL_AGENT.NO_PROXY='127.0.0.1';assert.equal(await get(http,'http://127.0.0.1:'+target.address().port+'/direct'),'http-ok');assert.equal(requests,1);
   console.log('HTTP proxy, verified HTTPS tunnel and NO_PROXY passed');
  }finally{directAgent.destroy();http.globalAgent.destroy?.();https.globalAgent.destroy?.();for(const socket of sockets)socket.destroy();await Promise.all([target,secure,proxy].map(server=>new Promise(resolve=>server.close(resolve))));}
 })().catch(error=>{console.error(error);process.exit(1)});`,8000);
 assert.match(result,/verified HTTPS tunnel and NO_PROXY passed/);
});
