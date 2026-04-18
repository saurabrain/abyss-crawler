export class Entity {
  constructor(x, y, w, h) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.vx = 0; this.vy = 0;
    this.hp = 1; this.maxHp = 1;
    this.dead = false;
    this.team = 'neutral'; // 'player' | 'enemy'
  }

  get cx() { return this.x; }
  get cy() { return this.y; }
  get left()   { return this.x - this.w / 2; }
  get right()  { return this.x + this.w / 2; }
  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }

  overlaps(other) {
    return this.left < other.right && this.right > other.left &&
           this.top  < other.bottom && this.bottom > other.top;
  }

  distTo(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  takeDamage(amount, source) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.dead = true;
  }

  moveWithCollision(map, dt) {
    const step = 2;
    const hw = this.w / 2 - 1;
    const hh = this.h / 2 - 1;
    // 4 px perpendicular inset: prevents a wall-boundary Y position from
    // falsely blocking X movement (and vice versa), allowing wall sliding.
    const PI = 4;

    // X axis — leading edge only; Y test points inset by PI
    if (this.vx !== 0) {
      const stepsX = Math.max(1, Math.ceil(Math.abs(this.vx * dt) / step));
      const dx = this.vx * dt / stepsX;
      for (let i = 0; i < stepsX; i++) {
        this.x += dx;
        const ex = dx > 0 ? this.x + hw : this.x - hw;
        if (map.isSolidWorld(ex, this.y - (hh - PI)) ||
            map.isSolidWorld(ex, this.y + (hh - PI))) {
          this.x -= dx;
          this.vx = 0;
          break;
        }
      }
    }

    // Y axis — leading edge only; X test points inset by PI
    if (this.vy !== 0) {
      const stepsY = Math.max(1, Math.ceil(Math.abs(this.vy * dt) / step));
      const dy = this.vy * dt / stepsY;
      for (let i = 0; i < stepsY; i++) {
        this.y += dy;
        const ey = dy > 0 ? this.y + hh : this.y - hh;
        if (map.isSolidWorld(this.x - (hw - PI), ey) ||
            map.isSolidWorld(this.x + (hw - PI), ey)) {
          this.y -= dy;
          this.vy = 0;
          break;
        }
      }
    }
  }

  drawHealthBar(ctx, camera) {
    if (this.hp >= this.maxHp) return;
    const s = camera.toScreen(this.x, this.y);
    const bw = this.w;
    const bh = 4;
    const bx = s.x - bw / 2;
    const by = s.y - this.h / 2 - 8;
    ctx.fillStyle = '#600';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
  }
}
