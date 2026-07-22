import { Graphics } from 'pixi.js';

/**
 * TrailEffect — vệt sáng theo sau bóng khi di chuyển.
 * Dùng một mảng điểm lịch sử vị trí để vẽ vệt dần mờ dần.
 */
export class TrailEffect {
  /**
   * @param {import('pixi.js').Container} parentLayer
   * @param {number} maxPoints — số điểm lưu lịch sử vị trí
   * @param {number} color — màu vệt
   * @param {number} radius — bán kính bóng (dùng để scale vệt)
   */
  constructor(parentLayer, maxPoints = 14, color = 0xffd36b, radius = 16) {
    this.maxPoints = maxPoints;
    this.color = color;
    this.radius = radius;
    this.points = []; // [{x, y}]

    this.gfx = new Graphics();
    this.gfx.zIndex = -1; // vẽ dưới bóng
    parentLayer.addChild(this.gfx);
  }

  /**
   * Gọi mỗi frame với vị trí hiện tại của bóng.
   */
  update(ballX, ballY) {
    this.points.push({ x: ballX, y: ballY });
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
    this._draw();
  }

  _draw() {
    this.gfx.clear();
    const n = this.points.length;
    if (n < 2) return;

    for (let i = 1; i < n; i++) {
      const t = i / n;                      // 0 → 1 (tail → head)
      const alpha = t * t * 0.45;          // mờ dần về đuôi, tối đa 45%
      const r = this.radius * 0.5 * t;    // thu nhỏ dần về đuôi

      const { x, y } = this.points[i];
      this.gfx
        .circle(x, y, Math.max(0.5, r))
        .fill({ color: this.color, alpha });
    }
  }

  setColor(color) {
    this.color = color;
  }

  clear() {
    this.points = [];
    this.gfx.clear();
  }

  destroy() {
    this.gfx.destroy();
  }
}
