/**
 * Captures a single pointer stroke for drawing a line. Pointer Events keep
 * mouse, touch, and pen input on the same path.
 */
export class InputManager {
  constructor(canvas, onDrawComplete, getLogicalSize = null) {
    this.canvas = canvas;
    this.getLogicalSize = getLogicalSize || (() => ({
      width: this.canvas.width,
      height: this.canvas.height,
    }));
    this.onDrawComplete = onDrawComplete;
    this.isDrawing = false;
    this.pointerId = null;
    this.points = [];
    this.inputTransform = null;

    this.minPointDistance = 3;
    this.maxRawPoints = 160;
    this.eventOptions = { passive: false };

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);

    // Prevent browser pan/zoom gestures from delaying or cancelling a stroke.
    this.canvas.style.touchAction = "none";
    this.canvas.addEventListener("pointerdown", this.handlePointerDown, this.eventOptions);
    this.canvas.addEventListener("pointermove", this.handlePointerMove, this.eventOptions);
    this.canvas.addEventListener("pointerup", this.handlePointerUp, this.eventOptions);
    this.canvas.addEventListener("pointercancel", this.handlePointerCancel, this.eventOptions);
  }

  getPos(e) {
    const { rect, scaleX, scaleY } = this.inputTransform;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  beginStroke(e) {
    const rect = this.canvas.getBoundingClientRect();
    const { width, height } = this.getLogicalSize();
    this.inputTransform = {
      rect,
      scaleX: width / rect.width,
      scaleY: height / rect.height,
    };
    this.pointerId = e.pointerId;
    this.isDrawing = true;
    this.points = [this.getPos(e)];
    this.canvas.setPointerCapture?.(e.pointerId);
  }

  appendPoint(e) {
    const point = this.getPos(e);
    const previous = this.points[this.points.length - 1];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) < this.minPointDistance) {
      return;
    }

    if (this.points.length >= this.maxRawPoints) {
      // Preserve the final direction of a very long stroke without allowing
      // path simplification to become expensive on high-frequency touch input.
      this.points[this.points.length - 1] = point;
      return;
    }
    this.points.push(point);
  }

  handlePointerDown(e) {
    if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.preventDefault();
    this.beginStroke(e);
  }

  handlePointerMove(e) {
    if (!this.isDrawing || e.pointerId !== this.pointerId) return;
    e.preventDefault();

    // Some mobile browsers coalesce several touch samples into one event.
    // Reading them preserves the curve without waiting for another frame.
    const samples = e.getCoalescedEvents?.() || [e];
    for (const sample of samples) this.appendPoint(sample);
  }

  handlePointerUp(e) {
    if (!this.isDrawing || e.pointerId !== this.pointerId) return;
    e.preventDefault();
    this.appendPoint(e);
    this.finishStroke(true);
  }

  handlePointerCancel(e) {
    if (!this.isDrawing || e.pointerId !== this.pointerId) return;
    this.finishStroke(false);
  }

  finishStroke(shouldCreateLine) {
    const pointerId = this.pointerId;
    const points = this.points;
    this.isDrawing = false;
    this.pointerId = null;
    this.points = [];
    this.inputTransform = null;
    if (this.canvas.hasPointerCapture?.(pointerId)) {
      this.canvas.releasePointerCapture(pointerId);
    }
    if (shouldCreateLine && points.length >= 2) {
      this.onDrawComplete(points);
    }
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown, this.eventOptions);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove, this.eventOptions);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp, this.eventOptions);
    this.canvas.removeEventListener("pointercancel", this.handlePointerCancel, this.eventOptions);

    this.points = [];
    this.inputTransform = null;
    this.onDrawComplete = null;
    this.getLogicalSize = null;
    this.canvas = null;
  }
}
