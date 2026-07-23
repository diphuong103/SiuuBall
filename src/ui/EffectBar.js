import { Container, Graphics, Text, TextStyle } from 'pixi.js';

const RADIUS = 17;
const SPACING = 52;

export class EffectBar {
    constructor(screenWidth) {
        this.container = new Container();
        this.container.position.set(screenWidth / 2, 85);

        this.iconsLayer = new Container();
        this.container.addChild(this.iconsLayer);
        this.entries = new Map();
    }

    update(activeEffects) {
        if (!activeEffects?.length) {
            this.iconsLayer.visible = false;
            return;
        }

        this.iconsLayer.visible = true;
        const activeKeys = new Set();
        const totalWidth = (activeEffects.length - 1) * SPACING;
        let x = -totalWidth / 2;

        for (const effect of activeEffects) {
            const key = effect.type || effect.name;
            activeKeys.add(key);
            let entry = this.entries.get(key);
            if (!entry) {
                entry = this._createIcon(effect);
                this.entries.set(key, entry);
                this.iconsLayer.addChild(entry.group);
            }

            entry.group.visible = true;
            entry.group.x = x;
            x += SPACING;
            this._updateIcon(entry, effect);
        }

        for (const [key, entry] of this.entries) {
            if (!activeKeys.has(key)) entry.group.visible = false;
        }
    }

    _createIcon(effect) {
        const group = new Container();
        const background = new Graphics();
        const arc = new Graphics();
        const timeText = new Text({
            text: '',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fontWeight: 'bold',
                fill: 0xffffff,
            }),
        });
        timeText.anchor.set(0.5);

        const label = new Text({
            text: effect.name || '',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 10,
                fontWeight: 'bold',
                fill: effect.color || 0x7c3aed,
                dropShadow: true,
                dropShadowDistance: 1,
                dropShadowBlur: 2,
                dropShadowAlpha: 0.8,
            }),
        });
        label.anchor.set(0.5, 0);
        label.y = RADIUS + 3;
        group.addChild(background, arc, timeText, label);

        const entry = {
            group,
            background,
            arc,
            timeText,
            label,
            color: null,
            name: null,
            secondsLeft: null,
        };
        this._updateStaticIcon(entry, effect);
        return entry;
    }

    _updateStaticIcon(entry, effect) {
        const color = effect.color || 0x7c3aed;
        if (entry.color !== color) {
            entry.color = color;
            entry.background
                .clear()
                .circle(0, 0, RADIUS).fill({ color: 0x000000, alpha: 0.45 })
                .circle(0, 0, RADIUS).stroke({ color, width: 2.5, alpha: 0.9 });
            entry.label.style.fill = color;
        }
        if (entry.name !== effect.name) {
            entry.name = effect.name;
            entry.label.text = effect.name || '';
        }
    }

    _updateIcon(entry, effect) {
        this._updateStaticIcon(entry, effect);
        const hasTimer = effect.durationMs > 0 && effect.remainingTimeMs > 0;
        entry.timeText.visible = hasTimer;

        if (!hasTimer) {
            entry.arc.clear();
            entry.secondsLeft = null;
            return;
        }

        const secondsLeft = Math.ceil(effect.remainingTimeMs / 1000);
        if (entry.secondsLeft !== secondsLeft) {
            entry.secondsLeft = secondsLeft;
            entry.timeText.text = `${secondsLeft}`;
        }

        const progress = 1 - (effect.remainingTimeMs / effect.durationMs);
        entry.arc.clear();
        if (progress > 0 && progress < 1) {
            const startAngle = -Math.PI / 2;
            entry.arc
                .moveTo(0, 0)
                .arc(0, 0, RADIUS, startAngle, startAngle + Math.PI * 2 * progress)
                .lineTo(0, 0)
                .fill({ color: 0x000000, alpha: 0.55 });
        }
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }

    clear() {
        this.iconsLayer.visible = false;
        for (const entry of this.entries.values()) entry.group.visible = false;
    }

    resize(screenWidth) {
        this.container.x = screenWidth / 2;
    }
}
