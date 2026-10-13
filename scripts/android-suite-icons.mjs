import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.env.PRISMA_SHARP_PATH || 'sharp');
const backgrounds = { pdf:'#171f39', writer:'#122e35', sheets:'#142f2b', slides:'#2b203e', data:'#342335', publisher:'#152f42', prisma:'#20233e' };
for (const [kind, background] of Object.entries(backgrounds)) {
  const logo = `public/${kind === 'pdf' ? 'pdf' : kind}-logo.svg`;
  const root = `android/app/src/${kind === 'pdf' ? 'main' : kind}/res`;
  for (const [density, size, adaptive] of [['mdpi',48,108],['hdpi',72,162],['xhdpi',96,216],['xxhdpi',144,324],['xxxhdpi',192,432]]) {
    const dir = `${root}/mipmap-${density}`;
    fs.mkdirSync(dir, {recursive:true});
    for (const name of ['ic_launcher','ic_launcher_round']) await sharp(logo).resize(size,size).png().toFile(`${dir}/${name}.png`);
    // The entire mark fits within Android's central 66/108 safe zone.
    const asset = await sharp(logo).resize(Math.round(adaptive*.6),Math.round(adaptive*.6)).png().toBuffer();
    await sharp({create:{width:adaptive,height:adaptive,channels:4,background:'#ffffff00'}}).composite([{input:asset,gravity:'centre'}]).png().toFile(`${dir}/ic_launcher_foreground.png`);
  }
  fs.mkdirSync(`${root}/drawable`, {recursive:true});
  const vector = `${root}/drawable/prisma_logo.xml`;
  const bitmapName = fs.existsSync(vector) ? 'prisma_brand' : 'prisma_logo';
  await sharp(logo).resize(512,512).png().toFile(`${root}/drawable/${bitmapName}.png`);
  if (fs.existsSync(vector)) fs.writeFileSync(vector, `<?xml version="1.0" encoding="utf-8"?>\n<bitmap xmlns:android="http://schemas.android.com/apk/res/android" android:src="@drawable/prisma_brand" android:gravity="center" android:filter="true" />\n`);
  fs.mkdirSync(`${root}/values`, {recursive:true});
  fs.writeFileSync(`${root}/values/ic_launcher_background.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="ic_launcher_background">${background}</color></resources>\n`);
}
