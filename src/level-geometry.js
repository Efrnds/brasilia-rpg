import { createArchitecture } from "../assets/pack/architecture.js";
import { surfaceHeight } from "./levels.js";

const C = {
  stone: 0xddd0b3,
  paper: 0xf2e4c3,
  dark: 0x263e35,
  green: 0x587d46,
  yellow: 0xf2c14c,
  red: 0xae4936,
  wood: 0x866144,
  blue: 0x537c89,
};
function floor(w, s, color) {
  if (s.type === "circle") {
    w.cylinder(
      s.x,
      s.y - 0.35,
      s.z,
      s.radius,
      s.radius * 0.93,
      0.7,
      color,
      w.environment,
      32,
    );
  } else if (s.ramp) {
    const x1 = s.x - s.w / 2,
      x2 = s.x + s.w / 2,
      z1 = s.z - s.d / 2,
      z2 = s.z + s.d / 2;
    w.ramp(
      [
        [x1, surfaceHeight(s, x1, z1), z1],
        [x2, surfaceHeight(s, x2, z1), z1],
        [x2, surfaceHeight(s, x2, z2), z2],
        [x1, surfaceHeight(s, x1, z2), z2],
      ],
      color,
    );
  } else w.box(s.x, s.y - 0.17, s.z, s.w, 0.34, s.d, color);
}
function doorway(
  w,
  axis,
  fixed,
  from,
  to,
  center,
  gap,
  color,
  height = 3.1,
  base = 0,
) {
  for (const [a, b] of [
    [from, center - gap / 2],
    [center + gap / 2, to],
  ]) {
    if (b <= a) continue;
    if (axis === "x")
      w.obstacle((a + b) / 2, fixed, b - a, 0.45, height, color, base);
    else w.obstacle(fixed, (a + b) / 2, 0.45, b - a, height, color, base);
  }
  if (axis === "x")
    w.box(center, base + height + 0.3, fixed, gap + 0.6, 0.6, 0.5, color);
  else w.box(fixed, base + height + 0.3, center, 0.5, 0.6, gap + 0.6, color);
}
function shelf(w, x, z, width = 3) {
  w.prop("shelf", x, z, { scale: width / 2.6 });
  w.obstacles.push({ x, z, w: width / 2, d: 0.375, base: 0, height: 2.8 });
}
function chair(w, x, z, angle = 0, y = 0) {
  w.prop("chair", x, z, { y, rotation: angle });
}
function arrow(w, x, y, z, angle, color = C.yellow) {
  const root = w.group(x, y + 0.035, z);
  root.rotation.y = angle;
  w.box(0, 0, 0, 0.26, 0.015, 1.4, color, root);
  for (const side of [-1, 1]) {
    const tip = w.box(side * 0.22, 0, -0.55, 0.2, 0.02, 0.7, color, root);
    tip.rotation.y = side * -0.65;
  }
}
function sign(w, text, x, y, z, width, ...rest) {
  return w.label(
    text,
    x,
    Math.min(y, w.heightAt({ x, z }) + 3.15),
    z,
    Math.min(width, 4),
    ...rest,
  );
}
function module(w, kind, x, y, z, angle = 0) {
  const root = createArchitecture(kind);
  root.position.set(x, y, z);
  root.rotation.y = angle;
  w.environment.add(root);
  return root;
}
function warmLight(w, x, y, z, color, intensity = 4) {
  const light = new w.THREE.PointLight(color, intensity, 13, 2);
  light.position.set(x, y, z);
  w.environment.add(light);
}
function palace(w) {
  const level = w.level;
  w.box(-4, -1.1, -9, 115, 1.3, 140, 0x708451);
  for (const surface of level.surfaces)
    floor(w, surface, surface.id === "plenaria" ? 0xc1b598 : C.stone);
  w.obstacle(1, 21, 10, 10, 0.7, C.dark);
  w.box(1, 0.72, 21, 9.4, 0.05, 9.4, 0x71a6a2);
  w.cylinder(1, 1.1, 21, 1.5, 2, 0.7, C.paper);
  w.cylinder(1, 2.3, 21, 0.3, 0.6, 2, C.paper);
  for (const [x, z] of [
    [-22, 29],
    [22, 30],
    [-22, 14],
    [21, 12],
  ])
    w.tree(x, z);
  w.bench(17, 17);
  w.bench(15, 31);
  w.bench(-17, 29);
  for (let z = 12; z <= 31; z += 4)
    w.box(-10, 0.04, z, 5.5, 0.03, 0.05, 0xb8ae94);
  sign(w, "COPA / INÍCIO DA INVESTIGAÇÃO", -7, 4, 25, 7);
  w.prop("coffeeCart", -5, 25);
  warmLight(w, -6, 3, 25, 0xffd49b, 6);
  for (const z of [3, 8]) module(w, "window", -31, 0.9, z, Math.PI / 2);
  module(w, "door", -15.5, 0, 6, Math.PI / 2).getObjectByName(
    "hinge",
  ).rotation.y = -Math.PI * 0.5;
  sign(w, "ALA DE PROTOCOLOS", -10, 4.9, 1, 7);
  doorway(w, "x", 10, -15, -5, -10, 7, C.paper, 4.5);
  doorway(w, "z", -15.5, -3, 10, 6, 5, C.paper, 3.6);
  w.obstacle(-31.2, 5, 0.5, 16, 3.4, C.paper);
  w.obstacle(-25, -3.2, 12, 0.5, 3.4, C.paper);
  shelf(w, -27, 2);
  shelf(w, -27, 10);
  sign(w, "ARQUIVO / CARIMBOS", -25, 3.8, 12, 7);
  w.table(-10, 2.8);
  for (const x of [-20, 0]) {
    w.obstacle(x, -21, 0.7, 30, 4.2, C.paper);
    for (let z = -10; z > -34; z -= 6) {
      w.cylinder(x, 2.2, z, 0.4, 0.4, 4.4, C.paper);
      w.box(x, 4.7, z, 1, 0.3, 1, C.stone);
    }
  }
  w.obstacle(-9, -18, 5.5, 2.4, 1.3, C.wood);
  w.box(-9, 1.4, -18, 5.8, 0.15, 2.7, C.paper);
  w.obstacle(-14.5, -28, 3, 2, 1.8, C.stone);
  sign(w, "EMENDAS / PÁTIO INTERNO", -10, 4.5, -10, 8);
  arrow(w, -14, 0.04, -21, 0);
  arrow(w, -9, 0.04, -30, Math.PI / 2);
  arrow(w, 2, 0.04, -32, Math.PI / 2);
  w.obstacle(8, -56, 27, 0.6, 4.5, C.paper);
  w.obstacle(21.6, -44, 0.6, 24, 4.5, C.paper);
  doorway(w, "x", -32, -5.5, 21.5, 6, 8, C.paper, 4.2);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    chair(w, 9 + Math.cos(a) * 8, -44 + Math.sin(a) * 6, -a + Math.PI / 2);
  }
  sign(w, "PLENÁRIA / O CENTRÃO", 9, 5.5, -55, 13);
  w.box(9, 0.06, -43, 12, 0.1, 11, 0xaca187);
  sign(w, "37-B / MANIFESTO DE CARGA", 9, 2.8, -51, 6);
  const towers = w.group(-32, 0, -70);
  w.box(-2, 12, 0, 3, 24, 5, C.paper, towers);
  w.box(2, 12, 0, 3, 24, 5, C.paper, towers);
  w.box(0, 4, 0, 9, 1, 6, C.stone, towers);
  w.cylinder(20, 2, -2, 8, 4, 4, C.paper, towers, 24);
  w.mesh(
    new w.THREE.SphereGeometry(6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    C.paper,
    [10, 0, 0],
    towers,
  );
}
function studio(w) {
  for (const surface of w.level.surfaces)
    floor(
      w,
      surface,
      surface.id === "palco"
        ? 0x37454c
        : surface.id === "rampa" || surface.id === "passarela"
          ? 0x85969b
          : 0x697f80,
    );
  w.box(-3, -1.2, -8, 95, 1, 105, 0x213238);
  w.obstacle(-33, 7, 0.6, 39, 3.2, C.dark);
  w.obstacle(-23, 26, 20, 0.5, 3.2, C.dark);
  doorway(w, "x", 6, -33, -13, -25, 5, C.dark);
  doorway(w, "z", -13, 6, 26, 15, 8, C.dark);
  w.obstacle(-23, -12, 20, 0.5, 3.2, C.dark);
  for (const [x, z] of [
    [-29, -5],
    [-23, -4],
    [-17, -2],
  ])
    shelf(w, x, z, 3, 0x43535a);
  sign(w, "ARQUIVO / SEM CORTES", -23, 3.8, 5.6, 8);
  w.table(-22, 15);
  warmLight(w, -23, 3, 15, 0x96bac9, 6);
  module(w, "window", -23, 0.9, 25.8);
  module(w, "door", -25, 0, 6).getObjectByName("hinge").rotation.y =
    -Math.PI * 0.5;
  w.prop("planter", -30, 24);
  w.prop("crate", 22, 18, { y: 1.3 });
  sign(w, "RECEPÇÃO / SALA DE MÍDIA", -23, 4, 25, 10);
  w.box(-6, 1.1, 18, 8, 2.2, 1.2, C.dark);
  for (let x = -9; x <= -3; x += 3) {
    w.box(x, 2.8, 18, 2, 1.3, 0.2, C.dark);
    sign(
      w,
      "TRANSMISSÃO",
      x,
      2.8,
      17.87,
      1.8,
      w.environment,
      "#466d77",
      "#fff1cf",
    );
  }
  sign(w, "CONTROLE / ACESSO AO SET", -6, 4, 11, 8);
  w.obstacle(16, 23, 28, 0.5, 3.2, C.dark);
  w.obstacle(29.5, 13, 0.5, 20, 3.2, C.dark);
  w.obstacle(13, 7, 5, 3, 1.3, 0x304852);
  w.obstacle(22, 18, 4, 2.5, 1.3, 0x304852);
  for (const [x, z] of [
    [7, 7],
    [25, 21],
    [17, 5],
  ]) {
    w.cylinder(x, 2, z, 0.07, 0.07, 4, C.dark);
    w.mesh(new w.THREE.TorusGeometry(0.8, 0.08, 6, 24), C.yellow, [x, 3.6, z]);
  }
  for (let z = 14; z >= -14; z -= 4)
    arrow(w, 26, w.heightAt({ x: 26, z }), z, 0);
  for (const x of [22.7, 29.3]) {
    w.beam([x, 1, 4], [x, 4, -12], 0.12, C.yellow);
    for (let z = 3; z >= -16; z -= 4) {
      const y = w.heightAt({ x: 26, z });
      w.cylinder(x, y + 0.55, z, 0.06, 0.06, 1.1, C.yellow);
    }
    w.box(x, 4.1, -15, 0.12, 0.12, 7, C.yellow);
  }
  sign(w, "PASSARELA / ESTÚDIO PRINCIPAL", 26, 4.8, -13, 9);
  w.obstacle(10, -44, 39, 0.6, 4, C.dark, 3);
  w.obstacle(-9.5, -31, 0.6, 26, 4, C.dark, 3);
  w.obstacle(29.5, -31, 0.6, 26, 4, C.dark, 3);
  sign(
    w,
    "AO VIVO / NÃO ACREDITE NO CORTE",
    10,
    6.3,
    -43.6,
    22,
    w.environment,
    "#7e2e25",
    "#fff1cf",
  );
  for (const [x, z] of [
    [0, -25],
    [20, -25],
    [0, -36],
    [20, -36],
  ]) {
    w.prop("camera", x, z, { y: 3, rotation: x < 10 ? -0.5 : 0.5 });
  }
  for (const x of [22.7, 29.3]) module(w, "railing", x, 3, -15, Math.PI / 2);
  warmLight(w, 10, 6, -30, 0xffddb1, 9);
  w.box(9, 3.05, -30, 13, 0.1, 13, 0x765547);
  sign(w, "ROTEIRO / CLIENTE BOMDIA37", -3, 5.5, -40, 8);
  sign(w, "ADAPTADORES / EQUIPAMENTO", -29, 2.8, 9, 5);
}
function garden(w) {
  w.box(0, -2.3, -5, 125, 0.35, 130, 0x598d87);
  for (const surface of w.level.surfaces)
    floor(
      w,
      surface,
      surface.type === "circle"
        ? 0x87a368
        : surface.id.includes("ponte") || surface.id.includes("atalho")
          ? C.wood
          : 0xb4ad82,
    );
  w.table(-15, 22);
  warmLight(w, -16, 3, 22, 0xffd7a1, 5);
  w.prop("coffeeCart", -18, 30);
  w.prop("lamp", -5, 24);
  w.prop("crate", 25, -32, { y: 1.5 });
  w.bench(-9, 29);
  w.bench(-23, 23);
  sign(w, "CENTRO DA FAMÍLIA", -15, 4, 32, 10);
  for (const [x, z] of [
    [-25, 17],
    [-5, 32],
    [-25, 32],
    [-25, -15],
    [-18, -21],
    [3, 6],
    [20, 12],
    [4, -28],
    [24, -21],
  ])
    w.tree(x, z, w.heightAt({ x, z }));
  for (let z = 10; z >= -8; z -= 4) arrow(w, -22, 0.05, z, 0);
  sign(w, "MURAL / A PRIMEIRA MENSAGEM", -19, 3.9, -18, 9);
  w.box(-19, 1.8, -17, 5, 3.3, 0.35, C.dark);
  for (let i = 0; i < 6; i++)
    sign(
      w,
      i % 2 ? "REPASSADO" : "BOM DIA",
      -20.5 + (i % 3) * 1.5,
      1 + (i < 3 ? 1.6 : 0),
      -16.78,
      1.3,
      w.environment,
      "#c9d5b3",
      "#263e35",
    );
  for (const z of [16, 20]) w.beam([-4, 1, z], [4, 1, z], 0.13, C.dark);
  for (let z = 1; z >= -11; z -= 3) {
    const y = w.heightAt({ x: 14, z });
    for (const x of [11.5, 16.5]) {
      w.cylinder(x, y + 0.65, z, 0.08, 0.08, 1.3, C.paper);
    }
    w.box(14, y + 0.03, z, 4.8, 0.03, 0.09, C.dark);
  }
  w.beam([11.5, 1.3, 3.5], [11.5, 2.8, -13.5], 0.1, C.paper);
  w.beam([16.5, 1.3, 3.5], [16.5, 2.8, -13.5], 0.1, C.paper);
  for (let i = 0; i < 11; i++) {
    const a = (i * Math.PI * 2) / 11,
      x = 13 + Math.cos(a) * 14,
      z = -25 + Math.sin(a) * 14;
    const p = w.group(x, 1.5, z);
    p.rotation.y = -a + Math.PI / 2;
    w.box(0, 2, 0, 1.3, 4, 0.7, C.dark, p);
    sign(
      w,
      i % 3 ? "BOM DIA" : "REPASSE",
      0,
      2,
      -0.36,
      1.1,
      p,
      "#547847",
      "#fff1cf",
    );
    for (let petal = 0; petal < 6; petal++)
      w.ball(
        x + Math.cos((petal * Math.PI) / 3) * 0.35,
        2.9 + Math.sin((petal * Math.PI) / 3) * 0.35,
        z + 0.8,
        0.24,
        C.yellow,
      );
    w.ball(x, 2.9, z + 0.8, 0.24, C.red);
  }
  sign(w, "DEPÓSITO / NÃO É CAMPANHA DE DOAÇÃO", 13, 6, -38, 20);
  w.obstacle(25, -34, 8, 0.8, 3.6, C.wood, 1.5);
  w.obstacle(29, -30, 0.8, 8, 3.6, C.wood, 1.5);
  w.box(25, 5.5, -31, 9, 0.4, 8, C.red);
  sign(w, "CAFÉ / 37 PACOTES", 24, 4.5, -32, 6);
  sign(w, "ATALHO / SÓ A MENSAGEM ORIGINAL ABRE", -6, 3, -15, 10);
  w.shortcutGate = w.box(-8, 0.8, -15, 0.25, 1.6, 4, C.yellow);
  w.box(13, 1.54, -25, 8, 0.08, 8, 0xb2bc85);
}
export function buildLevelGeometry(w) {
  [palace, studio, garden][w.level.chapter - 1](w);
}
