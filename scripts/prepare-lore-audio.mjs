import fs from 'node:fs';
import path from 'node:path';
// Audio is distributed with Lore and the hub; no user manuscript leaves the device.
const output='public/lore-audio';
fs.mkdirSync(output,{recursive:true});
fs.cpSync('vendor/lore-audio',output,{recursive:true});
const catalog=[];
for(const [folder,category] of [['rpg','Fantasía y acciones'],['impact','Golpes y materiales'],['scifi','Ciencia ficción'],['ambience','Ambientes y naturaleza']]){
 for(const name of fs.readdirSync(path.join(output,'effects',folder)).sort()){
  if(!/\.(ogg|wav)$/.test(name))continue;
  catalog.push({id:`builtin:${folder}/${name}`,name:name.replace(/\.(ogg|wav)$/,'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]/g,' '),category,url:`effects/${folder}/${name}`,license:'CC0-1.0',author:folder==='ambience'?'OscarD0823':'Kenney',source:folder==='ambience'?'https://github.com/OscarD0823/asteoria':`https://kenney.nl/assets/${({rpg:'rpg-audio',impact:'impact-sounds',scifi:'sci-fi-sounds'})[folder]}`});
 }
}
fs.writeFileSync(output+'/catalog.json',JSON.stringify(catalog,null,2)+'\n');
console.log(`Lore: ${catalog.length} efectos CC0 y motor de voz local.`);
await import('./prepare-lore-neural.mjs');
