import Matter from "matter-js";

const { Events } = Matter;

export class CollisionManager {

    constructor(engine) {

        this.engine = engine;

        this.listener = null;

    }

    register(handlers) {

        this.listener = (event) => {

            for (const pair of event.pairs) {

                const labels = [
                    pair.bodyA.label,
                    pair.bodyB.label
                ];

                if (
                    labels.includes("main-ball") &&
                    labels.includes("draw-line")
                ) {

                    handlers.onBallHitLine?.(pair);

                }

                if (labels.includes("main-ball") && labels.includes("mystery-orb")) {
                    handlers.onBallHitOrb?.(pair);
                }

                if (labels.includes("main-ball") && labels.includes("score-orb")) {
                    handlers.onBallHitScoreOrb?.(pair);
                }

                if (labels.includes("main-ball") && labels.includes("projectile")) {
                    handlers.onBallHitProjectile?.(pair);
                }

                if (
                    labels.includes("main-ball") &&
                    labels.includes("danger-zone")
                ) {

                    handlers.onBallHitDangerZone?.(pair);

                }

            }

        };

        Events.on(
            this.engine,
            "collisionStart",
            this.listener
        );

    }

    unregister() {

        if (!this.listener) return;

        Events.off(
            this.engine,
            "collisionStart",
            this.listener
        );

    }

}
