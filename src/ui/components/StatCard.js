import { Container, Text, TextStyle } from 'pixi.js';

/**
 * StatCard — Card hiển thị một chỉ số (label + giá trị).
 * Dùng trong HUD và GameOver để hiển thị Score, Best, Time, v.v.
 */
export class StatCard extends Container {
    /**
     * @param {string} label - Tên chỉ số (ví dụ: "Score", "Best", "Time")
     * @param {object} options
     * @param {number} [options.labelColor=0xffaaaa]
     * @param {number} [options.valueColor=0xffffff]
     * @param {number} [options.labelFontSize=18]
     * @param {number} [options.valueFontSize=28]
     * @param {string} [options.align='center'] - 'left' | 'center' | 'right'
     */
    constructor(label, options = {}) {
        super();

        const {
            labelColor = 0xffaaaa,
            valueColor = 0xffffff,
            labelFontSize = 18,
            valueFontSize = 28,
            align = 'center',
        } = options;

        this._align = align;

        // Label
        const labelStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: labelFontSize,
            fill: labelColor,
            stroke: { color: 0x000000 },
            strokeThickness: 2,
        });
        this.labelText = new Text({ text: label, style: labelStyle });

        // Value
        const valueStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: valueFontSize,
            fontWeight: 'bold',
            fill: valueColor,
            stroke: { color: 0x000000 },
            strokeThickness: 3,
        });
        this.valueText = new Text({ text: '0', style: valueStyle });

        // Anchor theo alignment
        const anchorX = align === 'left' ? 0 : align === 'right' ? 1 : 0.5;
        this.labelText.anchor.set(anchorX, 0);
        this.valueText.anchor.set(anchorX, 0);

        // Bố cục dọc: label ở trên, value ở dưới
        this.labelText.position.set(0, 0);
        this.valueText.position.set(0, labelFontSize + 6);

        this.addChild(this.labelText);
        this.addChild(this.valueText);
    }

    /**
     * Cập nhật giá trị hiển thị.
     * @param {string|number} val
     */
    setValue(val) {
        this.valueText.text = String(val);
    }

    /**
     * Cập nhật label.
     * @param {string} text
     */
    setLabel(text) {
        this.labelText.text = text;
    }
}
