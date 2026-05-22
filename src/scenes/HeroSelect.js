// src/scenes/HeroSelect.js —— 选英雄
import { Scene } from '../core/SceneManager.js';
import { Draw, pointInRect } from '../core/Renderer.js';
import { HERO_LIST } from '../data/heroes.js';
import { BattleScene } from './Battle.js';

export class HeroSelectScene extends Scene {
  constructor(game) { super(game); this.hover = -1; this.selected = 0; }
  update() {
    const m = this.game.input.mouse;
    const W = this.game.width;
    const cards = this._cards(W);
    this.hover = cards.findIndex(c => pointInRect(m.x, m.y, c.x, c.y, c.w, c.h));
    if (m.justClicked && this.hover >= 0) this.selected = this.hover;

    const startBtn = this._startBtn();
    if (m.justClicked && pointInRect(m.x, m.y, startBtn.x, startBtn.y, startBtn.w, startBtn.h)) {
      this.game.meta.heroId = HERO_LIST[this.selected].id;
      // partySize / spyCount / playerRole / difficulty 均在 Lobby 或主菜单快速入口中设置，这里不覆盖
      this.game.scenes.replace(new BattleScene(this.game, 0));
    }
  }
  _cards(W) {
    const w = 160, h = 220, gap = 12, total = HERO_LIST.length * w + (HERO_LIST.length - 1) * gap;
    const sx = W / 2 - total / 2;
    return HERO_LIST.map((hero, i) => ({ x: sx + i * (w + gap), y: 130, w, h, hero }));
  }
  _startBtn() { return { x: this.game.width / 2 - 110, y: this.game.height - 80, w: 220, h: 48 }; }
  render(ctx) {
    const W = this.game.width, H = this.game.height;
    ctx.fillStyle = '#11141c'; ctx.fillRect(0, 0, W, H);
    Draw.text(ctx, '选择英雄', W / 2, 50, { font: '28px serif', align:'center', color:'#e8c98a' });

    const cards = this._cards(W);
    cards.forEach((c, i) => {
      const isSel = this.selected === i, isHover = this.hover === i;
      ctx.save();
      ctx.fillStyle = isSel ? '#2a3a55' : (isHover ? '#202733' : '#181a23');
      ctx.strokeStyle = isSel ? '#e8c98a' : '#3a3f4d';
      ctx.lineWidth = isSel ? 3 : 1;
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeRect(c.x, c.y, c.w, c.h);
      // 头像
      ctx.fillStyle = c.hero.color;
      ctx.beginPath(); ctx.arc(c.x + c.w / 2, c.y + 50, 30, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      Draw.text(ctx, c.hero.name, c.x + c.w / 2, c.y + 90, { font:'20px serif', align:'center', color:'#fff' });
      Draw.text(ctx, c.hero.desc, c.x + c.w / 2, c.y + 116, { font:'12px sans-serif', align:'center', color:'#aaa' });
      Draw.text(ctx, `HP ${c.hero.hp}`,    c.x + 14, c.y + 140, { font:'12px monospace', color:'#5dde7b' });
      Draw.text(ctx, `ATK ${c.hero.atk}`,  c.x + 14, c.y + 156, { font:'12px monospace', color:'#dec85d' });
      Draw.text(ctx, `DEF ${c.hero.def}`,  c.x + 14, c.y + 172, { font:'12px monospace', color:'#5da3de' });
      Draw.text(ctx, `射程 ${c.hero.range > 60 ? '远' : '近'}`, c.x + 14, c.y + 188, { font:'12px monospace', color:'#cccccc' });
    });
    // 开始按钮
    const b = this._startBtn();
    Draw.button(ctx, b.x, b.y, b.w, b.h, '集结启程 · 进入第 1 关', true);
    // 显示当前房间摘要
    const meta = this.game.meta;
    const partyName = { 3:'三人副本', 5:'五人狩猎', 8:'八人围猎' }[meta.partySize] || `${meta.partySize} 人局`;
    const roleName  = meta.playerRole === 'spy' ? '内奸' : '勇者';
    const diffName  = { easy:'简单', normal:'普通', hard:'困难', nightmare:'噩梦' }[meta.difficulty || 'normal'];
    Draw.text(ctx, `本局：${partyName} · ${roleName} · ${diffName}　（玩家 1 + AI ${(meta.partySize||5)-1}）`,
      W / 2, H - 30, { font:'12px sans-serif', align:'center', color:'#888' });
  }
}
