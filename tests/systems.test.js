import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  snapshot,
  parseSave,
  skillFor,
  useSkill,
  collectStamp,
  advanceSideQuest,
  upgrade,
  receiveDamage,
} from "../src/domain.js";
import { equipSkill, equipItem, awardItem, useSupport } from "../src/rpg.js";
import { SaveRepository, SLOT_KEYS } from "../src/persistence.js";
import { InputBindings } from "../src/input.js";
import { CASES, EDIT_STEPS, evaluateAnswer } from "../src/investigation.js";
import { attackHits, attackFor } from "../src/encounters.js";
import { CHAPTERS } from "../src/content.js";
test("equipment and specialization alter actions and persist in v4", () => {
  let s = createGame();
  collectStamp(s);
  assert.equal(s.equipment.instrument, "folder");
  awardItem(s, "microphone");
  equipItem(s, "microphone");
  const base = skillFor(s, 0).range;
  upgrade(s, "power");
  assert.ok(skillFor(s, 0).range > base);
  s = parseSave(JSON.stringify(snapshot(s)));
  assert.equal(s.equipment.instrument, "microphone");
  assert.equal(s.specialization, "power");
  assert.equal(s.version, 4);
});
test("loadout can equip two new skills, prevents duplicates and rejects invalid state", () => {
  const s = createGame();
  assert.equal(equipSkill(s, 1, 4), true);
  assert.equal(equipSkill(s, 0, 4), false);
  assert.equal(skillFor(s, 1).interrupt, true);
  equipSkill(s, 3, 5);
  assert.equal(useSkill(s, 3).ok, true);
  assert.equal(s.shield, 6);
  const data = snapshot(s);
  data.loadout = [0, 0, 1, 2];
  assert.throws(() => parseSave(JSON.stringify(data)), /Habilidades/);
});
test("support and gear provide limited useful rewards", () => {
  const s = createGame();
  for (let i = 0; i < 3; i++) advanceSideQuest(s);
  s.hp = 40;
  assert.equal(useSupport(s), "nair");
  assert.equal(s.hp, 60);
  assert.equal(useSupport(s), false);
  assert.ok(s.owned.includes("thermos"));
  s.shield = 0;
  s.stamina = 10;
  assert.ok(receiveDamage(s, 20, true) > 0);
  assert.ok(s.guardBreak > 0);
});
test("three slots isolate campaigns and invalid imports cannot overwrite a slot", () => {
  const map = new Map(),
    storage = {
      getItem: (k) => map.get(k) || null,
      setItem: (k, v) => map.set(k, v),
    },
    repo = new SaveRepository(storage);
  repo.write(createGame("luli"));
  repo.select(1);
  repo.write(createGame("folfonaro"));
  const before = repo.read();
  assert.throws(() => repo.import("{bad"));
  assert.equal(repo.read(), before);
  assert.equal(parseSave(map.get(SLOT_KEYS[0])).character, "luli");
  assert.equal(parseSave(map.get(SLOT_KEYS[1])).character, "folfonaro");
  assert.equal(repo.summary(2), "Vazio");
});
test("key remapping is conflict checked and preserves skill keys", () => {
  const input = new InputBindings();
  assert.equal(input.rebind("forward", "KeyQ").ok, false);
  assert.equal(input.rebind("forward", "KeyZ").ok, true);
  assert.equal(input.canonical("KeyZ"), "KeyW");
  assert.equal(input.canonical("KeyW"), null);
  assert.equal(input.rebind("attack", "Digit1").ok, false);
});
test("investigation requires chronology and accepts correction without fake proof", () => {
  assert.equal(evaluateAnswer(EDIT_STEPS[0], "argument"), false);
  assert.equal(evaluateAnswer(EDIT_STEPS[0], "delivery"), true);
  assert.equal(evaluateAnswer(CASES[3], "a"), false);
  assert.equal(evaluateAnswer(CASES[3], "c"), true);
});
test("boss lines and rings offer distinct safe positions and environment weakens amplification", () => {
  const s = createGame(),
    enemy = { kind: "boss", sequence: 1, armsDisabled: 0 };
  const a = attackFor(enemy, CHAPTERS[1], s);
  assert.equal(a.shape, "line");
  assert.equal(a.center, "boss");
  assert.equal(attackHits(a, { x: 0, z: 0 }, { x: 0, z: -5 }, 0), true);
  assert.equal(attackHits(a, { x: 0, z: 0 }, { x: 3, z: -5 }, 0), false);
  s.environment["2:broadcast"] = true;
  assert.ok(attackFor(enemy, CHAPTERS[1], s).damage < a.damage);
  assert.equal(
    attackHits(
      { shape: "ring", radius: 6, innerRadius: 2 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      0,
    ),
    false,
  );
});
