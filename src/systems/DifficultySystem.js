import { GameConfig } from '../config/GameConfig.js';

export class DifficultySystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.elapsedTime = 0;
    this.currentSpeed = GameConfig.ball.startSpeed;
    this.lastLevel = 0;
  }

  update(deltaSeconds) {
    this.elapsedTime += deltaSeconds;

    const { speedIncreaseInterval, speedIncreaseAmount, maxSpeed } = GameConfig.difficulty;

    const level = Math.floor(this.elapsedTime / speedIncreaseInterval);

    // Chỉ log khi level thực sự thay đổi (không spam mỗi frame)
    if (GameConfig.debug.logDifficulty && level !== this.lastLevel) {
      this.lastLevel = level;
      console.log(`[Difficulty] Level ${level + 1} — speed: ${Math.min(GameConfig.ball.startSpeed + level * speedIncreaseAmount, maxSpeed).toFixed(1)
        }`);
    }

    this.currentSpeed = Math.min(
      GameConfig.ball.startSpeed + level * speedIncreaseAmount,
      maxSpeed
    );
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }

  getElapsedTime() {
    return this.elapsedTime;
  }
}

