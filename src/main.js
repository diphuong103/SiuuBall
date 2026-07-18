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

const { Events } = Matter;

async function bootstrap() {
  // 1. Khởi tạo Pixi Application (canvas vẽ)
  const app = new Application();
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x0d0d12,
    antialias: true,
  });
  document.getElementById('game-container').appendChild(app.canvas);

  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;

  // 2. Khởi tạo Physics World
  const physics = new PhysicsWorld();

  // 3. Tạo khung viền nguy hiểm
  const { bodies: wallBodies, graphics: wallGraphics } = createDangerZone(centerX, centerY);
  wallBodies.forEach((b) => physics.add(b));
  app.stage.addChild(wallGraphics);

  // 4. Spawn bóng chính
  let ball = new Ball(centerX, centerY);
  physics.add(ball.body);
  app.stage.addChild(ball.graphics);

  // 5. Điểm số
  const scoreSystem = new ScoreSystem();
  const scoreEl = document.getElementById('score');

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
    if (isGameOver) return;
    createNewLine(rawPoints);
  });

  // 8. Xử lý va chạm
  let isGameOver = false;
  Events.on(physics.engine, 'collisionEnd', (event) => {
    for (const pair of event.pairs) {
      const labels = [pair.bodyA.label, pair.bodyB.label];

      console.log('Tốc độ hiện tại: ', difficultySystem.getCurrentSpeed());

      // Bóng chạm khung -> Game Over
      if (labels.includes('main-ball') && labels.includes('danger-zone') && !isGameOver) {
        handleGameOver();
      }

      // Bóng chạm đường vẽ -> cộng điểm (FR-040)
      if (labels.includes('main-ball') && labels.includes('draw-line') && !isGameOver) {
        scoreSystem.addBouncePoints();

        const velocity = ball.body.velocity;

        const speed = Math.hypot(velocity.x, velocity.y);

        if (speed > 0) {
          const targetSpeed = GameConfig.ball.startSpeed;
          Matter.Body.setVelocity(ball.body, {
            x: (velocity.x / speed) * targetSpeed,
            y: (velocity.y / speed) * targetSpeed,
          });
        }
      }
    }
  });

  function handleGameOver() {
    isGameOver = true;
    scoreSystem.commitHighScoreIfNeeded();
    console.log('Game Over! Điểm:', Math.floor(scoreSystem.score));
    setTimeout(restartGame, 1500);
  }

  function restartGame() {
    physics.remove(ball.body);
    app.stage.removeChild(ball.graphics);
    ball = new Ball(centerX, centerY);
    physics.add(ball.body);
    app.stage.addChild(ball.graphics);
    removeCurrentLine();
    scoreSystem.reset();
    difficultySystem.reset();
    isGameOver = false;
  }

  // 9. Game loop
  app.ticker.add((ticker) => {
    if (isGameOver) return;

    const deltaSeconds = ticker.deltaMS / 1000;

    difficultySystem.update(deltaSeconds);

    physics.update(ticker.deltaMS);

    ball.syncGraphics();

    // Kiểm tra đường vẽ hết hạn (FR-015)
    if (currentLine && currentLine.isExpired(performance.now())) {
      removeCurrentLine();
    }

    scoreSystem.addTimeElapsed(deltaSeconds);
    scoreEl.textContent = Math.floor(scoreSystem.score);
  });

  console.log('Bounce & Draw - Sprint 2 (Draw Mechanic) đã khởi chạy. Config:', GameConfig);
}

bootstrap();