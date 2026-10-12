import {useEffect,useState} from 'react';
import {fontFamilies} from './fonts';
import {decodeFont,importLocalFont,localFontFamilies,mountLocalFonts,validateLocalFonts,type LocalFont} from './local-fonts';
import {loadOfficeFile,saveOfficeFile} from './office-storage';
export type InstalledFont={family:string;fullName:string;postscriptName:string;style:string;blob:()=>Promise<Blob>};
type FontWindow=Window & {queryLocalFonts?:()=>Promise<InstalledFont[]>};
let current:LocalFont[]=[],cleanup:(()=>void)|undefined,initializing:Promise<void>|undefined;
const event='prisma-device-fonts',id='prisma-device-fonts-v1';
export const deviceFonts=()=>current;
export function findDeviceFont(family:string,bold=false,italic=false){
 const fonts=current.filter(f=>f.value===family||f.label===family),style=bold?(italic?'BoldItalic':'Bold'):(italic?'Italic':'Regular');
 return fonts.find(f=>f.style===style)??fonts.find(f=>f.style===(bold?'Bold':'Regular'))??fonts[0];
}
export const supportsInstalledFonts=()=>typeof window!=='undefined'&&typeof(window as FontWindow).queryLocalFonts==='function';
export function installedFamilies(fonts:InstalledFont[]){return [...new Set(fonts.map(f=>f.family).filter(f=>typeof f==='string'&&f.trim().length>0&&f.length<=100))].sort((a,b)=>a.localeCompare(b,'es'));}
export async function listInstalledFonts():Promise<InstalledFont[]>{
 if(!supportsInstalledFonts())throw Error('Este navegador no permite leer la lista de fuentes instaladas. Elige tus archivos TTF / OTF con Importar.');
 // This call must remain before any await: browsers require the user's click.
 const request=(window as FontWindow).queryLocalFonts!();
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([request,new Promise<InstalledFont[]>((_,reject)=>{timer=setTimeout(()=>reject(new Error('El navegador aún espera el permiso para leer fuentes. Puedes volver a intentarlo o importar archivos TTF / OTF.')),30_000);})]);}
 finally{if(timer)clearTimeout(timer);}
}
export function fontFiles(fonts:LocalFont[]){return fonts.map(font=>new File([decodeFont(font.bytes).buffer as ArrayBuffer],font.label+'-'+font.style+'.'+(decodeFont(font.bytes)[0]===0x4f?'otf':'ttf'),{type:'application/octet-stream'}));}
async function mount(fonts:LocalFont[]){
 const nextCleanup=await mountLocalFonts(fonts);cleanup?.();cleanup=nextCleanup;current=fonts;
 for(const family of localFontFamilies(fonts)){const index=fontFamilies.findIndex(f=>f.value===family.value);if(index<0)fontFamilies.push(family);else fontFamilies[index]=family;}
 window.dispatchEvent(new Event(event));
}
export function initializeDeviceFonts(){
 if(typeof window==='undefined'||typeof indexedDB==='undefined')return Promise.resolve();
 return initializing??=(async()=>{
  const record=await loadOfficeFile(id);if(!record)return;
  const fonts=JSON.parse(new TextDecoder().decode(record.bytes));await validateLocalFonts(fonts);await mount(fonts);
 })().catch(()=>{/* Invalid or unavailable local storage does not block editing. */});
}
export async function importDeviceFonts(files:File[]):Promise<LocalFont[]>{
 await initializeDeviceFonts();const next=[...current],added:LocalFont[]=[];
 for(const file of files){if(file.size>8*1024*1024)throw Error('Elige fuentes de hasta 8 MB.');const font=await importLocalFont(new Uint8Array(await file.arrayBuffer()));added.push(font);const at=next.findIndex(f=>f.value===font.value&&f.style===font.style);if(at<0)next.push(font);else next[at]=font;}
 await validateLocalFonts(next);
 // Mount before saving so a failed font cannot poison the persistent library.
 const dispose=await mountLocalFonts(next);
 try{await saveOfficeFile({id,product:'fonts',name:'Mis fuentes del dispositivo',bytes:new TextEncoder().encode(JSON.stringify(next)),updated:Date.now()});}catch(error){dispose();throw error;}
 cleanup?.();cleanup=dispose;current=next;
 for(const family of localFontFamilies(next)){const at=fontFamilies.findIndex(f=>f.value===family.value);if(at<0)fontFamilies.push(family);else fontFamilies[at]=family;}
 window.dispatchEvent(new Event(event));return added;
}
export async function installedFontFiles(available:InstalledFont[],family:string){
 const matches=available.filter(f=>f.family===family).sort((a,b)=>Number(!/^(regular|normal|roman|book)$/i.test(a.style))-Number(!/^(regular|normal|roman|book)$/i.test(b.style)));
 if(!matches.length)throw Error('La familia seleccionada ya no está disponible.');
 const faces=new Map<string,LocalFont>();let firstError:unknown;
 for(const candidate of matches.slice(0,12)){
  try{const blob=await candidate.blob();if(blob.size>8*1024*1024)throw Error('La fuente supera 8 MB.');const font=await importLocalFont(new Uint8Array(await blob.arrayBuffer()));if(!faces.has(font.style))faces.set(font.style,font);if(faces.size===4)break;}catch(error){firstError??=error;}
 }
 if(!faces.has('Regular'))throw firstError??Error('Elige una familia con archivo regular TTF / OTF estático.');
 return {fonts:[...faces.values()],files:fontFiles([...faces.values()])};
}
export function useDeviceFonts(){
 const[fonts,setFonts]=useState(current);
 useEffect(()=>{const update=()=>setFonts([...current]);window.addEventListener(event,update);void initializeDeviceFonts().then(update);return()=>window.removeEventListener(event,update);},[]);
 return fonts;
}
