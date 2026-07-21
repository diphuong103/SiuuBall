/**
 * Lắng nghe thao tác vuốt chuột (PC) hoặc ngón tay (mobile) để ghi lại đường vẽ.
 * Dùng Pointer Events API — một API DUY NHẤT xử lý được cả chuột lẫn cảm ứng,
 * không cần viết code riêng cho "mousedown" và "touchstart".
 */
export class InputManager {
  constructor(canvas, onDrawComplete) {
    this.canvas = canvas;
    this.onDrawComplete = onDrawComplete; // hàm callback gọi khi vẽ xong
    this.isDrawing = false;
    this.points = [];

    // Bind để "this" bên trong các hàm luôn trỏ đúng về instance này
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);

    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointerleave", this.handlePointerUp);
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  handlePointerDown(e) {
    this.isDrawing = true;
    this.points = [this.getPos(e)];
  }

  handlePointerMove(e) {
    if (!this.isDrawing) return;
    this.points.push(this.getPos(e));
  }

  handlePointerUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.points.length >= 2) {
      this.onDrawComplete(this.points);
    }
    this.points = [];
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointerleave", this.handlePointerUp);

    this.points = [];
    this.onDrawComplete = null;
    this.canvas = null;
  }
}
