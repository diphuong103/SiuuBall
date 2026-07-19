import Matter from "matter-js";

export class BounceController {

    constructor(ball,difficultySystem){

        this.ball = ball;

        this.difficultySystem =
            difficultySystem;

    }

    maintainSpeed(){

        const velocity =
            this.ball.body.velocity;

        const speed =
            Math.hypot(
                velocity.x,
                velocity.y
            );

        if(speed < 0.0001)
            return;

        const directionX =
            velocity.x / speed;

        const directionY =
            velocity.y / speed;

        const target =
            this.difficultySystem
                .getCurrentSpeed();

        Matter.Body.setVelocity(
            this.ball.body,
            {

                x:
                directionX *
                target,

                y:
                directionY *
                target

            }
        );

    }

}