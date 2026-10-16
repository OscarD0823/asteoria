import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require(process.env.PRISMA_SHARP_PATH||'sharp');
const root=process.cwd(),out=path.join(root,'branding/auralis');fs.mkdirSync(out,{recursive:true});
const tools={
 prisma:{name:'Auralis',color:'#8BF1D2',second:'#ACACFF',deep:'#152C46'},
 pdf:{name:'Auralis Folio',color:'#FFD795',second:'#F29AB4',deep:'#432744'},
 writer:{name:'Auralis Scribe',color:'#9BF1DE',second:'#9EC7FF',deep:'#143D46'},
 sheets:{name:'Auralis Orbit',color:'#B4F39C',second:'#6BE5CD',deep:'#183D3D'},
 slides:{name:'Auralis Nova',color:'#FFC3A4',second:'#E3A8F3',deep:'#422A55'},
 data:{name:'Auralis Nexus',color:'#9DDFFF',second:'#B2AFFA',deep:'#243855'},
 publisher:{name:'Auralis Canvas',color:'#F4B7E8',second:'#8CE3E2',deep:'#3B3159'},
 architecture:{name:'Auralis Atlas',color:'#FFD7A0',second:'#9ACFE9',deep:'#32384D'},
 stories:{name:'Auralis Lore',color:'#D9BEFF',second:'#F6D693',deep:'#382D58'},
 snowrunner:{name:'Auralis SnowRunner Studio',color:'#B1DEFF',second:'#83E9DF',deep:'#23364D'},
 roadcraft:{name:'Auralis RoadCraft Studio',color:'#FFDA8D',second:'#F0AE83',deep:'#40373B'},
 phantom:{name:'Auralis Caja Fantasma',color:'#A2F2DD',second:'#C1ACFF',deep:'#1D3B4B'},
 lankdea:{name:'Auralis Lankdea',color:'#D6B7FF',second:'#F2D79E',deep:'#3C2C53'},
 fortuna:{name:'Auralis Fortuna Real',color:'#F8E3A5',second:'#F7A9BD',deep:'#442C48'},
};
const extras={
 prisma:'<path d="m296 744 180-459q36-70 72 0l180 459M360 593q152-70 304 0"/>',
 snowrunner:'<path d="M216 650V476h90l74-114h227l89 114h112v174M306 476h312M398 378v98M521 378v98"/><circle cx="343" cy="665" r="66"/><circle cx="680" cy="665" r="66"/>',
 roadcraft:'<path d="M220 662h575M300 638V427h274v211M410 427v-88h171l106 109M575 509h108l80 119M370 530h110M690 383l79 78v88"/><circle cx="338" cy="668" r="55"/><circle cx="667" cy="668" r="55"/>',
 phantom:'<path d="M246 479h532v240H246ZM246 479l96-132h340l96 132M331 489v220M694 489v220M442 485v125h140V485M475 542h74"/><path d="m512 272 15 48 51 1-41 30 15 48-40-29-40 29 15-48-41-30 51-1Z" fill="url(#aurora)" stroke="none"/>',
 lankdea:'<path d="M245 469h534v250H245ZM247 469q265-277 530 0M333 487v225M691 487v225M448 490v129h128V490"/><path d="m512 350 69 67-69 92-69-92Z" fill="url(#aurora)" stroke="none"/>',
 fortuna:'<circle cx="512" cy="525" r="219"/><circle cx="512" cy="525" r="95"/><path d="M512 307v123M512 620v123M294 525h123M607 525h123M357 370l87 87M579 592l88 88M357 680l87-88M579 457l88-87M441 215h142l-71 89Z"/>',
};
for(const[k,t]of Object.entries(tools)){
 let glyph=extras[k];if(!glyph){const original=fs.readFileSync(path.join(root,'public',k==='pdf'?'pdf-logo.svg':k+'-logo.svg'),'utf8'),match=original.match(/<g[^>]*fill="none"[^>]*>([\s\S]*?)<\/g>/);if(!match)throw Error('Falta símbolo: '+k);glyph=match[1].replace(/#[A-Fa-f0-9]{6}/g,t.color);}
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-labelledby="title desc"><title id="title">${t.name}</title><desc id="desc">Aurora y luz. Identidad original Auralis: una nueva luz para tus ideas.</desc><defs><linearGradient id="tile" x2=".8" y2="1"><stop stop-color="${t.deep}"/><stop offset="1" stop-color="#101B30"/></linearGradient><linearGradient id="aurora" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="${t.color}"/><stop offset=".52" stop-color="${t.second}"/><stop offset="1" stop-color="${t.color}"/></linearGradient><radialGradient id="glow" cx=".25" cy=".16" r=".9"><stop stop-color="${t.color}" stop-opacity=".27"/><stop offset="1" stop-color="${t.second}" stop-opacity="0"/></radialGradient><filter id="shade" x="-.3" y="-.3" width="1.6" height="1.6"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#06111D" flood-opacity=".5"/></filter><clipPath id="tile-clip"><rect width="1024" height="1024" rx="230"/></clipPath></defs><g clip-path="url(#tile-clip)"><rect width="1024" height="1024" rx="230" fill="url(#tile)"/><rect x="12" y="12" width="1000" height="1000" rx="220" fill="url(#glow)" stroke="${t.color}" stroke-opacity=".22" stroke-width="2"/><path d="M-40 363C150 34 420 345 644 192S982 84 1103 159" fill="none" stroke="url(#aurora)" stroke-width="120" opacity=".09"/><path d="M-39 292C178 72 363 337 597 186S960 110 1100 32" fill="none" stroke="url(#aurora)" stroke-width="30" opacity=".5"/><path d="M-15 322C177 111 391 375 630 220S962 147 1060 73" fill="none" stroke="${t.color}" stroke-width="3" opacity=".7"/><path d="M102 855Q512 761 922 855" fill="none" stroke="url(#aurora)" stroke-width="4" opacity=".4"/><g transform="translate(51 63) scale(.9)" fill="none" stroke="#F6FBFF" stroke-width="44" stroke-linecap="round" stroke-linejoin="round" filter="url(#shade)">${glyph}</g><circle cx="817" cy="816" r="22" fill="${t.color}"/><circle cx="817" cy="816" r="37" fill="none" stroke="${t.color}" stroke-opacity=".2" stroke-width="2"/></g></svg>`;
 fs.writeFileSync(path.join(out,k+'.svg'),svg);
 const file=path.join(root,'public',k==='pdf'?'pdf-logo.svg':k+'-logo.svg');if(['prisma','pdf','writer','sheets','slides','data','publisher','architecture','stories'].includes(k)){fs.writeFileSync(file,svg);if(k==='pdf')fs.writeFileSync(path.join(root,'public/logo.svg'),svg);}
 for(const size of [192,512,1024])await sharp(Buffer.from(svg)).resize(size,size).png().toFile(path.join(out,k+'-'+size+'.png'));
}
const tiles=Object.entries(tools).map(([k,t],i)=>`<g transform="translate(${45+(i%5)*280} ${40+Math.floor(i/5)*310})"><image href="data:image/svg+xml;base64,${fs.readFileSync(path.join(out,k+'.svg')).toString('base64')}" width="220" height="220"/><text x="110" y="253" text-anchor="middle" fill="#e9f1ff" font-family="sans-serif" font-size="16">${t.name.replace('Auralis ','')}</text></g>`).join('');await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1450" height="970"><rect width="100%" height="100%" fill="#0e182c"/>${tiles}</svg>`)).png().toFile(path.join(out,'Auralis-familia.png'));
fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify(tools,null,2));console.log('14 marcas originales Auralis generadas.');
