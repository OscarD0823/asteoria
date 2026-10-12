import { spawnSync } from "node:child_process";
import { copyFileSync } from "node:fs";
import { resolve, join } from "node:path";
import {appKinds} from './workspace-core.mjs';
import {buildProvenance} from './build-provenance.mjs';
import {writeFileSync} from 'node:fs';
const output = resolve(process.env.PRISMA_OUTDIR || "dist");
copyFileSync("LICENSE", join(output, "LICENSE.txt"));
const files = [
  ".gitignore",
  "LICENSE",
  "README.md",
  "README-academic.md",
  "README-word.md",
  "README-writer.md",
  "README-office.md",
  "README-sheets.md",
  "README-install.md",
  "README-references.md",
  "README-integrations.md",
  "README-office-analysis.md",
  "README-programming.md",
  "README-prisma.md",
  "README-workspace.md",
  "docs",
  "package.json",
  "products.json",
  "workspace.lock.json",
  "workspace-ownership.json",
  "prisma.code-workspace",
  "workspace-source.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.json",
  "vite.config.ts",
  "index.html",
  "src",
  "tests",
  "scripts",
  "desktop",
  "vendor/dictionaries",
  "engines",
  "capacitor.config.ts",
  "electron-builder.yml",
  "electron-builder-writer.yml",
  "electron-builder-sheets.yml",
  "electron-builder-slides.yml",
  "electron-builder-data.yml",
  "electron-builder-publisher.yml",
  "electron-builder-prisma.yml",
  ".github",
  "android",
  "public/logo.svg",
  "public/icons",
  "public/fonts",
  "public/manifest.webmanifest",
  "public/licencias.txt",
  "public/credits.html",
  "public/version.json",
  "public/third-party",
  "public/spelling",
  "public/unicode",
  "public/ocr",
  "public/writer-logo.svg",
  "public/writer-icons",
  "public/sheets-logo.svg",
  "public/sheets-icons",
  "public/slides-logo.svg",
  "public/slides-icons",
  "public/data-logo.svg",
  "public/data-icons",
  "public/publisher-logo.svg",
  "public/publisher-icons",
  "public/prisma-logo.svg",
  "public/pdf-logo.svg",
  "public/prisma-icons",
];
writeFileSync('workspace-source.json',JSON.stringify(buildProvenance(),null,2)+'\n');
for(const kind of appKinds)for(const file of ['src','tests','tools','package.json','README.md','LICENSE','.gitignore']){
  const target='.prisma/apps/'+kind+'/'+file;
  if((await import('node:fs')).existsSync(target))files.push(target);
}
const excludes = [
  "scripts/__pycache__",
  "android/.gradle",
  "android/build",
  "android/app/build",
  "android/local.properties",
  "android/app/src/main/assets/public",
  "android/capacitor-cordova-android-plugins",
].map((path) => "--exclude=" + path);
const result = spawnSync(
  process.platform === "win32" ? "tar.exe" : "tar",
  ["-chzf", join(output, "prisma-pdf-source.tar.gz"), ...excludes, ...files],
  { stdio: "inherit" },
);
if (result.status !== 0)
  throw new Error("No se pudo empaquetar el código fuente.");
