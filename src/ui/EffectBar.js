import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class EffectBar {
    constructor(screenWidth) {
        this.container = new Container();
        // Centered horizontally, positioned right under HUD
        this.container.position.set(screenWidth / 2, 85);

        // Container to center all icons dynamically
        this.iconsLayer = new Container();
        this.container.addChild(this.iconsLayer);
    }

    update(activeEffects) {
        this.iconsLayer.removeChildren();

        if (!activeEffects || activeEffects.length === 0) return;

        const spacing = 52;
        const totalWidth = (activeEffects.length - 1) * spacing;
        let startX = -totalWidth / 2;

        for (const effect of activeEffects) {
            const iconGroup = this._buildIcon(effect);
            iconGroup.x = startX;
            startX += spacing;
            this.iconsLayer.addChild(iconGroup);
        }
    }

    _buildIcon(effect) {
        const group = new Container();
        const color = effect.color || 0x7c3aed;
        const radius = 17;

        // Background circle
        const bg = new Graphics();
        bg.circle(0, 0, radius).fill({ color: 0x000000, alpha: 0.45 });
        bg.circle(0, 0, radius).stroke({ color, width: 2.5, alpha: 0.9 });
        group.addChild(bg);

        // Cooldown arc (pie-chart style)
        if (effect.durationMs > 0 && effect.remainingTimeMs >= 0) {
            const progress = 1 - (effect.remainingTimeMs / effect.durationMs);
            if (progress > 0 && progress < 1) {
                const arc = new Graphics();
                const startAngle = -Math.PI / 2;
                const endAngle = startAngle + Math.PI * 2 * progress;
                arc.moveTo(0, 0);
                arc.arc(0, 0, radius, startAngle, endAngle);
                arc.lineTo(0, 0);
                arc.fill({ color: 0x000000, alpha: 0.55 });
                group.addChild(arc);
            }
        }

        // Remaining time text (center of circle)
        if (effect.durationMs > 0 && effect.remainingTimeMs > 0) {
            const secLeft = Math.ceil(effect.remainingTimeMs / 1000);
            const timeText = new Text({
                text: `${secLeft}`,
                style: new TextStyle({
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fontWeight: 'bold',
                    fill: 0xffffff,
                }),
            });
            timeText.anchor.set(0.5);
            group.addChild(timeText);
        }

        // Effect name label below circle
        const label = new Text({
            text: effect.name || '',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 10,
                fontWeight: 'bold',
                fill: color,
                dropShadow: true,
                dropShadowDistance: 1,
                dropShadowBlur: 2,
                dropShadowAlpha: 0.8,
            }),
        });
        label.anchor.set(0.5, 0);
        label.y = radius + 3;
        group.addChild(label);

        return group;
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }

    clear() {
        this.iconsLayer.removeChildren();
    }

    resize(screenWidth) {
        this.container.x = screenWidth / 2;
    }
}
