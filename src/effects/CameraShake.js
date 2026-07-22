/**
 * CameraShake — rung màn hình khi có sự kiện mạnh (trúng đạn, survival wave, v.v.)
 * Không cần Pixi camera riêng — áp trực tiếp vào gameplayLayer position.
 */
export class CameraShake {
  /**
   * @param {import('pixi.js').Container} target — thường là game.gameplayLayer
   */
  constructor(target) {
    this.target = target;
    this.duration = 0;       // giây còn lại
    this.magnitude = 0;      // px rung tối đa
    this._originX = 0;
    this._originY = 0;
    this._active = false;
  }

  /**
   * Kích hoạt rung màn hình.
   * @param {number} durationSec — thời gian rung (giây)
   * @param {number} magnitude — độ mạnh tối đa (px)
   */
  shake(durationSec = 0.25, magnitude = 8) {
    // Nếu đang rung, chỉ mở rộng nếu lần mới mạnh hơn
    if (this._active && magnitude <= this.magnitude) return;
    this.duration = durationSec;
    this.magnitude = magnitude;
    this._originX = this.target.x;
    this._originY = this.target.y;
    this._active = true;
  }

  update(deltaSeconds) {
    if (!this._active) return;

    this.duration -= deltaSeconds;
    if (this.duration <= 0) {
      this._active = false;
      this.target.x = this._originX;
      this.target.y = this._originY;
      return;
    }

    // Độ rung giảm tuyến tính theo thời gian còn lại
    const strength = this.magnitude * (this.duration > 0 ? 1 : 0);
    this.target.x = this._originX + (Math.random() * 2 - 1) * strength;
    this.target.y = this._originY + (Math.random() * 2 - 1) * strength;
  }

  stop() {
    this._active = false;
    if (this.target) {
      this.target.x = this._originX;
      this.target.y = this._originY;
    }
  }
}
