import test from "node:test";
import assert from "node:assert/strict";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
};

const { ScoreSystem } = await import("../src/systems/ScoreSystem.js");

test("score applies bounce, timed score, and Survival multiplier", () => {
  storage.clear();
  const score = new ScoreSystem();

  score.addBouncePoints();
  score.setEventMultiplier(2);
  score.addPoints(50);
  score.addTimeElapsed(1);

  assert.equal(score.getScore(), 112);
});

test("score reset clears active multipliers and persists a new high score", () => {
  storage.clear();
  const score = new ScoreSystem();
  score.addPoints(42);

  assert.equal(score.commitHighScoreIfNeeded(), true);
  assert.equal(storage.get("bd_best_score"), "42");

  score.setMultiplier(2);
  score.setEventMultiplier(2);
  score.reset();
  score.addBouncePoints();

  assert.equal(score.getScore(), 10);
});
