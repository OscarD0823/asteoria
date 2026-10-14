const {
  app,
  BrowserWindow,
  protocol,
  net,
  shell,
  session,
  ipcMain,
  dialog,
} = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
protocol.registerSchemesAsPrivileged([
  {
    scheme: "prisma",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      allowServiceWorkers: true,
    },
  },
]);
protocol.registerSchemesAsPrivileged([{scheme:"prisma-architecture",privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,allowServiceWorkers:true}}]);
let window;
const products=require('../products.json');const productKind=require('../package.json').prismaProduct||'pdf';
const productInfo=products[productKind]||products.pdf;app.setName(productInfo.name);
const legacyNames={pdf:'Prisma PDF',writer:'Prisma Writer',sheets:'Prisma Sheets',slides:'Prisma Slides',data:'Prisma Data',publisher:'Prisma Publisher',prisma:'Prisma',architecture:'PrismaArquitectura'};
if(legacyNames[productKind])app.setPath('userData',path.join(app.getPath('appData'),legacyNames[productKind]));
const appScheme=productKind==='architecture'?'prisma-architecture':'prisma';
const appOrigin=appScheme+'://app/';
const smoke = process.argv.includes("--smoke-test");
if(smoke)app.setPath('userData',require('node:fs').mkdtempSync(path.join(require('node:os').tmpdir(),'asteoria-smoke-')));
app.whenReady().then(() => {
  if(process.argv.includes('--local-engine')){require('../engines/server.cjs').startLocalEngine().then(result=>{void shell.openExternal(result.url);app.on('before-quit',()=>result.server.close());}).catch(error=>{console.error(error.message);app.exit(1);});return;}
  const validEngineOrigin=event=>{if(event.sender!==window?.webContents||!event.sender.getURL().startsWith(appOrigin))throw new Error('Origen del motor no válido.');};
  ipcMain.handle('prisma-engine-capabilities',event=>{validEngineOrigin(event);return require('../engines/local.cjs').capabilities();});
  ipcMain.handle('prisma-engine-run',(event,payload)=>{validEngineOrigin(event);return require('../engines/local.cjs').run(payload);});
  const root=path.resolve(__dirname,productKind==='pdf'?'../dist':'../dist-'+productKind);
  protocol.handle(appScheme, (request) => {
    const url = new URL(request.url);
    if (url.host !== "app") return new Response("Not found", { status: 404 });
    const relative =
      decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    const target = path.resolve(root, relative);
    if (target !== root && !target.startsWith(root + path.sep))
      return new Response("Forbidden", { status: 403 });
    return net.fetch(pathToFileURL(target).href);
  });
  window = new BrowserWindow({
    show: !smoke,
    width: 1380,
    height: 900,
    minWidth: 760,
    minHeight: 600,
    backgroundColor: "#f7f8fc",
    title:productInfo.name+' · BETA',
    icon: path.join(root, "icons/prisma-512.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });
  ipcMain.handle("prisma-print", async (event, payload) => {
    if (
      event.sender !== window.webContents ||
      !event.sender.getURL().startsWith(appOrigin)
    )
      throw new Error("Origen de impresión no válido.");
    if (
      !payload ||
      !Array.isArray(payload.pages) ||
      !payload.pages.length ||
      payload.pages.length > 2000
    )
      throw new Error("Documento de impresión no válido.");
    let total = 0;
    for (const p of payload.pages) {
      if (
        typeof p.data !== "string" ||
        !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(p.data) ||
        !Number.isFinite(p.width) ||
        !Number.isFinite(p.height) ||
        p.width <= 0 ||
        p.height <= 0 ||
        p.width > 10000 ||
        p.height > 10000
      )
        throw new Error("Página de impresión no válida.");
      total += p.data.length;
    }
    if (total > 256 * 1024 * 1024)
      throw new Error("Imprime este documento en varios rangos.");
    const title = String(payload.name ?? productInfo.name)
        .replace(/[<>&"']/g, "")
        .slice(0, 150),
      first = payload.pages[0];
    const html = `<!doctype html><html><head><title>${title}</title><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><style>@page{size:${first.width}pt ${first.height}pt;margin:0}html,body{padding:0;margin:0}img{display:block;width:100%;break-after:page}img:last-child{break-after:auto}</style></head><body>${payload.pages.map((p) => `<img src="${p.data}">`).join("")}</body></html>`;
    const printer = new BrowserWindow({
      show: false,
      parent: window,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
      },
    });
    try {
      await printer.loadURL(
        "data:text/html;charset=utf-8," + encodeURIComponent(html),
      );
      await printer.webContents.executeJavaScript(
        "Promise.all(Array.from(document.images).map(image=>image.decode()))",
      );
      await new Promise((resolve, reject) =>
        printer.webContents.print(
          { silent: false, printBackground: true },
          (success, reason) =>
            success || /cancel/i.test(reason)
              ? resolve()
              : reject(new Error(reason)),
        ),
      );
    } finally {
      printer.destroy();
    }
  });
  if (smoke) {
    let rendererFailed=false;
    window.webContents.on("did-fail-load", (_event, code, description) => {
      console.error("Desktop load failed:", code, description);
      app.exit(1);
    });
    window.webContents.on("console-message", (details) => {
      if (details.level === "error"){
        rendererFailed=true;console.error("Renderer:", details.message);
      }
    });
    window.webContents.on("did-finish-load", () => {
      console.log("Desktop application loaded from bundled assets.");
      setTimeout(() => app.exit(rendererFailed?1:0), 6000);
    });
  }
  window.webContents.setWindowOpenHandler(({ url }) => {
    // Explicit links open in the system browser; files and executable schemes are denied.
    if (/^https?:\/\//i.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(appOrigin)) event.preventDefault();
  });
  let localFontsAllowed=false;
  let fontPermissionRequest;
  const requestFontAccess=()=>fontPermissionRequest??=(dialog.showMessageBox(window,{type:'question',title:'Fuentes del dispositivo',message:'¿Permitir que ASTEORIA muestre tus fuentes instaladas?',detail:'Los archivos de las fuentes seleccionadas se usarán localmente. No se envían a un servidor.',buttons:['Permitir','Cancelar'],defaultId:1,cancelId:1}).then(result=>{localFontsAllowed=result.response===0;return localFontsAllowed;}).catch(()=>false).finally(()=>{fontPermissionRequest=undefined;}));
  ipcMain.handle('prisma-fonts-authorize',event=>{
    validEngineOrigin(event);
    if(event.senderFrame!==window?.webContents.mainFrame)throw Error('La lectura de fuentes solo se permite desde el editor.');
    return localFontsAllowed||requestFontAccess();
  });
  session.defaultSession.setPermissionCheckHandler((webContents,permission,origin,details)=>permission==='local-fonts'&&localFontsAllowed&&webContents===window?.webContents&&[appOrigin.slice(0,-1),appOrigin].includes(origin)&&details.isMainFrame===true);
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback, details) => {
      if(permission!=='local-fonts'||webContents!==window?.webContents||!webContents.getURL().startsWith(appOrigin)||details.isMainFrame===false||!String(details.requestingUrl??webContents.getURL()).startsWith(appOrigin)){callback(false);return;}
      void requestFontAccess().then(callback).catch(()=>callback(false));
    },
  );
  session.defaultSession.on("will-download", (_event, item) =>
    item.setSaveDialogOptions({
      title: "Guardar tu documento",
      defaultPath: path.join(app.getPath("documents"), item.getFilename()),
    }),
  );
  const editorArgument=process.argv.find(argument=>argument.startsWith('--editor='))?.slice(9);
  const editor=productKind==='prisma'&&['pdf','writer','sheets','slides','data','publisher','architecture','stories'].includes(editorArgument)?editorArgument:undefined;
  window.loadURL(appOrigin+"index.html"+(editor?'?editor='+editor:''));
});
app.on("window-all-closed", () => app.quit());
