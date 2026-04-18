export class Camera {
  constructor(viewW, viewH) {
    this.x = 0;
    this.y = 0;
    this.viewW = viewW;
    this.viewH = viewH;
  }

  follow(target, mapPixelW, mapPixelH, dt) {
    // Camera centers on player — no mouse look-ahead
    const desiredX = target.x - this.viewW / 2;
    const desiredY = target.y - this.viewH / 2;
    const speed = 8;
    this.x += (desiredX - this.x) * Math.min(1, speed * dt);
    this.y += (desiredY - this.y) * Math.min(1, speed * dt);
    this.x = Math.max(0, Math.min(mapPixelW - this.viewW, this.x));
    this.y = Math.max(0, Math.min(mapPixelH - this.viewH, this.y));
  }

  snapTo(target, mapPixelW, mapPixelH) {
    this.x = target.x - this.viewW / 2;
    this.y = target.y - this.viewH / 2;
    this.x = Math.max(0, Math.min(mapPixelW - this.viewW, this.x));
    this.y = Math.max(0, Math.min(mapPixelH - this.viewH, this.y));
  }

  toScreen(worldX, worldY) {
    return { x: worldX - this.x, y: worldY - this.y };
  }

  toWorld(screenX, screenY) {
    return { x: screenX + this.x, y: screenY + this.y };
  }

  apply(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }

  inView(wx, wy, w, h) {
    return wx + w > this.x && wx < this.x + this.viewW &&
           wy + h > this.y && wy < this.y + this.viewH;
  }
}
