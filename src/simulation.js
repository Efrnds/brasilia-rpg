export const FIXED_STEP = 1 / 60;
export class FixedSimulation {
  constructor({ step = FIXED_STEP, maxFrame = 0.15, maxSteps = 9 } = {}) {
    this.step = step;
    this.maxFrame = maxFrame;
    this.maxSteps = maxSteps;
    this.accumulator = 0;
    this.elapsed = 0;
    this.dropped = 0;
  }
  reset() {
    this.accumulator = 0;
  }
  advance(dt, update) {
    if (!Number.isFinite(dt) || dt <= 0) return 0;
    this.dropped += Math.max(0, dt - this.maxFrame);
    this.accumulator += Math.min(dt, this.maxFrame);
    let count = 0;
    while (this.accumulator + 1e-10 >= this.step && count < this.maxSteps) {
      this.accumulator -= this.step;
      this.elapsed += this.step;
      count++;
      if (update(this.step) === false) {
        this.reset();
        break;
      }
    }
    if (this.accumulator >= this.step) {
      this.dropped += this.accumulator;
      this.reset();
    }
    return count;
  }
}
