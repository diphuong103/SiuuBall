import { Application } from "pixi.js";
import { PhysicsWorld } from "./PhysicsWorld.js";
import { createDangerZone } from "../entities/DangerZone.js";
import { Ball } from "../entities/Ball.js";
import { DrawLine } from "../entities/DrawLine.js";
import { InputManager } from "../systems/InputManager.js";
import { ScoreSystem } from "../systems/ScoreSystem.js";
import { DifficultySystem } from "../systems/DifficultySystem.js";
import { GameState } from "./GameState.js";
import { GameplayHUD } from "../ui/GameplayHUD.js";
import { MainMenu } from "../ui/MainMenu.js";
import { GameOverPopup } from "../ui/GameOverPopup.js";
import { SettingPopup } from "../ui/SettingPopup.js";
import { CollisionManager } from "../gameplay/CollisionManager.js";
import { BounceController } from "../gameplay/BounceController.js";
import { GameConfig } from "../config/GameConfig.js";

export class Game {
  constructor() {
    this.gameState = GameState.MENU;
    this.currentLine = null;

    // Lựa chọn của người chơi từ MainMenu
    this.selectedBall = null;
    this.selectedLineColor = 0x4dd0ff; // màu mặc định trùng với DrawLine hiện tại
  }

  async init() {
    const gameContainer = document.getElementById("game-container");
    const { width, height } = GameConfig.viewport;

    // 1. Init Pixi
    this.app = new Application();
    await this.app.init({
      width,
      height,
      backgroundColor: 0x0d0d12,
      antialias: true,
    });
    gameContainer.insertBefore(this.app.canvas, gameContainer.firstChild);

    // 2. Init Physics
    this.physics = new PhysicsWorld();

    // 3. Init Systems
    this.scoreSystem = new ScoreSystem();
    this.difficultySystem = new DifficultySystem();

    // 4. Init Entities
    const { bodies: wallBodies, graphics: wallGraphics } = createDangerZone(
      this.app.screen.width,
      this.app.screen.height,
    );
    wallBodies.forEach((body) => this.physics.add(body));
    this.app.stage.addChild(wallGraphics);

    this.ball = new Ball(this.app.screen.width / 2, this.app.screen.height / 2);
    this.physics.add(this.ball.body);
    this.app.stage.addChild(this.ball.graphics);

    // 5. Gameplay Controllers
    this.collisionManager = new CollisionManager(this.physics.engine);
    this.bounceController = new BounceController(
      this.ball,
      this.difficultySystem,
    );

    this.collisionManager.register({
      onBallHitLine: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        this.scoreSystem.addBouncePoints();
        this.bounceController.maintainSpeed();
      },
      onBallHitDangerZone: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        this.gameOver();
      },
    });

    this.inputManager = new InputManager(this.app.canvas, (rawPoints) => {
      if (this.gameState !== GameState.PLAYING) return;
      this.createNewLine(rawPoints);
    });

    // 6. Init UI
    this.hud = new GameplayHUD(this.app.screen.width);
    this.mainMenu = new MainMenu(this.app.screen.width, this.app.screen.height);
    this.SettingPopup = new SettingPopup(
      this.app.screen.width,
      this.app.screen.height,
    );
    this.gameOverPopup = new GameOverPopup(
      this.app.screen.width,
      this.app.screen.height,
    );

    this.app.stage.addChild(this.hud.container);
    this.app.stage.addChild(this.mainMenu.container);
    this.app.stage.addChild(this.SettingPopup.container);
    this.app.stage.addChild(this.gameOverPopup.container);

    // --- MainMenu events ---
    this.mainMenu.onStart(() => this.startGame());
    this.mainMenu.onSoundSetting(() => this.showSoundSettings());
    this.mainMenu.onSettings(() => this.showSoundSettings()); // Nếu người dùng bấm vào nút SETTINGS to ở dưới Play

    // Chọn bóng qua slideshow trái/phải
    this.mainMenu.onBallChange((ballOption) => {
      this.selectedBall = ballOption;
      this.applyBallAppearance();
    });

    // Chọn màu vẽ
    this.mainMenu.onColorSelect((color) => {
      this.selectedLineColor = color;
    });

    // Lấy lựa chọn mặc định ngay khi khởi tạo (bóng #0, màu #0)
    this.selectedBall = this.mainMenu.getSelectedBall();
    this.selectedLineColor = this.mainMenu.getSelectedColor();
    this.applyBallAppearance();

    this.SettingPopup.onClose(() => this.hideSoundSettings());
  
    this.SettingPopup.onDifficultySelect((level) => {
      // Setup difficulty intervals based on level
      if (level === 'EASY') {
        GameConfig.difficulty.speedIncreaseAmount = 0.2;
        GameConfig.difficulty.maxSpeed = 12;
      } else if (level === 'NORMAL') {
        GameConfig.difficulty.speedIncreaseAmount = 0.5;
        GameConfig.difficulty.maxSpeed = 18;
      } else if (level === 'HARD') {
        GameConfig.difficulty.speedIncreaseAmount = 1.0;
        GameConfig.difficulty.maxSpeed = 25;
      }
      this.difficultySystem.reset();
    });
    this.SettingPopup.onResetScore(() => {
      localStorage.setItem('bd_best_score', '0');
      this.scoreSystem.bestScore = 0;
      this.hud.update({
        score: this.scoreSystem.getScore(),
        bestScore: 0,
        elapsedTime: this.difficultySystem.getElapsedTime(),
      });
      alert('High score reset!');
    });

    this.gameOverPopup.onRestart(() => this.restartGame());
    this.gameOverPopup.onMenu(() => this.goToMenu());

    // 7. Game Loop
    this.app.ticker.add(() => this.update());

    this.gameState = GameState.MENU;
    this.mainMenu.show();
    this.gameOverPopup.hide();
  }

  /**
   * Áp màu/texture của bóng đã chọn vào this.ball hiện tại.
   * Chỉnh sửa phần bên trong tuỳ theo API thật của class Ball.
   */
  applyBallAppearance() {
    if (!this.ball || !this.selectedBall) return;

    if (this.selectedBall.texture && this.ball.setTexture) {
      this.ball.setTexture(this.selectedBall.texture);
    } else if (this.ball.setColor) {
      this.ball.setColor(this.selectedBall.color);
    }
    // Nếu Ball chưa có setTexture/setColor, báo mình gửi Ball.js để nối chính xác.
  }

  createNewLine(rawPoints) {
    this.removeCurrentLine();
    this.currentLine = new DrawLine(rawPoints, this.selectedLineColor);
    this.currentLine.bodies.forEach((body) => this.physics.add(body));
    this.app.stage.addChild(this.currentLine.graphics);
  }

  removeCurrentLine() {
    if (!this.currentLine) return;
    this.currentLine.bodies.forEach((body) => this.physics.remove(body));
    this.app.stage.removeChild(this.currentLine.graphics);
    this.currentLine = null;
  }

  startGame() {
    this.gameState = GameState.PLAYING;
    this.mainMenu.hide();
    this.gameOverPopup.hide();
  }

  gameOver() {
    this.gameState = GameState.GAME_OVER;
    this.scoreSystem.commitHighScoreIfNeeded();
    this.removeCurrentLine();
    this.gameOverPopup.show(
      this.scoreSystem.getScore(),
      this.scoreSystem.getBestScore(),
    );
  }

  resetGameplay() {
    // Xoá bóng cũ
    this.physics.remove(this.ball.body);
    this.app.stage.removeChild(this.ball.graphics);

    // Tạo bóng mới
    this.ball = new Ball(this.app.screen.width / 2, this.app.screen.height / 2);
    this.physics.add(this.ball.body);
    this.app.stage.addChild(this.ball.graphics);

    this.bounceController.ball = this.ball;

    // Áp lại appearance đã chọn cho bóng mới
    this.applyBallAppearance();

    // Xoá line đang vẽ
    this.removeCurrentLine();

    // Reset điểm và độ khó
    this.scoreSystem.reset();
    this.difficultySystem.reset();
  }

  restartGame() {
    this.resetGameplay();
    this.startGame();
  }

  goToMenu() {
    this.gameState = GameState.MENU;
    this.gameOverPopup.hide();
    this.mainMenu.show();
    this.resetGameplay();
  }

  showSoundSettings() {
    this.SettingPopup.show();
  }

  hideSoundSettings() {
    this.SettingPopup.hide();
  }

  update() {
    if (this.gameState !== GameState.PLAYING) return;
    const deltaSeconds = this.app.ticker.deltaMS / 1000;

    this.difficultySystem.update(deltaSeconds);
    this.physics.update(this.app.ticker.deltaMS);
    this.ball.syncGraphics();

    if (this.currentLine && this.currentLine.isExpired(performance.now())) {
      this.removeCurrentLine();
    }

    this.scoreSystem.addTimeElapsed(deltaSeconds);
    this.hud.update({
      score: this.scoreSystem.getScore(),
      bestScore: this.scoreSystem.getBestScore(),
      elapsedTime: this.difficultySystem.getElapsedTime(),
    });
  }

  destroy() {
    this.collisionManager.unregister();
    this.app.destroy(true, { children: true });
  }
}