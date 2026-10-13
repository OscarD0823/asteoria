import {fontFamilies} from './fonts';
import type {LocalFont} from './local-fonts';

/** Office names describe the requested typeface; the fallback keeps its real name and bytes. */
export const officeFontNames: Readonly<Record<string,string>> = {
  Arimo:'Arial', PrismaSans:'Arial', Carlito:'Calibri', Caladea:'Cambria',
  PrismaSerif:'Times New Roman', PrismaMono:'Courier New', Gelasio:'Georgia',
};
export const essentialFontNames = ['Arial','Calibri','Times New Roman','Cambria','Georgia','Courier New','Aptos'];
const key=(name:string)=>name.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
export function preferredFont(fallback:string, fonts:readonly LocalFont[]=[]):string {
  const name=officeFontNames[fallback];
  if(!name)return fallback;
  return fonts.find(font=>key(font.label)===key(name)&&font.style==='Regular')?.value
    ?? fontFamilies.find(font=>font.value.startsWith('local-')&&key(font.label)===key(name))?.value
    ?? fallback;
}
export function officeFontName(family:string,actualName:string):string {
  return officeFontNames[family]??actualName;
}
export function essentialFontRank(font:{value:string;label:string}):number {
  const index=essentialFontNames.findIndex(name=>key(name)===key(font.label));
  return index>=0&&(font.value.startsWith('local-')||font.value.startsWith('installed:'))?index:essentialFontNames.length;
}
