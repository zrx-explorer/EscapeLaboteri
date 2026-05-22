// src/main.js —— 启动入口
import { Game } from './core/Game.js';
import { MainMenuScene } from './scenes/MainMenu.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const game = new Game(canvas, ctx);
game.scenes.push(new MainMenuScene(game));
game.start();

// 调试：暴露到 window
window.__game = game;
