import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * Tooltip — Tooltip nhẹ hiển thị text tại vị trí bất kỳ.
 * Hỗ trợ word wrap và mũi tên trỏ xuống.
 */
export class Tooltip extends Container {
    /**
     * @param {object} options
     * @param {number} [options.maxWidth=200]
     * @param {number} [options.bgColor=0x222244]
     * @param {number} [options.textColor=0xffffff]
     * @param {number} [options.fontSize=14]
     * @param {number} [options.padding=10]
     */
    constructor(options = {}) {
        super();

        const {
            maxWidth = 200,
            bgColor = 0x222244,
            textColor = 0xffffff,
            fontSize = 14,
            padding = 10,
        } = options;

        this._maxWidth = maxWidth;
        this._bgColor = bgColor;
        this._padding = padding;

        // Background bubble
        this.bg = new Graphics();
        this.addChild(this.bg);

        // Arrow pointing down
        this.arrow = new Graphics();
        this.addChild(this.arrow);

        // Text
        this.label = new Text({
            text: '',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize,
                fill: textColor,
                wordWrap: true,
                wordWrapWidth: maxWidth - padding * 2,
            }),
        });
        this.label.position.set(padding, padding);
        this.addChild(this.label);

        this.visible = false;
    }

    /**
     * Hiển thị tooltip tại vị trí (x, y) với nội dung text.
     * Tooltip sẽ nằm TRÊN điểm (x, y), mũi tên trỏ xuống.
     * @param {number} x
     * @param {number} y
     * @param {string} text
     */
    showAt(x, y, text) {
        this.label.text = text;

        const pad = this._padding;
        const bw = this.label.width + pad * 2;
        const bh = this.label.height + pad * 2;
        const arrowSize = 8;

        // Background bubble
        this.bg.clear();
        this.bg.roundRect(0, 0, bw, bh, 6);
        this.bg.fill({ color: this._bgColor, alpha: 0.95 });

        // Arrow (tam giác trỏ xuống, ở giữa dưới bubble)
        this.arrow.clear();
        this.arrow.moveTo(bw / 2 - arrowSize, bh);
        this.arrow.lineTo(bw / 2, bh + arrowSize);
        this.arrow.lineTo(bw / 2 + arrowSize, bh);
        this.arrow.closePath();
        this.arrow.fill({ color: this._bgColor, alpha: 0.95 });

        // Đặt vị trí: tooltip nằm trên điểm target, căn giữa
        this.position.set(x - bw / 2, y - bh - arrowSize);

        this.visible = true;
    }

    /** Ẩn tooltip */
    hide() {
        this.visible = false;
    }
}
