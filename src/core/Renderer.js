// src/core/Renderer.js —— Canvas 绘制工具
export const Draw = {
  text(ctx, str, x, y, opt = {}) {
    ctx.save();
    ctx.font = opt.font || '14px PingFang SC, Microsoft YaHei, sans-serif';
    ctx.fillStyle = opt.color || '#e8e6df';
    ctx.textAlign = opt.align || 'left';
    ctx.textBaseline = opt.baseline || 'top';
    if (opt.shadow) {
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    }
    ctx.fillText(str, x, y);
    ctx.restore();
  },
  rect(ctx, x, y, w, h, color, fill = true) {
    ctx.save();
    ctx[fill ? 'fillStyle' : 'strokeStyle'] = color;
    ctx[fill ? 'fillRect' : 'strokeRect'](x, y, w, h);
    ctx.restore();
  },
  circle(ctx, x, y, r, color, fill = true) {
    ctx.save();
    ctx[fill ? 'fillStyle' : 'strokeStyle'] = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    fill ? ctx.fill() : ctx.stroke();
    ctx.restore();
  },
  bar(ctx, x, y, w, h, ratio, color, bg = '#222') {
    ratio = Math.max(0, Math.min(1, ratio));
    Draw.rect(ctx, x, y, w, h, bg);
    Draw.rect(ctx, x, y, w * ratio, h, color);
    Draw.rect(ctx, x, y, w, h, '#000', false);
  },
  // 圆角按钮
  button(ctx, x, y, w, h, text, hover = false) {
    ctx.save();
    ctx.fillStyle = hover ? '#3a4d68' : '#1c2a3d';
    ctx.strokeStyle = '#5a76a3';
    ctx.lineWidth = 2;
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '16px PingFang SC, Microsoft YaHei, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
  },
};

// 检查点是否在矩形内
export function pointInRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}
