import Matter from 'matter-js';
import { Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig.js';

const { Bodies } = Matter;

export class Ball {  // Lớp đại diện cho quả bóng chính trong trò chơi (mỗi quả bóng có trạng thái vật lý và đồ họa riêng)
  constructor(x, y) {
    const { radius, restitution, friction, frictionAir, startSpeed } = GameConfig.ball;  // spawn bóng ở vị trí (x, y) với các thuộc tính vật lý được định nghĩa trong GameConfig

    this.body = Bodies.circle(x, y, radius, {   //Tạo một vật thể hình tròn (bóng) với bán kính radius, vị trí (x, y) và các thuộc tính vật lý 
      restitution: restitution,
      friction: friction,
      frictionAir: frictionAir,
      label: 'main-ball',  // nhận diện bóng real và fake
    });

    // Bắn bóng theo hướng chéo ban đầu để bóng không đứng yên
    Matter.Body.setVelocity(this.body, { x: 0, y: startSpeed });  // Bắn thẳng xuống khi spawn

    this.graphics = new Graphics();
    this.graphics.circle(0, 0, radius).fill(0xffb020);
  }

  syncGraphics() {  // đồng bộ tọa độ do matter.js tính toán với tọa độ của graphics để hiển thị đúng vị trí của bóng trên màn hình
    this.graphics.x = this.body.position.x;
    this.graphics.y = this.body.position.y;
  }
}