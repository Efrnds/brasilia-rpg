export const SOUND_BANK = {
  bossWarn1: [240, 150, 0.25, "square"],
  bossWarn2: [680, 340, 0.25, "triangle"],
  bossWarn3: [460, 110, 0.3, "sawtooth"],
  swing: [350, 80, 0.09, "triangle"],
  hit: [140, 55, 0.11, "sawtooth"],
  paper: [650, 170, 0.09, "triangle"],
  metal: [850, 300, 0.16, "square"],
  body: [110, 45, 0.12, "triangle"],
  block: [620, 380, 0.13, "triangle"],
  hurt: [100, 45, 0.22, "triangle"],
  dodge: [440, 760, 0.1, "sine"],
  talk: [460, 560, 0.055, "sine"],
  pickup: [520, 1040, 0.28, "triangle"],
  skill: [190, 660, 0.3, "triangle"],
  warn: [160, 120, 0.2, "square"],
  warnLine: [390, 250, 0.18, "square"],
  warnWave: [250, 100, 0.3, "triangle"],
  win: [330, 990, 0.65, "triangle"],
  stepStone: [120, 70, 0.045, "triangle"],
  stepWood: [180, 90, 0.04, "square"],
  stepMetal: [700, 240, 0.06, "triangle"],
  stepGrass: [220, 140, 0.045, "sine"],
  confirm: [520, 720, 0.08, "sine"],
  cancel: [300, 220, 0.07, "sine"],
  door: [160, 100, 0.15, "sawtooth"],
  repair: [800, 1200, 0.14, "triangle"],
};
const SCORES = {
  1: [196, 247, 294, 247, 220, 262, 330, 262],
  2: [146.83, 174.61, 220, 261.63, 220, 174.61, 164.81, 196],
  3: [220, 261.63, 329.63, 293.66, 261.63, 220, 196, 220],
  4: [174.61, 220, 261.63, 349.23, 261.63, 220, 196, 174.61],
};
export class GameAudio {
  constructor() {
    this.volume = 0.35;
    this.effectsVolume = 1;
    this.musicVolume = 0.3;
    this.ambienceVolume = 0.25;
    this.context = null;
    this.nodes = new Set();
    this.musicClock = 0;
    this.beat = 0;
    this.chapter = 1;
    this.active = false;
    this.combat = false;
    this.listener = { x: 0, z: 0 };
    this.listenerYaw = 0;
    this.surface = "stone";
    this.ambience = null;
    this.mix = { music: 0 };
  }
  async start() {
    try {
      this.context ??= new (window.AudioContext || window.webkitAudioContext)();
      await this.context.resume();
      if (!this.buses) {
        this.master = this.context.createGain();
        if (this.context.createDynamicsCompressor) {
          this.compressor = this.context.createDynamicsCompressor();
          this.compressor.threshold.value = -14;
          this.compressor.knee.value = 12;
          this.compressor.ratio.value = 6;
          this.master.connect(this.compressor);
          this.compressor.connect(this.context.destination);
        } else this.master.connect(this.context.destination);
        this.buses = {};
        for (const channel of ["effects", "music", "ambience"]) {
          const bus = this.context.createGain();
          bus.connect(this.master);
          this.buses[channel] = bus;
        }
        this.setVolumes(this.volume, this.musicVolume, this.ambienceVolume);
      }
    } catch {
      this.context = null;
    }
  }
  tone(
    from,
    to,
    duration,
    type = "sine",
    volume = 0.1,
    pan = 0,
    delay = 0,
    channel = "effects",
  ) {
    if (
      !this.context ||
      this.context.state !== "running" ||
      this.nodes.size >= 24
    )
      return;
    const ctx = this.context,
      oscillator = ctx.createOscillator(),
      gain = ctx.createGain(),
      now = ctx.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, from), now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, to),
      now + duration,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(Math.max(0.0001, volume), now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    let panner;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      gain.connect(panner);
      panner.connect(this.buses?.[channel] || ctx.destination);
    } else gain.connect(this.buses?.[channel] || ctx.destination);
    const voice = { oscillator, gain, panner, channel };
    this.nodes.add(voice);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      panner?.disconnect();
      this.nodes.delete(voice);
    };
  }
  play(kind, position = null) {
    if (!this.context || !this.volume || !this.effectsVolume) return;
    const notes = SOUND_BANK[kind] || SOUND_BANK.talk,
      dist = position
        ? Math.hypot(position.x - this.listener.x, position.z - this.listener.z)
        : 0,
      pan = position
        ? Math.max(
            -0.9,
            Math.min(
              0.9,
              ((position.x - this.listener.x) * Math.cos(this.listenerYaw) -
                (position.z - this.listener.z) * Math.sin(this.listenerYaw)) /
                10,
            ),
          )
        : 0;
    this.tone(...notes, 0.09 / (1 + dist * 0.08), pan);
  }
  setScene(chapter) {
    this.chapter = chapter;
    this.beat = 0;
    this.musicClock = 0;
  }
  update(
    dt,
    { active = false, combat = false, position = { x: 0, z: 0 }, yaw = 0 } = {},
  ) {
    this.active = active;
    this.listener = position;
    this.listenerYaw = yaw;
    this.combat = combat;
    if (!active) {
      this.stop();
      return;
    }
    if (!this.context || this.context.state !== "running" || !this.volume)
      return;
    this.musicClock -= dt;
    if (this.musicClock <= 0) {
      this.musicClock = combat ? 0.32 : 0.65;
      const score = SCORES[this.chapter] || SCORES[1],
        note =
          score[(this.beat + (combat ? 4 : 0)) % score.length] *
          (combat ? 0.75 : 1);
      this.beat++;
      if (this.musicVolume > 0) {
        this.tone(note, note, 0.5, "triangle", 0.035, 0, 0, "music");
        if (this.beat % 2 === 0)
          this.tone(note / 2, note / 2, 0.6, "sine", 0.045, 0, 0, "music");
        if (combat) this.tone(65, 30, 0.08, "triangle", 0.03, 0, 0, "music");
      }
      if (this.ambienceVolume > 0) {
        const frequency =
          this.chapter === 2 ? 90 : this.chapter === 3 ? 620 : 180;
        this.tone(
          frequency,
          frequency * 1.05,
          0.8,
          "sine",
          0.012,
          Math.sin(this.beat * 0.3) * 0.5,
          0,
          "ambience",
        );
        if (this.chapter === 3 && this.beat % 4 === 0)
          this.tone(1600, 2100, 0.17, "sine", 0.025, -0.7, 0, "ambience");
      }
    }
  }
  setVolumes(master, music, ambience, effects = this.effectsVolume) {
    this.effectsVolume = effects;
    this.volume = master;
    this.musicVolume = music;
    this.ambienceVolume = ambience;
    if (this.master) {
      this.master.gain.setTargetAtTime(master, this.context.currentTime, 0.03);
      this.buses.effects.gain.setTargetAtTime(
        effects,
        this.context.currentTime,
        0.03,
      );
      this.buses.music.gain.setTargetAtTime(
        music,
        this.context.currentTime,
        0.03,
      );
      this.buses.ambience.gain.setTargetAtTime(
        ambience,
        this.context.currentTime,
        0.03,
      );
    }
    for (const voice of this.nodes)
      if (!master || (voice.channel === "music" && !music))
        voice.gain.gain.setValueAtTime(0.0001, this.context.currentTime);
  }
  stop() {
    for (const voice of this.nodes) {
      try {
        voice.oscillator.stop();
      } catch {}
    }
    this.musicClock = 0;
  }
}
