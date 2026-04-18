import { Entity } from '../entities/Entity.js';

export class Enemy extends Entity {
  constructor(x, y, def) {
    super(x, y, def.w ?? 22, def.h ?? 22);
    this.team = 'enemy';
    this.def = def;
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.speed = def.speed;
    this.damage = def.damage;
    this.xpReward = def.xpReward ?? 10;
    this.lootChance = def.lootChance ?? 0.2;

    this.state = 'wander';
    this.attackCooldown = def.attackCooldown ?? 1.0;
    this._attackTimer = Math.random() * this.attackCooldown;
    this.aggroRange = def.aggroRange ?? 220;
    this.attackRange = def.attackRange ?? 28;

    this._wanderTimer = 0;
    this._wanderAngle = Math.random() * Math.PI * 2;

    this.knockbackVx = 0;
    this.knockbackVy = 0;
    this.hitFlash = 0;

    this.pendingProjectiles = [];
  }

  update(map, player, dt) {
    this.pendingProjectiles = [];
    if (this.dead) return;

    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this._attackTimer > 0) this._attackTimer -= dt;

    // Knockback decay
    if (this.knockbackVx || this.knockbackVy) {
      this.vx = this.knockbackVx;
      this.vy = this.knockbackVy;
      this.knockbackVx *= (1 - 12 * dt);
      this.knockbackVy *= (1 - 12 * dt);
      if (Math.abs(this.knockbackVx) < 1) this.knockbackVx = 0;
      if (Math.abs(this.knockbackVy) < 1) this.knockbackVy = 0;
    }

    const dist = this.distTo(player);

    if (dist < this.aggroRange) this.state = 'chase';
    if (dist > this.aggroRange * 1.5) this.state = 'wander';

    if (this.state === 'wander') {
      this._wanderTimer -= dt;
      if (this._wanderTimer <= 0) {
        this._wanderAngle = Math.random() * Math.PI * 2;
        this._wanderTimer = 1 + Math.random() * 2;
      }
      if (!this.knockbackVx && !this.knockbackVy) {
        this.vx = Math.cos(this._wanderAngle) * this.speed * 0.3;
        this.vy = Math.sin(this._wanderAngle) * this.speed * 0.3;
      }
    } else if (this.state === 'chase') {
      if (!this.knockbackVx && !this.knockbackVy) {
        this.def.chaseLogic?.(this, player, dt) ?? this._defaultChase(player);
      }
      if (dist < this.attackRange && this._attackTimer <= 0) {
        this.def.attackLogic?.(this, player, dt);
        this._attackTimer = this.attackCooldown;
      }
    }

    this.moveWithCollision(map, dt);
  }

  _defaultChase(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    this.vx = dx / len * this.speed;
    this.vy = dy / len * this.speed;
  }

  takeDamage(amount, knockAngle, knockForce) {
    super.takeDamage(amount);
    this.hitFlash = 0.1;
    if (knockForce) {
      this.knockbackVx = Math.cos(knockAngle) * knockForce;
      this.knockbackVy = Math.sin(knockAngle) * knockForce;
    }
  }

  draw(ctx, camera) {
    if (this.dead) return;
    const s = camera.toScreen(this.x, this.y);
    ctx.save();
    if (this.hitFlash > 0) ctx.globalAlpha = 0.4 + Math.random() * 0.6;
    ctx.translate(s.x, s.y);
    this.def.drawEnemy(ctx, this);
    ctx.restore();
    this.drawHealthBar(ctx, camera);
  }
}
