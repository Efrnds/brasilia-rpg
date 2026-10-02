import { createSurfaceMaterial } from "./materials.js";
import * as THREE from "../../vendor/three.module.js";
export const CATALOG = {
  cabinet: { label: "Armário articulado", footprint: [1.4, 0.65] },
  console: { label: "Mesa de controle", footprint: [1.6, 1] },
  valve: { label: "Válvula de manutenção", footprint: [1, 0.6] },
  bench: { label: "Banco de madeira", footprint: [2.4, 0.8] },
  chair: { label: "Cadeira estofada", footprint: [0.72, 0.8] },
  desk: { label: "Mesa de expediente", footprint: [2.4, 1.25] },
  shelf: { label: "Estante de arquivo", footprint: [2.6, 0.65] },
  camera: { label: "Câmera de estúdio", footprint: [1.4, 1.4] },
  crate: { label: "Caixa de transporte", footprint: [1.2, 1] },
  coffeeCart: { label: "Carrinho de café", footprint: [1.4, 0.75] },
  planter: { label: "Vaso de folhagem", footprint: [0.8, 0.8] },
  lamp: { label: "Poste de praça", footprint: [0.5, 0.5] },
  tree: { label: "Árvore de copa irregular", footprint: [3.2, 3.2] },
};
const palette = {
  wood: 0x78563d,
  edge: 0x493b2e,
  metal: 0x424b49,
  brass: 0xa18a56,
  fabric: 0x985747,
  paper: 0xdacfb4,
  leaf: 0x587246,
  leafLight: 0x7e915b,
  ceramic: 0xb38b6b,
};
export function roundedBox(w, h, d, bevel = 0.035) {
  const r = Math.min(bevel, w / 4, h / 4, d / 4),
    shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: d - 2 * r,
    steps: 1,
    bevelEnabled: true,
    bevelSize: r,
    bevelThickness: r,
    bevelSegments: 1,
    curveSegments: 3,
  });
  geometry.translate(0, 0, -d / 2 + r);
  return new THREE.BufferGeometry().copy(geometry);
}
export function createProp(kind, { variant = 0 } = {}) {
  if (!CATALOG[kind]) throw new Error(`Asset desconhecido: ${kind}`);
  const root = new THREE.Group();
  root.name = kind;
  root.userData = { asset: kind, license: "CC0-1.0", units: "meters", variant };
  const materials = new Map();
  const material = (color) => {
    if (!materials.has(color))
      materials.set(
        color,
        createSurfaceMaterial(
          color === palette.metal
            ? "metal"
            : color === palette.wood || color === palette.edge
              ? "wood"
              : color === palette.fabric
                ? "fabric"
                : color === palette.leaf || color === palette.leafLight
                  ? "leaf"
                  : "paper",
          color,
        ),
      );
    return materials.get(color);
  };
  const mesh = (geometry, color, x, y, z, parent = root) => {
    const m = new THREE.Mesh(geometry, material(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (x, y, z, w, h, d, color = palette.wood) =>
    mesh(roundedBox(w, h, d), color, x, y, z);
  const cylinder = (x, y, z, r1, r2, h, color) =>
    mesh(new THREE.CylinderGeometry(r1, r2, h, 12), color, x, y, z);
  const beam = (a, b, r, color) => {
    const av = new THREE.Vector3(...a),
      bv = new THREE.Vector3(...b),
      m = mesh(
        new THREE.CylinderGeometry(r, r, av.distanceTo(bv), 8),
        color,
        ...av.clone().add(bv).multiplyScalar(0.5).toArray(),
      );
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      bv.sub(av).normalize(),
    );
    return m;
  };
  const legs = (width, depth, height) => {
    for (const x of [-width / 2, width / 2])
      for (const z of [-depth / 2, depth / 2])
        beam([x, 0, z], [x, height, z], 0.04, palette.metal);
  };
  if (kind === "bench") {
    for (let i = 0; i < 4; i++) box(0, 0.48, -0.3 + i * 0.2, 2.4, 0.09, 0.16);
    for (let i = 0; i < 3; i++) {
      const b = box(0, 0.72 + i * 0.17, 0.35, 2.4, 0.12, 0.08);
      b.rotation.x = -0.12;
    }
    for (const x of [-0.85, 0.85]) {
      beam([x, 0.05, -0.3], [x, 0.48, -0.3], 0.055, palette.metal);
      beam([x, 0.05, 0.3], [x, 1.12, 0.4], 0.055, palette.metal);
      beam([x, 0.48, -0.32], [x, 0.48, 0.35], 0.05, palette.metal);
      beam([x, 0.7, -0.25], [x, 0.7, 0.4], 0.04, palette.metal);
    }
  }
  if (kind === "chair") {
    legs(0.5, 0.5, 0.46);
    box(0, 0.49, 0, 0.7, 0.13, 0.68, palette.fabric);
    box(0, 0.89, 0.31, 0.65, 0.65, 0.12, palette.fabric);
    for (const x of [-0.27, 0.27])
      beam([x, 0.45, 0.25], [x, 1.2, 0.33], 0.035, palette.metal);
  }
  if (kind === "desk" || kind === "coffeeCart") {
    const cart = kind === "coffeeCart",
      w = cart ? 1.4 : 2.4,
      d = cart ? 0.75 : 1.25,
      h = cart ? 0.85 : 0.78;
    legs(w - 0.22, d - 0.2, h);
    box(0, h, 0, w, 0.12, d);
    box(0, h - 0.12, 0, w - 0.08, 0.1, d - 0.08, palette.edge);
    if (!cart) {
      box(0.75, 0.4, 0, 0.6, 0.6, 0.9, palette.paper);
      for (let i = 0; i < 3; i++) {
        box(0.75, 0.25 + i * 0.19, -0.47, 0.54, 0.16, 0.04, palette.paper);
        box(0.75, 0.25 + i * 0.19, -0.51, 0.15, 0.025, 0.025, palette.metal);
      }
      for (let i = 0; i < 4; i++) {
        const p = box(
          -0.5 + i * 0.01,
          h + 0.08 + i * 0.018,
          -0.1,
          0.45,
          0.015,
          0.32,
          palette.paper,
        );
        p.rotation.y = 0.07;
      }
      cylinder(-0.85, h + 0.14, 0.25, 0.085, 0.07, 0.2, palette.ceramic);
    } else {
      box(0, 0.23, 0, 1.25, 0.08, 0.65);
      cylinder(-0.3, 1.12, 0, 0.13, 0.14, 0.42, palette.metal);
      cylinder(-0.3, 1.35, 0, 0.16, 0.16, 0.05, palette.edge);
      beam([-0.3, 1.38, 0], [-0.3, 1.55, 0], 0.05, palette.edge);
      for (let i = 0; i < 3; i++)
        cylinder(0.2 + i * 0.2, 0.99, -0.15, 0.07, 0.05, 0.16, palette.paper);
      for (const x of [-0.56, 0.56])
        for (const z of [-0.25, 0.25]) {
          const wheel = cylinder(x, 0.09, z, 0.09, 0.09, 0.05, palette.metal);
          wheel.rotation.z = Math.PI / 2;
        }
    }
  }
  if (kind === "shelf") {
    for (const x of [-1.25, 1.25])
      box(x, 1.25, 0, 0.1, 2.5, 0.65, palette.edge);
    box(0, 1.25, 0.3, 2.6, 2.5, 0.06, palette.edge);
    for (let row = 0; row < 4; row++) {
      box(0, 0.12 + row * 0.7, 0, 2.6, 0.08, 0.65);
      for (let i = 0; i < 8; i++) {
        const h = 0.35 + ((i * 7 + row * 3) % 5) * 0.035,
          b = box(
            -1.02 + i * 0.29,
            0.16 + row * 0.7 + h / 2,
            0.03,
            0.2,
            h,
            0.38,
            [palette.paper, 0x69796e, 0x8c5e4a][(i + row) % 3],
          );
        b.rotation.z = i === 6 ? 0.12 : 0;
        box(
          -1.02 + i * 0.29,
          0.26 + row * 0.7,
          -0.17,
          0.12,
          0.05,
          0.012,
          palette.paper,
        );
      }
    }
  }
  if (kind === "camera") {
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      beam(
        [0, 1.3, 0],
        [Math.sin(a) * 0.65, 0.04, Math.cos(a) * 0.65],
        0.035,
        palette.metal,
      );
      beam(
        [0, 0.7, 0],
        [Math.sin(a) * 0.4, 0.45, Math.cos(a) * 0.4],
        0.02,
        palette.metal,
      );
    }
    beam([0, 0.65, 0], [0, 1.65, 0], 0.055, palette.metal);
    box(0, 1.8, 0, 0.65, 0.4, 0.6, palette.metal);
    const lens = cylinder(0, 1.82, -0.43, 0.12, 0.15, 0.3, palette.edge);
    lens.rotation.x = Math.PI / 2;
    const glass = cylinder(0, 1.82, -0.6, 0.1, 0.1, 0.015, 0x517473);
    glass.rotation.x = Math.PI / 2;
    box(0.4, 1.84, 0.02, 0.3, 0.23, 0.035, palette.metal);
    beam([0, 1.65, 0.2], [0, 1.5, 0.6], 0.025, palette.metal);
  }
  if (kind === "crate") {
    box(0, 0.5, 0, 1.2, 1, 1);
    for (const z of [-0.51, 0.51])
      for (const y of [0.08, 0.91]) box(0, y, z, 1.23, 0.1, 0.05, palette.edge);
    for (const x of [-0.48, 0.48])
      box(x, 0.5, -0.52, 0.09, 0.95, 0.05, palette.edge);
    box(0, 0.56, -0.54, 0.45, 0.25, 0.015, palette.paper);
  }
  if (kind === "planter") {
    cylinder(0, 0.23, 0, 0.32, 0.24, 0.46, palette.ceramic);
    cylinder(0, 0.46, 0, 0.34, 0.34, 0.07, palette.ceramic);
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4,
        h = 0.6 + (i % 3) * 0.18;
      beam(
        [0, 0.46, 0],
        [Math.sin(a) * 0.2, h, Math.cos(a) * 0.2],
        0.015,
        palette.leaf,
      );
      const leaf = mesh(
        new THREE.SphereGeometry(1, 7, 5),
        i % 2 ? palette.leaf : palette.leafLight,
        Math.sin(a) * 0.23,
        h,
        Math.cos(a) * 0.23,
      );
      leaf.scale.set(0.13, 0.32, 0.06);
      leaf.rotation.z = Math.sin(a) * 0.8;
    }
  }
  if (kind === "lamp") {
    cylinder(0, 0.1, 0, 0.22, 0.27, 0.2, palette.metal);
    cylinder(0, 1.65, 0, 0.055, 0.09, 3.1, palette.metal);
    box(0, 3.28, 0, 0.45, 0.09, 0.45, palette.metal);
    box(0, 3.08, 0, 0.3, 0.3, 0.3, 0xe3cc94);
    for (const x of [-0.15, 0.15])
      for (const z of [-0.15, 0.15])
        beam([x, 2.88, z], [x, 3.23, z], 0.018, palette.metal);
  }
  if (kind === "tree") {
    beam([0, 0, 0], [0.12, 2.6, 0], 0.16, palette.wood);
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4 + variant * 0.3,
        x = Math.sin(a) * 0.85,
        z = Math.cos(a) * 0.8,
        y = 2.5 + (i % 3) * 0.38;
      beam([0.06, 1.7, 0], [x, y, z], 0.07, palette.wood);
      const crown = mesh(
        new THREE.IcosahedronGeometry(1, 1),
        i % 2 ? palette.leaf : palette.leafLight,
        x,
        y + 0.45,
        z,
      );
      crown.scale.set(1.05, 0.85 + i * 0.025, 0.9);
      crown.rotation.y = a;
    }
  }
  if (kind === "cabinet") {
    box(0, 0.9, 0, 1.4, 1.8, 0.6, palette.metal);
    for (const x of [-0.35, 0.35]) {
      const hinge = new THREE.Group();
      hinge.name = x < 0 ? "doorLeft" : "doorRight";
      hinge.position.set(x < 0 ? -0.7 : 0.7, 0, -0.33);
      root.add(hinge);
      const door = new THREE.Mesh(
        roundedBox(0.68, 1.72, 0.04),
        material(palette.fabric),
      );
      door.position.set(x < 0 ? 0.35 : -0.35, 0.9, 0);
      hinge.add(door);
    }
    for (const x of [-0.55, 0.55])
      box(x, 0.08, 0, 0.09, 0.16, 0.55, palette.edge);
    root.userData.animation = { nodes: ["doorLeft", "doorRight"], axis: "y" };
  }
  if (kind === "console") {
    box(0, 0.7, 0, 1.6, 1.4, 0.85, palette.metal);
    const panel = box(0, 1.38, -0.06, 1.6, 0.08, 1, palette.edge);
    panel.rotation.x = -0.12;
    for (let i = 0; i < 4; i++) {
      box(-0.5 + i * 0.33, 1.46, -0.23, 0.24, 0.08, 0.3, 0x839b82);
      cylinder(-0.5 + i * 0.33, 1.49, 0.23, 0.045, 0.045, 0.06, palette.brass);
    }
    box(0, 1.9, 0.35, 1.1, 0.7, 0.08, palette.metal);
    box(0, 1.9, 0.29, 0.96, 0.52, 0.015, 0x89a7a0);
  }
  if (kind === "valve") {
    cylinder(0, 0.08, 0, 0.3, 0.35, 0.16, palette.metal);
    cylinder(0, 0.65, 0, 0.09, 0.09, 1.3, palette.metal);
    const wheel = new THREE.Group();
    wheel.name = "wheel";
    wheel.position.set(0, 1.2, -0.15);
    root.add(wheel);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.04, 8, 24),
      material(palette.brass),
    );
    wheel.add(rim);
    for (let i = 0; i < 3; i++) {
      const spoke = new THREE.Mesh(
        roundedBox(0.65, 0.04, 0.04),
        material(palette.brass),
      );
      spoke.rotation.z = (i * Math.PI) / 3;
      wheel.add(spoke);
    }
    root.userData.animation = { node: "wheel", axis: "z" };
  }
  root.updateMatrixWorld(true);
  return root;
}
export function placeProp(
  parent,
  kind,
  { x = 0, y = 0, z = 0, rotation = 0, scale = 1, variant = 0 } = {},
) {
  const prop = createProp(kind, { variant });
  prop.position.set(x, y, z);
  prop.rotation.y = rotation;
  prop.scale.setScalar(scale);
  parent.add(prop);
  return prop;
}
