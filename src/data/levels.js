// src/data/levels.js -- level and map configuration.
// Numeric targets: quick solo demo, 3-5 minute full run on normal difficulty.

const STONE = { fill:'#2d3338', stroke:'#67717a' };
const WOOD = { fill:'#343024', stroke:'#736848' };
const LAVA = { fill:'rgba(210,70,35,0.24)', stroke:'#e2773f', type:'magic' };
const MIASMA = { fill:'rgba(120,70,170,0.22)', stroke:'#a56de6', type:'magic' };

export const LEVEL_DATA = [
  {
    id: 1, name: '遗迹入口 · 丛林回廊', envColor: '#1d2a1f',
    waves: [
      { spawn:[['skeleton',3], ['snake',2]], delay:0 },
      { spawn:[['jackal',3],   ['spider',2]], delay:10 },
      { spawn:[['skeleton',2], ['jackal',2], ['spider',2]], delay:20 },
    ],
    boss: 'lizard_king',
    bossDelay: 32,
    duration: 78,
    rewardGold: 600,
    storyBefore: '潮湿的遗迹入口在藤蔓后张开，第一批守卫已经听见脚步声。',
    storyAfter:  '蜥蜴人王倒下后，石碑露出诅咒刻痕：贪婪会从队伍内部醒来。',
    map: {
      baseColor: '#1a2a20',
      gridColor: 'rgba(210,255,210,0.035)',
      blockers: [
        { x: 120, y: 110, w: 110, h: 44, ...WOOD },
        { x: 770, y: 450, w: 120, h: 46, ...WOOD },
        { shape:'circle', x: 255, y: 420, r: 38, ...STONE },
        { shape:'circle', x: 780, y: 170, r: 42, ...STONE },
        { x: 468, y: 150, w: 88, h: 120, ...STONE },
      ],
      slowZones: [
        { shape:'circle', x: 360, y: 500, r: 72, moveMul:0.68, label:'泥沼' },
        { shape:'rect', x: 660, y: 250, w: 165, h: 80, moveMul:0.72, label:'浅水' },
      ],
      healZones: [
        { shape:'circle', x: 512, y: 512, r: 42, hps:10, mps:5, label:'圣泉' },
      ],
      decor: [
        { shape:'circle', x: 150, y: 520, r: 22, fill:'rgba(120,190,110,0.22)' },
        { shape:'circle', x: 890, y: 95, r: 18, fill:'rgba(120,190,110,0.18)' },
        { x: 292, y: 170, w: 74, h: 16, fill:'rgba(210,190,130,0.12)' },
      ],
      objectives: [{ x:512, y:320, r:34, label:'集结点' }],
    },
  },
  {
    id: 2, name: '地宫迷途 · 熔岩狱', envColor: '#2a1112',
    waves: [
      { spawn:[['zombie',3], ['skeleton',2]], delay:0 },
      { spawn:[['zombie',3], ['jackal',3]], delay:12 },
      { spawn:[['spider',4], ['snake',3]], delay:24 },
    ],
    boss: 'lizard_king',
    bossDelay: 36,
    duration: 86,
    rewardGold: 800,
    storyBefore: '岩浆切开地面，队伍必须在狭窄石桥上互相掩护。',
    storyAfter: '火光把每个人的影子拉得很长，内奸也终于有了下手的角度。',
    map: {
      baseColor: '#271416',
      gridColor: 'rgba(255,190,140,0.035)',
      blockers: [
        { x: 210, y: 250, w: 160, h: 38, ...STONE },
        { x: 640, y: 350, w: 168, h: 38, ...STONE },
        { shape:'circle', x: 170, y: 430, r: 36, ...STONE },
        { shape:'circle', x: 850, y: 205, r: 36, ...STONE },
      ],
      hazards: [
        { shape:'rect', x: 420, y: 85, w: 78, h: 220, dps:18, label:'熔岩', ...LAVA },
        { shape:'rect', x: 545, y: 335, w: 78, h: 220, dps:18, label:'熔岩', ...LAVA },
      ],
      slowZones: [
        { shape:'circle', x: 515, y: 318, r: 96, moveMul:0.76, label:'热浪' },
      ],
      healZones: [
        { shape:'circle', x: 145, y: 145, r: 36, hps:12, mps:8, label:'补给' },
      ],
      decor: [
        { shape:'circle', x: 470, y: 160, r: 18, fill:'rgba(255,130,60,0.20)' },
        { shape:'circle', x: 585, y: 480, r: 22, fill:'rgba(255,130,60,0.20)' },
      ],
      objectives: [{ x: 860, y: 510, r: 32, label:'石门' }],
    },
  },
  {
    id: 3, name: '水牢回廊 · 暗潮', envColor: '#102531',
    waves: [
      { spawn:[['snake',4], ['spider',2]], delay:0 },
      { spawn:[['jackal',4], ['zombie',2]], delay:12 },
      { spawn:[['skeleton',3], ['spider',4]], delay:26 },
    ],
    boss: 'lizard_king',
    bossDelay: 40,
    duration: 92,
    rewardGold: 900,
    storyBefore: '水声盖住了脚步，深池与残桥把队形撕成几段。',
    storyAfter: '你们越过水牢，出口近在眼前，但毒月已经贴着地平线升起。',
    map: {
      baseColor: '#102631',
      gridColor: 'rgba(150,220,255,0.035)',
      blockers: [
        { x: 430, y: 90, w: 42, h: 190, ...STONE },
        { x: 550, y: 360, w: 42, h: 190, ...STONE },
        { x: 210, y: 310, w: 150, h: 42, ...STONE },
        { x: 690, y: 288, w: 150, h: 42, ...STONE },
      ],
      slowZones: [
        { shape:'rect', x: 80, y: 420, w: 260, h: 115, moveMul:0.58, label:'深水' },
        { shape:'rect', x: 690, y: 95, w: 250, h: 112, moveMul:0.58, label:'深水' },
        { shape:'circle', x: 512, y: 320, r: 72, moveMul:0.72, label:'漩涡' },
      ],
      hazards: [
        { shape:'circle', x: 165, y: 182, r: 58, dps:10, label:'毒苔', ...MIASMA },
        { shape:'circle', x: 875, y: 468, r: 58, dps:10, label:'毒苔', ...MIASMA },
      ],
      healZones: [
        { shape:'circle', x: 512, y: 568, r: 34, hps:8, mps:14, label:'法阵' },
      ],
      decor: [
        { x: 384, y: 316, w: 256, h: 16, fill:'rgba(215,215,190,0.13)' },
        { x: 496, y: 250, w: 32, h: 136, fill:'rgba(215,215,190,0.12)' },
      ],
      objectives: [{ x:512, y:78, r:30, label:'排水闸' }],
    },
  },
  {
    id: 4, name: '同室操戈 · 毒月祭坛', envColor: '#191320',
    waves: [
      { spawn:[['skeleton',4], ['jackal',3]], delay:0 },
      { spawn:[['zombie',3], ['spider',4]], delay:14 },
      { spawn:[['snake',4], ['jackal',4]], delay:28 },
    ],
    boss: 'lizard_king',
    bossDelay: 42,
    duration: 78,
    rewardGold: 1000,
    storyBefore: '祭坛中央只剩一条路。毒圈会更快收缩，真相也会更快逼近。',
    storyAfter: '来伯特利的出口打开了，活下来的人才有资格解释真相。',
    map: {
      baseColor: '#1a1422',
      gridColor: 'rgba(220,180,255,0.035)',
      blockers: [
        { shape:'circle', x: 512, y: 320, r: 58, fill:'#2b2434', stroke:'#8068a4' },
        { x: 185, y: 160, w: 120, h: 44, ...STONE },
        { x: 720, y: 438, w: 120, h: 44, ...STONE },
        { x: 718, y: 160, w: 44, h: 124, ...STONE },
        { x: 260, y: 360, w: 44, h: 124, ...STONE },
      ],
      hazards: [
        { shape:'circle', x: 512, y: 320, r: 116, dps:12, label:'裂隙', ...MIASMA },
        { shape:'rect', x: 82, y: 280, w: 155, h: 74, dps:13, label:'毒雾', ...MIASMA },
        { shape:'rect', x: 788, y: 280, w: 155, h: 74, dps:13, label:'毒雾', ...MIASMA },
      ],
      slowZones: [
        { shape:'circle', x: 512, y: 320, r: 190, moveMul:0.82, label:'重压' },
      ],
      healZones: [
        { shape:'circle', x: 140, y: 525, r: 32, hps:10, mps:10, label:'残光' },
        { shape:'circle', x: 884, y: 115, r: 32, hps:10, mps:10, label:'残光' },
      ],
      decor: [
        { shape:'circle', x: 512, y: 320, r: 150, fill:'rgba(210,160,255,0.08)' },
      ],
      objectives: [{ x:512, y:320, r:70, label:'毒月祭坛' }],
    },
  },
];
