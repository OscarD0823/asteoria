import test from 'node:test';import assert from 'node:assert/strict';import {unzipSync,strFromU8} from 'fflate';
import {SheetsBook} from '@prisma/sheets/sheets-core';import {createBlankPptx,openPptx,savePptx} from '@prisma/slides/prisma-presentation';
test('New files identify Prisma while preserved originals retain every package byte',async()=>{
 const book=new SheetsBook();try{const bytes=await book.bytes();assert.match(strFromU8(unzipSync(bytes)['docProps/app.xml']),/<Application>Prisma Sheets<\/Application>/);}finally{book.destroy();}
 const original=await createBlankPptx();assert.match(strFromU8(unzipSync(original)['docProps/app.xml']),/<Application>Prisma<\/Application>/);
 assert.deepEqual(await savePptx(await openPptx(original)),original);
});
