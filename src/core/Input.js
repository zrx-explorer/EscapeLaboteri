// src/core/Input.js —— 键鼠输入封装
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressed = new Set();
    this.mouse = { x: 0, y: 0, down: false, justClicked: false };

    addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (!this.keys.has(k)) this.justPressed.add(k);
      this.keys.add(k);
      // 阻止 WASD/空格/数字滚动
      if (['w','a','s','d',' ','q','e','r','f','1','2','3','tab'].includes(k)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { this.mouse.down = true; this.mouse.justClicked = true; }
    });
    addEventListener('mouseup',   (e) => { if (e.button === 0) this.mouse.down = false; });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isDown(k) { return this.keys.has(k.toLowerCase()); }
  isPressed(k) { return this.justPressed.has(k.toLowerCase()); }
  endFrame() { this.justPressed.clear(); this.mouse.justClicked = false; }
}
