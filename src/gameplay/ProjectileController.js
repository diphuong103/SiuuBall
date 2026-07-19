import { GameConfig } from '../config/GameConfig.js';
import { Projectile } from '../entities/Projectile.js';

export class ProjectileController {
  constructor(spawnManager, getTarget) {
    this.spawnManager = spawnManager;
    this.getTarget = getTarget;
    this.spawnCooldown = GameConfig.projectile.spawnInterval;
    this.timer = 0;
    this.projectiles = [];
  }

  spawnProjectile(targetPosition) {
    const padding = GameConfig.projectile.edgePadding;
    const width = this.spawnManager.width;
    const height = this.spawnManager.height;
    const side = Math.floor(Math.random() * 4);
    const position = side === 0 ? { x: Math.random() * width, y: padding }
      : side === 1 ? { x: width - padding, y: Math.random() * height }
        : side === 2 ? { x: Math.random() * width, y: height - padding }
          : { x: padding, y: Math.random() * height };

    const dx = targetPosition.x - position.x;
    const dy = targetPosition.y - position.y;
    const length = Math.hypot(dx, dy) || 1;
    const speed = GameConfig.projectile.speed;
    const projectile = new Projectile(position.x, position.y, { x: dx / length * speed, y: dy / length * speed });

    this.spawnManager.add(projectile);
    this.projectiles.push(projectile);
  }

  update(deltaTime) {
    this.timer += deltaTime;
    if (this.timer >= this.spawnCooldown) {
      this.timer = 0;
      const target = this.getTarget();
      if (target && target.body) {
        this.spawnProjectile(target.body.position);
      }
    }
    const now = performance.now();
    for (const projectile of [...this.projectiles]) {
      if (now >= projectile.expiresAt || this.isOutside(projectile)) this.remove(projectile);
      else projectile.syncGraphics();
    }
  }

  isOutside(projectile) {
    const { x, y } = projectile.body.position;
    const margin = projectile.radius * 3;
    return x < -margin || x > this.spawnManager.width + margin || y < -margin || y > this.spawnManager.height + margin;
  }

  handleCollision(projectile) {
    this.remove(projectile);
  }

  remove(projectile) {
    this.spawnManager.remove(projectile);
    const index = this.projectiles.indexOf(projectile);
    if (index >= 0) this.projectiles.splice(index, 1);
  }

  clear() {
    for (const projectile of [...this.projectiles]) this.remove(projectile);
  }
}
