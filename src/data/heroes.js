// src/data/heroes.js —— 英雄配表（含基础属性、外观）
// 关键字段：hp / atk / def / mp / mpRegen / atkSpeed / range
// 基于策划案 1-2 级数据并对术士做了平衡（ATK 65→50）

export const HERO_DATA = {
  knight: {
    id: 'knight', name: '骑士', desc: '纯肉 · 嘲讽吸怪',
    hp: 1000, hpRegen: 3.3, atk: 55, atkSpd: 1.0, def: 4,
    mp: 100, mpRegen: 0.7, range: 32, moveSpd: 90,
    color: '#7aa3d4',
    skills: ['knight_iron', 'knight_taunt'],
    ult: 'knight_awaken',
  },
  berserker: {
    id: 'berserker', name: '狂战士', desc: '半肉半输出 · 突进吸血',
    hp: 800, hpRegen: 2.7, atk: 62, atkSpd: 1.1, def: 3,
    mp: 150, mpRegen: 1.0, range: 32, moveSpd: 95,
    color: '#d97a4b',
    skills: ['berserker_charge', 'berserker_mark'],
    ult: 'berserker_blood',
  },
  hunter: {
    id: 'hunter', name: '猎人', desc: '远程输出 · 灼烧爆炸',
    hp: 600, hpRegen: 2.0, atk: 80, atkSpd: 1.2, def: 2,
    mp: 150, mpRegen: 1.0, range: 200, moveSpd: 100,
    color: '#5dbf5d',
    skills: ['hunter_dash', 'hunter_fire'],
    ult: 'hunter_rampage',
  },
  paladin: {
    id: 'paladin', name: '圣骑士', desc: '治疗 · Buff',
    hp: 800, hpRegen: 2.7, atk: 60, atkSpd: 1.0, def: 3,
    mp: 200, mpRegen: 1.4, range: 36, moveSpd: 90,
    color: '#e8d978',
    skills: ['paladin_holy', 'paladin_bless'],
    ult: 'paladin_judge',
  },
  warlock: {
    id: 'warlock', name: '术士', desc: '远程控制 · 范围伤害',
    hp: 700, hpRegen: 2.3, atk: 50, atkSpd: 1.0, def: 2,
    mp: 300, mpRegen: 2.1, range: 170, moveSpd: 90,
    color: '#9b7ad9',
    skills: ['warlock_storm', 'warlock_decay'],
    ult: 'warlock_curse',
  },
};

export const HERO_LIST = Object.values(HERO_DATA);

// 等级经验
export const LEVEL_EXP = [0, 100, 200, 400, 600];
export const LEVEL_CAP = 5;
