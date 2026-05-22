// src/ui/HUD.js —— 战斗 HUD
import { Draw } from '../core/Renderer.js';
import { SKILL_DATA } from '../data/skills.js';
import { ITEM_DATA } from '../data/items.js';

export class HUD {
  constructor(scene) { this.scene = scene; }

  render(ctx) {
    const W = this.scene.game.width, H = this.scene.game.height;
    const p = this.scene.player;
    if (!p) return;

    // ============ 顶部：关卡信息 ============
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, W, 28);
    Draw.text(ctx, `第 ${this.scene.levelIdx + 1} 关 · ${this.scene.cfg.name}`, 10, 7, { color:'#e8c98a' });
    const left = Math.max(0, this.scene.cfg.duration - this.scene.timer);
    const min = Math.floor(left / 60), sec = Math.floor(left % 60).toString().padStart(2, '0');
    Draw.text(ctx, `剩余: ${min}:${sec}`, W / 2, 7, { color:'#bbb', align:'center' });
    const enemies = this.scene.enemies.filter(e => !e.dead).length;
    Draw.text(ctx, `存活敌人: ${enemies}`, W - 10, 7, { color:'#dc8a8a', align:'right' });

    // ============ 左下：玩家面板 ============
    const px = 12, py = H - 110;
    Draw.rect(ctx, px, py, 230, 100, 'rgba(0,0,0,0.55)');
    Draw.rect(ctx, px, py, 230, 100, '#444', false);
    Draw.text(ctx, `${p.name} Lv.${p.level}`, px + 8, py + 6, { color:'#fff', font:'14px sans-serif' });
    if (p.role === 'spy') Draw.text(ctx, '⚡内奸', px + 200, py + 6, { color:'#ff6a6a', font:'12px sans-serif' });
    Draw.bar(ctx, px + 8, py + 26, 215, 12, p.hp / p.maxHp, '#5dde7b');
    Draw.text(ctx, `HP ${Math.round(p.hp)}/${p.maxHp}`, px + 12, py + 28, { color:'#fff', font:'11px sans-serif' });
    Draw.bar(ctx, px + 8, py + 42, 215, 10, p.mp / Math.max(1, p.maxMp), '#5da3de');
    Draw.text(ctx, `MP ${Math.round(p.mp)}/${p.maxMp}`, px + 12, py + 43, { color:'#fff', font:'11px sans-serif' });
    const expCap = [0, 100, 200, 400, 600][p.level] || 100;
    Draw.bar(ctx, px + 8, py + 56, 215, 6, p.exp / expCap, '#dec85d');
    Draw.text(ctx, `EXP ${p.exp}/${expCap}    💰 ${p.gold}    💎 ${p.crystals}`, px + 8, py + 66, { color:'#ddd', font:'11px sans-serif' });
    Draw.text(ctx, `ATK ${p.atkValue}  DEF ${p.def}  攻速 ${p.currentAtkSpd.toFixed(1)}`, px + 8, py + 80, { color:'#aaa', font:'11px sans-serif' });

    // ============ 底部中：技能槽 ============
    const slotW = 50, slotH = 50, gap = 8;
    const totalSlots = 3; // Q E + 一格备用
    const totalW = totalSlots * slotW + (totalSlots - 1) * gap;
    const sx = W / 2 - totalW / 2, sy = H - 60;
    const slots = [
      { key: 'Q', s: p.skills[0], def: SKILL_DATA[p.skills[0].id] },
      { key: 'E', s: p.ult.unlocked ? p.ult : (p.skills[1] || p.skills[0]),
                  def: p.ult.unlocked ? p.ultRef : SKILL_DATA[(p.skills[1]||p.skills[0]).id] },
      { key: 'F', s: { cd: p.toggleCd }, def: { name: p.allyDamage ? '队伤[开]' : '队伤[关]', icon:'⚔️' } },
    ];
    slots.forEach((s, i) => {
      const x = sx + i * (slotW + gap);
      Draw.rect(ctx, x, sy, slotW, slotH, '#222');
      Draw.rect(ctx, x, sy, slotW, slotH, '#666', false);
      Draw.text(ctx, s.def.icon || '?', x + slotW / 2, sy + 4, { font:'24px sans-serif', align:'center' });
      Draw.text(ctx, s.def.name || '', x + slotW / 2, sy + 32, { font:'10px sans-serif', align:'center', color:'#bbb' });
      Draw.text(ctx, s.key, x + 4, sy + 4, { font:'10px sans-serif', color:'#ff8' });
      if (s.s.cd > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(x, sy, slotW, slotH);
        Draw.text(ctx, s.s.cd.toFixed(1), x + slotW / 2, sy + slotH / 2 - 7, { font:'18px sans-serif', align:'center', color:'#fff' });
      }
    });

    // ============ 右下：道具栏 ============
    const ix = W - 12 - 3 * (slotW + gap) + gap, iy = H - 60;
    for (let i = 0; i < 3; i++) {
      const x = ix + i * (slotW + gap);
      Draw.rect(ctx, x, iy, slotW, slotH, '#222');
      Draw.rect(ctx, x, iy, slotW, slotH, '#666', false);
      Draw.text(ctx, String(i + 1), x + 4, iy + 4, { font:'10px sans-serif', color:'#ff8' });
      const id = p.inventory[i];
      if (id) {
        const it = ITEM_DATA[id];
        Draw.text(ctx, it.icon || '?', x + slotW / 2, iy + 4, { font:'24px sans-serif', align:'center' });
        Draw.text(ctx, it.name || '', x + slotW / 2, iy + 32, { font:'10px sans-serif', align:'center', color:'#bbb' });
      }
    }

    // ============ 右上：队伍状态 ============
    const ty = 38;
    let tt = ty;
    for (const h of this.scene.heroes) {
      if (h === p) continue;
      const tx = W - 130;
      Draw.rect(ctx, tx, tt, 120, 26, 'rgba(0,0,0,0.5)');
      Draw.rect(ctx, tx, tt, 120, 26, '#333', false);
      Draw.text(ctx, h.name, tx + 6, tt + 4, { font:'12px sans-serif', color: h.dead ? '#666' : (h.spyRevealed ? '#ff6666' : '#aef') });
      Draw.bar(ctx, tx + 6, tt + 18, 108, 4, h.hp / h.maxHp, h.dead ? '#444' : '#5dde7b');
      tt += 30;
    }
  }
}
