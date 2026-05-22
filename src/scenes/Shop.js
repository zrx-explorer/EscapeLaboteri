// src/scenes/Shop.js —— 商店（关卡间补给 + 揭晓内奸）
import { Scene } from '../core/SceneManager.js';
import { Draw, pointInRect } from '../core/Renderer.js';
import { ITEM_DATA } from '../data/items.js';
import { BattleScene } from './Battle.js';

export class ShopScene extends Scene {
  constructor(game, heroes, nextLevelIdx) {
    super(game);
    this.heroes = heroes; // 沿用旧实例
    this.player = heroes.find(h => h.isPlayer);
    this.nextLevelIdx = nextLevelIdx;
    // 第 1 关后揭晓内奸（仅给玩家看到）
    this.revealed = nextLevelIdx === 1; // 进入第 2 关前
    this.items = nextLevelIdx === 1
      ? ['wood_armor','hp_stone','atk_blade','mp_stone','exp_book']
      : ['hp_potion','mp_potion','ruby_boots','wood_armor','atk_blade'];
    this.hover = -1;
    this.startBtn = { x: this.game.width / 2 - 110, y: this.game.height - 60, w: 220, h: 44 };
    this.story = nextLevelIdx === 1;
  }

  update() {
    const m = this.game.input.mouse;
    const cards = this._cards();
    this.hover = cards.findIndex(c => pointInRect(m.x, m.y, c.x, c.y, c.w, c.h));
    if (m.justClicked) {
      if (this.hover >= 0) {
        const it = ITEM_DATA[this.items[this.hover]];
        if (this.player.gold >= it.price) {
          this.player.gold -= it.price;
          if (it.consumable) {
            if (this.player.inventory.length < 3) this.player.inventory.push(it.id);
          } else {
            it.use(this.player, this);
          }
        }
      }
      if (pointInRect(m.x, m.y, this.startBtn.x, this.startBtn.y, this.startBtn.w, this.startBtn.h)) {
        const next = new BattleScene(this.game, this.nextLevelIdx);
        // 沿用现有英雄实例
        next.heroes = this.heroes.map(h => { h.world = next; return h; });
        next.player = this.player;
        next.cx = next.game.width / 2; next.cy = next.game.height / 2;
        // 重置位置
        this.heroes.forEach((h, i) => {
          h.x = next.cx + Math.cos(i * 1.5) * 60;
          h.y = next.cy + Math.sin(i * 1.5) * 60;
          if (h.dead) { h.dead = false; h.hp = Math.round(h.maxHp * 0.5); }
        });
        this.game.scenes.replace(next);
      }
    }
  }

  _cards() {
    const W = this.game.width;
    const cw = 130, ch = 150, gap = 14;
    const total = this.items.length * cw + (this.items.length - 1) * gap;
    const sx = W / 2 - total / 2;
    return this.items.map((id, i) => ({ id, x: sx + i * (cw + gap), y: 230, w: cw, h: ch }));
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;
    ctx.fillStyle = '#161019'; ctx.fillRect(0, 0, W, H);
    Draw.text(ctx, '🛒 中场商店', W / 2, 30, { font:'28px serif', align:'center', color:'#e8c98a' });
    Draw.text(ctx, `当前金币：${this.player.gold} 💰   水晶：${this.player.crystals} 💎`,
      W / 2, 70, { font:'14px sans-serif', align:'center', color:'#bbb' });

    if (this.revealed) {
      const spies = this.heroes.filter(h => h.role === 'spy');
      const playerIsSpy = spies.includes(this.player);
      let text;
      if (spies.length === 0) {
        text = '本局无内奸，全力闯关！';
      } else if (playerIsSpy) {
        const others = spies.filter(s => s !== this.player).map(s => s.name).join('、');
        text = others
          ? `🩸 你是【内奸】，同伙：${others}　（按 R 亮明）`
          : `🩸 你被诅咒选中——你是【内奸】！按 R 在战斗中亮明`;
      } else {
        text = `🩸 队伍中潜伏内奸 ${spies.length} 名：${spies.map(s => s.name).join('、')}`;
      }
      Draw.text(ctx, text, W / 2, 100, { font:'15px serif', align:'center', color:'#dc4242', shadow:true });
    }
    if (this.story) {
      Draw.text(ctx, '— 黑暗在你们之间扩散 —', W / 2, 130, { font:'13px sans-serif', align:'center', color:'#888' });
    }

    const cards = this._cards();
    cards.forEach((c, i) => {
      const it = ITEM_DATA[c.id];
      const canBuy = this.player.gold >= it.price;
      const hover = this.hover === i;
      ctx.fillStyle = hover ? '#2a2438' : '#1a1622';
      ctx.strokeStyle = canBuy ? '#5a76a3' : '#3a2d2d';
      ctx.lineWidth = 2;
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeRect(c.x, c.y, c.w, c.h);
      Draw.text(ctx, it.icon, c.x + c.w / 2, c.y + 16, { font:'40px sans-serif', align:'center' });
      Draw.text(ctx, it.name, c.x + c.w / 2, c.y + 76, { font:'16px serif', align:'center', color:'#fff' });
      Draw.text(ctx, `${it.price} g`, c.x + c.w / 2, c.y + 100, { font:'14px monospace', align:'center', color: canBuy ? '#dec85d' : '#776' });
      Draw.text(ctx, it.consumable ? '消耗品' : '永久属性', c.x + c.w / 2, c.y + 124, { font:'11px sans-serif', align:'center', color:'#888' });
    });

    Draw.button(ctx, this.startBtn.x, this.startBtn.y, this.startBtn.w, this.startBtn.h, `进入第 ${this.nextLevelIdx + 1} 关`, true);
  }
}
