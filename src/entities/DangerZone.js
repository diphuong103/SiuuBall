import Matter from 'matter-js';
import { Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig.js';

const { Bodies } = Matter;

export function createDangerZone(fieldW, fieldH) {
  const { wallThickness } = GameConfig.field;
  const halfW = fieldW / 2;
  const halfH = fieldH / 2;
  const cx = fieldW / 2;
  const cy = fieldH / 2;

  const options = {
    isStatic: true,     // các khung tĩnh, không chịu ảnh hưởng của lực hút
    label: 'danger-zone',
    restitution: 0, // Không nảy khi va chạm (chạm -> gameover)
  };

  const bodies = [
    Bodies.rectangle(cx, cy - halfH, fieldW, wallThickness, options), // top
    Bodies.rectangle(cx, cy + halfH, fieldW, wallThickness, options), // bottom
    Bodies.rectangle(cx - halfW, cy, wallThickness, fieldH, options), // left
    Bodies.rectangle(cx + halfW, cy, wallThickness, fieldH, options), // right
  ];

  const graphics = new Graphics();
  graphics
    .rect(0, 0, fieldW, fieldH)
    .stroke({ width: wallThickness, color: 0xff3b3b });

  return { bodies, graphics };
}