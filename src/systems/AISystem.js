// src/systems/AISystem.js —— 队友 / 内奸 AI（单机增强版）
import { dist } from '../utils/Math2D.js';

export class AISystem {
  constructor(world) {
    this.world = world;
    // 内奸"被怀疑"分数（玩家为内奸时，被亮明会持续累积）
    this._suspicion = new WeakMap();
  }

  update(dt) {
    for (const h of this.world.heroes) {
      if (h.isPlayer || h.dead) continue;
      this._updateBot(h, dt);
    }
    // 玩家为内奸：若已亮明 / 攻击过队友 → 队友 AI 会反击
    this._maybeRetaliate(dt);
  }

  _updateBot(bot, dt) {
    const w = this.world;
    bot._aiThink = (bot._aiThink || 0) - dt;
    bot._aiTactic = (bot._aiTactic || 0) - dt;

    // ① 低 HP 撤退 / 自吃药
    const hpRatio = bot.hp / bot.maxHp;
    if (hpRatio < 0.30 && !bot.dead) {
      // 自动喝药（如果背包里有 hp_potion）
      const potIdx = bot.inventory.findIndex(id => id === 'hp_potion');
      if (potIdx >= 0 && bot._aiTactic <= 0) {
        bot.useItem(potIdx, w, bot);
        bot._aiTactic = 1.5;
      }
      // 撤退到队伍中心 / 玩家身边
      const refuge = w.player && !w.player.dead ? w.player : this._teamCentroid(bot);
      if (refuge) {
        bot.moveTowards(refuge.x, refuge.y, dt);
        return;
      }
    }

    // ② 寻找最近敌人
    let bestEnemy = null, bestD = Infinity;
    for (const e of w.enemies) {
      if (e.dead) continue;
      const d = dist(bot.x, bot.y, e.x, e.y);
      if (d < bestD) { bestD = d; bestEnemy = e; }
    }

    // ③ 玩家若为已亮明的内奸 → 队友视玩家为头号目标
    if (this._isPlayerHostile(bot)) {
      const p = w.player;
      if (p && !p.dead) {
        const d = dist(bot.x, bot.y, p.x, p.y);
        const desired = bot.range > 60 ? bot.range * 0.85 : bot.range - 4;
        if (d > desired) bot.moveTowards(p.x, p.y, dt);
        else { bot.allyDamage = true; bot.basicAttack(w, p.x, p.y); }
        if (bot._aiThink <= 0) {
          bot._aiThink = 1.0 + Math.random();
          bot.allyDamage = true;
          const idx = Math.floor(Math.random() * bot.skills.length);
          bot.castSkill(idx, w, p.x, p.y);
        }
        return;
      }
    }

    // ④ 内奸 AI："摸鱼" + 偶发暗算队友
    if (bot.role === 'spy') {
      // 偶发：转身攻击最近队友（亮明后概率显著提高）
      const ambushChance = bot.spyRevealed ? 0.004 : 0.0008;
      if (Math.random() < ambushChance) {
        const ally = this._nearestAlly(bot);
        if (ally && dist(bot.x, bot.y, ally.x, ally.y) < 80) {
          bot.allyDamage = true;
          bot.basicAttack(w, ally.x, ally.y);
          // 标记暗算事件，提高被识破概率（玩家可观察 HP 异常下降）
          bot._sneakHits = (bot._sneakHits || 0) + 1;
          return;
        }
      }
      // 亮明后：直接对最近队友/玩家发起攻势
      if (bot.spyRevealed) {
        const target = this._nearestAlly(bot);
        if (target) {
          const d = dist(bot.x, bot.y, target.x, target.y);
          const desired = bot.range > 60 ? bot.range * 0.85 : bot.range - 4;
          if (d > desired) bot.moveTowards(target.x, target.y, dt);
          else { bot.allyDamage = true; bot.basicAttack(w, target.x, target.y); }
          if (bot._aiThink <= 0) {
            bot._aiThink = 1.0 + Math.random();
            bot.allyDamage = true;
            const idx = Math.floor(Math.random() * bot.skills.length);
            bot.castSkill(idx, w, target.x, target.y);
          }
          return;
        }
      }
    }

    // ⑤ 没怪 → 跟随玩家 / 队伍
    if (!bestEnemy) {
      const player = w.player;
      if (player && !player.dead) {
        const d = dist(bot.x, bot.y, player.x, player.y);
        if (d > 100) bot.moveTowards(player.x, player.y, dt);
      }
      return;
    }

    // ⑥ 内奸"摸鱼"（未亮明时偶尔不补刀）
    const lazy = bot.role === 'spy' && !bot.spyRevealed && Math.random() < 0.35;
    const desiredRange = bot.range > 60 ? bot.range * 0.85 : bot.range - 4;
    if (bestD > desiredRange && !lazy) {
      bot.moveTowards(bestEnemy.x, bestEnemy.y, dt);
    } else if (bestD <= desiredRange && !lazy) {
      bot.basicAttack(w, bestEnemy.x, bestEnemy.y);
    }

    // ⑦ 偶发释放技能 / 终极
    if (bot._aiThink <= 0) {
      bot._aiThink = 1.2 + Math.random();
      // 内奸摸鱼时也少放技能
      if (!(bot.role === 'spy' && !bot.spyRevealed && Math.random() < 0.5)) {
        const idx = Math.floor(Math.random() * bot.skills.length);
        bot.castSkill(idx, w, bestEnemy.x, bestEnemy.y);
      }
      if (bot.ult.unlocked && bot.ult.cd <= 0 && Math.random() < 0.5) {
        bot.castUlt(w, bestEnemy.x, bestEnemy.y);
      }
    }
  }

  // ============ 工具 ============
  _isPlayerHostile(bot) {
    const w = this.world;
    const p = w.player;
    if (!p || p.dead || bot.role === 'spy') return false; // 内奸 AI 走自己分支
    // 玩家是已亮明的内奸：所有勇者都视为敌
    if (p.role === 'spy' && p.spyRevealed) return true;
    // 玩家是内奸但未亮明：累计怀疑度
    if (p.role === 'spy' && (p._sneakHits || 0) > 0) {
      const s = (this._suspicion.get(bot) || 0) + (p._sneakHits || 0);
      this._suspicion.set(bot, s);
      // 怀疑度 ≥3 → 队友确定玩家是内奸
      if (s >= 3) return true;
    }
    return false;
  }

  _nearestAlly(bot) {
    const w = this.world;
    let best = null, bestD = Infinity;
    for (const h of w.heroes) {
      if (h === bot || h.dead) continue;
      // 内奸不会暗算其他内奸
      if (bot.role === 'spy' && h.role === 'spy') continue;
      const d = dist(bot.x, bot.y, h.x, h.y);
      if (d < bestD) { bestD = d; best = h; }
    }
    return best;
  }

  _teamCentroid(bot) {
    const w = this.world;
    let n = 0, sx = 0, sy = 0;
    for (const h of w.heroes) {
      if (h === bot || h.dead || h.role === 'spy') continue;
      sx += h.x; sy += h.y; n++;
    }
    return n ? { x: sx / n, y: sy / n } : null;
  }

  // 玩家为内奸时，重置队友 allyDamage 开关由 AI 自行管理；
  // 这里负责"被亮明后的 0.5s 反应延迟"以避免立刻爆发
  _maybeRetaliate(dt) {
    const p = this.world.player;
    if (!p || p.role !== 'spy' || !p.spyRevealed) return;
    // 队友切换 allyDamage
    for (const h of this.world.heroes) {
      if (h.isPlayer || h.dead || h.role === 'spy') continue;
      h.allyDamage = true;
    }
  }
}
