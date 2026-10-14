import {unzipSync,zipSync,strFromU8,strToU8} from 'fflate';

/** Identify newly generated packages; retained originals keep their metadata. */
export function prismaPackageMetadata(bytes:Uint8Array,application:string) {
  const parts=unzipSync(bytes),name='docProps/app.xml';
  if(!parts[name])return bytes;
  const xml=strFromU8(parts[name]);
  const escaped=application.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
  let next=xml.replace(/<((?:[\w-]+:)?Application)\b[^>]*>[\s\S]*?<\/\1>/,(_all,tag)=>`<${tag}>${escaped}</${tag}>`);
  if(next===xml&&!/<(?:[\w-]+:)?Application\b/.test(xml)){
    next=xml.replace(/<((?:[\w-]+:)?Properties)(\b[^>]*?)\s*\/>/,(_all,tag,attrs)=>{const prefix=tag.includes(':')?tag.slice(0,tag.indexOf(':')+1):'';return `<${tag}${attrs}><${prefix}Application>${escaped}</${prefix}Application></${tag}>`;});
    if(next===xml)next=xml.replace(/<\/((?:[\w-]+:)?Properties)>/,(_all,tag)=>{const prefix=tag.includes(':')?tag.slice(0,tag.indexOf(':')+1):'';return `<${prefix}Application>${escaped}</${prefix}Application></${tag}>`;});
  }
  if(next===xml)return bytes;
  parts[name]=strToU8(next);return zipSync(parts,{level:6});
}
