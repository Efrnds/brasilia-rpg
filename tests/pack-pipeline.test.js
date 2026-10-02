import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createCharacterRig } from "../assets/pack/characters.js";
import { CharacterAnimator } from "../assets/pack/animation.js";
import { exportGLB } from "../assets/pack/glb.js";
import {
  createArchitecture,
  ARCHITECTURE,
} from "../assets/pack/architecture.js";
import { validateContent } from "../src/content-validation.js";
import { SOUND_BANK } from "../src/audio.js";
function parseGLB(buffer) {
  const v = new DataView(buffer);
  assert.equal(v.getUint32(0, true), 0x46546c67);
  assert.equal(v.getUint32(4, true), 2);
  assert.equal(v.getUint32(8, true), buffer.byteLength);
  const size = v.getUint32(12, true);
  assert.equal(v.getUint32(16, true), 0x4e4f534a);
  const json = JSON.parse(
    new TextDecoder().decode(new Uint8Array(buffer, 20, size)),
  );
  assert.equal(v.getUint32(24 + size, true), 0x004e4942);
  assert.equal(json.buffers[0].byteLength, v.getUint32(20 + size, true));
  for (const view of json.bufferViews)
    assert.ok(view.byteOffset + view.byteLength <= json.buffers[0].byteLength);
  return json;
}
test("all character GLBs contain hierarchy and 12 portable clips", () => {
  for (const kind of [
    "luli",
    "folfonaro",
    "nair",
    "assessor",
    "estagiario",
    "tio",
  ]) {
    const model = createCharacterRig(kind),
      json = parseGLB(exportGLB(model.root));
    assert.equal(json.animations.length, 12);
    assert.ok(json.nodes.some((n) => n.name === "kneeL"));
    for (const animation of json.animations)
      for (const channel of animation.channels) {
        assert.ok(json.nodes[channel.target.node]);
        const sampler = animation.samplers[channel.sampler];
        assert.equal(
          json.accessors[sampler.input].count,
          json.accessors[sampler.output].count,
        );
      }
  }
});
test("clips move bones, recover after a repeated attack and crossfade without invalid transforms", () => {
  const model = createCharacterRig("luli"),
    animator = new CharacterAnimator(model),
    arm = model.root.getObjectByName("armR");
  animator.update("attack", 0.15, 0, { restart: true });
  assert.ok(Math.abs(arm.rotation.x) > 1);
  animator.update("attack", 0.15, 0, { restart: true });
  assert.ok(Math.abs(arm.rotation.x) > 1);
  animator.update("walk", 0.3, 1);
  for (const bone of model.skeleton.bones) {
    assert.ok(bone.position.toArray().every(Number.isFinite));
    assert.ok(bone.quaternion.toArray().every(Number.isFinite));
  }
  animator.dispose();
});
test("architecture exports and all chapter content validate", () => {
  for (const kind of Object.keys(ARCHITECTURE))
    parseGLB(exportGLB(createArchitecture(kind)));
  assert.deepEqual(validateContent(), []);
});
test("exported WAV effects have PCM headers, bounded peaks and matching duration", async () => {
  for (const [kind, notes] of Object.entries(SOUND_BANK)) {
    const bytes = await readFile(
      new URL(`../assets/audio/${kind}.wav`, import.meta.url),
    );
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WAVE");
    assert.equal(bytes.readUInt32LE(24), 22050);
    assert.equal(bytes.readUInt16LE(34), 16);
    assert.equal(bytes.readUInt32LE(40) + 44, bytes.length);
    assert.ok(Math.abs((bytes.length - 44) / 44100 - notes[2]) < 0.021);
    for (let i = 44; i < bytes.length; i += 2)
      assert.ok(Math.abs(bytes.readInt16LE(i)) < 32000);
  }
});
