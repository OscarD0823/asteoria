import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fontChoices} from '../src/font-choices';
import {installedFontFiles,type InstalledFont} from '../src/device-fonts';
import {importLocalFont} from '../src/local-fonts';
import {essentialFontNames} from '../src/font-policy';

test('discovered essential fonts appear before alternatives without reading their files',()=>{
 let reads=0;
 const source:InstalledFont[]=['Zeta',...essentialFontNames].reverse().map(family=>({family,fullName:family,postscriptName:family,style:'Regular',blob:async()=>{reads++;throw Error('Discovery must not read bytes');}}));
 const choices=fontChoices([],source);
 assert.deepEqual(choices.slice(0,essentialFontNames.length).map(font=>font.label),essentialFontNames);
 assert(choices.slice(0,essentialFontNames.length).every(font=>font.installedFamily===font.label));
 assert(choices.some(font=>font.value==='Arimo'));
 assert.equal(reads,0);
});
test('project fonts replace a discovered copy of the same family and retain their own portable identity',async()=>{
 const font=await importLocalFont(new Uint8Array(fs.readFileSync('public/fonts/LiberationSerif-Regular.ttf')));
 const source:InstalledFont[]=[{family:'  LIBERATION SERIF ',fullName:'Liberation Serif',postscriptName:'LiberationSerif',style:'Regular',blob:async()=>{throw Error('Project font must not be read again');}}];
 const choices=fontChoices([font],source);
 assert(choices.some(choice=>choice.value===font.value));
 assert(!choices.some(choice=>choice.installedFamily));
});
test('selecting a discovered family reads only its matching files and resolves to an actual portable font',async()=>{
 const bytes=fs.readFileSync('public/fonts/LiberationSerif-Regular.ttf');
 let selectedReads=0,otherReads=0;
 const source:InstalledFont[]=[{family:'Liberation Serif',fullName:'Liberation Serif',postscriptName:'LiberationSerif',style:'Regular',blob:async()=>{selectedReads++;return new Blob([bytes]);}},{family:'Otra',fullName:'Otra',postscriptName:'Otra',style:'Regular',blob:async()=>{otherReads++;throw Error('Unselected font');}}];
 const choice=fontChoices([],source).find(font=>font.installedFamily==='Liberation Serif')!;
 const result=await installedFontFiles(source,choice.installedFamily!);
 assert.equal(selectedReads,1);assert.equal(otherReads,0);
 assert(result.fonts[0].value.startsWith('local-'));
 assert.notEqual(result.fonts[0].value,choice.value);
 assert.equal(result.fonts[0].label,'Liberation Serif');
});
