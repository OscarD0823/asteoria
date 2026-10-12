import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import fontkit from '@pdf-lib/fontkit';
import {fontCollectionFaces} from '../src/font-collection';
import {importLocalFont,importLocalFonts,validateLocalFonts} from '../src/local-fonts';

// Build a collection from freely distributable fonts, including shared-table offsets.
function collection(faces: Uint8Array[]) {
  const header=12+4*faces.length, size=header+faces.reduce((sum,face)=>sum+face.length,0);
  const bytes=new Uint8Array(size), view=new DataView(bytes.buffer);
  view.setUint32(0,0x74746366);view.setUint32(4,0x00010000);view.setUint32(8,faces.length);
  let offset=header;
  faces.forEach((face,index)=>{
    view.setUint32(12+index*4,offset);bytes.set(face,offset);
    const tables=view.getUint16(offset+4);
    for(let i=0;i<tables;i++){const record=offset+12+i*16+8;view.setUint32(record,view.getUint32(record)+offset);}
    offset+=face.length;
  });
  return bytes;
}
const regular=new Uint8Array(fs.readFileSync('public/fonts/LiberationSerif-Regular.ttf'));
const bold=new Uint8Array(fs.readFileSync('public/fonts/LiberationSerif-Bold.ttf'));
test('TTC preserves glyphs, metrics, styles and a valid standalone checksum',async()=>{
  const source=collection([regular,bold]), faces=fontCollectionFaces(source);
  assert.equal(faces.length,2);
  for(let i=0;i<faces.length;i++){
    const original=fontkit.create([regular,bold][i]) as any, extracted=fontkit.create(faces[i]) as any;
    assert.equal(extracted.postscriptName,original.postscriptName);
    assert.deepEqual(extracted.characterSet,original.characterSet);
    assert.equal(extracted.layout('Áé ñ 123').glyphs.length,original.layout('Áé ñ 123').glyphs.length);
    assert.deepEqual(extracted.layout('Áé ñ 123').positions,original.layout('Áé ñ 123').positions);
    const view=new DataView(faces[i].buffer);let sum=0;
    for(let offset=0;offset<faces[i].length;offset+=4)sum=(sum+view.getUint32(offset))>>>0;
    assert.equal(sum,0xb1b0afba);
  }
  await assert.rejects(importLocalFont(source),/varias familias/);
  const picked=await importLocalFont(source,{postscriptName:(fontkit.create(bold) as any).postscriptName});
  assert.equal(picked.style,'Bold');
  const imported=await importLocalFonts(source);assert.equal(imported.length,2);
  assert.deepEqual(imported.map(face=>face.style),['Regular','Bold']);await validateLocalFonts(imported);
  await assert.rejects(importLocalFont(source,{postscriptName:'NotInThisCollection'}),/no contiene/);
});
test('TTC rejects broken directories, out-of-bounds tables and incompatible collections',()=>{
  const truncated=collection([regular]);new DataView(truncated.buffer).setUint32(12,0xfffffff0);
  assert.throws(()=>fontCollectionFaces(truncated),/incompleta/);
  const corrupt=collection([regular]),view=new DataView(corrupt.buffer),directory=view.getUint32(12);
  view.setUint32(directory+20,corrupt.length+1);assert.throws(()=>fontCollectionFaces(corrupt),/inválidas/);
  const overflow=collection([regular]);new DataView(overflow.buffer).setUint32(8,0xffffffff);
  assert.throws(()=>fontCollectionFaces(overflow),/no es válida/);
});
test('extracting a collection never bypasses an individual face embedding restriction',async()=>{
  const restricted=regular.slice(),view=new DataView(restricted.buffer);
  for(let i=0;i<view.getUint16(4);i++){const record=12+i*16;if(view.getUint32(record)===0x4f532f32)view.setUint16(view.getUint32(record+8)+8,2);}
  await assert.rejects(importLocalFonts(collection([restricted])),/permisos/);
});
