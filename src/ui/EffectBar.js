import { Container, Graphics } from 'pixi.js';

export class EffectBar {
    constructor(screenWidth) {
        this.container = new Container();
        // Centered horizontally, positioned right under HUD
        this.container.position.set(screenWidth / 2, 85);

        this.cache = new Map();

        // Container to center all icons dynamically
        this.iconsLayer = new Container();
        this.container.addChild(this.iconsLayer);
    }

    update(activeEffects) {
        this.iconsLayer.removeChildren();

        if (!activeEffects || activeEffects.length === 0) return;

        const spacing = 40;
        const totalWidth = (activeEffects.length - 1) * spacing;
        let startX = -totalWidth / 2;

        for (const effect of activeEffects) {
            let icon = this.cache.get(effect.type);
            if (!icon) {
                icon = new Graphics();
                this.cache.set(effect.type, icon);
            }

            icon.x = startX;
            icon.y = 0;
            startX += spacing;

            this.iconsLayer.addChild(icon);
            this.drawTimingIcon(icon, effect);
        }
    }

    drawTimingIcon(gfx, effect) {
        gfx.clear();

        const color = effect.color || 0x7c3aed;

        // Base icon placeholder - designers can add Sprite here later
        gfx.circle(0, 0, 16).fill(color);
        gfx.circle(0, 0, 16).stroke({ color: 0xffffff, width: 2, alpha: 0.8 });

        // Timing overlay layer (darkens like a cooldown pie chart)
        if (effect.durationMs > 0 && effect.remainingTimeMs >= 0) {
            const progress = 1 - (effect.remainingTimeMs / effect.durationMs);
            if (progress > 0 && progress < 1) {
                const startAngle = -Math.PI / 2;
                const currentAngle = startAngle + (Math.PI * 2) * progress;

                gfx.moveTo(0, 0);
                gfx.arc(0, 0, 16, startAngle, currentAngle);
                gfx.lineTo(0, 0); // close path back to center
                gfx.fill({ color: 0x000000, alpha: 0.6 });
            }
        }
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }
}
