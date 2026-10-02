import * as THREE from "../../vendor/three.module.js";
import { createSurfaceMaterial } from "./materials.js";
export const ARCHITECTURE = {
  ramp: { name: "Rampa 3 × 6 m", size: [3, 1.5, 6] },
  wall: { name: "Parede 3 m", size: [3, 3, 0.22] },
  corner: { name: "Canto interno", size: [3, 3, 3] },
  door: { name: "Porta articulada", size: [1.4, 2.5, 0.2] },
  window: { name: "Janela de expediente", size: [2.4, 1.4, 0.15] },
  floor: { name: "Piso 3 × 3", size: [3, 0.18, 3] },
  stairs: { name: "Escada 6 degraus", size: [2, 1.2, 3] },
  railing: { name: "Corrimão 3 m", size: [3, 1.1, 0.12] },
  column: { name: "Coluna de concreto", size: [0.45, 3, 0.45] },
};
export function createArchitecture(kind) {
  if (!ARCHITECTURE[kind]) throw new Error("Módulo desconhecido");
  const group = new THREE.Group();
  group.name = kind;
  group.userData = {
    asset: kind,
    units: "meters",
    license: "CC0-1.0",
    collider: ARCHITECTURE[kind].size,
  };
  const material = createSurfaceMaterial("concrete", 0xd2c6ad),
    metal = createSurfaceMaterial("metal", 0x4d5c55),
    wood = createSurfaceMaterial("wood", 0x846448);
  const box = (x, y, z, w, h, d, m = material, parent = group) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  if (kind === "ramp") {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [-1.5, 1.5, -3, 1.5, 1.5, -3, 1.5, 0, 3, -1.5, 0, 3],
        3,
      ),
    );
    g.setIndex([0, 2, 1, 0, 3, 2]);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, material);
    m.receiveShadow = true;
    group.add(m);
    group.userData.ramp = { axis: "z", from: 3, to: -3, fromY: 0, toY: 1.5 };
  }
  if (kind === "wall") box(0, 1.5, 0, 3, 3, 0.22);
  if (kind === "corner") {
    box(0, 1.5, -1.39, 3, 3, 0.22);
    box(-1.39, 1.5, 0, 0.22, 3, 3);
  }
  if (kind === "floor") box(0, -0.09, 0, 3, 0.18, 3);
  if (kind === "column") box(0, 1.5, 0, 0.45, 3, 0.45);
  if (kind === "railing") {
    box(0, 1.05, 0, 3, 0.08, 0.12, metal);
    for (const x of [-1.45, 0, 1.45]) box(x, 0.55, 0, 0.07, 1.1, 0.07, metal);
  }
  if (kind === "stairs")
    for (let i = 0; i < 6; i++)
      box(0, (i + 1) * 0.1, 1.25 - i * 0.5, 2, (i + 1) * 0.2, 0.5);
  if (kind === "window") {
    box(0, 0, 0, 2.4, 0.06, 0.15, metal);
    box(0, 1.4, 0, 2.4, 0.06, 0.15, metal);
    for (const x of [-1.2, 0, 1.2]) box(x, 0.7, 0, 0.06, 1.4, 0.15, metal);
    box(
      0,
      0.7,
      0,
      2.3,
      1.3,
      0.02,
      new THREE.MeshStandardMaterial({
        color: 0x9bbbbb,
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
      }),
    );
  }
  if (kind === "door") {
    for (const x of [-0.72, 0.72]) box(x, 1.25, 0, 0.12, 2.5, 0.25);
    box(0, 2.5, 0, 1.55, 0.12, 0.25);
    const hinge = new THREE.Group();
    hinge.name = "hinge";
    hinge.position.x = -0.65;
    group.add(hinge);
    box(0.65, 1.22, 0, 1.3, 2.4, 0.08, wood, hinge);
    box(1.15, 1.15, -0.08, 0.2, 0.04, 0.08, metal, hinge);
    group.userData.animation = {
      node: "hinge",
      axis: "y",
      closed: 0,
      open: -Math.PI * 0.5,
    };
  }
  group.updateMatrixWorld(true);
  return group;
}
