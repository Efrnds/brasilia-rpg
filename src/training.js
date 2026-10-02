export function buildTraining(world) {
  world.disposeGroup(world.environment);
  world.environment = new world.THREE.Group();
  world.scene.add(world.environment);
  world.obstacles = [];
  world.cameraWalls = [];
  world.animated = [];
  world.npcs = [];
  world.practice = true;
  world.level = {
    chapter: 1,
    name: "Pátio de treino",
    bounds: { minX: -15, maxX: 15, minZ: -45, maxZ: 15 },
    spawn: { x: 0, z: 10 },
    mobs: [
      { x: -6, z: -21 },
      { x: 6, z: -23 },
    ],
    boss: { x: 0, z: -27 },
    witness: { x: 0, z: 10 },
    helper: { x: 0, z: 10 },
    gatekeeper: { x: 0, z: -6 },
    evidence: { x: 0, z: 10 },
    sideItem: { x: 0, z: 10 },
    collection: { x: 8, z: -41 },
    firstArena: { x: 0, z: -20, w: 26, d: 24 },
    bossArena: { x: 0, z: -20, w: 26, d: 24 },
    surfaces: [
      { id: "chegada", type: "rect", x: 0, z: 8, w: 16, d: 12, y: 0 },
      { id: "corredor", type: "rect", x: 0, z: -3, w: 5, d: 10, y: 0 },
      { id: "arena", type: "rect", x: 0, z: -20, w: 26, d: 24, y: 0 },
      {
        id: "rampa",
        type: "rect",
        x: 8,
        z: -35,
        w: 4,
        d: 8,
        y: 0,
        ramp: { axis: "z", from: -31, to: -39, fromY: 0, toY: 2 },
      },
      { id: "passarela", type: "rect", x: 8, z: -41, w: 4, d: 4, y: 2 },
    ],
  };
  world.scene.background.setHex(0xceba98);
  world.scene.fog.color.copy(world.scene.background);
  for (const s of world.level.surfaces) {
    if (s.ramp)
      world.ramp(
        [
          [6, 2, -39],
          [10, 2, -39],
          [10, 0, -31],
          [6, 0, -31],
        ],
        0x86765e,
      );
    else
      world.box(
        s.x,
        s.y - 0.16,
        s.z,
        s.w,
        0.32,
        s.d,
        s.id === "arena" ? 0xc6b793 : 0xd9ccaf,
      );
  }
  world.obstacle(-2.65, -3, 0.3, 10, 3.1, 0xbbad91);
  world.obstacle(2.65, -3, 0.3, 10, 3.1, 0xbbad91);
  world.obstacle(0, -20, 3, 2, 1.4, 0x776d56);
  world.prop("crate", 0, -20, { y: 1.4 });
  world.prop("bench", -5, 10);
  world.prop("desk", 5, 8);
  world.obstacles.push({ x: 5, z: 8, w: 1.2, d: 0.625, height: 0.85, base: 0 });
  for (const x of [-12.8, 12.8]) world.obstacle(x, -20, 0.3, 24, 2.5, 0xb4a98e);
  world.obstacle(0, -32, 12, 0.3, 2.5, 0xb4a98e);
  world.label("TREINO / F PARA ATACAR · Q PARA DEFENDER", 0, 4, -11, 10);
  world.label("PASSARELA / TESTE DE CÂMERA", 8, 4.7, -42, 7);
  world.prop("chair", 7, -41, { y: 2 });
  for (const x of [6, 10]) world.beam([x, 1, -31], [x, 3, -39], 0.07, 0x575d4e);
}
