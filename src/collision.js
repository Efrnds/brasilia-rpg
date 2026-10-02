export const BODY_RADIUS = 0.4;
export function circleOverlapsBox(x, z, radius, box) {
  const dx = Math.max(0, Math.abs(x - box.x) - box.w);
  const dz = Math.max(0, Math.abs(z - box.z) - box.d);
  return dx * dx + dz * dz < radius * radius - 1e-8;
}
export function segmentBoxEntry(from, to, box, padding = 0) {
  let near = 0,
    far = 1;
  const ranges = {
    x: [box.x - box.w - padding, box.x + box.w + padding],
    y: [box.base - padding, box.base + box.height + padding],
    z: [box.z - box.d - padding, box.z + box.d + padding],
  };
  for (const axis of ["x", "y", "z"]) {
    const delta = to[axis] - from[axis],
      [min, max] = ranges[axis];
    if (Math.abs(delta) < 1e-9) {
      if (from[axis] < min || from[axis] > max) return null;
      continue;
    }
    const a = (min - from[axis]) / delta,
      b = (max - from[axis]) / delta;
    near = Math.max(near, Math.min(a, b));
    far = Math.min(far, Math.max(a, b));
    if (near > far) return null;
  }
  return near;
}
export function cameraFraction(target, desired, obstacles, radius = 0.28) {
  let fraction = 1;
  const length = Math.hypot(
    desired.x - target.x,
    desired.y - target.y,
    desired.z - target.z,
  );
  for (const box of obstacles) {
    const entry = segmentBoxEntry(target, desired, box, radius);
    if (entry !== null)
      fraction = Math.min(
        fraction,
        Math.max(0, entry - 0.08 / Math.max(length, 0.01)),
      );
  }
  return fraction;
}
