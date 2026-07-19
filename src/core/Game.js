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
import { SettingsPopup } from "../ui/SettingsPopup.js";
import { CollisionManager } from "../gameplay/CollisionManager.js";
import { BounceController } from "../gameplay/BounceController.js";
import { GameConfig } from "../config/GameConfig.js";
import { Container } from "pixi.js";
import { SpawnManager } from "../systems/SpawnManager.js";
import { OrbEffectSystem } from "../gameplay/OrbEffectSystem.js";
import { OrbController } from "../gameplay/OrbController.js";
import { ProjectileController } from "../gameplay/ProjectileController.js";
import { EffectToast } from "../ui/EffectToast.js";

export class Game {
  constructor() {
    this.gameState = GameState.MENU;
    this.currentLine = null;
    this.isShielded = false;

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

    // 1.5. Layer riêng cho gameplay (danger zone, ball, line)
    // Luôn nằm DƯỚI mọi UI vì chỉ add vào stage đúng 1 lần, ngay từ đầu.
    this.gameplayLayer = new Container();
    this.app.stage.addChild(this.gameplayLayer);

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
    this.gameplayLayer.addChild(wallGraphics);

    this.ball = new Ball(this.app.screen.width / 2, this.app.screen.height / 2);
    this.physics.add(this.ball.body);
    this.gameplayLayer.addChild(this.ball.graphics);

    // 5. Gameplay Controllers
    this.collisionManager = new CollisionManager(this.physics.engine);
    this.bounceController = new BounceController(
      this.ball,
      this.difficultySystem,
    );
    this.spawnManager = new SpawnManager(
      this.physics,
      this.gameplayLayer,
      this.app.screen.width,
      this.app.screen.height,
    );
    this.effectSystem = new OrbEffectSystem(this);
    this.orbController = new OrbController(this.spawnManager, this.effectSystem);
    this.projectileController = new ProjectileController(
      this.spawnManager,
      () => this.ball,
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
      onBallHitOrb: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        const orb = this.findSpawnedEntity(pair, 'mystery-orb', this.orbController.orbs);
        this.orbController.handleCollision(this.ball, orb);
      },
      onBallHitProjectile: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        const projectile = this.findSpawnedEntity(pair, 'projectile', this.projectileController.projectiles);
        if (!projectile) return;
        this.projectileController.handleCollision(projectile);
        if (!this.isShielded) this.gameOver();
      },
    });

    this.inputManager = new InputManager(this.app.canvas, (rawPoints) => {
      if (this.gameState !== GameState.PLAYING) return;
      this.createNewLine(rawPoints);
    });

    // 6. Init UI (add SAU gameplayLayer nên luôn nằm trên)
    this.hud = new GameplayHUD(this.app.screen.width);
    this.effectToast = new EffectToast(this.app.screen.width);
    this.mainMenu = new MainMenu(this.app.screen.width, this.app.screen.height);
    this.SettingsPopup = new SettingsPopup(
      this.app.screen.width,
      this.app.screen.height,
    );
    this.gameOverPopup = new GameOverPopup(
      this.app.screen.width,
      this.app.screen.height,
    );

    this.app.stage.addChild(this.hud.container);
    this.app.stage.addChild(this.effectToast.container);
    this.app.stage.addChild(this.mainMenu.container);
    this.app.stage.addChild(this.SettingsPopup.container);
    this.app.stage.addChild(this.gameOverPopup.container);

    // --- MainMenu events ---
    this.mainMenu.onStart(() => this.startGame());
    this.mainMenu.onSoundSetting(() => this.showSoundSettings());
    this.mainMenu.onSettings(() => this.showSoundSettings());

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

    this.SettingsPopup.onClose(() => this.hideSoundSettings());

    this.SettingsPopup.onDifficultySelect((level) => {
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

    this.SettingsPopup.onResetScore(() => {
      localStorage.setItem('bd_best_score', '0');
      this.scoreSystem.bestScore = 0;
      this.hud.update({
        score: this.scoreSystem.getScore(),
        bestScore: 0,
        elapsedTime: this.difficultySystem.getElapsedTime(),
      });
      // SettingsPopup tự hiện toast, không cần alert() nữa
    });

    this.gameOverPopup.onRestart(() => this.restartGame());
    this.gameOverPopup.onMenu(() => this.goToMenu());

    // 7. Game Loop
    this.app.ticker.add(() => this.update());

    this.gameState = GameState.MENU;
    this.mainMenu.show();
    this.gameOverPopup.hide();
  }

  applyBallAppearance() {
    if (!this.ball || !this.selectedBall) return;

    if (this.selectedBall.texture && this.ball.setTexture) {
      this.ball.setTexture(this.selectedBall.texture);
    } else if (this.ball.setColor) {
      this.ball.setColor(this.selectedBall.color);
    }
  }

  createNewLine(rawPoints) {
    this.removeCurrentLine();
    this.currentLine = new DrawLine(rawPoints, this.selectedLineColor);
    this.currentLine.bodies.forEach((body) => this.physics.add(body));
    this.gameplayLayer.addChild(this.currentLine.graphics);
  }

  findSpawnedEntity(pair, label, entities) {
    const body = pair.bodyA.label === label ? pair.bodyA : pair.bodyB;
    return entities.find((entity) => entity.body === body);
  }

  setShield(enabled) {
    this.isShielded = enabled;
    if (!this.ball?.glowSprite) return;
    this.ball.glowSprite.tint = enabled ? 0x4ade80 : 0xffffff;
    this.ball.glowSprite.alpha = enabled ? 0.48 : 1;
  }

  removeCurrentLine() {
    if (!this.currentLine) return;
    this.currentLine.bodies.forEach((body) => this.physics.remove(body));
    this.gameplayLayer.removeChild(this.currentLine.graphics);
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
    this.gameplayLayer.removeChild(this.ball.graphics);

    // Xoá line đang vẽ
    this.removeCurrentLine();
    this.spawnManager?.clear?.();
    this.effectSystem?.clear();
    this.setShield(false);
    this.orbController.timer = 0;
    this.projectileController.timer = 0;

    // Reset điểm và độ khó
    this.scoreSystem.reset();
    this.difficultySystem.reset();
  }

  createNewBall() {
    this.ball = new Ball(this.app.screen.width / 2, this.app.screen.height / 2);
    this.physics.add(this.ball.body);
    this.gameplayLayer.addChild(this.ball.graphics); // luôn nằm dưới UI

    this.bounceController.ball = this.ball;
    this.applyBallAppearance();
  }

  restartGame() {
    this.resetGameplay();
    this.createNewBall();
    this.startGame();
  }

  goToMenu() {
    this.gameState = GameState.MENU;
    this.gameOverPopup.hide();
    this.resetGameplay();
    this.createNewBall();
    this.mainMenu.show();
  }

  showSoundSettings() {
    this.SettingsPopup.show();
  }

  hideSoundSettings() {
    this.SettingsPopup.hide();
  }

  update() {
    if (this.gameState !== GameState.PLAYING) return;
    const deltaSeconds = this.app.ticker.deltaMS / 1000;

    this.difficultySystem.update(deltaSeconds);
    this.physics.update(this.app.ticker.deltaMS);
    this.ball.syncGraphics();
    this.orbController.update(deltaSeconds);
    this.projectileController.update(deltaSeconds);
    this.effectSystem.update();
    this.effectToast.update(deltaSeconds);

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
    this.effectSystem.clear();
    this.spawnManager.clear();
    this.app.destroy(true, { children: true });
  }
}
