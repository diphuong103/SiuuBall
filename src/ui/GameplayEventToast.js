import { Container, Graphics, Text, TextStyle } from "pixi.js";

/** A short, central announcement for achievements and timed gameplay events. */
export class GameplayEventToast {
  constructor(screenWidth, screenHeight) {
    this.container = new Container();
    this.container.position.set(screenWidth / 2, screenHeight * 0.22);
    this.container.visible = false;
    this.elapsed = 0;
    this.duration = 850;
    this.queue = [];

    this.background = new Graphics();
    this.title = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 34,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x09090b, width: 6 },
        dropShadow: {
          color: 0x000000,
          alpha: 0.65,
          blur: 4,
          distance: 3,
          angle: Math.PI / 2,
        },
      }),
    });
    this.title.anchor.set(0.5);
    this.subtitle = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 14,
        fontWeight: "bold",
        fill: 0xe2e8f0,
      }),
    });
    this.subtitle.anchor.set(0.5);
    this.subtitle.y = 27;
    this.container.addChild(this.background, this.title, this.subtitle);
  }

  show(title, subtitle = "", color = 0x7c3aed, duration = 1600) {
    const announcement = { title, subtitle, color, duration };
    if (this.container.visible) {
      this.queue.push(announcement);
      return;
    }
    this._display(announcement);
  }

  _display({ title, subtitle, color, duration }) {
    this.elapsed = 0;
    this.duration = duration;
    this.title.text = title;
    this.subtitle.text = subtitle;
    this.container.visible = true;
    this.container.alpha = 1;
    this.container.scale.set(0.82);
    const width = Math.max(
      240,
      this.title.width + 56,
      this.subtitle.width + 48,
    );
    this.background.clear();
    this.title.style.fill = color;
    this.subtitle.style.fill = 0xffffff;
  }

  update(deltaSeconds) {
    if (!this.container.visible) return;
    this.elapsed += deltaSeconds * 1000;
    this.container.scale.set(0.9);
    const fadeStart = Math.max(0, this.duration - 220);

    if (this.elapsed > fadeStart) {
      this.container.alpha = Math.max(0, 1 - (this.elapsed - fadeStart) / 220);
    } else {
      this.container.alpha = 1;
    }

    if (this.elapsed >= this.duration) {
      const next = this.queue.shift();
      if (next) this._display(next);
      else this.container.visible = false;
    }
  }

  clear() {
    this.queue = [];
    this.elapsed = 0;
    this.container.visible = false;
  }

  resize(screenWidth, screenHeight) {
    this.container.position.set(screenWidth / 2, screenHeight * 0.38);
  }
}
