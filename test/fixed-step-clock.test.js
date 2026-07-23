import test from "node:test";
import assert from "node:assert/strict";
import { FixedStepClock } from "../src/core/FixedStepClock.js";

const config = {
  fixedStepMs: 1000 / 60,
  maxFrameDeltaMs: 50,
  maxStepsPerFrame: 3,
};

test("fixed-step clock accumulates sub-frame deltas into a 60 Hz step", () => {
  const clock = new FixedStepClock(config);

  assert.deepEqual(clock.advance(8), { deltaMs: 8, steps: 0 });
  assert.deepEqual(clock.advance(9), { deltaMs: 9, steps: 1 });
});

test("fixed-step clock clamps frame spikes and limits catch-up work", () => {
  const clock = new FixedStepClock(config);
  const result = clock.advance(500);

  assert.equal(result.deltaMs, 50);
  assert.equal(result.steps, 3);
  assert.equal(clock.accumulatorMs, 0);
});
