// Định nghĩa logic và hành vi của các hiệu ứng quả cầu trong trò chơi

import { OrbEffects } from "./OrbEffects.js";
import { OrbEffectType } from "./OrbEffectType.js";
import { GameConfig } from "../config/GameConfig.js";
import Matter from "matter-js";

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
    let roll = Math.random() * totalWeight;
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
    const previous = this.effects.find(
      (active) => active.effect.type === effect.type,
    );
    if (previous) {
      previous.expiresAt = performance.now() + (effect.durationMs || 0);
      this.game.effectToast?.show(effect);
      return effect;
    }

    const cfg = GameConfig.orb.effects;

    switch (effect.type) {
      case OrbEffectType.DOUBLE_SCORE:
        this.game.scoreSystem?.setMultiplier?.(2);
        break;

      case OrbEffectType.SLOW: {
        const v = this.game.ball.body.velocity;
        Matter.Body.setVelocity(this.game.ball.body, {
          x: v.x * cfg.slowBallMultiplier,
          y: v.y * cfg.slowBallMultiplier,
        });
        break;
      }

      case OrbEffectType.SHIELD:
        this.game.setShield?.(true);
        break;

      case OrbEffectType.SPEED_UP: {
        const v = this.game.ball.body.velocity;
        Matter.Body.setVelocity(this.game.ball.body, {
          x: v.x * cfg.speedUpMultiplier,
          y: v.y * cfg.speedUpMultiplier,
        });
        break;
      }

      case OrbEffectType.PROJECTILE: {
        const count = cfg.projectileSpawnCount ?? 1;
        const ball = this.game.ball;
        for (let i = 0; i < count; i++) {
          this.game.projectileController?.spawnProjectile(ball.body.position);
        }
        break;
      }

      case OrbEffectType.GRAVITY_DOWN:
        this.game.setGravityScale?.(cfg.gravityDownMultiplier);
        break;

      case OrbEffectType.GRAVITY_UP:
        this.game.setGravityScale?.(cfg.gravityUpMultiplier);
        break;
    }

    if (effect.durationMs) {
      this.effects.push({
        effect,
        expiresAt: performance.now() + effect.durationMs,
      });
    }

    this.game.effectToast?.show(effect);
    return effect;
  }

  update(now = performance.now()) {
    this.effects = this.effects.filter((active) => {
      if (now < active.expiresAt) return true;
      this._revert(active.effect.type);
      return false;
    });
  }

  clear() {
    for (const active of this.effects) this._revert(active.effect.type);
    this.effects = [];
  }

  _revert(type) {
    switch (type) {
      case OrbEffectType.SHIELD:
        this.game.setShield?.(false);
        break;
      case OrbEffectType.DOUBLE_SCORE:
        this.game.scoreSystem?.setMultiplier?.(1);
        break;
      case OrbEffectType.GRAVITY_DOWN:
      case OrbEffectType.GRAVITY_UP:
        this.game.setGravityScale?.(GameConfig.physics.gravity);
        break;
    }
  }
}
