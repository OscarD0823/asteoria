/** Keep the editor, spelling engine and everyday fonts available offline first. */
export function requiredResources(names) {
  return names.filter(name => !/\.(ttf|otf|woff2?)$/i.test(name) ||
    /^fonts\/(Liberation(Sans|Serif|Mono)-|Carlito\/|Caladea\/|Arimo\/|NotoSans\/|NotoSerif\/|NotoSansMath\/|NotoSansSymbols2\/|NotoEmoji\/)/.test(name.replace(/^\.\.\//,'')));
}

// Updates must not wait for dictionaries, WASM engines, sounds or voice models.
// Those resources remain in the offline pack and are also cached when used.
export function bootResources(names) {
  return names.filter(name => name === 'index.html' ||
    /^assets\/.*\.(js|css)$/.test(name) ||
    /^[^/]+\.(css|svg|webmanifest)$/.test(name) ||
    /^(?:\.\.\/)?fonts\/fonts\.css$/.test(name));
}
