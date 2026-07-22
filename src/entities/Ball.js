import Matter from "matter-js";
import { Container, Graphics, Sprite } from "pixi.js";
import { GameConfig } from "../config/GameConfig.js";
import { Random } from "../utils/Random.js";

const { Bodies } = Matter;

export class Ball {
  constructor(x, y) {
    const { radius, restitution, friction, frictionAir, startSpeed } =
      GameConfig.ball;

    this.radius = radius;
    this.baseColor = 0xffb020;
    this.currentColor = this.baseColor;

    this.body = Bodies.circle(x, y, radius, {
      restitution,
      friction,
      frictionAir,
      label: "main-ball",
    });

    // Góc ngẫu nhiên trong khoảng 30°–150° (luôn đi xuống, không thẳng đứng)
    const angleDeg = Random.float(30, 150);
    const angleRad = (angleDeg * Math.PI) / 180;
    Matter.Body.setVelocity(this.body, {
      x: Math.cos(angleRad) * startSpeed,
      y: Math.sin(angleRad) * startSpeed,
    });

    this.container = new Container();
    this.container.position.set(x, y);

    this.shadowSprite = new Graphics();
    this.shadowSprite
      .ellipse(0, radius * 0.45, radius * 0.95, radius * 0.55)
      .fill({ color: 0x000000, alpha: 0.28 });
    this.container.addChild(this.shadowSprite);

    this.glowSprite = new Graphics();
    this.glowSprite
      .circle(0, 0, radius + 8)
      .fill({ color: 0xffd36b, alpha: 0.16 });
    this.container.addChild(this.glowSprite);

    this.ballSprite = new Container();
    this.container.addChild(this.ballSprite);

    this.highlightSprite = new Graphics();
    this.highlightSprite
      .circle(-radius * 0.35, -radius * 0.35, radius * 0.28)
      .fill({ color: 0xffffff, alpha: 0.3 });
    this.container.addChild(this.highlightSprite);

    this.decorationContainer = new Container();
    this.container.addChild(this.decorationContainer);

    this.shieldIcon = new Graphics();
    this.shieldIcon
      .poly([
        0, -radius * 0.82,
        radius * 0.64, -radius * 0.48,
        radius * 0.5, radius * 0.3,
        0, radius * 0.82,
        -radius * 0.5, radius * 0.3,
        -radius * 0.64, -radius * 0.48,
      ])
      .fill({ color: 0x22c55e, alpha: 0.9 })
      .stroke({ width: 3, color: 0xffffff, alpha: 0.95 });
    this.shieldIcon.visible = false;
    this.container.addChild(this.shieldIcon);

    this._textureSprite = null;
    this._renderBallVisual(this.currentColor);

    this.graphics = this.container;
  }

  syncGraphics() {
    this.container.x = this.body.position.x;
    this.container.y = this.body.position.y;
  }

  setColor(color) {
    this.currentColor = color;
    if (this._textureSprite) {
      this._textureSprite.tint = color;
      return;
    }
    this._renderBallVisual(color);
  }

  setShieldVisible(visible) {
    if (this.shieldIcon) this.shieldIcon.visible = Boolean(visible);
  }

  setTexture(texture) {
    for (const child of this.ballSprite.removeChildren()) {
      child.destroy({ children: true });
      this._textureSprite = null;
    }

    if (!texture) {
      this._renderBallVisual(this.currentColor);
      return;
    }

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    const scale =
      (this.radius * 2) / Math.max(sprite.texture.width, sprite.texture.height);
    sprite.scale.set(scale);
    sprite.tint = this.currentColor;
    this.ballSprite.addChild(sprite);
    this._textureSprite = sprite;
  }

  _renderBallVisual(color) {
    for (const child of this.ballSprite.removeChildren()) {
      child.destroy({ children: true });
    }

    this._textureSprite = null;

    const shape = new Graphics();
    shape.circle(0, 0, this.radius).fill(color);
    shape.stroke({ width: 2, color: 0xffffff, alpha: 0.25 });
    this.ballSprite.addChild(shape);
  }

  destroy() {
    this.container.destroy({ children: true });
    this.decorationContainer.destroy();
  }
}
