import { Entity } from './Entity.js';

export class Projectile extends Entity {
  constructor(x, y, vx, vy, damage, team, opts = {}) {
    super(x, y, opts.size ?? 6, opts.size ?? 6);
    this.vx = vx; this.vy = vy;
    this.damage = damage;
    this.team = team;
    this.pierce = opts.pierce ?? 0;
    this.piercesLeft = this.pierce;
    this.aoe = opts.aoe ?? 0;
    this.color = opts.color ?? '#ffcc00';
    this.lifetime = opts.lifetime ?? 3;
    this.age = 0;
    this.hitEntities = new Set();
  }

  update(map, dt) {
    this.age += dt;
    if (this.age >= this.lifetime) { this.dead = true; return; }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (map.isSolidWorld(this.x, this.y)) this.dead = true;
  }

  draw(ctx, camera) {
    if (this.dead) return;
    const s = camera.toScreen(this.x, this.y);
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, this.w / 2, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(s.x, s.y, this.w, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  onHit(entity) {
    if (this.hitEntities.has(entity)) return false;
    this.hitEntities.add(entity);
    if (this.piercesLeft > 0) { this.piercesLeft--; }
    else { this.dead = true; }
    return true;
  }
}
