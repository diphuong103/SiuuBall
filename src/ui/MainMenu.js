export class MainMenu {
  constructor() {
    this.el = document.getElementById('overlay-menu');
    this.startButton = document.getElementById('btn-start');
    if (!this.el || !this.startButton) {
      throw new Error('Missing main menu UI elements');
    }
  }

  onStart(callback) {
    this.startButton.addEventListener('click', callback);
  }

  show() {
    this.el.classList.remove('overlay--hidden');
  }

  hide() {
    this.el.classList.add('overlay--hidden');
  }
}
