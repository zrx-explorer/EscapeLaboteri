// src/core/SceneManager.js —— 场景栈
export class SceneManager {
  constructor(game) { this.game = game; this._stack = []; }
  get current() { return this._stack[this._stack.length - 1]; }
  push(scene) { scene.enter && scene.enter(); this._stack.push(scene); }
  pop() { const s = this._stack.pop(); s && s.exit && s.exit(); return s; }
  replace(scene) { this.pop(); this.push(scene); }
  update(dt) { this.current && this.current.update(dt); this.game.input.endFrame(); }
  render()   { const c = this.game.ctx; c.clearRect(0,0,this.game.width,this.game.height); this.current && this.current.render(c); }
}

export class Scene {
  constructor(game) { this.game = game; }
  enter() {}
  exit() {}
  update(dt) {}
  render(ctx) {}
}
