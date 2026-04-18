import { Entity } from './Entity.js';

export class Player extends Entity {
  constructor(x, y, classDef) {
    super(x, y, 20, 20);
    this.team = 'player';
    this.classDef = classDef;

    // Base stats from class
    this.maxHp       = classDef.baseHp;
    this.hp          = this.maxHp;
    this.maxResource = classDef.baseResource;
    this.resource    = this.maxResource;
    this.baseDamage  = classDef.baseDamage;
    this.speed       = classDef.speed;
    this.attackRange = classDef.attackRange;
    this.attackCooldown = classDef.attackCooldown;
    this._attackTimer = 0;

    // Skill cooldowns (skills 0-3)
    this.skillCooldowns   = [0, 0, 0, 0];
    this.skillMaxCooldowns = classDef.skillCooldowns ?? [0, 5, 10, 15];

    // Progression
    this.xp = 0; this.level = 1; this.skillPoints = 0;
    this.xpToNext = 100;

    // Equipment stats (added from items)
    this.bonusDamage     = 0;
    this.bonusSpeed      = 0;
    this.bonusHp         = 0;
    this.bonusCdr        = 0; // cooldown reduction %
    this.bonusAtkSpeed   = 0; // % faster

    // Dodge roll (Ranger)
    this.dodging = false;
    this.dodgeTimer = 0;
    this.dodgeDuration = 0.25;
    this.dodgeCooldown = 0;
    this._dodgeCooldownMax = 2;
    this.invincible = false;

    this.facingAngle = 0;
    this.hitFlash = 0;

    // Active skill projectiles produced this frame
    this.pendingProjectiles = [];
    this.pendingMeleeHit = null; // { x, y, r, damage }
  }

  get totalDamage()  { return (this.baseDamage + this.bonusDamage) * (1 + this.level * 0.05); }
  get totalSpeed()   { return this.speed + this.bonusSpeed; }
  get effectiveCdr() { return Math.min(0.75, this.bonusCdr); }

  update(game, dt) {
    const { input, camera } = game;
    const wp = camera.toWorld(input.mouse.x, input.mouse.y);
    this.facingAngle = Math.atan2(wp.y - this.y, wp.x - this.x);

    // Dodge roll
    if (this.dodgeCooldown > 0) this.dodgeCooldown -= dt;
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      this.invincible = true;
      if (this.dodgeTimer <= 0) { this.dodging = false; this.invincible = false; }
    }

    // Movement
    let mvx = 0, mvy = 0;
    if (input.isDown('KeyW') || input.isDown('ArrowUp'))    mvy -= 1;
    if (input.isDown('KeyS') || input.isDown('ArrowDown'))  mvy += 1;
    if (input.isDown('KeyA') || input.isDown('ArrowLeft'))  mvx -= 1;
    if (input.isDown('KeyD') || input.isDown('ArrowRight')) mvx += 1;
    if (mvx !== 0 && mvy !== 0) { mvx *= 0.707; mvy *= 0.707; }

    const spd = this.dodging ? this.totalSpeed * 2.5 : this.totalSpeed;
    if (this.dodging) {
      // keep dodge direction
    } else {
      this.vx = mvx * spd;
      this.vy = mvy * spd;
    }

    // Shift = dodge (Ranger) or sprint
    if (input.isJustPressed('ShiftLeft') && this.classDef.name === 'Ranger' && this.dodgeCooldown <= 0 && (mvx || mvy)) {
      this.dodging = true;
      this.dodgeTimer = this.dodgeDuration;
      this.dodgeCooldown = this._dodgeCooldownMax;
      this.vx = mvx * spd * 2.5;
      this.vy = mvy * spd * 2.5;
      this.invincible = true;
    }

    this.moveWithCollision(game.tilemap, dt);

    // Resource regen
    const regenRate = this.classDef.resourceRegen ?? 5;
    this.resource = Math.min(this.maxResource, this.resource + regenRate * dt);

    // Attack timer
    if (this._attackTimer > 0) this._attackTimer -= dt;

    // Battle Cry expiry (Warrior skill 3)
    if (this._battleCryTimer > 0) {
      this._battleCryTimer -= dt;
      if (this._battleCryTimer <= 0) {
        this._battleCryTimer = 0;
        this.bonusDamage = Math.max(0, this.bonusDamage - 20);
      }
    }

    // Skill cooldowns
    for (let i = 0; i < 4; i++) if (this.skillCooldowns[i] > 0) this.skillCooldowns[i] -= dt;

    this.pendingProjectiles = [];
    this.pendingMeleeHit = null;

    // Primary attack: left click or hold
    if ((input.mouse.left || input.isMouseJustPressed('left')) && this._attackTimer <= 0) {
      this.classDef.primaryAttack(this, wp);
      const cd = this.attackCooldown / (1 + this.bonusAtkSpeed);
      this._attackTimer = cd;
    }

    // Skills 1-4
    const skillKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4'];
    for (let i = 0; i < skillKeys.length; i++) {
      if (input.isJustPressed(skillKeys[i]) && this.skillCooldowns[i] <= 0) {
        const used = this.classDef.useSkill?.(this, i, wp);
        if (used) {
          const cd = (this.skillMaxCooldowns[i] ?? 5) * (1 - this.effectiveCdr);
          this.skillCooldowns[i] = cd;
        }
      }
    }

    if (this.hitFlash > 0) this.hitFlash -= dt;
  }

  gainXp(amount) {
    this.xp += amount;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.skillPoints++;
      this.xpToNext = Math.floor(100 * Math.pow(1.3, this.level - 1));
      this.maxHp += 10;
      this.hp = Math.min(this.hp + 20, this.maxHp);
    }
  }

  takeDamage(amount) {
    if (this.invincible) return;
    super.takeDamage(amount);
    this.hitFlash = 0.15;
  }

  draw(ctx, camera) {
    const s = camera.toScreen(this.x, this.y);
    ctx.save();
    ctx.translate(s.x, s.y);
    if (this.hitFlash > 0) ctx.globalAlpha = 0.5 + Math.sin(this.hitFlash * 40) * 0.5;
    // Body drawn upright; weapon rotates inside classDef.drawPlayer via facingAngle.
    this.classDef.drawPlayer(ctx, this);
    ctx.restore();
    this.drawHealthBar(ctx, camera);
  }
}
