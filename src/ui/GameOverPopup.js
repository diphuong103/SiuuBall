import { Container, Text, Graphics, TextStyle } from 'pixi.js';
import gameOverSfx from '../assets/audio/sfx/game_over.mp3';

export class GameOverPopup {
  constructor(screenWidth, screenHeight) {
    this.container = new Container();
    this._gameOverSfx = new Audio(gameOverSfx);
    this._gameOverSfx.volume = 0.8;

    // ===== Nền ngoài cùng: vẫn mờ (translucent) =====
    const bg = new Graphics();
    bg.rect(0, 0, screenWidth, screenHeight);
    bg.fill({ color: 0x000000, alpha: 0.8 });
    bg.eventMode = 'static'; // Chặn click xuyên qua nền
    this.container.addChild(bg);

    // ===== Khung (panel) đặc bao quanh nội dung =====
    const panelWidth = 360;
    const panelHeight = 420;
    const panelX = screenWidth / 2 - panelWidth / 2;
    const panelY = screenHeight / 2 - panelHeight / 2;

    const panel = new Graphics();
    panel.roundRect(panelX, panelY, panelWidth, panelHeight, 24);
    panel.fill({ color: 0x1a1a1a, alpha: 0.95 }); // đặc vừa phải, đồng bộ các popup khác
    panel.stroke({ width: 3, color: 0xff4444, alpha: 0.8 }); // viền nhấn nhá theo tông "Game Over"
    this.container.addChild(panel);

    // Tâm nội dung dựa theo panel thay vì toàn màn hình
    const centerX = screenWidth / 2;
    const contentTop = panelY + 60;

    // Title text
    const titleStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 44,
      fontWeight: 'bold',
      fill: 0xff4444,
      align: 'center',
    });
    const titleText = new Text({ text: 'GAME OVER', style: titleStyle });
    titleText.anchor.set(0.5);
    titleText.position.set(centerX, contentTop);
    this.container.addChild(titleText);

    // Score text
    const statStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
      align: 'center',
    });
    this.scoreText = new Text({ text: 'Score: 0', style: statStyle });
    this.scoreText.anchor.set(0.5);
    this.scoreText.position.set(centerX, contentTop + 80);
    this.container.addChild(this.scoreText);

    this.bestScoreText = new Text({ text: 'Best: 0', style: statStyle });
    this.bestScoreText.anchor.set(0.5);
    this.bestScoreText.position.set(centerX, contentTop + 120);
    this.container.addChild(this.bestScoreText);

    // ===== Restart button =====
    this.restartButton = new Container();

    const btnBg = new Graphics();
    btnBg.roundRect(-80, -30, 160, 60, 15);
    btnBg.fill(0x4CAF50);
    this.restartButton.addChild(btnBg);

    const btnText = new Text({
      text: 'RESTART',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffffff,
      })
    });
    btnText.anchor.set(0.5);
    this.restartButton.addChild(btnText);

    this.restartButton.position.set(centerX, contentTop + 200);
    this.restartButton.eventMode = 'static';
    this.restartButton.cursor = 'pointer';

    this.restartButton.on('pointerover', () => { btnBg.tint = 0x66d17a; });
    this.restartButton.on('pointerout', () => { btnBg.tint = 0xffffff; });

    this.container.addChild(this.restartButton);

    // ===== Menu button =====
    this.menuButton = new Container();

    const menuBg = new Graphics();
    menuBg.roundRect(-80, -30, 160, 60, 15);
    menuBg.fill(0x3b82f6);
    this.menuButton.addChild(menuBg);

    const menuText = new Text({
      text: 'MENU',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffffff,
      }),
    });
    menuText.anchor.set(0.5);
    this.menuButton.addChild(menuText);

    // Đặt dưới nút Restart
    this.menuButton.position.set(centerX, contentTop + 280);
    this.menuButton.eventMode = 'static';
    this.menuButton.cursor = 'pointer';

    this.menuButton.on('pointerover', () => { menuBg.tint = 0x6fa8ff; });
    this.menuButton.on('pointerout', () => { menuBg.tint = 0xffffff; });

    this.container.addChild(this.menuButton);

    this.hide();
  }

  onRestart(callback) {
    this.restartButton.on('pointerdown', callback);
  }

  onMenu(callback) {
    this.menuButton.on('pointerdown', callback);
  }

  show(score, bestScore) {
    this.scoreText.text = `Score: ${Math.floor(score)}`;
    this.bestScoreText.text = `Best: ${Math.floor(bestScore)}`;
    this.container.visible = true;
    this._gameOverSfx.currentTime = 0;
    this._gameOverSfx.play().catch(() => {});
  }

  hide() {
    this.container.visible = false;
  }
}