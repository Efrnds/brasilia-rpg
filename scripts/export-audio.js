import { mkdir, writeFile } from "node:fs/promises";
import { SOUND_BANK } from "../src/audio.js";
const rate = 22050;
function wave(type, p) {
  return type === "square"
    ? Math.tanh(Math.sin(p) * 3)
    : type === "triangle"
      ? (2 / Math.PI) * Math.asin(Math.sin(p))
      : type === "sawtooth"
        ? (Math.sin(p) + Math.sin(2 * p) / 2 + Math.sin(3 * p) / 3) / 1.8
        : Math.sin(p);
}
function wav(samples) {
  const data = new ArrayBuffer(44 + samples.length * 2),
    v = new DataView(data),
    bytes = new Uint8Array(data);
  const text = (offset, value) =>
    [...value].forEach((c, i) => (bytes[offset + i] = c.charCodeAt(0)));
  text(0, "RIFF");
  v.setUint32(4, data.byteLength - 8, true);
  text(8, "WAVE");
  text(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  text(36, "data");
  v.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, i) =>
    v.setInt16(
      44 + i * 2,
      Math.round(Math.max(-0.95, Math.min(0.95, sample)) * 32767),
      true,
    ),
  );
  return bytes;
}
await mkdir("assets/audio", { recursive: true });
const manifest = {
  license: "CC0-1.0",
  author: "Oficina local",
  sampleRate: rate,
  channels: 1,
  normalization: "pico abaixo de -1 dBFS",
  effects: {},
  music: {},
  ambience: {},
};
for (const [kind, [from, to, duration, type]] of Object.entries(SOUND_BANK)) {
  const n = Math.ceil((duration + 0.02) * rate),
    samples = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / rate,
      p = Math.min(1, t / duration),
      frequency = from * Math.pow(to / from, p);
    phase += (2 * Math.PI * frequency) / rate;
    const envelope =
      Math.min(1, t / 0.012) * Math.exp(-p * 6) * (t < duration ? 1 : 0);
    samples[i] = wave(type, phase) * envelope * 0.55;
  }
  await writeFile(`assets/audio/${kind}.wav`, wav(samples));
  manifest.effects[kind] = { file: `${kind}.wav`, duration, type };
}
const themes = [
  [196, 247, 294, 247, 220, 262, 330, 262],
  [146.83, 174.61, 220, 261.63, 220, 174.61, 164.81, 196],
  [220, 261.63, 329.63, 293.66, 261.63, 220, 196, 220],
];
for (let chapter = 1; chapter <= 3; chapter++) {
  const samples = new Float32Array(Math.floor(rate * 4.8));
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate,
      beat = Math.floor(t / 0.6) % 8,
      note = themes[chapter - 1][beat],
      local = t % 0.6,
      envelope = Math.min(1, local / 0.015) * Math.exp(-local * 6);
    samples[i] =
      (wave("triangle", 2 * Math.PI * note * local) * 0.22 +
        Math.sin(2 * Math.PI * note * 0.5 * local) * 0.16) *
      envelope;
  }
  await writeFile(`assets/audio/theme-${chapter}.wav`, wav(samples));
  manifest.music[chapter] = {
    file: `theme-${chapter}.wav`,
    duration: 4.8,
    loop: true,
  };
  const combat = new Float32Array(Math.floor(rate * 2.4));
  for (let i = 0; i < combat.length; i++) {
    const t = i / rate,
      local = t % 0.3,
      beat = Math.floor(t / 0.3),
      note = themes[chapter - 1][(beat + 4) % 8] * 0.75,
      env = Math.min(1, local / 0.01) * Math.exp(-local * 10);
    combat[i] =
      wave("triangle", 2 * Math.PI * note * local) * 0.2 * env +
      Math.sin(2 * Math.PI * 65 * local) * 0.14 * Math.exp(-local * 30);
  }
  await writeFile(`assets/audio/combat-${chapter}.wav`, wav(combat));
  manifest.music[chapter].combatFile = `combat-${chapter}.wav`;
  manifest.music[chapter].combatDuration = 2.4;
  const ambient = new Float32Array(rate * 8);
  for (let i = 0; i < ambient.length; i++) {
    const t = i / rate,
      f = chapter === 1 ? 180 : chapter === 2 ? 90 : 620;
    ambient[i] =
      (Math.sin(2 * Math.PI * f * t) * 0.07 +
        Math.sin(2 * Math.PI * (f + 3) * t) * 0.035) *
      Math.min(1, t / 0.03, (8 - t) / 0.03);
  }
  await writeFile(`assets/audio/ambience-${chapter}.wav`, wav(ambient));
  manifest.ambience[chapter] = {
    file: `ambience-${chapter}.wav`,
    duration: 8,
    loop: true,
  };
}
await writeFile(
  "assets/audio/manifest.json",
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Pack sonoro: ${Object.keys(SOUND_BANK).length} efeitos, 6 temas, 3 ambientes WAV.`,
);
