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
        this.scoreLabel = new Text({ text: 'Score', style: labelStyle });
        this.scoreLabel.position.set(marginX, marginY);
        this.container.addChild(this.scoreLabel);

        this.scoreVal = new Text({ text: '0', style: valueStyle });
        this.scoreVal.position.set(marginX, marginY + 25);
        this.container.addChild(this.scoreVal);

        // Time display (Top Center)
        this.timeLabel = new Text({ text: 'Time', style: labelStyle });
        this.timeLabel.anchor.set(0.5, 0);
        this.timeLabel.position.set(screenWidth / 2, marginY);
        this.container.addChild(this.timeLabel);

        this.timeVal = new Text({ text: '0s', style: valueStyle });
        this.timeVal.anchor.set(0.5, 0);
        this.timeVal.position.set(screenWidth / 2, marginY + 25);
        this.container.addChild(this.timeVal);

        // Best Score display (Top Right)
        this.bestLabel = new Text({ text: 'Best', style: labelStyle });
        this.bestLabel.anchor.set(1, 0);
        this.bestLabel.position.set(screenWidth - marginX, marginY);
        this.container.addChild(this.bestLabel);

        this.bestVal = new Text({ text: '0', style: valueStyle });
        this.bestVal.anchor.set(1, 0);
        this.bestVal.position.set(screenWidth - marginX, marginY + 25);
        this.container.addChild(this.bestVal);

        this.lastScoreText = '0';
        this.lastBestScoreText = '0';
        this.lastTimeText = '0s';
    }

    update({ score, bestScore, elapsedTime }) {
        const scoreText = `${Math.floor(score)}`;
        const bestScoreText = `${Math.floor(bestScore)}`;
        const timeText = `${Math.floor(elapsedTime)}s`;
        if (scoreText !== this.lastScoreText) {
            this.lastScoreText = scoreText;
            this.scoreVal.text = scoreText;
        }
        if (bestScoreText !== this.lastBestScoreText) {
            this.lastBestScoreText = bestScoreText;
            this.bestVal.text = bestScoreText;
        }
        if (timeText !== this.lastTimeText) {
            this.lastTimeText = timeText;
            this.timeVal.text = timeText;
        }
    }

    resize(screenWidth) {
        const marginX = 20;
        const marginY = 20;

        this.scoreLabel.position.set(marginX, marginY);
        this.scoreVal.position.set(marginX, marginY + 25);

        this.timeLabel.position.set(screenWidth / 2, marginY);
        this.timeVal.position.set(screenWidth / 2, marginY + 25);

        this.bestLabel.position.set(screenWidth - marginX, marginY);
        this.bestVal.position.set(screenWidth - marginX, marginY + 25);
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }
}
