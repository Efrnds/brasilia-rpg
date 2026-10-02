import {
  initializeRpg,
  tunedSkill,
  validateRpg,
  RPG_SAVE_FIELDS,
  awardItem,
} from "./rpg.js";
import { DODGE } from "./combat.js";
import { checkpointPosition, levelFor } from "./levels.js";
import { chapterContent } from "./content.js";
export const SAVE_KEY = "brasilia-rpg-save-v2";
export const CHARACTERS = {
  luli: {
    name: "Luli",
    role: "Bardo Sindical",
    color: 0xa44436,
    hp: 110,
    damage: 15,
    description: "Ondas de discurso, cura e controle de multidão.",
    skills: [
      {
        name: "Companheiros!",
        hint: "Onda de impacto",
        cooldown: 5,
        cost: 16,
        damage: 22,
        range: 5.5,
        pol: -2,
      },
      {
        name: "Discurso Infinito",
        hint: "Dano e lentidão",
        cooldown: 9,
        cost: 22,
        damage: 16,
        range: 7,
        slow: 4,
        pol: 4,
      },
      {
        name: "Cafezinho",
        hint: "Cura • 3 cargas",
        cooldown: 12,
        cost: 0,
        heal: 32,
        pol: -6,
      },
      {
        name: "Nunca Antes…",
        hint: "Ultimate • 1 uso",
        cooldown: 0,
        cost: 30,
        damage: 65,
        range: 9,
        ultimate: true,
        pol: 12,
      },
    ],
  },
  folfonaro: {
    name: "Folfonaro",
    role: "Paladino do Zap",
    color: 0x3e6953,
    hp: 120,
    damage: 18,
    description: "Avanço frontal, proteção e golpes de alto impacto.",
    skills: [
      {
        name: "Tá OK?",
        hint: "Golpe de impacto",
        cooldown: 5,
        cost: 16,
        damage: 28,
        range: 4.5,
        pol: 3,
      },
      {
        name: "Motociata",
        hint: "Avanço e impacto",
        cooldown: 8,
        cost: 22,
        damage: 25,
        range: 6,
        dash: true,
        pol: 6,
      },
      {
        name: "Live de Quinta",
        hint: "Cura • 3 cargas",
        cooldown: 12,
        cost: 0,
        heal: 32,
        pol: 3,
      },
      {
        name: "E Daí?",
        hint: "Ultimate • 1 uso",
        cooldown: 0,
        cost: 30,
        damage: 72,
        range: 8,
        ultimate: true,
        pol: 14,
      },
    ],
  },
};
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function createGame(character = "luli") {
  if (!Object.hasOwn(CHARACTERS, character))
    throw new Error("Personagem desconhecido");
  const c = CHARACTERS[character];
  if (!c) throw new Error("Personagem desconhecido");
  return initializeRpg({
    version: 4,
    chapter: 1,
    history: [],
    upgrades: [],
    finalDecision: null,
    sideQuest: "available",
    character,
    hp: c.hp,
    maxHp: c.hp,
    stamina: 100,
    polarization: 20,
    level: 1,
    stage: "investigate",
    stamp: false,
    talked: false,
    permit: false,
    negotiated: false,
    upgrade: null,
    heals: 3,
    ultimateUsed: false,
    cooldowns: [0, 0, 0, 0],
    attackCooldown: 0,
    dodge: 0,
    dodgeCooldown: 0,
    invulnerable: 0,
    position: { ...levelFor(1).spawn },
    elapsed: 0,
  });
}
export function tickState(state, dt, defending = false) {
  if (!Number.isFinite(dt) || dt < 0) return;
  const step = Math.min(dt, 0.05);
  state.elapsed += step;
  state.cooldowns = state.cooldowns.map((n) => Math.max(0, n - step));
  for (const field of [
    "actionRecovery",
    "attackCooldown",
    "dodge",
    "dodgeCooldown",
    "invulnerable",
    "shield",
    "guardBreak",
    "guardResponse",
    "comboBuff",
    "supportCooldown",
  ])
    state[field] = Math.max(0, state[field] - step);
  if (!defending && state.dodge <= 0)
    state.stamina = clamp(
      state.stamina + step * (state.equipment.accessory === "gloves" ? 28 : 22),
      0,
      100,
    );
}
export function useSkill(state, index) {
  const skill = skillFor(state, index);
  if (!skill) return { ok: false, reason: "Habilidade desconhecida." };
  if (state.cooldowns[index] > 0)
    return { ok: false, reason: "Ainda está recarregando." };
  if (skill.ultimate && state.ultimateUsed)
    return { ok: false, reason: "Ultimate já usado neste encontro." };
  if (skill.heal && state.heals <= 0)
    return { ok: false, reason: "Suas cargas de cura acabaram." };
  if (state.stamina < skill.cost)
    return { ok: false, reason: "Sem fôlego. Espere um instante." };
  if (skill.heal && state.hp >= state.maxHp)
    return { ok: false, reason: "Sua vida já está cheia." };
  state.stamina -= skill.cost;
  state.cooldowns[index] = skill.cooldown;
  state.polarization = clamp(state.polarization + skill.pol, 0, 100);
  if (skill.ultimate) state.ultimateUsed = true;
  if (skill.shield) state.shield = skill.shield;
  if (skill.heal) {
    if (
      state.specialization === "support" ||
      state.equipment.accessory === "thermos"
    )
      state.shield = 4;
    if (state.specialization === "support" && state.character === "folfonaro")
      state.stamina = clamp(state.stamina + 25, 0, 100);
    state.hp = clamp(state.hp + skill.heal, 0, state.maxHp);
    state.heals--;
  }
  state.statistics[`skill${index}`] =
    (state.statistics[`skill${index}`] || 0) + 1;
  return { ok: true, skill };
}
export function dodge(state) {
  if (state.stamina < DODGE.cost || state.dodgeCooldown > 0) return false;
  state.statistics.dodges++;
  if (state.specialization === "power" && state.character === "folfonaro")
    state.comboBuff = 2;
  state.stamina -= DODGE.cost;
  state.dodge = DODGE.duration;
  state.dodgeCooldown = DODGE.cooldown;
  state.invulnerable = DODGE.protection;
  return true;
}
export function receiveDamage(
  state,
  amount,
  defending = false,
  difficulty = "normal",
) {
  if (state.invulnerable > 0 || state.hp <= 0) return 0;
  let damage = amount * (difficulty === "relaxed" ? 0.55 : 1);
  if (state.polarization >= 75) damage *= 1.15;
  const guardCost = state.equipment?.accessory === "badge" ? 8 : 12;
  if (state.shield > 0) damage *= 0.65;
  if (defending && state.stamina >= guardCost && state.guardBreak <= 0) {
    damage *= 0.25;
    state.stamina -= guardCost;
    state.guardResponse =
      state.character === "folfonaro" && state.specialization === "support"
        ? Math.min(5, Math.max(3, state.guardResponse + 2))
        : 3;
    state.statistics.blocks++;
    if (state.equipment.accessory === "seal")
      state.shield = Math.max(state.shield, 1.5);
  } else if (defending) {
    state.guardBreak = 1.4;
  }
  damage = Math.round(damage);
  state.statistics.received =
    (state.statistics.received || 0) + Math.min(state.hp, damage);
  state.hp = clamp(state.hp - damage, 0, state.maxHp);
  state.invulnerable = 0.65;
  return damage;
}
export function restoreEncounter(state) {
  state.hp = state.maxHp;
  state.stamina = 100;
  state.heals = state.sideQuest === "complete" ? 4 : 3;
  state.ultimateUsed = false;
  state.cooldowns = [0, 0, 0, 0];
  state.invulnerable = 0;
  state.dodge = 0;
  state.actionRecovery = 0;
  state.attackCooldown = 0;
  state.dodgeCooldown = 0;
  state.shield = 0;
  state.guardBreak = 0;
  state.guardResponse = 0;
  state.comboBuff = 0;
  state.supportCooldown = 0;
}
export function upgrade(state, choice) {
  if (state.upgrade || !["vitality", "power"].includes(choice)) return false;
  state.upgrade = choice;
  state.specialization = choice === "power" ? "power" : "support";
  state.upgrades.push(choice);
  state.level = state.upgrades.length + 1;
  if (choice === "vitality") state.maxHp += 25;
  restoreEncounter(state);
  return true;
}
const STAGES = ["investigate", "permit", "arena", "boss", "coffee", "complete"];
export function snapshot(state) {
  return {
    ...Object.fromEntries(
      RPG_SAVE_FIELDS.map((field) => [field, structuredClone(state[field])]),
    ),
    checkpoint: `${state.chapter}:${state.stage}`,
    version: 4,
    chapter: state.chapter,
    history: state.history.map((h) => ({ ...h })),
    upgrades: [...state.upgrades],
    finalDecision: state.finalDecision,
    sideQuest: state.sideQuest,
    character: state.character,
    stage: state.stage,
    polarization: state.polarization,
    stamp: state.stamp,
    talked: state.talked,
    permit: state.permit,
    negotiated: state.negotiated,
    upgrade: state.upgrade,
    elapsed: state.elapsed,
  };
}
export function parseSave(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("O arquivo de save está corrompido.");
  }
  if (data)
    data.character =
      { lula: "luli", bolsonaro: "folfonaro" }[data.character] ||
      data.character;
  if (data?.version === 2) {
    data = {
      ...data,
      version: 3,
      chapter: 1,
      history:
        data.stage === "complete"
          ? [
              {
                chapter: 1,
                route: data.negotiated ? "negotiated" : "combat",
                evidence: data.stamp,
                polarization: data.polarization,
              },
            ]
          : [],
      upgrades: data.upgrade ? [data.upgrade] : [],
      finalDecision: null,
    };
  }
  if (data?.version === 3) {
    data.version = 4;
    initializeRpg(data);
  }
  if (data?.version === 4) {
    validateRpg(data);
  }
  if (
    !data ||
    data.version !== 4 ||
    !Object.hasOwn(CHARACTERS, data.character) ||
    !STAGES.includes(data.stage)
  )
    throw new Error("Save incompatível com esta versão.");
  data.sideQuest ??= "available";
  if (
    !["available", "active", "retrieved", "complete"].includes(data.sideQuest)
  )
    throw new Error("Missão opcional inválida.");
  if (
    !Number.isFinite(data.polarization) ||
    data.polarization < 0 ||
    data.polarization > 100 ||
    !Number.isFinite(data.elapsed) ||
    data.elapsed < 0
  )
    throw new Error("Save com valores inválidos.");
  if (
    ["stamp", "talked", "permit", "negotiated"].some(
      (key) => typeof data[key] !== "boolean",
    ) ||
    ![null, "power", "vitality"].includes(data.upgrade)
  )
    throw new Error("Save incompleto.");
  const advanced = ["arena", "boss", "coffee", "complete"].includes(data.stage);
  if (
    (advanced && (!data.talked || !data.permit)) ||
    (data.negotiated && !data.stamp) ||
    (data.stage === "permit" && !data.talked)
  )
    throw new Error("Progresso do save inconsistente.");
  if (
    !Number.isInteger(data.chapter) ||
    data.chapter < 1 ||
    data.chapter > 3 ||
    !Array.isArray(data.history) ||
    data.history.length !==
      data.chapter - (data.stage === "complete" ? 0 : 1) ||
    !Array.isArray(data.upgrades) ||
    data.upgrades.length > data.chapter ||
    !data.upgrades.every((u) => ["power", "vitality"].includes(u)) ||
    ![null, "publish", "mediate"].includes(data.finalDecision)
  )
    throw new Error("Campanha do save inválida.");
  if (
    data.history.some(
      (h, i) =>
        !h ||
        h.chapter !== i + 1 ||
        !["combat", "negotiated"].includes(h.route) ||
        typeof h.evidence !== "boolean" ||
        !Number.isFinite(h.polarization) ||
        h.polarization < 0 ||
        h.polarization > 100,
    )
  )
    throw new Error("Histórico do save inválido.");
  if (
    (data.upgrade && data.upgrades.at(-1) !== data.upgrade) ||
    (data.finalDecision && (data.chapter !== 3 || data.stage !== "complete"))
  )
    throw new Error("Escolhas do save inconsistentes.");
  const state = createGame(data.character);
  for (const key of Object.keys(snapshot(state)))
    if (Object.hasOwn(data, key)) state[key] = data[key];
  state.level = data.upgrades.length + 1;
  state.maxHp =
    CHARACTERS[state.character].hp +
    data.upgrades.filter((u) => u === "vitality").length * 25;
  if (
    data.checkpoint !== undefined &&
    data.checkpoint !== `${data.chapter}:${data.stage}`
  )
    throw new Error("Checkpoint inconsistente.");
  state.position = { ...checkpointPosition(state) };
  restoreEncounter(state);
  return state;
}
export function objective(state) {
  return chapterContent(state).objective[state.stage];
}
export function reportTheft(state) {
  if (state.talked) return false;
  state.talked = true;
  state.stage = "permit";
  return true;
}
export function collectStamp(state) {
  if (state.stamp) return false;
  state.stamp = true;
  awardItem(state, ["folder", "microphone", "router"][state.chapter - 1]);
  state.polarization = clamp(state.polarization - 5, 0, 100);
  return true;
}
export function enterPalace(state, negotiate = false) {
  if (!state.talked || state.permit || (negotiate && !state.stamp))
    return false;
  state.permit = true;
  state.negotiated = negotiate;
  if (negotiate) awardItem(state, "seal");
  state.stage = negotiate ? "coffee" : "arena";
  state.polarization = clamp(
    state.polarization + (negotiate ? -10 : 8),
    0,
    100,
  );
  restoreEncounter(state);
  return true;
}
export function clearEncounter(state) {
  if (!["arena", "boss"].includes(state.stage)) return false;
  if (state.stage === "boss") awardItem(state, "gloves");
  state.stage = state.stage === "arena" ? "boss" : "coffee";
  restoreEncounter(state);
  return true;
}
export function recoverCoffee(state) {
  if (state.stage !== "coffee") return false;
  state.stage = "complete";
  state.history.push({
    chapter: state.chapter,
    route: state.negotiated ? "negotiated" : "combat",
    evidence: state.stamp,
    polarization: state.polarization,
    helped: state.sideQuest === "complete",
  });
  return true;
}
export function nextChapter(state) {
  if (state.stage !== "complete" || state.chapter >= 3) return false;
  state.chapter++;
  state.stage = "investigate";
  state.talked = false;
  state.stamp = false;
  state.permit = false;
  state.negotiated = false;
  state.upgrade = null;
  state.sideQuest = "available";
  state.position = { ...levelFor(state.chapter).spawn };
  restoreEncounter(state);
  return true;
}
export const damageMultiplier = (state) =>
  (1 + state.upgrades.filter((u) => u === "power").length * 0.25) *
  (state.polarization >= 75 ? 1.12 : 1);
export function advanceSideQuest(state) {
  const next = {
    available: "active",
    active: "retrieved",
    retrieved: "complete",
  }[state.sideQuest];
  if (!next) return false;
  state.sideQuest = next;
  if (next === "complete") {
    awardItem(state, ["thermos", "headphones", "badge"][state.chapter - 1]);
    state.support = ["nair", "lia", "celia"][state.chapter - 1];
    state.heals = Math.min(4, state.heals + 1);
    state.polarization = clamp(state.polarization - 3, 0, 100);
  }
  return true;
}

export function skillFor(state, index) {
  return tunedSkill(state, index, CHARACTERS);
}
