// src/systems/SpawnSystem.js —— 关卡刷怪 / 毒圈
import { Enemy } from '../entities/Enemy.js';
import { rand } from '../utils/Math2D.js';

export class SpawnSystem {
  constructor(world, levelCfg) {
    this.world = world;
    this.cfg = levelCfg;
    this.t = 0;
    this.waveIdx = 0;
    this.bossSpawned = false;
    this.poisonStarted = false;
    this.poisonRadius = 600;

    // 难度倍率
    const meta = world.game.meta;
    this.diff = meta.diffMul || { enemy: 1, poison: 1 };
    // 队伍人数越多，混難数量轻微提高（0.85 + 0.05*N）
    const partySize = meta.partySize || 5;
    this.spawnCountMul = 0.85 + 0.05 * partySize; // 3人=1.0, 5人=1.10, 8人=1.25
  }

  update(dt) {
    this.t += dt;
    // 触发波次
    while (this.waveIdx < this.cfg.waves.length && this.t >= this.cfg.waves[this.waveIdx].delay) {
      const w = this.cfg.waves[this.waveIdx++];
      this._spawnWave(w);
    }
    // Boss
    if (!this.bossSpawned && this.t >= this.cfg.bossDelay) {
      this.bossSpawned = true;
      const b = new Enemy(this.cfg.boss, this.world.cx + 200, this.world.cy);
      this._applyDiff(b, true);
      this.world.addEnemy(b);
    }
    // 毒圈：到达预期时间后启动并缩圈
    if (this.t > this.cfg.duration && !this.poisonStarted) this.poisonStarted = true;
    if (this.poisonStarted) {
      const shrinkRate = 20 * (this.diff.poison || 1);
      this.poisonRadius = Math.max(120, this.poisonRadius - shrinkRate * dt);
      // 圈外伤害
      for (const h of this.world.heroes) {
        if (h.dead) continue;
        const dx = h.x - this.world.cx, dy = h.y - this.world.cy;
        if (Math.hypot(dx, dy) > this.poisonRadius) {
          const beforeDead = h.dead;
          h.hp = Math.max(0, h.hp - h.maxHp * 0.07 * dt);
          if (h.hp === 0 && !beforeDead) { h.dead = true; h.onDeath?.(null); }
        }
      }
    }
  }

  _spawnWave(wave) {
    for (const [type, count] of wave.spawn) {
      const realCount = Math.max(1, Math.round(count * this.spawnCountMul));
      for (let i = 0; i < realCount; i++) {
        const pos = this.world.findSpawnPoint
          ? this.world.findSpawnPoint(this.world.cx, this.world.cy, 220, 340)
          : (() => {
              const ang = rand(0, Math.PI * 2);
              const r = rand(220, 340);
              return {
                x: this.world.cx + Math.cos(ang) * r,
                y: this.world.cy + Math.sin(ang) * r,
              };
            })();
        const x = pos.x;
        const y = pos.y;
        const e = new Enemy(type, x, y);
        this._applyDiff(e, false);
        this.world.addEnemy(e);
      }
    }
  }

  // 应用难度倍率到敌人（生成后）
  _applyDiff(e, isBoss) {
    const m = this.diff.enemy || 1;
    if (m === 1) return;
    e.maxHp = Math.round(e.maxHp * m);
    e.hp = e.maxHp;
    e.atk = Math.round(e.atk * m);
    if (isBoss && e.aoeOnHit) e.aoeOnHit.dmg = Math.round(e.aoeOnHit.dmg * m);
  }

  isLevelClear() {
    if (!this.bossSpawned) return false;
    if (this.waveIdx < this.cfg.waves.length) return false;
    return this.world.enemies.every(e => e.dead);
  }
}
