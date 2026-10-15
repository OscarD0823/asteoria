import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import products from "./products.json";
import {resolve} from 'node:path';
import {realpathSync,readFileSync} from 'node:fs';
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
        html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+(products[kind]??products.pdf).name+' · BETA · Un universo para crear</title>');
        html=html.replaceAll('Asteoria Folio',(products[kind]??products.pdf).name);
        return html;
      },
    },
  ],
  base: "./",
  server: {fs:{allow:[process.cwd(),...Object.values(moduleAliases(process.cwd())).map(dir=>realpathSync(dir)),realpathSync('node_modules')]},watch: {ignored: ["**/dist/**", "**/dist-*/**", "**/release*/**", "**/qa/**", "**/android/**", "**/.prisma/architecture-source/**"]}},
  optimizeDeps: { entries: ["index.html"],include:['hunspell-asm'],esbuildOptions:{plugins:[{name:'prisma-proofing-development-interop',setup(build){build.onLoad({filter:/(?:hunspell-asm|emscripten-wasm-loader)[/\\].*\.js$/},args=>{const code=readFileSync(args.path,'utf8'),contents=code.replace("import * as nanoid from 'nanoid';","import nanoid from 'nanoid';").replace("import * as runtime from './lib/node/hunspell';","import runtime from './lib/node/hunspell';").replace("import * as unixify from 'unixify';","import unixify from 'unixify';");return{contents,loader:'js'};});}}]} },
  worker: { format: "es", plugins:()=>[proofingInterop()] },
  build: { chunkSizeWarningLimit: 1800, ...(architectureStandalone ? {rollupOptions:{input:resolve('arquitectura.html')}} : {}) },
});
