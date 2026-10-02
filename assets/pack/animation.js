import * as THREE from "../../vendor/three.module.js";
export function createAnimationClips() {
  const clip = (name, duration, tracks) =>
    new THREE.AnimationClip(
      name,
      duration,
      tracks.map(
        ([path, times, values]) =>
          new THREE.NumberKeyframeTrack(path, times, values),
      ),
    );
  const walk = (name, duration, amplitude) => {
    const t = [0, duration * 0.25, duration * 0.5, duration * 0.75, duration];
    return clip(name, duration, [
      ["legL.rotation[x]", t, [0, amplitude, 0, -amplitude, 0]],
      ["legR.rotation[x]", t, [0, -amplitude, 0, amplitude, 0]],
      ["armL.rotation[x]", t, [0, -amplitude * 0.6, 0, amplitude * 0.6, 0]],
      ["armR.rotation[x]", t, [0, amplitude * 0.6, 0, -amplitude * 0.6, 0]],
      ["kneeL.rotation[x]", t, [0, 0.35, 0, 0, 0]],
      ["kneeR.rotation[x]", t, [0, 0, 0, 0.35, 0]],
      ["torso.position[y]", t, [0, 0.04, 0, 0.04, 0]],
    ]);
  };
  return [
    clip("idle", 2, [
      ["torso.position[y]", [0, 0.5, 1, 1.5, 2], [0, 0.015, 0, -0.008, 0]],
    ]),
    walk("walk", 0.65, 0.55),
    walk("run", 0.48, 0.85),
    clip("attack", 0.55, [
      ["armR.rotation[x]", [0, 0.154, 0.275, 0.55], [0, -2.55, 0.25, 0]],
      ["armR.rotation[z]", [0, 0.154, 0.275, 0.55], [-0.1, -0.8, 0.5, -0.1]],
      ["torso.rotation[y]", [0, 0.154, 0.275, 0.55], [0, -0.6, 0.55, 0]],
      ["head.rotation[y]", [0, 0.154, 0.275, 0.55], [0, 0.24, -0.22, 0]],
      ["elbowR.rotation[x]", [0, 0.154, 0.275, 0.55], [0, -0.35, 0.1, 0]],
    ]),
    clip("skill", 0.65, [
      ["armL.rotation[x]", [0, 0.2, 0.4, 0.65], [0, -2.1, -2.1, 0]],
      ["armR.rotation[x]", [0, 0.2, 0.4, 0.65], [0, -2.3, -2.3, 0]],
      ["torso.rotation[x]", [0, 0.25, 0.65], [0, -0.15, 0]],
    ]),
    clip("guard", 1, [
      ["armL.rotation[x]", [0, 1], [-1.4, -1.4]],
      ["armR.rotation[x]", [0, 1], [-1.5, -1.5]],
      ["elbowL.rotation[x]", [0, 1], [-0.7, -0.7]],
      ["elbowR.rotation[x]", [0, 1], [-0.7, -0.7]],
      ["torso.rotation[x]", [0, 1], [0.12, 0.12]],
    ]),
    clip("dodge", 0.32, [
      ["torso.rotation[x]", [0, 0.12, 0.23, 0.32], [0, -0.85, -0.5, 0]],
      ["torso.position[y]", [0, 0.12, 0.23, 0.32], [0, -0.35, -0.25, 0]],
      ["kneeL.rotation[x]", [0, 0.12, 0.32], [0, 0.8, 0]],
      ["kneeR.rotation[x]", [0, 0.12, 0.32], [0, 0.8, 0]],
    ]),
    clip("hurt", 0.35, [
      ["torso.rotation[x]", [0, 0.1, 0.35], [0, -0.4, 0]],
      ["head.rotation[x]", [0, 0.1, 0.35], [0, -0.3, 0]],
    ]),
    clip("death", 0.7, [
      ["torso.rotation[z]", [0, 0.3, 0.7], [0, 0.7, 1.5]],
      ["torso.position[y]", [0, 0.7], [0, -0.9]],
    ]),
    clip("victory", 1.4, [
      ["armL.rotation[x]", [0, 0.35, 1, 1.4], [0, -2.3, -2.3, 0]],
      ["armR.rotation[x]", [0, 0.35, 1, 1.4], [0, -2.3, -2.3, 0]],
      ["head.rotation[z]", [0, 0.35, 0.7, 1, 1.4], [0, 0.12, -0.12, 0.12, 0]],
    ]),
    clip("talk", 1.5, [
      ["armR.rotation[x]", [0, 0.4, 0.8, 1.5], [0, -0.7, -0.3, 0]],
      ["head.rotation[x]", [0, 0.4, 0.8, 1.5], [0, 0.06, -0.06, 0]],
    ]),
    clip("operate", 1.2, [
      ["armL.rotation[x]", [0, 0.3, 0.9, 1.2], [0, -0.8, -0.8, 0]],
      ["armR.rotation[x]", [0, 0.3, 0.6, 0.9, 1.2], [0, -0.8, -0.5, -0.8, 0]],
    ]),
  ];
}
export class CharacterAnimator {
  constructor(model) {
    this.mixer = new THREE.AnimationMixer(model.root);
    this.actions = new Map(
      model.clips.map((c) => [c.name, this.mixer.clipAction(c)]),
    );
    this.current = null;
    this.currentName = null;
  }
  update(kind, dt, speed = 0, { reduced = false, restart = false } = {}) {
    const action = this.actions.get(kind) || this.actions.get("idle");
    if (this.current !== action || restart) {
      const previous = this.current;
      action.reset().setEffectiveWeight(1).play();
      const loops = [
        "idle",
        "walk",
        "run",
        "guard",
        "talk",
        "operate",
      ].includes(kind);
      action.setLoop(
        loops ? THREE.LoopRepeat : THREE.LoopOnce,
        loops ? Infinity : 1,
      );
      action.clampWhenFinished = !loops;
      if (previous && previous !== action)
        previous.crossFadeTo(
          action,
          Math.min(0.1, kind === "dodge" ? 0.035 : 0.1),
          false,
        );
      this.current = action;
      this.currentName = kind;
    }
    action.timeScale =
      kind === "walk" || kind === "run"
        ? Math.max(0.25, speed) * (kind === "walk" ? 1.3 : 1)
        : kind === "idle" && reduced
          ? 0
          : 1;
    this.mixer.update(dt);
  }
  dispose() {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.mixer.getRoot());
  }
}
