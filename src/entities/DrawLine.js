import Matter from 'matter-js';
import { Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig.js';
import { simplifyPath } from '../utils/VectorMath.js';

const { Bodies, Body } = Matter;

/**
 * Biến 1 đường vẽ (mảng điểm thô từ InputManager) thành 1 chuỗi vật thể
 * vật lý tĩnh (static body chain) để bóng có thể va chạm và nảy vào.
 */
export class DrawLine {
  constructor(rawPoints) {
    const { simplifyTolerance, maxPoints, thickness, restitution, lifetimeMs } =
      GameConfig.drawLine;

    // 1. Rút gọn đường vẽ (Bước 13)
    let points = simplifyPath(rawPoints, simplifyTolerance);
    if (points.length > maxPoints) {
      points = points.slice(0, maxPoints);
    }

    this.bodies = [];
    this.graphics = new Graphics();

    // 2. Với mỗi cặp điểm liền kề, tạo 1 hình chữ nhật mỏng nối giữa chúng
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const segment = this.createSegment(p1, p2, thickness, restitution);
      if (segment) this.bodies.push(segment);
    }

    // 3. Vẽ hình ảnh đường line (glow effect nhẹ) khớp với các segment vật lý
    this.graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {        // Tạo nhiều hình chữ nhật liên tiếp nối với nhau thành 1 đường thẳng
      this.graphics.lineTo(points[i].x, points[i].y);
    }
    this.graphics.stroke({ width: thickness, color: 0x4fd1ff, cap: 'round', join: 'round' });

    // 4. Đường vẽ tự huỷ sau lifetimeMs
    this.expiresAt = performance.now() + lifetimeMs;
  }

  createSegment(p1, p2, thickness, restitution) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy);
    if (length < 1) return null; // 2 điểm quá gần nhau, bỏ qua

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const angle = Math.atan2(dy, dx);

    const body = Bodies.rectangle(midX, midY, length, thickness, {
      isStatic: true,
      label: 'draw-line',
      restitution,
      friction: 0,
    });
    Body.setAngle(body, angle);
    return body;
  }

  isExpired(now) {
    return now >= this.expiresAt;
  }
}