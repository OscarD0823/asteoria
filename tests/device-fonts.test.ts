import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {listInstalledFonts,installedFamilies,installedFontFiles,supportsInstalledFonts,importDeviceFonts,deviceFonts} from '../src/device-fonts';
import {IDBFactory} from 'fake-indexeddb';
import {SheetsBook} from '@prisma/sheets/sheets-core';
import {sheetFlow} from '@prisma/sheets/sheets-document';
import {loadOfficeFile} from '../src/office-storage';
test('las fuentes instaladas se enumeran sin leer sus archivos y admiten cancelar el permiso',async()=>{
 let calls=0,reads=0;const font={family:'Mi Fuente',fullName:'Mi Fuente Regular',postscriptName:'MiFuente',style:'Regular',blob:async()=>{reads++;return new Blob([]);}};
 Object.assign(globalThis,{window:{queryLocalFonts:()=>{calls++;return Promise.resolve([font]);}}});
 assert.ok(supportsInstalledFonts());const pending=listInstalledFonts();assert.equal(calls,1);assert.equal(reads,0);assert.equal((await pending)[0],font);
 (window as any).queryLocalFonts=()=>Promise.reject(new DOMException('Cancelado','NotAllowedError'));
 await assert.rejects(listInstalledFonts(),{name:'NotAllowedError'});
 delete (window as any).queryLocalFonts;assert.equal(supportsInstalledFonts(),false);await assert.rejects(listInstalledFonts(),/TTF/);
});
test('una fuente del dispositivo se guarda localmente y acompaña el documento enviado al exportador de Sheets',async()=>{
 class TestFace{async load(){return this;}}
 Object.assign(globalThis,{indexedDB:new IDBFactory(),window:new EventTarget(),document:{fonts:new Set()},FontFace:TestFace});
 const bytes=fs.readFileSync('public/fonts/LiberationSerif-Regular.ttf');
 const imported=await importDeviceFonts([new File([bytes],'MiFuente.ttf')]);
 assert.equal(deviceFonts().length,1);
 const stored=await loadOfficeFile('prisma-device-fonts-v1');assert.ok(stored&&stored.product==='fonts');
 const book=new SheetsBook();book.sheet('Hoja1').getCell('A1').value='Una fuente local';book.sheet('Hoja1').getCell('A1').font={name:imported[0].label};
 const flow=sheetFlow(book,'Hoja1');assert.equal(flow.fonts?.length,1);assert.equal(flow.fonts?.[0].hash,imported[0].hash);book.destroy();
});
test('solo se leen los estilos de la familia elegida y se verifican sus permisos de incrustación',async()=>{
 const bytes=fs.readFileSync('public/fonts/LiberationSerif-Regular.ttf');let chosen=0,other=0;
 const source=[{family:'Liberation Serif',fullName:'Liberation Serif',postscriptName:'LiberationSerif',style:'Regular',blob:async()=>{chosen++;return new Blob([bytes]);}},{family:'Otra',fullName:'Otra',postscriptName:'Otra',style:'Regular',blob:async()=>{other++;throw Error('No debe leerse');}}];
 assert.deepEqual(installedFamilies([...source,source[0]]),['Liberation Serif','Otra']);
 const result=await installedFontFiles(source,'Liberation Serif');assert.equal(chosen,1);assert.equal(other,0);assert.equal(result.fonts[0].label,'Liberation Serif');assert.equal(result.files.length,1);assert.ok(result.files[0].size>0);
 await assert.rejects(installedFontFiles(source,'Ausente'),/disponible/);
});
