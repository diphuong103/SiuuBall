import { Application } from 'pixi.js';
import Matter from 'matter-js';
import { PhysicsWorld } from './core/PhysicsWorld.js';
import { createDangerZone } from './entities/DangerZone.js';
import { Ball } from './entities/Ball.js';
import { DrawLine } from './entities/DrawLine.js';
import { InputManager } from './systems/InputManager.js';
import { ScoreSystem } from './systems/ScoreSystem.js';
import { GameConfig } from './config/GameConfig.js';
import { DifficultySystem } from "./systems/DifficultySystem.js";
import { GameState } from "./core/GameState.js";
import { HUDSystem } from "./systems/HUDSystem.js";

const { Events } = Matter;

async function bootstrap() {
  // 1. Khởi tạo Pixi Application (canvas vẽ)
  // Lấy kích thước thực của #game-container để toạ độ vật lý khớp hoàn toàn với pixel hiển thị
  const gameContainer = document.getElementById('game-container');
  const containerRect = gameContainer.getBoundingClientRect();
  const canvasWidth = containerRect.width || 360;
  const canvasHeight = containerRect.height || 640;

  const app = new Application();
  await app.init({
    width: canvasWidth,
    height: canvasHeight,
    backgroundColor: 0x0d0d12,
    antialias: true,
    resizeTo: gameContainer,   // Pixi tự resize canvas khi container thay đổi kích thước
  });
  // Canvas được insert TRƯỚC các overlay (overlay nằm sau trong HTML → z-index cao hơn)
  gameContainer.insertBefore(app.canvas, gameContainer.firstChild);

  const fieldW = app.screen.width;
  const fieldH = app.screen.height;

  // 2. Khởi tạo Physics World
  const physics = new PhysicsWorld();

  // 3. Tạo khung viền nguy hiểm — dynamic theo kích thước canvas thực tế
  const { bodies: wallBodies, graphics: wallGraphics } = createDangerZone(fieldW, fieldH);
  wallBodies.forEach((b) => physics.add(b));
  app.stage.addChild(wallGraphics);

  // 4. Spawn bóng chính (ở giữa canvas)
  let ball = new Ball(fieldW / 2, fieldH / 2);
  physics.add(ball.body);
  app.stage.addChild(ball.graphics);

  // 5. Điểm số & HUD
  const scoreSystem = new ScoreSystem();
  const hud = new HUDSystem();
  let elapsedTime = 0;

  // Độ khó
  const difficultySystem = new DifficultySystem();

  // 6. Quản lý đường vẽ hiện tại (chỉ 1 đường tồn tại cùng lúc - FR-014)
  let currentLine = null;

  function removeCurrentLine() {
    if (!currentLine) return;
    currentLine.bodies.forEach((b) => physics.remove(b));
    app.stage.removeChild(currentLine.graphics);
    currentLine = null;
  }

  function createNewLine(rawPoints) {
    removeCurrentLine(); // xoá đường cũ trước khi tạo đường mới (FR-014)
    currentLine = new DrawLine(rawPoints);
    currentLine.bodies.forEach((b) => physics.add(b));
    app.stage.addChild(currentLine.graphics);
  }

  // 7. Khởi tạo InputManager - lắng nghe thao tác vẽ trên canvas
  new InputManager(app.canvas, (rawPoints) => {
    if (gameState !== GameState.PLAYING) return;
    createNewLine(rawPoints);
  });

  // 8. Xử lý va chạm
  let gameState = GameState.MENU;

  // collisionStart: xử lý ngay lúc hai vật chạm nhau (không phải lúc tách ra)
  Events.on(physics.engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const labels = [pair.bodyA.label, pair.bodyB.label];

      if (gameState !== GameState.PLAYING) continue;

      // Bóng chạm khung -> Game Over
      if (labels.includes('main-ball') && labels.includes('danger-zone')) {
        handleGameOver();
        continue;
      }

      // Bóng chạm đường vẽ -> cộng điểm (FR-040)
      if (labels.includes('main-ball') && labels.includes('draw-line')) {
        scoreSystem.addBouncePoints();

        if (GameConfig.debug.logCollision) {
          console.log('[Collision] Bounce! Speed:', difficultySystem.getCurrentSpeed());
        }

        // Normalise velocity về đúng tốc độ level hiện tại sau khi nảy
        const velocity = ball.body.velocity;
        const speed = Math.hypot(velocity.x, velocity.y);
        if (speed > 0) {
          const targetSpeed = difficultySystem.getCurrentSpeed();
          Matter.Body.setVelocity(ball.body, {
            x: (velocity.x / speed) * targetSpeed,
            y: (velocity.y / speed) * targetSpeed,
          });
        }
      }
    }
  });

  // ────────────────────────────────────────────
  // 9. Overlay UI — Menu & Game Over
  // ────────────────────────────────────────────
  const overlayMenu = document.getElementById('overlay-menu');
  const overlayGameOver = document.getElementById('overlay-gameover');
  const goScoreEl = document.getElementById('go-score');
  const goBestEl = document.getElementById('go-best');
  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');

  function showMenu() {
    gameState = GameState.MENU;
    overlayMenu.classList.remove('overlay--hidden');
    overlayGameOver.classList.add('overlay--hidden');
  }

  function startGame() {
    overlayMenu.classList.add('overlay--hidden');
    overlayGameOver.classList.add('overlay--hidden');
    gameState = GameState.PLAYING;
  }

  function handleGameOver() {
    gameState = GameState.GAME_OVER;
    scoreSystem.commitHighScoreIfNeeded();

    // Hiển thị overlay game over với điểm
    goScoreEl.textContent = Math.floor(scoreSystem.getScore());
    goBestEl.textContent = Math.floor(scoreSystem.getBestScore());
    overlayGameOver.classList.remove('overlay--hidden');

    if (GameConfig.debug.logCollision) {
      console.log('Game Over! Điểm:', Math.floor(scoreSystem.getScore()));
    }
  }

  function restartGame() {
    // Reset bóng
    physics.remove(ball.body);
    app.stage.removeChild(ball.graphics);
    ball = new Ball(fieldW / 2, fieldH / 2);
    physics.add(ball.body);
    app.stage.addChild(ball.graphics);

    removeCurrentLine();
    scoreSystem.reset();
    difficultySystem.reset();
    elapsedTime = 0;

    startGame();
  }

  // Gắn sự kiện nút
  btnStart.addEventListener('click', startGame);
  btnRestart.addEventListener('click', restartGame);

  // Hiển thị menu khi vào game lần đầu
  showMenu();

  // 10. Game loop
  app.ticker.add((ticker) => {
    if (gameState !== GameState.PLAYING) return;

    const deltaSeconds = ticker.deltaMS / 1000;

    // Cập nhật tốc độ hiện tại theo thời gian
    difficultySystem.update(deltaSeconds);

    physics.update(ticker.deltaMS);

    ball.syncGraphics();

    // Kiểm tra đường vẽ hết hạn (FR-015)
    if (currentLine && currentLine.isExpired(performance.now())) {
      removeCurrentLine();
    }

    elapsedTime += deltaSeconds;
    scoreSystem.addTimeElapsed(deltaSeconds);

    hud.update({
      score: scoreSystem.getScore(),
      bestScore: scoreSystem.getBestScore(),
      elapsedTime,
    });
  });

  console.log('SiuuBall — bootstrap xong. Config:', GameConfig);
}

bootstrap();