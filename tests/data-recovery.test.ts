import test from 'node:test';import assert from 'node:assert/strict';import 'fake-indexeddb/auto';
import {saveOfficeFile,loadOfficeFile,listOfficeFiles} from '@prisma/core/office-storage';
import {recoverDataDraft,type DataDraft} from '@prisma/data/data-draft';
test('Nexus recovers unexecuted SQL and a pending record separately from database bytes',async()=>{
 const draft:DataDraft={sql:'INSERT INTO "Personas" (nombre) VALUES (',newTable:'Ideas',definition:'nombre TEXT',createOpen:true,tab:'Consulta SQL',table:'Personas',record:{nombre:'Ana'},newRecord:true,rowKey:undefined};
 const file={id:'recovery-database',product:'data',name:'Prueba',bytes:new Uint8Array([83,81,76]),updated:Date.now(),draft};
 await saveOfficeFile(file);const restored=await loadOfficeFile(file.id);assert.deepEqual(restored?.bytes,file.bytes);assert.deepEqual(recoverDataDraft(restored?.draft),draft);
 assert.equal('draft' in (await listOfficeFiles('data')).find(card=>card.id===file.id)!,false);
 assert.equal(recoverDataDraft({sql:42}),undefined);assert.equal(recoverDataDraft(undefined),undefined);
});
