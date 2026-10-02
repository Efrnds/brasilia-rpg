import { CHAPTERS } from "./content.js";
import { LEVELS, floorAt } from "./levels.js";
import { EXTRA_CASES } from "./expansion.js";
import { ENVIRONMENT_OBJECTS } from "./environment.js";
import { CATALOG } from "../assets/pack/props.js";
import { ARCHITECTURE } from "../assets/pack/architecture.js";
export function validateContent() {
  const errors = [],
    ids = new Set(),
    full = { permit: true, stamp: true, stage: "coffee" };
  const fail = (condition, message) => {
    if (!condition) errors.push(message);
  };
  for (const content of CHAPTERS) {
    const level = LEVELS[content.number - 1];
    fail(
      level?.chapter === content.number,
      `Capítulo ${content.number}: mapa ausente`,
    );
    fail(!ids.has(content.number), "Capítulo duplicado");
    ids.add(content.number);
    fail(content.bossHp > 0 && content.mobHp > 0, "Vida inválida");
    for (const key of [
      "spawn",
      "witness",
      "helper",
      "gatekeeper",
      "evidence",
      "sideItem",
      "collection",
      "boss",
      ...Object.keys(level.checkpoints || {}),
    ]) {
      const point = level.checkpoints[key] || level[key];
      fail(
        point && floorAt(level, point.x, point.z, full) !== null,
        `${content.number}:${key}: fora do piso`,
      );
    }
    const surfaces = new Set();
    for (const surface of level.surfaces) {
      fail(!surfaces.has(surface.id), `${content.number}: piso duplicado`);
      surfaces.add(surface.id);
      fail(
        Number.isFinite(surface.y) &&
          ((surface.type === "circle" && surface.radius > 0) ||
            (surface.w > 0 && surface.d > 0)),
        "Superfície inválida",
      );
    }
    for (const object of ENVIRONMENT_OBJECTS[content.number])
      fail(
        floorAt(level, object.point.x, object.point.z, full) !== null,
        `${content.number}:${object.id}: interação fora do piso`,
      );
    for (const attack of content.attacks)
      fail(
        attack.windup >= 0.4 &&
          attack.recovery > 0 &&
          attack.damage > 0 &&
          attack.radius > 0,
        `Ataque inválido ${attack.name}`,
      );
  }
  for (const [id, extra] of Object.entries(EXTRA_CASES)) {
    const ids = new Set(extra.points.map((p) => p.id));
    fail(ids.size === extra.points.length, `${id}: IDs duplicados`);
    const unlocked = new Set();
    for (const point of extra.points) {
      fail(
        point.requires.every((r) => ids.has(r) && unlocked.has(r)),
        `${id}:${point.id}: dependência inválida ou ciclo`,
      );
      fail(
        floorAt(extra, point.x, point.z, full) !== null,
        `${id}:${point.id}: fora do piso`,
      );
      unlocked.add(point.id);
    }
  }
  for (const item of Object.values(CATALOG))
    fail(
      item.footprint.every((n) => n > 0),
      "Dimensão de prop inválida",
    );
  for (const item of Object.values(ARCHITECTURE))
    fail(
      item.size.every((n) => n > 0),
      "Dimensão arquitetônica inválida",
    );
  return errors;
}
