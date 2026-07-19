import { Container, Text, TextStyle, Graphics } from 'pixi.js';

export class GameplayHUD {
    constructor(screenWidth, screenHeight) {
        this.container = new Container();

        const labelStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffaaaa,
            stroke: { color: 0x000000 },
            strokeThickness: 3,
        });

        const valueStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: 0xffffff,
            stroke: { color: 0x000000 },
            strokeThickness: 4,
        });

        const marginX = 20;
        const marginY = 20;

        // Score display (Top Left)
        const scoreLabel = new Text({ text: 'Score', style: labelStyle });
        scoreLabel.position.set(marginX, marginY);
        this.container.addChild(scoreLabel);

        this.scoreVal = new Text({ text: '0', style: valueStyle });
        this.scoreVal.position.set(marginX, marginY + 25);
        this.container.addChild(this.scoreVal);

        // Time display (Top Center)
        const timeLabel = new Text({ text: 'Time', style: labelStyle });
        timeLabel.anchor.set(0.5, 0);
        timeLabel.position.set(screenWidth / 2, marginY);
        this.container.addChild(timeLabel);

        this.timeVal = new Text({ text: '0s', style: valueStyle });
        this.timeVal.anchor.set(0.5, 0);
        this.timeVal.position.set(screenWidth / 2, marginY + 25);
        this.container.addChild(this.timeVal);

        // Best Score display (Top Right)
        const bestLabel = new Text({ text: 'Best', style: labelStyle });
        bestLabel.anchor.set(1, 0);
        bestLabel.position.set(screenWidth - marginX, marginY);
        this.container.addChild(bestLabel);

        this.bestVal = new Text({ text: '0', style: valueStyle });
        this.bestVal.anchor.set(1, 0);
        this.bestVal.position.set(screenWidth - marginX, marginY + 25);
        this.container.addChild(this.bestVal);
    }

    update({ score, bestScore, elapsedTime }) {
        this.scoreVal.text = `${Math.floor(score)}`;
        this.bestVal.text = `${Math.floor(bestScore)}`;
        this.timeVal.text = `${Math.floor(elapsedTime)}s`;
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }
}