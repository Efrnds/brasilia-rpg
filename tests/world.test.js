import test from "node:test";
import assert from "node:assert/strict";
import { World } from "../src/world.js";
import { levelFor, floorAt } from "../src/levels.js";
function collisionWorld(chapter) {
  const world = Object.create(World.prototype);
  world.level = levelFor(chapter);
  world.obstacles = [];
  return world;
}
test("each chapter has its own footprint, elevations and gate", () => {
  assert.equal(
    new Set([1, 2, 3].map((n) => JSON.stringify(levelFor(n).surfaces))).size,
    3,
  );
  for (const chapter of [1, 2, 3]) {
    const world = collisionWorld(chapter),
      point = world.level.arenaSpawn;
    assert.equal(
      floorAt(world.level, point.x, point.z, {
        permit: false,
        stage: "permit",
      }),
      null,
    );
    assert.notEqual(
      floorAt(world.level, point.x, point.z, { permit: true, stage: "arena" }),
      null,
    );
    assert.equal(world.canWalk(100, 100), false);
  }
  assert.equal(floorAt(levelFor(2), 10, -31), 3);
  assert.equal(floorAt(levelFor(3), 13, -25), 1.5);
});
test("swept collision prevents crossing walls and preserves sliding", () => {
  const world = collisionWorld(1);
  world.obstacles = [{ x: 4, z: 28, w: 1, d: 8, base: 0, height: 3 }];
  const pos = { x: 2, z: 28 };
  world.move(pos, 5, 1, { permit: false, stage: "investigate" });
  assert.ok(pos.x < 3.11);
  assert.ok(Math.abs(pos.z - 29) < 0.001);
});
