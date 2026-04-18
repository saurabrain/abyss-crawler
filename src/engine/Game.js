import { InputManager } from './InputManager.js';
import { Camera } from './Camera.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.W = 960;
    this.H = 640;
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this._resizeCanvas();
    window.addEventListener('resize', () => this._resizeCanvas());

    this.input = new InputManager(this.canvas);
    this.camera = new Camera(this.W, this.H);

    this.stateStack = [];
    this.pendingState = null;
    this.pendingAction = null; // 'push' | 'pop' | 'replace'

    this._lastTime = 0;
    this._accumulator = 0;
    this.FIXED_DT = 1 / 60;

    requestAnimationFrame(t => this._loop(t));
  }

  _resizeCanvas() {
    const scaleX = window.innerWidth / this.W;
    const scaleY = window.innerHeight / this.H;
    const scale = Math.min(scaleX, scaleY);
    this.canvas.style.width = `${this.W * scale}px`;
    this.canvas.style.height = `${this.H * scale}px`;
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.1);
    this._lastTime = timestamp;
    this._accumulator += dt;

    // Apply pending state change
    if (this.pendingAction) {
      if (this.pendingAction === 'replace') {
        if (this.stateStack.length) {
          this.stateStack[this.stateStack.length - 1].onExit?.();
          this.stateStack[this.stateStack.length - 1] = this.pendingState;
        } else {
          this.stateStack.push(this.pendingState);
        }
        this.pendingState.onEnter?.(this);
      } else if (this.pendingAction === 'push') {
        this.pendingState.onEnter?.(this);
        this.stateStack.push(this.pendingState);
      } else if (this.pendingAction === 'pop') {
        const old = this.stateStack.pop();
        old?.onExit?.();
        this.stateStack[this.stateStack.length - 1]?.onResume?.(this);
      }
      this.pendingAction = null;
      this.pendingState = null;
    }

    const current = this.stateStack[this.stateStack.length - 1];
    while (this._accumulator >= this.FIXED_DT) {
      current?.update?.(this, this.FIXED_DT);
      this._accumulator -= this.FIXED_DT;
    }

    this.ctx.clearRect(0, 0, this.W, this.H);
    for (const state of this.stateStack) state.draw?.(this, this.ctx);

    this.input.flush();
    requestAnimationFrame(t => this._loop(t));
  }

  setState(state) {
    this.pendingState = state;
    this.pendingAction = 'replace';
  }

  pushState(state) {
    this.pendingState = state;
    this.pendingAction = 'push';
  }

  popState() {
    this.pendingAction = 'pop';
  }
}
