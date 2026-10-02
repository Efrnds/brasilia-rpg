import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  reportTheft,
  collectStamp,
  enterPalace,
  clearEncounter,
  upgrade,
  recoverCoffee,
  nextChapter,
  parseSave,
  snapshot,
  damageMultiplier,
  advanceSideQuest,
  restoreEncounter,
} from "../src/domain.js";
import { CHAPTERS, campaignEnding } from "../src/content.js";

for (const character of ["luli", "folfonaro"]) {
  for (const route of ["combat", "negotiated"]) {
    test(`${character}: all three chapters complete by ${route}, with persistent upgrades and saves`, () => {
      let state = createGame(character);
      for (let chapter = 1; chapter <= 3; chapter++) {
        assert.equal(state.chapter, chapter);
        assert.equal(enterPalace(state), false);
        assert.equal(reportTheft(state), true);
        assert.equal(reportTheft(state), false);
        if (route === "negotiated") collectStamp(state);
        assert.equal(enterPalace(state, route === "negotiated"), true);
        if (route === "combat") {
          assert.equal(state.stage, "arena");
          clearEncounter(state);
          assert.equal(state.stage, "boss");
          clearEncounter(state);
        }
        assert.equal(state.stage, "coffee");
        assert.equal(
          upgrade(state, chapter === 2 ? "vitality" : "power"),
          true,
        );
        assert.equal(recoverCoffee(state), true);
        assert.equal(recoverCoffee(state), false);
        assert.equal(state.history.length, chapter);
        state = parseSave(JSON.stringify(snapshot(state)));
        assert.equal(state.level, chapter + 1);
        if (chapter < 3) assert.equal(nextChapter(state), true);
      }
      assert.equal(nextChapter(state), false);
      assert.equal(state.upgrades.length, 3);
      assert.equal(damageMultiplier(state), 1.5);
      assert.equal(
        state.history.filter((h) => h.evidence).length,
        route === "negotiated" ? 3 : 0,
      );
    });
  }
}
test("each boss has distinct attacks and each chapter explains its destination", () => {
  assert.equal(new Set(CHAPTERS.map((c) => c.bossName)).size, 3);
  assert.equal(
    new Set(CHAPTERS.flatMap((c) => c.attacks.map((a) => a.name))).size,
    8,
  );
  for (const c of CHAPTERS) {
    assert.ok(c.clueText.length > 100);
    for (const attack of c.attacks)
      assert.ok(attack.radius > 0 && attack.windup >= 1 && attack.recovery > 1);
  }
});
test("endings incorporate evidence, agreements, polarization and the final decision", () => {
  const state = createGame();
  state.chapter = 3;
  state.history = [1, 2, 3].map((chapter) => ({
    chapter,
    route: "negotiated",
    evidence: true,
    polarization: 20,
  }));
  assert.equal(campaignEnding(state, "publish").type, "Esclarecimento");
  state.polarization = 90;
  assert.equal(campaignEnding(state, "publish").type, "Repercussão");
  assert.equal(campaignEnding(state, "mediate").type, "Conciliação");
  const withProof = campaignEnding(state, "mediate").text;
  state.history[0].evidence = false;
  assert.notEqual(campaignEnding(state, "mediate").text, withProof);
});
test("legacy single-chapter saves migrate without losing progress", () => {
  const raw = {
    version: 2,
    character: "luli",
    stage: "complete",
    polarization: 20,
    stamp: true,
    talked: true,
    permit: true,
    negotiated: true,
    upgrade: "power",
    elapsed: 50,
  };
  const state = parseSave(JSON.stringify(raw));
  assert.equal(state.version, 4);
  assert.equal(state.history.length, 1);
  assert.equal(nextChapter(state), true);
  assert.equal(state.chapter, 2);
});
test("support quests reward a healing charge once and remain complete after reload", () => {
  let state = createGame();
  advanceSideQuest(state);
  advanceSideQuest(state);
  advanceSideQuest(state);
  assert.equal(state.heals, 4);
  assert.equal(advanceSideQuest(state), false);
  state = parseSave(JSON.stringify(snapshot(state)));
  assert.equal(state.sideQuest, "complete");
  state.heals = 0;
  restoreEncounter(state);
  assert.equal(state.heals, 4);
});
