import fs from 'node:fs';
const products=JSON.parse(fs.readFileSync('products.json','utf8'));
const formats=JSON.parse(fs.readFileSync('file-formats.json','utf8'));
const associations=kind=>[...new Map(Object.entries(kind==='prisma'?Object.assign({},...Object.values(formats)):formats[kind]).flatMap(([mime,extensions])=>extensions.map(ext=>({ext:ext.slice(1),mimeType:mime,name:products[kind].name+' · '+ext,role:'Editor'}))).map(a=>[a.ext,a])).values()];
const nativeId=kind=>kind==='architecture'?'com.oscard.prismaarquitectura':kind==='stories'?'com.oscard.asteorialore':kind==='prisma'?'com.oscard.prisma':'com.oscard.prisma'+kind;
for(const [kind,info] of Object.entries(products)){
 const title=info.name.split(' ')[1]??'',output=kind==='pdf'?'release':'release-'+kind,dist=kind==='pdf'?'dist':'dist-'+kind,icons=kind==='pdf'?'public/icons':'public/'+kind+'-icons',config=kind==='pdf'?'electron-builder.yml':'electron-builder-'+kind+'.yml';
 fs.writeFileSync(config,`appId: ${nativeId(kind)}\nproductName: ${info.name}\ndirectories:\n  output: ${output}\nextraMetadata:\n  name: asteoria-${kind}\n  version: ${info.version}\n  prismaProduct: ${kind}\nfiles:\n  - ${dist}/**/*\n  - desktop/**/*\n  - engines/**/*\n  - engines/dist/*.cjs\n  - products.json\n  - package.json\n  - "!node_modules/**/*"\nasar: true\nwin:\n  target:\n    - target: nsis\n      arch: [x64]\n  icon: ${icons}/prisma.ico\n  signExecutable: false\nnsis:\n  oneClick: false\n  perMachine: false\n  allowToChangeInstallationDirectory: true\n  createDesktopShortcut: true\n  createStartMenuShortcut: true\n  artifactName: ${info.name.replaceAll(' ','-')}-\${version}-Windows-Setup.exe\n`);
 const generated=fs.readFileSync(config,'utf8');
 fs.writeFileSync(config,generated.replace('files:\n','fileAssociations: '+JSON.stringify(associations(kind))+'\nfiles:\n').replace('  - products.json\n','  - products.json\n  - file-formats.json\n'));
 const mimeTypes=[...new Set(associations(kind).map(a=>a.mimeType))];
 if(associations(kind).some(a=>a.mimeType.startsWith('application/x-asteoria')))mimeTypes.push('application/octet-stream');
 const filters=['VIEW','EDIT','SEND'].map(action=>`<intent-filter><action android:name="android.intent.action.${action}"/><category android:name="android.intent.category.DEFAULT"/>${action!=='SEND'?'<data android:scheme="content"/>':''}${mimeTypes.map(mime=>`<data android:mimeType="${mime}"/>`).join('')}</intent-filter>`).join('\n');
 fs.mkdirSync('android/app/src/'+kind,{recursive:true});
 fs.writeFileSync('android/app/src/'+kind+'/AndroidManifest.xml',`<?xml version="1.0" encoding="utf-8"?><manifest xmlns:android="http://schemas.android.com/apk/res/android"><application><activity android:name=".MainActivity">${filters}</activity></application></manifest>\n`);
}
let gradle=fs.readFileSync('android/app/build.gradle','utf8').replaceAll('\r\n','\n');
const flavors=Object.entries(products).map(([kind,info])=>{const [major,minor,patch]=info.version.split('.').map(Number),code=major*10000+minor*100+patch;return `        ${kind} {\n            dimension 'product'\n            applicationId '${nativeId(kind)}'\n            versionCode ${code}\n            versionName '${info.version}'\n            resValue 'string', 'app_name', '${info.name}'\n            resValue 'string', 'title_activity_main', '${info.name}'\n        }`;}).join('\n');
gradle=gradle.replace(/    productFlavors \{[\s\S]*?\n    \}\n    signingConfigs/,`    productFlavors {\n${flavors}\n    }\n    signingConfigs`).replace(/versionCode \d+/,'versionCode '+products.pdf.version.split('.').reduce((n,value,i)=>n+Number(value)*[10000,100,1][i],0)).replace(/versionName "[0-9.]+"/,'versionName "'+products.pdf.version+'"');fs.writeFileSync('android/app/build.gradle',gradle);

