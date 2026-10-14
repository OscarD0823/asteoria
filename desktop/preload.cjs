const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("prismaDesktop", {
  print: (payload) => ipcRenderer.invoke("prisma-print", payload),
  engines:{capabilities:()=>ipcRenderer.invoke('prisma-engine-capabilities'),run:payload=>ipcRenderer.invoke('prisma-engine-run',payload)},
  fonts:{requestAccess:()=>ipcRenderer.invoke('prisma-fonts-authorize')},
  files:{take:()=>ipcRenderer.invoke('asteoria-files-take'),onAvailable:callback=>{const handler=()=>callback();ipcRenderer.on('asteoria-files-available',handler);return()=>ipcRenderer.removeListener('asteoria-files-available',handler);}},
});
