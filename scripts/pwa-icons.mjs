import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const sharp = require(process.env.PRISMA_SHARP_PATH || "sharp");
// Render our own SVG marks inside the central maskable safe area.
for (const [logo, folder, color] of [
  ["logo.svg", "icons", "#171f39"],
  ["writer-logo.svg", "writer-icons", "#122e35"],
  ["sheets-logo.svg", "sheets-icons", "#142f2b"],
  ['slides-logo.svg','slides-icons','#2b203e'],
  ['data-logo.svg','data-icons','#342335'],
  ['publisher-logo.svg','publisher-icons','#152f42'],
  ['prisma-logo.svg','prisma-icons','#20233e'],
]) {
  const source = readFileSync("public/" + logo).toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="${color}"/><image href="data:image/svg+xml;base64,${source}" x="92" y="92" width="328" height="328"/></svg>`;
  await sharp(Buffer.from(svg)).png().toFile("public/" + folder + "/prisma-maskable-512.png");
}
