import Matter from 'matter-js';
import { Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig.js';

const { Bodies } = Matter;

export function createDangerZone(centerX, centerY) {
  const { size, wallThickness } = GameConfig.field;
  const half = size / 2;

  const options = {
    isStatic: true,     // các khung tĩnh, không chịu ảnh hưởng của lực hút
    label: 'danger-zone',
    restitution: 0, // Không nảy khi va chạm (chạm -> gameover)
  };

  const bodies = [
    Bodies.rectangle(centerX, centerY - half, size, wallThickness, options), // top
    Bodies.rectangle(centerX, centerY + half, size, wallThickness, options), // bottom
    Bodies.rectangle(centerX - half, centerY, wallThickness, size, options), // left
    Bodies.rectangle(centerX + half, centerY, wallThickness, size, options), // right
  ];


  const graphics = new Graphics();  // vẽ khung viền màu đỏ lên các khung tĩnh của DangerZone
  graphics
    .rect(centerX - half, centerY - half, size, size)
    .stroke({ width: wallThickness, color: 0xff3b3b });

  return { bodies, graphics };
}