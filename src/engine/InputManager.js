export class InputManager {
  constructor(canvas) {
    this.keys = {};
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, left: false, right: false };
    this._justPressed = {};
    this._justReleased = {};
    this._mouseJustPressed = {};
    this._mouseJustReleased = {};

    window.addEventListener('keydown', e => {
      if (!this.keys[e.code]) this._justPressed[e.code] = true;
      this.keys[e.code] = true;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      this._justReleased[e.code] = true;
    });
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width / r.width;
      const scaleY = canvas.height / r.height;
      this.mouse.x = (e.clientX - r.left) * scaleX;
      this.mouse.y = (e.clientY - r.top) * scaleY;
    });
    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) { this.mouse.left = true; this._mouseJustPressed.left = true; }
      if (e.button === 2) { this.mouse.right = true; this._mouseJustPressed.right = true; }
    });
    canvas.addEventListener('mouseup', e => {
      if (e.button === 0) { this.mouse.left = false; this._mouseJustReleased.left = true; }
      if (e.button === 2) { this.mouse.right = false; this._mouseJustReleased.right = true; }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  isDown(code) { return !!this.keys[code]; }
  isJustPressed(code) { return !!this._justPressed[code]; }
  isJustReleased(code) { return !!this._justReleased[code]; }
  isMouseJustPressed(btn) { return !!this._mouseJustPressed[btn]; }

  flush() {
    this._justPressed = {};
    this._justReleased = {};
    this._mouseJustPressed = {};
    this._mouseJustReleased = {};
  }
}
