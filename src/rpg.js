export const EQUIPMENT = {
  seal: {
    name: "Selo de acordo",
    slot: "accessory",
    description:
      "Bloqueio concede proteção por 1,5 s; recompensa de negociação.",
    effect: "guardShield",
  },
  gloves: {
    name: "Luvas de expediente",
    slot: "accessory",
    description: "Fôlego regenera a 28/s; recompensa de confronto.",
    effect: "staminaRegen",
  },
  thermos: {
    name: "Garrafa da Nair",
    slot: "accessory",
    description: "Cura também concede proteção por 4 s.",
    effect: "healingShield",
  },
  badge: {
    name: "Crachá de expediente",
    slot: "accessory",
    description: "Defesa custa 8 de fôlego em vez de 12.",
    effect: "guardCost",
  },
  headphones: {
    name: "Fone do técnico",
    slot: "accessory",
    description: "Interromper um ataque recupera 12 de fôlego.",
    effect: "interrupt",
  },
  folder: {
    name: "Pasta 37-B",
    slot: "instrument",
    description: "Golpe final do combo aplica lentidão por 2 s.",
    effect: "comboSlow",
  },
  microphone: {
    name: "Microfone sem cortes",
    slot: "instrument",
    description: "Habilidades alcançam 15% mais longe.",
    effect: "range",
  },
  router: {
    name: "Roteador recuperado",
    slot: "instrument",
    description: "Apoio tem 25% menos recarga.",
    effect: "support",
  },
};
export const SPECIALIZATIONS = {
  luli: {
    support: {
      name: "Mediador",
      description: "Curar protege; bloquear fortalece a próxima onda.",
    },
    power: {
      name: "Mestre de pauta",
      description: "Final do combo interrompe e amplia o alcance do discurso.",
    },
  },
  folfonaro: {
    support: {
      name: "Guarda do gabinete",
      description: "Bloqueios acumulam resposta; cura recupera também fôlego.",
    },
    power: {
      name: "Linha de frente",
      description:
        "Esquiva prepara um golpe forte; mais retorno em alta polarização.",
    },
  },
};
const EXTRA = {
  luli: [
    {
      name: "Questão de ordem",
      hint: "Interrompe em cone",
      cooldown: 7,
      cost: 18,
      damage: 20,
      range: 6,
      pol: -3,
      shape: "cone",
      interrupt: true,
    },
    {
      name: "Mesa de conciliação",
      hint: "Proteção por 6 s",
      cooldown: 15,
      cost: 24,
      shield: 6,
      range: 3,
      pol: -5,
    },
  ],
  folfonaro: [
    {
      name: "Contraponto",
      hint: "Estocada e quebra de guarda",
      cooldown: 7,
      cost: 18,
      damage: 35,
      range: 4,
      pol: 2,
      shape: "line",
      interrupt: true,
    },
    {
      name: "Pasta blindada",
      hint: "Proteção por 6 s",
      cooldown: 15,
      cost: 24,
      shield: 6,
      range: 3,
      pol: 3,
    },
  ],
};
export function initializeRpg(state) {
  state.systemsVersion = 1;
  state.loadout ??= [0, 1, 2, 3];
  state.equipment ??= { accessory: null, instrument: null };
  state.owned ??= [];
  state.specialization ??= null;
  state.flags ??= {};
  state.proofs ??= [];
  state.dialogueHistory ??= [];
  state.tutorial ??= { done: [], skipped: false };
  state.support ??= null;
  state.supportCooldown ??= 0;
  state.actionRecovery ??= 0;
  state.shield ??= 0;
  state.guardBreak ??= 0;
  state.guardResponse ??= 0;
  state.comboBuff ??= 0;
  state.environment ??= {};
  state.negotiation ??= {};
  state.secretFound ??= [];
  state.statistics ??= {
    attacks: 0,
    hits: 0,
    blocks: 0,
    dodges: 0,
    damage: 0,
    defeats: 0,
  };
  return state;
}
export function skillCatalog(character, characters) {
  return [
    ...characters[character].skills.map((s, i) => ({
      ...s,
      shape:
        i === 0
          ? character === "luli"
            ? "cone"
            : "melee"
          : i === 1
            ? character === "luli"
              ? "field"
              : "dash"
            : i === 2
              ? "heal"
              : "wave",
      cast: i === 2 ? 0.45 : 0.3,
    })),
    ...EXTRA[character].map((s) => ({ ...s, cast: 0.35 })),
  ];
}
export function tunedSkill(state, index, characters) {
  const skill = skillCatalog(state.character, characters)[
    state.loadout?.[index] ?? index
  ];
  if (!skill) return null;
  const result = { ...skill };
  if (state.equipment?.instrument === "microphone" && result.range)
    result.range *= 1.15;
  if (
    state.specialization === "power" &&
    state.character === "luli" &&
    result.range
  )
    result.range *= 1.12;
  if (result.damage && state.polarization >= 75)
    result.damage = Math.round(result.damage * 1.15);
  return result;
}
export function equipSkill(state, slot, index) {
  if (
    !Number.isInteger(slot) ||
    slot < 0 ||
    slot > 3 ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > 5 ||
    state.loadout.some((n, i) => i !== slot && n === index)
  )
    return false;
  state.loadout[slot] = index;
  state.cooldowns[slot] = 0;
  return true;
}
export function equipItem(state, id) {
  if (!state.owned.includes(id) || !Object.hasOwn(EQUIPMENT, id)) return false;
  state.equipment[EQUIPMENT[id].slot] = id;
  return true;
}
export function awardItem(state, id) {
  if (!Object.hasOwn(EQUIPMENT, id) || state.owned.includes(id)) return false;
  state.owned.push(id);
  if (!state.equipment[EQUIPMENT[id].slot]) equipItem(state, id);
  return true;
}
export function validateRpg(data) {
  if (data.systemsVersion !== undefined && data.systemsVersion !== 1)
    throw new Error("Sistemas do save incompatíveis.");
  if (
    !Array.isArray(data.loadout) ||
    data.loadout.length !== 4 ||
    new Set(data.loadout).size !== 4 ||
    data.loadout.some((n) => !Number.isInteger(n) || n < 0 || n > 5)
  )
    throw new Error("Habilidades equipadas inválidas.");
  if (
    !Array.isArray(data.owned) ||
    new Set(data.owned).size !== data.owned.length ||
    data.owned.some((id) => !Object.hasOwn(EQUIPMENT, id))
  )
    throw new Error("Equipamento inválido.");
  for (const slot of ["accessory", "instrument"])
    if (
      data.equipment?.[slot] !== null &&
      (!data.owned.includes(data.equipment?.[slot]) ||
        EQUIPMENT[data.equipment[slot]].slot !== slot)
    )
      throw new Error("Equipamento não pertence à pasta.");
  if (
    ![null, "power", "support"].includes(data.specialization) ||
    ![null, "nair", "lia", "celia"].includes(data.support)
  )
    throw new Error("Especialização ou apoio inválidos.");
  for (const field of ["flags", "environment", "negotiation", "statistics"])
    if (
      !data[field] ||
      typeof data[field] !== "object" ||
      Array.isArray(data[field]) ||
      JSON.stringify(data[field]).length > 12000
    )
      throw new Error("Dados de campanha inválidos.");
  for (const field of ["proofs", "dialogueHistory", "secretFound"])
    if (
      !Array.isArray(data[field]) ||
      data[field].length > 100 ||
      data[field].some((x) => typeof x !== "string" || x.length > 3000)
    )
      throw new Error("Histórico de investigação inválido.");
  if (
    !data.tutorial ||
    !Array.isArray(data.tutorial.done) ||
    data.tutorial.done.length > 20 ||
    data.tutorial.done.some(
      (n) =>
        ![
          "move",
          "camera",
          "attack",
          "dodge",
          "guard",
          "evidence",
          "negotiation",
        ].includes(n),
    ) ||
    typeof data.tutorial.skipped !== "boolean"
  )
    throw new Error("Tutorial inválido.");
  for (const [key, value] of Object.entries(data.statistics))
    if (!Number.isFinite(value) || value < 0 || value > 1e8)
      throw new Error("Estatísticas inválidas.");
  for (const key of [
    "attacks",
    "hits",
    "blocks",
    "dodges",
    "damage",
    "defeats",
  ])
    if (!Number.isFinite(data.statistics[key]))
      throw new Error("Estatísticas incompletas.");
  for (const [key, value] of Object.entries(data.environment))
    if (
      !/^[123]:(commission|secret|broadcast|cameraA|cameraB|relay|bridge)$/.test(
        key,
      ) ||
      typeof value !== "boolean"
    )
      throw new Error("Interação ambiental inválida.");
  for (const [key, value] of Object.entries(data.negotiation))
    if (
      !/^(side:[123]|case:[123]|edit|network|origin|extra:[a-z]+:[a-z]+)$/.test(
        key,
      ) ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 10
    )
      throw new Error("Progresso de investigação inválido.");
  for (const [key, value] of Object.entries(data.flags))
    if (
      key === "__proto__" ||
      key === "constructor" ||
      !(
        typeof value === "boolean" ||
        (Number.isInteger(value) && value >= 0 && value < 1e6)
      )
    )
      throw new Error("Decisão inválida.");
  return true;
}
export const RPG_SAVE_FIELDS = [
  "systemsVersion",
  "loadout",
  "equipment",
  "owned",
  "specialization",
  "flags",
  "proofs",
  "dialogueHistory",
  "tutorial",
  "support",
  "environment",
  "negotiation",
  "secretFound",
  "statistics",
];
export function useSupport(state) {
  if (!state.support || state.supportCooldown > 0) return false;
  state.supportCooldown = state.equipment.instrument === "router" ? 18 : 24;
  if (state.support === "nair") {
    state.hp = Math.min(state.maxHp, state.hp + 20);
    state.shield = 3;
  }
  if (state.support === "lia") state.guardResponse = 5;
  if (state.support === "celia")
    state.stamina = Math.min(100, state.stamina + 35);
  return state.support;
}
