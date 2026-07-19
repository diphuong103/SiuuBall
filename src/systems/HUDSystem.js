export class HUDSystem {
    constructor() {
        this.scoreEl = document.getElementById("score");  // Lấy element score từ index.html
        this.bestEl = document.getElementById("best-score"); // Lấy element best-score từ index.html
        this.timeEl = document.getElementById("time"); // Lấy element time từ index.html
    }

    update({ score, bestScore, elapsedTime }) {
        this.scoreEl.textContent = Math.floor(score);
        this.bestEl.textContent = Math.floor(bestScore);
        this.timeEl.textContent = Math.floor(elapsedTime);
    }
}