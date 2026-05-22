// src/entities/Enemy.js —— 敌人
import { Entity } from './Entity.js';
import { ENEMY_DATA } from '../data/enemies.js';
import { dist } from '../utils/Math2D.js';

export class Enemy extends Entity {
  constructor(typeId, x, y) {
    super(x, y);
    const cfg = ENEMY_DATA[typeId];
    this.typeId = typeId;
    this.team = 'enemy';
    this.name = cfg.name;
    this.color = cfg.color;
    this.maxHp = cfg.hp; this.hp = cfg.hp;
    this.atk = cfg.atk; this.def = cfg.def;
    this.atkSpd = cfg.atkSpd; this.range = cfg.range; this.moveSpd = cfg.moveSpd;
    this.expReward = cfg.exp;
    this.goldReward = cfg.gold;
    this.boss = !!cfg.boss;
    this.aoeOnHit = cfg.aoeOnHit || null;
    this.r = this.boss ? 28 : 12;
  }

  pickTarget(world) {
    // 仇恨值最高优先（嘲讽）
    let best = null, bestScore = -Infinity;
    for (const h of world.heroes) {
      if (h.dead) continue;
      const d = dist(this.x, this.y, h.x, h.y);
      const score = (5 - h.tauntLevel) * 100 + 1000 / Math.max(d, 1);
      if (score > bestScore) { bestScore = score; best = h; }
    }
    return best;
  }

  update(dt, world) {
    super.update(dt, world);
    if (this.dead) return;
    const tgt = this.pickTarget(world);
    if (!tgt) return;
    const d = dist(this.x, this.y, tgt.x, tgt.y);
    if (d > this.range) {
      this.moveTowards(tgt.x, tgt.y, dt);
    } else if (this.atkCd <= 0) {
      this.atkCd = 1 / this.currentAtkSpd;
      tgt.takeDamage(this.atkValue, 'physical', this);
      if (this.aoeOnHit) {
        for (const h of world.heroes) {
          if (h.dead || h === tgt) continue;
          if (dist(this.x, this.y, h.x, h.y) <= this.aoeOnHit.radius) {
            h.takeDamage(this.aoeOnHit.dmg, 'magic', this);
          }
        }
      }
    }
  }

  onDeath(killer) {
    if (this.world) this.world.onEnemyKilled(this, killer);
  }
}
