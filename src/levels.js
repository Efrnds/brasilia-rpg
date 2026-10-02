const rect = (id, x, z, w, d, y = 0, options = {}) => ({
  id,
  type: "rect",
  x,
  z,
  w,
  d,
  y,
  ...options,
});
const island = (id, x, z, radius, y = 0, options = {}) => ({
  id,
  type: "circle",
  x,
  z,
  radius,
  y,
  ...options,
});

export const LEVELS = [
  {
    chapter: 1,
    name: "Palácio / Praça e arquivos",
    bounds: { minX: -32, maxX: 25, minZ: -56, maxZ: 34 },
    spawn: { x: 0, z: 29 },
    witness: { x: -5, z: 23 },
    helper: { x: 11, z: 28 },
    gatekeeper: { x: -10, z: 1 },
    evidence: { x: -25, z: 5 },
    sideItem: { x: 18, z: 17 },
    collection: { x: 9, z: -50 },
    gate: { x: -10, z: -6, w: 8, d: 0.35 },
    arenaSpawn: { x: -10, z: -10 },
    bossSpawn: { x: 6, z: -35 },
    mobs: [
      { x: -15, z: -17 },
      { x: -5, z: -24 },
    ],
    boss: { x: 9, z: -43 },
    firstArena: { x: -10, z: -21, w: 18, d: 24 },
    bossArena: { x: 8, z: -43, w: 26, d: 25 },
    surfaces: [
      rect("praca", 0, 22, 48, 24),
      rect("ala-oeste", -10, 4, 9, 14),
      rect("entrada-oeste", -10, -4.5, 9, 5, 0, { lock: "permit" }),
      rect("arquivo", -25, 5, 12, 16),
      rect("acesso-arquivo", -18, 6, 8, 5),
      rect("corredor", -10, -21, 19, 30, 0, { lock: "permit" }),
      rect("cotovelo", 0, -32, 20, 7, 0, { lock: "permit" }),
      rect("plenaria", 8, -44, 27, 24, 0, { lock: "boss" }),
    ],
    checkpoints: {
      investigate: { x: 0, z: 29 },
      permit: { x: -9, z: 5 },
      arena: { x: -10, z: -10 },
      boss: { x: 6, z: -35 },
      coffee: { x: 8, z: -44 },
      complete: { x: 9, z: -50 },
    },
    route: [
      { x: 0, z: 29 },
      { x: -5, z: 23 },
      { x: -10, z: 12 },
      { x: -10, z: 1 },
      { x: -10, z: -10 },
      { x: -15, z: -17 },
      { x: -10, z: -28 },
      { x: 3, z: -32 },
      { x: 8, z: -37 },
      { x: 9, z: -50 },
    ],
  },
  {
    chapter: 2,
    name: "Estúdio / Arquivo e passarela",
    bounds: { minX: -34, maxX: 31, minZ: -45, maxZ: 27 },
    spawn: { x: -25, z: 22 },
    witness: { x: -22, z: 13 },
    helper: { x: -29, z: 21 },
    gatekeeper: { x: -8, z: 15 },
    evidence: { x: -18, z: -8 },
    sideItem: { x: -29, z: 9 },
    collection: { x: -3, z: -38 },
    gate: { x: 1, z: 15, w: 0.35, d: 8 },
    arenaSpawn: { x: 6, z: 16 },
    bossSpawn: { x: 24, z: -21 },
    mobs: [
      { x: 15, z: 17 },
      { x: 23, z: 7 },
    ],
    boss: { x: 9, z: -30 },
    firstArena: { x: 16, z: 13, w: 26, d: 19 },
    bossArena: { x: 10, z: -30, w: 38, d: 26 },
    surfaces: [
      rect("recepcao", -23, 16, 20, 20),
      rect("arquivo", -23, -3, 20, 18),
      rect("sala-controle", -6, 15, 16, 8),
      rect("producao", 16, 13, 28, 20, 0, { lock: "permit" }),
      rect("rampa", 26, -4, 6, 16, 0, {
        lock: "permit",
        ramp: { axis: "z", from: 4, to: -12, fromY: 0, toY: 3 },
      }),
      rect("passarela", 26, -15, 6, 7, 3, { lock: "permit" }),
      rect("palco", 10, -31, 39, 26, 3, { lock: "boss" }),
    ],
    checkpoints: {
      investigate: { x: -25, z: 22 },
      permit: { x: -8, z: 15 },
      arena: { x: 6, z: 16 },
      boss: { x: 24, z: -21 },
      coffee: { x: 8, z: -32 },
      complete: { x: -3, z: -38 },
    },
    route: [
      { x: -25, z: 22 },
      { x: -22, z: 13 },
      { x: -8, z: 15 },
      { x: 6, z: 16 },
      { x: 17, z: 13 },
      { x: 26, z: 8 },
      { x: 26, z: -12 },
      { x: 26, z: -21 },
      { x: 9, z: -30 },
      { x: -3, z: -38 },
    ],
  },
  {
    chapter: 3,
    name: "Jardim / Ilhas de mensagens",
    bounds: { minX: -30, maxX: 33, minZ: -44, maxZ: 36 },
    spawn: { x: -17, z: 28 },
    witness: { x: -15, z: 20 },
    helper: { x: -23, z: 29 },
    gatekeeper: { x: -5, z: 18 },
    evidence: { x: -19, z: -15 },
    sideItem: { x: -8, z: 29 },
    collection: { x: 24, z: -31 },
    gate: { x: -1, z: 18, w: 0.3, d: 5 },
    arenaSpawn: { x: 5, z: 17 },
    bossSpawn: { x: 14, z: -12 },
    mobs: [
      { x: 8, z: 12 },
      { x: 16, z: 5 },
    ],
    boss: { x: 13, z: -25 },
    firstArena: { x: 10, z: 10, radius: 12 },
    bossArena: { x: 13, z: -25, radius: 17 },
    surfaces: [
      rect("vila", -15, 24, 24, 22),
      rect("caminho-mural", -22, 4, 6, 19),
      island("mural", -19, -15, 8),
      rect("ponte-mural", -22, -7, 5, 9),
      rect("ponte-entrada", 0, 18, 8, 5, 0, { lock: "permit" }),
      island("correntes", 10, 10, 12, 0, { lock: "permit" }),
      rect("ponte-alta", 14, -5, 5, 17, 0, {
        lock: "permit",
        ramp: { axis: "z", from: 3.5, to: -13.5, fromY: 0, toY: 1.5 },
      }),
      island("deposito", 13, -25, 17, 1.5, { lock: "boss" }),
      rect("atalho-mural", -6, -15, 17, 4, 0, {
        lock: "boss",
        requiresEvidence: true,
        ramp: { axis: "x", from: -14.5, to: 2.5, fromY: 0, toY: 1.5 },
      }),
    ],
    checkpoints: {
      investigate: { x: -17, z: 28 },
      permit: { x: -5, z: 18 },
      arena: { x: 5, z: 17 },
      boss: { x: 14, z: -12 },
      coffee: { x: 13, z: -25 },
      complete: { x: 24, z: -31 },
    },
    route: [
      { x: -17, z: 28 },
      { x: -15, z: 20 },
      { x: -5, z: 18 },
      { x: 5, z: 18 },
      { x: 10, z: 10 },
      { x: 14, z: 3 },
      { x: 14, z: -12 },
      { x: 13, z: -25 },
      { x: 24, z: -31 },
    ],
  },
];

export const levelFor = (chapter) => LEVELS[chapter - 1];
export const contains = (surface, x, z, inset = 0) =>
  surface.type === "circle"
    ? Math.hypot(x - surface.x, z - surface.z) <= surface.radius - inset
    : Math.abs(x - surface.x) <= surface.w / 2 - inset &&
      Math.abs(z - surface.z) <= surface.d / 2 - inset;
export function surfaceHeight(surface, x, z) {
  if (!surface.ramp) return surface.y;
  const ramp = surface.ramp,
    value = ramp.axis === "x" ? x : z;
  const t = Math.max(
    0,
    Math.min(1, (value - ramp.from) / (ramp.to - ramp.from)),
  );
  return ramp.fromY + t * (ramp.toY - ramp.fromY);
}
export function floorAt(
  level,
  x,
  z,
  state = { permit: true, stage: "coffee", stamp: true },
) {
  const allowed = level.surfaces.filter((surface) => {
    if (!contains(surface, x, z)) return false;
    if (surface.requiresEvidence && !state.stamp) return false;
    if (surface.lock === "permit" && !state.permit) return false;
    if (
      surface.lock === "boss" &&
      !["boss", "coffee", "complete"].includes(state.stage)
    )
      return false;
    return true;
  });
  if (!allowed.length) return null;
  return Math.max(...allowed.map((s) => surfaceHeight(s, x, z)));
}
export const checkpointPosition = (state) => ({
  ...levelFor(state.chapter).checkpoints[state.stage],
});
