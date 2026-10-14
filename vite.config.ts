import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import products from "./products.json";
import {resolve} from 'node:path';
import {realpathSync} from 'node:fs';
import {activeEntry,moduleAliases} from './scripts/workspace-core.mjs';
import {provenancePlugin} from './scripts/build-provenance.mjs';
const architectureStandalone = process.env.VITE_ARCHITECTURE_STANDALONE === '1';
// Older Hunspell bindings call nanoid's CommonJS export. Make that import
// explicit for Rollup, including the separately compiled spelling worker.
const proofingInterop = () => ({
  name: 'prisma-proofing-interop',
  transform(code:string,id:string){
    if(/(?:hunspell-asm|emscripten-wasm-loader)/.test(id)){
      const fixed=code.replace("import * as nanoid from 'nanoid';","import nanoid from 'nanoid';").replace("import * as runtime from './lib/node/hunspell';","import runtime from './lib/node/hunspell';").replace("import * as unixify from 'unixify';","import unixify from 'unixify';");
      if(fixed!==code)return {code:fixed,map:null};
    }
  },
});
export default defineConfig({
  publicDir: architectureStandalone ? false : 'public',
  resolve: {alias: {'@prisma/active-app':activeEntry(process.cwd(),process.env.VITE_PRODUCT??'pdf'),...moduleAliases(process.cwd())}},
  plugins: [
    react(),
    proofingInterop(),
    provenancePlugin(process.env.VITE_PRODUCT??'pdf'),
    {
      name: "prisma-product",
      transformIndexHtml(html) {
        if (architectureStandalone) return html;
        const kind=process.env.VITE_PRODUCT as keyof typeof products;
        const canonical='https://oscard0823.github.io/'+(products[kind]??products.pdf).siteSlug+'/';
        html=html.replace('<head>','<head>\n    <link rel="canonical" href="'+canonical+'" />');
        const more:Record<string,string>={slides:'Prisma Slides',data:'Prisma Data',publisher:'Prisma Publisher',prisma:'Prisma'};
        if(process.env.VITE_PRODUCT&&more[process.env.VITE_PRODUCT])return html.replaceAll('Prisma PDF',more[process.env.VITE_PRODUCT]);
        if (process.env.VITE_PRODUCT === "sheets")
          return html
            .replaceAll("Prisma PDF", "Prisma Sheets")
            .replace("De documento a posibilidad", "Da forma a tus números");
        return process.env.VITE_PRODUCT === "writer"
          ? html
              .replaceAll("Prisma PDF", "Prisma Writer")
              .replace(
                "De documento a posibilidad",
                "Tus palabras, tu próxima idea",
              )
          : html;
      },
    },
  ],
  base: "./",
  server: {fs:{allow:[process.cwd(),...Object.values(moduleAliases(process.cwd())).map(dir=>realpathSync(dir)),realpathSync('node_modules')]},watch: {ignored: ["**/dist/**", "**/dist-*/**", "**/release*/**", "**/qa/**", "**/android/**", "**/.prisma/architecture-source/**"]}},
  optimizeDeps: { entries: ["index.html"] },
  worker: { format: "es", plugins:()=>[proofingInterop()] },
  build: { chunkSizeWarningLimit: 1800, ...(architectureStandalone ? {rollupOptions:{input:resolve('arquitectura.html')}} : {}) },
});
