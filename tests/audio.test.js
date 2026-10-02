import test from "node:test";
import assert from "node:assert/strict";
import { GameAudio } from "../src/audio.js";
const param = () => ({
  value: 0,
  setValueAtTime(value) {
    this.value = value;
  },
  linearRampToValueAtTime() {},
  exponentialRampToValueAtTime() {},
  setTargetAtTime(value) {
    this.value = value;
  },
});
class FakeAudioContext {
  constructor() {
    this.state = "running";
    this.currentTime = 0;
    this.destination = {};
    this.pans = [];
  }
  async resume() {}
  createGain() {
    return { gain: param(), connect() {}, disconnect() {} };
  }
  createOscillator() {
    return {
      frequency: param(),
      connect() {},
      disconnect() {},
      start() {},
      stop() {
        this.onended?.();
      },
    };
  }
  createStereoPanner() {
    const node = { pan: param(), connect() {}, disconnect() {} };
    this.pans.push(node);
    return node;
  }
}
test("audio respects live buses, facing direction, 24 voice cap and pause cleanup", async () => {
  globalThis.window = { AudioContext: FakeAudioContext };
  const a = new GameAudio();
  await a.start();
  a.setVolumes(0.5, 0.3, 0.2, 0.7);
  assert.equal(a.master.gain.value, 0.5);
  assert.equal(a.buses.effects.gain.value, 0.7);
  a.update(0.01, { active: true, position: { x: 0, z: 0 }, yaw: Math.PI });
  a.play("metal", { x: 6, z: 0 });
  assert.ok(
    a.context.pans.at(-1).pan.value < 0,
    "Camera facing reversed must reverse panning",
  );
  for (let i = 0; i < 40; i++) a.play("hit");
  assert.equal(a.nodes.size, 24);
  a.update(0.01, { active: false });
  assert.equal(a.nodes.size, 0);
  a.setVolumes(0, 0, 0, 0);
  assert.equal(a.buses.music.gain.value, 0);
  delete globalThis.window;
});
