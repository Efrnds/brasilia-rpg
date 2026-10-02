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

function clickText(parent, text) {
  const b = [...document.querySelectorAll(`${parent} button`)].find((b) =>
    b.textContent.includes(text),
  );
  assert.ok(b, text);
  b.click();
}
click("training-start");
step();
const saveBefore = localStorage.getItem("brasilia-rpg-save-v2");
key("KeyR");
key("KeyR", "keyup"); // No reachable target must be safe.
game.state.dodgeCooldown = 0.09;
const dodges = game.state.statistics.dodges;
key("Space");
key("Space", "keyup");
step(0.15);
assert.equal(
  game.state.statistics.dodges,
  dodges + 1,
  "Dodge tap near recovery must execute once",
);
step(0.9);
assert.equal(
  game.state.statistics.dodges,
  dodges + 1,
  "Dodge buffer cannot repeat",
);
click("pause-button");
clickText("#pause", "Habilidades e equipamento");
assert.equal(game.mode, "loadout");
let select = document.querySelector("#loadout select");
select.value = "4";
select.dispatchEvent(new window.Event("change"));
assert.equal(game.state.loadout[0], 4);
key("Escape");
assert.equal(game.mode, "play");
game.state.support = "nair";
game.state.hp = 30;
key("KeyC");
key("KeyC", "keyup");
assert.equal(game.state.hp, 50);
key("KeyC");
key("KeyC", "keyup");
assert.equal(game.state.hp, 50, "Support cannot repeat before cooldown");
click("pause-button");
click("pause-settings");
document.querySelector('[data-binding="forward"]').click();
key("KeyZ");
key("KeyZ", "keyup");
click("settings-back");
click("resume-game");
let z = game.state.position.z;
key("KeyW");
step(0.5);
key("KeyW", "keyup");
assert.ok(Math.abs(game.state.position.z - z) < 0.01, "Old binding disabled");
key("KeyZ");
step(0.5);
key("KeyZ", "keyup");
assert.ok(game.state.position.z < z - 0.8, "New binding moves");
click("pause-button");
click("pause-settings");
clickText("#settings", "Restaurar teclas");
click("settings-back");
click("resume-game");
game.show("menu");
document.querySelectorAll(".extra-case-menu button")[0].click();
step();
talk(-6, 8);
clickText("#dialogue", "Histórico da conversa");
assert.equal(game.mode, "conversation-log");
key("Escape");
assert.equal(game.mode, "dialogue");
choices()[0].click();
assert.equal(game.mode, "play");
assert.equal(localStorage.getItem("brasilia-rpg-save-v2"), saveBefore);
game.show("menu");
document.querySelectorAll(".extra-case-menu button")[3].click();
step();
for (const enemy of game.enemies.filter((e) => e.kind === "paper"))
  enemy.hp = 1;
for (const enemy of game.enemies.filter((e) => e.kind === "paper")) {
  goTo(enemy.model.root.position.x, enemy.model.root.position.z + 1);
  game.basicAttack();
  step(0.8);
}
step(0.2);
assert.equal(game.mode, "dialogue");
assert.ok(localStorage.getItem("brasilia-challenge-best"));
assert.equal(localStorage.getItem("brasilia-rpg-save-v2"), saveBefore);
const counts = [];
for (let repeat = 0; repeat < 5; repeat++) {
  for (let chapter = 1; chapter <= 3; chapter++) {
    const state = createGame();
    state.chapter = chapter;
    game.start(state, null, { training: true });
    step(0.05);
  }
  let count = 0;
  game.world.scene.traverse((o) => {
    if (o.isMesh) count++;
  });
  counts.push(count);
}
assert.ok(
  counts.every((c) => c === counts[0]),
  "Repeated scene swaps must retain a bounded live mesh count",
);
console.log(
  "PASS: loadout, support cooldown, remapping, dialogue return, challenge result and save isolation",
);
await window.happyDOM.abort();
