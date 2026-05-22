// src/entities/Projectile.js —— 远程攻击弹道
import { dist } from '../utils/Math2D.js';

export class Projectile {
  constructor(owner, angle, range, dmg, dmgType = 'physical', opt = {}) {
    this.owner = owner;
    this.x = owner.x; this.y = owner.y;
    this.angle = angle;
    this.range = range;
    this.dmg = dmg;
    this.dmgType = dmgType;
    this.spd = 360;
    this.life = range / this.spd;
    this.dead = false;
    this.fire = !!opt.fire;
    this.r = 5;
    this.color = this.fire ? '#ffaa44' : '#cccccc';
  }

  update(dt, world) {
    if (this.dead) return;
    this.x += Math.cos(this.angle) * this.spd * dt;
    this.y += Math.sin(this.angle) * this.spd * dt;
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    // 命中检测：对目标团队相反阵营
    const targets = this.owner.team === 'hero' ? world.enemies : world.heroes;
    for (const t of targets) {
      if (t.dead || t === this.owner) continue;
      if (dist(this.x, this.y, t.x, t.y) < (t.r + this.r)) {
        // 队友伤害守护
        if (t.team === this.owner.team && t !== this.owner) {
          if (!this.owner.allyDamage) continue;
        }
        t.takeDamage(this.dmg, this.dmgType, this.owner);
        if (this.fire) {
          // 灼烧
          t.addBuff({ name:'灼烧', dur:5,
            onTick:(dt)=>{ t.takeDamage(4 * dt, 'physical', this.owner); }});
        }
        this.dead = true;
        return;
      }
    }
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    if (this.fire) {
      ctx.strokeStyle = '#ff5500';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }
}
