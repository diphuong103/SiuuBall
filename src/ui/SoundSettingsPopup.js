import { Graphics, Text, TextStyle } from 'pixi.js';
import { BaseUI } from './BaseUI.js';
import { UIButton } from './components/UIButton.js';
import { ToggleButton } from './components/ToggleButton.js';

/**
 * SettingsPopup — Popup cài đặt với overlay nền mờ.
 * Chứa toggle Sound, và nút Close.
 */
export class SoundSettingsPopup extends BaseUI {
    /**
     * @param {number} screenWidth
     * @param {number} screenHeight
     */
    constructor(screenWidth, screenHeight) {
        super(screenWidth, screenHeight);

        // --- Overlay nền bán trong suốt ---
        this.overlay = new Graphics();
        this.overlay.rect(0, 0, screenWidth, screenHeight);
        this.overlay.fill({ color: 0x000000, alpha: 0.75 });
        this.overlay.eventMode = 'static'; // Chặn click xuyên qua
        this.container.addChild(this.overlay);

        // --- Panel nền ---
        const panelW = 320;
        const panelH = 300;
        const panelX = (screenWidth - panelW) / 2;
        const panelY = (screenHeight - panelH) / 2;

        this.panel = new Graphics();
        this.panel.roundRect(panelX, panelY, panelW, panelH, 16);
        this.panel.fill({ color: 0x1a1a2e, alpha: 0.95 });
        this.container.addChild(this.panel);

        // --- Title ---
        this.title = new Text({
            text: 'SETTINGS',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 32,
                fontWeight: 'bold',
                fill: 0xffffff,
            }),
        });
        this.title.anchor.set(0.5);
        this.title.position.set(screenWidth / 2, panelY + 45);
        this.container.addChild(this.title);

        // --- Divider ---
        this.divider = new Graphics();
        this.divider.rect(panelX + 20, panelY + 75, panelW - 40, 2);
        this.divider.fill(0x333355);
        this.container.addChild(this.divider);

        // --- Sound Toggle ---
        this.soundToggle = new ToggleButton('Sound', true, {
            trackWidth: 48,
            trackHeight: 24,
            fontSize: 20,
        });
        this.soundToggle.position.set(panelX + 30, panelY + 100);
        this.container.addChild(this.soundToggle);

        // --- Music Toggle ---
        this.musicToggle = new ToggleButton('Music', true, {
            trackWidth: 48,
            trackHeight: 24,
            fontSize: 20,
        });
        this.musicToggle.position.set(panelX + 30, panelY + 150);
        this.container.addChild(this.musicToggle);

        // --- Close button ---
        this.closeButton = new UIButton('CLOSE', {
            width: 140,
            height: 50,
            bgColor: 0xcc3333,
            fontSize: 20,
            borderRadius: 12,
        });
        this.closeButton.position.set(screenWidth / 2, panelY + panelH - 45);
        this.container.addChild(this.closeButton);

        // Mặc định ẩn
        this.hide();
    }

    /**
     * Đăng ký callback khi bấm Close.
     * @param {Function} callback
     */
    onClose(callback) {
        this.closeButton.onClick(callback);
    }

    /**
     * Đăng ký callback khi Sound toggle thay đổi.
     * @param {(state: boolean) => void} callback
     */
    onSoundToggle(callback) {
        this.soundToggle.onToggle(callback);
    }

    /**
     * Đăng ký callback khi Music toggle thay đổi.
     * @param {(state: boolean) => void} callback
     */
    onMusicToggle(callback) {
        this.musicToggle.onToggle(callback);
    }

    setSoundEnabled(enabled) {
        this.soundToggle.setState(enabled);
    }

    setMusicEnabled(enabled) {
        this.musicToggle.setState(enabled);
    }

    resize(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        const panelW = 320;
        const panelH = 300;
        const panelX = (screenWidth - panelW) / 2;
        const panelY = (screenHeight - panelH) / 2;

        this.overlay.clear().rect(0, 0, screenWidth, screenHeight).fill({ color: 0x000000, alpha: 0.75 });
        this.panel.clear().roundRect(panelX, panelY, panelW, panelH, 16).fill({ color: 0x1a1a2e, alpha: 0.95 });
        this.title.position.set(screenWidth / 2, panelY + 45);
        this.divider.clear().rect(panelX + 20, panelY + 75, panelW - 40, 2).fill(0x333355);
        this.soundToggle.position.set(panelX + 30, panelY + 100);
        this.musicToggle.position.set(panelX + 30, panelY + 150);
        this.closeButton.position.set(screenWidth / 2, panelY + panelH - 45);
    }
}
