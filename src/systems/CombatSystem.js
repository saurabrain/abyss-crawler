export class CombatSystem {
  constructor() {
    this.damageNumbers = [];
  }

  process(player, enemies, projectiles, dt) {
    // Player melee hit
    if (player.pendingMeleeHit) {
      const hit = player.pendingMeleeHit;
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        const dx = enemy.x - hit.x;
        const dy = enemy.y - hit.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > hit.r + enemy.w / 2) continue;

        // Arc check
        if (hit.arc < Math.PI * 2) {
          const angle = Math.atan2(dy, dx);
          let diff = angle - hit.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) > hit.arc / 2) continue;
        }

        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        enemy.takeDamage(hit.damage, angle, hit.knockback ?? 150);
        this._addNumber(enemy.x, enemy.y, hit.damage, '#ff6');

        if (hit.lifesteal) {
          const heal = hit.damage * hit.lifesteal;
          player.hp = Math.min(player.maxHp, player.hp + heal);
          this._addNumber(player.x, player.y - 10, Math.round(heal), '#0f0');
        }
      }
    }

    // Player projectiles hit enemies
    for (const proj of projectiles) {
      if (proj.dead || proj.team !== 'player') continue;
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        if (!proj.overlaps(enemy)) continue;
        if (!proj.onHit(enemy)) continue;

        const angle = Math.atan2(enemy.y - proj.y, enemy.x - proj.x);
        enemy.takeDamage(proj.damage, angle, 80);
        this._addNumber(enemy.x, enemy.y, proj.damage, '#ff6');

        // AOE
        if (proj.aoe > 0) {
          for (const other of enemies) {
            if (other === enemy || other.dead) continue;
            if (other.distTo({ x: proj.x, y: proj.y }) < proj.aoe) {
              other.takeDamage(proj.damage * 0.6, angle, 60);
              this._addNumber(other.x, other.y, Math.round(proj.damage * 0.6), '#fa0');
            }
          }
        }
      }
    }

    // Enemy projectiles hit player
    for (const proj of projectiles) {
      if (proj.dead || proj.team !== 'enemy') continue;
      if (proj.overlaps(player)) {
        if (proj.onHit(player)) {
          player.takeDamage(proj.damage);
          this._addNumber(player.x, player.y, proj.damage, '#f44');
        }
      }
    }

    // Enemy melee hit player
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      if (enemy.pendingMeleeHit) {
        const hit = enemy.pendingMeleeHit;
        // handled in enemy attack logic directly via player.takeDamage
      }
    }

    // Update damage numbers
    for (const dn of this.damageNumbers) {
      dn.y -= 30 * dt;
      dn.life -= dt;
    }
    this.damageNumbers = this.damageNumbers.filter(d => d.life > 0);
  }

  _addNumber(x, y, amount, color) {
    this.damageNumbers.push({
      x, y: y - 20,
      text: Math.round(amount).toString(),
      color,
      life: 0.8,
      maxLife: 0.8,
    });
  }

  drawNumbers(ctx, camera) {
    for (const dn of this.damageNumbers) {
      const s = camera.toScreen(dn.x, dn.y);
      ctx.save();
      ctx.globalAlpha = dn.life / dn.maxLife;
      ctx.fillStyle = dn.color;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(dn.text, s.x, s.y);
      ctx.restore();
    }
  }
}
