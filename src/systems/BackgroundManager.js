import { Sprite, Assets } from "pixi.js";

export class BackgroundManager {
    constructor(app) {
        this.app = app;
        this.sprite = null;
    }

    async setBackground(path) {
        const texture = await Assets.load(path);

        if (this.sprite) {
            this.app.stage.removeChild(this.sprite);
            this.sprite.destroy();
        }

        this.sprite = new Sprite(texture);

        this.sprite.width = this.app.screen.width;
        this.sprite.height = this.app.screen.height;

        this.app.stage.addChildAt(this.sprite, 0);
    }
}