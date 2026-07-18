/**
 * Quản lý tập trung việc cập nhật giao diện HUD trong lúc chơi.
 * main.js không thao tác DOM trực tiếp nữa - mọi thứ đi qua class này (SRS mục 6.2).
 */
export class HUD {
  constructor() {
    this.scoreEl = document.getElementById('hud-score');
    this.highScoreEl = document.getElementById('hud-highscore');
    this.speedEl = document.getElementById('hud-speed');
  }

  updateScore(score) {
    this.scoreEl.textContent = `Điểm: ${Math.floor(score)}`;
  }

  updateHighScore(highScore) {
    this.highScoreEl.textContent = `Kỷ lục: ${Math.floor(highScore)}`;
  }

  updateSpeedMultiplier(multiplier) {
    this.speedEl.textContent = `Tốc độ: x${multiplier.toFixed(1)}`;
  }
}