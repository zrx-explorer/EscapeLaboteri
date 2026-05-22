// src/core/Game.js —— 主游戏循环与全局状态
import { Input } from './Input.js';
import { EventBus } from './EventBus.js';
import { SceneManager } from './SceneManager.js';

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;

    this.input = new Input(canvas);
    this.bus = new EventBus();
    this.scenes = new SceneManager(this);

    // 全局元数据（可挂运行期对象）
    this.meta = {
      heroId: null,        // 玩家选择的英雄
      mode: 'solo',        // solo（单机）/ online（联机·预留）
      partySize: 5,        // 队伍人数（含玩家）：3/5/8
      spyCount: 1,         // 内奸数量：0/1/2（0 即纯 PvE）
      playerRole: 'hero',  // 玩家阵营：hero / spy / random
      difficulty: 'normal',// easy / normal / hard / nightmare
      autoFollow: true,    // AI 队友是否自动跟随
      run: 0,              // roguelike 第几局
      shards: 0,           // 圣杯碎片
      currentLevel: 1,
      // 运行期临时字段
      _spyAssigned: false,
      _spyId: null,
      _spyIds: null,       // 多内奸时使用
    };

    this._last = 0;
    this._fpsEl = document.getElementById('fps');
    this._frames = 0;
    this._fpsAcc = 0;
    this._raf = 0;
  }

  start() {
    const loop = (t) => {
      const now = t || performance.now();
      let dt = (now - this._last) / 1000;
      if (!this._last) dt = 0;
      if (dt > 0.05) dt = 0.05; // 卡顿钳制
      this._last = now;

      this.scenes.update(dt);
      this.scenes.render();

      this._frames++;
      this._fpsAcc += dt;
      if (this._fpsAcc >= 0.5) {
        if (this._fpsEl) this._fpsEl.textContent = `${Math.round(this._frames / this._fpsAcc)} FPS`;
        this._frames = 0; this._fpsAcc = 0;
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() { cancelAnimationFrame(this._raf); }
}
