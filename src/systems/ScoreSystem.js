import { GameConfig } from '../config/GameConfig.js';

export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.bestScore = Number(localStorage.getItem('bd_best_score')) || 0;
  }

  getBestScore() {
    return this.bestScore;
  }

  getScore() {
    return this.score;
  }

  addBouncePoints() {
    this.score += GameConfig.scoring.pointsPerBounce;
  }

  addPoints(points) {
    this.score += points;
  }

  addTimeElapsed(deltaSeconds) {
    this.score += GameConfig.scoring.pointsPerSecond * deltaSeconds;
  }

  reset() {
    this.score = 0;
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
