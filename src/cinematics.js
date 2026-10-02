import { cameraFraction } from "./collision.js";
import * as THREE from "../vendor/three.module.js";
export class SceneFraming {
  constructor() {
    this.shot = null;
  }
  focus(actor, kind = "intro") {
    this.shot = { actor, kind, elapsed: 0 };
  }
  clear() {
    this.shot = null;
  }
  update(camera, world, dt) {
    if (!this.shot || !this.shot.actor.parent) return false;
    const point = this.shot.actor.position,
      target = new THREE.Vector3(point.x, point.y + 1.5, point.z),
      desired = new THREE.Vector3(point.x + 4, point.y + 3, point.z + 7);
    desired.lerpVectors(
      target,
      desired,
      cameraFraction(
        target,
        desired,
        world.obstacles.filter((o) => o.height > 0.8),
      ),
    );
    camera.position.lerp(desired, 1 - Math.exp(-dt * 7));
    camera.position.lerpVectors(
      target,
      camera.position,
      cameraFraction(
        target,
        camera.position,
        world.obstacles.filter((o) => o.height > 0.8),
      ),
    );
    camera.lookAt(target);
    this.shot.elapsed += dt;
    return true;
  }
}
