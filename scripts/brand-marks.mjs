import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Original vector artwork: PDF establishes the tile, light and facet language.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const palettes = {
  writer: ['#264f50', '#122e35', '#0b202a', '#74dfd1', '#259c9c', '#abf0e5'],
  sheets: ['#2a5147', '#142f2b', '#0b221f', '#9de8b6', '#319b72', '#c1f3cf'],
  slides: ['#504264', '#2b203e', '#1d152d', '#d6afff', '#9560da', '#efc4f3'],
  data: ['#573d51', '#342335', '#231626', '#f2a4bc', '#bd5b90', '#ffcfdf'],
  publisher: ['#294f63', '#152f42', '#0c2031', '#89dfea', '#4097bd', '#b9f0f6'],
  prisma: ['#363954', '#20233e', '#13162d', '#c5aeff', '#7958de', '#e6d4ff'],
};
const document = `<path d="M87 47h57l43 43v102c0 11-9 20-20 20H87c-11 0-20-9-20-20V67c0-11 9-20 20-20Z" fill="url(#paper)"/>
  <path d="m144 47 43 43h-27c-9 0-16-7-16-16Z" fill="url(#fold)"/>
  <path d="M144 48v27c0 9 7 16 16 16h26" fill="none" stroke="#fff" stroke-width="1.5" stroke-opacity=".8"/>`;
const symbols = {
  writer: `${document}
    <path d="M91 81h28M91 103h48M91 120h62M91 137h41M91 184h48" stroke="#9bb8bd" stroke-width="5" stroke-linecap="round"/>
    <path d="m105 173 16-39 58-58 24 24-58 58Z" fill="url(#accent)"/>
    <path d="m121 134 58-58 12 12-58 58Z" fill="url(#light)"/>
    <path d="m133 146 58-58 12 12-58 58Z" fill="url(#deep)"/>
    <path d="m179 76 9-9c4-4 9-4 13 0l11 11c4 4 4 9 0 13l-9 9Z" fill="url(#fold)"/>
    <path d="m105 173 16-39 24 24Z" fill="#eefcf7"/>
    <path d="m105 173 6-15 9 9Z" fill="#26434c"/>
    <path d="m121 134 12 12 12 12M177 78l24 24" fill="none" stroke="#efffff" stroke-opacity=".8" stroke-width="1.5"/>
    <path d="m127 132 45-45" stroke="#fff" stroke-opacity=".65" stroke-width="2" stroke-linecap="round"/>`,
  sheets: `${document}
    <path d="M90 79h30" stroke="#a4beb0" stroke-width="5" stroke-linecap="round"/>
    <rect x="85" y="103" width="84" height="79" rx="7" fill="url(#deep)"/>
    <path d="M86 127h82M86 153h82M113 104v77M141 104v77" stroke="#d2f3df" stroke-width="2.5" stroke-opacity=".85"/>
    <path d="M114 129h25v22h-25Z" fill="#bcf3ca"/>
    <path d="m169 144 39 42-39 30-39-30Z" fill="url(#accent)"/>
    <path d="m169 144 39 42-39-12Z" fill="url(#light)"/>
    <path d="m130 186 39-12 39 12-39 30Z" fill="url(#deep)"/>
    <path d="m169 144 0 30 39 12M130 186l39-12v42" fill="none" stroke="#effff4" stroke-opacity=".65" stroke-width="1.5"/>
    <path d="m174 155 22 25" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>`,
  slides: `<path d="M127 159v41m-26 9 26-17 26 17" fill="none" stroke="url(#fold)" stroke-width="9" stroke-linecap="round"/>
    <rect x="51" y="58" width="154" height="113" rx="15" fill="url(#paper)"/>
    <path d="M67 81h55M67 96h39" stroke="#b4a5ce" stroke-width="5" stroke-linecap="round"/>
    <path d="M69 148v-24h16v24Zm27 0v-38h16v38Z" fill="url(#accent)"/>
    <path d="M139 78a29 29 0 1 0 29 29h-29Z" fill="url(#deep)"/>
    <path d="M144 73v29h29a29 29 0 0 0-29-29Z" fill="url(#light)"/>
    <path d="M57 162h144" stroke="#d2c7e7" stroke-width="2"/>
    <path d="m163 142 43 32-43 33Z" fill="url(#accent)"/>
    <path d="m163 142 43 32-28-1Z" fill="url(#light)"/>
    <path d="m163 207 15-34 28 1Z" fill="url(#deep)"/>
    <path d="m163 142 15 31-15 34M178 173l28 1" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>`,
  data: `<path d="M72 79v92c0 16 24 29 54 29s54-13 54-29V79Z" fill="url(#paper)"/>
    <path d="M126 79v121c30 0 54-13 54-29V79Z" fill="url(#fold)" opacity=".6"/>
    <ellipse cx="126" cy="79" rx="54" ry="27" fill="url(#light)"/>
    <ellipse cx="126" cy="79" rx="39" ry="17" fill="url(#accent)"/>
    <path d="M73 111c0 16 24 29 53 29s53-13 53-29M73 144c0 16 24 29 53 29s53-13 53-29" fill="none" stroke="#ae7e9b" stroke-opacity=".7" stroke-width="3"/>
    <path d="M86 104v11m0 22v11m0 22v9" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-opacity=".75"/>
    <path d="m170 143 39 22v44l-39 22-39-22v-44Z" fill="url(#accent)"/>
    <path d="m170 143 39 22-39 22-39-22Z" fill="url(#light)"/>
    <path d="M170 187v44l39-22v-44Z" fill="url(#deep)"/>
    <path d="m131 165 39 22 39-22M170 187v44" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="1.5"/>
    <circle cx="170" cy="165" r="5" fill="#fff"/>
    <path d="m153 192 16 9m0 0 16-9m-16 9v14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  publisher: `${document}
    <rect x="85" y="101" width="83" height="51" rx="5" fill="url(#deep)"/>
    <circle cx="145" cy="116" r="7" fill="url(#light)"/>
    <path d="m88 147 24-26 19 19 11-10 23 17Z" fill="url(#accent)"/>
    <path d="M88 169h31M88 181h24M134 169h31M134 181h23" stroke="#9cb6c9" stroke-width="4" stroke-linecap="round"/>
    <path d="M91 79h28" stroke="#9cb6c9" stroke-width="5" stroke-linecap="round"/>
    <path d="m171 144 39 42-39 29-39-29Z" fill="url(#accent)"/>
    <path d="m171 144 39 42-39-12Z" fill="url(#light)"/>
    <path d="m132 186 39-12 39 12-39 29Z" fill="url(#deep)"/>
    <path d="m171 144 0 30 39 12M132 186l39-12v41" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="1.5"/>
    <path d="M58 101V82h19M176 222h20v-19" fill="none" stroke="#a0d6ea" stroke-width="3" stroke-linecap="round"/>`,
  prisma: `<path d="m128 43 76 44v88l-76 44-76-44V87Z" fill="url(#accent)"/>
    <path d="m128 43 76 44-76 44-76-44Z" fill="url(#light)"/>
    <path d="M128 131v88l76-44V87Z" fill="url(#deep)"/>
    <path d="m52 87 76 44-41 22-35-22Z" fill="#a894eb"/>
    <path d="m128 43 0 88 76-44M52 87l76 44v88" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>
    <path d="m135 51 54 31" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>
    <path d="M91 174v-68h33c21 0 33 10 33 28s-12 28-33 28h-14v12Zm19-29h12c11 0 16-4 16-11s-5-11-16-11h-12Z" fill="url(#paper)"/>
    <path d="m128 43 0 23 42 24 21-8Z" fill="#b5eafa" opacity=".75"/>
    <path d="m52 175 35-22 41 24v42Z" fill="#e6a9d1" opacity=".4"/>`,
};

for (const [kind, [top, middle, bottom, accent, deep, light]] of Object.entries(palettes)) {
  const name = kind === 'prisma' ? 'Prisma' : `Prisma ${kind[0].toUpperCase() + kind.slice(1)}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="tile" x1="25" y1="17" x2="228" y2="246" gradientUnits="userSpaceOnUse"><stop stop-color="${top}"/><stop offset=".53" stop-color="${middle}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
    <linearGradient id="paper" x1="76" y1="51" x2="184" y2="210" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"/><stop offset="1" stop-color="#e7ecfa"/></linearGradient>
    <linearGradient id="fold" x1="143" y1="48" x2="185" y2="96" gradientUnits="userSpaceOnUse"><stop stop-color="${light}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
    <linearGradient id="accent" x1="80" y1="95" x2="188" y2="195" gradientUnits="userSpaceOnUse"><stop stop-color="${accent}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
    <linearGradient id="light" x1="105" y1="75" x2="189" y2="178" gradientUnits="userSpaceOnUse"><stop stop-color="${light}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
    <linearGradient id="deep" x1="104" y1="97" x2="191" y2="205" gradientUnits="userSpaceOnUse"><stop stop-color="${deep}"/><stop offset="1" stop-color="${middle}"/></linearGradient>
    <radialGradient id="glow" cx="73" cy="53" r="193" gradientUnits="userSpaceOnUse"><stop stop-color="${accent}" stop-opacity=".22"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <filter id="shadow" x="-35%" y="-25%" width="180%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#060b20" flood-opacity=".28"/></filter>
  </defs>
  <rect x="4" y="4" width="248" height="248" rx="59" fill="url(#tile)"/>
  <rect x="5" y="5" width="246" height="246" rx="58" fill="url(#glow)" stroke="${light}" stroke-opacity=".19" stroke-width="1.5"/>
  <g filter="url(#shadow)">${symbols[kind]}</g>
  <path d="m211 51 2 8 8 2-8 2-2 8-2-8-8-2 8-2Z" fill="${light}"/>
</svg>
`;
  writeFileSync(resolve(root, `public/${kind}-logo.svg`), svg);
  if (kind === 'prisma') writeFileSync(resolve(root, 'logo.svg'), svg);
}
console.log('Seis marcas originales, con el acabado de Prisma PDF.');
