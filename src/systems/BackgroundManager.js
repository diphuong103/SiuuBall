import { Sprite, Assets } from "pixi.js";

export class BackgroundManager {
  constructor(app) {
    this.app = app;
    this.sprite = null;
    this.loadId = 0;
  }

  async setBackground(path) {
    const requestId = ++this.loadId;
    let texture;

    try {
      texture = await Assets.load(path);
    } catch {
      return false;
    }

    if (requestId !== this.loadId) return false;

    this.sprite?.destroy();
    this.sprite = new Sprite(texture);
    this.sprite.width = this.app.screen.width;
    this.sprite.height = this.app.screen.height;

    this.app.stage.addChildAt(this.sprite, 0);
    return true;
  }
}
