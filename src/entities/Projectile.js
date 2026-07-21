import Matter from 'matter-js';
import { Container, Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig.js';

const { Bodies, Body } = Matter;

export class Projectile {
  constructor(x, y, velocity) {
    const { radius, lifetimeMs, color } = GameConfig.projectile;
    this.radius = radius;
    this.body = Bodies.circle(x, y, radius, {
      isSensor: true,
      label: 'projectile',
      frictionAir: 0,
    });
    Body.setVelocity(this.body, velocity);
    this.expiresAt = performance.now() + lifetimeMs;
    this.isActive = true;
    this.container = new Container();
    this.container.position.set(x, y);
    const trail = new Graphics().circle(-radius * 0.7, 0, radius).fill({ color, alpha: 0.18 });
    const shape = new Graphics().circle(0, 0, radius).fill(color).stroke({ width: 2, color: 0xffffff, alpha: 0.7 });
    this.container.addChild(trail, shape);
    this.graphics = this.container;
  }

  syncGraphics() {
    this.container.position.set(this.body.position.x, this.body.position.y);
    this.container.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
  }

  destroy() {
    if (!this.isActive) return;
    this.isActive = false;
    this.container.removeFromParent();
    this.container.destroy({ children: true });
  }
}
