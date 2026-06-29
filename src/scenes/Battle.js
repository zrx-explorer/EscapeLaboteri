// src/scenes/Battle.js —— 战斗场景（核心 World）
import { Scene } from '../core/SceneManager.js';
import { Hero } from '../entities/Hero.js';
import { Projectile } from '../entities/Projectile.js';
import { ITEM_DATA } from '../data/items.js';
import { LEVEL_DATA } from '../data/levels.js';
import { HERO_LIST } from '../data/heroes.js';
import { AISystem } from '../systems/AISystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { Draw } from '../core/Renderer.js';
import { MapRuntime } from '../core/MapRuntime.js';
import { dist, angle, clamp, shuffle } from '../utils/Math2D.js';
import { HUD } from '../ui/HUD.js';
import { ShopScene } from './Shop.js';
import { GameOverScene } from './GameOver.js';

export class BattleScene extends Scene {
  constructor(game, levelIdx) {
    super(game);
    this.levelIdx = levelIdx;
    this.cfg = LEVEL_DATA[levelIdx];

    // 世界中心
    this.cx = game.width / 2;
    this.cy = game.height / 2;
    this.map = new MapRuntime(this, this.cfg.map || {});

    this.heroes = [];
    this.enemies = [];
    this.projectiles = [];
    this.damageTexts = [];

    this.itemDB = ITEM_DATA;
    this.player = null;

    this.timer = 0;
    this.storyTimer = 4; // 显示开场剧情 4s
    this.ended = false;
    this.endResult = null;

    this._buildParty();
    this.spawn = new SpawnSystem(this, this.cfg);
    this.ai = new AISystem(this);
    this.hud = new HUD(this);
  }

  _buildParty() {
    const meta = this.game.meta;
    const heroId = meta.heroId || 'knight';
    const partySize = Math.max(1, meta.partySize || 5);
    const spyCount  = Math.max(0, Math.min(meta.spyCount ?? 1, partySize - 1));
    const playerRole = meta.playerRole || 'hero';

    // 玩家
    const player = new Hero(heroId, this.cx, this.cy);
    player.isPlayer = true;
    player.world = this;
    this.heroes.push(player);
    this.player = player;

    // AI 同伴：从 HERO_LIST 中选 N-1 个（不足时允许重复）
    const others = HERO_LIST.filter(h => h.id !== heroId);
    shuffle(others);
    for (let i = 0; i < partySize - 1; i++) {
      const def = others[i % others.length];
      const ang = (i / Math.max(1, partySize - 1)) * Math.PI * 2;
      const h = new Hero(def.id, this.cx + Math.cos(ang) * 60, this.cy + Math.sin(ang) * 60);
      h.world = this;
      h.uid = `bot_${i}`; // 唯一标识（同名重复会出现）
      this.heroes.push(h);
    }

    // 分配内奸（仅首关决定，后续关卡复用）
    if (spyCount > 0 && !meta._spyAssigned) {
      const spies = [];
      if (playerRole === 'spy') {
        spies.push(player);
        const candidates = this.heroes.filter(h => h !== player);
        shuffle(candidates);
        for (let i = 0; i < spyCount - 1; i++) spies.push(candidates[i]);
      } else {
        const candidates = this.heroes.filter(h => h !== player);
        shuffle(candidates);
        for (let i = 0; i < spyCount; i++) spies.push(candidates[i]);
      }
      for (const s of spies) s.role = 'spy';
      meta._spyAssigned = true;
      meta._spyIds = spies.map(s => s.uid || (s.isPlayer ? 'player' : s.heroId));
    } else if (meta._spyAssigned && meta._spyIds) {
      // 后续关卡：恢复内奸身份
      for (const h of this.heroes) {
        const key = h.isPlayer ? 'player' : (h.uid || h.heroId);
        if (meta._spyIds.includes(key)) h.role = 'spy';
      }
    }
  }

  // ============ 战斗系统 API ============
  addEnemy(e) { e.world = this; this.enemies.push(e); }

  moveEntity(entity, nx, ny) {
    const p = this.map.moveEntity(entity, nx, ny);
    entity.x = p.x;
    entity.y = p.y;
  }

  findSpawnPoint(cx, cy, minR, maxR) {
    return this.map.findSpawnPoint(cx, cy, minR, maxR);
  }

  spawnProjectile(owner, ang, range, dmg, type, opt) {
    this.projectiles.push(new Projectile(owner, ang, range, dmg, type, opt));
  }

  applyMeleeAttack(owner, ang, range, dmg, type) {
    const targets = owner.team === 'hero' ? this.enemies : this.heroes;
    for (const t of targets) {
      if (t.dead || t === owner) continue;
      if (dist(owner.x, owner.y, t.x, t.y) <= range + t.r) {
        if (t.team === owner.team && t !== owner) {
          if (!owner.allyDamage) continue;
        }
        t.takeDamage(dmg, type, owner);
      }
    }
  }

  applyChannelAOE(owner, radius, dmg, type) {
    const targets = owner.team === 'hero' ? this.enemies : this.heroes;
    for (const t of targets) {
      if (t.dead || t === owner) continue;
      if (dist(owner.x, owner.y, t.x, t.y) <= radius) {
        if (t.team === owner.team && t !== owner && !owner.allyDamage) continue;
        t.takeDamage(dmg, type, owner);
      }
    }
  }

  findNearestEnemyAt(mx, my, caster) {
    let best = null, bestD = 9999;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(mx, my, e.x, e.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  findNearestAllyAt(mx, my, caster) {
    let best = caster, bestD = 9999;
    for (const h of this.heroes) {
      if (h.dead) continue;
      const d = dist(mx, my, h.x, h.y);
      if (d < bestD) { bestD = d; best = h; }
    }
    return best;
  }

  spawnDamageText(x, y, dmg, color) {
    this.damageTexts.push({ x, y, dmg, color, life: 1, vy: -20 });
  }

  onEnemyKilled(enemy, killer) {
    const mul = this.game.meta.diffMul || { expGain: 1, gold: 1 };
    // 团队共享经验 + 击杀者获得金币
    const aliveCnt = Math.max(1, this.heroes.filter(x => !x.dead).length);
    const expEach = Math.round((enemy.expReward * mul.expGain) / aliveCnt);
    for (const h of this.heroes) {
      if (h.dead) continue;
      h.gainExp(expEach);
    }
    if (killer && killer.team === 'hero' && !killer.dead) {
      killer.gold += Math.round(enemy.goldReward * mul.gold);
    }
  }

  // ============ 主循环 ============
  update(dt) {
    if (this.ended) {
      // 等待玩家点击进入下一阶段
      if (this.game.input.mouse.justClicked || this.game.input.isPressed('enter') || this.game.input.isPressed(' ')) {
        this._next();
      }
      return;
    }
    if (this.storyTimer > 0) {
      this.storyTimer -= dt;
      if (this.game.input.mouse.justClicked || this.game.input.isPressed(' ')) this.storyTimer = 0;
      return;
    }
    this.timer += dt;

    this._handleInput(dt);

    // 实体更新
    for (const h of this.heroes) h.update(dt, this);
    for (const e of this.enemies) e.update(dt, this);
    for (const p of this.projectiles) p.update(dt, this);
    this.projectiles = this.projectiles.filter(p => !p.dead);

    // AI
    this.ai.update(dt);

    // 刷怪
    this.spawn.update(dt);

    // 伤害文本
    for (const t of this.damageTexts) { t.life -= dt; t.y += t.vy * dt; }
    this.damageTexts = this.damageTexts.filter(t => t.life > 0);

    // 地形效果：慢速、伤害、治疗与边界限制
    for (const h of this.heroes) this.map.updateEntity(h, dt);
    for (const e of this.enemies) this.map.updateEntity(e, dt);

    // 终局判断
    const aliveAll  = this.heroes.filter(h => !h.dead);
    const aliveGood = aliveAll.filter(h => h.role !== 'spy');
    const aliveSpy  = aliveAll.filter(h => h.role === 'spy');
    const playerSpy = this.player.role === 'spy';
    const playerDead = this.player.dead;
    const hasSpies = (this.game.meta.spyCount || 0) > 0;

    if (playerDead) {
      // 玩家阵亡 → 立即结算
      this._end({ win: false, reason: '你已阵亡' });
    } else if (hasSpies && aliveGood.length === 0) {
      // 勇者全灭→内奸胜利
      this._end({ win: playerSpy, reason: playerSpy ? '内奸胜利' : '勇者全灭' });
    } else if (hasSpies && aliveSpy.length === 0 && this.spawn.isLevelClear()) {
      // 内奸被清除且关卡完成→勇者胜利
      this._end({ win: !playerSpy, reason: !playerSpy ? '内奸伏诛' : '内奸暴露' });
    } else if (aliveAll.length === 0) {
      this._end({ win: false, reason: '全员阵亡' });
    } else if (this.spawn.isLevelClear()) {
      // 无内奸局：只要通关即划。有内奸局：内奸还活着 → 勇者仅“过关”，内奸未败
      if (!hasSpies) this._end({ win: true, reason: '通关' });
      else this._end({ win: !playerSpy, reason: !playerSpy ? '通关（内奸尚存）' : '机会仍在' });
    }
  }

  _handleInput(dt) {
    const inp = this.game.input;
    const p = this.player;
    if (!p || p.dead) return;

    // 移动
    let dx = 0, dy = 0;
    if (inp.isDown('w')) dy -= 1;
    if (inp.isDown('s')) dy += 1;
    if (inp.isDown('a')) dx -= 1;
    if (inp.isDown('d')) dx += 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      this.moveEntity(
        p,
        p.x + (dx / len) * p.currentMoveSpd * dt,
        p.y + (dy / len) * p.currentMoveSpd * dt
      );
      p.facing = Math.atan2(dy, dx);
    }

    // 普攻
    if (inp.mouse.down) p.basicAttack(this, inp.mouse.x, inp.mouse.y);

    // 技能
    if (inp.isPressed('q')) p.castSkill(0, this, inp.mouse.x, inp.mouse.y);
    if (inp.isPressed('e')) p.ult.unlocked ? p.castUlt(this, inp.mouse.x, inp.mouse.y)
                                            : p.castSkill(1, this, inp.mouse.x, inp.mouse.y);
    // 道具
    for (let i = 0; i < 3; i++) if (inp.isPressed(String(i + 1))) p.useItem(i, this, this.findNearestEnemyAt(inp.mouse.x, inp.mouse.y, p));
    // 队友伤害开关
    if (inp.isPressed('f')) p.toggleAllyDamage();
    // 内奸亮明
    if (inp.isPressed('r')) p.revealSpy();
  }

  _end(result) {
    this.ended = true; this.endResult = result;
  }

  _next() {
    if (!this.endResult.win) {
      this.game.scenes.replace(new GameOverScene(this.game, { win: false, heroes: this.heroes, reason: this.endResult.reason }));
      return;
    }
    // 通关：进入商店；最后一关 → 结算
    if (this.levelIdx + 1 >= LEVEL_DATA.length) {
      this.game.scenes.replace(new GameOverScene(this.game, { win: true, heroes: this.heroes, reason: this.endResult.reason }));
    } else {
      this.game.scenes.replace(new ShopScene(this.game, this.heroes, this.levelIdx + 1));
    }
  }

  render(ctx) {
    this.map.renderUnder(ctx);

    // 毒圈
    if (this.spawn.poisonStarted) {
      ctx.save();
      ctx.fillStyle = 'rgba(120, 50, 200, 0.10)';
      ctx.beginPath();
      ctx.rect(0, 0, this.game.width, this.game.height);
      ctx.arc(this.cx, this.cy, this.spawn.poisonRadius, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      ctx.strokeStyle = '#aa66ff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.cx, this.cy, this.spawn.poisonRadius, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // 实体
    for (const e of this.enemies) e.render(ctx);
    for (const h of this.heroes) h.render(ctx);
    for (const p of this.projectiles) p.render(ctx);
    this.map.renderOver(ctx);

    // 伤害文本
    for (const t of this.damageTexts) {
      ctx.fillStyle = t.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.globalAlpha = clamp(t.life, 0, 1);
      ctx.textAlign = 'center';
      ctx.fillText(t.dmg, t.x, t.y);
      ctx.globalAlpha = 1;
    }

    // HUD
    this.hud.render(ctx);

    // 开场剧情
    if (this.storyTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, this.game.width, this.game.height);
      Draw.text(ctx, this.cfg.name, this.game.width/2, this.game.height/2 - 60, { font:'32px serif', align:'center', color:'#e8c98a' });
      Draw.text(ctx, this.cfg.storyBefore, this.game.width/2, this.game.height/2 - 10, { font:'16px sans-serif', align:'center', color:'#bbb' });
      // 玩家身份提示
      if (this.player && this.player.role === 'spy') {
        Draw.text(ctx, '🩸 你是内奸·伪装队友，在适当时机按 R 亮明、反击勇者',
          this.game.width/2, this.game.height/2 + 30, { font:'15px sans-serif', align:'center', color:'#ff6464' });
      } else if ((this.game.meta.spyCount || 0) > 0) {
        Draw.text(ctx, `⚠ 队伍中有 ${this.game.meta.spyCount} 名内奸潜伏，警惕身边人的行为`,
          this.game.width/2, this.game.height/2 + 30, { font:'14px sans-serif', align:'center', color:'#dec85d' });
      }
      // 难度、局型摘要
      const meta = this.game.meta;
      const diffName = { easy:'简单', normal:'普通', hard:'困难', nightmare:'噩梦' }[meta.difficulty || 'normal'];
      Draw.text(ctx, `· ${meta.partySize || 5} 人局 · 难度：${diffName} ·`,
        this.game.width/2, this.game.height/2 + 56, { font:'12px sans-serif', align:'center', color:'#888' });
      Draw.text(ctx, '点击屏幕跳过', this.game.width/2, this.game.height - 40, { font:'12px sans-serif', align:'center', color:'#666' });
    }

    // 结算遮罩
    if (this.ended) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, this.game.width, this.game.height);
      const big = this.endResult.win ? '胜利！' : '失败……';
      Draw.text(ctx, big, this.game.width/2, this.game.height/2 - 60, { font:'42px serif', align:'center', color: this.endResult.win ? '#e8c98a' : '#dc4242' });
      Draw.text(ctx, this.endResult.reason || '', this.game.width/2, this.game.height/2 - 18, { font:'18px sans-serif', align:'center', color:'#ddd' });
      if (this.endResult.win && this.cfg.storyAfter) {
        Draw.text(ctx, this.cfg.storyAfter, this.game.width/2, this.game.height/2 + 18, { font:'14px sans-serif', align:'center', color:'#aaa' });
      }
      Draw.text(ctx, '点击屏幕继续', this.game.width/2, this.game.height - 60, { font:'14px sans-serif', align:'center', color:'#888' });
    }
  }
}
