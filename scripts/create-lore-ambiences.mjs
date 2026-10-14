import fs from 'node:fs';
// Original procedural soundscapes by OscarD0823 for ASTEORIA. Audio output: CC0-1.0.
const rate=22050,seconds=12,count=rate*seconds,folder='vendor/lore-audio/effects/ambience';fs.mkdirSync(folder,{recursive:true});
for(const name of ['Lluvia suave','Viento','Olas del mar','Fuego y brasas','Trueno','Bosque y aves','Nave espacial','Latidos','Campanas','Misterio']){
 let seed=217+(name.codePointAt(0)||0),low=0,last=0;const samples=new Float32Array(count);
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<count;i++){const t=i/rate,noise=random()*2-1;low=.99*low+.01*noise;let sample=0;
  if(name==='Lluvia suave')sample=.16*noise+.25*low+(random()<.001?noise*.4:0);
  if(name==='Viento')sample=3*low*(.25+.25*Math.sin(t*.6));
  if(name==='Olas del mar')sample=(.05+.14*(1+Math.sin(t*1.1)))*noise+low;
  if(name==='Fuego y brasas'){last*=.9;if(random()<.008)last=noise;sample=.08*noise+.65*last;}
  if(name==='Trueno')sample=(low*5+noise*.12)*Math.exp(-t*.45)*(Math.min(1,t*8));
  if(name==='Bosque y aves'){const cycle=t%2.4;sample=.04*noise+.03*low;if(cycle<.35)sample+=.22*Math.sin(2*Math.PI*(2100*t+200*Math.sin(t*17)))*Math.sin(Math.PI*cycle/.35);}
  if(name==='Nave espacial')sample=low*.5+.09*Math.sin(2*Math.PI*55*t)+.04*Math.sin(2*Math.PI*83*t);
  if(name==='Latidos'){const x=t%1.1;sample=.42*Math.sin(2*Math.PI*65*t)*(Math.exp(-x*35)+(x>.18?.6*Math.exp(-(x-.18)*45):0));}
  if(name==='Campanas'){const x=t%3;sample=(.25*Math.sin(2*Math.PI*440*t)+.12*Math.sin(2*Math.PI*882*t)+.04*Math.sin(2*Math.PI*1200*t))*Math.exp(-x*2);}
  if(name==='Misterio')sample=.08*(Math.sin(2*Math.PI*110*t)+Math.sin(2*Math.PI*116.5*t)+Math.sin(2*Math.PI*164.8*t))*(.7+.3*Math.sin(t*.5));
  samples[i]=sample*Math.min(1,t/.12,(seconds-t)/.12);
 }
 const bytes=Buffer.alloc(44+count*2);bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(rate,24);bytes.writeUInt32LE(rate*2,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(count*2,40);for(let i=0;i<count;i++)bytes.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);
 fs.writeFileSync(folder+'/'+name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll(' ','-').toLowerCase()+'.wav',bytes);
}
fs.writeFileSync('vendor/lore-audio/licenses/Asteoria-ambiences-CC0.txt','Original procedural audio by OscarD0823. Dedicated to the public domain under CC0-1.0. Generator: scripts/create-lore-ambiences.mjs\nhttps://creativecommons.org/publicdomain/zero/1.0/\n');
