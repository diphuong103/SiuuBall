// Quản lý việc tạo và xử lý các quả cầu trong trò chơi
import { GameConfig } from '../config/GameConfig.js';
import { MysteryOrb } from '../entities/MysteryOrb.js';

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
            padding + Math.random() * (width - padding * 2),
            padding + Math.random() * (height - padding * 2),
            effect,
        );
        this.spawnManager.add(orb);
        this.orbs.push(orb);
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.spawnCooldown) {
            this.timer = 0;
            this.spawnOrb();
        }
        const now = performance.now();
        for (const orb of [...this.orbs]) {
            if (now >= orb.expiresAt) this.remove(orb);
            else orb.syncGraphics(now);
        }
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
