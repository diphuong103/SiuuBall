import { Application } from "pixi.js";
import { PhysicsWorld } from "./PhysicsWorld.js";
import { FixedStepClock } from "./FixedStepClock.js";
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
import { GameplayEventToast } from "../ui/GameplayEventToast.js";
import { BackgroundManager } from "../systems/BackgroundManager.js";
import { AchievementSystem } from "../systems/AchievementSystem.js";
import { SaveSystem } from "../systems/SaveSystem.js";

import bg_gameMusic from "../assets/audio/nhac-xo-so.mp3";
import sfxBounce from "../assets/audio/sfx/sfx_ball_bounce.mp3";
import sfxClick from "../assets/audio/sfx/click.mp3";
import sfxPowerup from "../assets/audio/sfx/tinh.mp3";
import sfxBullets from "../assets/audio/sfx/shot_spawn.mp3";
import sfxDrawLine from "../assets/audio/sfx/whoosh-sfx.mp3";
import sfxSurvivalWave from "../assets/audio/sfx/bumhole-bob-jeff.mp3";
import sfxAchievement1 from "../assets/audio/sfx/achievement_01.mp3";
import sfxAchievement2 from "../assets/audio/sfx/achievement_02.mp3";
import sfxAchievement3 from "../assets/audio/sfx/achievement_03.mp3";
import sfxAchievement4 from "../assets/audio/sfx/achievement_04.mp3";
import bgMainMenu from "../assets/textures/background/bg_mainmenu.webp";
import bgGameplay from "../assets/textures/background/bg_gameplay.webp";

const ARENA_THEMES = [
  { name: "NEON CITY", tint: 0xc4b5fd, border: 0xa855f7 },
  { name: "ICE FIELD", tint: 0xa5f3fc, border: 0x38bdf8 },
  { name: "LAVA CORE", tint: 0xfca5a5, border: 0xf97316 },
  { name: "CYBER GRID", tint: 0x86efac, border: 0x22c55e },
];

const DIFFICULTY_SETTINGS = {
  EASY: { speedIncreaseAmount: 0.2, maxSpeed: 12 },
  NORMAL: { speedIncreaseAmount: 0.4, maxSpeed: 18 },
  HARD: { speedIncreaseAmount: 0.6, maxSpeed: 25 },
};

export class Game {
  constructor() {
    this.gameState = GameState.MENU;
    this.currentLine = null;
    this.isShielded = false;
    this._speedDirty = false;
    this.physicsClock = new FixedStepClock(GameConfig.physics);

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
      achievement1: new Audio(sfxAchievement1),
      achievement2: new Audio(sfxAchievement2),
      achievement3: new Audio(sfxAchievement3),
      achievement4: new Audio(sfxAchievement4),
    };

    this._sfx.bounce.volume = 1.0;
    this._sfx.click.volume = 1.0;
    this._sfx.powerup.volume = 1.0;
    this._sfx.bullets.volume = 1.0;
    this._sfx.drawLine.volume = 0.8;
    this._sfx.achievement1.volume = 0.8;
    this._sfx.achievement2.volume = 0.8;
    this._sfx.achievement3.volume = 0.8;
    this._sfx.achievement4.volume = 0.8;
    this._waveSfx = new Audio(sfxSurvivalWave);
    this._waveSfx.loop = true;
    this._waveSfx.volume = 0.65;
    this.isSfxEnabled = true;

    this.isTransitioning = false;
    this._tick = null;

    // Lựa chọn của người chơi từ MainMenu
    this.selectedBall = null;
    this.gameplayEventElapsed = 0;
    this.arenaIndex = 0;
    this.isSurvivalWaveActive = false;
    this.nextWaveAt = GameConfig.gameplayEvents.waveStartDelay;
    this.selectedLineColor = 0x4dd0ff; // màu mặc định trùng với DrawLine hiện tại
  }

  async init() {
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) {
      throw new Error("Không tìm thấy phần tử #game-container.");
    }

    this.gameContainer = gameContainer;
    const { width: displayWidth, height: displayHeight } =
      this.getViewportSize();
    const { width, height } = GameConfig.viewport;
    this.displaySize = { width: displayWidth, height: displayHeight };

    // 1. Init Pixi
    this.app = new Application();
    await this.app.init({
      width,
      height,
      backgroundColor: 0x0d0d12,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });
    gameContainer.insertBefore(this.app.canvas, gameContainer.firstChild);
    this.app.canvas.style.width = `${displayWidth}px`;
    this.app.canvas.style.height = `${displayHeight}px`;

    // 1.5. Layer riêng cho gameplay (danger zone, ball, line)
    // Luôn nằm DƯỚI mọi UI vì chỉ add vào stage đúng 1 lần, ngay từ đầu.
    this.gameplayLayer = new Container();
    this.gameplayLayer.visible = false;
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
    this.dangerZoneBodies = wallBodies;
    this.dangerZoneGraphics = wallGraphics;

    await this.backgroundManager.setBackground(
      bgMainMenu,
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
      () =>
        this.eventToast?.show(
          "RARE ORB APPEARS!",
          "COLLECT BEFORE TIME RUNS OUT!",
          0xd97706,
          1800,
        ),
    );
    this.projectileController = new ProjectileController(
      this.spawnManager,
      () => this.ball,
    );

    this.collisionManager.register({
      onBallHitLine: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        this.scoreSystem.addBouncePoints();
        this.achievementSystem.add("bounces");
        this.playSound("bounce");
        this._speedDirty = true;

        const ballPos = this.ball.body.position;
        this.particleSystem?.burst(
          ballPos.x,
          ballPos.y,
          this.selectedLineColor,
          8,
          {
            speed: 180,
            radius: 4,
            life: 0.4,
          },
        );
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
        const effect = this.orbController.handleCollision(this.ball, orb);
        if (effect) this.achievementSystem.add("orbs");
      },
      onBallHitScoreOrb: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        const orb = this.findSpawnedEntity(
          pair,
          "score-orb",
          this.orbController.scoreOrbs,
        );
        if (!orb) return;
        this.scoreSystem.addPoints(orb.scoreValue);
        this.orbController.remove(orb);
        this.playSound("powerup");
        this.effectToast.show({ name: `+${orb.scoreValue}`, color: 0xfbbf24 });
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

    this.inputManager = new InputManager(
      this.app.canvas,
      (rawPoints) => {
        if (this.gameState !== GameState.PLAYING) return;
        this.createNewLine(rawPoints);
      },
      () => ({ width: this.app.screen.width, height: this.app.screen.height }),
    );

    // 6. Init UI (add SAU gameplayLayer nên luôn nằm trên)
    this.hud = new GameplayHUD(this.app.screen.width);
    this.effectToast = new EffectToast(this.app.screen.width);
    this.effectBar = new EffectBar(this.app.screen.width);
    this.eventToast = new GameplayEventToast(
      this.app.screen.width,
      this.app.screen.height,
    );
    this.achievementSystem = new AchievementSystem((achievement) => {
      this.eventToast.show(
        achievement.title,
        achievement.subtitle,
        achievement.color,
      );
      this.playSound(achievement.sfx);
    });
    this.mainMenu = new MainMenu(this.app.screen.width, this.app.screen.height);
    this.SettingsPopup = new SettingsPopup(
      this.app.screen.width,
      this.app.screen.height,
    );
    this.SoundSettingsPopup = new SoundSettingsPopup(
      this.app.screen.width,
      this.app.screen.height,
    );
    this.gameOverPopup = new GameOverPopup(
      this.app.screen.width,
      this.app.screen.height,
    );

    this.savedSettings = SaveSystem.loadSettings();
    this.applySavedSettings(this.savedSettings);

    this.app.stage.addChild(this.hud.container);
    this.app.stage.addChild(this.effectToast.container);
    this.app.stage.addChild(this.effectBar.container);
    this.app.stage.addChild(this.eventToast.container);
    this.app.stage.addChild(this.mainMenu.container);
    this.app.stage.addChild(this.SettingsPopup.container);
    this.app.stage.addChild(this.SoundSettingsPopup.container);
    this.app.stage.addChild(this.gameOverPopup.container);

    // --- MainMenu events ---
    this.mainMenu.onStart(() => this.runTransition(() => this.startGame()));
    this.gameOverPopup.onRestart(() =>
      this.runTransition(() => this.restartGame()),
    );

    this.gameOverPopup.onMenu(() => this.runTransition(() => this.goToMenu()));
    this.mainMenu.onSoundSetting(() => this.showSoundSettings());
    this.mainMenu.onSettings(() => this.showSettings());
    this.mainMenu.onHelp(() => this.showGuidePopup());

    // Chọn bóng qua slideshow trái/phải
    this.mainMenu.onBallChange((ballOption) => {
      this.selectedBall = ballOption;
      SaveSystem.saveSettings({ ballIndex: this.mainMenu.ballIndex });
      this.applyBallAppearance();
    });

    // Chọn màu vẽ
    this.mainMenu.onColorSelect((color) => {
      this.selectedLineColor = color;
      SaveSystem.saveSettings({
        lineColorIndex: this.mainMenu.selectedColorIndex,
      });
    });

    // Lấy lựa chọn mặc định ngay khi khởi tạo (bóng #0, màu #0)
    this.selectedBall = this.mainMenu.getSelectedBall();
    this.selectedLineColor = this.mainMenu.getSelectedColor();
    this.applyBallAppearance();

    this.SettingsPopup.onClose(() => this.hideSettings());
    this.SoundSettingsPopup.onClose(() => this.hideSoundSettings());

    this.SoundSettingsPopup.onSoundToggle((isOn) => {
      this.setSfxEnabled(isOn);
      SaveSystem.saveSettings({ soundEnabled: isOn });
    });

    this.SoundSettingsPopup.onMusicToggle((isOn) => {
      this.setMusicEnabled(isOn);
      SaveSystem.saveSettings({ musicEnabled: isOn });
    });

    this.SettingsPopup.onDifficultySelect((level) => {
      this.applyDifficultySetting(level);
      SaveSystem.saveSettings({ difficulty: level });
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

    this._onResize = () => this.resize();
    window.addEventListener("resize", this._onResize);
    window.addEventListener("orientationchange", this._onResize);
    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(this._onResize);
      this._resizeObserver.observe(this.gameContainer);
    }
    this.resize();
  }

  getViewportSize() {
    const containerWidth = this.gameContainer?.clientWidth || window.innerWidth;
    const containerHeight =
      this.gameContainer?.clientHeight || window.innerHeight;
    const aspectRatio = GameConfig.viewport.aspectRatio;

    let width = containerWidth;
    let height = width / aspectRatio;
    if (height > containerHeight) {
      height = containerHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    };
  }

  resize() {
    if (!this.app || !this.gameContainer) return;

    const { width, height } = this.getViewportSize();
    const hasDisplaySizeChanged =
      width !== this.displaySize?.width || height !== this.displaySize?.height;

    if (hasDisplaySizeChanged) {
      this.app.canvas.style.width = `${width}px`;
      this.app.canvas.style.height = `${height}px`;
      this.displaySize = { width, height };
    }

    this.guidePopup?.resize(this.app.screen.width, this.app.screen.height);
  }

  applyBallAppearance() {
    if (!this.ball || !this.selectedBall) return;

    if (this.selectedBall.texture && this.ball.setTexture) {
      this.ball.setTexture(this.selectedBall.texture);
    } else if (this.ball.setColor) {
      this.ball.setColor(this.selectedBall.color);
    }
  }

  applySavedSettings(settings) {
    this.applyDifficultySetting(settings.difficulty);
    this.SettingsPopup.setDifficulty(settings.difficulty);

    this.mainMenu.setSelectedBallIndex(settings.ballIndex);
    this.mainMenu.setSelectedColorIndex(settings.lineColorIndex);
    this.selectedBall = this.mainMenu.getSelectedBall();
    this.selectedLineColor = this.mainMenu.getSelectedColor();

    this.SoundSettingsPopup.setSoundEnabled(settings.soundEnabled);
    this.SoundSettingsPopup.setMusicEnabled(settings.musicEnabled);
    this.setSfxEnabled(settings.soundEnabled);
    this.setMusicEnabled(settings.musicEnabled);

    this.applyBallAppearance();
  }

  applyDifficultySetting(level) {
    const setting = DIFFICULTY_SETTINGS[level] || DIFFICULTY_SETTINGS.NORMAL;
    GameConfig.difficulty.speedIncreaseAmount = setting.speedIncreaseAmount;
    GameConfig.difficulty.maxSpeed = setting.maxSpeed;
  }

  createNewLine(rawPoints) {
    if (!rawPoints || rawPoints.length < 2) return;

    this.removeCurrentLine();
    this.currentLine = new DrawLine(rawPoints, this.selectedLineColor);
    this.currentLine.bodies.forEach((body) => this.physics.add(body));
    this.gameplayLayer.addChild(this.currentLine.graphics);

    this.playSound("drawLine");
    this.achievementSystem.add("lines");
  }

  findSpawnedEntity(pair, label, entities) {
    const body = pair.bodyA.label === label ? pair.bodyA : pair.bodyB;
    return entities.find((entity) => entity.body === body);
  }

  setShield(enabled) {
    this.isShielded = enabled;
    if (!this.ball?.glowSprite) return;
    this.ball.glowSprite.tint = enabled ? 0x4ade80 : 0xffffff;
    this.ball.glowSprite.alpha = enabled ? 0.48 : 0.16;
    this.ball.setShieldVisible?.(enabled);
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
    this.eventToast.show("DRAW A LINE TO DEFLECT THE BALL", "", 0x4dd0ff, 2000);
    await this.backgroundManager.setBackground(
      bgGameplay,
    );
    this.applyArenaTheme(this.arenaIndex, false);
  }

  gameOver() {
    this.gameState = GameState.GAME_OVER;
    this.stopSurvivalWaveSfx();
    this.eventToast?.clear();
    this.effectToast?.clear();
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
    this.physicsClock.reset();

    // Reset điểm và độ khó
    this.scoreSystem.reset();
    this.difficultySystem.reset();
    this.resetGameplayEvents();
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
      bgMainMenu,
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

  setSfxEnabled(enabled) {
    this.isSfxEnabled = enabled;
    this.mainMenu?.setSfxEnabled(enabled);
    this.SettingsPopup?.setSfxEnabled(enabled);
    this.gameOverPopup?.setSfxEnabled(enabled);
    if (!enabled) this.stopSurvivalWaveSfx();
  }

  setMusicEnabled(enabled) {
    this.bgMusicEnabled = Boolean(enabled);
    this._bgMusic.muted = !this.bgMusicEnabled;
    this.mainMenu?.setMusicEnabled(this.bgMusicEnabled);

    if (!this.bgMusicEnabled) {
      this._bgMusic.pause();
      return;
    }

    // The Music toggle is a user gesture, so retrying play here satisfies
    // browser autoplay rules when the initial menu load was blocked.
    if (this.gameState === GameState.PLAYING) {
      this._bgMusic.play().catch(() => {});
    } else if (this.gameState === GameState.MENU) {
      this.mainMenu?.playMusic();
    }
  }

  resetGameplayEvents() {
    this.gameplayEventElapsed = 0;
    this.arenaIndex = 0;
    this.isSurvivalWaveActive = false;
    this.nextWaveAt = GameConfig.gameplayEvents.waveStartDelay;
    this.scoreSystem?.setEventMultiplier(1);
    this.projectileController?.setSpawnMultiplier(1);
    this.stopSurvivalWaveSfx();
    this.achievementSystem?.reset();
    this.eventToast?.clear();
    this.applyArenaTheme(0, false);
  }

  applyArenaTheme(index, announce = true) {
    const theme = ARENA_THEMES[index % ARENA_THEMES.length];
    this.arenaIndex = index % ARENA_THEMES.length;
    if (this.backgroundManager?.sprite)
      this.backgroundManager.sprite.tint = theme.tint;
    if (this.dangerZoneGraphics) this.dangerZoneGraphics.tint = theme.border;
    if (announce)
      this.eventToast.show(theme.name, "Arena theme changed", theme.border);
  }

  startSurvivalWave() {
    const cfg = GameConfig.gameplayEvents;
    this.isSurvivalWaveActive = true;
    this.waveEndsAt = this.gameplayEventElapsed + cfg.waveDuration;
    this.scoreSystem.setEventMultiplier(cfg.waveScoreMultiplier);
    this.projectileController.setSpawnMultiplier(cfg.waveProjectileMultiplier);
    if (this.isSfxEnabled) {
      this._waveSfx.currentTime = 0;
      this._waveSfx.play().catch(() => {});
    }
    // Survival là cảnh báo quan trọng: hiển thị ngay, không chờ toast trước đó.
    this.eventToast.clear();
    this.eventToast.show(
      "SURVIVAL MODE BEGINS!",
      `Đạn x${cfg.waveProjectileMultiplier} • Điểm x${cfg.waveScoreMultiplier} trong ${cfg.waveDuration}s`,
      0xef4444,
      2000,
    );
  }

  endSurvivalWave() {
    this.isSurvivalWaveActive = false;
    this.scoreSystem.setEventMultiplier(1);
    this.projectileController.setSpawnMultiplier(1);
    this.stopSurvivalWaveSfx();
    this.eventToast.show("WAVE CLEARED", "Back to normal", 0x22c55e, 750);
  }

  stopSurvivalWaveSfx() {
    if (!this._waveSfx) return;
    this._waveSfx.pause();
    this._waveSfx.currentTime = 0;
  }

  updateGameplayEvents(deltaSeconds) {
    const cfg = GameConfig.gameplayEvents;
    this.gameplayEventElapsed += deltaSeconds;
    this.achievementSystem.update(deltaSeconds);
    const themeIndex =
      Math.floor(this.gameplayEventElapsed / cfg.arenaChangeInterval) %
      ARENA_THEMES.length;
    if (themeIndex !== this.arenaIndex) this.applyArenaTheme(themeIndex);
    if (
      this.isSurvivalWaveActive &&
      this.gameplayEventElapsed >= this.waveEndsAt
    ) {
      this.endSurvivalWave();
    } else if (
      !this.isSurvivalWaveActive &&
      this.gameplayEventElapsed >= this.nextWaveAt
    ) {
      this.nextWaveAt += cfg.waveInterval;
      this.startSurvivalWave();
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

  async showGuidePopup() {
    if (!this.guidePopup) {
      const { GuidePopup } = await import("../ui/GuidePopup.js");
      this.guidePopup = new GuidePopup(
        this.app.screen.width,
        this.app.screen.height,
        this.app.canvas,
      );
      this.guidePopup.onClose(() => this.hideGuidePopup());
      this.app.stage.addChild(this.guidePopup.container);
    }
    this.guidePopup.show();
  }

  hideGuidePopup() {
    this.guidePopup.hide();
  }

  consumeShieldIfActive() {
    if (!this.isShielded) return false;
    if (!this.effectSystem?.consumeShield?.()) this.setShield(false);
    this.effectToast?.show({ name: "SHIELD BLOCKED!", color: 0x4ade80 });
    return true;
  }

  async runTransition(action) {
    if (this.isTransitioning) return false;

    this.isTransitioning = true;

    try {
      await action();
      return true;
    } catch {
      return false;
    } finally {
      this.isTransitioning = false;
    }
  }

  // Cập nhật trạng
  update() {
    if (this.gameState !== GameState.PLAYING) return;
    const { deltaMs, steps } = this.physicsClock.advance(this.app.ticker.deltaMS);
    const deltaSeconds = deltaMs / 1000;

    this.difficultySystem.update(deltaSeconds);
    this.updateGameplayEvents(deltaSeconds);

    for (let step = 0; step < steps && this.gameState === GameState.PLAYING; step += 1) {
      this.physics.update(this.physicsClock.fixedStepMs);
      if (this._speedDirty) {
        this._speedDirty = false;
        this.bounceController.maintainSpeed();
      }
    }
    this.ball.syncGraphics();
    this.orbController.update(deltaSeconds);
    this.projectileController.update(deltaSeconds);
    this.effectSystem.update();
    this.effectToast.update(deltaSeconds);
    this.eventToast.update(deltaSeconds);
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
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("orientationchange", this._onResize);
    this._resizeObserver?.disconnect();

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
