import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { exportArchitecture } from './architecture-export.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const command = process.argv[2] ?? 'dev';
const run = (args, env = {}) => {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });
  if (result.status !== 0) process.exit(result.status ?? 1);
};
if (command === 'dev') run(['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4196', '--strictPort'], { VITE_PRODUCT: 'prisma' });
else if (command === 'build' || command === 'desktop') {
  run(['node_modules/typescript/bin/tsc', '--noEmit']);
  run(['node_modules/vite/bin/vite.js', 'build', '--outDir', 'dist-arquitectura'], { VITE_PRODUCT: 'prisma', VITE_ARCHITECTURE_STANDALONE: '1' });
  renameSync(new URL('../dist-arquitectura/arquitectura.html', import.meta.url), new URL('../dist-arquitectura/index.html', import.meta.url));
  writeFileSync(new URL('../dist-arquitectura/LICENSE.txt', import.meta.url), readFileSync(new URL('../LICENSE', import.meta.url)));
  mkdirSync(join(root, 'dist-arquitectura/icons'), { recursive: true });
  for (const icon of ['prisma-192.png', 'prisma-512.png']) cpSync(join(root, 'public/icons', icon), join(root, 'dist-arquitectura/icons', icon));
  const notices = ['react', 'react-dom', 'scheduler', 'three', 'lucide-react', 'pdf-lib', '@pdf-lib/standard-fonts', '@pdf-lib/upng', 'pako', 'tslib'].map(name => { const folder = name === 'scheduler' ? join(realpathSync(join(root, 'node_modules/react-dom')), '..', name) : ['@pdf-lib/standard-fonts', '@pdf-lib/upng', 'pako', 'tslib'].includes(name) ? join(realpathSync(join(root, 'node_modules/pdf-lib')), '..', name) : join(root, 'node_modules', name); const file = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENSE-MIT', 'CopyrightNotice.txt'].find(file => existsSync(join(folder, file))); if (!file) throw Error('Falta licencia de ' + name); return `${name}\n${readFileSync(join(folder, file), 'utf8')}`; }).join('\n\n');
  writeFileSync(new URL('../dist-arquitectura/THIRD-PARTY-NOTICES.txt', import.meta.url), notices);
  const source = exportArchitecture(root);
  const files = ['src', 'tests', 'desktop', 'scripts', 'docs', 'public', 'index.html', 'vite.config.ts', 'tsconfig.json', 'package.json', 'package-lock.json', 'electron-builder-arquitectura.yml', 'LICENSE', 'README.md', '.gitignore'].filter(file => existsSync(join(source, file)));
  const packed = spawnSync(process.platform === 'win32' ? 'tar.exe' : 'tar', ['-czf', join(root, 'dist-arquitectura/prisma-arquitectura-source.tar.gz'), ...files], { cwd: source, stdio: 'inherit' });
  if (packed.status !== 0) throw Error('No se pudo empaquetar la fuente.');
  if (command === 'desktop') {
    cpSync(join(root, 'dist-arquitectura'), join(source, 'dist-arquitectura'), { recursive: true });
    run(['node_modules/electron-builder/out/cli/cli.js', '--projectDir', source, '--config', join(source, 'electron-builder-arquitectura.yml'), '--win', '--x64', ...(process.env.PRISMA_ELECTRON_DIST ? ['--config.electronDist=' + process.env.PRISMA_ELECTRON_DIST] : [])]);
    cpSync(join(source, 'release-arquitectura'), join(root, 'release-arquitectura'), { recursive: true });
  }
} else if (command === 'test') run(['node_modules/tsx/dist/cli.mjs', '--test', 'tests/architecture.test.ts']);
else if (command === 'source') console.log(exportArchitecture(root));
else throw Error('Usa dev, build, desktop, source o test.');
