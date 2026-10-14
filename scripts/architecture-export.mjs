import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
export const architectureVersion = '0.2.0';
// Export only the architecture source. No projects, toolchain caches or credentials.
export function exportArchitecture(root) {
  const target = join(root, '.prisma/architecture-source'); mkdirSync(target, { recursive: true });
  const copy = (from, to = from) => { mkdirSync(join(target, to, '..'), { recursive: true }); cpSync(join(root, from), join(target, to), { recursive: true }); };
  const write = (path, text) => { mkdirSync(join(target, path, '..'), { recursive: true }); writeFileSync(join(target, path), text); };
  copy('src/architecture'); copy('tests/architecture.test.ts'); copy('desktop/architecture.cjs'); copy('desktop/architecture-preload.cjs'); copy('LICENSE');
  copy('arquitectura.html', 'index.html'); copy('electron-builder-arquitectura.yml'); copy('docs/ANALISIS-PASCAL-Y-PRISMA-ARQUITECTURA.md');
  for (const icon of ['prisma.ico', 'prisma-192.png', 'prisma-512.png']) copy('public/icons/' + icon);
  const pinned = names => Object.fromEntries(names.map(name => [name, JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'))).version]));
  write('package.json', JSON.stringify({ name: 'prisma-arquitectura', version: architectureVersion, description: 'Editor local de planos, mobiliario, iluminación y recorridos 3D para Prisma.', license: 'AGPL-3.0-or-later', type: 'module', author: 'OscarD0823', main: 'desktop/architecture.cjs', scripts: { dev: 'vite --host 127.0.0.1 --port 4196', build: 'node scripts/build.mjs', test: 'tsx --test tests/architecture.test.ts', 'desktop:dev': 'electron .', 'desktop:build': 'npm run build && electron-builder --config electron-builder-arquitectura.yml --win --x64' }, dependencies: pinned(['react', 'react-dom', 'lucide-react', 'three', 'pdf-lib']), devDependencies: pinned(['@types/node', '@types/react', '@types/react-dom', '@types/three', '@vitejs/plugin-react', 'vite', 'typescript', 'tsx', 'electron', 'electron-builder']) }, null, 2) + '\n');
  write('vite.config.ts', "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({plugins:[react()],base:'./',define:{'import.meta.env.VITE_ARCHITECTURE_STANDALONE':JSON.stringify('1')},build:{outDir:'dist-arquitectura',chunkSizeWarningLimit:1800}});\n");
  write('tsconfig.json', JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, skipLibCheck: true, esModuleInterop: true, allowSyntheticDefaultImports: true, noEmit: true, types: ['vite/client', 'node'] }, include: ['src', 'tests', 'vite.config.ts'] }, null, 2) + '\n');
  write('.gitignore', 'node_modules/\ndist-arquitectura/\nrelease-arquitectura/\n*.log\n.DS_Store\n');
  write('scripts/build.mjs', `import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
const run = args => { const r = spawnSync(process.execPath, args, {stdio:'inherit'}); if(r.status !== 0) process.exit(r.status ?? 1); };
run(['node_modules/typescript/bin/tsc','--noEmit']);
run(['node_modules/vite/bin/vite.js','build']);
copyFileSync('LICENSE','dist-arquitectura/LICENSE.txt');
const notices = ['react','react-dom','scheduler','three','lucide-react','pdf-lib','@pdf-lib/standard-fonts','@pdf-lib/upng','pako','tslib'].map(name => { const file = ['LICENSE','LICENSE.md','LICENSE.txt','LICENSE-MIT','CopyrightNotice.txt'].find(file => existsSync('node_modules/'+name+'/'+file)); if(!file) throw Error('Falta licencia de '+name); return name+'\\n'+readFileSync('node_modules/'+name+'/'+file,'utf8'); }).join('\\n\\n');
writeFileSync('dist-arquitectura/THIRD-PARTY-NOTICES.txt',notices);
const files = ['src','tests','desktop','scripts','docs','public','index.html','vite.config.ts','tsconfig.json','package.json','package-lock.json','electron-builder-arquitectura.yml','LICENSE','README.md','.gitignore'].filter(existsSync);
const result = spawnSync(process.platform==='win32'?'tar.exe':'tar',['-czf','dist-arquitectura/prisma-arquitectura-source.tar.gz',...files],{stdio:'inherit'});
if(result.status !== 0) throw Error('No se pudo generar el archivo de código fuente.');
`);
  write('.github/workflows/pages.yml', `name: Publicar Prisma Arquitectura
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      ELECTRON_SKIP_BINARY_DOWNLOAD: '1'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist-arquitectura
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Desplegar
        id: deployment
        uses: actions/deploy-pages@v4
`);
  write('README.md', `# Prisma Arquitectura ${architectureVersion}

[Abrir editor web](https://oscard0823.github.io/prisma-arquitectura/) · [Descargar Windows](https://github.com/OscarD0823/prisma-arquitectura/releases/latest) · [Suite Prisma](https://oscard0823.github.io/prisma/)

Editor de planos, espacios y mobiliario con procesamiento local. Usa el logo y la pantalla de inicio de la familia Prisma PDF.

- Dibuja espacios rectangulares, muros, puertas y ventanas en 2D o 3D.
- Agrega, arrastra, eleva, gira, escala, duplica y elimina muebles directamente en 3D, con historial para deshacer.
- Trabaja en m/cm/mm con ajuste configurable de 1 cm a 1 m y mediciones entre superficies en tres dimensiones.
- Ajusta materiales del suelo, sol, ambiente, exposición y hasta 16 lámparas por planta (puntual, foco o panel). Las primeras cuatro luces puntuales o focos habilitados pueden proyectar sombras; los paneles no.
- Recorre la planta con WASD/flechas y arrastra para mirar. El recorrido aplica colisiones básicas de muros, puertas y muebles.
- Renderiza la cámara actual a Full HD, QHD o 4K, con materiales, sombras y oclusión ambiental; exporta PNG.
- Exporta PDF vectorial A3/A4 a 1:20, 1:25, 1:50, 1:75, 1:100 o 1:200, además de SVG, superficies CSV y el proyecto editable.
- Guarda proyectos en el dispositivo. Importa archivos v1 y los migra a v2 conservando las medidas y las referencias de las aberturas.
- Versión Windows x64 instalable o portátil, con asociación del archivo .prisma-arquitectura y editor completo sin Internet.

## Ejecutar y compilar

Requiere Node.js 22 o posterior.

\`\`\`sh
npm ci
npm run dev
npm test
npm run build
\`\`\`

La web compilada está en dist-arquitectura. Para generar Windows, ejecuta npm run desktop:build en Windows. npm run desktop:dev abre el editor después de compilar. El instalador y el ejecutable portátil se generan en release-arquitectura.

## Uso

Selecciona un mueble del catálogo y haz clic en el suelo 3D. Pulsa V para seleccionar; arrastra la pieza por el suelo o usa G (mover), R (girar) y T (escalar). Los campos de Propiedades permiten introducir dimensiones exactas. Supr elimina la selección y Ctrl+Z deshace. Recorrer coloca la cámara a la altura indicada en Luz. Esc regresa al editor. Encuadra la cámara antes de generar un render, también durante el recorrido.

Al imprimir un PDF, utiliza 100 % y desactiva el ajuste a la página. La barra métrica permite comprobar la escala. Si el plano no cabe en el papel, se muestra el error y se conserva la escala elegida.

## Alcance

Versión inicial utilizable. Los espacios son rectangulares, las coincidencias de muros se resuelven para lados completos y la vista muestra una planta cada vez. No hay IFC/BIM, DWG/DXF, escaleras, análisis estructural, trazado de rayos ni comprobación normativa. El render utiliza Three.js con sombras y oclusión ambiental. Las áreas corresponden a las dimensiones del espacio, sin descontar muros. El recorrido no simula física completa. La web necesita cargar desde GitHub Pages; la edición no transmite los proyectos. Windows lleva todos sus recursos y funciona sin conexión.

## Fuente y licencia

La fuente canónica está en [OscarD0823/prisma](https://github.com/OscarD0823/prisma/tree/main/src/architecture). Este repositorio es la exportación independiente generada mediante scripts/architecture-export.mjs: contiene la misma implementación que la suite. Las mejoras deben hacerse en la fuente canónica y exportarse de nuevo. El análisis de [Pascal](https://github.com/pascalorg/editor) está en docs/ANALISIS-PASCAL-Y-PRISMA-ARQUITECTURA.md. Es una implementación propia; no importa el formato Pascal ni copia sus modelos o catálogo.

AGPL-3.0-or-later. Las bibliotecas de terceros conservan sus licencias en THIRD-PARTY-NOTICES.txt dentro de la aplicación compilada. El código fuente correspondiente se incluye en la web y en Windows como prisma-arquitectura-source.tar.gz. Autor: OscarD0823.
`);
  return target;
}
