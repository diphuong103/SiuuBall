// Quản lý việc tạo và xử lý các quả cầu trong trò chơi
import { GameConfig } from "../config/GameConfig.js";
import { MysteryOrb } from "../entities/MysteryOrb.js";
import { Random } from "../utils/Random.js";
import { OrbEffectType } from "./OrbEffectType.js";

export class OrbController {
  constructor(spawnManager, effectSystem, onRareSpawn) {
    this.spawnManager = spawnManager;
    this.effectSystem = effectSystem;
    this.onRareSpawn = onRareSpawn;
    this.effectSpawnCooldown = GameConfig.orb.spawnInterval;
    this.scoreSpawnCooldown = GameConfig.scoreOrb.spawnInterval;
    this.effectTimer = 0;
    this.scoreTimer = 0;
    this.orbs = [];
    this.scoreOrbs = [];
  }

  spawnOrb() {
    const padding = GameConfig.orb.edgePadding;
    const width = this.spawnManager.width;
    const height = this.spawnManager.height;
    const isRare = Random.float(0, 1) < GameConfig.gameplayEvents.rareOrbChance;
    const effect = isRare
      ? { type: OrbEffectType.MYSTERY, name: "Mystery", color: GameConfig.orb.color }
      : this.effectSystem.pickSpawnEffect();
    const orb = new MysteryOrb(
      padding + Random.float(0, width - padding * 2),
      padding + Random.float(0, height - padding * 2),
      effect,
    );
    this.spawnManager.add(orb);
    this.orbs.push(orb);
    if (isRare) this.onRareSpawn?.(orb);
  }

  spawnScoreOrb() {
    const padding = GameConfig.orb.edgePadding;
    const { width, height } = this.spawnManager;
    const orb = new MysteryOrb(
      padding + Random.float(0, width - padding * 2),
      padding + Random.float(0, height - padding * 2),
      null,
      this._pickScoreValue(),
    );
    this.spawnManager.add(orb);
    this.scoreOrbs.push(orb);
  }

  _pickScoreValue() {
    const values = GameConfig.scoreOrb.values;
    let roll = Random.float(0, values.reduce((total, item) => total + item.weight, 0));
    for (const item of values) {
      roll -= item.weight;
      if (roll <= 0) return item.value;
    }
    return values[values.length - 1].value;
  }

  update(deltaTime) {
    this.effectTimer += deltaTime;
    this.scoreTimer += deltaTime;
    if (this.effectTimer >= this.effectSpawnCooldown) {
      this.effectTimer -= this.effectSpawnCooldown;
      if (this.orbs.length < GameConfig.orb.maxActive) this.spawnOrb();
    }
    if (this.scoreTimer >= this.scoreSpawnCooldown) {
      this.scoreTimer -= this.scoreSpawnCooldown;
      if (this.scoreOrbs.length < GameConfig.scoreOrb.maxActive) this.spawnScoreOrb();
    }
    const now = performance.now();
    for (const orb of [...this.orbs, ...this.scoreOrbs]) {
      if (now >= orb.expiresAt) this.remove(orb);
      else orb.syncGraphics(now);
    }
  }

  reset() {
    this.clear();
    this.effectTimer = 0;
    this.scoreTimer = 0;
  }

  remove(orb) {
    this.spawnManager.remove(orb);
    const effectIndex = this.orbs.indexOf(orb);
    if (effectIndex >= 0) this.orbs.splice(effectIndex, 1);
    const scoreIndex = this.scoreOrbs.indexOf(orb);
    if (scoreIndex >= 0) this.scoreOrbs.splice(scoreIndex, 1);
  }

  handleCollision(ball, orb) {
    if (!orb?.isActive) return;
    const effect = orb.effect ?? this.effectSystem.pickSpawnEffect();
    this.remove(orb);
    return this.effectSystem.applyEffect(effect);
  }

  clear() {
    for (const orb of [...this.orbs]) this.remove(orb);
    for (const orb of [...this.scoreOrbs]) this.remove(orb);
  }
}
