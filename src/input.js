export const DEFAULT_BINDINGS = {
  forward: "KeyW",
  backward: "KeyS",
  left: "KeyA",
  right: "KeyD",
  attack: "KeyF",
  guard: "KeyQ",
  dodge: "Space",
  interact: "KeyE",
  journal: "KeyJ",
  sprint: "ShiftLeft",
  lock: "KeyR",
  cycle: "KeyT",
  support: "KeyC",
};
export const INPUT_LABELS = {
  forward: "Avançar",
  backward: "Recuar",
  left: "Esquerda",
  right: "Direita",
  attack: "Ataque",
  guard: "Defesa",
  dodge: "Esquiva",
  interact: "Interação",
  journal: "Diário",
  sprint: "Correr",
  lock: "Fixar alvo",
  cycle: "Trocar alvo",
  support: "Apoio",
};
export function keyLabel(code) {
  return code
    .replace("Key", "")
    .replace("Digit", "")
    .replace("ShiftLeft", "Shift")
    .replace("Space", "Espaço")
    .replace("Arrow", "Seta ");
}
export class InputBindings {
  constructor(saved = {}) {
    this.bindings = { ...DEFAULT_BINDINGS };
    const candidate = { ...this.bindings };
    for (const [action, code] of Object.entries(saved))
      if (
        Object.hasOwn(DEFAULT_BINDINGS, action) &&
        typeof code === "string" &&
        /^(Key[A-Z]|Digit[056789]|Space|ShiftLeft|ShiftRight|ControlLeft|AltLeft)$/.test(
          code,
        )
      )
        candidate[action] = code;
    if (
      new Set(Object.values(candidate)).size === Object.keys(candidate).length
    )
      this.bindings = candidate;
  }
  rebind(action, code) {
    if (
      !Object.hasOwn(DEFAULT_BINDINGS, action) ||
      !/^(Key[A-Z]|Digit[0-9]|Space|ShiftLeft|ShiftRight|ControlLeft|AltLeft)$/.test(
        code,
      )
    )
      return { ok: false, reason: "Use letra, número, espaço ou modificador." };
    if (/^Digit[1-4]$/.test(code))
      return {
        ok: false,
        reason: "As teclas 1 a 4 são reservadas às habilidades.",
      };
    const conflict = Object.entries(this.bindings).find(
      ([other, value]) => other !== action && value === code,
    );
    if (conflict)
      return { ok: false, reason: `Já usado: ${INPUT_LABELS[conflict[0]]}.` };
    this.bindings[action] = code;
    return { ok: true };
  }
  code(action) {
    return this.bindings[action];
  }
  canonical(code) {
    for (const [action, mapped] of Object.entries(this.bindings))
      if (mapped === code) return DEFAULT_BINDINGS[action];
    return code.startsWith("Arrow") || code.startsWith("Digit") ? code : null;
  }
  reset() {
    this.bindings = { ...DEFAULT_BINDINGS };
  }
}
