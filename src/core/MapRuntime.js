// src/core/MapRuntime.js -- battlefield terrain, collision and map effects.
import { clamp, dist } from '../utils/Math2D.js';

function circleRectHit(cx, cy, cr, r) {
  const px = clamp(cx, r.x, r.x + r.w);
  const py = clamp(cy, r.y, r.y + r.h);
  return dist(cx, cy, px, py) <= cr;
}

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function inCircle(x, y, c) {
  return dist(x, y, c.x, c.y) <= c.r;
}

export class MapRuntime {
  constructor(world, cfg = {}) {
    this.world = world;
    this.cfg = cfg;
    this.margin = cfg.margin ?? 24;
    this.blockers = cfg.blockers || [];
    this.hazards = cfg.hazards || [];
    this.slowZones = cfg.slowZones || [];
    this.healZones = cfg.healZones || [];
    this.decor = cfg.decor || [];
    this.objectives = cfg.objectives || [];
  }

  clampPoint(x, y, r = 12) {
    return {
      x: clamp(x, this.margin + r, this.world.game.width - this.margin - r),
      y: clamp(y, this.margin + r, this.world.game.height - this.margin - r),
    };
  }

  isBlocked(x, y, r = 12) {
    const p = this.clampPoint(x, y, r);
    if (p.x !== x || p.y !== y) return true;
    return this.blockers.some(b => {
      if (b.shape === 'circle') return dist(x, y, b.x, b.y) <= r + b.r;
      return circleRectHit(x, y, r, b);
    });
  }

  moveEntity(entity, nx, ny) {
    const ox = entity.x;
    const oy = entity.y;
    const r = entity.r || 12;
    const p = this.clampPoint(nx, ny, r);

    if (!this.isBlocked(p.x, p.y, r)) return { x: p.x, y: p.y };
    if (!this.isBlocked(p.x, oy, r)) return { x: p.x, y: oy };
    if (!this.isBlocked(ox, p.y, r)) return { x: ox, y: p.y };
    return { x: ox, y: oy };
  }

  findSpawnPoint(cx, cy, minR, maxR) {
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = minR + Math.random() * (maxR - minR);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (!this.isBlocked(x, y, 18)) return { x, y };
    }
    return this.clampPoint(cx, cy, 18);
  }

  updateEntity(entity, dt) {
    if (!entity || entity.dead) return;
    entity.terrainMoveMul = 1;

    for (const z of this.slowZones) {
      if (this._contains(entity.x, entity.y, z)) {
        entity.terrainMoveMul = Math.min(entity.terrainMoveMul, z.moveMul ?? 0.65);
      }
    }

    for (const z of this.hazards) {
      if (this._contains(entity.x, entity.y, z)) {
        const dmg = (z.dps || 0) * dt;
        if (dmg > 0) entity.takeDamage(dmg, z.type || 'true', null);
      }
    }

    for (const z of this.healZones) {
      if (entity.team === 'hero' && this._contains(entity.x, entity.y, z)) {
        entity.hp = Math.min(entity.maxHp, entity.hp + (z.hps || 0) * dt);
        entity.mp = Math.min(entity.maxMp, entity.mp + (z.mps || 0) * dt);
      }
    }
  }

  _contains(x, y, z) {
    return z.shape === 'rect' ? inRect(x, y, z) : inCircle(x, y, z);
  }

  renderUnder(ctx) {
    this._drawFloor(ctx);
    for (const z of this.healZones) this._drawZone(ctx, z, 'rgba(82, 210, 140, 0.18)', '#61d99a');
    for (const z of this.slowZones) this._drawZone(ctx, z, 'rgba(80, 120, 150, 0.20)', '#5e8fb5');
    for (const z of this.hazards) this._drawZone(ctx, z, z.fill || 'rgba(220, 85, 50, 0.20)', z.stroke || '#dc663c');
    for (const d of this.decor) this._drawDecor(ctx, d);
    for (const b of this.blockers) this._drawBlocker(ctx, b);
    for (const o of this.objectives) this._drawObjective(ctx, o);
  }

  renderOver(ctx) {
    for (const b of this.blockers.filter(x => x.canopy)) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      this._drawBlocker(ctx, b);
      ctx.restore();
    }
  }

  _drawFloor(ctx) {
    const W = this.world.game.width;
    const H = this.world.game.height;
    ctx.fillStyle = this.cfg.baseColor || this.world.cfg.envColor || '#182026';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = this.cfg.gridColor || 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  _drawBlocker(ctx, b) {
    ctx.save();
    ctx.fillStyle = b.fill || '#252b2f';
    ctx.strokeStyle = b.stroke || '#596066';
    ctx.lineWidth = 2;
    if (b.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else {
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }
    ctx.restore();
  }

  _drawZone(ctx, z, fill, stroke) {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    if (z.shape === 'rect') {
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeRect(z.x, z.y, z.w, z.h);
    } else {
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    if (z.label) {
      ctx.fillStyle = stroke;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(z.label, z.x, z.y + 4);
    }
    ctx.restore();
  }

  _drawDecor(ctx, d) {
    ctx.save();
    ctx.fillStyle = d.fill || 'rgba(255,255,255,0.08)';
    if (d.shape === 'circle') {
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillRect(d.x, d.y, d.w, d.h);
    }
    ctx.restore();
  }

  _drawObjective(ctx, o) {
    ctx.save();
    ctx.strokeStyle = o.stroke || '#e8c98a';
    ctx.fillStyle = o.fill || 'rgba(232,201,138,0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r || 28, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    if (o.label) {
      ctx.fillStyle = '#e8c98a';
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText(o.label, o.x, o.y - (o.r || 28) - 8);
    }
    ctx.restore();
  }
}
