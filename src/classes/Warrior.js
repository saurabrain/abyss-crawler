import { Projectile } from '../entities/Projectile.js';

function drawWarrior(ctx, player) {
  const facing = player?.facingAngle ?? 0;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 14, 12, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Legs
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(-6, 6, 5, 10);
  ctx.fillRect(1, 6, 5, 10);
  ctx.fillStyle = '#2b1d12';
  ctx.fillRect(-6, 14, 5, 2);
  ctx.fillRect(1, 14, 5, 2);

  // Torso (chestplate)
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(-9, -6, 18, 14);
  ctx.fillStyle = '#922b21';
  ctx.fillRect(-9, -6, 18, 2);
  ctx.fillRect(-9, 4, 18, 2);
  // Belt
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(-9, 6, 18, 2);
  // Shoulder pads
  ctx.fillStyle = '#7f8c8d';
  ctx.fillRect(-11, -6, 4, 6);
  ctx.fillRect(7, -6, 4, 6);

  // Head
  ctx.fillStyle = '#f1c27d';
  ctx.fillRect(-5, -13, 10, 8);
  // Helmet
  ctx.fillStyle = '#95a5a6';
  ctx.fillRect(-7, -17, 14, 6);
  ctx.fillStyle = '#7f8c8d';
  ctx.fillRect(-7, -17, 14, 2);
  // Visor slit
  ctx.fillStyle = '#000';
  ctx.fillRect(-4, -10, 8, 2);
  // Helmet plume
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(-1, -21, 2, 5);

  // Shield (left arm)
  ctx.save();
  ctx.translate(-12, 0);
  ctx.fillStyle = '#34495e';
  ctx.fillRect(-2, -4, 5, 12);
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(-1, -2, 3, 4);
  ctx.restore();

  // Sword (right arm) — rests at neutral angle; animates only during attack
  const swingTimer = player?._swingTimer ?? 0;
  const attackCd   = player?.attackCooldown ?? 0.55;
  let swordAngle;
  if (swingTimer > 0) {
    // t: 0 = just swung, 1 = swing complete
    const t = 1 - swingTimer / attackCd;
    // Arc from pulled-back (facing - 90°) sweeping forward past facing
    swordAngle = facing - Math.PI * 0.5 + t * Math.PI * 0.75;
  } else {
    swordAngle = Math.PI * 0.35; // resting: sword points down-right
  }
  ctx.save();
  ctx.translate(10, 0);
  ctx.rotate(swordAngle);
  // Arm
  ctx.fillStyle = '#f1c27d';
  ctx.fillRect(0, -2, 4, 4);
  // Hilt
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(4, -2, 3, 4);
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(6, -3, 2, 6);
  // Blade
  ctx.fillStyle = '#ecf0f1';
  ctx.fillRect(8, -1, 14, 2);
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(8, 1, 14, 1);
  // Point
  ctx.beginPath();
  ctx.moveTo(22, -1); ctx.lineTo(25, 0); ctx.lineTo(22, 1);
  ctx.fillStyle = '#ecf0f1';
  ctx.fill();
  ctx.restore();
}

export const WARRIOR = {
  name: 'Warrior',
  description: 'High HP melee fighter with AoE swing and lifesteal.',
  color: '#c0392b',
  baseHp: 160,
  baseResource: 100,
  resourceName: 'Rage',
  resourceColor: '#e74c3c',
  resourceRegen: 0,
  baseDamage: 18,
  speed: 120,
  attackRange: 60,
  attackCooldown: 0.55,
  skillCooldowns: [0, 6, 12, 20],

  drawPlayer: drawWarrior,

  primaryAttack(player, target) {
    player._swingTimer = player.attackCooldown ?? 0.55;
    // Wide arc swing — covers enemies flanking from either side
    player.pendingMeleeHit = {
      x: player.x + Math.cos(player.facingAngle) * 35,
      y: player.y + Math.sin(player.facingAngle) * 35,
      r: 65,
      damage: player.totalDamage,
      lifesteal: 0.1,
      angle: player.facingAngle,
      arc: Math.PI * 1.1, // ~198° — wide enough to catch flankers
    };
  },

  useSkill(player, index, target) {
    if (index === 1) {
      // Whirlwind: 360 AoE
      player.pendingMeleeHit = {
        x: player.x, y: player.y, r: 80,
        damage: player.totalDamage * 1.5,
        lifesteal: 0.2,
        angle: 0, arc: Math.PI * 2,
      };
      return true;
    }
    if (index === 2) {
      // Ground slam: large AoE, knockback handled in combat system
      player.pendingMeleeHit = {
        x: player.x, y: player.y, r: 100,
        damage: player.totalDamage * 2,
        lifesteal: 0.05,
        angle: 0, arc: Math.PI * 2,
        knockback: 200,
      };
      return true;
    }
    if (index === 3) {
      // Battle Cry: temp damage boost (applied via status)
      player._battleCryTimer = 5;
      player.bonusDamage += 20;
      return true;
    }
    return false;
  },
};
