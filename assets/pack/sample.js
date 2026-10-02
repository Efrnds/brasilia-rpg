import * as THREE from "../../vendor/three.module.js";
import { createProp } from "./props.js";
import { createArchitecture } from "./architecture.js";
import { createCharacterRig } from "./characters.js";
import { createSurfaceMaterial } from "./materials.js";
export function createArtSample() {
  const root = new THREE.Group();
  root.name = "amostra-palacio";
  for (const x of [-1.5, 1.5])
    for (const z of [-1.5, 1.5]) {
      const tile = createArchitecture("floor");
      tile.position.set(x, 0, z);
      root.add(tile);
    }
  const wall = createArchitecture("wall");
  wall.position.set(-1.5, 0, -3);
  root.add(wall);
  const window = createArchitecture("window");
  window.position.set(1.5, 1, -3);
  root.add(window);
  const chair = createProp("chair");
  chair.position.set(1.6, 0, -1.8);
  root.add(chair);
  const desk = createProp("desk");
  desk.position.set(1.6, 0, -0.8);
  root.add(desk);
  const actor = createCharacterRig("luli");
  actor.root.position.set(-1.3, 0, 1.3);
  root.add(actor.root);
  const enemy = new THREE.Group();
  enemy.position.set(-1.5, 0, -1.3);
  for (let i = 0; i < 6; i++) {
    const paper = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.23, 0.8),
      createSurfaceMaterial("paper", i % 2 ? 0xf6e8c8 : 0xc0b89c),
    );
    paper.position.y = 0.7 + i * 0.24;
    paper.rotation.y = i * 0.12;
    enemy.add(paper);
  }
  for (const x of [-0.35, 0.35]) {
    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.55, 0.3),
      createSurfaceMaterial("metal", 0x293d36),
    );
    foot.position.set(x, 0.275, 0);
    enemy.add(foot);
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 10, 8),
      createSurfaceMaterial("paper", 0xf3ecd9),
    );
    eye.position.set(x, 1.7, -0.44);
    enemy.add(eye);
  }
  root.add(enemy);
  root.updateMatrixWorld(true);
  return root;
}
