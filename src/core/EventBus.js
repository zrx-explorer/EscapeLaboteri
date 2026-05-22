// src/core/EventBus.js —— 极简事件总线
export class EventBus {
  constructor() { this._h = new Map(); }
  on(event, fn)  { (this._h.get(event) || this._h.set(event, []).get(event)).push(fn); return () => this.off(event, fn); }
  off(event, fn) { const arr = this._h.get(event); if (!arr) return; const i = arr.indexOf(fn); if (i >= 0) arr.splice(i, 1); }
  emit(event, payload) { (this._h.get(event) || []).forEach(fn => { try { fn(payload); } catch(e){ console.error(e);} }); }
  clear() { this._h.clear(); }
}
