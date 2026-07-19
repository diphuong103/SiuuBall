import { Container, Graphics } from 'pixi.js';

/**
 * UIPanel — Panel/card nền tái sử dụng.
 * Hỗ trợ bo tròn, viền (border), và độ trong suốt.
 */
export class UIPanel extends Container {
    /**
     * @param {object} options
     * @param {number} [options.width=300]
     * @param {number} [options.height=200]
     * @param {number} [options.bgColor=0x1a1a2e]
     * @param {number} [options.alpha=0.9]
     * @param {number} [options.borderRadius=12]
     * @param {number} [options.borderColor=0x444466]
     * @param {number} [options.borderWidth=2]
     */
    constructor(options = {}) {
        super();

        const {
            width = 300,
            height = 200,
            bgColor = 0x1a1a2e,
            alpha = 0.9,
            borderRadius = 12,
            borderColor = 0x444466,
            borderWidth = 2,
        } = options;

        this._panelWidth = width;
        this._panelHeight = height;
        this._bgColor = bgColor;
        this._alpha = alpha;
        this._borderRadius = borderRadius;
        this._borderColor = borderColor;
        this._borderWidth = borderWidth;

        this.bg = new Graphics();
        this.addChild(this.bg);

        this._draw();
    }

    /** @private */
    _draw() {
        this.bg.clear();

        // Border (vẽ trước, lớn hơn 1 chút)
        if (this._borderWidth > 0) {
            this.bg.roundRect(0, 0, this._panelWidth, this._panelHeight, this._borderRadius);
            this.bg.fill({ color: this._borderColor, alpha: this._alpha });
        }

        // Inner fill
        const bw = this._borderWidth;
        this.bg.roundRect(bw, bw, this._panelWidth - bw * 2, this._panelHeight - bw * 2, this._borderRadius);
        this.bg.fill({ color: this._bgColor, alpha: this._alpha });
    }

    /**
     * Thay đổi kích thước panel.
     * @param {number} width
     * @param {number} height
     */
    setSize(width, height) {
        this._panelWidth = width;
        this._panelHeight = height;
        this._draw();
    }

    /** Chiều rộng panel */
    get panelWidth() {
        return this._panelWidth;
    }

    /** Chiều cao panel */
    get panelHeight() {
        return this._panelHeight;
    }
}
