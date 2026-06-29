// src/entities/Entity.js —— 实体基类
import { dist, angle, clamp } from '../utils/Math2D.js';

let _id = 0;

export class Entity {
  constructor(x, y) {
    this.id = ++_id;
    this.x = x; this.y = y;
    this.r = 14;
    this.vx = 0; this.vy = 0;
    this.dead = false;
    this.team = 'neutral';      // 'hero' | 'enemy'
    // 战斗属性
    this.maxHp = 100; this.hp = 100; this.hpRegen = 0;
    this.maxMp = 0;   this.mp = 0;   this.mpRegen = 0;
    this.atk = 0; this.atkBonus = 0; this.def = 0; this.magicResist = 0;
    this.atkSpd = 1.0; this.range = 30;
    this.atkSpdMul = 1.0; this.moveSpd = 90; this.moveSpdMul = 1.0;
    this.atkCd = 0;
    this.tauntLevel = 3;
    // 状态
    this.buffs = [];
    this.silenced = false;
    this.unhealable = false;
    this.cursed = false;          // 移动 1m 受伤
    this._lastX = x; this._lastY = y; this._curseAcc = 0;
    this.fireArrow = false;
    this.markActive = false;
    this.lifeSteal = 0;
    this.critRate = 0; this.critDmg = 1.5;
    // 渲染
    this.color = '#888';
    this.name = '';
    this.facing = 0;
  }

  get atkValue() { return this.atk + this.atkBonus; }
  get currentMoveSpd() { return this.moveSpd * this.moveSpdMul * (this.terrainMoveMul || 1); }
  get currentAtkSpd() { return this.atkSpd * this.atkSpdMul; }

  addBuff(b) {
    b.t = 0; b.dur = b.dur || 0;
    this.buffs.push(b);
  }
  clearDebuffs() {
    // 简化处理：保留正面 buff，移除负面
    this.silenced = false; this.cursed = false; this.unhealable = false;
  }

  update(dt, world) {
    if (this.dead) return;
    // 自然回复
    this.hp = clamp(this.hp + this.hpRegen * dt, 0, this.maxHp);
    this.mp = clamp(this.mp + this.mpRegen * dt, 0, this.maxMp);
    if (this.atkCd > 0) this.atkCd -= dt;
    // buffs
    for (let i = this.buffs.length - 1; i >= 0; i--) {
      const b = this.buffs[i];
      b.t += dt;
      if (b.onTick) b.onTick(dt);
      if (b.t >= b.dur) {
        if (b.onEnd) b.onEnd();
        this.buffs.splice(i, 1);
      }
    }
    // 诅咒：移动 1m 触发伤害
    if (this.cursed) {
      const moved = dist(this.x, this.y, this._lastX, this._lastY);
      this._curseAcc += moved;
      if (this._curseAcc >= 20) { // 20px ~= 1m
        this.takeDamage(70, 'magic', null);
        this._curseAcc = 0;
      }
    }
    this._lastX = this.x; this._lastY = this.y;
  }

  takeDamage(rawDmg, type, attacker) {
    if (this.dead) return 0;
    let dmg = 0;
    if (type === 'physical') {
      dmg = rawDmg * (1 - this.def / (25 + this.def));
    } else if (type === 'magic') {
      dmg = rawDmg * (1 - (this.magicResist || 0));
    } else dmg = rawDmg;
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    if (this.world) this.world.spawnDamageText(this.x, this.y - this.r, dmg, type === 'magic' ? '#bb88ff' : '#ff8866');
    if (attacker && attacker.lifeSteal) {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + dmg * attacker.lifeSteal);
    }
    if (this.hp <= 0) {
      this.hp = 0; this.dead = true;
      if (this.onDeath) this.onDeath(attacker);
    }
    return dmg;
  }

  moveTowards(tx, ty, dt) {
    const a = angle(this.x, this.y, tx, ty);
    this.facing = a;
    const nx = this.x + Math.cos(a) * this.currentMoveSpd * dt;
    const ny = this.y + Math.sin(a) * this.currentMoveSpd * dt;
    if (this.world && this.world.moveEntity) this.world.moveEntity(this, nx, ny);
    else { this.x = nx; this.y = ny; }
  }

  render(ctx) {
    if (this.dead) return;
    // 主体
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
    // 朝向小线
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + Math.cos(this.facing) * (this.r + 4), this.y + Math.sin(this.facing) * (this.r + 4));
    ctx.stroke();
    // HP 条
    const w = 32, h = 4;
    const hx = this.x - w / 2, hy = this.y - this.r - 10;
    ctx.fillStyle = '#222'; ctx.fillRect(hx, hy, w, h);
    ctx.fillStyle = this.team === 'hero' ? '#5dde7b' : '#dc4242';
    ctx.fillRect(hx, hy, w * (this.hp / this.maxHp), h);
    ctx.strokeStyle = '#000'; ctx.strokeRect(hx, hy, w, h);
    // 名字
    if (this.name) {
      ctx.fillStyle = this.team === 'hero' ? '#aef' : '#fcb';
      ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.name, this.x, this.y - this.r - 14);
    }
  }
}
