import Matter from 'matter-js';
import { Container, Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig.js';

const { Bodies } = Matter;

export class MysteryOrb {

    constructor(x, y, effect = null) {
        const { radius, lifetimeMs, color, glowColor } = GameConfig.orb;
        this.radius = radius;
        this.effect = effect;
        this.body = Bodies.circle(x, y, radius, {
            isStatic: true,
            isSensor: true,
            label: 'mystery-orb',
        });
        this.createdAt = performance.now();
        this.expiresAt = this.createdAt + lifetimeMs;
        this.container = new Container();
        this.container.position.set(x, y);
        const orbColor = this.effect?.color ?? color;
        this.glow = new Graphics().circle(0, 0, radius + 12).fill({ color: orbColor, alpha: 0.18 });
        this.sprite = new Graphics()
            .circle(0, 0, radius).fill(orbColor)
            .circle(-radius * 0.28, -radius * 0.28, radius * 0.24).fill({ color: 0xffffff, alpha: 0.7 })
            .stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
        this.container.addChild(this.glow, this.sprite);
        this.isActive = true;
    }

    syncGraphics(now = performance.now()) {
        this.container.position.set(this.body.position.x, this.body.position.y);
        const pulse = 1 + Math.sin(now / 180) * 0.08;
        this.glow.scale.set(pulse);
        this.container.alpha = Math.min(1, Math.max(0, (this.expiresAt - now) / 700));
    }

    destroy() {
        this.isActive = false;
        this.container.removeFromParent();
        this.container.destroy({ children: true });
    }

}
