import Matter from 'matter-js';
import { GameConfig } from '../config/GameConfig.js';

const { Engine, World } = Matter;

export class PhysicsWorld {
  constructor() {
    this.engine = Engine.create();  // Tạo một engine vật lý mới (trống)
    this.engine.gravity.y = 0;  // Không dùng trọng lực
    this.world = this.engine.world;
  }

  add(body) {  // Thêm một vật thể vào thế giới vật lý
    World.add(this.world, body);
  }

  remove(body) {  // Xóa một vật thể khỏi thế giới vật lý
    World.remove(this.world, body);
  }

  update(deltaMs) {   // Gọi mỗi frame(60 lan/s) để Matter.js cập nhật thế giới vật lý
    Engine.update(this.engine, deltaMs);
  }
}