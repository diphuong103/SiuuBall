export class GameOverPopup {
  constructor() {
    this.el = document.getElementById('overlay-gameover');
    this.scoreEl = document.getElementById('go-score');
    this.bestScoreEl = document.getElementById('go-best');
    this.restartButton = document.getElementById('btn-restart');
    if (!this.el || !this.scoreEl || !this.bestScoreEl || !this.restartButton) {
      throw new Error('Missing game over UI elements');
    }
  }

  onRestart(callback) {
    this.restartButton.addEventListener('click', callback);
  }

  show(score, bestScore) {
    this.scoreEl.textContent = Math.floor(score);
    this.bestScoreEl.textContent = Math.floor(bestScore);
    this.el.classList.remove('overlay--hidden');
  }

  hide() {
    this.el.classList.add('overlay--hidden');
  }
}
