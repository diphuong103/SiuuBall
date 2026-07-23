import test from "node:test";
import assert from "node:assert/strict";

const { OrbEffectSystem } = await import("../src/gameplay/OrbEffectSystem.js");
const { OrbEffects } = await import("../src/gameplay/OrbEffects.js");

test("Shield is consumed after blocking one projectile", () => {
  const game = {
    shielded: false,
    setShield(enabled) { this.shielded = enabled; },
    setGravityScale() {},
    effectToast: { show() {} },
  };
  const effects = new OrbEffectSystem(game);

  effects.applyEffect(OrbEffects.SHIELD);
  assert.equal(game.shielded, true);
  assert.equal(effects.getActiveEffects().length, 1);

  assert.equal(effects.consumeShield(), true);
  assert.equal(game.shielded, false);
  assert.equal(effects.getActiveEffects().length, 0);
  assert.equal(effects.consumeShield(), false);
});
