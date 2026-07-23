export class FixedStepClock {
  constructor({ fixedStepMs, maxFrameDeltaMs, maxStepsPerFrame }) {
    this.fixedStepMs = fixedStepMs;
    this.maxFrameDeltaMs = maxFrameDeltaMs;
    this.maxStepsPerFrame = maxStepsPerFrame;
    this.accumulatorMs = 0;
  }

  advance(frameDeltaMs) {
    const deltaMs = Math.min(
      this.maxFrameDeltaMs,
      Math.max(0, Number.isFinite(frameDeltaMs) ? frameDeltaMs : 0),
    );
    this.accumulatorMs += deltaMs;

    const availableSteps = Math.floor(this.accumulatorMs / this.fixedStepMs);
    const steps = Math.min(availableSteps, this.maxStepsPerFrame);
    this.accumulatorMs -= steps * this.fixedStepMs;

    // Drop excess catch-up work after a long pause to keep the next frame responsive.
    if (availableSteps > this.maxStepsPerFrame) this.accumulatorMs = 0;

    return { deltaMs, steps };
  }

  reset() {
    this.accumulatorMs = 0;
  }
}
