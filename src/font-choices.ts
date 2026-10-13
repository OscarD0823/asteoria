import {fontFamilies,type FontFamily} from './fonts';
import {localFontFamilies,type LocalFont} from './local-fonts';
import {installedFamilies,normalizeFontName,type InstalledFont} from './device-fonts';
import {essentialFontRank} from './font-policy';

export type FontChoice=FontFamily & {installedFamily?:string};
/** Discovery supplies names only. Reading the selected family is a separate user action. */
export function fontChoices(local:LocalFont[],installed:InstalledFont[]):FontChoice[]{
 const choices:FontChoice[]=[...new Map([...fontFamilies.filter(font=>font.file||font.styles),...localFontFamilies(local)].map(font=>[font.value,font])).values()];
 const originals=new Set(choices.filter(font=>font.value.startsWith('local-')).map(font=>normalizeFontName(font.label)));
 for(const family of installedFamilies(installed)){
  if(originals.has(normalizeFontName(family)))continue;
  const category=/times|cambria|georgia|serif|garamond|baskerville|palatino/i.test(family)?'serif':/courier|consolas|mono/i.test(family)?'monospace':'sans-serif';
  choices.push({value:'installed:'+normalizeFontName(family),label:family,css:JSON.stringify(family)+', '+category,category,installedFamily:family});
 }
 return choices.sort((a,b)=>essentialFontRank(a)-essentialFontRank(b)||a.label.localeCompare(b.label,'es'));
}
