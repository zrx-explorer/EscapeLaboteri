// src/data/skills.js —— 技能配表
// type: 'self' / 'target' / 'aoe' / 'projectile' / 'toggle' / 'heal'

export const SKILL_DATA = {
  // ========= 骑士 =========
  knight_iron: {
    id: 'knight_iron', name: '肉身强化', icon: '🛡',
    type: 'self', mp: 40, cd: 17, dur: 10,
    apply(caster) {
      caster.maxHp += 120; caster.hp += 120;
      caster.hpRegen += 4;
      caster.addBuff({ name:'肉身', dur:10, onEnd:()=>{ caster.maxHp -= 120; caster.hpRegen -= 4; if (caster.hp > caster.maxHp) caster.hp = caster.maxHp; }});
    },
  },
  knight_taunt: {
    id: 'knight_taunt', name: '嘲讽', icon: '🎯',
    type: 'self', mp: 20, cd: 10, dur: 5,
    apply(caster) {
      caster.tauntLevel = 1;
      caster.addBuff({ name:'嘲讽', dur:5, onEnd:()=>{ caster.tauntLevel = 3; }});
    },
  },
  knight_awaken: {
    id: 'knight_awaken', name: '血脉觉醒（终极）', icon: '⚡',
    type: 'self', mp: 90, cd: 45, dur: 20, ult: true,
    apply(caster) {
      caster.clearDebuffs();
      const lostHp = caster.maxHp - caster.hp;
      const bonus = Math.floor(lostHp * 0.01);
      caster.atkBonus += bonus;
      caster.def += 5;
      caster.moveSpdMul *= 1.10;
      caster.addBuff({ name:'觉醒', dur:20, onEnd:()=>{
        caster.atkBonus -= bonus; caster.def -= 5; caster.moveSpdMul /= 1.10;
      }});
    },
  },

  // ========= 狂战士 =========
  berserker_charge: {
    id: 'berserker_charge', name: '突击', icon: '💥',
    type: 'dash', mp: 20, cd: 7, dist: 90,
    apply(caster, world) {
      caster.dashTo(world);
    },
  },
  berserker_mark: {
    id: 'berserker_mark', name: '针对（标记）', icon: '🩸',
    type: 'self', mp: 30, cd: 15, dur: 10,
    apply(caster) {
      caster.markActive = true;
      caster.addBuff({ name:'针对', dur:10, onEnd:()=>{ caster.markActive = false; }});
    },
  },
  berserker_blood: {
    id: 'berserker_blood', name: '嗜血（终极）', icon: '🔥',
    type: 'self', mp: 70, cd: 8, dur: 6, ult: true,
    apply(caster) {
      caster.atkSpdMul *= 1.10; caster.def += 2;
      const startHp = caster.hp;
      caster.addBuff({
        name:'嗜血', dur:6,
        onTick:(dt)=>{ caster.hp = Math.max(1, caster.hp - caster.maxHp * 0.05 * dt); },
        onEnd:()=>{
          caster.atkSpdMul /= 1.10; caster.def -= 2;
          caster.hp = Math.min(caster.maxHp, caster.hp + (startHp - caster.hp) * 0.6);
        }
      });
    },
  },

  // ========= 猎人 =========
  hunter_dash: {
    id: 'hunter_dash', name: '疾跑', icon: '👟',
    type: 'self', mp: 20, cd: 10, dur: 4,
    apply(caster) {
      caster.moveSpdMul *= 1.5;
      caster.addBuff({ name:'疾跑', dur:4, onEnd:()=>{ caster.moveSpdMul /= 1.5; }});
    },
  },
  hunter_fire: {
    id: 'hunter_fire', name: '火焰之箭', icon: '🏹',
    type: 'toggle', mp: 0, cd: 0,
    apply(caster) { caster.fireArrow = !caster.fireArrow; },
  },
  hunter_rampage: {
    id: 'hunter_rampage', name: '暴走（终极）', icon: '💢',
    type: 'self', mp: 100, cd: 25, dur: 10, ult: true,
    apply(caster) {
      caster.lifeSteal += 0.05; caster.atkBonus += 10;
      caster.addBuff({ name:'暴走', dur:10, onEnd:()=>{ caster.lifeSteal -= 0.05; caster.atkBonus -= 10; }});
    },
  },

  // ========= 圣骑士 =========
  paladin_holy: {
    id: 'paladin_holy', name: '圣光', icon: '✨',
    type: 'targetAlly', mp: 65, cd: 5, healAmt: 120, magicDmg: 200,
    apply(caster, world, target) {
      if (target && target.team === caster.team) target.hp = Math.min(target.maxHp, target.hp + 120);
      else if (target) target.takeDamage(200, 'magic', caster);
    },
  },
  paladin_bless: {
    id: 'paladin_bless', name: '神圣祝福', icon: '🕊',
    type: 'targetAlly', mp: 70, cd: 16, dur: 10,
    apply(caster, world, target) {
      if (!target) target = caster;
      target.def += 4;
      target.magicResist = (target.magicResist || 0) + 0.5;
      target.addBuff({ name:'祝福', dur:10,
        onTick:(dt)=>{ target.hp = Math.min(target.maxHp, target.hp + 1*dt); },
        onEnd:()=>{ target.def -= 4; target.magicResist -= 0.5; }
      });
    },
  },
  paladin_judge: {
    id: 'paladin_judge', name: '神圣制裁（终极）', icon: '⚖️',
    type: 'targetEnemy', mp: 80, cd: 18, dur: 10, ult: true,
    apply(caster, world, target) {
      if (!target) return;
      target.silenced = true;
      const oldRegen = target.hpRegen; target.hpRegen = 0;
      target.def -= 3; target.unhealable = true;
      target.addBuff({ name:'制裁', dur:10, onEnd:()=>{
        target.silenced = false; target.hpRegen = oldRegen;
        target.def += 3; target.unhealable = false;
      }});
    },
  },

  // ========= 术士 =========
  warlock_storm: {
    id: 'warlock_storm', name: '法术风暴', icon: '🌪',
    type: 'channel', mp: 120, cd: 12, dur: 4, radius: 80, dmg: 70,
    apply(caster) {
      caster.channeling = { id:'warlock_storm', dur:4, radius:80, dmg:70 };
      caster.addBuff({ name:'风暴', dur:4, onEnd:()=>{ caster.channeling = null; }});
    },
  },
  warlock_decay: {
    id: 'warlock_decay', name: '元素衰减', icon: '☠️',
    type: 'targetEnemy', mp: 100, cd: 18, dur: 10,
    apply(caster, world, target) {
      if (!target) return;
      target.atkBonus -= Math.floor(target.atk * 0.10); target.def -= 2;
      target.addBuff({ name:'衰减', dur:10,
        onTick:(dt)=>{ target.takeDamage(10*dt, 'magic', caster); },
        onEnd:()=>{ target.atkBonus += Math.floor(target.atk * 0.10); target.def += 2; }
      });
    },
  },
  warlock_curse: {
    id: 'warlock_curse', name: '诅咒（终极）', icon: '🕸',
    type: 'targetEnemy', mp: 150, cd: 17, dur: 7, ult: true,
    apply(caster, world, target) {
      if (!target) return;
      target.cursed = true;
      target.addBuff({ name:'诅咒', dur:7, onEnd:()=>{ target.cursed = false; }});
    },
  },

  // ========= 内奸专属 =========
  spy_strong: {
    id: 'spy_strong', name: '强壮', icon: '💪', type: 'toggle',
    apply(c) { c.spyStrong = !c.spyStrong; },
  },
  spy_rage: {
    id: 'spy_rage', name: '狂暴', icon: '🔪',
    type: 'self', mp: 30, cd: 20, dur: 7,
    apply(c) {
      c.critRate = 0.33; c.critDmg = 2.5;
      c.addBuff({ name:'狂暴', dur:7, onEnd:()=>{ c.critRate = 0; c.critDmg = 1.5; }});
    },
  },
};
