import test from 'node:test';
import assert from 'node:assert/strict';
import {preferredFont,officeFontName,essentialFontRank} from '../src/font-policy';
import type {LocalFont} from '../src/local-fonts';
import {applyAcademicStyle,normalizeAcademicDocument} from '@prisma/writer/academic';
import {exportDocx} from '@prisma/writer/document-export';
import {defaultLayout,type RichNode} from '@prisma/writer/flow';
import {setFontLoader} from '../src/fonts';
import {readFile} from 'node:fs/promises';
import {unzipSync,strFromU8} from 'fflate';
import {DOMParser} from '@xmldom/xmldom';
import {importOfficeDocx} from '@prisma/writer/document-import';
Object.assign(globalThis,{DOMParser});
const original:LocalFont={value:'local-times',label:'Times New Roman',style:'Regular',bytes:'',hash:'',subset:false};
test('academic body, captions, indexes and references use the available original family consistently',()=>{
  const content:RichNode={type:'doc',content:[
    {type:'heading',attrs:{id:'intro',level:1},content:[{type:'text',text:'Introducción'}]},
    {type:'paragraph',content:[{type:'text',text:'Á ñ texto'}]},
    {type:'table',attrs:{id:'table'},content:[]},
    {type:'caption',attrs:{targetId:'table',title:'Resultados',kind:'table'}},
    {type:'generatedIndex',attrs:{kind:'contents'}},
    {type:'generatedIndex',attrs:{kind:'references'}},
  ]};
  const formatted=normalizeAcademicDocument(applyAcademicStyle(content,'apa',[original]),[{id:'ref',type:'book',title:'Ejemplo',author:'Autor, A.',year:'2026'}],'apa',[original]);
  const visit=(node:RichNode)=>{if(['paragraph','heading','caption'].includes(node.type??''))assert.equal(node.attrs?.fontFamily,original.value);node.content?.forEach(visit);};
  visit(formatted);
  assert.equal(preferredFont('PrismaSerif',[]),'PrismaSerif');
  assert.equal(preferredFont('PrismaSerif',[original]),original.value);
  assert(essentialFontRank(original)<essentialFontRank({value:'Abel',label:'Abel'}));
  assert.equal(officeFontName('local-times','Times New Roman'),'Times New Roman');
});
test('DOCX requests Office fonts and embeds fallbacks with their actual names',async()=>{
  setFontLoader(async file=>new Uint8Array(await readFile('public/fonts/'+file)));
  const values=['Arimo','Carlito','PrismaSerif','Caladea','Gelasio','PrismaMono'];
  const content:RichNode={type:'doc',content:values.map(value=>({type:'paragraph',attrs:{fontFamily:value},content:[{type:'text',text:'Prueba '+value}]}))};
  const parts=unzipSync(await exportDocx({content,layout:defaultLayout()},'Compatibilidad'));
  const document=strFromU8(parts['word/document.xml']),table=strFromU8(parts['word/fontTable.xml']);
  for(const [name,fallback] of [['Arial','Prisma Arimo'],['Calibri','Carlito'],['Times New Roman','Liberation Serif'],['Cambria','Caladea'],['Georgia','Prisma Gelasio'],['Courier New','Liberation Mono']]){
    assert(document.includes('w:ascii="'+name+'"'),name);
    const aliases=table.match(new RegExp('<w:font w:name="'+name+'"><w:altName w:val="([^"]+)"/></w:font>'))?.[1].split(', ');
    assert(aliases?.includes(fallback),name);
    assert(table.includes('<w:font w:name="'+fallback+'"><w:embedRegular'),fallback);
  }
  const imported=await importOfficeDocx(await exportDocx({content,layout:defaultLayout()},'Reabrir'));
  assert.equal(imported.flow.importReport?.fontSubstitutions.length,0);
  imported.flow.content.content!.push({type:'paragraph',content:[{type:'text',text:'Nuevo párrafo'}]});
  const rebuilt=strFromU8(unzipSync(await exportDocx(imported.flow,'Editado',imported.flow.fonts))['word/document.xml']);
  for(const name of ['Arial','Calibri','Times New Roman','Cambria','Georgia','Courier New'])assert(rebuilt.includes('w:ascii="'+name+'"'),name);
});
