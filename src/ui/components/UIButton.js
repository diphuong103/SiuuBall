import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * UIButton — Nút bấm tái sử dụng cho toàn bộ UI trong game.
 * Hỗ trợ hover/press feedback, enable/disable, và thay đổi label.
 */
export class UIButton extends Container {
    /**
     * @param {string} label - Chữ hiển thị trên nút
     * @param {object} options
     * @param {number} [options.width=160]
     * @param {number} [options.height=60]
     * @param {number} [options.bgColor=0x008CBA]
     * @param {number} [options.textColor=0xffffff]
     * @param {number} [options.fontSize=22]
     * @param {number} [options.borderRadius=15]
     */
    constructor(label, options = {}) {
        super();

        const {
            width = 160,
            height = 60,
            bgColor = 0x008CBA,
            textColor = 0xffffff,
            fontSize = 22,
            borderRadius = 15,
        } = options;

        this._btnWidth = width;
        this._btnHeight = height;
        this._bgColor = bgColor;
        this._enabled = true;

        // Background
        this.bg = new Graphics();
        this._drawBg(bgColor);
        this.addChild(this.bg);

        // Label text
        this.label = new Text({
            text: label,
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize,
                fontWeight: 'bold',
                fill: textColor,
            }),
        });
        this.label.anchor.set(0.5);
        this.addChild(this.label);

        // Interaction
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerover', this._onHover, this);
        this.on('pointerout', this._onOut, this);
        this.on('pointerdown', this._onPress, this);
        this.on('pointerup', this._onRelease, this);
        this.on('pointerupoutside', this._onRelease, this);
    }

    /** @private */
    _drawBg(color, alpha = 1) {
        this.bg.clear();
        this.bg.roundRect(
            -this._btnWidth / 2,
            -this._btnHeight / 2,
            this._btnWidth,
            this._btnHeight,
            15,
        );
        this.bg.fill({ color, alpha });
    }

    /** @private */
    _onHover() {
        if (!this._enabled) return;
        this._drawBg(this._lightenColor(this._bgColor, 30));
        this.scale.set(1.05);
    }

    /** @private */
    _onOut() {
        if (!this._enabled) return;
        this._drawBg(this._bgColor);
        this.scale.set(1);
    }

    /** @private */
    _onPress() {
        if (!this._enabled) return;
        this._drawBg(this._darkenColor(this._bgColor, 40));
        this.scale.set(0.95);
    }

    /** @private */
    _onRelease() {
        if (!this._enabled) return;
        this._drawBg(this._bgColor);
        this.scale.set(1);
    }

    /**
     * Đăng ký callback khi click nút.
     * @param {Function} callback
     */
    onClick(callback) {
        this.on('pointertap', callback);
    }

    /**
     * Thay đổi chữ trên nút.
     * @param {string} text
     */
    setLabel(text) {
        this.label.text = text;
    }

    /**
     * Bật/tắt nút.
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this._enabled = enabled;
        this.eventMode = enabled ? 'static' : 'none';
        this.cursor = enabled ? 'pointer' : 'default';
        this.alpha = enabled ? 1 : 0.5;
        this._drawBg(this._bgColor);
        this.scale.set(1);
    }

    /** @private — Làm sáng màu */
    _lightenColor(color, amount) {
        let r = (color >> 16) & 0xff;
        let g = (color >> 8) & 0xff;
        let b = color & 0xff;
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
        return (r << 16) | (g << 8) | b;
    }

    /** @private — Làm tối màu */
    _darkenColor(color, amount) {
        let r = (color >> 16) & 0xff;
        let g = (color >> 8) & 0xff;
        let b = color & 0xff;
        r = Math.max(0, r - amount);
        g = Math.max(0, g - amount);
        b = Math.max(0, b - amount);
        return (r << 16) | (g << 8) | b;
    }
}
