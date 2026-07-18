import { GameConfig } from "../config/GameConfig.js";

export class DifficultySystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.elapsedTime = 0;
    this.currentSpeed = GameConfig.ball.startSpeed;
  }

  update(deltaSeconds) {
    this.elapsedTime += deltaSeconds;

    const startSpeed = GameConfig.ball.startSpeed;

    const { speedIncreaseInterval, speedIncreaseAmount, maxSpeed } =
      GameConfig.difficulty;

    console.log({
      elapsed: this.elapsedTime,  // Thời gian đã trôi qua kể từ khi bắt đầu trò chơi (tính bằng giây)
      interval: speedIncreaseInterval,  // Khoảng thời gian (tính bằng giây) sau đó tốc độ sẽ tăng lên
      amount: speedIncreaseAmount,    // Số lượng tốc độ tăng lên sau mỗi khoảng thời gian
      max: maxSpeed,
    });

    const level = Math.floor(
      this.elapsedTime / speedIncreaseInterval, // Tính toán cấp độ dựa trên thời gian đã trôi qua và khoảng thời gian tăng tốc
    );

    console.log("level", level + 1);

    this.currentSpeed = Math.min(
      GameConfig.ball.startSpeed + level * speedIncreaseAmount,
      maxSpeed,
    ); // Giới hạn tốc độ hiện tại không vượt quá maxSpeed
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }
}
