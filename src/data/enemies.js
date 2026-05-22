// src/data/enemies.js —— 敌人配表
export const ENEMY_DATA = {
  skeleton: { id:'skeleton', name:'骷髅', hp:120, atk:14, def:1, moveSpd:55, range:24, atkSpd:1, color:'#cdc7b8', exp:30, gold:8 },
  jackal:   { id:'jackal',   name:'鬣狗', hp:90,  atk:18, def:0, moveSpd:75, range:24, atkSpd:1.2, color:'#a8732e', exp:35, gold:10 },
  snake:    { id:'snake',    name:'毒蛇', hp:70,  atk:14, def:0, moveSpd:60, range:30, atkSpd:1.4, color:'#5e9d4f', exp:30, gold:8 },
  spider:   { id:'spider',   name:'毒蜘蛛', hp:80,  atk:16, def:0, moveSpd:50, range:24, atkSpd:1.0, color:'#7c4ad9', exp:35, gold:10 },
  zombie:   { id:'zombie',   name:'僵尸', hp:200, atk:20, def:2, moveSpd:40, range:24, atkSpd:0.8, color:'#7d8a4e', exp:55, gold:15 },
  // Boss
  lizard_king: {
    id:'lizard_king', name:'蜥蜴人王', boss:true,
    hp:1500, atk:35, def:8, moveSpd:55, range:32, atkSpd:0.9,
    color:'#3e8c5b', exp:300, gold:200,
    aoeOnHit: { dmg:30, radius:60 },
  },
};
