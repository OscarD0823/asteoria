import {parsePrismaWord} from '@prisma/writer/prisma-ooxml';
import {openPptx} from '@prisma/slides/prisma-presentation';
import {SheetsBook,encodeDelimited,displayValue} from '@prisma/sheets/sheets-core';

/** Local adapters reuse the same Prisma models as the browser editors. */
export async function processDocument(bytes:Uint8Array,extension:string,format='original') {
  if(!['docx','docm','xlsx','xlsm','pptx','pptm'].includes(extension))throw Error('Selecciona DOCX, DOCM, XLSX, XLSM, PPTX o PPTM.');
  const family=extension.startsWith('doc')?'document':extension.startsWith('xls')?'workbook':'presentation';
  if(!['original',family==='workbook'?'csv':'txt'].includes(format))throw Error('Ese formato de salida no está disponible para este documento.');
  if(family==='document'){
    const model=await parsePrismaWord(bytes);
    return {blocks:model.blocks.length,footnotes:model.footnotes.length,endnotes:model.endnotes.length,comments:model.comments.length,
      bytes:format==='txt'?new TextEncoder().encode(model.blocks.map(b=>b.text).join('\n')):bytes,extension:format==='original'?extension:format,
      notice:format==='txt'?'TXT conserva el texto; no contiene formato, imágenes ni notas.':undefined};
  }
  if(family==='presentation'){
    const model=await openPptx(bytes);
    const text=model.deck.slides.map((slide,i)=>'Diapositiva '+(i+1)+'\n'+slide.elements.map(el=>el.text?.paragraphs.map(p=>p.runs.map(r=>r.text).join('')).join('\n')??'').filter(Boolean).join('\n')).join('\n\n');
    return {slides:model.deck.slides.length,bytes:format==='txt'?new TextEncoder().encode(text):bytes,extension:format==='original'?extension:format,
      notice:format==='txt'?'TXT conserva el texto representado; no contiene diseño, multimedia ni notas.':undefined};
  }
  const book=await SheetsBook.open(bytes);
  try{
    const sheets=book.workbook.worksheets;
    if(!sheets.length)throw Error('El libro no contiene hojas.');
    let result=bytes;
    if(format==='csv'){
      const sheet=sheets[0],rows=Array.from({length:sheet.rowCount},(_,r)=>Array.from({length:sheet.columnCount},(_,c)=>displayValue(book.value(sheet.name,r,c),sheet.getCell(r+1,c+1).numFmt??'')));
      result=new TextEncoder().encode(encodeDelimited(rows,','));
    }
    return {sheets:sheets.length,bytes:result,extension:format==='original'?extension:format,
      notice:format==='csv'?'CSV contiene los valores de la primera hoja. El original conserva todas las hojas, fórmulas y macros inactivas.':undefined};
  }finally{book.engine.destroy();}
}
