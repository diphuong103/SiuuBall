import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class EffectToast {
  constructor(screenWidth) {
    this.container = new Container();
    this.container.position.set(screenWidth / 2, 112);
    this.container.visible = false;
    this.elapsed = 0;
    this.duration = 1800;

    this.background = new Graphics();
    this.label = new Text({
      text: '',
      style: new TextStyle({ fontFamily: 'Arial', fontSize: 18, fontWeight: 'bold', fill: 0xffffff }),
    });
    this.label.anchor.set(0.5);
    this.container.addChild(this.background, this.label);
  }

  show(effect) {
    this.elapsed = 0;
    this.container.visible = true;
    this.container.alpha = 1;
    this.container.y = 112;
    this.label.text = effect.name;
    const width = Math.max(150, this.label.width + 42);
    this.background.clear().roundRect(-width / 2, -22, width, 44, 22).fill({ color: effect.color || 0x7c3aed, alpha: 0.92 });
  }

  update(deltaSeconds) {
    if (!this.container.visible) return;
    this.elapsed += deltaSeconds * 1000;
    this.container.y = 112 - Math.min(12, this.elapsed / 120);
    this.container.alpha = Math.max(0, 1 - Math.max(0, this.elapsed - this.duration + 300) / 300);
    if (this.elapsed >= this.duration) this.container.visible = false;
  }
}
