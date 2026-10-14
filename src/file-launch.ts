import {Capacitor,registerPlugin} from '@capacitor/core';
import {product} from './product';
import {editorForLaunchFile} from './prisma-launch';
import {navigatePrisma} from './prisma-navigation';
type Packet={name?:string;data?:Uint8Array;lastModified?:number;base64?:string;error?:string};
type NativeFiles={take:()=>Promise<Packet|null>;onAvailable:(callback:()=>void)=>()=>void};
type Opener=(file:File)=>Promise<unknown>;
let opener:Opener|undefined,working=false;const pending:File[]=[];
function report(error:unknown){window.dispatchEvent(new CustomEvent('asteoria-file-error',{detail:error instanceof Error?error.message:String(error)}));}
async function drain(){if(working||(!opener&&product.kind!=='prisma'))return;working=true;try{while(pending.length){const file=pending.shift()!;if(product.kind==='prisma'){const editor=await editorForLaunchFile(file);if(!editor)throw Error('Este formato no tiene un editor disponible.');await navigatePrisma(editor,{editor,action:'file',file});break;}else {await opener!(file);document.documentElement.dataset.asteoriaFileOpened=file.name;}}}catch(e){report(e);}finally{working=false;}}
export function registerFileOpener(handler:Opener){opener=handler;void drain();return()=>{if(opener===handler)opener=undefined;};}
export function receiveLaunchedFile(file:File){pending.push(file);void drain();}
function packetFile(packet:Packet){if(packet.error)throw Error(packet.error);if(!packet.name)return;let data=packet.data;if(!data&&packet.base64){const binary=atob(packet.base64);data=Uint8Array.from(binary,c=>c.charCodeAt(0));}if(data)return new File([data.slice().buffer as ArrayBuffer],packet.name,{lastModified:packet.lastModified??Date.now()});}
export function startFileHandling(){
 const w=window as Window&{prismaDesktop?:{files?:NativeFiles};launchQueue?:{setConsumer:(handler:(params:{files:{getFile:()=>Promise<File>}[]})=>void)=>void}};
 w.launchQueue?.setConsumer(params=>{void (async()=>{for(const handle of params.files)receiveLaunchedFile(await handle.getFile());})().catch(report);});
 const desktop=w.prismaDesktop?.files;
 if(desktop){let reading=false;const read=async()=>{if(reading)return;reading=true;try{const packet=await desktop.take();if(packet){const file=packetFile(packet);if(file)receiveLaunchedFile(file);}}catch(e){report(e);}finally{reading=false;}};desktop.onAvailable(()=>void read());void read();}
 if(Capacitor.isNativePlatform()){
  const plugin=registerPlugin<{take:()=>Promise<Packet>;addListener:(name:string,handler:()=>void)=>Promise<unknown>}>('AsteoriaOpenDocument');
  let reading=false;const read=async()=>{if(reading)return;reading=true;try{const file=packetFile(await plugin.take());if(file)receiveLaunchedFile(file);}catch(e){report(e);}finally{reading=false;}};
  void plugin.addListener('available',()=>void read()).then(()=>read()).catch(report);
 }
}
