import {useEffect,useState} from 'react';
import {fontFamilies} from './fonts';
import {decodeFont,importLocalFont,importLocalFonts,localFontFamilies,mountLocalFonts,validateLocalFonts,type LocalFont} from './local-fonts';
import {MAX_FONT_COLLECTION_BYTES} from './font-collection';
import {loadOfficeFile,saveOfficeFile} from './office-storage';
export type InstalledFont={family:string;fullName:string;postscriptName:string;style:string;blob:()=>Promise<Blob>};
type FontWindow=Window & {queryLocalFonts?:()=>Promise<InstalledFont[]>;prismaDesktop?:{fonts?:{requestAccess:()=>Promise<boolean>}}};
let current:LocalFont[]=[],cleanup:(()=>void)|undefined,initializing:Promise<void>|undefined;
let installed:InstalledFont[]=[];
/** Metadata from a successful user-authorized enumeration in this session. No font bytes are read here. */
export const knownInstalledFonts=()=>installed;
const event='prisma-device-fonts',id='prisma-device-fonts-v1';
export const deviceFonts=()=>current;
export const normalizeFontName=(name:string)=>name.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
export function findDeviceFont(family:string,bold=false,italic=false){
 const key=normalizeFontName(family),fonts=current.filter(f=>f.value===family||normalizeFontName(f.label)===key),style=bold?(italic?'BoldItalic':'Bold'):(italic?'Italic':'Regular');
 return fonts.find(f=>f.style===style)??fonts.find(f=>f.style===(bold?'Bold':'Regular'))??fonts[0];
}
export const supportsInstalledFonts=()=>typeof window!=='undefined'&&typeof(window as FontWindow).queryLocalFonts==='function';
export function installedFamilies(fonts:InstalledFont[]){return [...new Map(fonts.filter(f=>typeof f.family==='string'&&f.family.trim().length>0&&f.family.length<=100).map(f=>[normalizeFontName(f.family),f.family.trim()])).values()].sort((a,b)=>a.localeCompare(b,'es'));}
export async function listInstalledFonts():Promise<InstalledFont[]>{
 if(!supportsInstalledFonts())throw Error('Este navegador no permite leer la lista de fuentes instaladas. Elige tus archivos TTF / OTF con Importar.');
 // Electron can return an empty list when its permission check denies access,
 // without ever invoking its request handler. Ask explicitly through the trusted preload.
 const authorize=(window as FontWindow).prismaDesktop?.fonts?.requestAccess;
 if(authorize&&!await authorize())throw new DOMException('No se concedió permiso para leer las fuentes.','NotAllowedError');
 // In browsers, with no native authorization branch, this stays before any await
 // so the first permission request keeps the user's click.
 const request=(window as FontWindow).queryLocalFonts!();
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{installed=await Promise.race([request,new Promise<InstalledFont[]>((_,reject)=>{timer=setTimeout(()=>reject(new Error('El navegador aún espera el permiso para leer fuentes. Puedes volver a intentarlo o importar archivos TTF / OTF.')),30_000);})]);return installed;}
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
 for(const file of files){if(file.size>MAX_FONT_COLLECTION_BYTES)throw Error('Elige fuentes TTF / OTF de hasta 8 MB por cara o colecciones TTC de hasta 32 MB.');for(const font of await importLocalFonts(new Uint8Array(await file.arrayBuffer()))){added.push(font);const at=next.findIndex(f=>f.value===font.value&&f.style===font.style);if(at<0)next.push(font);else next[at]=font;}}
 await validateLocalFonts(next);
 // Mount before saving so a failed font cannot poison the persistent library.
 const dispose=await mountLocalFonts(next);
 try{await saveOfficeFile({id,product:'fonts',name:'Mis fuentes del dispositivo',bytes:new TextEncoder().encode(JSON.stringify(next)),updated:Date.now()});}catch(error){dispose();throw error;}
 cleanup?.();cleanup=dispose;current=next;
 for(const family of localFontFamilies(next)){const at=fontFamilies.findIndex(f=>f.value===family.value);if(at<0)fontFamilies.push(family);else fontFamilies[at]=family;}
 window.dispatchEvent(new Event(event));return added;
}
export async function installedFontFiles(available:InstalledFont[],family:string){
 const score=(style:string)=>/^(regular|normal|roman|book|bold|italic|oblique|bold italic|bold oblique)$/i.test(style)?0:1;
 const matches=available.filter(f=>normalizeFontName(f.family)===normalizeFontName(family)).sort((a,b)=>score(a.style)-score(b.style));
 if(!matches.length)throw Error('La familia seleccionada ya no está disponible.');
 const faces=new Map<string,LocalFont>();const warnings:string[]=[];let firstError:unknown;
 for(const candidate of matches){
  try{const blob=await candidate.blob();if(blob.size>MAX_FONT_COLLECTION_BYTES)throw Error('La colección supera 32 MB.');const font=await importLocalFont(new Uint8Array(await blob.arrayBuffer()),{postscriptName:candidate.postscriptName,family:candidate.family});if(normalizeFontName(font.label)!==normalizeFontName(family))throw Error('El archivo pertenece a otra familia.');if(!faces.has(font.style))faces.set(font.style,font);if(faces.size===4)break;}catch(error){firstError??=error;warnings.push(candidate.style+': '+(error instanceof Error?error.message:String(error)));}
 }
 if(!faces.has('Regular'))throw firstError??Error('Elige una familia con archivo regular TTF / OTF estático.');
 return {fonts:[...faces.values()],files:fontFiles([...faces.values()]),warnings};
}
export function useDeviceFonts(){
 const[fonts,setFonts]=useState(current);
 useEffect(()=>{const update=()=>setFonts([...current]);window.addEventListener(event,update);void initializeDeviceFonts().then(update);return()=>window.removeEventListener(event,update);},[]);
 return fonts;
}
