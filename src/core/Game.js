import { Application } from 'pixi.js';
import { PhysicsWorld } from './PhysicsWorld.js';
import { createDangerZone } from '../entities/DangerZone.js';
import { Ball } from '../entities/Ball.js';
import { DrawLine } from '../entities/DrawLine.js';
import { InputManager } from '../systems/InputManager.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { DifficultySystem } from '../systems/DifficultySystem.js';
import { GameState } from './GameState.js';
import { GameplayHUD } from '../ui/GameplayHUD.js';
import { MainMenu } from '../ui/MainMenu.js';
import { GameOverPopup } from '../ui/GameOverPopup.js';
import { CollisionManager } from '../gameplay/CollisionManager.js';
import { BounceController } from '../gameplay/BounceController.js';

export class Game {
  constructor() {
    this.gameState = GameState.MENU;
    this.currentLine = null;
  }

  async init() {
    const gameContainer = document.getElementById('game-container');
    const containerRect = gameContainer.getBoundingClientRect();
    const width = containerRect.width || 360;
    const height = containerRect.height || 640;

    // 1. Init Pixi
    this.app = new Application();
    await this.app.init({
      width,
      height,
      backgroundColor: 0x0d0d12,
      antialias: true,
      resizeTo: gameContainer,
    });
    gameContainer.insertBefore(this.app.canvas, gameContainer.firstChild);

    // 2. Init Physics
    this.physics = new PhysicsWorld();

    // 3. Init Systems
    this.scoreSystem = new ScoreSystem();
    this.difficultySystem = new DifficultySystem();

    // 4. Init Entities
    const { bodies: wallBodies, graphics: wallGraphics } = createDangerZone(this.app.screen.width, this.app.screen.height);
    wallBodies.forEach((body) => this.physics.add(body));
    this.app.stage.addChild(wallGraphics);

    this.ball = new Ball(this.app.screen.width / 2, this.app.screen.height / 2);
    this.physics.add(this.ball.body);
    this.app.stage.addChild(this.ball.graphics);

    // 5. Gameplay Controllers
    this.collisionManager = new CollisionManager(this.physics.engine);
    this.bounceController = new BounceController(this.ball, this.difficultySystem);

    this.collisionManager.register({
      onBallHitLine: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        this.scoreSystem.addBouncePoints();
        this.bounceController.maintainSpeed();
      },
      onBallHitDangerZone: (pair) => {
        if (this.gameState !== GameState.PLAYING) return;
        this.gameOver();
      }
    });

    this.inputManager = new InputManager(this.app.canvas, (rawPoints) => {
      if (this.gameState !== GameState.PLAYING) return;
      this.createNewLine(rawPoints);
    });

    // 6. Init UI
    this.hud = new GameplayHUD();
    this.mainMenu = new MainMenu();
    this.gameOverPopup = new GameOverPopup();

    this.mainMenu.onStart(() => this.startGame());
    this.gameOverPopup.onRestart(() => this.restartGame());

    // 7. Game Loop
    this.app.ticker.add(() => this.update());

    this.gameState = GameState.MENU;
    this.mainMenu.show();
    this.gameOverPopup.hide();
  }

  createNewLine(rawPoints) {
    this.removeCurrentLine();
    this.currentLine = new DrawLine(rawPoints);
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
    this.gameOverPopup.show(this.scoreSystem.getScore(), this.scoreSystem.getBestScore());
  }

  restartGame() {
    this.physics.remove(this.ball.body);
    this.app.stage.removeChild(this.ball.graphics);

    this.ball = new Ball(this.app.screen.width / 2, this.app.screen.height / 2);
    this.physics.add(this.ball.body);
    this.app.stage.addChild(this.ball.graphics);

    this.bounceController.ball = this.ball;

    this.removeCurrentLine();
    this.scoreSystem.reset();
    this.difficultySystem.reset();

    this.startGame();
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
