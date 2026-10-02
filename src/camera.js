import { Vector3 } from "../vendor/three.module.js";
import { cameraFraction } from "./collision.js";
export class FollowCamera {
  constructor() {
    this.anchor = new Vector3();
    this.position = new Vector3();
    this.desired = new Vector3();
    this.ready = false;
  }
  reset(position, height) {
    this.anchor.set(position.x, height + 1.7, position.z);
    this.ready = false;
  }
  update(camera, world, position, yaw, pitch, dt, reduced = false) {
    const height = world.heightAt(position);
    if (!this.ready) this.anchor.set(position.x, height + 1.7, position.z);
    const follow = 1 - Math.exp(-dt * 18);
    this.anchor.x = position.x;
    this.anchor.z = position.z;
    this.anchor.y += (height + 1.7 - this.anchor.y) * follow;
    const length = 8.5,
      horizontal = Math.cos(pitch) * length;
    this.desired.set(
      position.x + Math.sin(yaw) * horizontal,
      this.anchor.y + Math.sin(pitch) * length,
      position.z + Math.cos(yaw) * horizontal,
    );
    const obstacles = world.obstacles.filter((o) => o.height > 0.8);
    const fraction = cameraFraction(this.anchor, this.desired, obstacles);
    this.desired.lerpVectors(this.anchor, this.desired, fraction);
    if (!this.ready) {
      this.position.copy(this.desired);
      this.ready = true;
    } else this.position.lerp(this.desired, 1 - Math.exp(-dt * 7));
    // Retest the interpolated position: smoothing around a corner can cross a wall.
    this.position.lerpVectors(
      this.anchor,
      this.position,
      cameraFraction(this.anchor, this.position, obstacles),
    );
    this.position.y = Math.max(
      this.position.y,
      world.heightAt(this.position) + 0.35,
    );
    camera.position.copy(this.position);
    if (world.shake && !reduced) {
      camera.position.x += Math.sin(world.effectTime * 79) * world.shake * 0.45;
      camera.position.y += Math.sin(world.effectTime * 103) * world.shake * 0.3;
    }
    camera.lookAt(this.anchor);
    return {
      distance: this.position.distanceTo(this.anchor),
      occluded: fraction < 1,
    };
  }
}
