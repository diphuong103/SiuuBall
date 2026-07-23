// Định nghĩa logic và hành vi của các hiệu ứng quả cầu trong trò chơi

import { OrbEffects } from "./OrbEffects.js";
import { OrbEffectType } from "./OrbEffectType.js";
import { GameConfig } from "../config/GameConfig.js";
import Matter from "matter-js";
import { Random } from "../utils/Random.js";

export class OrbEffectSystem {
  constructor(game) {
    this.game = game;
    this.effects = [];
  }

  rollEffect() {
    return this._weightedPick(Object.values(OrbEffects));
  }

  pickSpawnEffect() {
    const first = this.rollEffect();
    if (first?.type === OrbEffectType.MYSTERY) {
      return this.resolveMysteryEffect();
    }
    return first;
  }

  resolveMysteryEffect() {
    const pool = Object.values(OrbEffects).filter(
      (effect) => effect.type !== OrbEffectType.MYSTERY,
    );
    return this._weightedPick(pool);
  }

  _weightedPick(pool) {
    const totalWeight = pool.reduce(
      (total, effect) => total + effect.weight,
      0,
    );
    let roll = Random.float(0, totalWeight);
    for (const effect of pool) {
      roll -= effect.weight;
      if (roll <= 0) return effect;
    }
    return pool[pool.length - 1];
  }

  applyEffect(effect) {
    if (!effect) return null;

    if (effect.type === OrbEffectType.MYSTERY) {
      return this.applyEffect(this.resolveMysteryEffect());
    }

    // Hiệu ứng có duration: nhặt lại thì làm mới thời gian thay vì cộng dồn
    const now = performance.now();
    const previous = this.effects.find(
      (active) => active.effect.type === effect.type,
    );
    if (previous) {
      previous.expiresAt = now + (effect.durationMs || 0);
      previous.appliedAt = now;
      if (effect.type === OrbEffectType.SHIELD) this.game.setShield?.(true);
      this.game.effectToast?.show(effect);
      return effect;
    }

    const cfg = GameConfig.orb.effects;

    switch (effect.type) {
      case OrbEffectType.DOUBLE_SCORE:
        this.game.scoreSystem?.setMultiplier?.(2);
        break;

      case OrbEffectType.SLOW: {
        this.game.difficultySystem?.setSpeedModifier?.(
          OrbEffectType.SLOW,
          cfg.slowBallMultiplier,
        );
        this.game.difficultySystem?.update(0);
        this.game.requestBallSpeedSync?.();
        break;
      }

      case OrbEffectType.SHIELD:
        this.game.setShield?.(true);
        break;

      case OrbEffectType.SPEED_UP: {
        this.game.difficultySystem?.setSpeedModifier?.(
          OrbEffectType.SPEED_UP,
          cfg.speedUpMultiplier,
        );
        this.game.difficultySystem?.update(0);
        this.game.requestBallSpeedSync?.();
        break;
      }

      case OrbEffectType.PROJECTILE: {
        const count = cfg.projectileSpawnCount ?? 1;
        const ball = this.game.ball;
        for (let i = 0; i < count; i++) {
          this.game.playSound?.("bullets");
          this.game.projectileController?.spawnProjectile(ball.body.position);
        }
        break;
      }

      case OrbEffectType.GRAVITY_DOWN: {
        const speed = this.game.difficultySystem.getCurrentSpeed();
        if (this.game.ball?.body) {
          Matter.Body.setVelocity(this.game.ball.body, {
            x: 0,
            y: speed,
          });
        }
        break;
      }

      case OrbEffectType.GRAVITY_UP: {
        const speed = this.game.difficultySystem.getCurrentSpeed();
        if (this.game.ball?.body) {
          Matter.Body.setVelocity(this.game.ball.body, {
            x: 0,
            y: -speed,
          });
        }
        break;
      }
    }

    if (effect.durationMs) {
      this.effects.push({
        effect,
        appliedAt: now,
        expiresAt: now + effect.durationMs,
      });
    }

    this.game.effectToast?.show(effect);
    return effect;
  }

  update(now = performance.now()) {
    const expired = this.effects.filter((active) => now >= active.expiresAt);
    this.effects = this.effects.filter((active) => now < active.expiresAt);
    for (const active of expired) this._revert(active.effect.type);
  }

  getActiveEffects(now = performance.now()) {
    return this.effects.map((active) => ({
      ...active.effect,
      remainingTimeMs: Math.max(0, active.expiresAt - now),
    }));
  }

  consumeShield() {
    const index = this.effects.findIndex(
      (active) => active.effect.type === OrbEffectType.SHIELD,
    );
    if (index < 0) return false;

    this.effects.splice(index, 1);
    this._revert(OrbEffectType.SHIELD);
    return true;
  }

  clear() {
    const activeEffects = this.effects;
    this.effects = [];
    for (const active of activeEffects) this._revert(active.effect.type);
  }

  _revert(type) {
    switch (type) {
      case OrbEffectType.SHIELD:
        this.game.setShield?.(false);
        break;
      case OrbEffectType.DOUBLE_SCORE:
        this.game.scoreSystem?.setMultiplier?.(1);
        break;
      case OrbEffectType.SLOW:
      case OrbEffectType.SPEED_UP:
        this.game.difficultySystem?.clearSpeedModifier?.(type);
        this.game.difficultySystem?.update(0);
        this.game.requestBallSpeedSync?.();
        break;
      case OrbEffectType.GRAVITY_DOWN:
      case OrbEffectType.GRAVITY_UP:
        break;
    }
  }
}
