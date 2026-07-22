import { GameConfig } from '../config/GameConfig.js';

export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.bestScore = Number(localStorage.getItem('bd_best_score')) || 0;
    this.multiplier = 1;
    this.eventMultiplier = 1;
  }

  getBestScore() {
    return this.bestScore;
  }

  getScore() {
    return this.score;
  }

  setMultiplier(multiplier) {
    this.multiplier = multiplier;
  }

  setEventMultiplier(multiplier) {
    this.eventMultiplier = multiplier;
  }

  addBouncePoints() {
    this.score += GameConfig.scoring.pointsPerBounce * this.multiplier * this.eventMultiplier;
  }

  addPoints(points) {
    this.score += points * this.multiplier * this.eventMultiplier;
  }

  addTimeElapsed(deltaSeconds) {
    this.score += GameConfig.scoring.pointsPerSecond * deltaSeconds * this.multiplier * this.eventMultiplier;
  }

  reset() {
    this.score = 0;
    this.multiplier = 1;
    this.eventMultiplier = 1;
  }

  commitHighScoreIfNeeded() {
    const rounded = Math.floor(this.score);
    if (rounded > this.bestScore) {
      this.bestScore = rounded;
      localStorage.setItem('bd_best_score', String(this.bestScore));
      return true;
    }
    return false;
  }
}
