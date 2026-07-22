import { Container, Graphics } from 'pixi.js';

/**
 * Particle burst effect — hiệu ứng nổ hạt khi thu thập orb, bounce, hay game events.
 * Dùng object pooling để tránh GC spikes.
 */

class Particle {
  constructor() {
    this.gfx = new Graphics();
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;         // 0 → maxLife
    this.maxLife = 1;
    this.radius = 4;
    this.color = 0xffffff;
    this.alpha = 1;
    this.active = false;
  }

  spawn(x, y, vx, vy, radius, color, lifeSec) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.life = 0;
    this.maxLife = lifeSec;
    this.alpha = 1;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;
    this.life += dt;
    if (this.life >= this.maxLife) {
      this.active = false;
      this.gfx.visible = false;
      return;
    }
    const t = this.life / this.maxLife;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 300 * dt; // nhẹ trọng lực để hạt rơi tự nhiên
    this.alpha = 1 - t;
    this.gfx.visible = true;
    this.gfx.x = this.x;
    this.gfx.y = this.y;
    this.gfx.alpha = this.alpha;
    const r = this.radius * (1 - t * 0.5);
    this.gfx.clear().circle(0, 0, Math.max(0.5, r)).fill(this.color);
  }
}

export class ParticleSystem {
  /**
   * @param {import('pixi.js').Container} parentLayer — layer thêm particles vào
   * @param {number} poolSize — số particle tối đa đồng thời
   */
  constructor(parentLayer, poolSize = 120) {
    this.container = new Container();
    parentLayer.addChild(this.container);
    this.pool = Array.from({ length: poolSize }, () => {
      const p = new Particle();
      this.container.addChild(p.gfx);
      p.gfx.visible = false;
      return p;
    });
  }

  /**
   * Phát một vụ nổ hạt tại (x, y).
   * @param {number} x
   * @param {number} y
   * @param {number} color — hex color
   * @param {number} count — số hạt
   * @param {{ speed?: number, radius?: number, life?: number }} opts
   */
  burst(x, y, color, count = 12, opts = {}) {
    const { speed = 260, radius = 4, life = 0.55 } = opts;
    let spawned = 0;
    for (const p of this.pool) {
      if (!p.active && spawned < count) {
        const angle = Math.random() * Math.PI * 2;
        const s = speed * (0.5 + Math.random() * 0.8);
        p.spawn(
          x, y,
          Math.cos(angle) * s,
          Math.sin(angle) * s,
          radius * (0.6 + Math.random() * 0.8),
          color,
          life * (0.7 + Math.random() * 0.6),
        );
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  update(deltaSeconds) {
    for (const p of this.pool) {
      if (p.active) p.update(deltaSeconds);
    }
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
