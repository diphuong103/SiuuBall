import { Container, Text, Graphics, TextStyle, Sprite } from "pixi.js";

import menuMusic1 from "../assets/audio/murart---acerola---speedup---part1---35_s-made-with-Voicemod_bg_music3.mp3";
import menuMusic2 from "../assets/audio/ohne-dich-(schlaf-ich-heute-nacht-nicht-ein)-speedup-nopitch-v2-made-with-Voicemod_bgmusic.mp3";
import menuMusic from "../assets/audio/patapim-speed-up-made-with-Voicemod_bg_music2.mp3";
import clickSfx from "../assets/audio/sfx/click.mp3";
import hoverSfx from "../assets/audio/sfx/whoosh-sfx.mp3";

// Màu mặc định cho bảng chọn màu vẽ line
const DEFAULT_LINE_COLORS = [
  0x4dd0ff, // cyan (mặc định)
  0xff4444, // đỏ
  0xffd60a, // vàng
  0x4caf50, // xanh lá
  0x9d4edd, // tím
  0xffffff, // trắng
];

// Placeholder cho bóng (thay bằng texture thật khi bạn có design)
const DEFAULT_BALL_OPTIONS = [
  { name: "Classic", color: 0xffffff, texture: null },
  { name: "Fire", color: 0xff6b35, texture: null },
  { name: "Ice", color: 0x4cc9f0, texture: null },
  { name: "Gold", color: 0xffd60a, texture: null },
  { name: "Royal", color: 0x9d4edd, texture: null },
];

export class MainMenu {
  constructor(screenWidth, screenHeight) {
    this.container = new Container();
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // Audio
    this._bgMusic = new Audio(menuMusic);
    this._bgMusic.loop = true;
    this._bgMusic.volume = 0.4;

    //sfx
    this._clickSfx = new Audio(clickSfx);
    this._clickSfx.volume = 0.6;
    this._hoverSfx = new Audio(hoverSfx);
    this._hoverSfx.volume = 0.25;

    // State
    this.ballOptions = DEFAULT_BALL_OPTIONS;
    this.ballIndex = 0;
    this.lineColors = DEFAULT_LINE_COLORS;
    this.selectedColorIndex = 0;
    this.isSoundOn = true;

    // Callbacks (gán sau qua onXxx)
    this._onBallChangeCb = null;
    this._onColorSelectCb = null;

    // ===== Background đậm (bán trong suốt để thấy ảnh nền) =====
    const bg = new Graphics();
    bg.rect(0, 0, screenWidth, screenHeight);
    bg.fill({ color: 0x0a0a0a, alpha: 0 }); // Đổi alpha thành 0 để hiện background ảnh đằng sau
    bg.eventMode = "static";
    this.container.addChild(bg);

    // ===== Title =====
    const titleStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 50,
      fontWeight: "bold",
      fill: 0x4caf50,
      align: "center",
      dropShadow: {
        alpha: 0.5,
        angle: Math.PI / 6,
        blur: 4,
        color: 0x000000,
        distance: 6,
      },
    });
    const titleText = new Text({ text: "", style: titleStyle });
    titleText.anchor.set(0.5);
    titleText.position.set(screenWidth / 2, screenHeight * 0.14);
    this.container.addChild(titleText);

    // ===== Ball selector (slideshow) =====
    this._createBallSelector(screenWidth, screenHeight);

    // ===== Color picker =====
    this._createColorPicker(screenWidth, screenHeight);

    // ===== Play button =====
    this._createPlayButton(screenWidth, screenHeight);

    // ===== Settings button (dưới Play) =====
    this._createSettingsButton(screenWidth, screenHeight);

    // ===== Icon buttons góc trên (Tooltip/Help + Sound) =====
    this._createTopIcons(screenWidth);
  }

  // =========================================================
  // BALL SELECTOR
  // =========================================================
  _createBallSelector(screenWidth, screenHeight) {
    // Tạo slideshow chọn bóng
    const centerX = screenWidth / 2;
    const centerY = screenHeight * 0.35;

    this.ballSelector = new Container();
    this.ballSelector.position.set(centerX, centerY);
    this.container.addChild(this.ballSelector);

    // Label
    const label = new Text({
      text: "CHỌN BÓNG",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 14,
        fontWeight: "bold",
        fill: 0xffffff,
        letterSpacing: 2,
      }),
    });
    label.anchor.set(0.5);
    label.position.set(0, -70);
    this.ballSelector.addChild(label);

    // Khung tròn hiển thị bóng
    this.ballPreviewContainer = new Container();
    this.ballSelector.addChild(this.ballPreviewContainer);

    const ringBg = new Graphics();
    ringBg.circle(0, 0, 46);
    ringBg.fill({ color: 0x1a1a1a, alpha: 1 });
    ringBg.stroke({ width: 2, color: 0x333333 });
    this.ballPreviewContainer.addChild(ringBg);

    this.ballGraphic = new Container();
    this.ballPreviewContainer.addChild(this.ballGraphic);

    // Tên bóng
    this.ballNameText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 16,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    this.ballNameText.anchor.set(0.5);
    this.ballNameText.position.set(0, 66);
    this.ballSelector.addChild(this.ballNameText);

    // Mũi tên trái
    this.leftArrow = this._createArrowButton(-90, 0, "left");
    this.ballSelector.addChild(this.leftArrow);

    // Mũi tên phải
    this.rightArrow = this._createArrowButton(90, 0, "right");
    this.ballSelector.addChild(this.rightArrow);

    // Dot indicator
    this.dotsContainer = new Container();
    this.dotsContainer.position.set(0, 90);
    this.ballSelector.addChild(this.dotsContainer);

    this.leftArrow.on("pointerdown", () => {
      this._playClickSfx();
      this._changeBall(-1);
    });
    this.rightArrow.on("pointerdown", () => {
      this._playClickSfx();
      this._changeBall(1);
    });

    this._renderBall();
  }

  _createArrowButton(x, y, direction) {
    // direction: "left" hoặc "right"
    const btn = new Container();
    btn.position.set(x, y);
    btn.eventMode = "static";
    btn.cursor = "pointer";

    const hit = new Graphics();
    hit.circle(0, 0, 22);
    hit.fill({ color: 0x1a1a1a, alpha: 1 });
    hit.stroke({ width: 2, color: 0x333333 });
    btn.addChild(hit);

    const arrow = new Graphics();
    const size = 8;
    if (direction === "left") {
      arrow.moveTo(size * 0.4, -size);
      arrow.lineTo(-size * 0.6, 0);
      arrow.lineTo(size * 0.4, size);
    } else {
      arrow.moveTo(-size * 0.4, -size);
      arrow.lineTo(size * 0.6, 0);
      arrow.lineTo(-size * 0.4, size);
    }
    arrow.closePath();
    arrow.fill(0xffffff);
    btn.addChild(arrow);

    btn.on("pointerover", () => {
      hit.tint = 0x4caf50;
    });
    btn.on("pointerout", () => {
      hit.tint = 0xffffff;
    });

    return btn;
  }

  _changeBall(delta) {
    // Cập nhật ballIndex
    const len = this.ballOptions.length;
    this.ballIndex = (this.ballIndex + delta + len) % len;
    this._renderBall();
    if (this._onBallChangeCb) {
      this._onBallChangeCb(this.ballOptions[this.ballIndex], this.ballIndex);
    }
  }

  _renderBall() {
    const option = this.ballOptions[this.ballIndex];

    for (const child of this.ballGraphic.removeChildren()) {
      child.destroy({ children: true });
    }

    if (option.texture) {
      // Nếu bạn đã import ảnh bóng thật (PIXI.Texture)
      const sprite = new Sprite(option.texture);
      sprite.anchor.set(0.5);
      const targetSize = 72;
      const scale =
        targetSize / Math.max(sprite.texture.width, sprite.texture.height);
      sprite.scale.set(scale);
      this.ballGraphic.addChild(sprite);
    } else {
      // Placeholder: hình tròn màu + viền sáng nhẹ
      const ball = new Graphics();
      ball.circle(0, 0, 36);
      ball.fill(option.color);
      ball.stroke({ width: 2, color: 0xffffff, alpha: 0.3 });
      // Highlight nhỏ tạo cảm giác 3D
      ball.circle(-12, -12, 10);
      ball.fill({ color: 0xffffff, alpha: 0.35 });
      this.ballGraphic.addChild(ball);
    }

    this.ballNameText.text = option.name || `Ball ${this.ballIndex + 1}`;
    this._renderDots();
  }

  _renderDots() {
    for (const child of this.dotsContainer.removeChildren()) {
      child.destroy({ children: true });
    }
    const count = this.ballOptions.length;
    const spacing = 14;
    const startX = -((count - 1) * spacing) / 2;

    for (let i = 0; i < count; i++) {
      const dot = new Graphics();
      dot.circle(0, 0, i === this.ballIndex ? 4 : 3);
      dot.fill(i === this.ballIndex ? 0x4caf50 : 0x555555);
      dot.position.set(startX + i * spacing, 0);
      this.dotsContainer.addChild(dot);
    }
  }

  /**
   * Gọi hàm này khi bạn có texture bóng thật:
   * mainMenu.setBallOptions([
   *   { name: 'Fire Ball', texture: PIXI.Assets.get('fireBall') },
   *   ...
   * ]);
   */
  setBallOptions(options) {
    this.ballOptions = options;
    this.ballIndex = 0;
    this._renderBall();
  }

  getSelectedBall() {
    return this.ballOptions[this.ballIndex];
  }

  // =========================================================
  // COLOR PICKER (chọn màu vẽ line)
  // =========================================================
  _createColorPicker(screenWidth, screenHeight) {
    const centerX = screenWidth / 2;
    const centerY = screenHeight * 0.52;

    this.colorPickerContainer = new Container();
    this.colorPickerContainer.position.set(centerX, centerY);
    this.container.addChild(this.colorPickerContainer);

    const label = new Text({
      text: "MÀU VẼ",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 14,
        fontWeight: "bold",
        fill: 0xffffff,
        letterSpacing: 2,
      }),
    });
    label.anchor.set(0.5);
    label.position.set(0, -28);
    this.colorPickerContainer.addChild(label);

    // Nút chính hiển thị màu đang chọn — bấm vào để mở/đóng bảng màu
    this.colorButton = new Container();
    this.colorButton.eventMode = "static";
    this.colorButton.cursor = "pointer";

    const colorBtnBg = new Graphics();
    colorBtnBg.roundRect(-60, -22, 120, 44, 12);
    colorBtnBg.fill(0x1a1a1a);
    colorBtnBg.stroke({ width: 2, color: 0x333333 });
    this.colorButton.addChild(colorBtnBg);

    this.colorSwatchPreview = new Graphics();
    this.colorButton.addChild(this.colorSwatchPreview);

    this.colorButton.on("pointerover", () => {
      colorBtnBg.tint = 0xcccccc;
    });
    this.colorButton.on("pointerout", () => {
      colorBtnBg.tint = 0xffffff;
    });
    this.colorButton.on("pointerdown", () => {
      this._playClickSfx();
      this._toggleColorSwatches();
    });

    this.colorButton.x = 0;
    this.colorButton.y = label.y + label.height + 20;
    this.colorPickerContainer.addChild(this.colorButton);

    // Hàng swatch màu (ẩn mặc định)
    this.swatchRow = new Container();
    this.swatchRow.position.set(0, 42);
    this.swatchRow.visible = false;
    this.swatchRow.x = 0;
    this.swatchRow.y = 60;
    this.colorPickerContainer.addChild(this.swatchRow);

    const swatchSize = 26;
    const swatchGap = 10;
    const totalW =
      this.lineColors.length * swatchSize +
      (this.lineColors.length - 1) * swatchGap;
    const startX = -totalW / 2 + swatchSize / 2;

    this.lineColors.forEach((color, i) => {
      const swatch = new Container();
      swatch.position.set(startX + i * (swatchSize + swatchGap), 0);
      swatch.eventMode = "static";
      swatch.cursor = "pointer";

      const circle = new Graphics();
      circle.circle(0, 0, swatchSize / 2);
      circle.fill(color);
      circle.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
      swatch.addChild(circle);

      swatch.on("pointerover", () => {
        this._playHoverSfx();
        swatch.scale.set(1.15);
      });
      swatch.on("pointerout", () => {
        swatch.scale.set(1);
      });
      swatch.on("pointerdown", () => {
        this._playClickSfx();
        this._selectColor(i);
      });

      this.swatchRow.addChild(swatch);
    });

    this._updateColorButtonPreview();
  }

  _toggleColorSwatches() {
    this.swatchRow.visible = !this.swatchRow.visible;
  }

  _selectColor(index) {
    this.selectedColorIndex = index;
    this._updateColorButtonPreview();
    this.swatchRow.visible = false;
    if (this._onColorSelectCb) {
      this._onColorSelectCb(this.lineColors[index], index);
    }
  }

  _updateColorButtonPreview() {
    const color = this.lineColors[this.selectedColorIndex];
    this.colorSwatchPreview.clear();
    this.colorSwatchPreview.circle(0, 0, 10);
    this.colorSwatchPreview.fill(color);
    this.colorSwatchPreview.stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
  }

  /**
   * Đổi bảng màu tuỳ chỉnh nếu muốn:
   * mainMenu.setLineColors([0xff0000, 0x00ff00, ...]);
   */
  setLineColors(colors) {
    this.lineColors = colors;
    this.selectedColorIndex = 0;
    this.colorPickerContainer.removeChild(this.swatchRow);
    this._createColorPicker(this.screenWidth, this.screenHeight);
  }

  getSelectedColor() {
    return this.lineColors[this.selectedColorIndex];
  }

  // =========================================================
  // PLAY BUTTON
  // =========================================================
  _createPlayButton(screenWidth, screenHeight) {
    this.startButton = new Container();

    const btnBg = new Graphics();
    btnBg.roundRect(-80, -30, 160, 60, 15);
    btnBg.fill(0x008cba);
    this.startButton.addChild(btnBg);

    const btnText = new Text({
      text: "PLAY",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 24,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    btnText.anchor.set(0.5);
    this.startButton.addChild(btnText);

    this.startButton.position.set(screenWidth / 2, screenHeight * 0.68);
    this.startButton.eventMode = "static";
    this.startButton.cursor = "pointer";

    this.startButton.on("pointerover", () => {
      btnBg.tint = 0x33aaff;
    });
    this.startButton.on("pointerout", () => {
      btnBg.tint = 0xffffff;
    });

    this.container.addChild(this.startButton);
  }

  // =========================================================
  // SETTINGS BUTTON (dưới Play — settings cho cả hệ thống)
  // =========================================================
  _createSettingsButton(screenWidth, screenHeight) {
    this.settingsButton = new Container();

    const btnBg = new Graphics();
    btnBg.roundRect(-80, -24, 160, 48, 14);
    btnBg.fill({ color: 0x1a1a1a, alpha: 1 });
    btnBg.stroke({ width: 2, color: 0x444444 });
    this.settingsButton.addChild(btnBg);

    const btnText = new Text({
      text: "SETTINGS",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 18,
        fontWeight: "bold",
        fill: 0xcccccc,
        letterSpacing: 1,
      }),
    });
    btnText.anchor.set(0.5);
    this.settingsButton.addChild(btnText);

    this.settingsButton.position.set(screenWidth / 2, screenHeight * 0.68 + 66);
    this.settingsButton.eventMode = "static";
    this.settingsButton.cursor = "pointer";

    this.settingsButton.on("pointerover", () => {
      btnBg.tint = 0x4caf50;
    });
    this.settingsButton.on("pointerout", () => {
      btnBg.tint = 0xffffff;
    });

    this.container.addChild(this.settingsButton);
  }

  // =========================================================
  // TOP ICONS (Help + Sound)
  // =========================================================
  _createTopIcons(screenWidth) {
    const iconSize = 22;
    const padding = 20;
    const gap = 15;

    // --- Icon 1: Tooltip / Help ---
    this.helpButton = new Container();
    const helpBg = new Graphics();
    helpBg.circle(0, 0, iconSize);
    helpBg.fill(0x333333);
    helpBg.stroke({ width: 2, color: 0xffffff, alpha: 0.6 });
    this.helpButton.addChild(helpBg);

    const helpText = new Text({
      text: "i",
      style: new TextStyle({
        fontFamily: "Georgia",
        fontSize: 20,
        fontStyle: "italic",
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    helpText.anchor.set(0.5);
    this.helpButton.addChild(helpText);

    this.helpButton.position.set(
      screenWidth - padding - iconSize,
      padding + iconSize,
    );
    this.helpButton.eventMode = "static";
    this.helpButton.cursor = "pointer";

    this.helpButton.on("pointerover", () => {
      helpBg.tint = 0x4caf50;
    });
    this.helpButton.on("pointerout", () => {
      helpBg.tint = 0xffffff;
    });

    this.container.addChild(this.helpButton);

    // --- Icon 2: Sound toggle ---
    this.soundSettingButton = new Container();
    const soundBg = new Graphics();
    soundBg.circle(0, 0, iconSize);
    soundBg.fill(0x333333);
    soundBg.stroke({ width: 2, color: 0xffffff, alpha: 0.6 });
    this.soundSettingButton.addChild(soundBg);

    const speakerIcon = new Graphics();
    this._drawSpeakerIcon(speakerIcon, true);
    this.soundSettingButton.addChild(speakerIcon);

    this.soundSettingButton.position.set(
      screenWidth - padding - iconSize - (iconSize * 2 + gap),
      padding + iconSize,
    );
    this.soundSettingButton.eventMode = "static";
    this.soundSettingButton.cursor = "pointer";

    this.soundSettingButton.on("pointerover", () => {
      soundBg.tint = 0x008cba;
    });
    this.soundSettingButton.on("pointerout", () => {
      soundBg.tint = 0xffffff;
    });

    this.container.addChild(this.soundSettingButton);
  }

  _drawSpeakerIcon(graphics, isOn) {
    graphics.clear();

    graphics.moveTo(-9, -3);
    graphics.lineTo(-4, -3);
    graphics.lineTo(2, -9);
    graphics.lineTo(2, 9);
    graphics.lineTo(-4, 3);
    graphics.lineTo(-9, 3);
    graphics.closePath();
    graphics.fill(0xffffff);

    if (isOn) {
      graphics.setStrokeStyle({
        width: 2,
        color: 0xffffff,
        alpha: 0.9,
        cap: "round",
      });
      graphics.arc(2, 0, 6, -Math.PI / 4, Math.PI / 4);
      graphics.stroke();

      graphics.setStrokeStyle({
        width: 2,
        color: 0xffffff,
        alpha: 0.6,
        cap: "round",
      });
      graphics.arc(2, 0, 10, -Math.PI / 4, Math.PI / 4);
      graphics.stroke();
    } else {
      graphics.setStrokeStyle({ width: 2.5, color: 0xff4444, cap: "round" });
      graphics.moveTo(5, -6);
      graphics.lineTo(13, 6);
      graphics.moveTo(13, -6);
      graphics.lineTo(5, 6);
      graphics.stroke();
    }
  }

  _createTooltip(message) {
    const box = new Container();
    const text = new Text({
      text: message,
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 14,
        fill: 0xffffff,
        align: "left",
      }),
    });
    text.position.set(10, 8);

    const bg = new Graphics();
    const w = text.width + 20;
    const h = text.height + 16;
    bg.roundRect(0, 0, w, h, 8);
    bg.fill({ color: 0x000000, alpha: 0.9 });
    bg.stroke({ width: 1, color: 0x4caf50, alpha: 0.8 });

    box.addChild(bg, text);
    return box;
  }

  // =========================================================
  // PUBLIC EVENT HOOKS
  // =========================================================
  onStart(callback) {
    this.startButton.on("pointerdown", () => {
      this._playClickSfx();
      callback();
    });
  }

  /** Nút SETTINGS dưới Play — dùng cho SoundSettingPopup hệ thống */
  onSettings(callback) {
    this.settingsButton.on("pointerdown", () => {
      this._playClickSfx();
      callback();
    });
  }

  /** Icon i góc trên — mở GuidePopup */
  onHelp(callback) {
    this.helpButton.on("pointerdown", () => {
      this._playClickSfx();
      callback();
    });
  }

  /** Icon loa góc trên — toggle nhanh mute/unmute */
  onSoundSetting(callback) {
    this.soundSettingButton.on("pointerdown", () => {
      this._playClickSfx();
      callback();
    });
  }

  /** Fired mỗi khi người chơi đổi bóng bằng mũi tên trái/phải */
  onBallChange(callback) {
    this._onBallChangeCb = callback;
  }

  /** Fired khi người chơi chọn 1 màu trong bảng màu vẽ */
  onColorSelect(callback) {
    this._onColorSelectCb = callback;
  }

  _playClickSfx() {
    if (!this.isSoundOn) return;
    this._clickSfx.currentTime = 0;
    this._clickSfx.play().catch(() => {});
  }

  _playHoverSfx() {
    if (!this.isSoundOn) return;
    this._hoverSfx.currentTime = 0;
    this._hoverSfx.play().catch(() => {});
  }

  show() {
    this.container.visible = true;
    this._bgMusic.play().catch(() => {});
  }

  hide() {
    this.container.visible = false;
    this._bgMusic.pause();
    this._bgMusic.currentTime = 0;
  }
}
