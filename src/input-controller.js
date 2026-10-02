import { DEFAULT_BINDINGS } from "./input.js";
export class InputRouter {
  constructor(bindings) {
    this.bindings = bindings;
    this.listeners = [];
  }
  normalize(native, playing) {
    return {
      code: playing
        ? this.bindings.canonical(native.code) ||
          (Object.values(DEFAULT_BINDINGS).includes(native.code)
            ? "Unbound"
            : native.code)
        : native.code,
      repeat: native.repeat,
      target: native.target,
      shiftKey: native.shiftKey,
      preventDefault: () => native.preventDefault(),
    };
  }
  listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push(() =>
      target.removeEventListener(type, handler, options),
    );
  }
  dispose() {
    for (const remove of this.listeners) remove();
    this.listeners = [];
  }
}
