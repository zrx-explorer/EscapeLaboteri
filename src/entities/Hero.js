// src/entities/Hero.js —— 英雄
import { Entity } from './Entity.js';
import { HERO_DATA, LEVEL_EXP, LEVEL_CAP } from '../data/heroes.js';
import { SKILL_DATA } from '../data/skills.js';
import { angle, dist } from '../utils/Math2D.js';

export class Hero extends Entity {
  constructor(heroId, x, y) {
    super(x, y);
    const cfg = HERO_DATA[heroId];
    this.heroId = heroId;
    this.team = 'hero';
    this.name = cfg.name;
    this.color = cfg.color;
    this.maxHp = cfg.hp; this.hp = cfg.hp; this.hpRegen = cfg.hpRegen;
    this.maxMp = cfg.mp; this.mp = cfg.mp; this.mpRegen = cfg.mpRegen;
    this.atk = cfg.atk; this.def = cfg.def;
    this.atkSpd = cfg.atkSpd; this.range = cfg.range; this.moveSpd = cfg.moveSpd;
    this.r = 14;

    this.skills = cfg.skills.map(id => ({ id, cd: 0 }));
    this.ult = { id: cfg.ult, cd: 0, unlocked: false };
    this.ultRef = SKILL_DATA[cfg.ult];

    this.exp = 0; this.level = 1;
    this.gold = 0; this.crystals = 0;
    this.inventory = []; // [itemId, ...] 最多 3 格

    // 身份
    this.role = 'hero';     // 'hero' | 'spy'
    this.spyRevealed = false;
    this.isPlayer = false;
    this.allyDamage = false; // 队友伤害开关
    this.toggleCd = 0;
  }

  gainExp(amt) {
    if (this.dead) return;
    this.exp += amt;
    while (this.level < LEVEL_CAP && this.exp >= LEVEL_EXP[this.level]) {
      this.exp -= LEVEL_EXP[this.level];
      this.level++;
      if (this.level === 3 || this.level === 5) {
        // 数值提升（简化：+15%）
        this.maxHp = Math.round(this.maxHp * 1.15);
        this.atk = Math.round(this.atk * 1.10);
      }
      if (this.level === 4) this.ult.unlocked = true;
      this.hp = this.maxHp; this.mp = this.maxMp;
    }
  }

  toggleAllyDamage() {
    if (this.toggleCd > 0) return;
    this.allyDamage = !this.allyDamage;
    this.toggleCd = 5;
  }

  revealSpy() {
    if (this.role !== 'spy' || this.spyRevealed) return;
    this.spyRevealed = true;
    this.atkBonus += Math.round(this.atk * 0.15);
    this.moveSpdMul *= 1.10;
    this.color = '#c34141';
  }

  // 普通攻击：投射或近战
  basicAttack(world, dirX, dirY) {
    if (this.atkCd > 0 || this.dead || this.silenced) return;
    this.atkCd = 1 / this.currentAtkSpd;
    const a = Math.atan2(dirY - this.y, dirX - this.x);
    this.facing = a;
    if (this.range > 60) {
      // 远程：发射弹道
      world.spawnProjectile(this, a, this.range, this.atkValue, 'physical', { fire: this.fireArrow });
    } else {
      // 近战：扇形 / 圆形范围伤害
      world.applyMeleeAttack(this, a, this.range, this.atkValue, 'physical');
    }
  }

  // 突击（狂战士）
  dashTo(world) {
    const dx = Math.cos(this.facing) * 90;
    const dy = Math.sin(this.facing) * 90;
    this.x += dx; this.y += dy;
    world.applyMeleeAttack(this, this.facing, 50, this.atkValue * 1.1, 'physical');
  }

  castSkill(idx, world, mouseX, mouseY) {
    const slot = this.skills[idx];
    if (!slot || slot.cd > 0 || this.silenced || this.dead) return;
    const def = SKILL_DATA[slot.id];
    if (!def) return;
    if (this.mp < (def.mp || 0)) return;
    let target = null;
    if (def.type === 'targetEnemy') target = world.findNearestEnemyAt(mouseX, mouseY, this);
    else if (def.type === 'targetAlly') target = world.findNearestAllyAt(mouseX, mouseY, this);
    this.mp -= def.mp || 0;
    slot.cd = def.cd || 0;
    def.apply(this, world, target);
  }

  castUlt(world, mouseX, mouseY) {
    if (!this.ult.unlocked || this.ult.cd > 0 || this.silenced || this.dead) return;
    const def = this.ultRef;
    if (!def || this.mp < (def.mp || 0)) return;
    let target = null;
    if (def.type === 'targetEnemy') target = world.findNearestEnemyAt(mouseX, mouseY, this);
    else if (def.type === 'targetAlly') target = world.findNearestAllyAt(mouseX, mouseY, this);
    this.mp -= def.mp || 0;
    this.ult.cd = def.cd || 0;
    def.apply(this, world, target);
  }

  useItem(idx, world, target) {
    const id = this.inventory[idx];
    if (!id) return;
    const item = world.itemDB[id];
    if (!item) return;
    item.use(this, world, target);
    if (item.consumable) this.inventory.splice(idx, 1);
  }

  update(dt, world) {
    super.update(dt, world);
    if (this.toggleCd > 0) this.toggleCd -= dt;
    for (const s of this.skills) if (s.cd > 0) s.cd -= dt;
    if (this.ult.cd > 0) this.ult.cd -= dt;
    if (this.spyRevealed) {
      // 血色狂热：每 10s 减 1s
      this._wrath = (this._wrath || 0) + dt;
      if (this._wrath >= 10) {
        this._wrath = 0;
        for (const s of this.skills) s.cd = Math.max(0, s.cd - 1);
        this.ult.cd = Math.max(0, this.ult.cd - 1);
      }
    }
    // 持续施法：法术风暴
    if (this.channeling && this.channeling.id === 'warlock_storm') {
      world.applyChannelAOE(this, this.channeling.radius, this.channeling.dmg * dt, 'magic');
    }
  }

  render(ctx) {
    super.render(ctx);
    if (this.role === 'spy' && (this.spyRevealed || this.isPlayer)) {
      ctx.save();
      ctx.strokeStyle = this.spyRevealed ? '#ff3a3a' : '#ffaa00';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
