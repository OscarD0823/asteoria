import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const products=JSON.parse(fs.readFileSync('products.json','utf8'));
for(const kind of Object.keys(products)){
 const output=path.resolve(kind==='pdf'?'dist':'dist-'+kind);
 const result=spawnSync(process.execPath,['scripts/build-product.mjs',kind],{stdio:'inherit',env:{...process.env,PRISMA_OUTDIR:output}});
 if(result.status!==0)throw Error('No se pudo compilar '+products[kind].name+'.');
}
