import { GameConfig } from '../config/GameConfig.js';

export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.highScore = Number(localStorage.getItem('bd_high_score')) || 0;
  }

  addBouncePoints() {
    this.score += GameConfig.scoring.pointsPerBounce;
  }

  addTimeElapsed(deltaSeconds) {
    this.score += GameConfig.scoring.pointsPerSecond * deltaSeconds;
  }

  reset() {
    this.score = 0;
  }

  commitHighScoreIfNeeded() {
    const rounded = Math.floor(this.score);
    if (rounded > this.highScore) {
      this.highScore = rounded;
      localStorage.setItem('bd_high_score', String(this.highScore));
      return true;
    }
    return false;
  }
}