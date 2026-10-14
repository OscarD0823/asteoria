import {unzipSync,zipSync,strFromU8,strToU8} from 'fflate';

/** Identify newly generated packages; retained originals keep their metadata. */
export function prismaPackageMetadata(bytes:Uint8Array,application:'Prisma Writer'|'Prisma Sheets'|'Prisma') {
  const parts=unzipSync(bytes),name='docProps/app.xml';
  if(!parts[name])return bytes;
  const xml=strFromU8(parts[name]);
  const next=xml.replace(/<((?:[\w-]+:)?Application)\b[^>]*>[\s\S]*?<\/\1>/,(_all,tag)=>`<${tag}>${application}</${tag}>`);
  if(next===xml)return bytes;
  parts[name]=strToU8(next);return zipSync(parts,{level:6});
}
