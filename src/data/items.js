// src/data/items.js —— 道具配表
export const ITEM_DATA = {
  // 100g
  wood_armor: { id:'wood_armor', name:'木甲', price:100, icon:'🪵', use(h){ h.def += 3; } },
  hp_stone:   { id:'hp_stone',   name:'生命石', price:100, icon:'❤️', use(h){ h.maxHp += 100; h.hp += 100; } },
  atk_blade:  { id:'atk_blade',  name:'攻击刀刃', price:100, icon:'🗡', use(h){ h.atkBonus += 8; } },
  mp_stone:   { id:'mp_stone',   name:'魔法石', price:100, icon:'💎', use(h){ h.maxMp += 80; h.mp += 80; } },
  exp_book:   { id:'exp_book',   name:'经验书', price:100, icon:'📖', use(h){ h.gainExp(100); } },
  // 消耗品（道具栏）
  hp_potion:  { id:'hp_potion',  name:'生命药水', price:200, icon:'🧪', consumable:true, use(h){ h.hp = Math.min(h.maxHp, h.hp + 800); } },
  mp_potion:  { id:'mp_potion',  name:'魔法药水', price:200, icon:'🧴', consumable:true, use(h){ h.mp = Math.min(h.maxMp, h.mp + 200); } },
  // 内奸专属
  backstab:   { id:'backstab',   name:'背刺之刃', price:300, icon:'🗡', spy:true, consumable:true,
    use(h, w, target){ if (target) target.takeDamage(200, 'magic', h); } },
  ruby_boots: { id:'ruby_boots', name:'红宝石鞋', price:300, icon:'👢', consumable:true,
    use(h){ h.moveSpdMul *= 1.5; h.atkSpdMul *= 1.1; h.addBuff({ name:'红鞋', dur:6, onEnd:()=>{ h.moveSpdMul/=1.5; h.atkSpdMul/=1.1; }}); } },
};
