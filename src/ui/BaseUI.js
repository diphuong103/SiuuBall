import { Container } from 'pixi.js';

/**
 * BaseUI — Lớp cơ sở cho tất cả màn hình UI (popup, menu, HUD).
 * Cung cấp container gốc, và các method show/hide/resize/destroy chung.
 */
export class BaseUI {
    /**
     * @param {number} screenWidth
     * @param {number} screenHeight
     */
    constructor(screenWidth, screenHeight) {
        this.container = new Container();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }

    /** Hiển thị UI */
    show() {
        this.container.visible = true;
    }

    /** Ẩn UI */
    hide() {
        this.container.visible = false;
    }

    /**
     * Cập nhật kích thước màn hình — subclass override để re-layout.
     * @param {number} screenWidth
     * @param {number} screenHeight
     */
    resize(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }

    /** Dọn dẹp tài nguyên */
    destroy() {
        this.container.destroy({ children: true });
    }
}
