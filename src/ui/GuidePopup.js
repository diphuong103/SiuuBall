import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { GuideConfig } from "../config/GuideConfig.js";

export class GuidePopup {
    constructor(screenWidth, screenHeight) {
        this.container = new Container();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        // Overlay background (darken and blur effect simulation)
        const overlay = new Graphics();
        overlay.rect(0, 0, screenWidth, screenHeight);
        overlay.fill({ color: 0x000000, alpha: 0.85 });
        overlay.eventMode = 'static'; // block clicks
        this.container.addChild(overlay);

        // Main modal
        this.modal = new Container();

        const modalWidth = screenWidth * 0.9;
        const modalHeight = screenHeight * 0.85;
        this.modal.position.set(screenWidth / 2 - modalWidth / 2, screenHeight / 2 - modalHeight / 2);
        this.container.addChild(this.modal);

        const modalBg = new Graphics();
        modalBg.roundRect(0, 0, modalWidth, modalHeight, 16);
        modalBg.fill({ color: 0x1f1f1f, alpha: 1 });
        modalBg.stroke({ width: 2, color: 0x4caf50 });
        this.modal.addChild(modalBg);

        // Header Title
        const titleStyle = new TextStyle({
            fontFamily: "Arial", fontSize: 28, fontWeight: "bold", fill: 0xffffff, align: "center"
        });
        const title = new Text({ text: GuideConfig.title, style: titleStyle });
        title.anchor.set(0.5, 0);
        title.position.set(modalWidth / 2, 20);
        this.modal.addChild(title);

        // Close Button (Top right)
        this.closeIcon = this._createCloseIcon(modalWidth - 25, 25);
        this.modal.addChild(this.closeIcon);

        // Illustration Section (Placeholder video/gif)
        const graphicY = 70;
        const graphicHeight = modalHeight * 0.3; // almost a third/half
        const illustrationBox = new Graphics();
        illustrationBox.roundRect(20, graphicY, modalWidth - 40, graphicHeight, 8);
        illustrationBox.fill({ color: 0x333333, alpha: 1 });

        const placeholderText = new Text({
            text: "Illustration\n(Video / GIF Placeholder)",
            style: new TextStyle({ fontFamily: "Arial", fontSize: 18, fill: 0x888888, align: 'center' })
        });
        placeholderText.anchor.set(0.5);
        placeholderText.position.set(modalWidth / 2, graphicY + graphicHeight / 2);

        this.modal.addChild(illustrationBox, placeholderText);

        // Basics Section
        const basicsY = graphicY + graphicHeight + 20;
        const basicsTitleStyle = new TextStyle({ fontFamily: "Arial", fontSize: 20, fontWeight: "bold", fill: 0x4caf50 });
        const basicsTitle = new Text({ text: GuideConfig.basicsTitle, style: basicsTitleStyle });
        basicsTitle.position.set(20, basicsY);
        this.modal.addChild(basicsTitle);

        const basicsStyle = new TextStyle({ fontFamily: "Arial", fontSize: 16, fill: 0xdddddd, wordWrap: true, wordWrapWidth: modalWidth - 40, lineHeight: 22 });
        const basicsText = new Text({ text: GuideConfig.basics, style: basicsStyle });
        basicsText.position.set(20, basicsY + 30);
        this.modal.addChild(basicsText);

        // Item Encyclopedia Section (Scrollable)
        const itemsY = basicsY + 30 + basicsText.height + 20;
        const itemsTitle = new Text({ text: GuideConfig.itemsTitle, style: basicsTitleStyle });
        itemsTitle.position.set(20, itemsY);
        this.modal.addChild(itemsTitle);

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
        const icon = new Graphics();
        icon.circle(p + iconRadius, p + iconRadius + 4, iconRadius);
        icon.fill(item.color);
        icon.stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
        card.addChild(icon);

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

    onClose(callback) {
        this.closeIcon.on("pointerdown", callback);
        this.bottomCloseBtn.on("pointerdown", callback);
    }

    show() {
        this.container.visible = true;
        // reset scroll
        if (this.scrollContent) this.scrollContent.y = 0;
    }

    hide() {
        this.container.visible = false;
    }
}
