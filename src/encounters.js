import { inMeleeArc } from "./combat.js";
export function enemyRole(chapter, index) {
  return chapter === 1
    ? index % 2
      ? "guard"
      : "melee"
    : chapter === 2
      ? index % 2
        ? "support"
        : "ranged"
      : index % 2
        ? "ranged"
        : "melee";
}
export function attackFor(enemy, content, state) {
  const boss = enemy.kind === "boss";
  let attack;
  if (boss) {
    attack = {
      ...content.attacks[(enemy.sequence - 1) % content.attacks.length],
    };
    if (content.number === 1) {
      attack.shape = enemy.sequence % 2 ? "line" : "ring";
      attack.length = 8;
      attack.width = 1.2;
      attack.innerRadius = 1.4;
      attack.damage *= Math.max(0.55, 1 - (enemy.armsDisabled || 0) * 0.08);
      if (state.environment["1:commission"]) attack.recovery += 0.6;
    } else if (content.number === 2) {
      attack.shape = ["line", "ring", "cone"][(enemy.sequence - 1) % 3];
      attack.length = 11;
      attack.width = 0.9;
      attack.innerRadius = 2;
      attack.halfAngle = 0.6;
      const cameras = state.environment["2:broadcast"]
        ? 0
        : 2 -
          Number(!!state.environment["2:cameraA"]) -
          Number(!!state.environment["2:cameraB"]);
      attack.damage *= 1 + cameras * 0.12;
      attack.recovery += cameras === 0 ? 0.8 : 0;
    } else {
      attack.shape = ["line", "ring", "cone"][(enemy.sequence - 1) % 3];
      attack.length = 10;
      attack.width = 0.85;
      attack.innerRadius = 1.8;
      attack.halfAngle = 0.6;
      if (state.environment["3:relay"]) attack.recovery += 0.6;
    }
  } else {
    attack = {
      name:
        enemy.role === "ranged"
          ? "Rajada de encaminhamentos"
          : enemy.role === "guard"
            ? "Carimbada de guarda"
            : "Ataque de expediente",
      radius: enemy.role === "ranged" ? 2 : 2.5,
      shape: enemy.role === "ranged" ? "line" : "cone",
      length: enemy.role === "ranged" ? 9 : 3.6,
      width: 0.75,
      halfAngle: 0.7,
      center: "boss",
      windup: enemy.role === "ranged" ? 1.4 : 1.1,
      damage: 14 + content.number * 2,
      recovery: enemy.role === "guard" ? 2.2 : 1.8,
    };
  }
  if (attack.shape === "line" || attack.shape === "cone")
    attack.center = "boss";
  if (state.stamp) attack.damage *= 0.94;
  if (state.history.some((h) => h.route === "negotiated"))
    attack.recovery += 0.2;
  attack.damage = Math.round(attack.damage);
  return attack;
}
export function attackHits(attack, origin, target, angle) {
  const distance = Math.hypot(target.x - origin.x, target.z - origin.z);
  if (attack.shape === "line") {
    const dx = target.x - origin.x,
      dz = target.z - origin.z,
      along = -Math.sin(angle) * dx - Math.cos(angle) * dz,
      across = Math.abs(Math.cos(angle) * dx - Math.sin(angle) * dz);
    return (
      along >= -0.4 &&
      along <= attack.length + 0.4 &&
      across < attack.width + 0.35
    );
  }
  if (attack.shape === "cone")
    return inMeleeArc(origin, target, angle, {
      range: attack.length || attack.radius,
      halfAngle: attack.halfAngle || 0.7,
    });
  if (attack.shape === "ring")
    return (
      distance < attack.radius + 0.25 &&
      distance > (attack.innerRadius || 1) - 0.2
    );
  return distance < attack.radius;
}
export function encounterSummary(enemy, state) {
  if (!enemy) return "";
  if (state.chapter === 1)
    return `${6 - (enemy.armsDisabled || 0)} braços ativos · ataque os braços na recuperação`;
  if (state.chapter === 2)
    return `${state.environment["2:broadcast"] ? 0 : 2 - Number(!!state.environment["2:cameraA"]) - Number(!!state.environment["2:cameraB"])} câmeras amplificando · desligue equipamentos`;
  return state.environment["3:relay"]
    ? "Relé interrompido · reforços bloqueados"
    : "Relé ativo · interrompa a corrente para bloquear reforços";
}
