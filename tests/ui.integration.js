import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
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
const results = [];
const balance = [];
let verifiedImpact = false;

assert.equal(game.mode, "menu");
click("menu-help");
assert.equal(game.mode, "help");
click("help-back");
click("menu-settings");
document.getElementById("volume").value = "0";
document.getElementById("volume").dispatchEvent(new window.Event("input"));
click("settings-back");
click("new-game");
assert.equal(game.mode, "selection");
document.querySelector(`[data-character=${firstCharacter}]`).click();
click("start-game");
step();
assert.equal(game.mode, "play");
const beforeMove = game.state.position.z;
key("KeyW");
step(0.5);
key("KeyW", "keyup");
assert.ok(game.state.position.z < beforeMove);
key("KeyJ");
assert.equal(game.mode, "journal");
click("journal-back");
key("Escape");
assert.equal(game.mode, "pause");
const beforePause = game.state.elapsed;
step(2);
assert.equal(game.state.elapsed, beforePause);
click("pause-settings");
document.getElementById("difficulty").value = process.env.BRASILIA_NORMAL_COMBAT
  ? "normal"
  : "relaxed";
document.getElementById("difficulty").dispatchEvent(new window.Event("input"));
click("settings-back");
click("resume-game");
window.dispatchEvent(new window.Event("blur"));
assert.equal(game.mode, "pause");
click("resume-game");
results.push("Menu, selection, movement, journal, settings, pause and blur");

for (let chapter = 1; chapter <= 3; chapter++) {
  assert.equal(game.state.chapter, chapter);
  talk(game.world.level.helper.x, game.world.level.helper.z);
  choices()[0].click();
  assert.equal(game.state.sideQuest, "active");
  goTo(game.world.level.sideItem.x, game.world.level.sideItem.z);
  key("KeyE");
  key("KeyE", "keyup");
  solveInvestigation();
  assert.equal(game.state.sideQuest, "retrieved");
  talk(game.world.level.helper.x, game.world.level.helper.z);
  choices()[0].click();
  assert.equal(game.state.sideQuest, "complete");
  assert.equal(game.state.heals, 4);
  talk(game.world.level.witness.x, game.world.level.witness.z);
  choices()[0].click();
  goTo(game.world.level.evidence.x, game.world.level.evidence.z);
  key("KeyE");
  key("KeyE", "keyup");
  solveInvestigation();
  assert.equal(game.state.stamp, true);
  talk(game.world.level.gatekeeper.x, game.world.level.gatekeeper.z);
  choices()[0].click();
  solveInvestigation();
  assert.equal(game.mode, "upgrade");
  click(chapter === 2 ? "upgrade-vitality" : "upgrade-power");
  goTo(game.world.level.collection.x, game.world.level.collection.z);
  key("KeyE");
  key("KeyE", "keyup");
  if (chapter < 3) {
    assert.equal(game.mode, "interlude");
    click("next-chapter-button");
    step();
  } else {
    assert.equal(game.mode, "dialogue");
    choices()[1].click();
    assert.equal(game.mode, "ending");
  }
}
assert.equal(game.state.history.length, 3);
assert.equal(game.state.level, 4);
assert.equal(game.state.finalDecision, "mediate");
assert.match(document.getElementById("ending-title").textContent, /mesa/);
const completeRaw = game.checkpoint;
click("ending-menu");
click("continue-game");
assert.equal(game.mode, "ending");
results.push(
  "Three negotiated chapters, all six optional objectives, persistent upgrades, final mediation and reload",
);

click("ending-menu");
click("new-game");
document.querySelector(`[data-character=${secondCharacter}]`).click();
click("start-game");
assert.equal(game.mode, "dialogue");
key("Escape");
assert.equal(game.mode, "selection");
click("start-game");
choices()[0].click();
step();
assert.equal(game.state.character, secondCharacter);
for (let chapter = 1; chapter <= 3; chapter++) {
  const started = game.state.elapsed,
    oldStats = { ...game.state.statistics };
  talk(game.world.level.witness.x, game.world.level.witness.z);
  choices()[0].click();
  talk(game.world.level.gatekeeper.x, game.world.level.gatekeeper.z);
  choices()[0].click();
  assert.equal(game.state.stage, "arena");
  for (let loops = 0; loops < 250 && game.state.stage === "arena"; loops++) {
    const enemy = game.enemies.find((e) => e.hp > 0 && e.model.root.visible);
    if (!enemy) {
      step();
      continue;
    }
    goTo(enemy.model.root.position.x, enemy.model.root.position.z + 1.2);
    const hpBefore = enemy.hp;
    key("KeyF");
    step(0.1);
    if (!verifiedImpact) {
      assert.equal(game.player.action?.kind, "attack");
      assert.ok(
        Math.abs(game.player.body.rotation.y) > 0.1,
        "Windup must visibly rotate the body",
      );
      assert.ok(
        Math.abs(game.player.arms[1].rotation.x) > 1,
        "Attack must animate the arm",
      );
    }
    step(0.3);
    if (!verifiedImpact && enemy.hp < hpBefore) {
      assert.ok(
        game.world.numbers.length > 0,
        "Successful strikes must display damage numbers",
      );
      assert.ok(
        game.world.particles.length > 0,
        "Successful strikes must create material impact particles",
      );
      verifiedImpact = true;
    }
    key("KeyF", "keyup");
    if (game.state.hp < game.state.maxHp * 0.7) {
      key("Digit3");
      key("Digit3", "keyup");
    }
    assert.notEqual(
      game.mode,
      "defeat",
      `Lost chapter ${chapter} mob encounter`,
    );
  }
  assert.equal(game.state.stage, "boss");
  goTo(game.world.level.boss.x, game.world.level.boss.z + 5);
  assert.equal(game.mode, "dialogue");
  choices()[0].click();
  let summoned = false;
  for (let loops = 0; loops < 250 && game.state.stage === "boss"; loops++) {
    const enemy = game.enemies.find((e) => e.hp > 0 && e.model.root.visible);
    if (!enemy) {
      step();
      continue;
    }
    goTo(enemy.model.root.position.x, enemy.model.root.position.z + 1.4);
    for (const code of ["Digit1", "Digit2", "Digit4"]) {
      key(code);
      key(code, "keyup");
    }
    key("KeyF");
    step(0.4);
    key("KeyF", "keyup");
    if (game.state.hp < game.state.maxHp * 0.7) {
      key("Digit3");
      key("Digit3", "keyup");
    }
    summoned ||= game.enemies.some((e) => e.kind === "boss" && e.summoned);
    assert.notEqual(
      game.mode,
      "defeat",
      `Lost chapter ${chapter} boss encounter`,
    );
  }
  assert.equal(game.state.stage, "coffee");
  balance.push({
    chapter,
    seconds: Number((game.state.elapsed - started).toFixed(2)),
    skills: [0, 1, 2, 3].map(
      (i) =>
        (game.state.statistics[`skill${i}`] || 0) -
        (oldStats[`skill${i}`] || 0),
    ),
    received: (game.state.statistics.received || 0) - (oldStats.received || 0),
    attacks: game.state.statistics.attacks - oldStats.attacks,
    hits: game.state.statistics.hits - oldStats.hits,
    damage: game.state.statistics.damage - oldStats.damage,
    defeats: game.state.statistics.defeats - oldStats.defeats,
  });
  if (chapter === 3)
    assert.equal(summoned, true, "Third boss must call reinforcements");
  click("upgrade-power");
  goTo(game.world.level.collection.x, game.world.level.collection.z);
  key("KeyE");
  key("KeyE", "keyup");
  if (chapter < 3) {
    assert.equal(game.mode, "interlude");
    click("next-chapter-button");
    step();
  } else {
    assert.equal(game.mode, "dialogue");
    choices()[0].click();
    assert.equal(game.mode, "ending");
  }
}
assert.ok(verifiedImpact, "Combat feedback must be verified in a real strike");
assert.equal(game.state.history.filter((h) => h.route === "combat").length, 3);
assert.equal(game.state.finalDecision, "publish");
results.push(
  "Three combat chapters, skills, healing, all bosses and third-boss reinforcements",
);

const state = createGame("luli");
state.stage = "arena";
state.talked = true;
state.permit = true;
game.start(state);
step();
game.state.hp = 0;
step();
assert.equal(game.mode, "defeat");
click("retry-game");
assert.equal(game.mode, "play");
assert.equal(game.state.hp, game.state.maxHp);
key("KeyF");
step(0.05);
key("KeyF", "keyup");
click("pause-button");
click("return-menu");
game.start(createGame());
step(2);
assert.equal(game.state.hp, game.state.maxHp);
results.push(
  "Defeat, retry, and cancellation of a previous session’s pending attack",
);
assert.equal(parseSave(completeRaw).history.length, 3);
click("pause-button");
click("return-menu");
const savedBeforeTraining = localStorage.getItem("brasilia-rpg-save-v2");
click("training-start");
step();
assert.equal(game.world.practice, true);
assert.equal(game.state.stage, "arena");
game.state.attackCooldown = 0.09;
key("KeyF");
key("KeyF", "keyup");
step(0.12);
assert.equal(
  game.player.action?.kind,
  "attack",
  "Tap near recovery must be buffered",
);
step(0.6);
const trainStart = game.state.position.z;
key("KeyW");
step(3.8);
key("KeyW", "keyup");
assert.ok(
  game.state.position.z < -8,
  "Training corridor must work with movement keys, without teleport",
);
assert.ok(game.state.position.z < trainStart);
click("training-reset");
assert.ok(
  game.enemies.filter((e) => e.kind === "paper").every((e) => e.hp === e.maxHp),
);
click("training-character");
assert.equal(game.state.character, "folfonaro");
click("pause-button");
click("return-menu");
assert.equal(
  localStorage.getItem("brasilia-rpg-save-v2"),
  savedBeforeTraining,
  "Practice must preserve campaign save",
);
results.push(
  "Training movement without teleport, target reset, character swap and save isolation",
);
for (const line of results) console.log("PASS:", line);
await mkdir("test-results", { recursive: true });
await writeFile(
  `test-results/balance-${secondCharacter}-${process.env.BRASILIA_NORMAL_COMBAT ? "normal" : "relaxed"}.json`,
  JSON.stringify(
    {
      character: secondCharacter,
      difficulty: process.env.BRASILIA_NORMAL_COMBAT ? "normal" : "relaxed",
      method:
        "Automated scene simulation with fake renderer and teleport for combat setup; not a human session or GPU profile.",
      encounters: balance,
    },
    null,
    2,
  ),
);
await window.happyDOM.abort();
