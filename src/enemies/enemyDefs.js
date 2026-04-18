import { Projectile } from '../entities/Projectile.js';

// --- DRAW HELPERS ---
function drawGrunt(ctx, enemy) {
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(-10, -10, 20, 20);
  // Spiky top
  ctx.fillStyle = '#c0392b';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(-6 + i * 6, -14, 4, 6);
  }
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.fillRect(-5, -4, 4, 4);
  ctx.fillRect(1, -4, 4, 4);
  ctx.fillStyle = '#000';
  ctx.fillRect(-4, -3, 2, 2);
  ctx.fillRect(2, -3, 2, 2);
}

function drawArcher(ctx, enemy) {
  ctx.fillStyle = '#e67e22';
  ctx.fillRect(-9, -11, 18, 22);
  ctx.fillStyle = '#d35400';
  ctx.fillRect(-9, -11, 18, 6);
  // Bow
  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(10, 0, 10, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(10, 10); ctx.stroke();
}

function drawShaman(ctx, enemy) {
  ctx.fillStyle = '#8e44ad';
  ctx.fillRect(-9, -9, 18, 18);
  // Orb
  ctx.fillStyle = '#d7bde2';
  ctx.beginPath();
  ctx.arc(0, -16, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7d3c98';
  ctx.beginPath();
  ctx.arc(0, -16, 4, 0, Math.PI * 2);
  ctx.fill();
  // Aura ring (pulse)
  if (enemy._healPulse > 0) {
    ctx.globalAlpha = enemy._healPulse;
    ctx.strokeStyle = '#58d68d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 50 * (1 - enemy._healPulse) + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawBoss(ctx, enemy) {
  const phase = enemy._phase ?? 1;
  ctx.fillStyle = phase === 1 ? '#1a1a2e' : '#c0392b';
  ctx.fillRect(-22, -22, 44, 44);
  ctx.fillStyle = phase === 1 ? '#2c3e50' : '#922b21';
  ctx.fillRect(-18, -18, 36, 36);
  // Crown
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(-18, -26, 36, 8);
  for (let i = 0; i < 4; i++) ctx.fillRect(-14 + i * 10, -32, 6, 8);
  // Eyes
  ctx.fillStyle = phase === 2 ? '#ff0' : '#e74c3c';
  ctx.fillRect(-10, -6, 8, 8);
  ctx.fillRect(2, -6, 8, 8);
}

// --- ENEMY DEFINITIONS ---
export const GRUNT_DEF = {
  name: 'Grunt', w: 20, h: 20,
  hp: 40, speed: 90, damage: 8, attackCooldown: 0.9,
  aggroRange: 350, attackRange: 28,
  xpReward: 8, lootChance: 0.15,
  drawEnemy: drawGrunt,
  attackLogic(enemy, player) {
    player.takeDamage(enemy.damage);
  },
};

export const ARCHER_DEF = {
  name: 'Archer', w: 18, h: 22,
  hp: 28, speed: 70, damage: 10, attackCooldown: 1.4,
  aggroRange: 380, attackRange: 250,
  xpReward: 12, lootChance: 0.2,
  drawEnemy: drawArcher,
  chaseLogic(enemy, player, dt) {
    const dist = enemy.distTo(player);
    const preferDist = 180;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    if (dist < preferDist - 20) {
      enemy.vx = -dx / len * enemy.speed;
      enemy.vy = -dy / len * enemy.speed;
    } else if (dist > preferDist + 20) {
      enemy.vx = dx / len * enemy.speed;
      enemy.vy = dy / len * enemy.speed;
    } else {
      // Strafe
      enemy.vx = -dy / len * enemy.speed * 0.5;
      enemy.vy = dx / len * enemy.speed * 0.5;
    }
  },
  attackLogic(enemy, player) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    enemy.pendingProjectiles.push(new Projectile(
      enemy.x, enemy.y, dx / len * 280, dy / len * 280,
      enemy.damage, 'enemy',
      { size: 7, color: '#e67e22', lifetime: 1.5 }
    ));
  },
};

export const SHAMAN_DEF = {
  name: 'Shaman', w: 18, h: 18,
  hp: 35, speed: 55, damage: 5, attackCooldown: 2.5,
  aggroRange: 400, attackRange: 280,
  xpReward: 18, lootChance: 0.35,
  drawEnemy: drawShaman,
  chaseLogic(enemy, player, dt) {
    // Stay far back
    const dist = enemy.distTo(player);
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    if (dist < 200) {
      enemy.vx = -dx / len * enemy.speed;
      enemy.vy = -dy / len * enemy.speed;
    } else {
      enemy.vx = 0; enemy.vy = 0;
    }
    // Heal nearby enemies
    enemy._healTimer = (enemy._healTimer ?? 0) - dt;
    enemy._healPulse = (enemy._healPulse ?? 0);
    if (enemy._healPulse > 0) enemy._healPulse -= dt * 2;
    if (enemy._healTimer <= 0) {
      enemy._healTimer = 3;
      enemy._healPulse = 1;
      // Healing handled in WaveSystem
      enemy._emitHeal = true;
    }
  },
  attackLogic(enemy, player) {
    player.takeDamage(enemy.damage);
  },
};

export const BOSS_DEF = {
  name: 'Boss', w: 44, h: 44,
  hp: 800, speed: 70, damage: 20, attackCooldown: 1.2,
  aggroRange: 400, attackRange: 50,
  xpReward: 200, lootChance: 1.0,
  drawEnemy: drawBoss,
  chaseLogic(enemy, player, dt) {
    enemy._phase = enemy.hp < enemy.maxHp * 0.4 ? 2 : 1;
    enemy._chargeTimer = (enemy._chargeTimer ?? 0) - dt;

    if (enemy._phase === 2 && enemy._chargeTimer <= 0) {
      // Charge toward player
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      enemy.vx = dx / len * enemy.speed * 2.5;
      enemy.vy = dy / len * enemy.speed * 2.5;
      enemy._chargeTimer = 3;
    } else {
      enemy._defaultChase?.(player) ?? enemy._defaultChaseInline(player, enemy);
    }
  },
  attackLogic(enemy, player) {
    player.takeDamage(enemy.damage);
    // Phase 2: also fire projectiles
    if ((enemy._phase ?? 1) === 2) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        enemy.pendingProjectiles.push(new Projectile(
          enemy.x, enemy.y, Math.cos(a) * 220, Math.sin(a) * 220,
          enemy.damage * 0.6, 'enemy',
          { size: 9, color: '#c0392b', lifetime: 1.5 }
        ));
      }
    }
  },
};
