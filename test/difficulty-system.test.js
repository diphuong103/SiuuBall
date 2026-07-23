import test from "node:test";
import assert from "node:assert/strict";

const { GameConfig } = await import("../src/config/GameConfig.js");
const { DifficultySystem } = await import("../src/systems/DifficultySystem.js");

test("difficulty increases speed and applies then removes speed modifiers", () => {
  const original = { ...GameConfig.difficulty };
  try {
    GameConfig.difficulty.speedIncreaseInterval = 6;
    GameConfig.difficulty.speedIncreaseAmount = 0.1;
    GameConfig.difficulty.maxSpeed = 20;

    const difficulty = new DifficultySystem();
    difficulty.update(12);
    assert.equal(difficulty.getCurrentSpeed(), 3.2);

    difficulty.setSpeedModifier("slow", 0.65);
    difficulty.update(0);
    assert.equal(difficulty.getCurrentSpeed(), 2.08);

    difficulty.clearSpeedModifier("slow");
    difficulty.update(0);
    assert.equal(difficulty.getCurrentSpeed(), 3.2);
  } finally {
    Object.assign(GameConfig.difficulty, original);
  }
});
