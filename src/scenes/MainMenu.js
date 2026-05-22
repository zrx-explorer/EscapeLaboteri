// src/scenes/MainMenu.js —— 主菜单
import { Scene } from '../core/SceneManager.js';
import { Draw, pointInRect } from '../core/Renderer.js';
import { HeroSelectScene } from './HeroSelect.js';
import { LobbyScene } from './Lobby.js';

export class MainMenuScene extends Scene {
  constructor(game) { super(game); this._hover = -1; }
  update(dt) {
    const m = this.game.input.mouse;
    const W = this.game.width, H = this.game.height;
    const buttons = this._buttons(W, H);
    this._hover = buttons.findIndex(b => pointInRect(m.x, m.y, b.x, b.y, b.w, b.h));
    if (m.justClicked && this._hover >= 0) {
      const b = buttons[this._hover];
      if (b.action === 'quick') {
        // 快速开始：5 人狩猎·勇者·普通
        const meta = this.game.meta;
        meta.mode = 'solo';
        meta.partySize = 5;
        meta.spyCount = 1;
        meta.playerRole = 'hero';
        meta.difficulty = 'normal';
        meta.diffMul = { enemy:1, poison:1, expGain:1, gold:1 };
        meta._spyAssigned = false; meta._spyId = null; meta._spyIds = null;
        this.game.scenes.replace(new HeroSelectScene(this.game));
      }
      if (b.action === 'solo')   this.game.scenes.replace(new LobbyScene(this.game));
      if (b.action === 'tutorial') alert(
        '【操作教学】\n' +
        '· WASD ：移动\n' +
        '· 鼠标左键 ：普攻\n' +
        '· Q / E ：释放技能\n' +
        '· R ：终极技能（Lv4 解锁；玩家为内奸时亦可亮明身份）\n' +
        '· 1 / 2 / 3 ：使用背包道具\n' +
        '· F ：切换“队友伤害”开关（冷却 5s）\n' +
        '· 空格 / 点击：跳过剧情、推进结算');
    }
  }
  _buttons(W, H) {
    const w = 240, h = 46, x = W / 2 - w / 2;
    const y0 = H / 2 - 20;
    return [
      { x, y: y0,        w, h, label: '☕ 快速开始',  action: 'quick' },
      { x, y: y0 + 60,   w, h, label: '⚗ 自定义单机',action: 'solo' },
      { x, y: y0 + 120,  w, h, label: '✏ 操作教学',  action: 'tutorial' },
    ];
  }
  render(ctx) {
    const W = this.game.width, H = this.game.height;
    // 背景
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0c1118'); grad.addColorStop(1, '#1a1014');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    // 装饰圆
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(255,200,140,${Math.random() * 0.05})`;
      ctx.beginPath(); ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 60 + 10, 0, Math.PI * 2); ctx.fill();
    }
    // 标题
    Draw.text(ctx, '逃 离 来 伯 特 利', W/2, 110, { font:'56px serif', align:'center', color:'#e8c98a', shadow:true });
    Draw.text(ctx, 'Escape from Lebethel', W/2, 168, { font:'18px sans-serif', align:'center', color:'#a89270' });
    Draw.text(ctx, 'RPG · 非对称对抗 · Roguelike  ·  单机可玩', W/2, 198, { font:'14px sans-serif', align:'center', color:'#857060' });
    // 按钮
    const buttons = this._buttons(W, H);
    buttons.forEach((b, i) => Draw.button(ctx, b.x, b.y, b.w, b.h, b.label, this._hover === i));
    // 说明
    Draw.text(ctx, '☕ 快速开始：5 人·勇者·普通　—　⚗ 自定义：选择 3/5/8 人、阵营、难度',
      W/2, H - 60, { font:'12px sans-serif', align:'center', color:'#888' });
    // 版本
    Draw.text(ctx, 'v0.2.0 · 单机 + AI 同伴·零依赖', 10, H - 18, { color:'#555', font:'11px monospace' });
  }
}
