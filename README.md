# 逃离来伯特利 · Escape from Lebethel

> RPG · 非对称对抗 · Roguelike · HTML5 多端

[![Deploy](https://github.com/your-name/escape-from-lebethel/actions/workflows/deploy.yml/badge.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made with](https://img.shields.io/badge/made%20with-Vanilla%20JS-yellow.svg)](#)

勇者们闯入古老遗迹，宝藏诱发了诅咒——队伍中混入了**内奸**。
合作逃出迷宫的同时，还要识破身边的"伙伴"……

> 这是一份按互联网大厂规范组织的开源 H5 小游戏 Demo，可直接部署在 **GitHub Pages** 上游玩，也可移植到 **微信小游戏**。

---

## 🎮 在线试玩

- GitHub Pages：`https://<your-name>.github.io/escape-from-lebethel/`
- 本地启动（推荐）：见 [快速开始](#-快速开始)

## ✨ 特性

- 🎭 **单机可玩**：1 名玩家 + N 名 AI 同伴（含内奸 AI），不需要朋友也能开开
- 🎯 **三种局型**：三人副本 / 五人狩猎 / 八人围猎（3/5/8 人）
- ⚔️ **5 大职业**：骑士 / 狂战士 / 猎人 / 圣骑士 / 术士，三角克制
- 🌪 **4 档难度**：简单 / 普通 / 困难 / 噩梦，数值自动缩放
- 🩸 **双阵营**：玩家可选勇者或内奸，AI 同伴可智能反击
- 🧩 **Roguelike**，元进展（圣杯系统）跨局解锁
- 💰 **商店循环**：金币 / 水晶 / 经验书 三层经济
- 🗺 **丰富地形**：障碍、泥沼/深水、熔岩/毒雾、治疗点、目标点均由关卡配置驱动
- 🛒 **零依赖**：原生 ES Module + Canvas2D；另提供可双击运行的单文件版
- 📱 **多端**：浏览器 / GitHub Pages / 微信小游戏（迁移指南见 docs）

## 📁 工程结构

```
game/
├── index.html                # 入口
├── package.json              # 本地预览脚本
├── dist/
│   └── escape-lebethel-local.html # 双击可玩的本地单文件版
├── tools/
│   ├── build_local_html.py   # 生成本地单文件版
│   └── browser_smoke_test.html # 浏览器烟测页
├── README.md                 # 本文档
├── LICENSE
├── .gitignore
├── .github/workflows/
│   └── deploy.yml            # GitHub Pages 自动部署
├── docs/                     # 设计文档
│   ├── 游戏说明.md
│   ├── 策划案-修订版.md
│   ├── 部署指南.md
│   ├── 微信小游戏迁移.md
│   └── 微信小游戏落地清单.md
├── assets/                   # 资源（图片/音频）
│   ├── images/
│   └── audio/
└── src/
    ├── main.js               # 启动入口
    ├── core/                 # 引擎核心层
    │   ├── Game.js           # 主循环
    │   ├── SceneManager.js   # 场景栈
    │   ├── Renderer.js       # Canvas 渲染封装
    │   ├── Input.js          # 键鼠输入
    │   ├── MapRuntime.js     # 地形绘制、碰撞、区域效果
    │   └── EventBus.js       # 事件总线
    ├── data/                 # 数值配表（可热更）
    │   ├── heroes.js
    │   ├── skills.js
    │   ├── enemies.js
    │   ├── items.js
    │   └── levels.js
    ├── entities/             # 游戏实体
    │   ├── Entity.js
    │   ├── Hero.js
    │   ├── Enemy.js
    │   └── Projectile.js
    ├── systems/              # 逻辑系统（ECS-lite）
    │   ├── CombatSystem.js
    │   ├── SkillSystem.js
    │   ├── AISystem.js
    │   └── SpawnSystem.js
    ├── scenes/               # 场景
    │   ├── MainMenu.js
    │   ├── HeroSelect.js
    │   ├── Battle.js
    │   ├── Shop.js
    │   └── GameOver.js
    ├── ui/
    │   └── HUD.js
    └── utils/
        └── Math2D.js
```

## 🚀 快速开始

任意一种方式：

```text
方式 0：直接双击 dist/escape-lebethel-local.html
```

这是已打包的单文件版，不依赖本地服务器，适合发给别人快速试玩。

```bash
# 方式 1：使用 npx（推荐，零安装）
cd game
npx http-server -p 8080 -c-1

# 方式 2：使用 Python 内置服务器
cd game
python -m http.server 8080

# 方式 3：VSCode Live Server 插件直接打开 index.html
```

然后浏览器访问 <http://localhost:8080>。

> ⚠️ 源码版 `index.html` 使用 ES Module，必须通过 HTTP 协议访问，**不能直接双击 `index.html`**（会因 CORS 加载失败）。需要双击试玩时使用 `dist/escape-lebethel-local.html`。

重新生成单文件版：

```bash
python tools/build_local_html.py
```

## 🎯 操作

| 行为 | 按键 |
|---|---|
| 移动 | W / A / S / D |
| 普通攻击 | 鼠标左键（朝鼠标方向）|
| 技能 1 | Q |
| 技能 2 | E |
| 终极技能 / 内奸亮明 | R |
| 使用道具栏 | 1 / 2 / 3 |
| 切换队友伤害 | F |
| 跳过剧情 / 推进结算 | 空格 / 左键 |

单机玩法详见 [`docs/游戏说明.md`](docs/游戏说明.md) § 16 单机模式。微信小游戏落地流程见 [`docs/微信小游戏落地清单.md`](docs/微信小游戏落地清单.md)。

## ✅ 本地测试

```bash
python -m http.server 8765 --bind 127.0.0.1
```

浏览器访问：

- 源码版：<http://127.0.0.1:8765/>
- 自动烟测：<http://127.0.0.1:8765/tools/browser_smoke_test.html>

## 🛠 技术栈

- **渲染**：Canvas 2D
- **架构**：场景栈 + ECS-lite 系统
- **配表**：纯 JS 模块（可平滑替换为 JSON / 飞书多维表格 → 自动导出）
- **构建**：无构建（生产可选 Vite + Terser 一键打包）
- **部署**：GitHub Pages / Vercel / 微信小游戏

## 📋 路线图

- [x] MVP 单机 + Bot 内奸
- [x] **单机模式升级**：3/5/8 人局型、双阵营、四档难度、强化 AI
- [ ] WebSocket 联机（基于 Colyseus/Node）
- [ ] 元进展：圣杯天赋树
- [ ] 通行证 / 赛季
- [ ] 微信小游戏发布
- [ ] 移动端虚拟摇杆 UI 适配

## 📜 License

MIT © Escape from Lebethel
