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
assert.ok(game, document.getElementById("error-message").textContent);
let time = 0;
const step = () => {
  time += 1000 / 60;
  frame(time);
};
const key = (code, type = "keydown") =>
  document.dispatchEvent(
    new window.KeyboardEvent(type, { code, bubbles: true }),
  );
const choices = () => [
  ...document.querySelectorAll("#dialogue-choices button"),
];
function walkTo(target) {
  const world = game.world,
    spacing = 0.5,
    point = (n) => ({ x: n.x * spacing, z: n.z * spacing }),
    id = (n) => `${n.x},${n.z}`;
  const start = {
      x: Math.round(game.state.position.x / spacing),
      z: Math.round(game.state.position.z / spacing),
    },
    queue = [start],
    parents = new Map([[id(start), null]]);
  let goal = null;
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i],
      p = point(node);
    if (Math.hypot(p.x - target.x, p.z - target.z) < 1.35) {
      goal = node;
      break;
    }
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const next = { x: node.x + dx, z: node.z + dz };
      if (
        parents.has(id(next)) ||
        !world.canTravel(p, point(next), game.state, 0.55)
      )
        continue;
      parents.set(id(next), node);
      queue.push(next);
    }
  }
  assert.ok(
    goal,
    `No walking route in chapter ${game.state.chapter}, stage ${game.state.stage} to ${JSON.stringify(target)}`,
  );
  const route = [];
  for (let n = goal; parents.get(id(n)); n = parents.get(id(n)))
    route.push(point(n));
  route.reverse();
  for (const destination of route) {
    let frames = 0;
    while (
      Math.hypot(
        destination.x - game.state.position.x,
        destination.z - game.state.position.z,
      ) > 0.13
    ) {
      const dx = destination.x - game.state.position.x,
        dz = destination.z - game.state.position.z;
      const codes = [];
      if (Math.abs(dx) > 0.06) codes.push(dx > 0 ? "KeyD" : "KeyA");
      if (Math.abs(dz) > 0.06) codes.push(dz > 0 ? "KeyS" : "KeyW");
      for (const code of codes) key(code);
      step();
      for (const code of codes) key(code, "keyup");
      assert.equal(game.mode, "play");
      assert.ok(
        ++frames < 100,
        `Player stuck at ${JSON.stringify(game.state.position)} toward ${JSON.stringify(destination)}`,
      );
    }
  }
  assert.ok(
    Math.hypot(
      target.x - game.state.position.x,
      target.z - game.state.position.z,
    ) < 1.6,
  );
}
function interactAt(target) {
  walkTo(target);
  key("KeyE");
  key("KeyE", "keyup");
}
function solveInvestigation() {
  while (
    game.mode === "dialogue" &&
    document.getElementById("speaker-name").textContent ===
      "Pasta de investigação"
  ) {
    const question = document.getElementById("speaker-role").textContent;
    choices()[
      question.includes("Qual trecho foi retirado")
        ? 1
        : question.includes("Qual registro revela")
          ? 2
          : question.includes("qual registro preservar")
            ? 1
            : 0
    ].click();
  }
}
game.start(createGame());
step();
for (let chapter = 1; chapter <= 3; chapter++) {
  const level = game.world.level;
  // Access is closed while visiting the witness and gathering evidence.
  interactAt(level.witness);
  assert.equal(game.mode, "dialogue");
  choices()[0].click();
  interactAt(level.evidence);
  solveInvestigation();
  assert.equal(game.state.stamp, true);
  interactAt(level.gatekeeper);
  assert.equal(game.mode, "dialogue");
  choices()[0].click();
  solveInvestigation();
  assert.equal(game.mode, "upgrade");
  document.getElementById("upgrade-power").click();
  interactAt(level.collection);
  if (chapter < 3) {
    assert.equal(game.mode, "interlude");
    document.getElementById("next-chapter-button").click();
    step();
  } else {
    assert.equal(game.mode, "dialogue");
    choices()[1].click();
    assert.equal(game.mode, "ending");
  }
  console.log(
    `PASS: chapter ${chapter} walked from spawn to evidence, gate and final collection without teleport`,
  );
}
assert.equal(game.state.history.length, 3);
const campaign = localStorage.getItem("brasilia-rpg-save-v2");
for (const [index, id] of ["prologue", "interlude", "aftermath"].entries()) {
  game.show("menu");
  document.querySelectorAll(".extra-case-menu button")[index].click();
  step();
  for (const point of game.world.level.points) {
    interactAt(point);
    solveInvestigation();
    assert.equal(game.mode, "dialogue");
    choices()[0].click();
  }
  assert.equal(localStorage.getItem(`brasilia-extra:${id}`), "complete");
  assert.equal(localStorage.getItem("brasilia-rpg-save-v2"), campaign);
  console.log(
    `PASS: ${id} walked and completed without teleport or campaign overwrite`,
  );
}
await window.happyDOM.abort();
