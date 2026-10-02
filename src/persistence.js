import { SAVE_KEY, parseSave, snapshot } from "./domain.js";
export const SLOT_KEYS = [
  SAVE_KEY,
  "brasilia-rpg-slot-2",
  "brasilia-rpg-slot-3",
];
export class SaveRepository {
  constructor(storage) {
    this.storage = storage;
    this.slot = 0;
  }
  select(index) {
    if (!Number.isInteger(index) || index < 0 || index > 2)
      throw new Error("Slot inválido.");
    this.slot = index;
  }
  read() {
    return this.storage.getItem(SLOT_KEYS[this.slot]);
  }
  write(state) {
    const raw = JSON.stringify(snapshot(state));
    parseSave(raw);
    this.storage.setItem(SLOT_KEYS[this.slot], raw);
    return raw;
  }
  import(raw) {
    const validated = parseSave(raw);
    return this.write(validated);
  }
  summary(index) {
    let raw;
    try {
      raw = this.storage.getItem(SLOT_KEYS[index]);
    } catch {
      return "Armazenamento indisponível";
    }
    if (!raw) return "Vazio";
    try {
      const s = parseSave(raw);
      return `${s.character === "luli" ? "Luli" : "Folfonaro"} · capítulo ${s.chapter} · ${s.stage}`;
    } catch {
      return "Arquivo inválido; exporte antes de substituir";
    }
  }
}
