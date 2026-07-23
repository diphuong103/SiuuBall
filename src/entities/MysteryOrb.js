import Matter from 'matter-js';
import { Container, Sprite, Assets, Graphics, Text, TextStyle } from 'pixi.js';
import { GameConfig } from '../config/GameConfig.js';
import { OrbEffectType } from '../gameplay/OrbEffectType.js';

import doubleScoreImg from '../assets/textures/orb/double_score_orb.webp';
import slowImg from '../assets/textures/orb/Slow_Motion_Orb.webp';
import shieldImg from '../assets/textures/orb/Shield_Orb.webp';
import speedUpImg from '../assets/textures/orb/Speed_Up_Orb.webp';
import projectileImg from '../assets/textures/orb/Projectile_Orb.webp';
import gravityDownImg from '../assets/textures/orb/Gravity_Down_Orb.webp';
import gravityUpImg from '../assets/textures/orb/Gravity_Up_Orb.webp';
import mysteryImg from '../assets/textures/orb/Mystery_Orb.webp';
import score10Img from '../assets/textures/orb/10.webp';
import score20Img from '../assets/textures/orb/20.webp';
import score50Img from '../assets/textures/orb/50.webp';
import score100Img from '../assets/textures/orb/100.webp';
import score150Img from '../assets/textures/orb/150.webp';

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

const scoreOrbTextures = {
    10: score10Img,
    20: score20Img,
    50: score50Img,
    100: score100Img,
    150: score150Img,
};

const { Bodies } = Matter;

export class MysteryOrb {

    constructor(x, y, effect = null, scoreValue = null) {
        const { radius, lifetimeMs } = GameConfig.orb;
        this.radius = radius;
        this.effect = effect;
        this.scoreValue = scoreValue;
        this.body = Bodies.circle(x, y, radius, {
            isStatic: true,
            isSensor: true,
            label: scoreValue === null ? 'mystery-orb' : 'score-orb',
        });
        this.createdAt = performance.now();
        this.expiresAt = this.createdAt + lifetimeMs;
        this.container = new Container();
        this.container.position.set(x, y);

        // Spawn effect: Start at scale 0
        this.container.scale.set(0);
        this.isActive = true;

        this.isRare = effect?.type === OrbEffectType.MYSTERY;
        if (this.isRare) {
            this.rareRing = new Graphics();
            this.rareLabel = new Text({
                text: '',
                style: new TextStyle({ fontFamily: 'Arial', fontSize: 11, fontWeight: 'bold', fill: 0xfef3c7 }),
            });
            this.rareLabel.anchor.set(0.5);
            this.rareLabel.y = -38;
            this.container.addChild(this.rareRing, this.rareLabel);
        }

        if (scoreValue !== null) {
            const imgPath = scoreOrbTextures[scoreValue];
            if (!imgPath) return;
            Assets.load(imgPath).then((texture) => {
                if (!this.isActive) return;
                this.sprite = new Sprite(texture);
                this.sprite.anchor.set(0.5);
                this.sprite.width = 56;
                this.sprite.height = 56;
                this.container.addChild(this.sprite);
            });
            return;
        }

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

        if (this.isRare) {
            const remaining = Math.max(0, this.expiresAt - now);
            const progress = remaining / GameConfig.orb.lifetimeMs;
            this.rareRing.clear()
                .arc(0, 0, this.radius + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
                .stroke({ width: 3, color: 0xfbbf24, alpha: 0.95 });
            this.rareLabel.text = `${Math.ceil(remaining / 1000)}s`;
        }
    }

    destroy() {
        if (!this.isActive) return;
        this.isActive = false;
        this.container.removeFromParent();
        this.container.destroy({ children: true });
    }

}
