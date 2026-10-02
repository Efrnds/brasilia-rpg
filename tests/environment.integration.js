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
const firstCharacter =
  process.env.BRASILIA_FIRST_CHARACTER === "folfonaro" ? "folfonaro" : "luli";
const secondCharacter = firstCharacter === "luli" ? "folfonaro" : "luli";
assert.ok(game, document.getElementById("error-message").textContent);
let time = 0;
const step = (seconds = 0.1) => {
  for (let i = 0; i < seconds / 0.05; i++) {
    time += 50;
    frame(time);
  }
};
const click = (id) => document.getElementById(id).click();
const key = (code, type = "keydown") =>
  document.dispatchEvent(
    new window.KeyboardEvent(type, { code, bubbles: true }),
  );
const choices = () => [
  ...document.querySelectorAll("#dialogue-choices button"),
];
const goTo = (x, z) => {
  game.teleport(x, z);
  step();
};
const talk = (x, z) => {
  goTo(x, z);
  key("KeyE");
  key("KeyE", "keyup");
  assert.equal(game.mode, "dialogue");
};
function solveInvestigation() {
  let guard = 0;
  while (
    game.mode === "dialogue" &&
    document.getElementById("speaker-name").textContent ===
      "Pasta de investigação"
  ) {
    assert.ok(++guard < 12, "Investigation must finish");
    const question = document.getElementById("speaker-role").textContent;
    const answer = question.includes("Qual trecho foi retirado")
      ? 1
      : question.includes("Qual registro revela")
        ? 2
        : question.includes("qual registro preservar")
          ? 1
          : 0;
    choices()[answer].click();
  }
}

const {
  reportTheft,
  enterPalace,
  clearEncounter,
  upgrade,
  recoverCoffee,
  nextChapter,
  collectStamp,
} = await import("../src/domain.js");
const { ENVIRONMENT_OBJECTS } = await import("../src/environment.js");
for (let chapter = 1; chapter <= 3; chapter++) {
  const state = createGame();
  for (let n = 1; n <= chapter; n++) {
    reportTheft(state);
    enterPalace(state, false);
    clearEncounter(state);
    clearEncounter(state);
    upgrade(state, "power");
    if (n < chapter) {
      recoverCoffee(state);
      nextChapter(state);
    }
  }
  collectStamp(state);
  game.start(state);
  step();
  for (const object of ENVIRONMENT_OBJECTS[chapter]) {
    let interacted = false;
    for (const [dx, dz] of [
      [0, 2],
      [2, 0],
      [0, -2],
      [-2, 0],
    ]) {
      goTo(object.point.x + dx, object.point.z + dz);
      if (
        document.querySelector("#interaction span").textContent !==
          object.name ||
        document.querySelector("#interaction").classList.contains("hidden")
      )
        continue;
      key("KeyE");
      key("KeyE", "keyup");
      solveInvestigation();
      interacted = !!game.state.environment[`${chapter}:${object.id}`];
      if (interacted) break;
    }
    assert.ok(
      interacted,
      `${chapter}:${object.id} must be reachable and change encounter state`,
    );
  }
  const raw = game.checkpoint,
    loaded = parseSave(raw);
  assert.deepEqual(loaded.environment, game.state.environment);
  assert.ok(game.state.secretFound.includes(`${chapter}:secret`));
  console.log(
    `PASS: chapter ${chapter} environment interactions, puzzle solutions and persistence`,
  );
}
await window.happyDOM.abort();
