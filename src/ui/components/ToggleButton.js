import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * ToggleButton — Nút bật/tắt (toggle switch) cho settings.
 * Hiển thị label bên trái và toggle track + knob bên phải.
 */
export class ToggleButton extends Container {
    /**
     * @param {string} label - Chữ mô tả (ví dụ: "Sound", "Music")
     * @param {boolean} [initialState=false] - Trạng thái ban đầu (true = ON)
     * @param {object} options
     * @param {number} [options.trackWidth=50]
     * @param {number} [options.trackHeight=26]
     * @param {number} [options.onColor=0x4CAF50]
     * @param {number} [options.offColor=0x555555]
     * @param {number} [options.knobColor=0xffffff]
     * @param {number} [options.labelColor=0xdddddd]
     * @param {number} [options.fontSize=20]
     */
    constructor(label, initialState = false, options = {}) {
        super();

        const {
            trackWidth = 50,
            trackHeight = 26,
            onColor = 0x4CAF50,
            offColor = 0x555555,
            knobColor = 0xffffff,
            labelColor = 0xdddddd,
            fontSize = 20,
        } = options;

        this._state = initialState;
        this._trackWidth = trackWidth;
        this._trackHeight = trackHeight;
        this._onColor = onColor;
        this._offColor = offColor;
        this._knobColor = knobColor;
        this._toggleCallbacks = [];

        // Label text (bên trái)
        this.labelText = new Text({
            text: label,
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize,
                fill: labelColor,
            }),
        });
        this.labelText.anchor.set(0, 0.5);
        this.labelText.position.set(0, trackHeight / 2);
        this.addChild(this.labelText);

        // Toggle track + knob (bên phải)
        const trackX = 180; // Khoảng cách từ trái cho label

        this.track = new Graphics();
        this.track.position.set(trackX, 0);
        this.addChild(this.track);

        this.knob = new Graphics();
        this.knob.position.set(trackX, 0);
        this.addChild(this.knob);

        this._trackX = trackX;
        this._drawToggle();

        // Interaction — cả vùng đều click được
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', this._toggle, this);
    }

    /** @private */
    _drawToggle() {
        const { _trackWidth: tw, _trackHeight: th, _state: on } = this;
        const radius = th / 2;
        const knobRadius = radius - 3;
        const knobPadding = 3;

        // Track
        this.track.clear();
        this.track.roundRect(0, 0, tw, th, radius);
        this.track.fill(on ? this._onColor : this._offColor);

        // Knob
        const knobX = on
            ? tw - knobRadius - knobPadding
            : knobRadius + knobPadding;
        const knobY = th / 2;

        this.knob.clear();
        this.knob.circle(knobX, knobY, knobRadius);
        this.knob.fill(this._knobColor);
    }

    /** @private */
    _toggle() {
        this._state = !this._state;
        this._drawToggle();
        for (const cb of this._toggleCallbacks) {
            cb(this._state);
        }
    }

    /**
     * Đăng ký callback khi toggle thay đổi.
     * @param {(state: boolean) => void} callback
     */
    onToggle(callback) {
        this._toggleCallbacks.push(callback);
    }

    /**
     * Lấy trạng thái hiện tại.
     * @returns {boolean}
     */
    getState() {
        return this._state;
    }

    /**
     * Đặt trạng thái từ bên ngoài (không trigger callback).
     * @param {boolean} state
     */
    setState(state) {
        this._state = state;
        this._drawToggle();
    }
}
