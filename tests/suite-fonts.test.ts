import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {IDBFactory} from 'fake-indexeddb';import ExcelJS from 'exceljs';
import {importDeviceFonts} from '../src/device-fonts';import {selectedOfficeFontName,resolveOfficeFont} from '../src/office-fonts';
import {SheetsBook} from '@prisma/sheets/sheets-core';import {sheetFlow} from '@prisma/sheets/sheets-document';
import {styleDataWorksheet} from '@prisma/data/data-core';
import {createPresentation,createPublication,openPresentation,presentationEngine as engine,EMU} from '@prisma/slides/slides-core';

test('Data and Sheets preserve chosen Office names and local faces in real spreadsheet outputs',async()=>{
 class Face{async load(){return this;}}
 Object.assign(globalThis,{indexedDB:new IDBFactory(),window:new EventTarget(),document:{fonts:new Set()},FontFace:Face});
 const imported=await importDeviceFonts([new File([fs.readFileSync('public/fonts/LiberationSerif-Regular.ttf')],'Fuente.ttf')]);
 const original=selectedOfficeFontName(imported[0].value);assert.equal(original,imported[0].label);
 assert.equal(resolveOfficeFont(original)?.value,imported[0].value);
 assert.equal(selectedOfficeFontName('Arimo'),'Arial');assert.equal(selectedOfficeFontName('Carlito'),'Calibri');
 assert.throws(()=>selectedOfficeFontName('installed:arial'),/importa/);
 const workbook=new ExcelJS.Workbook(),sheet=workbook.addWorksheet('Datos');sheet.addRows([['Nombre','Valor'],['Niño',42]]);sheet.getCell('A1').font={bold:true};
 styleDataWorksheet(sheet,original);
 const reopened=new ExcelJS.Workbook();await reopened.xlsx.load(await workbook.xlsx.writeBuffer());
 assert.equal(reopened.worksheets[0].getCell('A2').font.name,original);assert.equal(reopened.worksheets[0].getCell('B2').value,42);assert.equal(reopened.worksheets[0].getCell('A1').font.bold,true);
 const book=new SheetsBook();book.set('Hoja1',0,0,'Fuente local');book.sheet('Hoja1').getCell('A1').font={name:original};
 assert.equal(sheetFlow(book,'Hoja1').fonts?.[0].hash,imported[0].hash);
 const copy=await SheetsBook.open(await book.bytes());assert.equal(copy.sheet('Hoja1').getCell('A1').font.name,original);book.destroy();copy.destroy();
});
test('Slides and Publisher persist table fonts for existing and initially empty cells',async()=>{
 for(const make of [createPresentation,createPublication]){
  const model=await make(),table=engine.addTable(model,0,{rows:2,cols:2,offset:{x:EMU,y:EMU,cx:6*EMU,cy:2*EMU}});
  engine.editTableCellText(table.slide,table.elementId,0,0,[{runs:[{text:'Título de tabla',fontFamily:'Carlito',fontSize:18}]}]);
  engine.setElementFont(table.slide,table.elementId,{fontFamily:'Arial',fontSizePt:16,bold:true});
  const reopened=await openPresentation(await engine.savePptx(model));
  const changed=reopened.deck.slides[0].elements.find(element=>element.id===table.elementId)!;
  for(const row of changed.rows!)for(const cell of row){const run=cell.text.paragraphs[0].runs[0];assert.equal(run.fontFamily,'Arial');assert.equal(run.fontSize,16);assert.equal(run.bold,true);}
  assert.equal(changed.rows![0][0].text.paragraphs[0].runs[0].text,'Título de tabla');
 }
});
