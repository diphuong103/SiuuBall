import { GameConfig } from "../config/GameConfig.js";
import { Projectile } from "../entities/Projectile.js";
import { Random } from "../utils/Random.js";

export class ProjectileController {
  constructor(spawnManager, getTarget) {
    this.spawnManager = spawnManager;
    this.getTarget = getTarget;
    this.spawnCooldown = GameConfig.projectile.spawnInterval;
    this.timer = 0;
    this.projectiles = [];
    this.elapsedTime = 0;
  }

  // Sinh ra một viên đạn từ một cạnh ngẫu nhiên
  spawnProjectile(targetPosition) {
    if (this.projectiles.length >= GameConfig.projectile.maxActive) {
      return;
    }
    const padding = GameConfig.projectile.edgePadding;
    const width = this.spawnManager.width;
    const height = this.spawnManager.height;
    const side = Random.int(0, 3);

    let position;

    switch (side) {
      case 0: // Cạnh trên (top)
        position = {
          x: Random.float(0, width),
          y: padding,
        };
        break;

      case 1: // Cạnh phải (right)
        position = {
          x: width - padding,
          y: Random.float(0, height),
        };
        break;

      case 2: // Cạnh dưới (bottom)
        position = {
          x: Random.float(0, width),
          y: height - padding,
        };
        break;

      default: // side === 3, Cạnh trái (left)
        position = {
          x: padding,
          y: Random.float(0, height),
        };
        break;
    }

    const dx = targetPosition.x - position.x;
    const dy = targetPosition.y - position.y;
    const length = Math.hypot(dx, dy) || 1; //hypot là hàm pythagoras tính căn bậc hai của tổng bình phương các cạnh, dùng để tính khoảng cách giữa hai điểm trong không gian 2D
    const projectileConfig = GameConfig.projectile;

    const speed = Math.min(
      projectileConfig.maxSpeed,
      Math.max(
        projectileConfig.minSpeed,
        projectileConfig.speed +
        this.elapsedTime * projectileConfig.speedIncreasePerSecond,
      ),
    );
    const projectile = new Projectile(position.x, position.y, {
      x: (dx / length) * speed,
      y: (dy / length) * speed,
    });

    this.spawnManager.add(projectile);
    this.projectiles.push(projectile);
  }

  update(deltaTime) {
    // Cập nhật trạng thái của các viên đạn, sinh ra viên đạn mới nếu cần
    this.elapsedTime += deltaTime;
    this.timer += deltaTime;
    if (this.timer >= this.spawnCooldown) {
      this.timer -= this.spawnCooldown; // Giữ phần thời gian dư ra để tránh mất đồng bộ
      const target = this.getTarget();
      if (target && target.body) {
        this.spawnProjectile(target.body.position);
      }
    }
    const now = performance.now();
    for (const projectile of [...this.projectiles]) {
      if (now >= projectile.expiresAt || this.isOutside(projectile))
        this.remove(projectile);
      else projectile.syncGraphics();
    }
  }

  isOutside(projectile) {
    // Kiểm tra xem viên đạn có nằm ngoài
    const { x, y } = projectile.body.position;
    const margin = projectile.radius * 3;
    return (
      x < -margin ||
      x > this.spawnManager.width + margin ||
      y < -margin ||
      y > this.spawnManager.height + margin
    );
  }

  handleCollision(projectile) {
    this.remove(projectile);
  }

  reset() {
    this.clear();
    this.timer = 0;
    this.elapsedTime = 0;
  }

  remove(projectile) {
    this.spawnManager.remove(projectile);
    this.spawnManager.entities.delete(projectile);
    const index = this.projectiles.indexOf(projectile);
    if (index >= 0) this.projectiles.splice(index, 1);
  }

  clear() {
    for (const projectile of [...this.projectiles]) this.remove(projectile);
  }
}
