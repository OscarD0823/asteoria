import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { offlineWorker } from "../scripts/offline-worker.mjs";
import { requiredResources, bootResources } from "../scripts/offline-resources.mjs";
function harness() {
  const scope = "https://example.org/prisma/", stores = new Map<string, Map<string, Response>>();
  const events: Record<string, Function> = {}, downloads: string[] = [];
  let offline = false, quota = false, unavailable = "", activated = 0;
  const caches = {
    keys: async () => [...stores.keys()], delete: async (key: string) => stores.delete(key),
    open: async (key: string) => {
      if (!stores.has(key)) stores.set(key, new Map());
      return {
        keys: async () => [...stores.get(key)!.keys()].map(url => new Request(url)),
        match: async (url: string) => stores.get(key)?.get(url)?.clone(),
        put: async (url: string, value: Response) => {
          if (quota && (url.endsWith("extra.ttf") || url.endsWith('.data'))) throw new DOMException("full", "QuotaExceededError");
          stores.get(key)!.set(url, value.clone());
        },
      };
    },
  };
  const resources = { "index.html": "one", "fonts/Carlito/Regular.ttf": "base", "fonts/extra.ttf": "extra" };
  const load = (version = "one", hashes: Record<string,string> = resources) => vm.runInNewContext(offlineWorker(hashes, version, requiredResources(Object.keys(hashes))), {
    URL, Request, Response, Map, Set, JSON, Promise, caches, AbortController, setTimeout, clearTimeout,
    fetch: async (request: Request) => {
      downloads.push(request.url);
      if (offline) throw new Error("offline");
      return new Response(request.url, { status: request.url.endsWith(unavailable) && unavailable ? 503 : 200 });
    },
    self: { registration: { scope }, clients: { claim: async () => {} }, skipWaiting: async () => { activated++; }, addEventListener: (name: string, fn: Function) => { events[name] = fn; } },
  });
  const install = async () => {
    let promise: Promise<unknown> | undefined;
    events.install({ waitUntil: (value: Promise<unknown>) => { promise = value; } });
    await promise;
    events.activate({ waitUntil: (value: Promise<unknown>) => { promise = value; } });
    await promise;
  };
  const message = async (type: string) => {
    let promise: Promise<unknown> | undefined;
    const states: any[] = [];
    events.message({ data: { type }, ports: [{ postMessage: (state: unknown) => states.push(state) }], waitUntil: (value: Promise<unknown>) => { promise = value; } });
    await promise; return states;
  };
  const request = async (path: string, navigation = false) => {
    let response: Promise<Response> | undefined;
    const input = new Request(scope + path);
    if (navigation) Object.defineProperty(input, 'mode', {value:'navigate'});
    events.fetch({ request: input, respondWith: (value: Promise<Response>) => { response = value; } });
    return response;
  };
  return { scope, stores, downloads, load, install, message, request, events,
    setOffline: (value: boolean) => { offline = value; }, setQuota: (value: boolean) => { quota = value; },
    setUnavailable: (value: string) => { unavailable = value; }, activations: () => activated };
}
test("unused fonts cannot block installation; on-demand fonts work offline and survive an unchanged upgrade", async () => {
  const h = harness(); h.load(); h.setUnavailable("extra.ttf"); await h.install();
  assert.equal(h.downloads.length, 1);
  assert.equal((await h.message("prisma-offline-status")).at(-1).ready, false);
  assert.equal((await h.message("prisma-offline-status")).at(-1).shellReady, true);
  await h.request('fonts/Carlito/Regular.ttf');
  assert.equal(h.downloads.length, 2);
  assert.equal((await h.message("prisma-offline-status")).at(-1).ready, true);
  h.setUnavailable(""); await h.request("fonts/extra.ttf");
  h.setOffline(true);
  assert.equal(await (await h.request("fonts/extra.ttf"))?.text(), h.scope + "fonts/extra.ttf");
  h.downloads.length = 0; h.load("two"); await h.install();
  assert.equal(h.downloads.length, 0);
  assert.equal((await h.message("prisma-offline-status")).at(-1).cached, 3);
  assert.equal(await h.request("private.pdf"), undefined);
  assert.equal(await h.request("../writer/index.html"), undefined);
});
test("full-library download reports quota failures, retains the editor and can resume", async () => {
  const h = harness(); h.load(); await h.install(); await h.request('fonts/Carlito/Regular.ttf'); h.setQuota(true);
  const failed = (await h.message("prisma-cache-all")).at(-1);
  assert.equal(failed.ready, true); assert.equal(failed.downloading, false); assert.match(failed.error, /espacio/);
  assert.equal(failed.cached, 2);
  h.setQuota(false);
  const completed = (await h.message("prisma-cache-all")).at(-1);
  assert.equal(completed.cached, completed.total); assert.equal(completed.error, "");
  h.setOffline(true); assert(await h.request("index.html"));
});
test("an unavailable core update leaves the preceding application usable", async () => {
  const h = harness(); h.load(); await h.install();
  h.load("two", { "index.html": "changed", "fonts/Carlito/Regular.ttf": "base", "fonts/extra.ttf": "extra" });
  h.setUnavailable("index.html");
  await assert.rejects(h.install(), /index.html/);
  assert.equal(h.activations(), 1);
  assert(h.stores.get("prisma-code-" + encodeURIComponent(h.scope) + "-one")?.has(h.scope + "index.html"));
});
test("required resources include local spelling, PDF engines and essential faces but defer large fonts", () => {
  const names = ["index.html", "assets/editor.js", "engine/mupdf.wasm", "spelling/index.dic", "fonts/fonts.css", "fonts/LiberationSerif-Regular.ttf", "fonts/Carlito/Carlito-Bold.ttf", "fonts/NotoSansMath/NotoSansMath-Regular.ttf", "fonts/NotoSansSC/NotoSansSC-Regular.ttf", "fonts/PTSans/PTSans-Regular.ttf"];
  assert.deepEqual(requiredResources(names), names.slice(0, 8));
});

test('an unavailable engine, voice runtime or dictionary cannot prevent a mobile update', async () => {
  const h = harness(); h.load(); await h.install();
  h.load('new', { 'index.html': 'new', 'assets/app.js': 'js', 'fonts/Carlito/Regular.ttf': 'base', 'fonts/extra.ttf': 'extra', 'lore-audio/neural/voice.data': 'large' });
  h.setUnavailable('voice.data'); await h.install();
  assert.equal(h.activations(), 2);
  assert(!h.downloads.some(url => url.endsWith('voice.data')));
  const status = (await h.message('prisma-offline-status')).at(-1);
  assert.equal(status.shellReady, true);
  assert.equal(status.ready, false);
  assert.deepEqual(bootResources(['index.html', 'assets/app.js', 'assets/app.css', 'assets/engine.wasm', 'lore-audio/neural/voice.data', 'spelling/index.dic']), ['index.html', 'assets/app.js', 'assets/app.css']);
});

test('reopening gets fresh online HTML, keeps a coherent offline shell and survives HTTP failures', async () => {
  const h = harness(); h.load(); await h.install();
  const key = 'prisma-code-' + encodeURIComponent(h.scope) + '-one';
  h.stores.get(key)!.set(h.scope + 'index.html', new Response('saved shell'));
  assert.equal(await (await h.request('', true))?.text(), h.scope);
  // The online response may belong to a newer deployment. It must not replace
  // this worker's matching offline HTML before that deployment is installed.
  assert.equal(await h.stores.get(key)!.get(h.scope + 'index.html')!.clone().text(), 'saved shell');
  h.setOffline(true);
  assert.equal(await (await h.request('', true))?.text(), 'saved shell');
  h.setOffline(false); h.setUnavailable('index.html');
  assert.equal(await (await h.request('index.html', true))?.text(), 'saved shell');
});

test('audio setup downloads the complete app and local runtime, resumes after quota errors and survives offline', async()=>{
 const h=harness();h.load('audio',{'index.html':'html','assets/voice-worker.js':'worker','lore-audio/neural/piper-module.js':'piper','lore-audio/neural/piper_phonemize.data':'data','lore-audio/neural/runtime/ort.wasm':'wasm','lore-audio/catalog.json':'catalog','lore-audio/sound.ogg':'effect','lore-audio/neural/models/not-for-web.onnx':'huge','lore-audio/neural/model-cards/card.md':'card'});
 await h.install();h.setQuota(true);
 const failed=(await h.message('prisma-cache-audio')).at(-1);assert.equal(failed.ready,false);assert.match(failed.error,/espacio/);
 h.setQuota(false);const ready=(await h.message('prisma-cache-audio')).at(-1);
 assert.equal(ready.ready,true);assert.equal(ready.cached,ready.total);
 assert(!h.downloads.some(url=>url.endsWith('.onnx')||url.endsWith('.md')));
 h.setOffline(true);assert.equal((await h.message('prisma-audio-status')).at(-1).ready,true);
 assert.ok(await h.request('lore-audio/neural/piper_phonemize.data'));
 assert.ok(await h.request('lore-audio/neural/runtime/ort.wasm'));
 assert.ok(await h.request('lore-audio/sound.ogg'));
});
