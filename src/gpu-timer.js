export class GpuTimer {
  constructor(renderer) {
    this.gl = renderer.getContext?.();
    this.extension = this.gl?.getExtension("EXT_disjoint_timer_query_webgl2");
    this.pending = [];
    this.active = null;
    this.ms = null;
  }
  begin() {
    const gl = this.gl,
      ext = this.extension;
    if (!ext || this.active || this.pending.length >= 4) return;
    this.active = gl.createQuery();
    gl.beginQuery(ext.TIME_ELAPSED_EXT, this.active);
  }
  end() {
    if (!this.active) return;
    this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
    this.pending.push(this.active);
    this.active = null;
  }
  poll() {
    if (!this.extension) return null;
    const gl = this.gl,
      disjoint = gl.getParameter(this.extension.GPU_DISJOINT_EXT);
    while (
      this.pending.length &&
      gl.getQueryParameter(this.pending[0], gl.QUERY_RESULT_AVAILABLE)
    ) {
      const query = this.pending.shift(),
        ns = gl.getQueryParameter(query, gl.QUERY_RESULT);
      gl.deleteQuery(query);
      if (!disjoint) this.ms = ns / 1e6;
    }
    if (disjoint) this.ms = null;
    return this.ms;
  }
  dispose() {
    if (this.active) this.end();
    for (const q of this.pending) this.gl.deleteQuery(q);
    this.pending = [];
  }
}
