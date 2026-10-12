/** Extract a face from an OpenType collection without changing its glyphs or metrics. */
export const MAX_FONT_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_FONT_COLLECTION_BYTES = 32 * 1024 * 1024;
const TTC = 0x74746366, HEAD = 0x68656164, DSIG = 0x44534947;
const align = (n: number) => (n + 3) & ~3;
function checksum(bytes: Uint8Array) {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 4) {
    const word = ((bytes[i] ?? 0) * 0x1000000 + (bytes[i + 1] ?? 0) * 0x10000 +
      (bytes[i + 2] ?? 0) * 0x100 + (bytes[i + 3] ?? 0)) >>> 0;
    sum = (sum + word) >>> 0;
  }
  return sum;
}
export function fontCollectionFaces(bytes: Uint8Array): Uint8Array[] {
  if (bytes.length < 12) throw Error('La fuente está incompleta.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0) !== TTC) {
    if (bytes.length > MAX_FONT_FILE_BYTES) throw Error('Elige fuentes TTF / OTF de hasta 8 MB por cara.');
    return [bytes];
  }
  if (bytes.length > MAX_FONT_COLLECTION_BYTES) throw Error('La colección de fuentes supera 32 MB.');
  const version = view.getUint32(4), count = view.getUint32(8);
  if (![0x00010000, 0x00020000].includes(version) || count < 1 || count > 64 || 12 + count * 4 > bytes.length)
    throw Error('La colección de fuentes no es válida.');
  let expanded = 0;
  return Array.from({length: count}, (_, index) => {
    const directory = view.getUint32(12 + index * 4);
    if (directory + 12 > bytes.length) throw Error('La colección de fuentes está incompleta.');
    const signature = view.getUint32(directory), tableCount = view.getUint16(directory + 4);
    if (![0x00010000, 0x4f54544f].includes(signature) || tableCount < 1 || tableCount > 4096 || directory + 12 + tableCount * 16 > bytes.length)
      throw Error('La colección contiene una cara no compatible.');
    const tables: {tag: number; bytes: Uint8Array}[] = [], seen = new Set<number>();
    let faceLength = 12 + tableCount * 16;
    for (let i = 0; i < tableCount; i++) {
      const record = directory + 12 + i * 16, tag = view.getUint32(record),
        offset = view.getUint32(record + 8), length = view.getUint32(record + 12);
      if (offset + length > bytes.length || seen.has(tag)) throw Error('La colección contiene tablas inválidas.');
      seen.add(tag);
      // A digital signature of the collection cannot authenticate the extracted file.
      if (tag !== DSIG) {
        faceLength += align(length);
        if (faceLength > MAX_FONT_FILE_BYTES) throw Error('Una cara de la colección supera 8 MB.');
        tables.push({tag, bytes: bytes.slice(offset, offset + length)});
      }
    }
    tables.sort((a,b) => a.tag - b.tag);
    const length = 12 + tables.length * 16 + tables.reduce((sum, table) => sum + align(table.bytes.length), 0);
    if (length > MAX_FONT_FILE_BYTES) throw Error('Una cara de la colección supera 8 MB.');
    expanded += length;
    if (expanded > 24 * 1024 * 1024) throw Error('Las caras de la colección superan los 24 MB del proyecto.');
    const output = new Uint8Array(length), out = new DataView(output.buffer), power = Math.floor(Math.log2(tables.length));
    out.setUint32(0, signature); out.setUint16(4, tables.length);
    out.setUint16(6, 2 ** power * 16); out.setUint16(8, power);
    out.setUint16(10, tables.length * 16 - 2 ** power * 16);
    let offset = 12 + tables.length * 16, headOffset: number | undefined;
    tables.forEach((table, i) => {
      if (table.tag === HEAD) {
        if (table.bytes.length < 12) throw Error('La tabla head está incompleta.');
        new DataView(table.bytes.buffer).setUint32(8, 0); headOffset = offset;
      }
      const record = 12 + i * 16;
      out.setUint32(record, table.tag); out.setUint32(record + 4, checksum(table.bytes));
      out.setUint32(record + 8, offset); out.setUint32(record + 12, table.bytes.length);
      output.set(table.bytes, offset); offset += align(table.bytes.length);
    });
    if (headOffset === undefined) throw Error('La fuente no contiene una tabla head válida.');
    out.setUint32(headOffset + 8, (0xb1b0afba - checksum(output)) >>> 0);
    return output;
  });
}
