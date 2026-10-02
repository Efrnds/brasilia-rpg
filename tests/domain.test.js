import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  tickState,
  useSkill,
  dodge,
  receiveDamage,
  restoreEncounter,
  parseSave,
  snapshot,
  upgrade,
} from "../src/domain.js";

test("skills enforce costs, cooldowns, healing charges and one ultimate per encounter", () => {
  const state = createGame();
  assert.equal(useSkill(state, 0).ok, true);
  assert.equal(state.stamina, 84);
  assert.equal(useSkill(state, 0).ok, false);
  state.hp = 50;
  assert.equal(useSkill(state, 2).ok, true);
  assert.equal(state.hp, 82);
  assert.equal(state.heals, 2);
  state.cooldowns[2] = 0;
  state.heals = 0;
  assert.equal(useSkill(state, 2).ok, false);
  state.stamina = 100;
  assert.equal(useSkill(state, 3).ok, true);
  assert.equal(useSkill(state, 3).ok, false);
  restoreEncounter(state);
  assert.equal(useSkill(state, 3).ok, true);
});
test("dodge protects, requires stamina and cannot be spammed", () => {
  const state = createGame();
  assert.equal(dodge(state), true);
  assert.equal(dodge(state), false);
  assert.equal(receiveDamage(state, 90), 0);
  for (let i = 0; i < 20; i++) tickState(state, 0.05);
  assert.equal(receiveDamage(state, 20), 20);
  assert.equal(receiveDamage(state, 20), 0);
  state.stamina = 0;
  assert.equal(dodge(state), false);
});
test("defense consumes stamina; relaxed difficulty reduces damage", () => {
  const state = createGame();
  assert.equal(receiveDamage(state, 24, true), 6);
  assert.equal(state.stamina, 88);
  state.invulnerable = 0;
  state.stamina = 0;
  assert.equal(receiveDamage(state, 24, true), 24);
  state.invulnerable = 0;
  assert.equal(receiveDamage(state, 24, false, "relaxed"), 13);
});
test("large frame delays are bounded and expired effects never go negative", () => {
  const state = createGame();
  state.stamina = 0;
  state.cooldowns[0] = 0.01;
  tickState(state, 600);
  assert.equal(state.elapsed, 0.05);
  assert.equal(state.cooldowns[0], 0);
  assert.equal(state.stamina, 1.1);
});
test("saves restore checkpoint resources and apply upgrades once", () => {
  const state = createGame("folfonaro");
  state.stage = "coffee";
  state.talked = true;
  state.permit = true;
  assert.equal(upgrade(state, "vitality"), true);
  assert.equal(upgrade(state, "vitality"), false);
  state.hp = 10;
  state.heals = 0;
  state.ultimateUsed = true;
  const restored = parseSave(JSON.stringify(snapshot(state)));
  assert.equal(restored.maxHp, 145);
  assert.equal(restored.hp, 145);
  assert.equal(restored.heals, 3);
  assert.equal(restored.ultimateUsed, false);
  assert.equal(restored.level, 2);
});
test("saves reject corruption, unknown versions and impossible progress", () => {
  assert.throws(() => parseSave("{"));
  assert.throws(() => parseSave("null"));
  assert.throws(() => createGame("constructor"));
  const base = snapshot(createGame());
  assert.throws(() =>
    parseSave(JSON.stringify({ ...base, character: "__proto__" })),
  );
  assert.throws(() => parseSave(JSON.stringify({ ...base, version: 1 })));
  assert.throws(() => parseSave(JSON.stringify({ ...base, polarization: -1 })));
  assert.throws(() => parseSave(JSON.stringify({ ...base, stage: "boss" })));
  assert.throws(() => parseSave(JSON.stringify({ ...base, negotiated: true })));
});
