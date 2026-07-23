import { GameConfig } from '../config/GameConfig.js';

export class DifficultySystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.elapsedTime = 0;
    this.currentSpeed = GameConfig.ball.startSpeed;
    this.speedModifiers = new Map();
  }

  update(deltaSeconds) {
    this.elapsedTime += deltaSeconds;

    const { speedIncreaseInterval, speedIncreaseAmount, maxSpeed } = GameConfig.difficulty;

    const level = Math.floor(this.elapsedTime / speedIncreaseInterval);

    const baseSpeed = Math.min(
      GameConfig.ball.startSpeed + level * speedIncreaseAmount,
      maxSpeed
    );
    const modifier = [...this.speedModifiers.values()].reduce(
      (total, value) => total * value,
      1,
    );
    this.currentSpeed = baseSpeed * modifier;
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }

  getElapsedTime() {
    return this.elapsedTime;
  }

  setSpeedModifier(key, multiplier) {
    this.speedModifiers.set(key, multiplier);
  }

  clearSpeedModifier(key) {
    this.speedModifiers.delete(key);
  }
}

