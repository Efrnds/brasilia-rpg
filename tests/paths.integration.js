import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createGame, parseSave } from "../src/domain.js";

// This verifies DOM flows and the actual scene/simulation, without claiming GPU or layout validation.
const { Window } = await import(process.env.BRASILIA_DOM_MODULE || "happy-dom");
const window = new Window({
  url: "http://brasilia.local/?test=1",
  settings: { disableJavaScriptEvaluation: true },
});
window.document.write(
  await readFile(new URL("../index.html", import.meta.url), "utf8"),
);
const context = () =>
  new Proxy(
    {},
    {
      get: (object, key) => object[key] || (() => {}),
      set: (object, key, value) => {
        object[key] = value;
        return true;
      },
    },
  );
window.HTMLCanvasElement.prototype.getContext = context;
let frame;
Object.assign(globalThis, {
  window,
  document: window.document,
  location: window.location,
  localStorage: window.localStorage,
  innerWidth: 1440,
  innerHeight: 900,
  devicePixelRatio: 1,
  matchMedia: window.matchMedia.bind(window),
  requestAnimationFrame: (callback) => {
    frame = callback;
    return 1;
  },
});
window.__rendererFactory = () => ({
  shadowMap: {},
  setPixelRatio() {},
  setSize() {},
  render(scene, camera) {
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
  },
});
await import("../src/main.js");
const game = window.__game;
for (const chapter of [1, 2, 3]) {
  game.world.setChapter(
    (await import("../src/content.js")).CHAPTERS[chapter - 1],
  );
  const world = game.world,
    level = world.level,
    access = { permit: true, stage: "coffee", stamp: true };
  const spacing = 0.5,
    start = {
      x: Math.round(level.spawn.x / spacing),
      z: Math.round(level.spawn.z / spacing),
    },
    key = (p) => `${p.x},${p.z}`;
  const queue = [start],
    seen = new Set([key(start)]);
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const n = { x: p.x + dx, z: p.z + dz };
      if (
        seen.has(key(n)) ||
        !world.canWalk(n.x * spacing, n.z * spacing, access)
      )
        continue;
      seen.add(key(n));
      queue.push(n);
    }
  }
  for (const name of [
    "witness",
    "helper",
    "gatekeeper",
    "evidence",
    "sideItem",
    "collection",
    "boss",
  ]) {
    const target = level[name],
      reachable = queue.some(
        (p) =>
          Math.hypot(p.x * spacing - target.x, p.z * spacing - target.z) < 1.6,
      );
    console.log(chapter, name, reachable, queue.length);
    assert.ok(reachable, `Unreachable chapter ${chapter}: ${name}`);
  }
}
await window.happyDOM.abort();
