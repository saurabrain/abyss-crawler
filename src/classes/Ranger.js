import { Projectile } from '../entities/Projectile.js';

function drawRanger(ctx, player) {
  const facing = player?.facingAngle ?? 0;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 14, 12, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Legs
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(-5, 6, 4, 9);
  ctx.fillRect(1, 6, 4, 9);
  // Boots
  ctx.fillStyle = '#2b1d12';
  ctx.fillRect(-5, 13, 4, 2);
  ctx.fillRect(1, 13, 4, 2);

  // Body / tunic
  ctx.fillStyle = '#27ae60';
  ctx.fillRect(-7, -4, 14, 12);
  ctx.fillStyle = '#1e8449';
  ctx.fillRect(-7, -4, 14, 2);
  // Belt
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(-7, 6, 14, 2);
  // Quiver (back)
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(-10, -2, 3, 9);
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(-10, -4, 1, 3);
  ctx.fillRect(-8, -4, 1, 3);

  // Head
  ctx.fillStyle = '#f1c27d';
  ctx.fillRect(-4, -12, 8, 8);
  // Face shadow from hood
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(-4, -12, 8, 4);
  // Eyes (glowing)
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(-3, -10, 2, 2);
  ctx.fillRect(1, -10, 2, 2);

  // Hood
  ctx.fillStyle = '#1e8449';
  ctx.beginPath();
  ctx.moveTo(-7, -4);
  ctx.lineTo(-7, -12);
  ctx.quadraticCurveTo(0, -18, 7, -12);
  ctx.lineTo(7, -4);
  ctx.closePath();
  ctx.fill();
  // Hood dark trim
  ctx.fillStyle = '#145a32';
  ctx.beginPath();
  ctx.moveTo(-7, -4);
  ctx.lineTo(7, -4);
  ctx.lineTo(5, -2);
  ctx.lineTo(-5, -2);
  ctx.closePath();
  ctx.fill();

  // Bow (rotates toward aim)
  ctx.save();
  ctx.translate(6, 0);
  ctx.rotate(facing);
  // Arm holding bow
  ctx.fillStyle = '#f1c27d';
  ctx.fillRect(0, -2, 4, 4);
  // Bow arc
  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(8, 0, 11, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.stroke();
  // Bow tips
  ctx.fillStyle = '#4a2f20';
  ctx.fillRect(6, -11, 3, 2);
  ctx.fillRect(6, 9, 3, 2);
  // String
  ctx.strokeStyle = '#ecf0f1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, -10); ctx.lineTo(6, 0); ctx.lineTo(8, 10);
  ctx.stroke();
  // Arrow nocked
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(6, -1, 10, 1);
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.moveTo(16, -2); ctx.lineTo(19, 0); ctx.lineTo(16, 2);
  ctx.fill();
  ctx.restore();
}

export const RANGER = {
  name: 'Ranger',
  description: 'Agile ranged fighter with piercing arrows and dodge roll.',
  color: '#27ae60',
  baseHp: 100,
  baseResource: 100,
  resourceName: 'Energy',
  resourceColor: '#2ecc71',
  resourceRegen: 20,
  baseDamage: 14,
  speed: 140,
  attackRange: 400,
  attackCooldown: 0.4,
  skillCooldowns: [0, 4, 8, 16],

  drawPlayer: drawRanger,

  primaryAttack(player, target) {
    const cost = 8;
    if (player.resource < cost) return;
    player.resource -= cost;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const spd = 500;
    player.pendingProjectiles.push(new Projectile(
      player.x, player.y, dx / len * spd, dy / len * spd,
      player.totalDamage, 'player',
      { size: 7, color: '#f1c40f', lifetime: 1.2, pierce: 1 }
    ));
  },

  useSkill(player, index, target) {
    if (index === 1) {
      // Multi-shot: 5 arrows in spread
      const cost = 30;
      if (player.resource < cost) return false;
      player.resource -= cost;
      const base = player.facingAngle;
      for (let i = -2; i <= 2; i++) {
        const a = base + i * 0.2;
        player.pendingProjectiles.push(new Projectile(
          player.x, player.y, Math.cos(a) * 480, Math.sin(a) * 480,
          player.totalDamage * 0.7, 'player',
          { size: 6, color: '#e67e22', lifetime: 1.0, pierce: 1 }
        ));
      }
      return true;
    }
    if (index === 2) {
      // Rain of arrows: 12 arrows downward spread
      const cost = 50;
      if (player.resource < cost) return false;
      player.resource -= cost;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const delay = i * 0.05;
        player.pendingProjectiles.push(new Projectile(
          player.x, player.y, Math.cos(a) * 400, Math.sin(a) * 400,
          player.totalDamage * 0.5, 'player',
          { size: 6, color: '#d35400', lifetime: 0.9 + delay }
        ));
      }
      return true;
    }
    if (index === 3) {
      // Explosive arrow: big AOE projectile
      const cost = 60;
      if (player.resource < cost) return false;
      player.resource -= cost;
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      player.pendingProjectiles.push(new Projectile(
        player.x, player.y, dx / len * 350, dy / len * 350,
        player.totalDamage * 2.5, 'player',
        { size: 14, color: '#e74c3c', lifetime: 1.5, aoe: 80 }
      ));
      return true;
    }
    return false;
  },
};
