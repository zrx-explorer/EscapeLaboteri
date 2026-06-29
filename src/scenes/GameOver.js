// src/scenes/GameOver.js —— 结算场景
import { Scene } from '../core/SceneManager.js';
import { Draw, pointInRect } from '../core/Renderer.js';
import { MainMenuScene } from './MainMenu.js';

export class GameOverScene extends Scene {
  constructor(game, result) {
    super(game);
    this.result = result;
    this.btn = { x: this.game.width / 2 - 110, y: this.game.height - 80, w: 220, h: 48 };
    // 计算奖励：勇者经验 = 2n + 存活 + 消灭内奸
    if (result.heroes) {
      const m = result.heroes.length;
      const alive = result.heroes.filter(h => !h.dead);
      const n = alive.length;
      const player = result.heroes.find(h => h.isPlayer);
      const spyDead = result.heroes.find(h => h.role === 'spy' && h.dead);
      let exp = 2 * n + (player && !player.dead ? 2 : 0);
      if (spyDead && player && player.role !== 'spy') exp += 4;
      this.summary = { m, n, exp, player };
      // 奖励圣杯碎片
      this.shards = 5 + Math.floor(Math.random() * 25);
      game.meta.shards += this.shards;
    } else {
      this.summary = null;
      this.shards = 0;
    }
  }
  update() {
    const m = this.game.input.mouse;
    if (m.justClicked && pointInRect(m.x, m.y, this.btn.x, this.btn.y, this.btn.w, this.btn.h)) {
      // 重置 meta 的内奸标识
      this.game.meta._spyAssigned = false;
      this.game.meta._spyId = null;
      this.game.meta._spyIds = null;
      this.game.scenes.replace(new MainMenuScene(this.game));
    }
  }
  render(ctx) {
    const W = this.game.width, H = this.game.height;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, this.result.win ? '#1a2a18' : '#2a1014');
    grad.addColorStop(1, '#0a0c10');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    Draw.text(ctx, this.result.win ? '🏆 逃出生天 ! ' : '☠ 队伍覆灭', W / 2, 80,
      { font:'52px serif', align:'center', color: this.result.win ? '#e8c98a' : '#dc4242' });

    if (this.summary) {
      const { m, n, exp, player } = this.summary;
      Draw.text(ctx, `存活 ${n} / ${m}`, W / 2, 160, { font:'18px sans-serif', align:'center', color:'#fff' });

      // 列表
      let y = 220;
      Draw.text(ctx, '— 队伍结算 —', W / 2, y, { font:'15px serif', align:'center', color:'#aaa' });
      y += 30;
      for (const h of (this.result.heroes || [])) {
        const role = h.role === 'spy' ? '【内奸】' : '【勇者】';
        const status = h.dead ? '✘ 阵亡' : '✔ 存活';
        const color = h.role === 'spy' ? '#dc4242' : '#aef';
        Draw.text(ctx, `${role} ${h.name}  Lv.${h.level}  ${status}  💰 ${h.gold}`,
          W / 2, y, { font:'14px sans-serif', align:'center', color });
        y += 22;
      }

      Draw.text(ctx, `🎖 本局获得经验：${exp}`, W / 2, y + 20, { font:'15px sans-serif', align:'center', color:'#dec85d' });
      Draw.text(ctx, `🏆 圣杯碎片：+${this.shards}（累计 ${this.game.meta.shards}）`,
        W / 2, y + 44, { font:'15px sans-serif', align:'center', color:'#e8c98a' });
    } else {
      Draw.text(ctx, '在毒圈中，最后一位勇者也倒下了……', W / 2, 200,
        { font:'16px sans-serif', align:'center', color:'#bbb' });
    }

    Draw.button(ctx, this.btn.x, this.btn.y, this.btn.w, this.btn.h, '返回主菜单', true);
  }
}
