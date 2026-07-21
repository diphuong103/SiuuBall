import { Graphics, Text, TextStyle, Container } from 'pixi.js';
import { BaseUI } from './BaseUI.js';
import { UIButton } from './components/UIButton.js';
import { ToggleButton } from './components/ToggleButton.js';

/**
 * SettingsPopup — Popup cài đặt với overlay nền mờ.
 * Chứa toggle Sound/Music, chọn độ khó, reset điểm cao, và nút Close.
 */
export class SettingsPopup extends BaseUI {
    /**
     * @param {number} screenWidth
     * @param {number} screenHeight
     */
    constructor(screenWidth, screenHeight) {
        super(screenWidth, screenHeight);
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        // --- Overlay nền bán trong suốt ---
        this.overlay = new Graphics();
        this.overlay.rect(0, 0, screenWidth, screenHeight);
        this.overlay.fill({ color: 0x000000, alpha: 0.8 });
        this.overlay.eventMode = 'static'; // Chặn click xuyên qua
        this.container.addChild(this.overlay);

        // --- Panel nền ---
        const panelW = 400;
        const panelH = 440; // giảm chiều cao vì bỏ Debug Toggle
        const panelX = (screenWidth - panelW) / 2;
        const panelY = (screenHeight - panelH) / 2;

        this.panel = new Graphics();
        this.panel.roundRect(panelX, panelY, panelW, panelH, 16);
        this.panel.fill({ color: 0x1a1a1a, alpha: 0.95 });
        this.container.addChild(this.panel);

        // --- Title ---
        const title = new Text({
            text: 'SETTINGS',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 32,
                fontWeight: 'bold',
                fill: 0xffffff,
            }),
        });
        title.anchor.set(0.5);
        title.position.set(screenWidth / 2, panelY + 45);
        this.container.addChild(title);

        // --- Divider ---
        const divider = new Graphics();
        divider.rect(panelX + 20, panelY + 75, panelW - 40, 2);
        divider.fill(0x333355);
        this.container.addChild(divider);

        let currentY = panelY + 110;

        // --- Sound Toggle ---
        this.soundToggle = new ToggleButton('Sound', true, {
            trackWidth: 48, trackHeight: 24, fontSize: 20,
        });
        this.soundToggle.position.set(panelX + 40, currentY);
        this.container.addChild(this.soundToggle);
        currentY += 50;

        // --- Music Toggle ---
        this.musicToggle = new ToggleButton('Music', true, {
            trackWidth: 48, trackHeight: 24, fontSize: 20,
        });
        this.musicToggle.position.set(panelX + 40, currentY);
        this.container.addChild(this.musicToggle);
        currentY += 60;

        // --- Difficulty Label ---
        const diffLabel = new Text({
            text: 'Difficulty:',
            style: new TextStyle({ fontFamily: 'Arial', fontSize: 20, fill: 0xdddddd })
        });
        diffLabel.position.set(panelX + 40, currentY);
        this.container.addChild(diffLabel);

        currentY += 40;

        // --- Difficulty Buttons ---
        this.btnEasy = new UIButton('EASY', { width: 90, height: 40, bgColor: 0x4CAF50, fontSize: 16 });
        this.btnEasy.position.set(panelX + 85, currentY);
        this.container.addChild(this.btnEasy);

        this.btnNormal = new UIButton('NORMAL', { width: 90, height: 40, bgColor: 0x008CBA, fontSize: 16 });
        this.btnNormal.position.set(panelX + 195, currentY);
        this.container.addChild(this.btnNormal);

        this.btnHard = new UIButton('HARD', { width: 90, height: 40, bgColor: 0xff4444, fontSize: 16 });
        this.btnHard.position.set(panelX + 305, currentY);
        this.container.addChild(this.btnHard);

        currentY += 70;

        // --- Reset Best Score ---
        this.btnReset = new UIButton('RESET BEST SCORE', { width: 220, height: 40, bgColor: 0x883333, fontSize: 16 });
        this.btnReset.position.set(screenWidth / 2, currentY);
        this.container.addChild(this.btnReset);

        // --- Close button ---
        this.closeButton = new UIButton('CLOSE', {
            width: 140, height: 50, bgColor: 0x444444, fontSize: 20, borderRadius: 12,
        });
        this.closeButton.position.set(screenWidth / 2, panelY + panelH - 45);
        this.container.addChild(this.closeButton);

        // --- State ---
        this.currentDifficulty = 'NORMAL';
        this._updateDifficultyVisuals();

        // Internals for settings
        this.btnEasy.onClick(() => this._setDifficulty('EASY'));
        this.btnNormal.onClick(() => this._setDifficulty('NORMAL'));
        this.btnHard.onClick(() => this._setDifficulty('HARD'));

        // Reset best score -> hiện toast đẹp thay vì console.log
        this.btnReset.onClick(() => this._handleResetScore());

        // --- Toast thông báo (khởi tạo sẵn, ẩn mặc định) ---
        this._createToast();

        this.hide();
    }

    _setDifficulty(level) {
        this.currentDifficulty = level;
        this._updateDifficultyVisuals();
        if (this._onDifficultyCb) this._onDifficultyCb(level);
    }

    _updateDifficultyVisuals() {
        this.btnEasy.alpha = this.currentDifficulty === 'EASY' ? 1.0 : 0.4;
        this.btnNormal.alpha = this.currentDifficulty === 'NORMAL' ? 1.0 : 0.4;
        this.btnHard.alpha = this.currentDifficulty === 'HARD' ? 1.0 : 0.4;
        this.btnEasy.scale.set(this.currentDifficulty === 'EASY' ? 1.1 : 1.0);
        this.btnNormal.scale.set(this.currentDifficulty === 'NORMAL' ? 1.1 : 1.0);
        this.btnHard.scale.set(this.currentDifficulty === 'HARD' ? 1.1 : 1.0);
    }

    _handleResetScore() {
        if (this._onResetScoreCb) this._onResetScoreCb();
        this.showToast('Đã reset điểm cao!');
    }

    // =========================================================
    // TOAST NOTIFICATION (hiện thông báo đẹp trên màn hình)
    // =========================================================
    _createToast() {
        this.toast = new Container();
        this.toast.alpha = 0;
        this.toast.visible = false;

        const toastBg = new Graphics();
        this.toastBg = toastBg;
        this.container.addChild(this.toast);

        this.toastText = new Text({
            text: '',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fontWeight: 'bold',
                fill: 0xffffff,
            }),
        });
        this.toastText.anchor.set(0.5);

        this.toast.addChild(toastBg, this.toastText);
    }

    /**
     * Hiện thông báo dạng toast ở dưới panel, tự ẩn sau vài giây.
     * @param {string} message
     */
    showToast(message) {
        this.toastText.text = message;

        const paddingX = 20;
        const paddingY = 12;
        const w = this.toastText.width + paddingX * 2;
        const h = this.toastText.height + paddingY * 2;

        this.toastBg.clear();
        this.toastBg.roundRect(-w / 2, -h / 2, w, h, 12);
        this.toastBg.fill({ color: 0x2e7d32, alpha: 0.95 }); // xanh lá báo thành công
        this.toastBg.stroke({ width: 2, color: 0x4caf50, alpha: 0.9 });

        this.toastText.position.set(0, 0);

        // Vị trí: giữa màn hình, hơi cao hơn đáy
        this.toast.position.set(this.screenWidth / 2, this.screenHeight * 0.82);
        this.toast.visible = true;
        this.toast.alpha = 0;
        this.toast.scale.set(0.9);

        // Clear timer cũ nếu có (spam click reset)
        if (this._toastTimeout) clearTimeout(this._toastTimeout);
        if (this._toastRAF) cancelAnimationFrame(this._toastRAF);

        // Fade-in + scale nhẹ (không cần thư viện tween ngoài)
        const fadeInDuration = 180; // ms
        const holdDuration = 1600; // ms
        const fadeOutDuration = 300; // ms
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;

            if (elapsed < fadeInDuration) {
                const t = elapsed / fadeInDuration;
                this.toast.alpha = t;
                this.toast.scale.set(0.9 + 0.1 * t);
                this._toastRAF = requestAnimationFrame(animate);
            } else if (elapsed < fadeInDuration + holdDuration) {
                this.toast.alpha = 1;
                this.toast.scale.set(1);
                this._toastRAF = requestAnimationFrame(animate);
            } else if (elapsed < fadeInDuration + holdDuration + fadeOutDuration) {
                const t = (elapsed - fadeInDuration - holdDuration) / fadeOutDuration;
                this.toast.alpha = 1 - t;
                this._toastRAF = requestAnimationFrame(animate);
            } else {
                this.toast.visible = false;
                this._toastRAF = null;
            }
        };

        this._toastRAF = requestAnimationFrame(animate);
    }

    // --- Hooks ---
    onClose(callback) { this.closeButton.onClick(callback); }
    onSoundToggle(callback) { this.soundToggle.onToggle(callback); }
    onMusicToggle(callback) { this.musicToggle.onToggle(callback); }
    onDifficultySelect(callback) { this._onDifficultyCb = callback; }
    onResetScore(callback) { this._onResetScoreCb = callback; }
}