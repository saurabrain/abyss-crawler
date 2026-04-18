import { Projectile } from '../entities/Projectile.js';

function drawMage(ctx, player) {
  const facing = player?.facingAngle ?? 0;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 14, 12, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Robe (flared at bottom)
  ctx.fillStyle = '#8e44ad';
  ctx.beginPath();
  ctx.moveTo(-6, -4);
  ctx.lineTo(6, -4);
  ctx.lineTo(11, 14);
  ctx.lineTo(-11, 14);
  ctx.closePath();
  ctx.fill();
  // Robe trim
  ctx.fillStyle = '#5b2d8e';
  ctx.fillRect(-11, 12, 22, 3);
  // Belt
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(-6, 2, 12, 2);
  // Rune on robe
  ctx.fillStyle = '#d7bde2';
  ctx.fillRect(-2, 6, 4, 4);

  // Head
  ctx.fillStyle = '#f1c27d';
  ctx.fillRect(-4, -12, 8, 8);
  // Beard
  ctx.fillStyle = '#ecf0f1';
  ctx.fillRect(-4, -6, 8, 3);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(-3, -10, 2, 2);
  ctx.fillRect(1, -10, 2, 2);

  // Hat (wizard pointed hat)
  ctx.fillStyle = '#5b2d8e';
  ctx.beginPath();
  ctx.moveTo(-7, -13);
  ctx.lineTo(7, -13);
  ctx.lineTo(2, -26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8e44ad';
  ctx.fillRect(-8, -14, 16, 3);
  // Hat star
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(-1, -20, 2, 2);

  // Staff (rotates toward aim)
  ctx.save();
  ctx.translate(6, 0);
  ctx.rotate(facing);
  // Hand
  ctx.fillStyle = '#f1c27d';
  ctx.fillRect(0, -2, 3, 4);
  // Shaft
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(3, -1, 20, 3);
  ctx.fillStyle = '#4a2f20';
  ctx.fillRect(3, 2, 20, 1);
  // Orb
  ctx.fillStyle = '#3498db';
  ctx.beginPath(); ctx.arc(24, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#85c1e9';
  ctx.beginPath(); ctx.arc(23, -1, 2, 0, Math.PI * 2); ctx.fill();
  // Glow
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#3498db';
  ctx.beginPath(); ctx.arc(24, 0, 9, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

export const MAGE = {
  name: 'Mage',
  description: 'Fragile spellcaster with powerful AoE spells.',
  color: '#8e44ad',
  baseHp: 80,
  baseResource: 150,
  resourceName: 'Mana',
  resourceColor: '#3498db',
  resourceRegen: 15,
  baseDamage: 22,
  speed: 100,
  attackRange: 300,
  attackCooldown: 0.7,
  skillCooldowns: [0, 5, 10, 20],

  drawPlayer: drawMage,

  primaryAttack(player, target) {
    const cost = 10;
    if (player.resource < cost) return;
    player.resource -= cost;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const spd = 350;
    player.pendingProjectiles.push(new Projectile(
      player.x, player.y, dx / len * spd, dy / len * spd,
      player.totalDamage, 'player',
      { size: 10, color: '#f39c12', lifetime: 1.5 }
    ));
  },

  useSkill(player, index, target) {
    if (index === 1) {
      // Nova: 8 projectiles outward
      const cost = 40;
      if (player.resource < cost) return false;
      player.resource -= cost;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        player.pendingProjectiles.push(new Projectile(
          player.x, player.y, Math.cos(a) * 280, Math.sin(a) * 280,
          player.totalDamage * 0.8, 'player',
          { size: 9, color: '#9b59b6', lifetime: 1.0 }
        ));
      }
      return true;
    }
    if (index === 2) {
      // Blizzard: 3 homing-ish large bolts
      const cost = 60;
      if (player.resource < cost) return false;
      player.resource -= cost;
      for (let i = -1; i <= 1; i++) {
        const a = player.facingAngle + i * 0.25;
        player.pendingProjectiles.push(new Projectile(
          player.x, player.y, Math.cos(a) * 300, Math.sin(a) * 300,
          player.totalDamage * 1.5, 'player',
          { size: 14, color: '#74b9ff', lifetime: 1.8, pierce: 3 }
        ));
      }
      return true;
    }
    if (index === 3) {
      // Meteor: large AoE melee hit (instant impact zone)
      const cost = 80;
      if (player.resource < cost) return false;
      player.resource -= cost;
      player.pendingMeleeHit = {
        x: target.x, y: target.y, r: 90,
        damage: player.totalDamage * 3,
        angle: 0, arc: Math.PI * 2,
      };
      return true;
    }
    return false;
  },
};
