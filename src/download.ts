import {Capacitor,registerPlugin} from '@capacitor/core';
const localSave=registerPlugin<{save:(options:{source:string;name:string;mime:string})=>Promise<{saved:boolean}>}>('PrismaSaveDocument');
export async function download(bytes:Uint8Array,name:string,type='application/pdf'){
  if(Capacitor.isNativePlatform()){
    const {Filesystem,Directory}=await import('@capacitor/filesystem');
    let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    const result=await Filesystem.writeFile({path:`prisma-exports/${Date.now()}-${name}`,directory:Directory.Cache,data:btoa(binary),recursive:true});
    const saved=await localSave.save({source:result.uri,name,mime:type});
    if(!saved.saved)throw Error('Guardado cancelado. Puedes seguir editando el documento.');
    return;
  }
  const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export async function clearNativeExports(){if(!Capacitor.isNativePlatform())return;const {Filesystem,Directory}=await import('@capacitor/filesystem');try{await Filesystem.rmdir({path:'prisma-exports',directory:Directory.Cache,recursive:true});}catch{/* Empty export cache. */}}
