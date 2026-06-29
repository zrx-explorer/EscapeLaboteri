// src/scenes/Lobby.js —— 单机大厅：局型 / 阵营 / 难度
import { Scene } from '../core/SceneManager.js';
import { Draw, pointInRect } from '../core/Renderer.js';
import { HeroSelectScene } from './HeroSelect.js';
import { MainMenuScene } from './MainMenu.js';

const PARTY_PRESETS = [
  { id: 3, label: '三人副本',   desc: '玩家 + 2 AI · 纯 PvE',    spyMax: 0 },
  { id: 5, label: '五人狩猎',   desc: '玩家 + 4 AI · 1 名内奸',  spyMax: 1 },
  { id: 8, label: '八人围猎',   desc: '玩家 + 7 AI · 2 名内奸',  spyMax: 2 },
];

const ROLE_PRESETS = [
  { id: 'hero',   label: '勇者',   desc: '与队友闯关，揪出内奸' },
  { id: 'spy',    label: '内奸',   desc: '伪装队友，让队伍翻车' },
  { id: 'random', label: '随机',   desc: '由命运决定你的身份' },
];

const DIFF_PRESETS = [
  { id: 'easy',      label: '简单',   desc: '怪物 ×0.8 · 毒圈 ×0.7' },
  { id: 'normal',    label: '普通',   desc: '标准平衡数值' },
  { id: 'hard',      label: '困难',   desc: '怪物 ×1.3 · 毒圈 ×1.2' },
  { id: 'nightmare', label: '噩梦',   desc: '怪物 ×1.6 · 毒圈 ×1.5' },
];

const DIFF_MUL = {
  easy:      { enemy: 0.8, poison: 0.7, expGain: 0.9, gold: 0.9 },
  normal:    { enemy: 1.0, poison: 1.0, expGain: 1.0, gold: 1.0 },
  hard:      { enemy: 1.3, poison: 1.2, expGain: 1.2, gold: 1.2 },
  nightmare: { enemy: 1.6, poison: 1.5, expGain: 1.5, gold: 1.5 },
};

export class LobbyScene extends Scene {
  constructor(game) {
    super(game);
    this.party = game.meta.partySize || 5;
    this.role  = game.meta.playerRole || 'hero';
    this.diff  = game.meta.difficulty || 'normal';
  }

  update() {
    const m = this.game.input.mouse;
    if (!m.justClicked) return;

    // 局型
    for (const r of this._partyRects()) {
      if (pointInRect(m.x, m.y, r.x, r.y, r.w, r.h)) {
        this.party = r.opt.id;
        // 自动夹紧内奸数量上限
        return;
      }
    }
    // 阵营
    const partyOpt = PARTY_PRESETS.find(p => p.id === this.party);
    for (const r of this._roleRects()) {
      if (pointInRect(m.x, m.y, r.x, r.y, r.w, r.h)) {
        // 纯 PvE 局禁止选内奸
        if (partyOpt.spyMax === 0 && r.opt.id === 'spy') return;
        this.role = r.opt.id;
        return;
      }
    }
    // 难度
    for (const r of this._diffRects()) {
      if (pointInRect(m.x, m.y, r.x, r.y, r.w, r.h)) {
        this.diff = r.opt.id;
        return;
      }
    }
    // 返回
    const back = this._backBtn();
    if (pointInRect(m.x, m.y, back.x, back.y, back.w, back.h)) {
      this.game.scenes.replace(new MainMenuScene(this.game));
      return;
    }
    // 开始
    const start = this._startBtn();
    if (pointInRect(m.x, m.y, start.x, start.y, start.w, start.h)) {
      this._commitAndStart();
    }
  }

  _commitAndStart() {
    const meta = this.game.meta;
    const partyOpt = PARTY_PRESETS.find(p => p.id === this.party);
    meta.mode = 'solo';
    meta.partySize = this.party;
    meta.spyCount = partyOpt.spyMax;
    // 玩家阵营
    if (this.role === 'random') {
      const spyChance = partyOpt.spyMax > 0 ? partyOpt.spyMax / this.party : 0;
      meta.playerRole = Math.random() < spyChance ? 'spy' : 'hero';
    } else {
      meta.playerRole = this.role;
    }
    meta.difficulty = this.diff;
    meta.diffMul = DIFF_MUL[this.diff];
    // 重置运行期
    meta._spyAssigned = false;
    meta._spyId = null;
    meta._spyIds = null;
    this.game.scenes.replace(new HeroSelectScene(this.game));
  }

  // ============ 布局 ============
  _partyRects() {
    const W = this.game.width;
    const cw = 200, ch = 100, gap = 16;
    const total = PARTY_PRESETS.length * cw + (PARTY_PRESETS.length - 1) * gap;
    const sx = W / 2 - total / 2;
    const y = 130;
    return PARTY_PRESETS.map((opt, i) => ({ x: sx + i * (cw + gap), y, w: cw, h: ch, opt }));
  }
  _roleRects() {
    const W = this.game.width;
    const cw = 200, ch = 90, gap = 16;
    const total = ROLE_PRESETS.length * cw + (ROLE_PRESETS.length - 1) * gap;
    const sx = W / 2 - total / 2;
    const y = 280;
    return ROLE_PRESETS.map((opt, i) => ({ x: sx + i * (cw + gap), y, w: cw, h: ch, opt }));
  }
  _diffRects() {
    const W = this.game.width;
    const cw = 150, ch = 80, gap = 14;
    const total = DIFF_PRESETS.length * cw + (DIFF_PRESETS.length - 1) * gap;
    const sx = W / 2 - total / 2;
    const y = 420;
    return DIFF_PRESETS.map((opt, i) => ({ x: sx + i * (cw + gap), y, w: cw, h: ch, opt }));
  }
  _startBtn() { return { x: this.game.width / 2 + 10,  y: this.game.height - 80, w: 220, h: 48 }; }
  _backBtn()  { return { x: this.game.width / 2 - 230, y: this.game.height - 80, w: 220, h: 48 }; }

  // ============ 渲染 ============
  render(ctx) {
    const W = this.game.width, H = this.game.height;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0c1118'); grad.addColorStop(1, '#181020');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    Draw.text(ctx, '单机模式 · 房间设置', W / 2, 50, { font:'30px serif', align:'center', color:'#e8c98a', shadow:true });

    // 1. 局型
    Draw.text(ctx, '① 局型', W / 2, 100, { font:'15px serif', align:'center', color:'#a89270' });
    for (const r of this._partyRects()) this._drawCard(ctx, r, this.party === r.opt.id, r.opt.label, r.opt.desc);

    // 2. 阵营
    Draw.text(ctx, '② 玩家阵营', W / 2, 252, { font:'15px serif', align:'center', color:'#a89270' });
    const partyOpt = PARTY_PRESETS.find(p => p.id === this.party);
    for (const r of this._roleRects()) {
      const disabled = partyOpt.spyMax === 0 && r.opt.id === 'spy';
      this._drawCard(ctx, r, this.role === r.opt.id, r.opt.label, disabled ? '本局型不含内奸' : r.opt.desc, disabled);
    }

    // 3. 难度
    Draw.text(ctx, '③ 难度', W / 2, 392, { font:'15px serif', align:'center', color:'#a89270' });
    for (const r of this._diffRects()) this._drawCard(ctx, r, this.diff === r.opt.id, r.opt.label, r.opt.desc);

    // 摘要
    const partyLabel = partyOpt.label;
    const roleLabel  = this.role === 'random' ? '随机' : (this.role === 'spy' ? '内奸' : '勇者');
    const diffLabel  = DIFF_PRESETS.find(d => d.id === this.diff).label;
    Draw.text(ctx, `📜 ${partyLabel} · ${roleLabel} · ${diffLabel}（玩家 1 + AI ${this.party - 1}）`,
      W / 2, H - 100, { font:'14px sans-serif', align:'center', color:'#aaa' });

    // 按钮
    const back = this._backBtn(), start = this._startBtn();
    Draw.button(ctx, back.x, back.y, back.w, back.h, '« 返回主菜单', false);
    Draw.button(ctx, start.x, start.y, start.w, start.h, '下一步 · 选择英雄 »', true);
  }

  _drawCard(ctx, r, selected, title, desc, disabled = false) {
    ctx.save();
    if (disabled) {
      ctx.fillStyle = '#161820'; ctx.strokeStyle = '#2a2f3a';
    } else {
      ctx.fillStyle = selected ? '#2a3a55' : '#181a23';
      ctx.strokeStyle = selected ? '#e8c98a' : '#3a3f4d';
    }
    ctx.lineWidth = selected ? 3 : 1;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.restore();
    Draw.text(ctx, title, r.x + r.w / 2, r.y + 32, {
      font:'18px serif', align:'center',
      color: disabled ? '#555' : (selected ? '#e8c98a' : '#fff'),
    });
    Draw.text(ctx, desc, r.x + r.w / 2, r.y + 58, {
      font:'12px sans-serif', align:'center',
      color: disabled ? '#444' : '#aaa',
    });
  }
}
