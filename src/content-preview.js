import * as THREE from "../vendor/three.module.js";
export function createContentPreview(world) {
  const root = new THREE.Group();
  root.name = "content-preview";
  const add = (geometry, color, x, y, z) => {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color, wireframe: true, depthTest: false }),
    );
    mesh.position.set(x, y, z);
    root.add(mesh);
  };
  for (const o of world.obstacles)
    add(
      new THREE.BoxGeometry(o.w * 2, o.height, o.d * 2),
      0xd1a071,
      o.x,
      o.base + o.height / 2,
      o.z,
    );
  for (const [key, p] of Object.entries(world.level.checkpoints || {}))
    add(
      new THREE.SphereGeometry(0.4, 8, 6),
      0xe9e0a6,
      p.x,
      world.heightAt(p) + 0.5,
      p.z,
    );
  for (const p of [...world.level.mobs, world.level.boss])
    add(
      new THREE.CylinderGeometry(3.3, 3.3, 0.02, 24),
      0xbed092,
      p.x,
      world.heightAt(p) + 0.05,
      p.z,
    );
  world.scene.add(root);
  return root;
}
