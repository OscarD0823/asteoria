import {
  cpSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
const require = createRequire(import.meta.url);
await import('./prepare-licenses.mjs');
await import('./prepare-proofing.mjs');
await import('./prepare-lore-audio.mjs');
const {gunzipSync}=require('node:zlib');
const {unlinkSync}=require('node:fs');
const writer = process.env.VITE_PRODUCT === "writer";
const sheets = process.env.VITE_PRODUCT === "sheets";
const products=JSON.parse(readFileSync('products.json','utf8'));
const kind=process.env.VITE_PRODUCT&&products[process.env.VITE_PRODUCT]?process.env.VITE_PRODUCT:'pdf';
const appVersion=products[kind].version;
const releaseTag = 'v'+appVersion;
const assetName=products[kind].name.replaceAll(' ','-');
const suiteFeatures=Object.fromEntries(Object.keys(products).map(kind=>[kind,[
 'ASTEORIA BETA: un universo para crear con identidad y nombres propios',
 'Motor local propio para conservar documentos, libros y presentaciones; exportación TXT y CSV',
 'Iconos renovados y fuentes reales del dispositivo'
]]));
for(const features of Object.values(suiteFeatures))features.unshift('Abre documentos desde el Explorador, Android y la web instalada compatible; conserva el guardado local');
for(const target of ['stories','prisma'])suiteFeatures[target].unshift('Audiolibros neuronales locales: 19 voces en 10 idiomas, detección automática, diálogos por personaje, 264 efectos y exportación WAV/ZIP');
for(const target of ['stories','prisma'])suiteFeatures[target].unshift('Preparación verificada del audiolibro sin conexión: aplicación, motor, efectos y voces de los capítulos; actualización web corregida');
for(const target of ['stories','prisma'])suiteFeatures[target].unshift('Lore: guía para escritores, exportación de novela o capítulos, escudos y fondos propios, árbol y fichas PNG/SVG, corrector local de toda la novela');
const release = 'https://github.com/OscarD0823/'+products[kind].siteSlug+'/releases/';
writeFileSync(
  "public/version.json",
  JSON.stringify(
    {
      version: appVersion,
      channel:'beta',
      releaseUrl: release + "tag/" + releaseTag,
      androidUrl:
        release +
        "download/" +
        releaseTag +
        "/" +
        assetName +
        "-" +
        appVersion +
        "-Android.apk",
      windowsUrl:
        release +
        "download/" +
        releaseTag +
        "/" +
        assetName +
        "-" +
        appVersion +
        "-Windows-Setup.exe",
      features: suiteFeatures[kind] ?? (sheets
        ? [
            "Aplicación instalable y biblioteca completa de fuentes con favoritas",
            "Editor local de hojas XLSX y CSV",
            "Fórmulas, formatos y varias hojas",
            "Tablas para Asteoria Scribe, exportación PDF e impresión",
            "Guardado local y aviso de funciones incompatibles",
          ]
        : [
            "Aplicación instalable y descarga opcional de biblioteca sin conexión",
            "Diccionario personal con definiciones e importación local",
            "Informe de compatibilidad al importar documentos Word",
            "Índices de tablas y figuras actualizables en Word",
            "Biblioteca de fuentes con favoritas, texto de muestra y vistas de lista o tarjetas",
            "Galería de estilos, índices con relleno y numeración alineada",
            "Revisor ortográfico de español e inspector Unicode locales",
            "Escritura con separación de páginas e importación de DOCX",
            "Comprobación de actualizaciones sin enviar documentos",
          ]),
    },
    null,
    2,
  ) + "\n",
);
const base = dirname(require.resolve("pdfjs-dist/package.json"));
mkdirSync("public/pdfjs", { recursive: true });
for (const name of ["cmaps", "standard_fonts", "wasm"])
  cpSync(join(base, name), join("public/pdfjs", name), { recursive: true });
const engine = dirname(require.resolve("mupdf"));
const ocr=dirname(require.resolve('tesseract.js/package.json')),ocrCore=dirname(require.resolve('tesseract.js-core/package.json'));
mkdirSync('public/ocr/lang',{recursive:true});cpSync(join(ocr,'dist/worker.min.js'),'public/ocr/worker.min.js');
for(const file of ['tesseract-core-lstm.wasm.js','tesseract-core-lstm.wasm'])cpSync(join(ocrCore,file),'public/ocr/'+file);
for(const lang of ['spa','eng']){const packed=join(dirname(require.resolve('@tesseract.js-data/'+lang+'/package.json')),'4.0.0_best_int',lang+'.traineddata.gz');writeFileSync('public/ocr/lang/'+lang+'.traineddata',gunzipSync(readFileSync(packed)));if(existsSync('public/ocr/lang/'+lang+'.traineddata.gz'))unlinkSync('public/ocr/lang/'+lang+'.traineddata.gz');}
mkdirSync("public/engine", { recursive: true });
for (const name of ["mupdf.js", "mupdf-wasm.js", "mupdf-wasm.wasm"])
  cpSync(join(engine, name), join("public/engine", name));
mkdirSync("public/third-party", { recursive: true });
mkdirSync("public/spelling", { recursive: true });
const dictionary = dirname(require.resolve("dictionary-es"));
for (const file of ["index.aff", "index.dic"])
  cpSync(join(dictionary, file), join("public/spelling", file));
cpSync(join(dictionary, "license"), "public/spelling/LICENSE.txt");
for (const dependency of [
  "mupdf",
  "pdf-lib",
  "@pdf-lib/fontkit",
  "mathjax-full",
  "regenerator-runtime",
  "@tiptap/pm",
  "pdfjs-dist",
  "react",
  "react-dom",
  "lucide-react",
  "three",
  "@capacitor/core",
  "@capacitor/android",
  "@capacitor/filesystem",
  "@capacitor/share",
  "@tiptap/core",
  "@tiptap/react",
  "@tiptap/starter-kit",
  "@tiptap/extension-image",
  "@tiptap/extension-table",
  "@tiptap/extension-text-style",
  "@tiptap/extension-text-align",
  "@tiptap/extension-placeholder",
  "@tiptap/extension-subscript",
  "@tiptap/extension-superscript",
  "docx",
  "citeproc",
  "fflate",
  "exceljs",
  "hyperformula",
  "typo-js",
  "hunspell-asm",
  "@xmldom/xmldom",
  "jszip",
  "fast-xml-parser",
  "utif2",
  "buffer",
  "@noble/hashes",
  "pptxgenjs",
  "sql.js",
  "tesseract.js",
  "tesseract.js-core",
  "opentype.js",
  "bidi-js",
]) {
  let root;
  if (dependency === "mupdf") root = dirname(engine);
  else
    try {
      root = dirname(require.resolve(dependency + "/package.json"));
    } catch {
      root = dirname(
        require.resolve(
          dependency === "@tiptap/pm" ? "@tiptap/pm/model" : dependency,
        ),
      );
      while (!existsSync(join(root, "package.json")) && root !== dirname(root))
        root = dirname(root);
    }
  const license = ["LICENSE", "LICENSE.md", "LICENSE.txt"]
    .map((name) => join(root, name))
    .find((path) => existsSync(path));
  if (license)
    cpSync(
      license,
      join(
        "public/third-party",
        dependency.replaceAll("/", "-") + "-LICENSE.txt",
      ),
    );
}
const pmRequire = createRequire(
  createRequire(require.resolve("@tiptap/core")).resolve("@tiptap/pm/model"),
);
for (const dependency of [
  "prosemirror-model",
  "prosemirror-state",
  "prosemirror-view",
  "prosemirror-transform",
  "prosemirror-history",
  "prosemirror-commands",
  "prosemirror-schema-list",
  "prosemirror-keymap",
  "prosemirror-dropcursor",
  "prosemirror-gapcursor",
  "prosemirror-inputrules",
  "prosemirror-tables",
]) {
  let root = dirname(pmRequire.resolve(dependency));
  while (!existsSync(join(root, "package.json")) && root !== dirname(root))
    root = dirname(root);
  const license = ["LICENSE", "LICENSE.md", "LICENSE.txt"]
    .map((name) => join(root, name))
    .find(existsSync);
  if (license)
    cpSync(license, join("public/third-party", dependency + "-LICENSE.txt"));
}
