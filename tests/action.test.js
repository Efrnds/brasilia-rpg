import test from "node:test";
import assert from "node:assert/strict";
import { FixedSimulation } from "../src/simulation.js";
import { circleOverlapsBox, cameraFraction } from "../src/collision.js";
import { inMeleeArc, DODGE } from "../src/combat.js";
import { createGame, dodge, tickState, receiveDamage } from "../src/domain.js";
import { FollowCamera } from "../src/camera.js";
import { PerspectiveCamera } from "../vendor/three.module.js";
test("fixed simulation produces the same cooldown and travel at 30, 60 and 120 fps", () => {
  const outcomes = [30, 60, 120].map((fps) => {
    const sim = new FixedSimulation(),
      s = createGame();
    s.cooldowns[0] = 5;
    let distance = 0;
    for (let i = 0; i < fps * 2; i++)
      sim.advance(1 / fps, (dt) => {
        tickState(s, dt);
        distance += dt * 5.2;
      });
    return { elapsed: s.elapsed, cd: s.cooldowns[0], distance };
  });
  for (const result of outcomes) {
    assert.ok(Math.abs(result.elapsed - 2) < 1e-9);
    assert.ok(Math.abs(result.cd - 3) < 1e-9);
    assert.ok(Math.abs(result.distance - 10.4) < 1e-9);
  }
});
test("stall budget and pause reset prevent delayed actions after returning to play", () => {
  const sim = new FixedSimulation();
  let steps = 0;
  sim.advance(8, () => steps++);
  assert.equal(steps, 9);
  assert.ok(sim.dropped > 7);
  sim.reset();
  assert.equal(
    sim.advance(0.001, () => steps++),
    0,
  );
});
test("circular body can pass outside furniture corners without clipping a face", () => {
  const box = { x: 0, z: 0, w: 1, d: 1 };
  assert.equal(circleOverlapsBox(1.3, 1.3, 0.4, box), false);
  assert.equal(circleOverlapsBox(1.2, 1.2, 0.4, box), true);
  assert.equal(circleOverlapsBox(1.3, 0, 0.4, box), true);
});
test("camera volume detects a wall missed by a center ray", () => {
  const target = { x: 0, y: 1.7, z: 0 },
    desired = { x: 0, y: 1.7, z: 8 },
    box = { x: 0.35, z: 4, w: 0.1, d: 0.2, base: 0, height: 3 };
  assert.equal(cameraFraction(target, desired, [box], 0), 1);
  assert.ok(cameraFraction(target, desired, [box], 0.28) < 0.5);
});
test("follow camera retracts without smoothing through a newly occluding wall", () => {
  const camera = new PerspectiveCamera(),
    follow = new FollowCamera(),
    world = { heightAt: () => 0, obstacles: [], shake: 0 };
  const p = { x: 0, z: 0 };
  follow.update(camera, world, p, 0, 0.12, 1 / 60);
  world.obstacles = [{ x: 0, z: 3, w: 2, d: 0.2, base: 0, height: 5 }];
  follow.update(camera, world, p, 0, 0.12, 1 / 60);
  assert.ok(camera.position.z < 2.53);
  assert.ok(camera.position.z >= 0);
});
test("melee arc excludes behind, excessive height and beyond weapon reach", () => {
  const p = { x: 0, y: 0, z: 0 };
  assert.equal(inMeleeArc(p, { x: 0, y: 0, z: -3 }, 0), true);
  assert.equal(inMeleeArc(p, { x: 0, y: 0, z: 2 }, 0), false);
  assert.equal(inMeleeArc(p, { x: 0, y: 3, z: -1 }, 0), false);
  assert.equal(inMeleeArc(p, { x: 0, y: 0, z: -5 }, 0), false);
});
test("dodge protection ends with its animation and cannot be repeated without recovery", () => {
  const s = createGame();
  assert.equal(dodge(s), true);
  assert.equal(s.dodge, DODGE.duration);
  assert.equal(s.invulnerable, DODGE.protection);
  assert.equal(receiveDamage(s, 20), 0);
  assert.equal(dodge(s), false);
  for (let i = 0; i < 20; i++) tickState(s, 1 / 60);
  assert.ok(receiveDamage(s, 20) > 0);
});
