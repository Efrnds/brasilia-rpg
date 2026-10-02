import { GpuTimer } from "./gpu-timer.js";
export class FrameDiagnostics {
  constructor(enabled = false) {
    this.enabled = enabled;
    this.frames = [];
    this.report = {};
    if (!enabled) return;
    this.createPanel();
  }
  createPanel() {
    this.panel = document.createElement("pre");
    this.panel.className = "frame-diagnostics";
    this.panel.setAttribute("aria-hidden", "true");
    document.body.append(this.panel);
  }
  update(dt, cpuMs, renderer, simulation) {
    if (!this.enabled || dt <= 0) return;
    this.frames.push({ ms: dt * 1000, cpuMs });
    if (this.frames.length > 180) this.frames.shift();
    const times = this.frames.map((f) => f.ms).sort((a, b) => a - b),
      mean = times.reduce((a, b) => a + b, 0) / times.length,
      info = renderer.info;
    this.report = {
      version: "0.6.0",
      samples: times.length,
      fps: 1000 / mean,
      frameP95: times[Math.floor((times.length - 1) * 0.95)],
      cpuMs: this.frames.reduce((a, f) => a + f.cpuMs, 0) / times.length,
      drawCalls: info?.render?.calls ?? null,
      triangles: info?.render?.triangles ?? null,
      geometries: info?.memory?.geometries ?? null,
      textures: info?.memory?.textures ?? null,
      droppedSeconds: simulation.dropped,
      gpuMs: this.timer?.poll() ?? null,
    };
    const r = this.report;
    this.panel.textContent = `F3 · DIAGNÓSTICO LOCAL\n${r.fps.toFixed(1)} fps · p95 ${r.frameP95.toFixed(1)} ms\nCPU deste frame: ${r.cpuMs.toFixed(1)} ms (média)\nDraw calls: ${r.drawCalls ?? "n/d"} · triângulos: ${r.triangles ?? "n/d"}\nGeometrias: ${r.geometries ?? "n/d"} · texturas: ${r.textures ?? "n/d"}\nAtraso descartado: ${r.droppedSeconds.toFixed(2)} s\nGPU: ${r.gpuMs === null ? "indisponível" : r.gpuMs.toFixed(2) + " ms"}`;
  }
  begin(renderer) {
    if (!this.enabled) return;
    this.timer ??= new GpuTimer(renderer);
    this.timer.begin();
  }
  end() {
    this.timer?.end();
  }
  toggle() {
    if (!this.panel) {
      this.enabled = true;
      this.createPanel();
      return;
    }
    if (this.panel) this.panel.classList.toggle("hidden");
  }
}
