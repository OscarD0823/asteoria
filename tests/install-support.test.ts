import test from "node:test";
import assert from "node:assert/strict";
test("installation captures an early event and never reuses a dismissed or failed prompt", async () => {
  const target = new EventTarget();
  Object.defineProperty(globalThis, "window", { configurable: true, value: target });
  const support = await import("@prisma/core/install-support");
  let calls = 0, notifications = 0;
  const unsubscribe = support.subscribeInstall(() => notifications++);
  const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
    prompt: async () => { calls++; }, userChoice: Promise.resolve({ outcome: "dismissed" as const }),
  });
  target.dispatchEvent(event);
  assert(event.defaultPrevented);
  assert(support.canPromptInstall());
  assert.equal(await support.promptInstall(), "dismissed");
  assert.equal(await support.promptInstall(), null);
  assert.equal(calls, 1);
  const failed = Object.assign(new Event("beforeinstallprompt"), {
    prompt: async () => { throw new Error("unsupported"); }, userChoice: Promise.resolve({ outcome: "dismissed" as const }),
  });
  target.dispatchEvent(failed);
  await assert.rejects(support.promptInstall(), /unsupported/);
  assert.equal(support.canPromptInstall(), false);
  assert.equal(notifications, 4);
  unsubscribe();
  delete (globalThis as { window?: unknown }).window;
});

test('a worker upgrade is remembered across editor mounts, without reloading an unsaved document', async () => {
  const support = await import('@prisma/core/install-support');
  const target = Object.assign(new EventTarget(), {controller:null as unknown});
  const stop = support.trackWorkerUpdates(target as ServiceWorkerContainer);
  let notices = 0;
  const unsubscribe = support.subscribeAppUpdates(() => notices++);
  target.controller = {scriptURL:'https://example.org/sw.js'};
  target.dispatchEvent(new Event('controllerchange'));
  assert.equal(support.appUpdateReady(), false);
  target.controller = {scriptURL:'https://example.org/sw.js'};
  target.dispatchEvent(new Event('controllerchange'));
  assert.equal(support.appUpdateReady(), true);
  assert.equal(notices, 1);
  unsubscribe(); stop();
});
