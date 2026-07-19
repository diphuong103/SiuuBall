import { GameConfig } from '../config/GameConfig.js';
import { OrbEffectType } from './OrbEffectType.js';

const { effects } = GameConfig.orb;

export const OrbEffects = Object.freeze({
  [OrbEffectType.SCORE_BONUS]: {
    type: OrbEffectType.SCORE_BONUS,
    name: `+${effects.scoreBonus} score`,
    color: 0xffd166,
    weight: 35,
  },
  [OrbEffectType.SLOW_BALL]: {
    type: OrbEffectType.SLOW_BALL,
    name: 'Slow ball',
    color: 0x60a5fa,
    weight: 30,
  },
  [OrbEffectType.SHIELD]: {
    type: OrbEffectType.SHIELD,
    name: 'Shield',
    color: 0x4ade80,
    weight: 20,
    durationMs: effects.shieldDurationMs,
  },
  [OrbEffectType.CLEAR_PROJECTILES]: {
    type: OrbEffectType.CLEAR_PROJECTILES,
    name: 'Clear projectiles',
    color: 0xf472b6,
    weight: 15,
  },
});
