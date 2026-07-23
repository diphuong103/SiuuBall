import { Container, Graphics, Text, TextStyle, Sprite, Assets } from "pixi.js";
import { GuideConfig } from "../config/GuideConfig.js";

import doubleScoreImg from '../assets/textures/orb/double_score_orb.mobile.webp';
import slowImg from '../assets/textures/orb/Slow_Motion_Orb.mobile.webp';
import shieldImg from '../assets/textures/orb/Shield_Orb.mobile.webp';
import speedUpImg from '../assets/textures/orb/Speed_Up_Orb.mobile.webp';
import projectileImg from '../assets/textures/orb/Projectile_Orb.mobile.webp';
import gravityDownImg from '../assets/textures/orb/Gravity_Down_Orb.mobile.webp';
import gravityUpImg from '../assets/textures/orb/Gravity_Up_Orb.mobile.webp';
import mysteryImg from '../assets/textures/orb/Mystery_Orb.mobile.webp';

const iconMap = {
    "Mystery Orb": mysteryImg,
    "Double Score": doubleScoreImg,
    "Slow Motion": slowImg,
    "Shield": shieldImg,
    "Speed Up": speedUpImg,
    "Bullet Attack": projectileImg,
    "Launch Down": gravityDownImg,
    "Launch Up": gravityUpImg
};

import guideVideo from '../assets/textures/media/guide_siuball.mp4';

export class GuidePopup {
    constructor(screenWidth, screenHeight, canvas) {
        this.container = new Container();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this._canvas = canvas;

        // Overlay background (darken and blur effect simulation)
        this.overlay = new Graphics();
        this.overlay.rect(0, 0, screenWidth, screenHeight);
        this.overlay.fill({ color: 0x000000, alpha: 0.8 });
        this.overlay.eventMode = 'static'; // block clicks
        this.container.addChild(this.overlay);

        // Main modal
        this.modal = new Container();

        const modalWidth = screenWidth * 0.9;
        const modalHeight = screenHeight * 0.85;
        this.modalWidth = modalWidth;
        this.modalHeight = modalHeight;
        this.modal.position.set(screenWidth / 2 - modalWidth / 2, screenHeight / 2 - modalHeight / 2);
        this.container.addChild(this.modal);

        this.modalBg = new Graphics();
        this.modalBg.roundRect(0, 0, modalWidth, modalHeight, 16);
        this.modalBg.fill({ color: 0x1a1a1a, alpha: 0.95 });
        this.modalBg.stroke({ width: 2, color: 0x4caf50 });
        this.modal.addChild(this.modalBg);

        // Header Title
        const titleStyle = new TextStyle({
            fontFamily: "Arial", fontSize: 28, fontWeight: "bold", fill: 0xffffff, align: "center"
        });
        this.title = new Text({ text: GuideConfig.title, style: titleStyle });
        this.title.anchor.set(0.5, 0);
        this.title.position.set(modalWidth / 2, 20);
        this.modal.addChild(this.title);

        // Close Button (Top right)
        this.closeIcon = this._createCloseIcon(modalWidth - 25, 25);
        this.modal.addChild(this.closeIcon);

        // Illustration Section — GIF overlay
        const graphicY = 70;
        const graphicHeight = modalHeight * 0.3;
        this.illustrationBox = new Graphics();
        this.illustrationBox.roundRect(20, graphicY, modalWidth - 40, graphicHeight, 8);
        this.illustrationBox.fill({ color: 0x111111, alpha: 1 });
        this.modal.addChild(this.illustrationBox);

        // DOM <img> for the GIF — stored so we can position + toggle it
        this._modalX = screenWidth / 2 - modalWidth / 2;
        this._modalY = screenHeight / 2 - modalHeight / 2;
        this._gifBoxX = this._modalX + 20;      // illustrationBox local x relative to modal
        this._gifBoxY = this._modalY + graphicY;
        this._gifBoxW = modalWidth - 40;
        this._gifBoxH = graphicHeight;

        const video = document.createElement('video');
        video.src = guideVideo;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.style.cssText = [
            'position:absolute',
            'object-fit:contain',
            'border-radius:8px',
            'pointer-events:none',
            'display:none',
        ].join(';');
        document.body.appendChild(video);
        this._gifEl = video;
        this._updateGifPosition();

        // Basics Section
        const basicsY = graphicY + graphicHeight + 20;
        const basicsTitleStyle = new TextStyle({ fontFamily: "Arial", fontSize: 20, fontWeight: "bold", fill: 0x4caf50 });
        this.basicsTitleStyle = basicsTitleStyle;
        this.basicsTitle = new Text({ text: GuideConfig.basicsTitle, style: basicsTitleStyle });
        this.basicsTitle.position.set(20, basicsY);
        this.modal.addChild(this.basicsTitle);

        const basicsStyle = new TextStyle({ fontFamily: "Arial", fontSize: 16, fill: 0xdddddd, wordWrap: true, wordWrapWidth: modalWidth - 40, lineHeight: 22 });
        this.basicsText = new Text({ text: GuideConfig.basics, style: basicsStyle });
        this.basicsText.position.set(20, basicsY + 30);
        this.modal.addChild(this.basicsText);

        // Item Encyclopedia Section (Scrollable)
        const itemsY = basicsY + 30 + this.basicsText.height + 20;
        this.itemsTitle = new Text({ text: GuideConfig.itemsTitle, style: basicsTitleStyle });
        this.itemsTitle.position.set(20, itemsY);
        this.modal.addChild(this.itemsTitle);

        const listY = itemsY + 30;
        // Leave room for the Close button at the bottom (approx 80px)
        const listHeight = modalHeight - listY - 80;

        this._buildScrollableList(GuideConfig.items, 20, listY, modalWidth - 40, listHeight);

        // Bottom Close Button
        this.bottomCloseBtn = this._createBottomBtn(modalWidth / 2, modalHeight - 40);
        this.modal.addChild(this.bottomCloseBtn);

        this.hide();
    }

    _createCloseIcon(x, y) {
        const btn = new Container();
        btn.position.set(x, y);
        btn.eventMode = "static";
        btn.cursor = "pointer";

        const bg = new Graphics();
        bg.circle(0, 0, 16);
        bg.fill({ color: 0x333333, alpha: 1 });
        btn.addChild(bg);

        const text = new Text({
            text: "X", style: new TextStyle({ fontFamily: "Arial", fontSize: 16, fontWeight: "bold", fill: 0xffffff })
        });
        text.anchor.set(0.5);
        btn.addChild(text);

        btn.on("pointerover", () => bg.tint = 0xff4444);
        btn.on("pointerout", () => bg.tint = 0xffffff);

        return btn;
    }

    _createBottomBtn(x, y) {
        const btn = new Container();
        btn.position.set(x, y);
        btn.eventMode = "static";
        btn.cursor = "pointer";

        const bg = new Graphics();
        bg.roundRect(-70, -20, 140, 40, 10);
        bg.fill(0x333333);
        btn.addChild(bg);

        const text = new Text({
            text: "CLOSE",
            style: new TextStyle({ fontFamily: "Arial", fontSize: 18, fontWeight: "bold", fill: 0xffffff, letterSpacing: 2 })
        });
        text.anchor.set(0.5);
        btn.addChild(text);

        btn.on("pointerover", () => bg.tint = 0x4caf50);
        btn.on("pointerout", () => bg.tint = 0xffffff);
        return btn;
    }

    _buildScrollableList(items, x, y, width, height) {
        this.listArea = new Container();
        this.listArea.position.set(x, y);
        this.modal.addChild(this.listArea);

        // Mask
        const mask = new Graphics();
        this.listMask = mask;
        mask.position.set(x, y);
        mask.rect(0, 0, width, height);
        mask.fill(0xffffff);
        this.modal.addChild(mask);
        this.listArea.mask = mask;

        // Background to catch pointer events
        const bg = new Graphics();
        bg.rect(0, 0, width, height);
        bg.fill({ color: 0x000000, alpha: 0.001 }); // invisible but clickable
        this.listArea.addChild(bg);

        this.scrollContent = new Container();
        this.listArea.addChild(this.scrollContent);

        // Populate items
        let currentY = 0;
        const itemSpacing = 16;
        for (const item of items) {
            const card = this._createItemCard(item, width);
            card.position.set(0, currentY);
            this.scrollContent.addChild(card);
            currentY += card.height + itemSpacing;
        }

        // Scrolling Logic
        this.listArea.eventMode = 'static';
        let isDragging = false;
        let startY = 0;
        let startContentY = 0;

        const maxScroll = Math.min(0, height - currentY);

        const onPointerDown = (e) => {
            isDragging = true;
            startY = e.global.y;
            startContentY = this.scrollContent.y;
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            const dy = e.global.y - startY;
            let newY = startContentY + dy;

            // Clamp scroll
            if (newY > 0) newY = 0;
            if (newY < maxScroll) newY = maxScroll;

            this.scrollContent.y = newY;
        };

        const onPointerUp = () => { isDragging = false; };

        this.listArea.on('pointerdown', onPointerDown);
        this.listArea.on('pointermove', onPointerMove);
        this.listArea.on('pointerup', onPointerUp);
        this.listArea.on('pointerupoutside', onPointerUp);

        this.listArea.on('wheel', (e) => {
            let newY = this.scrollContent.y - (e.deltaY * 0.5);
            if (newY > 0) newY = 0;
            if (newY < maxScroll) newY = maxScroll;
            this.scrollContent.y = newY;
        });
    }

    _createItemCard(item, width) {
        const card = new Container();
        const p = 12; // padding

        const bg = new Graphics();
        bg.roundRect(0, 0, width, 60, 8); // approximate height, will draw based on content if needed
        bg.fill({ color: 0x2a2a2a, alpha: 1 });
        card.addChild(bg);

        // Icon
        const iconRadius = 16;
        const imgPath = iconMap[item.name];
        if (imgPath) {
            Assets.load(imgPath).then((texture) => {
                if (card.destroyed) return;
                const sprite = new Sprite(texture);
                sprite.anchor.set(0.5);
                sprite.width = 44; // Lớn hơn một chút để tính cả quầng sáng (glow)
                sprite.height = 44;
                sprite.position.set(p + iconRadius, p + iconRadius + 4);
                sprite.blendMode = 'screen';
                card.addChild(sprite);
            });
        }


        // Title (Name + Type)
        let typeColor = 0xffffff;
        if (item.type === "Buff") typeColor = 0x4ade80;
        else if (item.type === "Debuff") typeColor = 0xff4d6d;
        else if (item.type === "Mystery") typeColor = 0xd946ef;

        const nameStyle = new TextStyle({ fontFamily: "Arial", fontSize: 16, fontWeight: "bold", fill: typeColor });
        const nameText = new Text({ text: `${item.name} (${item.type})`, style: nameStyle });
        nameText.position.set(p + iconRadius * 2 + 15, p);
        card.addChild(nameText);

        // Description text
        const descStyle = new TextStyle({ fontFamily: "Arial", fontSize: 14, fill: 0xbbbbbb, wordWrap: true, wordWrapWidth: width - (p + iconRadius * 2 + 15) - p });
        const descText = new Text({ text: item.description, style: descStyle });
        descText.position.set(nameText.x, nameText.y + nameText.height + 4);
        card.addChild(descText);

        // dynamically adjust height
        const actualHeight = Math.max(60, descText.y + descText.height + p);
        bg.clear();
        bg.roundRect(0, 0, width, actualHeight, 8);
        bg.fill({ color: 0x2a2a2a, alpha: 1 });

        return card;
    }

    _updateGifPosition() {
        const canvas = this._canvas;
        if (!canvas || !this._gifEl) return;
        const rect = canvas.getBoundingClientRect();
        // Scale factor between CSS pixels and logical PixiJS units
        const scaleX = rect.width / this.screenWidth;
        const scaleY = rect.height / this.screenHeight;
        const el = this._gifEl;
        el.style.left = (rect.left + this._gifBoxX * scaleX) + 'px';
        el.style.top = (rect.top + this._gifBoxY * scaleY) + 'px';
        el.style.width = (this._gifBoxW * scaleX) + 'px';
        el.style.height = (this._gifBoxH * scaleY) + 'px';
    }

    resize(screenWidth, screenHeight) {
        if (screenWidth === this.screenWidth && screenHeight === this.screenHeight) {
            this._updateGifPosition();
            return;
        }

        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        const modalWidth = screenWidth * 0.9;
        const modalHeight = screenHeight * 0.85;
        const modalX = screenWidth / 2 - modalWidth / 2;
        const modalY = screenHeight / 2 - modalHeight / 2;
        const graphicY = 70;
        const graphicHeight = modalHeight * 0.3;

        this.modalWidth = modalWidth;
        this.modalHeight = modalHeight;
        this.modal.position.set(modalX, modalY);

        this.overlay.clear().rect(0, 0, screenWidth, screenHeight).fill({ color: 0x000000, alpha: 0.8 });
        this.modalBg.clear()
            .roundRect(0, 0, modalWidth, modalHeight, 16)
            .fill({ color: 0x1a1a1a, alpha: 0.95 })
            .stroke({ width: 2, color: 0x4caf50 });
        this.title.position.set(modalWidth / 2, 20);
        this.closeIcon.position.set(modalWidth - 25, 25);

        this.illustrationBox.clear()
            .roundRect(20, graphicY, modalWidth - 40, graphicHeight, 8)
            .fill({ color: 0x111111, alpha: 1 });

        this._modalX = modalX;
        this._modalY = modalY;
        this._gifBoxX = modalX + 20;
        this._gifBoxY = modalY + graphicY;
        this._gifBoxW = modalWidth - 40;
        this._gifBoxH = graphicHeight;
        this._updateGifPosition();

        const basicsY = graphicY + graphicHeight + 20;
        this.basicsTitle.position.set(20, basicsY);
        this.basicsText.style.wordWrapWidth = modalWidth - 40;
        this.basicsText.position.set(20, basicsY + 30);

        const itemsY = basicsY + 30 + this.basicsText.height + 20;
        const listY = itemsY + 30;
        const listHeight = Math.max(80, modalHeight - listY - 80);
        this.itemsTitle.position.set(20, itemsY);

        this.listArea?.destroy({ children: true });
        this.listMask?.destroy();
        this._buildScrollableList(GuideConfig.items, 20, listY, modalWidth - 40, listHeight);
        this.bottomCloseBtn.position.set(modalWidth / 2, modalHeight - 40);
        this.modal.addChild(this.bottomCloseBtn);
    }

    onClose(callback) {
        this.closeIcon.on("pointertap", callback);
        this.bottomCloseBtn.on("pointertap", callback);
    }

    show() {
        this.container.visible = true;
        if (this.scrollContent) this.scrollContent.y = 0;
        this._updateGifPosition();
        if (this._gifEl) {
            this._gifEl.style.display = 'block';
            this._gifEl.play().catch(() => { });
        }
    }

    hide() {
        this.container.visible = false;
        if (this._gifEl) {
            this._gifEl.style.display = 'none';
            this._gifEl.pause();
        }
    }

    destroy() {
        this._gifEl?.remove();
        this.container.destroy({ children: true });
    }
}
