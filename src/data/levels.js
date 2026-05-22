// src/data/levels.js —— 关卡配表
export const LEVEL_DATA = [
  {
    id: 1, name: '遗迹入口', envColor: '#1d2a1f',
    waves: [
      { spawn:[['skeleton',3], ['snake',2]], delay:0 },
      { spawn:[['jackal',3],   ['spider',2]], delay:8 },
      { spawn:[['skeleton',2], ['jackal',2], ['spider',2]], delay:16 },
    ],
    boss: 'lizard_king',
    bossDelay: 28,
    duration: 90,
    rewardGold: 600,
    storyBefore: '勇者们闯入来伯特利遗迹深处，潮湿的空气中弥漫着诅咒的气息……',
    storyAfter:  '在击败蜥蜴人王后，你们发现宝藏旁的石碑：「贪婪是最古老的诅咒」。\n队伍中有人静静地凝视着宝藏。',
  },
  {
    id: 2, name: '地宫迷途 · 熔岩狱', envColor: '#2a1112',
    waves: [
      { spawn:[['zombie',3], ['skeleton',2]], delay:0 },
      { spawn:[['zombie',4], ['jackal',2]],   delay:10 },
    ],
    boss: 'lizard_king', // demo 复用 boss
    bossDelay: 22,
    duration: 90,
    rewardGold: 800,
    storyBefore: '岩浆沸腾，地宫深处发出低沉的咆哮。',
    storyAfter: '内奸的身影在火光中若隐若现……',
  },
];
