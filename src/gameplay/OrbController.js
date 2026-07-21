// Quản lý việc tạo và xử lý các quả cầu trong trò chơi
import { GameConfig } from "../config/GameConfig.js";
import { MysteryOrb } from "../entities/MysteryOrb.js";
import { Random } from "../utils/Random.js";

export class OrbController {
  constructor(spawnManager, effectSystem) {
    this.spawnManager = spawnManager;
    this.effectSystem = effectSystem;
    this.spawnCooldown = GameConfig.orb.spawnInterval;
    this.timer = 0;
    this.orbs = [];
  }

  spawnOrb() {
    const padding = GameConfig.orb.edgePadding;
    const width = this.spawnManager.width;
    const height = this.spawnManager.height;
    const effect = this.effectSystem.pickSpawnEffect();
    const orb = new MysteryOrb(
      padding + Random.float(0, width - padding * 2),
      padding + Random.float(0, height - padding * 2),
      effect,
    );
    this.spawnManager.add(orb);
    this.orbs.push(orb);
  }

  update(deltaTime) {
    this.timer += deltaTime;
    if (this.timer >= this.spawnCooldown) {
      this.timer -= this.spawnCooldown; // Giữ phần thời gian dư ra để tránh mất đồng bộ
      this.spawnOrb();
    }
    const now = performance.now();
    for (const orb of [...this.orbs]) {
      if (now >= orb.expiresAt) this.remove(orb);
      else orb.syncGraphics(now);
    }
  }

  reset() {
    this.clear();
    this.timer = 0;
  }

  remove(orb) {
    this.spawnManager.remove(orb);
    const index = this.orbs.indexOf(orb);
    if (index >= 0) this.orbs.splice(index, 1);
  }

  handleCollision(ball, orb) {
    if (!orb?.isActive) return;
    const effect = orb.effect ?? this.effectSystem.pickSpawnEffect();
    this.remove(orb);
    this.effectSystem.applyEffect(effect);
  }

  clear() {
    for (const orb of [...this.orbs]) this.remove(orb);
  }
}
