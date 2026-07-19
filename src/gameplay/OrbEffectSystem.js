import { OrbEffects } from './OrbEffects.js';
import { OrbEffectType } from './OrbEffectType.js';
import { GameConfig } from '../config/GameConfig.js';
import Matter from 'matter-js';

export class OrbEffectSystem {

    constructor(game) {

        this.game = game;

        this.effects = [];
    }

    rollEffect() {
        const available = Object.values(OrbEffects);
        const totalWeight = available.reduce((total, effect) => total + effect.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const effect of available) {
            roll -= effect.weight;
            if (roll <= 0) return effect;
        }

        return available[available.length - 1];
    }

    applyEffect(effect) {
        if (!effect) return null;

        // Re-collecting a timed effect refreshes its duration instead of stacking it.
        const previous = this.effects.find((active) => active.effect.type === effect.type);
        if (previous) {
            previous.expiresAt = performance.now() + (effect.durationMs || 0);
            return effect;
        }

        if (effect.type === OrbEffectType.SCORE_BONUS) {
            this.game.scoreSystem?.addPoints(GameConfig.orb.effects.scoreBonus);
        } else if (effect.type === OrbEffectType.SLOW_BALL) {
            const velocity = this.game.ball.body.velocity;
            Matter.Body.setVelocity(this.game.ball.body, {
                x: velocity.x * GameConfig.orb.effects.slowBallMultiplier,
                y: velocity.y * GameConfig.orb.effects.slowBallMultiplier,
            });
        } else if (effect.type === OrbEffectType.SHIELD) {
            if (this.game.setShield) this.game.setShield(true);
        } else if (effect.type === OrbEffectType.CLEAR_PROJECTILES) {
            this.game.projectileController?.clear();
        }

        if (effect.durationMs) {
            this.effects.push({ effect, expiresAt: performance.now() + effect.durationMs });
        }
        this.game.effectToast?.show(effect);
        return effect;
    }

    update(now = performance.now()) {
        this.effects = this.effects.filter((active) => {
            if (now < active.expiresAt) return true;
            if (active.effect.type === OrbEffectType.SHIELD) {
                if (this.game.setShield) this.game.setShield(false);
            }
            return false;
        });
    }

    clear() {
        for (const active of this.effects) {
            if (active.effect.type === OrbEffectType.SHIELD) {
                if (this.game.setShield) this.game.setShield(false);
            }
        }
        this.effects = [];
    }

}
