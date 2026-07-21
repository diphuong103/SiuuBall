import Matter from 'matter-js';
import { Container, Sprite, Assets } from 'pixi.js';
import { GameConfig } from '../config/GameConfig.js';
import { OrbEffectType } from '../gameplay/OrbEffectType.js';

import doubleScoreImg from '../assets/textures/orb/double_score_orb.png';
import slowImg from '../assets/textures/orb/Slow_Motion_Orb.png';
import shieldImg from '../assets/textures/orb/Shield_Orb.png';
import speedUpImg from '../assets/textures/orb/Speed_Up_Orb.png';
import projectileImg from '../assets/textures/orb/Projectile_Orb.png';
import gravityDownImg from '../assets/textures/orb/Gravity_Down_Orb.png';
import gravityUpImg from '../assets/textures/orb/Gravity_Up_Orb.png';
import mysteryImg from '../assets/textures/orb/Mystery_Orb.png';

const orbTextures = {
    [OrbEffectType.DOUBLE_SCORE]: doubleScoreImg,
    [OrbEffectType.SLOW]: slowImg,
    [OrbEffectType.SHIELD]: shieldImg,
    [OrbEffectType.SPEED_UP]: speedUpImg,
    [OrbEffectType.PROJECTILE]: projectileImg,
    [OrbEffectType.GRAVITY_DOWN]: gravityDownImg,
    [OrbEffectType.GRAVITY_UP]: gravityUpImg,
    [OrbEffectType.MYSTERY]: mysteryImg,
};

const { Bodies } = Matter;

export class MysteryOrb {

    constructor(x, y, effect = null) {
        const { radius, lifetimeMs } = GameConfig.orb;
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

        // Spawn effect: Start at scale 0
        this.container.scale.set(0);
        this.isActive = true;

        const imgPath = effect ? (orbTextures[effect.type] || mysteryImg) : mysteryImg;

        Assets.load(imgPath).then((texture) => {
            if (!this.isActive) return;

            this.sprite = new Sprite(texture);
            this.sprite.anchor.set(0.5);
            this.sprite.width = 56; // Tương đương bán kính 28px trong gameplay
            this.sprite.height = 56;

            // Loại bỏ nền đen và làm hòa trộn neon rực rỡ
            this.sprite.blendMode = 'screen';

            this.container.addChild(this.sprite);
        });
    }

    syncGraphics(now = performance.now()) {
        const age = now - this.createdAt;

        // Floating (Lơ lửng) effect: thay đổi tọa độ Y từ +-2px đến +-4px
        // Math.sin() dao động từ -1 đến 1, nhân với 3 sẽ ra +-3px.
        const floatOffset = Math.sin(now / 300) * 3;
        this.container.position.set(this.body.position.x, this.body.position.y + floatOffset);

        // Spawn Effect: scale từ 0 lên 1.0 trong 0.2 giây (200ms)
        const spawnDuration = 200;
        if (age < spawnDuration) {
            this.container.scale.set(age / spawnDuration);
        } else {
            this.container.scale.set(1);
        }

        // Fade out khi gần hết hạn
        this.container.alpha = Math.min(1, Math.max(0, (this.expiresAt - now) / 700));
    }

    destroy() {
        if (!this.isActive) return;
        this.isActive = false;
        this.container.removeFromParent();
        this.container.destroy({ children: true });
    }

}
