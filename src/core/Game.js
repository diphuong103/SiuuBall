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
import { SoundSettingsPopup } from "../ui/SoundSettingsPopup.js";
import { GuidePopup } from "../ui/GuidePopup.js";
import { CollisionManager } from "../gameplay/CollisionManager.js";
import { BounceController } from "../gameplay/BounceController.js";
import { GameConfig } from "../config/GameConfig.js";
import { Container } from "pixi.js";
import { SpawnManager } from "../systems/SpawnManager.js";
import { OrbEffectSystem } from "../gameplay/OrbEffectSystem.js";
import { OrbController } from "../gameplay/OrbController.js";
import { ProjectileController } from "../gameplay/ProjectileController.js";
import { EffectToast } from "../ui/EffectToast.js";
import { EffectBar } from "../ui/EffectBar.js";
import { BackgroundManager } from "../systems/BackgroundManager.js";
import bg_gameMusic from "../assets/audio/nhac-xo-so.mp3";
import sfxBounce from "../assets/audio/sfx/sfx_ball_bounce.mp3";
import sfxClick from "../assets/audio/sfx/click.mp3";
import sfxPowerup from "../assets/audio/sfx/tinh.mp3";
import sfxBullets from "../assets/audio/sfx/shot_spawn.mp3";
import sfxDrawLine from "../assets/audio/sfx/whoosh-sfx.mp3";

export class Game {
  constructor() {
    this.gameState = GameState.MENU;
    this.currentLine = null;
    this.isShielded = false;

    // Audio
    this._bgMusic = new Audio(bg_gameMusic);
    this._bgMusic.loop = true;
    this._bgMusic.volume = 0.4;

    this.bgMusicEnabled = true;

    //Sfx
    this._sfx = {
      bounce: new Audio(sfxBounce),
      click: new Audio(sfxClick),
      powerup: new Audio(sfxPowerup),
      bullets: new Audio(sfxBullets),
      drawLine: new Audio(sfxDrawLine),
    };

    this._sfx.bounce.volume = 1.0;
    this._sfx.click.volume = 1.0;
    this._sfx.powerup.volume = 1.0;
    this._sfx.bullets.volume = 1.0;
    this._sfx.drawLine.volume = 0.8;
    this.isSfxEnabled = true;

    this.isTransitioning = false;
    this._tick = null;

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

    this.backgroundManager = new BackgroundManager(this.app);

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

    await this.backgroundManager.setBackground(
      "/src/assets/textures/background/bg_mainmenu.png",
    );
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
    this.orbController = new OrbController(
      this.spawnManager,
      this.effectSystem,
    );
    this.projectileController = new ProjectileController(
      this.spawnManager,
      () => this.ball,
    );

    this.collisionManager.register({
      onBallHitLine: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        this.scoreSystem.addBouncePoints();
        this.playSound("bounce");
        this.bounceController.maintainSpeed();
      },
      onBallHitDangerZone: () => {
        if (this.gameState !== GameState.PLAYING) return;
        this.playSound("bounce");
        this.gameOver();
      },
      onBallHitOrb: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        const orb = this.findSpawnedEntity(
          pair,
          "mystery-orb",
          this.orbController.orbs,
        );
        this.playSound("powerup");
        this.orbController.handleCollision(this.ball, orb);
      },
      onBallHitProjectile: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;

        const projectile = this.findSpawnedEntity(
          pair,
          "projectile",
          this.projectileController.projectiles,
        );
        this.playSound("bullets");
        if (!projectile) return;

        this.projectileController.handleCollision(projectile);

        if (this.consumeShieldIfActive()) {
          return;
        }

        this.gameOver();
      },
    });

    this.inputManager = new InputManager(this.app.canvas, (rawPoints) => {
      if (this.gameState !== GameState.PLAYING) return;
      this.createNewLine(rawPoints);
    });

    // 6. Init UI (add SAU gameplayLayer nên luôn nằm trên)
    this.hud = new GameplayHUD(this.app.screen.width);
    this.effectToast = new EffectToast(this.app.screen.width);
    this.effectBar = new EffectBar(this.app.screen.width);
    this.mainMenu = new MainMenu(this.app.screen.width, this.app.screen.height);
    this.SettingsPopup = new SettingsPopup(
      this.app.screen.width,
      this.app.screen.height,
    );
    this.SoundSettingsPopup = new SoundSettingsPopup(
      this.app.screen.width,
      this.app.screen.height,
    );
    this.guidePopup = new GuidePopup(
      this.app.screen.width,
      this.app.screen.height,
      this.app.canvas,
    );
    this.gameOverPopup = new GameOverPopup(
      this.app.screen.width,
      this.app.screen.height,
    );

    this.app.stage.addChild(this.hud.container);
    this.app.stage.addChild(this.effectToast.container);
    this.app.stage.addChild(this.effectBar.container);
    this.app.stage.addChild(this.mainMenu.container);
    this.app.stage.addChild(this.SettingsPopup.container);
    this.app.stage.addChild(this.SoundSettingsPopup.container);
    this.app.stage.addChild(this.gameOverPopup.container);
    this.app.stage.addChild(this.guidePopup.container);

    // --- MainMenu events ---
    this.mainMenu.onStart(() => this.runTransition(() => this.startGame()));
    this.gameOverPopup.onRestart(() =>
      this.runTransition(() => this.restartGame()),
    );

    this.gameOverPopup.onMenu(() => this.runTransition(() => this.goToMenu()));
    this.mainMenu.onSoundSetting(() => this.showSoundSettings());
    this.mainMenu.onSettings(() => this.showSettings());
    this.mainMenu.onHelp(() => this.showGuidePopup());

    this.guidePopup.onClose(() => this.hideGuidePopup());

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

    this.SettingsPopup.onClose(() => this.hideSettings());
    this.SoundSettingsPopup.onClose(() => this.hideSoundSettings());

    this.SoundSettingsPopup.onSoundToggle((isOn) => {
      this.isSfxEnabled = isOn;
    });

    this.SoundSettingsPopup.onMusicToggle((isOn) => {
      this.bgMusicEnabled = isOn;
      this._bgMusic.muted = !isOn;
      if (this.mainMenu && this.mainMenu._bgMusic) {
        this.mainMenu._bgMusic.muted = !isOn;
      }
    });

    this.SettingsPopup.onDifficultySelect((level) => {
      if (level === "EASY") {
        GameConfig.difficulty.speedIncreaseAmount = 0.2;
        GameConfig.difficulty.maxSpeed = 12;
      } else if (level === "NORMAL") {
        GameConfig.difficulty.speedIncreaseAmount = 0.5;
        GameConfig.difficulty.maxSpeed = 18;
      } else if (level === "HARD") {
        GameConfig.difficulty.speedIncreaseAmount = 1.0;
        GameConfig.difficulty.maxSpeed = 25;
      }
      this.difficultySystem.reset();
    });

    this.SettingsPopup.onResetScore(() => {
      localStorage.setItem("bd_best_score", "0");
      this.scoreSystem.bestScore = 0;
      this.hud.update({
        score: this.scoreSystem.getScore(),
        bestScore: 0,
        elapsedTime: this.difficultySystem.getElapsedTime(),
      });
      // SettingsPopup tự hiện toast, không cần alert() nữa
    });

    // 7. Game Loop
    this._tick = () => this.update();
    this.app.ticker.add(this._tick);

    this.gameState = GameState.MENU;
    this.mainMenu.show();
    this.gameOverPopup.hide();
    this.gameplayLayer.visible = false;
    this.hud.hide();
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
    if (!rawPoints || rawPoints.length < 2) return;

    this.removeCurrentLine();
    this.currentLine = new DrawLine(rawPoints, this.selectedLineColor);
    this.currentLine.bodies.forEach((body) => this.physics.add(body));
    this.gameplayLayer.addChild(this.currentLine.graphics);

    this.playSound("drawLine");
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

  setGravityScale(value) {
    if (!this.physics?.engine) return;
    this.physics.engine.world.gravity.y = value;
    this.physics.engine.world.gravity.x = 0;
  }

  removeCurrentLine() {
    if (!this.currentLine) return;

    for (const body of this.currentLine.bodies) {
      this.physics.remove(body);
    }

    this.currentLine.destroy();
    this.currentLine = null;
  }

  async startGame() {
    this.gameState = GameState.PLAYING;
    this.mainMenu.hide();
    this.gameOverPopup.hide();
    this.gameplayLayer.visible = true;
    this.hud.show();
    this._bgMusic.play().catch(() => {});
    await this.backgroundManager.setBackground(
      "/src/assets/textures/background/bg_gameplay.png",
    );
  }

  gameOver() {
    this.gameState = GameState.GAME_OVER;
    this.scoreSystem.commitHighScoreIfNeeded();
    this.removeCurrentLine();
    this._bgMusic.pause();
    this.gameOverPopup.show(
      this.scoreSystem.getScore(),
      this.scoreSystem.getBestScore(),
    );
  }

  resetGameplay() {
    this._bgMusic.pause();
    this._bgMusic.currentTime = 0;

    // Xoá bóng cũ
    if (this.ball) {
      this.physics.remove(this.ball.body);
      this.ball.destroy();
      this.ball = null;
    }

    // Xoá line đang vẽ
    this.removeCurrentLine();

    // Reset controllers (xóa array nội bộ + timer) trước khi clear spawnManager
    this.projectileController?.reset();
    this.orbController?.reset();
    this.spawnManager?.clear();

    this.effectSystem?.clear();
    this.effectBar?.clear();
    this.setShield(false);
    this.setGravityScale(GameConfig.physics.gravity);

    // Reset điểm và độ khó
    this.scoreSystem.reset();
    this.difficultySystem.reset();
  }

  createNewBall() {
    this.ball = new Ball(this.app.screen.width / 2, this.app.screen.height / 2);
    this.physics.add(this.ball.body);
    this.gameplayLayer.addChild(this.ball.graphics);

    this.bounceController.ball = this.ball;
    this.applyBallAppearance();
  }

  async restartGame() {
    this.resetGameplay();
    this.createNewBall();
    await this.startGame();
  }

  async goToMenu() {
    this.gameState = GameState.MENU;
    this.gameOverPopup.hide();
    this.resetGameplay();
    this.createNewBall();
    this.mainMenu.show();
    this.gameplayLayer.visible = false;
    this.hud.hide();
    await this.backgroundManager.setBackground(
      "/src/assets/textures/background/bg_mainmenu.png",
    );
  }

  playSound(name) {
    if (!this.isSfxEnabled) return; // Không phát nếu tắt Sound settings

    const sound = this._sfx[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }

  showSoundSettings() {
    this.SoundSettingsPopup.show();
  }

  hideSoundSettings() {
    this.SoundSettingsPopup.hide();
  }

  showSettings() {
    this.SettingsPopup.show();
  }

  hideSettings() {
    this.SettingsPopup.hide();
  }

  showGuidePopup() {
    this.guidePopup.show();
  }

  hideGuidePopup() {
    this.guidePopup.hide();
  }

  consumeShieldIfActive() {
    if (!this.isShielded) return false;
    this.setShield(false);
    return true;
  }

  async runTransition(action) {
    if (this.isTransitioning) return false;

    this.isTransitioning = true;

    try {
      await action();
      return true;
    } catch (error) {
      console.error("Game transition failed:", error);
      return false;
    } finally {
      this.isTransitioning = false;
    }
  }

  // Cập nhật trạng
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
    this.effectBar.update(
      this.effectSystem.getActiveEffects(performance.now()),
    );

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
    if (this._tick) {
      this.app?.ticker.remove(this._tick);
      this._tick = null;
    }
    this.inputManager?.destroy();
    this.collisionManager?.unregister();

    this.removeCurrentLine();
    this.spawnManager?.clear();
    this.effectSystem?.clear();

    // guidePopup has a DOM <video> element — destroy it explicitly before app.destroy()
    this.guidePopup?.destroy();

    // app.destroy handles all remaining Pixi containers
    this.app?.destroy(true, { children: true });
  }
}
