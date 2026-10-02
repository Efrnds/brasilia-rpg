import { createAnimationClips } from "./animation.js";
import * as THREE from "../../vendor/three.module.js";
import { createSurfaceMaterial } from "./materials.js";
export const RIG_CLIPS = {
  idle: {
    duration: 2,
    body: [
      [0, 0],
      [0.5, 0.025],
      [1, 0],
      [1.5, -0.015],
      [2, 0],
    ],
  },
  walk: { duration: 0.65, stride: 0.58, amplitude: 0.5 },
  run: { duration: 0.48, stride: 0.95, amplitude: 0.8 },
  attack: { duration: 0.55, windup: 0.18, strike: 0.11, recovery: 0.26 },
  skill: { duration: 0.65 },
  guard: { duration: 1 },
  dodge: { duration: 0.32 },
  hurt: { duration: 0.35 },
  death: { duration: 0.7 },
  victory: { duration: 1.4 },
  talk: { duration: 1.5 },
  operate: { duration: 1.2 },
};
const outfits = {
  luli: {
    coat: 0xa84c3c,
    shirt: 0xe5d8b7,
    trousers: 0x424b49,
    hair: 0xdad4c2,
    skin: 0xc79d7b,
  },
  folfonaro: {
    coat: 0x426b57,
    shirt: 0xc9caae,
    trousers: 0x334841,
    hair: 0x35352e,
    skin: 0xcfa380,
  },
  nair: {
    coat: 0x826b96,
    shirt: 0xe1d8bf,
    trousers: 0x646153,
    hair: 0xbbb5a2,
    skin: 0xba8d69,
  },
  assessor: {
    coat: 0x516b78,
    shirt: 0xe2d6c4,
    trousers: 0x3f4a48,
    hair: 0x55412e,
    skin: 0xc9a183,
  },
  estagiario: {
    coat: 0xb29155,
    shirt: 0xe1d8bf,
    trousers: 0x53645b,
    hair: 0x494034,
    skin: 0xd4ae8b,
  },
  tio: {
    coat: 0x89945c,
    shirt: 0xdbd3b7,
    trousers: 0x5c634d,
    hair: 0xb7a688,
    skin: 0xcb9f7b,
  },
};
export function createCharacterRig(kind = "luli") {
  const o = outfits[kind] || outfits.assessor,
    root = new THREE.Group();
  root.name = `character-${kind}`;
  root.userData = { license: "CC0-1.0", rig: "oficina-v2", units: "meters" };
  const mats = {
    skin: createSurfaceMaterial("paper", o.skin),
    coat: createSurfaceMaterial("fabric", o.coat),
    shirt: createSurfaceMaterial("fabric", o.shirt),
    pants: createSurfaceMaterial("fabric", o.trousers),
    hair: createSurfaceMaterial("fabric", o.hair),
    shoe: createSurfaceMaterial("wood", 0x393b31),
    eye: new THREE.MeshStandardMaterial({ color: 0xf3ecd9, roughness: 0.5 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x25342f, roughness: 0.35 }),
    metal: createSurfaceMaterial("metal", 0x48574e),
    wood: createSurfaceMaterial("wood", 0x7c5b40),
  };
  const mesh = (geometry, mat, x, y, z, parent) => {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (w, h, d, mat, x, y, z, parent) =>
    mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  const ellipsoid = (x, y, z, sx, sy, sz, mat, parent) => {
    const m = mesh(new THREE.SphereGeometry(1, 12, 8), mat, x, y, z, parent);
    m.scale.set(sx, sy, sz);
    return m;
  };
  const bone = (name, x, y, z, parent) => {
    const b = new THREE.Bone();
    b.name = name;
    b.position.set(x, y, z);
    parent.add(b);
    return b;
  };
  const body = bone("torso", 0, 0, 0, root),
    head = bone("head", 0, 1.88, 0, body);
  box(0.72, 0.94, 0.45, mats.coat, 0, 1.18, 0, body);
  box(0.12, 0.78, 0.02, mats.shirt, 0, 1.23, -0.235, body);
  for (const side of [-1, 1]) {
    const lapel = box(
      0.13,
      0.42,
      0.025,
      mats.shirt,
      side * 0.13,
      1.47,
      -0.255,
      body,
    );
    lapel.rotation.z = side * 0.3;
    for (let i = 0; i < 3; i++)
      ellipsoid(
        side * 0.28,
        1.18 - i * 0.15,
        -0.237,
        0.025,
        0.025,
        0.014,
        mats.metal,
        body,
      );
  }
  ellipsoid(0, 0.75, 0, 0.38, 0.2, 0.24, mats.pants, root);
  ellipsoid(0, 0, 0, 0.5, 0.58, 0.42, mats.skin, head);
  ellipsoid(0, -0.08, -0.4, 0.12, 0.12, 0.13, mats.skin, head);
  for (const side of [-1, 1]) {
    ellipsoid(side * 0.47, -0.01, 0, 0.1, 0.14, 0.1, mats.skin, head);
    ellipsoid(side * 0.19, 0.09, -0.365, 0.115, 0.13, 0.067, mats.eye, head);
    ellipsoid(
      side * 0.19,
      0.075,
      -0.428,
      0.046,
      0.058,
      0.017,
      mats.pupil,
      head,
    );
    const brow = box(
      0.2,
      0.045,
      0.035,
      mats.hair,
      side * 0.19,
      0.27,
      -0.39,
      head,
    );
    brow.rotation.z = side * (kind === "folfonaro" ? 0.2 : -0.12);
  }
  box(0.22, 0.03, 0.025, mats.shoe, 0, -0.26, -0.396, head);
  ellipsoid(0, 0.33, 0.055, 0.49, 0.3, 0.42, mats.hair, head);
  if (kind === "luli") {
    ellipsoid(0, -0.28, -0.04, 0.46, 0.34, 0.4, mats.hair, head);
    ellipsoid(0, -0.13, -0.42, 0.22, 0.055, 0.03, mats.hair, head);
  }
  if (kind === "folfonaro") {
    const tuft = ellipsoid(
      -0.14,
      0.45,
      -0.08,
      0.35,
      0.16,
      0.28,
      mats.hair,
      head,
    );
    tuft.rotation.z = -0.2;
    box(0.19, 0.13, 0.055, mats.metal, 0.23, 1.5, -0.27, body);
  }
  if (kind === "nair") {
    ellipsoid(0, 0.46, 0.22, 0.23, 0.2, 0.22, mats.hair, head);
    box(0.58, 0.7, 0.06, mats.shirt, 0, 1.03, -0.265, body);
  }
  const arms = [],
    legs = [],
    elbows = [],
    knees = [];
  for (const side of [-1, 1]) {
    const arm = bone(side < 0 ? "armL" : "armR", side * 0.46, 1.6, 0, body);
    arms.push(arm);
    ellipsoid(0, -0.19, 0, 0.145, 0.28, 0.15, mats.coat, arm);
    const elbow = bone(side < 0 ? "elbowL" : "elbowR", 0, -0.42, 0, arm);
    elbows.push(elbow);
    ellipsoid(0, -0.14, 0, 0.11, 0.2, 0.12, mats.coat, elbow);
    const hand = bone(side < 0 ? "handL" : "handR", 0, -0.32, 0, elbow);
    ellipsoid(0, 0, -0.025, 0.105, 0.12, 0.09, mats.skin, hand);
    ellipsoid(side * 0.07, 0.01, -0.07, 0.044, 0.075, 0.043, mats.skin, hand);
    const leg = bone(side < 0 ? "legL" : "legR", side * 0.2, 0.72, 0, root);
    legs.push(leg);
    ellipsoid(0, -0.17, 0, 0.15, 0.25, 0.17, mats.pants, leg);
    const knee = bone(side < 0 ? "kneeL" : "kneeR", 0, -0.35, 0, leg);
    knees.push(knee);
    ellipsoid(0, -0.12, 0, 0.12, 0.19, 0.14, mats.pants, knee);
    ellipsoid(0, -0.28, -0.09, 0.16, 0.11, 0.26, mats.shoe, knee);
  }
  const weapon = new THREE.Group();
  weapon.name = "weapon";
  weapon.position.set(0, -0.71, -0.05);
  arms[1].add(weapon);
  if (kind === "luli") {
    const horn = mesh(
      new THREE.CylinderGeometry(0.23, 0.09, 0.45, 12),
      mats.metal,
      0,
      0,
      -0.18,
      weapon,
    );
    horn.rotation.x = Math.PI / 2;
    box(0.07, 0.2, 0.07, mats.wood, 0, -0.13, 0, weapon);
  } else if (kind === "folfonaro") {
    box(0.1, 0.4, 0.1, mats.wood, 0, -0.1, 0, weapon);
    box(0.5, 0.12, 0.36, mats.metal, 0, -0.31, 0, weapon);
  } else weapon.visible = false;
  root.updateMatrixWorld(true);
  const bones = [];
  root.traverse((o) => {
    if (o.isBone) bones.push(o);
  });
  const skeleton = new THREE.Skeleton(bones);
  skeleton.calculateInverses();
  const clips = createAnimationClips();
  root.animations = clips;
  return {
    root,
    body,
    head,
    arms,
    legs,
    elbows,
    knees,
    weapon,
    kind,
    skeleton,
    clips,
    action: null,
    hurt: 0,
  };
}
