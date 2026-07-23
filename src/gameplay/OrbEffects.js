// Chứa cấu hình các hiệu ứng quả cầu: tên hiển thị, màu sắc, trọng số rơi, thời lượng

import { GameConfig } from '../config/GameConfig.js';
import { OrbEffectType } from './OrbEffectType.js';

const { effects } = GameConfig.orb;

export const OrbEffects = Object.freeze({
  [OrbEffectType.DOUBLE_SCORE]: {
    type: OrbEffectType.DOUBLE_SCORE,
    name: 'x2 Score',
    kind: 'buff',
    color: 0xffd166,
    weight: 14,
    durationMs: effects.doubleScoreDurationMs,
  },
  [OrbEffectType.SLOW]: {
    type: OrbEffectType.SLOW,
    name: 'Slow ball',
    kind: 'buff',
    color: 0x60a5fa,
    weight: 14,
    durationMs: effects.slowBallDurationMs,
  },
  [OrbEffectType.SHIELD]: {
    type: OrbEffectType.SHIELD,
    name: 'Shield',
    kind: 'buff',
    color: 0x4ade80,
    weight: 14,
    durationMs: effects.shieldDurationMs,
  },
  [OrbEffectType.SPEED_UP]: {
    type: OrbEffectType.SPEED_UP,
    name: 'Speed up!',
    kind: 'debuff',
    color: 0xf97316,
    weight: 14,
    durationMs: effects.speedUpDurationMs,
  },
  [OrbEffectType.PROJECTILE]: {
    type: OrbEffectType.PROJECTILE,
    name: 'Bullet Attack!',
    kind: 'debuff',
    color: 0xff4d6d,
    weight: 14,
  },
  [OrbEffectType.GRAVITY_DOWN]: {
    type: OrbEffectType.GRAVITY_DOWN,
    name: 'Launch Down',
    kind: 'debuff',
    color: 0x7c3aed,
    weight: 14,
  },
  [OrbEffectType.GRAVITY_UP]: {
    type: OrbEffectType.GRAVITY_UP,
    name: 'Launch Up',
    kind: 'debuff',
    color: 0x38bdf8,
    weight: 14,
  },
  [OrbEffectType.MYSTERY]: {
    type: OrbEffectType.MYSTERY,
    name: 'Mystery',
    kind: 'mystery',
    color: GameConfig.orb.color,
    weight: 10,
  },
});
