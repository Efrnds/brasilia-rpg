export const BASIC_ATTACK = Object.freeze({
  duration: 0.55,
  impact: 0.2,
  range: 3.3,
  halfAngle: Math.PI * 0.36,
  heightTolerance: 1.4,
  buffer: 0.16,
});
export const DODGE = Object.freeze({
  duration: 0.32,
  protection: 0.32,
  cooldown: 0.8,
  cost: 25,
  speed: 13,
});
export function inMeleeArc(
  origin,
  target,
  angle,
  {
    range = BASIC_ATTACK.range,
    halfAngle = BASIC_ATTACK.halfAngle,
    targetRadius = 0.45,
    heightTolerance = BASIC_ATTACK.heightTolerance,
  } = {},
) {
  const dx = target.x - origin.x,
    dz = target.z - origin.z,
    d = Math.hypot(dx, dz);
  if (
    d > range + targetRadius ||
    Math.abs((origin.y || 0) - (target.y || 0)) > heightTolerance
  )
    return false;
  if (d < targetRadius) return true;
  return (
    (-Math.sin(angle) * dx - Math.cos(angle) * dz) / d >= Math.cos(halfAngle)
  );
}
